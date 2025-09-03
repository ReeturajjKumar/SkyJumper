import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const CameraScreen = ({ onComplete }) => {
  const { settings } = useSettings();
  const [captureSettings, setCaptureSettings] = useState({});
  const [photoCount, setPhotoCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [currentPose, setCurrentPose] = useState('Get Ready');
  const [progress, setProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [completedPhotos, setCompletedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Get ready for your photo session!');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const poses = ['Strike a Pose!', 'Show Your Beautiful Smile!', 'Be Creative & Fun!'];
  const instructions = [
    'Look at the camera and strike your best pose',
    'Give us your biggest, brightest smile',
    'Be creative! Show your personality'
  ];
  const getSuccessMessage = (photoIndex, totalPhotos) => {
    if (photoIndex === 0) return 'Amazing! First photo captured ✨';
    if (photoIndex === totalPhotos - 1) return 'Fantastic! All photos complete! 🎉';
    return `Perfect! Photo ${photoIndex + 1} captured 📸`;
  };
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch capture settings from API
  useEffect(() => {
    const fetchCaptureSettings = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/admin/settings/capture');
        const data = await response.json();
        if (data.success) {
          console.log('🎥 Fetched capture settings:', data.captureSettings);
          setCaptureSettings(data.captureSettings);
          // Initialize completedPhotos array based on dynamic photoCount
          setCompletedPhotos(new Array(data.captureSettings.photoCount || 3).fill(false));
        }
      } catch (error) {
        console.error('Error fetching capture settings:', error);
        // Fallback to default settings
        setCaptureSettings({
          autoCapture: true,
          countdownDuration: 3000,
          captureInterval: 3000,
          photoCount: 3,
          captureSettings: {
            flashEnabled: false,
            soundEnabled: true,
            previewTime: 2000,
            retakeAllowed: true,
            maxRetakes: 3
          }
        });
        setCompletedPhotos(new Array(3).fill(false));
      }
    };
    
    fetchCaptureSettings();
  }, []);

  useEffect(() => {
    // Initialize camera
    initCamera();
    
    // Start automatic capture after 3 seconds (give camera time to load) - use dynamic settings
    if (captureSettings.autoCapture) {
      timeoutRef.current = setTimeout(() => {
        startAutomaticCapture();
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Stop camera stream on cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captureSettings.autoCapture, settings.orientation, captureSettings]); // Re-initialize when settings change

  const initCamera = async () => {
    try {
      // Dynamic camera constraints based on orientation setting
      let videoConstraints = {
        facingMode: 'user'
      };

      // Set dimensions based on orientation from settings
      switch (settings.orientation) {
        case 'portrait':
          videoConstraints.width = { ideal: 720 };
          videoConstraints.height = { ideal: 1280 };
          break;
        case 'landscape':
          videoConstraints.width = { ideal: 1280 };
          videoConstraints.height = { ideal: 720 };
          break;
        case 'square':
          videoConstraints.width = { ideal: 1080 };
          videoConstraints.height = { ideal: 1080 };
          break;
        default:
          // Fallback to portrait
          videoConstraints.width = { ideal: 720 };
          videoConstraints.height = { ideal: 1280 };
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied or not available');
    }
  };

  const startAutomaticCapture = async () => {
    setIsCapturing(true);
    setStatusMessage('Starting your photo session...');
    await sleep(1000);
    
    const totalPhotos = captureSettings.photoCount || 3;
    for (let i = 0; i < totalPhotos; i++) {
      setCurrentPhotoIndex(i);
      
      // Transition to new photo
      setIsTransitioning(true);
      setStatusMessage(`Photo ${i + 1} of ${totalPhotos}`);
      await sleep(500);
      
      // Update pose and instruction
      setCurrentPose(poses[i % poses.length]); // Use modulo to cycle through poses
      setStatusMessage(instructions[i % instructions.length]);
      setIsTransitioning(false);
      
      // Wait for pose (use dynamic captureInterval from database)
      await sleep(captureSettings.captureInterval || 3000);
      
      // Pre-countdown message
      setStatusMessage('Get ready! Photo coming up...');
      await sleep(1000);
      
      // Start countdown
      await startCountdown();
      
      // Capture photo and wait for it to complete
      await capturePhoto(i);
      
      // Show success message
      setIsTransitioning(true);
      setStatusMessage(getSuccessMessage(i, totalPhotos));
      
      // Update progress based on dynamic photo count
      const progressPercentage = ((i + 1) / totalPhotos) * 100;
      setProgress(progressPercentage);
      
      // Use dynamic preview time from settings
      await sleep(captureSettings.captureSettings?.previewTime || 2000);
      
      // Wait before next photo (except for last one)
      if (i < totalPhotos - 1) {
        setStatusMessage('Preparing next photo...');
        await sleep(1500);
      }
    }
    
    // All photos captured - get latest captured images state
    setStatusMessage('All photos captured! Creating your photo strip...');
    
    // Wait a bit for state to update, then get the current images
    setTimeout(() => {
      setCapturedImages(currentImages => {
        console.log('📷 All photos captured! Total images:', currentImages.length);
        console.log('📷 Captured images:', currentImages);
        
        setTimeout(() => {
          // Pass captured images to the next screen
          console.log('🚀 Passing captured images to next screen:', currentImages.length, 'images');
          onComplete(currentImages);
        }, 1000);
        
        return currentImages; // Return the same images, we just needed to access them
      });
    }, 500);
  };

  const startCountdown = () => {
    return new Promise((resolve) => {
      // Use dynamic countdown duration from database (convert ms to seconds)
      const countdownSeconds = Math.ceil((captureSettings.countdownDuration || 3000) / 1000);
      console.log(`⏱️ Starting countdown: ${countdownSeconds} seconds (${captureSettings.countdownDuration}ms)`);
      let count = countdownSeconds;
      setCountdown(count);
      
      const interval = setInterval(() => {
        count--;
        console.log(`⏱️ Countdown: ${count}`);
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          console.log('⏱️ Countdown complete!');
          resolve();
        }
      }, 1000);
    });
  };

  const capturePhoto = (photoIndex) => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve();
        return;
      }
      
      // Play camera sound if enabled
      if (captureSettings.captureSettings?.soundEnabled) {
        // Create camera click sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
      
      // Flash effect if enabled
      if (captureSettings.captureSettings?.flashEnabled) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);
      }
      
      // Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and store
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        console.log(`📸 Photo ${photoIndex + 1} captured:`, imageUrl.substring(0, 50) + '...');
        
        setCapturedImages(prev => {
          const newImages = [...prev];
          newImages[photoIndex] = imageUrl;
          console.log(`📸 Updated capturedImages array, length:`, newImages.length);
          return newImages;
        });
        
        // Mark photo as completed
        const newCompleted = [...completedPhotos];
        newCompleted[photoIndex] = true;
        setCompletedPhotos(newCompleted);
        setPhotoCount(photoIndex + 1);
        
        resolve(); // Resolve the promise after image is captured
      }, 'image/jpeg', 0.8);
    });
  };

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };


  return (
    <div className="camera-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .camera-container {
          width: 100vw;
          height: 100vh;
          background: #0a0a0a;
          position: relative;
          display: flex;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF0080, #7928CA, #46C3FF);
          transition: width 0.5s ease;
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.5);
        }

        .camera-main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          background: radial-gradient(circle at center, rgba(120, 70, 255, 0.1), transparent);
        }

        .camera-frame {
          border: 2px solid transparent;
          border-radius: 20px;
          position: relative;
          background: linear-gradient(45deg, rgba(255, 70, 150, 0.1), rgba(70, 200, 255, 0.1));
          background-clip: padding-box;
          animation: borderGlow 3s ease-in-out infinite;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .camera-frame.portrait {
          width: 450px;
          height: 600px;
        }

        .camera-frame.landscape {
          width: 600px;
          height: 450px;
        }

        .camera-frame.square {
          width: 500px;
          height: 500px;
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 18px;
        }

        .camera-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.8);
          color: white;
          font-size: 18px;
          border-radius: 18px;
        }

        @keyframes borderGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 70, 150, 0.5),
                       inset 0 0 20px rgba(70, 200, 255, 0.1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(70, 200, 255, 0.5),
                       inset 0 0 40px rgba(255, 70, 150, 0.1);
          }
        }

        .camera-frame.flash {
          animation: flash 0.3s ease;
        }

        @keyframes flash {
          0%, 100% { background: rgba(255,255,255,0.1); }
          50% { background: rgba(255,255,255,0.9); }
        }

        .pose-indicator {
          color: white;
          font-size: 36px;
          text-align: center;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 3px;
          animation: fadeIn 0.5s ease;
          margin-bottom: 20px;
        }

        .pose-indicator.transitioning {
          animation: fadeOut 0.3s ease;
        }

        .status-message {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 20px;
          text-align: center;
          font-weight: 400;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          padding: 15px 30px;
          border-radius: 25px;
          border: 1px solid rgba(255,255,255,0.2);
          animation: statusSlideUp 0.5s ease;
          max-width: 90%;
          z-index: 10;
        }

        .status-message.transitioning {
          animation: statusPulse 0.5s ease;
        }

        @keyframes statusSlideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes statusPulse {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .countdown-display {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 200px;
          font-weight: bold;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(255, 0, 128, 0.5));
          animation: countdownPulse 1s ease;
        }

        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.3); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .camera-sidebar {
          width: 350px;
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(40, 40, 40, 0.9));
          padding: 50px 30px;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .photo-status {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .status-title {
          font-size: 24px;
          color: white;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 300;
        }

        .photo-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          position: relative;
        }

        .photo-item.active {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.1), rgba(121, 40, 202, 0.1));
          border-color: rgba(255, 0, 128, 0.3);
          animation: activeGlow 2s ease-in-out infinite;
        }

        @keyframes activeGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 0, 128, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 0, 128, 0.4);
          }
        }

        .photo-item.completed {
          background: linear-gradient(135deg, rgba(70, 255, 150, 0.1), rgba(70, 200, 255, 0.1));
          border-color: rgba(70, 255, 150, 0.3);
          animation: photoComplete 0.5s ease;
        }

        @keyframes photoComplete {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .photo-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          color: white;
          font-size: 20px;
        }

        .photo-label {
          flex: 1;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
        }

        .photo-item.completed .photo-label {
          color: white;
        }

        .check-icon {
          width: 24px;
          height: 24px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .photo-item.completed .check-icon {
          opacity: 1;
          animation: checkPop 0.3s ease;
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .camera-viewfinder {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.5);
        }

        .corner.top-left {
          top: -1px;
          left: -1px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 20px;
        }

        .corner.top-right {
          top: -1px;
          right: -1px;
          border-left: none;
          border-bottom: none;
          border-top-right-radius: 20px;
        }

        .corner.bottom-left {
          bottom: -1px;
          left: -1px;
          border-right: none;
          border-top: none;
          border-bottom-left-radius: 20px;
        }

        .corner.bottom-right {
          bottom: -1px;
          right: -1px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 20px;
        }

        .skyjumper-watermark {
          position: absolute;
          bottom: 30px;
          right: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.3;
        }

        .watermark-text {
          color: white;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        /* Floating Background Particles */
        .particle-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.6;
        }

        .particle-1 {
          width: 25px;
          height: 25px;
          background: radial-gradient(circle, #FF0080, rgba(255, 0, 128, 0.3), transparent);
          top: 20%;
          left: 10%;
          animation: floatUp1 15s linear infinite;
        }

        .particle-2 {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #7928CA, rgba(121, 40, 202, 0.3), transparent);
          top: 40%;
          left: 20%;
          animation: floatUp2 18s linear infinite;
        }

        .particle-3 {
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, #46FF90, rgba(70, 255, 144, 0.3), transparent);
          top: 60%;
          left: 15%;
          animation: floatUp3 12s linear infinite;
        }

        .particle-4 {
          width: 18px;
          height: 18px;
          background: radial-gradient(circle, #46C3FF, rgba(70, 195, 255, 0.3), transparent);
          top: 80%;
          left: 25%;
          animation: floatUp4 20s linear infinite;
        }

        .particle-5 {
          width: 22px;
          height: 22px;
          background: radial-gradient(circle, #FF0080, rgba(255, 0, 128, 0.3), transparent);
          top: 30%;
          right: 10%;
          animation: floatUp5 16s linear infinite;
        }

        .particle-6 {
          width: 28px;
          height: 28px;
          background: radial-gradient(circle, #7928CA, rgba(121, 40, 202, 0.3), transparent);
          top: 50%;
          right: 20%;
          animation: floatUp6 14s linear infinite;
        }

        .particle-7 {
          width: 16px;
          height: 16px;
          background: radial-gradient(circle, #46FF90, rgba(70, 255, 144, 0.3), transparent);
          top: 70%;
          right: 15%;
          animation: floatUp7 22s linear infinite;
        }

        .particle-8 {
          width: 24px;
          height: 24px;
          background: radial-gradient(circle, #46C3FF, rgba(70, 195, 255, 0.3), transparent);
          top: 90%;
          right: 30%;
          animation: floatUp8 19s linear infinite;
        }

        .particle-9 {
          width: 26px;
          height: 26px;
          background: radial-gradient(circle, #FF0080, rgba(255, 0, 128, 0.3), transparent);
          top: 15%;
          left: 50%;
          animation: floatUp9 17s linear infinite;
        }

        .particle-10 {
          width: 19px;
          height: 19px;
          background: radial-gradient(circle, #7928CA, rgba(121, 40, 202, 0.3), transparent);
          top: 85%;
          left: 60%;
          animation: floatUp10 13s linear infinite;
        }

        @keyframes floatUp1 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(20px) rotate(360deg); opacity: 0; }
        }

        @keyframes floatUp2 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(-15px) rotate(-360deg); opacity: 0; }
        }

        @keyframes floatUp3 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(30px) rotate(360deg); opacity: 0; }
        }

        @keyframes floatUp4 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(-10px) rotate(-360deg); opacity: 0; }
        }

        @keyframes floatUp5 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(-25px) rotate(360deg); opacity: 0; }
        }

        @keyframes floatUp6 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(15px) rotate(-360deg); opacity: 0; }
        }

        @keyframes floatUp7 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(-20px) rotate(360deg); opacity: 0; }
        }

        @keyframes floatUp8 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(25px) rotate(-360deg); opacity: 0; }
        }

        @keyframes floatUp9 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(-30px) rotate(360deg); opacity: 0; }
        }

        @keyframes floatUp10 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100px) translateX(10px) rotate(-360deg); opacity: 0; }
        }


        /* Responsive Design */
        @media (max-width: 1024px) {
          .camera-frame.portrait {
            width: 375px;
            height: 500px;
          }
          
          .camera-frame.landscape {
            width: 500px;
            height: 375px;
          }
          
          .camera-frame.square {
            width: 400px;
            height: 400px;
          }
          
          .camera-sidebar {
            width: 300px;
            padding: 40px 25px;
          }
        }

        @media (max-width: 768px) {
          .camera-container {
            flex-direction: column;
          }
          
          .camera-sidebar {
            width: 100%;
            padding: 20px;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .camera-frame.portrait {
            width: 90%;
            max-width: 300px;
            height: 400px;
          }
          
          .camera-frame.landscape {
            width: 90%;
            max-width: 400px;
            height: 300px;
          }
          
          .camera-frame.square {
            width: 90%;
            max-width: 350px;
            height: 350px;
          }
          
        }
      `}</style>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Floating Background Particles */}
      <div className="particle-container">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
        <div className="particle particle-9"></div>
        <div className="particle particle-10"></div>
      </div>

      <div className="camera-main">
        <div className={`camera-frame ${settings.orientation || 'portrait'} ${isFlashing ? 'flash' : ''}`}>
          {stream && !cameraError ? (
            <video 
              ref={videoRef}
              className="camera-video"
              autoPlay 
              playsInline 
              muted
            />
          ) : (
            <div className="camera-placeholder">
              {cameraError || 'Initializing camera...'}
            </div>
          )}
          
          <div className="camera-viewfinder">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
          {countdown ? (
            <div className="countdown-display" style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '120px',
              fontWeight: 'bold',
              color: '#FF0080',
              textShadow: '0 0 20px rgba(255, 0, 128, 0.8)',
              zIndex: 1000
            }}>
              {countdown}
            </div>
          ) : null}
        </div>
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="skyjumper-watermark">
          <span className="watermark-text">SKYJUMPER</span>
        </div>
      </div>

      <div className="camera-sidebar">
        <div className="photo-status">
          <div className="status-title">Photo Progress</div>
          
          {completedPhotos.map((isCompleted, index) => (
            <div key={index} className={`photo-item ${isCompleted ? 'completed' : ''} ${currentPhotoIndex === index && isCapturing ? 'active' : ''}`}>
              <div className="photo-number">{index + 1}</div>
              <div className="photo-label">
                {index === 0 ? 'First Shot' : 
                 index === completedPhotos.length - 1 ? 'Final Shot' : 
                 `Shot ${index + 1}`}
              </div>
              <svg className="check-icon" viewBox="0 0 24 24" fill="#46ff90">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;