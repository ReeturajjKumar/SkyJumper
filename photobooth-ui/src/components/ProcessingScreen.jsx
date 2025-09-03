import React, { useState, useEffect } from 'react';

const ProcessingScreen = ({ onComplete }) => {
  const [processingStatus, setProcessingStatus] = useState('Applying premium effects...');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSent, setIsPhoneSent] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const processingMessages = [
    'Applying premium effects...',
    'Enhancing colors...',
    'Optimizing quality...',
    'Creating your masterpiece...',
    'Finalizing details...'
  ];

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

  const handleSkip = (e) => {
    e.preventDefault();
    console.log('Skipped WhatsApp');
    handleContinue();
  };

  const handleContinue = () => {
    onComplete();
  };

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
        
        <div className="whatsapp-form">
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
          
          <a href="#" className="skip-link" onClick={handleSkip}>
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