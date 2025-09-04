import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const ProcessingScreen = ({ capturedImages, onComplete }) => {
  const { settings, getEnabledEffects } = useSettings();
  const [processingStatus, setProcessingStatus] = useState('Initializing AI transformation...');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false); // Prevent React StrictMode duplicate processing
  
  const enabledEffects = getEnabledEffects();
  
  const processingMessages = [
    `Applying ${enabledEffects.length > 0 ? enabledEffects[0]?.name || 'AI enhancement' : 'AI enhancement'} effects...`,
    'Neural networks analyzing image data...',
    'Optimizing digital matrix parameters...',
    `Generating your ${enabledEffects.length > 1 ? enabledEffects[1]?.name?.toLowerCase() || 'digital masterpiece' : 'digital masterpiece'}...`,
    'Finalizing AI transformation...'
  ];

  useEffect(() => {
    // Start processing effects when component mounts
    console.log('🎬 ProcessingScreen mounted');
    console.log('📸 Received capturedImages:', capturedImages?.length || 0, 'images');
    console.log('🎨 Available enabled effects:', enabledEffects?.length || 0, 'effects');
    console.log('🔄 isProcessing:', isProcessing);
    console.log('🚫 processedRef.current:', processedRef.current);
    
    if (capturedImages && capturedImages.length > 0 && !processedRef.current) {
      console.log('✅ Received images for processing:', capturedImages.length, 'images');
      console.log('📦 Images received:', capturedImages);
      
      // Mark as processed to prevent React StrictMode duplicate calls
      processedRef.current = true;
      
      // Start processing effects automatically
      processImages();
    } else if (processedRef.current) {
      console.log('🚫 Processing already started, skipping duplicate call');
    } else {
      console.log('❌ No captured images received!');
    }
  }, [capturedImages]);

  useEffect(() => {
    // Cycle through processing messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < processingMessages.length) {
          setProcessingStatus(processingMessages[nextIndex]);
          return nextIndex;
        }
        return prevIndex;
      });
    }, 800);

    return () => clearInterval(messageInterval);
  }, []);

  // Convert blob URL to base64
  const blobToBase64 = async (blobUrl) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Apply effect using Black Forest API
  const applyEffect = async (imageBase64, effectPrompt) => {
    try {
      // Step 1: Submit image for processing
      const response = await fetch('http://localhost:3002/api/apply-effect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_image: imageBase64,
          prompt: effectPrompt,
          prompt_upsampling: true,
          output_format: 'jpeg',
          aspect_ratio: '9:16' // Portrait orientation
        })
      });

      const data = await response.json();
      
      if (data.id) {
        // Step 2: Poll for completion
        return await pollForResult(data.id);
      } else {
        throw new Error('No ID received from API');
      }
    } catch (error) {
      console.error('Error applying effect:', error);
      throw error;
    }
  };

  // Poll for result from Black Forest Labs API
  const pollForResult = async (taskId) => {
    const maxAttempts = 30; // Black Forest can take a few minutes to process
    let attempts = 0;

    console.log('🔄 Starting to poll Black Forest Labs for result:', taskId);

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:3002/api/get-result?id=${taskId}`);
        
        if (response.headers.get('content-type')?.includes('image/')) {
          // Image is ready, convert to blob URL
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          console.log('✅ Received processed image from Black Forest Labs:', imageUrl.substring(0, 50) + '...');
          return imageUrl;
        } else {
          const data = await response.json();
          console.log('📊 Black Forest Labs status:', data.status, data.message || '');
          
          if (data.status === 'Ready') {
            // Image should be available, but we got JSON instead of image
            // This might happen if there's an issue fetching the image
            console.log('⚠️ Status is Ready but no image received, retrying...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
            continue;
          } else if (data.status === 'Error' || data.status === 'Failed') {
            throw new Error(`Black Forest Labs processing failed: ${data.message || 'Unknown error'}`);
          } else if (data.status === 'Task not found') {
            // Task might be expired or not found, wait and retry
            console.log('⚠️ Task not found, might be expired. Retrying...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
          } else if (data.status === 'Pending' || data.status === 'Processing') {
            // Still processing, wait and try again
            console.log('⏳ Black Forest Labs still processing, waiting...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
            attempts++;
          } else {
            console.log('📊 Unknown status:', data.status);
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
          }
        }
      } catch (error) {
        console.error('Error polling Black Forest Labs result:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }
    
    throw new Error('Timeout waiting for Black Forest Labs result (this can take a few minutes)');
  };

  // Process all images with effects
  const processImages = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingStatus('Preparing images for effect processing...');
    
    try {
      // Use enabled effects from database
      const effectsToApply = enabledEffects.length > 0 ? enabledEffects : [
        { name: 'Original', prompt: 'high quality photography, professional lighting, sharp focus' }
      ];

      console.log('🎨 Applying database effects:', effectsToApply.map(e => `${e.name}: ${e.prompt?.substring(0, 50)}...`));
      setProcessingStatus(`Applying premium AI effects to your photos...`);

      const processed = [];
      
      // Process each captured image with a different effect (cycling through available effects)
      for (let i = 0; i < capturedImages.length; i++) {
        const image = capturedImages[i];
        const effect = effectsToApply[i % effectsToApply.length]; // Cycle through effects
        
        setProcessingStatus(`Applying ${effect.name} to photo ${i + 1}...`);
        console.log(`🔄 Processing image ${i + 1} with effect: ${effect.name}`);
        
        try {
          // Convert blob URL to base64
          const base64Image = await blobToBase64(image);
          
          // Log original image details
          console.log(`🔄 Processing image ${i + 1}:`);
          console.log(`   📂 Original URL: ${image.substring(0, 50)}...`);
          console.log(`   🎨 Effect: ${effect.name}`);
          console.log(`   📝 Prompt: ${effect.prompt}`);
          console.log(`   📊 Base64 length: ${base64Image.length} characters`);
          
          // Create temp image to check original dimensions
          const tempImg = new Image();
          await new Promise((resolve) => {
            tempImg.onload = () => {
              console.log(`   📐 Original image: ${tempImg.width} x ${tempImg.height} (${tempImg.width > tempImg.height ? 'LANDSCAPE' : 'PORTRAIT'})`);
              resolve();
            };
            tempImg.src = image;
          });
          
          // Apply the effect
          const processedImageUrl = await applyEffect(base64Image, effect.prompt);
          
          // Log processed image details
          const processedImg = new Image();
          await new Promise((resolve) => {
            processedImg.onload = () => {
              console.log(`   ✅ Processed image: ${processedImg.width} x ${processedImg.height} (${processedImg.width > processedImg.height ? 'LANDSCAPE' : 'PORTRAIT'})`);
              console.log(`   🔗 Processed URL: ${processedImageUrl.substring(0, 50)}...`);
              resolve();
            };
            processedImg.src = processedImageUrl;
          });
          
          processed.push({
            original: image,
            processed: processedImageUrl,
            effect: effect
          });
          
          setProcessingStatus(`${effect.name} applied successfully!`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between effects
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Fallback to original image if effect fails
          processed.push({
            original: image,
            processed: image, // Use original image as fallback
            effect: { name: `${effect.name} (Failed)`, prompt: 'Effect failed - using original image' }
          });
          
          setProcessingStatus(`${effect.name} failed, using original image...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setProcessedImages(processed);
      console.log('✅ Processing complete! Generated images:', processed);
      console.log('✅ Structure check:', processed.map((p, i) => ({
        index: i,
        hasProcessed: !!p.processed,
        hasOriginal: !!p.original,
        hasEffect: !!p.effect,
        effectName: p.effect?.name,
        processedUrl: p.processed?.substring(0, 50) + '...',
        originalUrl: p.original?.substring(0, 50) + '...'
      })));
      
      console.log('🔄 Setting processed images in state...');
      console.log('🔍 Before setting - processedImages.length:', processedImages.length);
      console.log('🔍 About to set - processed.length:', processed.length);
      
      setProcessingStatus('All effects applied successfully!');
      
      // Wait a bit then proceed to WhatsApp form
      setTimeout(() => {
        setProcessingStatus('Processing complete! You can now continue...');
      }, 1500);
      
    } catch (error) {
      console.error('Error in processImages:', error);
      setProcessingStatus('Processing failed. Using original images.');
      // Fallback to original images
      const fallback = capturedImages.map((img, index) => ({
        original: img,
        processed: img,
        effect: { name: 'Original', prompt: 'No effect applied' }
      }));
      setProcessedImages(fallback);
    }
    
    setIsProcessing(false);
    setIsWhatsAppEnabled(true);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    
    if (phoneNumber && phoneNumber.length >= 10) {
      setIsSendingWhatsApp(true);
      
      console.log('📱 WhatsApp process started for:', phoneNumber);
      
      // Simple loading state - simulate WhatsApp sending process
      setTimeout(() => {
        console.log('✅ WhatsApp process completed - redirecting to next screen');
        setIsSendingWhatsApp(false);
        setIsPhoneSent(true);
        
        // Direct redirect after process completion
        setTimeout(() => {
          const imagesToPass = processedImages.length > 0 ? processedImages : capturedImages;
          console.log('🚀 Redirecting to output screen with:', imagesToPass.length, 'images');
          onComplete(imagesToPass);
        }, 1000);
      }, 2500); // 2.5 seconds loading
    }
  };


  const handleContinue = () => {
    // Check if we have processed images (which means processing is complete) OR processing is not running
    const hasProcessedImages = processedImages.length > 0 && processedImages.length === capturedImages.length;
    
    if (isProcessing && !hasProcessedImages) {
      console.log('⏳ Processing still in progress, waiting for completion...');
      // Check again after 1 second if processing is ongoing
      setTimeout(() => {
        handleContinue();
      }, 1000);
      return;
    }
    
    // Pass processed images if available, otherwise original images
    const imagesToPass = processedImages.length > 0 ? processedImages : capturedImages;
    console.log('🚀 Continuing to output with:', imagesToPass.length, 'images');
    console.log('📦 Images type:', processedImages.length > 0 ? 'processed' : 'original');
    console.log('📦 Processing complete - redirecting to next screen');
    onComplete(imagesToPass);
  };

  // No auto-redirect - only redirect when user submits WhatsApp number

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNum = value.replace(/\D/g, '');
    
    // Format as Indian mobile number
    if (phoneNum.length <= 10) {
      if (phoneNum.length <= 5) {
        return phoneNum;
      } else {
        return `${phoneNum.slice(0, 5)} ${phoneNum.slice(5)}`;
      }
    }
    return phoneNum.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="processing-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .processing-container {
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, #0a0a1a 0%, #000 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          color: #00FFFF;
          padding: 60px 20px;
          font-family: 'Orbitron', 'Courier New', monospace;
          position: relative;
          overflow: hidden;
        }

        .processing-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.15), transparent),
            radial-gradient(circle at 80% 70%, rgba(64, 224, 208, 0.1), transparent),
            linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.02) 50%, transparent 52%);
        }


        .processing-content {
          max-width: 600px;
          text-align: center;
          z-index: 1;
        }

        .processing-animation {
          width: 150px;
          height: 150px;
          margin: 0 auto 40px;
          position: relative;
        }

        .processing-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top-color: #00FFFF;
          border-right-color: #40E0D0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }

        .processing-ring:nth-child(2) {
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          border-top-color: #40E0D0;
          border-right-color: #008B8B;
          animation-duration: 0.8s;
          animation-direction: reverse;
          box-shadow: 0 0 15px rgba(64, 224, 208, 0.4);
        }

        .processing-ring:nth-child(3) {
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
          border-top-color: #008B8B;
          border-right-color: #00FFFF;
          animation-duration: 0.6s;
          box-shadow: 0 0 10px rgba(0, 139, 139, 0.3);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .processing-text {
          font-size: 36px;
          margin-bottom: 15px;
          font-weight: 700;
          color: #00FFFF;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 
            0 0 10px #00FFFF,
            0 0 20px #00FFFF,
            0 0 40px #00FFFF;
          animation: neonPulse 2s ease-in-out infinite alternate;
        }

        .processing-status {
          font-size: 18px;
          color: #40E0D0;
          margin-bottom: 50px;
          min-height: 24px;
          animation: fadeIn 0.5s ease;
          text-shadow: 0 0 5px #40E0D0;
          letter-spacing: 1px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes neonPulse {
          from {
            text-shadow: 
              0 0 10px #00FFFF,
              0 0 20px #00FFFF,
              0 0 40px #00FFFF;
          }
          to {
            text-shadow: 
              0 0 5px #00FFFF,
              0 0 10px #00FFFF,
              0 0 20px #00FFFF,
              0 0 40px #00FFFF,
              0 0 80px #00FFFF;
          }
        }

        .whatsapp-form {
          background: rgba(0, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 20px;
          padding: 40px;
          animation: slideUp 0.5s ease;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.2),
            inset 0 0 30px rgba(0, 255, 255, 0.05);
        }

        @keyframes slideUp {
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }

        .whatsapp-title {
          font-size: 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #00FFFF;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 10px #00FFFF;
        }

        .whatsapp-icon {
          width: 30px;
          height: 30px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .whatsapp-subtitle {
          font-size: 16px;
          color: #40E0D0;
          margin-bottom: 25px;
          text-shadow: 0 0 5px #40E0D0;
        }

        .phone-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .phone-prefix {
          padding: 15px 20px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50px;
          color: #00FFFF;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }

        .flag-emoji {
          font-size: 20px;
        }

        .phone-input {
          flex: 1;
          padding: 15px 20px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50px;
          color: #00FFFF;
          font-size: 18px;
          outline: none;
          transition: all 0.3s ease;
          font-weight: 600;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .phone-input:focus {
          border-color: #00FFFF;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
          background: rgba(0, 255, 255, 0.15);
          text-shadow: 0 0 5px #00FFFF;
        }

        .phone-input::placeholder {
          color: rgba(0, 255, 255, 0.5);
        }

        .phone-input:disabled {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          cursor: not-allowed;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .phone-input:disabled::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .whatsapp-submit {
          padding: 15px 25px;
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          color: #000;
          border: 2px solid #00FFFF;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-width: 130px;
          white-space: nowrap;
        }

        .whatsapp-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .whatsapp-submit:hover::before {
          left: 100%;
        }

        .whatsapp-submit:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.6),
            0 10px 30px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .whatsapp-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .whatsapp-submit.disabled {
          background: rgba(255, 255, 255, 0.1) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .whatsapp-submit.disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .whatsapp-submit.sending {
          background: linear-gradient(135deg, #FFA500, #FF8C00) !important;
          color: #000 !important;
          border-color: #FFA500 !important;
          animation: sendingPulse 1s ease-in-out infinite !important;
          box-shadow: 0 0 25px rgba(255, 165, 0, 0.6) !important;
        }

        .whatsapp-submit.sent {
          background: linear-gradient(135deg, #00FF7F, #32CD32) !important;
          color: #000 !important;
          border-color: #00FF7F !important;
          animation: pulse 0.5s ease !important;
          box-shadow: 0 0 30px rgba(0, 255, 127, 0.8) !important;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        @keyframes sendingPulse {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 165, 0, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 40px rgba(255, 165, 0, 0.8);
          }
          100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 165, 0, 0.4);
          }
        }


        .effects-preview {
          margin: 20px 0;
          text-align: center;
        }

        .effects-title {
          font-size: 14px;
          color: #40E0D0;
          margin-bottom: 12px;
          font-weight: 600;
          text-shadow: 0 0 5px #40E0D0;
        }

        .effects-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .effect-tag {
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(64, 224, 208, 0.15));
          border: 1px solid rgba(0, 255, 255, 0.3);
          color: #00FFFF;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
          text-shadow: 0 0 5px #00FFFF;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .effect-tag:nth-child(2n) {
          animation-delay: 0.5s;
        }

        .effect-tag:nth-child(3n) {
          animation-delay: 1s;
        }


        .pikcha-logo {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.8;
        }

        .logo-text {
          display: flex;
          gap: 8px;
          font-size: 18px;
          font-weight: bold;
        }

        .logo-pikcha {
          color: #00FFFF;
          text-shadow: 0 0 8px #00FFFF;
        }

        .logo-ai {
          color: #40E0D0;
          text-shadow: 0 0 8px #40E0D0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .processing-content {
            width: 100%;
            padding: 0 20px;
          }

          .processing-text {
            font-size: 28px;
          }

          .whatsapp-form {
            padding: 30px 20px;
          }

          .phone-input-group {
            flex-direction: column;
          }

          .phone-prefix {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="processing-content">
        <div className="processing-animation">
          <div className="processing-ring"></div>
          <div className="processing-ring"></div>
          <div className="processing-ring"></div>
        </div>
        
        <div className="processing-text">NEURAL MATRIX ACTIVE</div>
        <div className="processing-status">{processingStatus}</div>
        
        {enabledEffects.length > 0 && (
          <div className="effects-preview">
            <p className="effects-title">Digital Enhancement Protocols:</p>
            <div className="effects-list">
              {enabledEffects.map((effect, index) => (
                <span key={effect.id} className="effect-tag">
                  {effect.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Always show WhatsApp form - effects process in background */}
        <div className="whatsapp-form">
          {isProcessing && (
            <div style={{
              background: 'rgba(0, 255, 255, 0.15)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              color: '#00FFFF',
              fontSize: '14px',
              textAlign: 'center',
              textShadow: '0 0 8px #00FFFF',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
            }}>
              Neural networks processing your digital identity... Optimizing for peak performance!
            </div>
          )}
          <div className="whatsapp-title">
            Digital Copy Transfer
          </div>
          
          <p className="whatsapp-subtitle">Enter your number to receive digital photos</p>
          
          <div className="phone-input-group">
            <div className="phone-prefix">
              <span className="flag-emoji">🇮🇳</span>
              <span>+91</span>
            </div>
            <input 
              type="tel" 
              className="phone-input" 
              placeholder={isWhatsAppEnabled ? "98765 43210" : "Processing images..."}
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength="11"
              pattern="[0-9]{5} [0-9]{5}"
              disabled={!isWhatsAppEnabled}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && isWhatsAppEnabled) {
                  handlePhoneSubmit(e);
                }
              }}
            />
            <button 
              onClick={handlePhoneSubmit}
              className={`whatsapp-submit ${isPhoneSent ? 'sent' : isSendingWhatsApp ? 'sending' : !isWhatsAppEnabled ? 'disabled' : ''}`}
              disabled={!isWhatsAppEnabled || isPhoneSent || isSendingWhatsApp}
            >
              {!isWhatsAppEnabled ? '...' : isPhoneSent ? 'Sent' : isSendingWhatsApp ? 'Sending...' : 'Send Photos'}
            </button>
          </div>
          
        </div>

      </div>

      <div className="pikcha-logo">
        <div className="logo-text">
          <span className="logo-pikcha">PIKCHA</span>
          <span className="logo-ai">.AI</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;