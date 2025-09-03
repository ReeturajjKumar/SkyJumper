import React, { useState, useEffect } from 'react';

// Smart Image Container that adapts to image orientation
const ImageContainer = ({ imageSrc, index, effectName }) => {
  const [imageOrientation, setImageOrientation] = useState('unknown');
  const [isLoaded, setIsLoaded] = useState(false);

  const detectOrientation = (imgElement) => {
    const { naturalWidth, naturalHeight } = imgElement;
    const orientation = naturalWidth > naturalHeight ? 'landscape' : 'portrait';
    console.log(`📐 Image ${index + 1} orientation: ${orientation} (${naturalWidth} x ${naturalHeight})`);
    setImageOrientation(orientation);
    setIsLoaded(true);
  };

  return (
    <div className={`strip-photo ${imageOrientation}`}>
      {imageSrc ? (
        <>
          <img 
            src={imageSrc} 
            alt={`Photo ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: imageOrientation === 'landscape' ? 'contain' : 'cover',
              borderRadius: '15px',
              backgroundColor: imageOrientation === 'landscape' ? 'rgba(0,0,0,0.1)' : 'transparent'
            }}
            onError={(e) => {
              console.error(`❌ Failed to load image ${index + 1}:`, imageSrc);
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              console.log(`✅ Successfully loaded image ${index + 1}`);
              detectOrientation(e.target);
            }}
          />
          <span className="photo-number">{index + 1}</span>
          {effectName !== 'Original Photo' && (
            <span className="effect-name">{effectName}</span>
          )}
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, #FF0080, #7928CA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '60px',
          borderRadius: '15px'
        }}>
          📸
        </div>
      )}
    </div>
  );
};

const OutputScreen = ({ capturedImages, onComplete }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  // Debug: Log what we received
  useEffect(() => {
    console.log('📷 OutputScreen received capturedImages:', capturedImages);
    console.log('📷 Number of images:', capturedImages?.length || 0);
    
    if (capturedImages && capturedImages.length > 0) {
      capturedImages.forEach((img, index) => {
        console.log(`📷 Final Image ${index + 1}:`, {
          hasProcessed: !!img.processed,
          hasOriginal: !!img.original,
          hasEffect: !!img.effect,
          effectName: img.effect?.name,
          isString: typeof img === 'string'
        });
        
        // Log actual image dimensions for processed and original
        if (img.processed) {
          const processedImg = new Image();
          processedImg.onload = () => {
            console.log(`   ✅ Final processed ${index + 1}: ${processedImg.width} x ${processedImg.height} (${processedImg.width > processedImg.height ? 'LANDSCAPE' : 'PORTRAIT'})`);
          };
          processedImg.src = img.processed;
        }
        
        if (img.original) {
          const originalImg = new Image();
          originalImg.onload = () => {
            console.log(`   📂 Final original ${index + 1}: ${originalImg.width} x ${originalImg.height} (${originalImg.width > originalImg.height ? 'LANDSCAPE' : 'PORTRAIT'})`);
          };
          originalImg.src = img.original;
        }
      });
    }
  }, [capturedImages]);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setIsAnimated(true);
    }, 100);
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate printing process
    console.log('Printing photo strip...');
    
    // Navigate to thank you screen after 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="output-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          overflow-x: hidden;
          width: 100%;
        }

        .output-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .output-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255, 70, 150, 0.1), transparent),
                      radial-gradient(circle at 80% 80%, rgba(70, 200, 255, 0.1), transparent);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }

        .output-header {
          text-align: center;
          margin-bottom: 20px;
          z-index: 1;
          animation: slideDown 0.8s ease;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .output-title {
          font-size: 36px;
          font-weight: 300;
          background: linear-gradient(135deg, #FF0080, #7928CA, #46C3FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }

        .output-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
        }

        .photo-strip-wrapper {
          perspective: 1000px;
          margin-bottom: 20px;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .photo-strip-container {
          width: 1050px; /* Reduced width for better proportions */
          max-width: 95vw; /* Ensure it doesn't exceed viewport width */
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 50%, rgba(240, 147, 251, 0.3) 100%);
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6),
                      0 0 0 1px rgba(255,255,255,0.1);
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
          animation: photoStripAppear 1s ease;
        }

        .photo-strip-container.animated {
          animation: gentle3D 4s ease-in-out infinite;
        }

        @keyframes photoStripAppear {
          from {
            transform: rotateY(90deg) scale(0.8);
            opacity: 0;
          }
          to {
            transform: rotateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes gentle3D {
          0%, 100% { transform: rotateY(0) rotateX(0); }
          25% { transform: rotateY(5deg) rotateX(2deg); }
          75% { transform: rotateY(-5deg) rotateX(-2deg); }
        }

        .photo-strip {
          width: 100%;
          background: transparent;
          display: flex;
          flex-direction: row;
          gap: 30px;
          padding-bottom: 25px;
        }

        .strip-photo {
          flex: 1;
          height: 350px;
          border-radius: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }

        /* Landscape images - make them more square to show all people */
        .strip-photo.landscape {
          height: 280px; /* Shorter height for landscape images */
          width: 350px; /* Reduced width to fit better */
          flex: 0 0 350px; /* Don't flex, maintain fixed width */
          margin: 0 5px; /* Reduced spacing */
        }

        /* Portrait images - keep original tall format */
        .strip-photo.portrait {
          height: 350px; /* Keep original height for portrait */
          flex: 1; /* Allow to flex normally */
        }

        .strip-photo:hover {
          transform: scale(1.02);
        }

        .photo-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #FF0080, #7928CA);
          opacity: 0.9;
        }

        .photo-content {
          position: relative;
          z-index: 1;
          color: white;
          font-size: 80px;
          text-shadow: 0 0 20px rgba(0,0,0,0.3);
          animation: photoIcon 2s ease infinite;
        }

        @keyframes photoIcon {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }

        .strip-photo.vintage .photo-bg {
          background: linear-gradient(45deg, #d4a574, #8b7355);
          filter: sepia(0.4) contrast(1.1) brightness(1.1);
        }

        .strip-photo.bw .photo-bg {
          background: linear-gradient(45deg, #333, #666);
          filter: grayscale(1) contrast(1.2);
        }

        .strip-photo.vivid .photo-bg {
          background: linear-gradient(45deg, #FF006E, #FB5607, #FFBE0B);
          filter: saturate(1.5) contrast(1.1);
        }

        .photo-number {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .effect-name {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .strip-logo {
          padding: 20px 15px 10px;
          background: transparent;
          text-align: center;
          border-top: 2px solid rgba(255,255,255,0.3);
          margin-top: 15px;
          position: relative;
        }

        .strip-logo::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FF0080, #7928CA, transparent);
        }

        .strip-logo-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .logo-monkey-svg {
          width: 40px;
          height: 40px;
          animation: monkeyJump 3s ease-in-out infinite;
        }

        @keyframes monkeyJump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .strip-logo-text {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .logo-sky {
          color: #4A90E2;
        }

        .logo-jumper {
          color: #FF8C42;
        }

        .print-section {
          text-align: center;
          z-index: 1;
          animation: slideUp 0.8s ease 0.5s both;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .print-btn {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          border: none;
          padding: 25px 80px;
          font-size: 20px;
          font-weight: 600;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 2px;
          display: inline-flex;
          align-items: center;
          gap: 15px;
        }

        .print-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .print-btn:hover::before {
          left: 100%;
        }

        .print-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(255, 0, 128, 0.3);
        }

        .print-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .print-btn.printing {
          animation: pulse 1s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.98); }
        }

        .print-icon {
          font-size: 24px;
        }

        .decorative-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 70, 150, 0.1), rgba(70, 200, 255, 0.1));
          animation: floatShape 15s ease-in-out infinite;
        }

        .floating-shape:nth-child(1) {
          width: 100px;
          height: 100px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-shape:nth-child(2) {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 10%;
          animation-delay: 5s;
        }

        .floating-shape:nth-child(3) {
          width: 80px;
          height: 80px;
          bottom: 20%;
          left: 15%;
          animation-delay: 10s;
        }

        @keyframes floatShape {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .info-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 10px 20px;
          border-radius: 50px;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 2;
        }

        .badge-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #46ff90, #25D366);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .output-title {
            font-size: 36px;
          }

          .output-subtitle {
            font-size: 16px;
          }

          .photo-strip-container {
            max-width: calc(100% - 20px);
            padding: 25px;
            margin: 0 10px;
          }
          
          .photo-strip {
            flex-direction: column;
            gap: 15px;
          }
          
          .strip-photo {
            height: 220px;
          }

          /* Mobile landscape images - make them responsive and square */
          .strip-photo.landscape {
            height: 180px;
            width: 100%;
            flex: 0 0 180px;
            margin: 0;
          }

          /* Mobile portrait images */
          .strip-photo.portrait {
            height: 220px;
            width: 100%;
          }

          .print-btn {
            padding: 20px 60px;
            font-size: 18px;
          }

          .strip-logo-text {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .output-container {
            padding: 40px 15px;
          }

          .output-title {
            font-size: 28px;
          }

          .print-btn {
            padding: 18px 50px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="decorative-elements">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      <div className="info-badge">
        <div className="badge-icon">
          <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
        </div>
        Ready to Print
      </div>

      <div className="output-header">
        <h1 className="output-title">Your Photo Strip is Ready!</h1>
        <p className="output-subtitle">Premium quality with automatic styling</p>
      </div>
      
      <div className="photo-strip-wrapper">
        <div className={`photo-strip-container ${isAnimated ? 'animated' : ''}`}>
          <div className="photo-strip">
            {capturedImages && capturedImages.length > 0 ? (
              capturedImages.slice(0, 3).map((imageData, index) => {
                // Handle both string URLs (original captured) and object structure (processed)
                let imageSrc, effectName;
                
                if (typeof imageData === 'string') {
                  // Original captured image (just a blob URL string)
                  imageSrc = imageData;
                  effectName = 'Original Photo';
                } else if (imageData && typeof imageData === 'object') {
                  // Processed image object with structure {original, processed, effect}
                  imageSrc = imageData.processed || imageData.original || imageData;
                  effectName = imageData.effect?.name || 'Original Photo';
                } else {
                  // Fallback
                  imageSrc = imageData;
                  effectName = 'Photo';
                }
                
                console.log(`🖼️ Rendering image ${index + 1}:`, {
                  src: imageSrc?.substring(0, 50) + '...',
                  effect: effectName,
                  isString: typeof imageData === 'string',
                  hasProcessed: !!imageData.processed,
                  hasOriginal: !!imageData.original,
                  imageData: imageData
                });
                
                return (
                  <ImageContainer 
                    key={index} 
                    imageSrc={imageSrc} 
                    index={index} 
                    effectName={effectName} 
                  />
                );
              })
            ) : (
              // Fallback to original placeholder content
              <>
                <div className="strip-photo vintage">
                  <div className="photo-bg"></div>
                  <span className="photo-content">📸</span>
                  <span className="photo-number">1</span>
                </div>
                <div className="strip-photo bw">
                  <div className="photo-bg"></div>
                  <span className="photo-content">✨</span>
                  <span className="photo-number">2</span>
                </div>
                <div className="strip-photo vivid">
                  <div className="photo-bg"></div>
                  <span className="photo-content">🎉</span>
                  <span className="photo-number">3</span>
                </div>
              </>
            )}
          </div>
          
          <div className="strip-logo">
            <div className="strip-logo-content">
              <svg className="logo-monkey-svg" viewBox="0 0 100 100">
                {/* Monkey character */}
                <circle cx="50" cy="35" r="15" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
                <circle cx="50" cy="50" r="12" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
                {/* Eyes */}
                <circle cx="45" cy="33" r="2.5" fill="white"/>
                <circle cx="55" cy="33" r="2.5" fill="white"/>
                <circle cx="45" cy="33" r="1.5" fill="black"/>
                <circle cx="55" cy="33" r="1.5" fill="black"/>
                {/* Smile */}
                <path d="M 43 38 Q 50 42 57 38" stroke="black" strokeWidth="1.5" fill="none"/>
                {/* Arms */}
                <path d="M 38 48 Q 28 45 25 52" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M 62 48 Q 72 45 75 52" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
                {/* Legs */}
                <path d="M 43 58 L 40 68" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round"/>
                <path d="M 57 58 L 60 68" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round"/>
                {/* Tail */}
                <path d="M 38 54 Q 20 54 18 62" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
                {/* Arc under monkey */}
                <path d="M 15 80 Q 50 70 85 80" stroke="#FFD700" strokeWidth="5" fill="none" strokeLinecap="round"/>
              </svg>
              <div className="strip-logo-text">
                <span className="logo-sky">SKY</span>
                <span className="logo-jumper">JUMPER</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-section">
        <button 
          className={`print-btn ${isPrinting ? 'printing' : ''}`}
          onClick={handlePrint}
          disabled={isPrinting}
        >
          <span className="print-icon">🖨️</span>
          {isPrinting ? 'Printing...' : 'Print Now'}
        </button>
      </div>
    </div>
  );
};

export default OutputScreen;