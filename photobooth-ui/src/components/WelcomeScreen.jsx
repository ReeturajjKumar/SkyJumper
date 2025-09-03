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
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          display: flex;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .welcome-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg at 50% 50%, 
              rgba(255, 70, 150, 0.1), 
              rgba(120, 70, 255, 0.1), 
              rgba(70, 200, 255, 0.1), 
              rgba(255, 70, 150, 0.1));
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          to { transform: rotate(360deg); }
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
          font-weight: 300;
          color: white;
          margin-bottom: 20px;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: slideInLeft 1s ease;
        }

        .welcome-subtitle {
          font-size: 24px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 50px;
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

        .start-btn {
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
          animation: slideInLeft 1s ease 0.4s both;
          text-transform: uppercase;
          letter-spacing: 2px;
          width: fit-content;
        }

        .start-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .start-btn:hover::before {
          left: 100%;
        }

        .start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(255, 0, 128, 0.3);
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
          width: 250px;
          height: 250px;
          position: relative;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          50% { 
            transform: translateY(-20px) scale(1.05); 
          }
        }

        .neon-camera-body {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 70, 150, 0.2), rgba(120, 70, 255, 0.2));
          border: 2px solid rgba(255, 70, 150, 0.5);
          border-radius: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          box-shadow: 0 0 50px rgba(255, 70, 150, 0.5),
                      inset 0 0 50px rgba(120, 70, 255, 0.2);
        }

        .neon-camera-lens {
          width: 120px;
          height: 120px;
          border: 3px solid rgba(70, 200, 255, 0.8);
          border-radius: 50%;
          position: relative;
          background: radial-gradient(circle, rgba(70, 200, 255, 0.2), transparent);
          box-shadow: 0 0 30px rgba(70, 200, 255, 0.6);
        }

        .neon-camera-lens::after {
          content: '';
          position: absolute;
          top: 20%;
          left: 20%;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          filter: blur(5px);
        }

        .skyjumper-logo {
          position: absolute;
          bottom: 40px;
          left: 80px;
          display: flex;
          align-items: center;
          gap: 15px;
          opacity: 0.7;
          animation: slideInLeft 1s ease 0.6s both;
        }

        .logo-monkey {
          width: 50px;
          height: 50px;
        }

        .logo-text {
          display: flex;
          gap: 8px;
          font-size: 24px;
          font-weight: bold;
        }

        .logo-sky {
          color: #4A90E2;
        }

        .logo-jumper {
          color: #FF8C42;
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
          
          .skyjumper-logo {
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="welcome-left">
        <h1 className="welcome-title">
          SkyJumper<br />Photo Booth
        </h1>
        <p className="welcome-subtitle">
          Capture magical moments with style
        </p>
        <button 
          className={`start-btn ${isStarting ? 'starting' : ''}`}
          onClick={handleStartSession}
        >
          Start Session
        </button>
        
        <div className="skyjumper-logo">
          <svg className="logo-monkey" viewBox="0 0 100 100">
            {/* Monkey character */}
            <circle cx="50" cy="35" r="15" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
            <circle cx="50" cy="50" r="12" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
            {/* Eyes */}
            <circle cx="45" cy="33" r="2" fill="white"/>
            <circle cx="55" cy="33" r="2" fill="white"/>
            <circle cx="45" cy="33" r="1.5" fill="black"/>
            <circle cx="55" cy="33" r="1.5" fill="black"/>
            {/* Smile */}
            <path d="M 43 38 Q 50 41 57 38" stroke="black" strokeWidth="1.5" fill="none"/>
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
          <div className="logo-text">
            <span className="logo-sky">SKY</span>
            <span className="logo-jumper">JUMPER</span>
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