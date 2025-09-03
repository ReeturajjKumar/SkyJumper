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
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
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

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px 50px;
          width: 100%;
          max-width: 450px;
          text-align: center;
          position: relative;
          z-index: 1;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          margin-bottom: 40px;
        }

        .login-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .login-title {
          font-size: 32px;
          font-weight: 300;
          color: white;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 30px;
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
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-input {
          width: 100%;
          padding: 18px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: #FF0080;
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .login-btn {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
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
          box-shadow: 0 20px 40px rgba(255, 0, 128, 0.3);
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
          <svg className="login-logo" viewBox="0 0 100 100">
            <circle cx="50" cy="35" r="15" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
            <circle cx="50" cy="50" r="12" fill="#FF8C42" stroke="#E57A2E" strokeWidth="2"/>
            <circle cx="45" cy="33" r="2" fill="white"/>
            <circle cx="55" cy="33" r="2" fill="white"/>
            <circle cx="45" cy="33" r="1.5" fill="black"/>
            <circle cx="55" cy="33" r="1.5" fill="black"/>
            <path d="M 43 38 Q 50 41 57 38" stroke="black" strokeWidth="1.5" fill="none"/>
            <path d="M 38 48 Q 28 45 25 52" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 62 48 Q 72 45 75 52" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 43 58 L 40 68" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round"/>
            <path d="M 57 58 L 60 68" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round"/>
            <path d="M 38 54 Q 20 54 18 62" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M 15 80 Q 50 70 85 80" stroke="#FFD700" strokeWidth="5" fill="none" strokeLinecap="round"/>
          </svg>
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Enter your password to access the configuration panel</p>
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
            {isLoading ? '🔐 Authenticating...' : '🔐 Login'}
          </button>
        </form>

        <div className="login-footer">
          <div className="footer-text">
            <span className="security-icon">🛡️</span>
            Secure Admin Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;