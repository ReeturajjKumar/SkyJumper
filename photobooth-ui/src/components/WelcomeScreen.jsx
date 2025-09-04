import React, { useState } from 'react';

const WelcomeScreen = ({ onStart }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <div className="welcome-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .welcome-container {
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, #0a0a1a 0%, #000 100%);
          display: flex;
          position: relative;
          overflow: hidden;
          font-family: 'Orbitron', 'Courier New', monospace;
        }

        .welcome-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
            linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.02) 50%, transparent 52%);
        }


        .welcome-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          z-index: 2;
        }

        .welcome-right {
          flex: 1;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }

        .welcome-title {
          font-size: 72px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 20px;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-shadow: 
            0 0 10px #00FFFF,
            0 0 20px #00FFFF,
            0 0 40px #00FFFF;
          animation: slideInLeft 1s ease, neonPulse 2s ease-in-out infinite alternate;
        }

        .welcome-subtitle {
          font-size: 24px;
          color: #40E0D0;
          margin-bottom: 50px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-shadow: 0 0 5px #40E0D0;
          animation: slideInLeft 1s ease 0.2s both;
        }

        @keyframes slideInLeft {
          from { 
            transform: translateX(-50px); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
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

        .start-btn {
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          color: #000;
          border: 2px solid #00FFFF;
          padding: 25px 80px;
          font-size: 20px;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: slideInLeft 1s ease 0.4s both;
          text-transform: uppercase;
          letter-spacing: 3px;
          width: fit-content;
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .start-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s ease;
        }

        .start-btn:hover::before {
          left: 100%;
        }

        .start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.8),
            0 10px 40px rgba(0, 255, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2);
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .start-btn:active {
          transform: translateY(-1px);
        }

        .start-btn.starting {
          animation: pulse 0.5s ease;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        .neon-camera {
          width: 300px;
          height: 300px;
          position: relative;
          animation: cyberFloat 4s ease-in-out infinite;
        }

        @keyframes cyberFloat {
          0%, 100% { 
            transform: translateY(0) scale(1) rotateZ(0deg); 
          }
          50% { 
            transform: translateY(-20px) scale(1.05) rotateZ(2deg); 
          }
        }

        .neon-camera-body {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(64, 224, 208, 0.2));
          border: 3px solid #00FFFF;
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.6),
            0 0 60px rgba(0, 255, 255, 0.3),
            inset 0 0 30px rgba(0, 255, 255, 0.1);
          animation: neonBorder 3s ease-in-out infinite alternate;
        }

        @keyframes neonBorder {
          from {
            border-color: #00FFFF;
            box-shadow: 
              0 0 30px rgba(0, 255, 255, 0.6),
              0 0 60px rgba(0, 255, 255, 0.3),
              inset 0 0 30px rgba(0, 255, 255, 0.1);
          }
          to {
            border-color: #40E0D0;
            box-shadow: 
              0 0 40px rgba(64, 224, 208, 0.8),
              0 0 80px rgba(64, 224, 208, 0.4),
              inset 0 0 40px rgba(64, 224, 208, 0.2);
          }
        }

        .neon-camera-lens {
          width: 150px;
          height: 150px;
          border: 4px solid #00FFFF;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.2), transparent);
          box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.8),
            inset 0 0 20px rgba(0, 255, 255, 0.3);
          animation: lensPulse 2s ease-in-out infinite;
        }

        @keyframes lensPulse {
          0%, 100% {
            box-shadow: 
              0 0 40px rgba(0, 255, 255, 0.8),
              inset 0 0 20px rgba(0, 255, 255, 0.3);
          }
          50% {
            box-shadow: 
              0 0 60px rgba(0, 255, 255, 1),
              inset 0 0 30px rgba(0, 255, 255, 0.5);
          }
        }

        .neon-camera-lens::after {
          content: '';
          position: absolute;
          top: 25%;
          left: 25%;
          width: 25%;
          height: 25%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          filter: blur(3px);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        }

        .pikcha-logo {
          position: absolute;
          bottom: 40px;
          left: 80px;
          display: flex;
          align-items: center;
          gap: 15px;
          opacity: 0.9;
          animation: slideInLeft 1s ease 0.6s both;
        }

        .logo-pikcha {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.4));
        }

        .logo-text {
          display: flex;
          gap: 8px;
          font-size: 24px;
          font-weight: bold;
        }

        .logo-pikcha-text {
          color: #00FFFF;
          text-shadow: 0 0 8px #00FFFF;
        }

        .logo-ai-text {
          color: #40E0D0;
          text-shadow: 0 0 8px #40E0D0;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .welcome-left {
            padding: 60px;
          }
          
          .welcome-title {
            font-size: 56px;
          }
          
          .welcome-subtitle {
            font-size: 20px;
          }
          
          .start-btn {
            padding: 20px 60px;
            font-size: 18px;
          }
        }

        @media (max-width: 768px) {
          .welcome-container {
            flex-direction: column;
          }
          
          .welcome-left {
            padding: 40px;
            text-align: center;
            align-items: center;
          }
          
          .welcome-title {
            font-size: 48px;
          }
          
          .welcome-subtitle {
            font-size: 18px;
          }
          
          .neon-camera {
            width: 200px;
            height: 200px;
          }
          
          .pikcha-logo {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="welcome-left">
        <h1 className="welcome-title">
          PIKCHA.AI<br />Photo Booth
        </h1>
        <p className="welcome-subtitle">
          THE AI PHOTO TRANSFORMATION
        </p>
        <button 
          className={`start-btn ${isStarting ? 'starting' : ''}`}
          onClick={handleStartSession}
        >
          Start Session
        </button>
        
        <div className="pikcha-logo">
          <div className="logo-text">
            <span className="logo-pikcha-text">PIKCHA</span>
            <span className="logo-ai-text">.AI</span>
          </div>
        </div>
      </div>

      <div className="welcome-right">
        <div className="neon-camera">
          <div className="neon-camera-body">
            <div className="neon-camera-lens"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;