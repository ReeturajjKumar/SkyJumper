import React, { useState, useEffect } from 'react';

const ThankYouScreen = ({ onNewSession }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    // Trigger animations after mount
    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Generate confetti pieces
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: ['#FF0080', '#7928CA', '#46C3FF', '#FFD700', '#46ff90'][Math.floor(Math.random() * 5)]
      });
    }
    setConfettiPieces(pieces);
  }, []);

  const handleNewSession = () => {
    onNewSession();
  };

  return (
    <div className="thankyou-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .thankyou-container {
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, #0a0a1a 0%, #000 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          color: #00FFFF;
          text-align: center;
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Orbitron', 'Courier New', monospace;
        }

        .thankyou-container::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 30% 40%, rgba(0, 255, 255, 0.2), transparent),
            radial-gradient(circle at 70% 60%, rgba(64, 224, 208, 0.15), transparent),
            linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.03) 50%, transparent 52%);
        }


        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
        }


        .thankyou-content {
          z-index: 3;
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.8s ease;
        }

        .thankyou-content.visible {
          opacity: 1;
          transform: scale(1);
        }

        .success-icon-container {
          width: 180px;
          height: 180px;
          margin: 0 auto 40px;
          position: relative;
        }

        .success-icon-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          border: 2px solid #00FFFF;
          border-radius: 50%;
          animation: iconPulse 2s ease-in-out infinite;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.6),
            inset 0 0 30px rgba(0, 255, 255, 0.2);
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 0 30px rgba(0, 255, 255, 0.6),
              inset 0 0 30px rgba(0, 255, 255, 0.2),
              0 0 0 0 rgba(0, 255, 255, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 
              0 0 50px rgba(0, 255, 255, 0.8),
              inset 0 0 50px rgba(0, 255, 255, 0.3),
              0 0 0 30px rgba(0, 255, 255, 0);
          }
        }

        .success-icon {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          animation: successPop 0.8s ease;
        }

        @keyframes successPop {
          0% { 
            transform: scale(0) rotate(-180deg); 
            opacity: 0;
          }
          50% { 
            transform: scale(1.2) rotate(10deg); 
          }
          100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1;
          }
        }

        .success-icon svg {
          width: 100px;
          height: 100px;
          fill: #000;
          filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
        }

        .thankyou-title {
          font-size: 64px;
          margin-bottom: 20px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #00FFFF;
          text-transform: uppercase;
          text-shadow: 
            0 0 10px #00FFFF,
            0 0 20px #00FFFF,
            0 0 40px #00FFFF;
          animation: titleSlide 0.8s ease 0.3s both, neonPulse 2s ease-in-out infinite alternate;
        }

        @keyframes titleSlide {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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

        .thankyou-message {
          font-size: 22px;
          color: #40E0D0;
          margin-bottom: 20px;
          animation: messageSlide 0.8s ease 0.5s both;
          text-shadow: 0 0 5px #40E0D0;
          letter-spacing: 1px;
        }

        @keyframes messageSlide {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .session-info {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-bottom: 50px;
          animation: infoSlide 0.8s ease 0.7s both;
        }

        @keyframes infoSlide {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .info-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .info-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          font-size: 20px;
          font-weight: 600;
          color: white;
        }

        .new-session-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 22px 70px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
          animation: btnSlide 0.8s ease 0.9s both;
        }

        @keyframes btnSlide {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .new-session-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .new-session-btn:hover::before {
          left: 100%;
        }

        .new-session-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .pikcha-celebration {
          position: absolute;
          bottom: 40px;
          display: flex;
          align-items: center;
          gap: 15px;
          animation: celebrationBounce 2s ease-in-out infinite;
        }

        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .celebration-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 2px;
          animation: textDance 1s ease-in-out infinite alternate;
        }

        @keyframes textDance {
          from { transform: rotate(-2deg) scale(1); }
          to { transform: rotate(2deg) scale(1.05); }
        }

        .celebration-text {
          display: flex;
          gap: 8px;
          font-size: 24px;
          font-weight: bold;
        }

        .celebration-pikcha {
          color: #00FFFF;
          text-shadow: 0 0 10px #00FFFF;
        }

        .celebration-ai {
          color: #40E0D0;
          text-shadow: 0 0 10px #40E0D0;
        }

        .decorative-circles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .circle:nth-child(1) {
          width: 300px;
          height: 300px;
          top: -150px;
          left: -150px;
        }

        .circle:nth-child(2) {
          width: 400px;
          height: 400px;
          bottom: -200px;
          right: -200px;
        }

        .circle:nth-child(3) {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }


        .sparkle {
          position: absolute;
          color: white;
        }

        .sparkle:nth-child(1) {
          top: 20%;
          left: 20%;
        }

        .sparkle:nth-child(2) {
          top: 30%;
          right: 25%;
        }

        .sparkle:nth-child(3) {
          bottom: 30%;
          left: 30%;
        }


        /* Responsive Design */
        @media (max-width: 768px) {
          .thankyou-title {
            font-size: 48px;
          }

          .thankyou-message {
            font-size: 18px;
          }

          .session-info {
            flex-direction: column;
            gap: 20px;
          }

          .new-session-btn {
            padding: 18px 50px;
            font-size: 16px;
          }

          .success-icon-container {
            width: 150px;
            height: 150px;
          }

          .success-icon svg {
            width: 80px;
            height: 80px;
          }
        }

        @media (max-width: 480px) {
          .thankyou-title {
            font-size: 36px;
          }

          .thankyou-message {
            font-size: 16px;
          }

          .new-session-btn {
            padding: 16px 40px;
            font-size: 14px;
          }
        }
      `}</style>

      <div className="confetti-container">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="confetti"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: piece.color,
            }}
          />
        ))}
      </div>

      <div className="decorative-circles">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>

      <div className="sparkle">✨</div>
      <div className="sparkle">⭐</div>
      <div className="sparkle">✨</div>

      <div className={`thankyou-content ${isVisible ? 'visible' : ''}`}>
        <div className="success-icon-container">
          <div className="success-icon-bg"></div>
          <div className="success-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        </div>

        <h1 className="thankyou-title">Mission Complete!</h1>
        <p className="thankyou-message">AI transformation complete - Digital identity processed</p>

        <div className="session-info">
          <div className="info-item">
            <div className="info-icon">📸</div>
            <div className="info-label">Photos Taken</div>
            <div className="info-value">3</div>
          </div>
          <div className="info-item">
            <div className="info-icon">🎨</div>
            <div className="info-label">Effects Applied</div>
            <div className="info-value">3</div>
          </div>
          <div className="info-item">
            <div className="info-icon">🖨️</div>
            <div className="info-label">Status</div>
            <div className="info-value">Printed</div>
          </div>
        </div>

        <button className="new-session-btn" onClick={handleNewSession}>
          New Session
        </button>
      </div>

      <div className="pikcha-celebration">
        <div className="celebration-text">
          <span className="celebration-pikcha">PIKCHA</span>
          <span className="celebration-ai">.AI</span>
        </div>
      </div>
    </div>
  );
};

export default ThankYouScreen;