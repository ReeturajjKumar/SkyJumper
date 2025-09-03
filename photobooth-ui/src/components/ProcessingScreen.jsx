import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

const ProcessingScreen = ({ capturedImages, onComplete }) => {
  const { settings, getEnabledEffects } = useSettings();
  const [processingStatus, setProcessingStatus] = useState('Applying premium effects...');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedRef = useRef(false); // Prevent React StrictMode duplicate processing
  
  const enabledEffects = getEnabledEffects();
  
  const processingMessages = [
    `Applying ${enabledEffects.length > 0 ? enabledEffects[0]?.name || 'premium' : 'premium'} effects...`,
    'Enhancing colors...',
    'Optimizing quality...',
    `Creating your ${enabledEffects.length > 1 ? enabledEffects[1]?.name?.toLowerCase() || 'masterpiece' : 'masterpiece'}...`,
    'Finalizing details...'
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
          
          // Apply the effect
          const processedImageUrl = await applyEffect(base64Image, effect.prompt);
          
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
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    
    if (phoneNumber && phoneNumber.length >= 10) {
      setIsPhoneSent(true);
      
      // Send to backend or store the number
      console.log('WhatsApp number submitted:', phoneNumber);
      
      // Auto-proceed after 1.5 seconds
      setTimeout(() => {
        handleContinue();
      }, 1500);
    }
  };


  const handleContinue = () => {
    // Wait for processing to complete or use processed images if available
    if (isProcessing) {
      console.log('⏳ Processing still in progress, waiting for completion...');
      // Check again after 2 seconds if processing is ongoing
      setTimeout(() => {
        handleContinue();
      }, 2000);
      return;
    }
    
    // Pass processed images if available, otherwise original images
    const imagesToPass = processedImages.length > 0 ? processedImages : capturedImages;
    console.log('🚀 Continuing to output with:', imagesToPass.length, 'images');
    console.log('📦 Images type:', processedImages.length > 0 ? 'processed' : 'original');
    console.log('📦 Processed images available:', processedImages.length);
    console.log('📦 Images structure:', imagesToPass.map((img, i) => ({
      index: i,
      type: typeof img,
      hasProcessed: !!img.processed,
      hasOriginal: !!img.original,
      hasEffect: !!img.effect
    })));
    console.log('📦 Full image data being passed:', imagesToPass);
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
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          color: white;
          padding: 60px 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .processing-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 70, 150, 0.1), transparent),
                      radial-gradient(circle at 70% 70%, rgba(70, 200, 255, 0.1), transparent);
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          to { transform: rotate(360deg); }
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
          border-top-color: #FF0080;
          border-right-color: #7928CA;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .processing-ring:nth-child(2) {
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          border-top-color: #7928CA;
          border-right-color: #46C3FF;
          animation-duration: 0.8s;
          animation-direction: reverse;
        }

        .processing-ring:nth-child(3) {
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
          border-top-color: #46C3FF;
          border-right-color: #FF0080;
          animation-duration: 0.6s;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .processing-text {
          font-size: 36px;
          margin-bottom: 15px;
          font-weight: 300;
          background: linear-gradient(135deg, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .processing-status {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 50px;
          min-height: 24px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .whatsapp-form {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          animation: slideUp 0.5s ease;
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
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 25px;
        }

        .phone-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .phone-prefix {
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .flag-emoji {
          font-size: 20px;
        }

        .phone-input {
          flex: 1;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 18px;
          outline: none;
          transition: all 0.3s ease;
        }

        .phone-input:focus {
          border-color: #25D366;
          box-shadow: 0 0 20px rgba(37, 211, 102, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }

        .phone-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .whatsapp-submit {
          padding: 15px 40px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
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
          box-shadow: 0 10px 30px rgba(37, 211, 102, 0.3);
        }

        .whatsapp-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .whatsapp-submit.sent {
          background: linear-gradient(135deg, #46ff90, #25D366);
          animation: pulse 0.5s ease;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .skip-link {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-size: 14px;
          margin-top: 15px;
          display: inline-block;
          transition: color 0.3s ease;
          cursor: pointer;
        }

        .skip-link:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .effects-preview {
          margin: 20px 0;
          text-align: center;
        }

        .effects-title {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 12px;
          font-weight: 500;
        }

        .effects-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .effect-tag {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(121, 40, 202, 0.15));
          border: 1px solid rgba(255, 0, 128, 0.3);
          color: #FF0080;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }

        .effect-tag:nth-child(2n) {
          animation-delay: 0.5s;
        }

        .effect-tag:nth-child(3n) {
          animation-delay: 1s;
        }

        .progress-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 40px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .dot.active {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          transform: scale(1.2);
        }

        .skyjumper-logo {
          position: absolute;
          bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.5;
        }

        .logo-text {
          display: flex;
          gap: 8px;
          font-size: 18px;
          font-weight: bold;
        }

        .logo-sky {
          color: #4A90E2;
        }

        .logo-jumper {
          color: #FF8C42;
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
        
        <div className="processing-text">Processing Your Photos</div>
        <div className="processing-status">{processingStatus}</div>
        
        {enabledEffects.length > 0 && (
          <div className="effects-preview">
            <p className="effects-title">Applying Effects:</p>
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
              background: 'rgba(255, 165, 0, 0.2)',
              border: '1px solid rgba(255, 165, 0, 0.5)',
              borderRadius: '10px',
              padding: '10px',
              marginBottom: '20px',
              color: '#FFA500',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              🎨 Applying AI effects to your photos... Please wait for better results!
            </div>
          )}
          <div className="whatsapp-title">
            <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.536 14.911c-.267.751-.994 1.399-1.636 1.581-.422.12-.963.215-2.795-.599-2.348-.044-4.213-1.572-5.643-3.697-1.242-1.846-1.817-3.523-.663-5.348.327-.519.69-.74 1.097-.756l.566-.01c.379 0 .636.271.79.653.224.555.761 1.861.828 1.998.066.136.111.294.017.472-.094.178-.14.289-.281.446-.14.157-.295.35-.422.472-.132.122-.27.252-.116.496.154.244.688 1.133 1.476 1.835 1.018.905 1.878 1.187 2.145 1.321.267.133.423.111.577-.067.154-.178.659-.768.835-1.034.176-.267.353-.223.591-.134.24.089 1.518.716 1.779.847.26.13.434.198.497.305.063.108.063.621-.203 1.372z"/>
            </svg>
            Get Soft Copy via WhatsApp
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
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength="11"
              pattern="[0-9]{5} [0-9]{5}"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePhoneSubmit(e);
                }
              }}
            />
            <button 
              onClick={handlePhoneSubmit}
              className={`whatsapp-submit ${isPhoneSent ? 'sent' : ''}`}
              disabled={isPhoneSent}
            >
              {isPhoneSent ? '✓ Sent' : 'Send'}
            </button>
          </div>
          
          <a href="#" className="skip-link" onClick={(e) => {
            e.preventDefault();
            console.log('Skipped WhatsApp');
            handleContinue();
          }}>
            Skip this step →
          </a>
        </div>

        <div className="progress-dots">
          <div className="dot active"></div>
          <div className="dot active"></div>
          <div className="dot active"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

      <div className="skyjumper-logo">
        <svg viewBox="0 0 60 60" style={{ width: '40px', height: '40px' }}>
          <circle cx="30" cy="20" r="8" fill="#FF8C42" stroke="#E57A2E" strokeWidth="1"/>
          <circle cx="30" cy="30" r="6" fill="#FF8C42" stroke="#E57A2E" strokeWidth="1"/>
          <circle cx="27" cy="19" r="1" fill="white"/>
          <circle cx="33" cy="19" r="1" fill="white"/>
          <circle cx="27" cy="19" r="0.8" fill="black"/>
          <circle cx="33" cy="19" r="0.8" fill="black"/>
          <path d="M 25 22 Q 30 24 35 22" stroke="black" strokeWidth="0.8" fill="none"/>
          <path d="M 22 28 Q 15 26 13 30" stroke="#FF8C42" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 38 28 Q 45 26 47 30" stroke="#FF8C42" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 25 35 L 23 42" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round"/>
          <path d="M 35 35 L 37 42" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round"/>
          <path d="M 22 32 Q 10 32 8 38" stroke="#FF8C42" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 10 50 Q 30 45 50 50" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
        <div className="logo-text">
          <span className="logo-sky">SKY</span>
          <span className="logo-jumper">JUMPER</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;