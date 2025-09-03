import React, { useState, useEffect, useRef } from 'react';

const CameraScreen = ({ onComplete }) => {
  const [photoCount, setPhotoCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [currentPose, setCurrentPose] = useState('Get Ready');
  const [progress, setProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [completedPhotos, setCompletedPhotos] = useState([false, false, false]);
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
  const successMessages = [
    'Amazing! First photo captured ✨',
    'Perfect! Second photo done 📸',
    'Fantastic! All photos complete! 🎉'
  ];
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize camera
    initCamera();
    
    // Start automatic capture after 3 seconds (give camera time to load)
    timeoutRef.current = setTimeout(() => {
      startAutomaticCapture();
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Stop camera stream on cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
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
    
    for (let i = 0; i < 3; i++) {
      setCurrentPhotoIndex(i);
      
      // Transition to new photo
      setIsTransitioning(true);
      setStatusMessage(`Photo ${i + 1} of 3`);
      await sleep(500);
      
      // Update pose and instruction
      setCurrentPose(poses[i]);
      setStatusMessage(instructions[i]);
      setIsTransitioning(false);
      
      // Wait for pose
      await sleep(3000);
      
      // Pre-countdown message
      setStatusMessage('Get ready! Photo coming up...');
      await sleep(1000);
      
      // Start countdown
      await startCountdown();
      
      // Capture photo
      capturePhoto(i);
      
      // Show success message
      setIsTransitioning(true);
      setStatusMessage(successMessages[i]);
      
      // Update progress
      setProgress((i + 1) * 33);
      
      await sleep(1500);
      
      // Wait before next photo (except for last one)
      if (i < 2) {
        setStatusMessage('Preparing next photo...');
        await sleep(1500);
      }
    }
    
    // All photos captured
    setStatusMessage('All photos captured! Creating your photo strip...');
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const startCountdown = () => {
    return new Promise((resolve) => {
      let count = 3;
      setCountdown(count);
      
      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
  };

  const capturePhoto = (photoIndex) => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
    
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
      setCapturedImages(prev => {
        const newImages = [...prev];
        newImages[photoIndex] = imageUrl;
        return newImages;
      });
    }, 'image/jpeg', 0.8);
    
    // Mark photo as completed
    const newCompleted = [...completedPhotos];
    newCompleted[photoIndex] = true;
    setCompletedPhotos(newCompleted);
    setPhotoCount(photoIndex + 1);
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
          width: 600px;
          height: 450px;
          border: 2px solid transparent;
          border-radius: 20px;
          position: relative;
          background: linear-gradient(45deg, rgba(255, 70, 150, 0.1), rgba(70, 200, 255, 0.1));
          background-clip: padding-box;
          animation: borderGlow 3s ease-in-out infinite;
          transition: all 0.3s ease;
          overflow: hidden;
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .camera-frame {
            width: 500px;
            height: 375px;
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
          
          .camera-frame {
            width: 90%;
            max-width: 400px;
            height: 300px;
          }
          
          .countdown-display {
            font-size: 120px;
          }
        }
      `}</style>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="camera-main">
        <div className={`camera-frame ${isFlashing ? 'flash' : ''}`}>
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
            <div className="countdown-display">{countdown}</div>
          ) : (
            <div className={`pose-indicator ${isTransitioning ? 'transitioning' : ''}`}>
              {currentPose}
            </div>
          )}
          
          <div className={`status-message ${isTransitioning ? 'transitioning' : ''}`}>
            {statusMessage}
          </div>
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
          
          <div className={`photo-item ${completedPhotos[0] ? 'completed' : ''} ${currentPhotoIndex === 0 && isCapturing ? 'active' : ''}`}>
            <div className="photo-number">1</div>
            <div className="photo-label">First Shot</div>
            <svg className="check-icon" viewBox="0 0 24 24" fill="#46ff90">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>

          <div className={`photo-item ${completedPhotos[1] ? 'completed' : ''} ${currentPhotoIndex === 1 && isCapturing ? 'active' : ''}`}>
            <div className="photo-number">2</div>
            <div className="photo-label">Second Shot</div>
            <svg className="check-icon" viewBox="0 0 24 24" fill="#46ff90">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>

          <div className={`photo-item ${completedPhotos[2] ? 'completed' : ''} ${currentPhotoIndex === 2 && isCapturing ? 'active' : ''}`}>
            <div className="photo-number">3</div>
            <div className="photo-label">Final Shot</div>
            <svg className="check-icon" viewBox="0 0 24 24" fill="#46ff90">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;