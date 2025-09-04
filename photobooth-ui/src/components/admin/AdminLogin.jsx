import React, { useState } from 'react';

const AdminLogin = ({ onAuthenticated, onSettingsLoad }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For now, we'll use a simple password check
      // In production, this should be a proper API call
      if (password === 'bamigos@123') {
        localStorage.setItem('adminToken', 'authenticated');
        onAuthenticated(true);
        if (onSettingsLoad) {
          await onSettingsLoad();
        }
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          background: radial-gradient(circle at center, #0a0a1a 0%, #000 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Orbitron', 'Courier New', monospace;
          position: relative;
          overflow: hidden;
          color: #00FFFF;
        }

        .login-container::before {
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
          animation: cyberScan 20s linear infinite;
        }

        @keyframes cyberScan {
          0%, 100% { 
            transform: translateX(0) translateY(0);
            opacity: 0.8;
          }
          50% { 
            transform: translateX(40px) translateY(-30px);
            opacity: 0.3;
          }
        }

        .login-card {
          background: rgba(0, 255, 255, 0.08);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          position: relative;
          z-index: 1;
          box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.3),
            0 25px 50px rgba(0, 0, 0, 0.8),
            inset 0 0 30px rgba(0, 255, 255, 0.1);
        }

        .login-header {
          margin-bottom: 32px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 
            0 0 10px #00FFFF,
            0 0 20px #00FFFF;
          animation: titlePulse 2s ease-in-out infinite alternate;
        }

        @keyframes titlePulse {
          from {
            text-shadow: 
              0 0 10px #00FFFF,
              0 0 20px #00FFFF;
          }
          to {
            text-shadow: 
              0 0 5px #00FFFF,
              0 0 10px #00FFFF,
              0 0 20px #00FFFF,
              0 0 40px #00FFFF;
          }
        }

        .login-subtitle {
          font-size: 14px;
          color: #40E0D0;
          margin-bottom: 24px;
          line-height: 1.4;
          text-shadow: 0 0 5px #40E0D0;
        }

        .login-form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 25px;
          text-align: left;
        }

        .form-label {
          display: block;
          color: #00FFFF;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 5px #00FFFF;
        }

        .form-input {
          width: 100%;
          padding: 18px 24px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 50px;
          color: #00FFFF;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
          font-weight: 600;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .form-input:focus {
          border-color: #00FFFF;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
          background: rgba(0, 255, 255, 0.15);
          text-shadow: 0 0 5px #00FFFF;
        }

        .form-input::placeholder {
          color: rgba(0, 255, 255, 0.5);
        }

        .login-btn {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          color: #000;
          border: 2px solid #00FFFF;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 
            0 0 25px rgba(0, 255, 255, 0.4),
            inset 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }

        .login-btn:hover::before {
          left: 100%;
        }

        .login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 0 35px rgba(0, 255, 255, 0.8),
            0 20px 40px rgba(0, 255, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2);
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-btn.loading {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.98); }
        }

        .error-message {
          background: rgba(255, 70, 70, 0.2);
          color: #ff4646;
          border: 1px solid rgba(255, 70, 70, 0.3);
          border-radius: 25px;
          padding: 12px 20px;
          font-size: 14px;
          margin-bottom: 20px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .login-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .security-icon {
          font-size: 18px;
          color: #46ff90;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-card {
            margin: 20px;
            padding: 40px 30px;
          }

          .login-title {
            font-size: 28px;
          }

          .login-logo {
            width: 60px;
            height: 60px;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            margin: 15px;
            padding: 30px 20px;
          }

          .login-title {
            font-size: 24px;
          }

          .form-input, .login-btn {
            padding: 15px 20px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">PIKCHA.AI Access</h1>
          <p className="login-subtitle">Enter credentials to access the AI control matrix</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-text">
            PIKCHA.AI Control Matrix
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;