import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import AdminLogin from './AdminLogin';
import OrientationSettings from './OrientationSettings';
import EffectsManager from './EffectsManager';
import CaptureSettings from './CaptureSettings';
import PreviewSettings from './PreviewSettings';

const AdminPanel = ({ isOverlay = false, onClose }) => {
  const { settings, saveSettings, updateSetting, loadSettings } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('orientation');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
      loadSettings();
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('');
    
    const result = await saveSettings(settings);
    
    if (result.success) {
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus(result.message || 'Failed to save settings');
    }
    
    setIsSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    if (isOverlay && onClose) {
      onClose();
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={setIsAuthenticated} onSettingsLoad={loadSettings} />;
  }

  const tabs = [
    { id: 'orientation', name: 'Orientation' },
    { id: 'effects', name: 'Effects & Prompts' },
    { id: 'capture', name: 'Capture Settings' },
    { id: 'preview', name: 'Preview' }
  ];

  return (
    <div className="admin-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-container {
          ${isOverlay ? 'height: 100%;' : 'min-height: 100vh;'}
          background: ${isOverlay ? 'transparent' : 'radial-gradient(circle at center, #0a0a1a 0%, #000 100%)'};
          font-family: 'Orbitron', 'Courier New', monospace;
          color: #00FFFF;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-header {
          background: rgba(0, 255, 255, 0.05);
          backdrop-filter: blur(25px);
          border-bottom: 2px solid rgba(0, 255, 255, 0.2);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
        }

        .admin-header::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), rgba(64, 224, 208, 0.4), rgba(0, 139, 139, 0.3), transparent);
          animation: borderFlow 3s ease-in-out infinite;
        }

        @keyframes borderFlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-title {
          font-size: 20px;
          font-weight: 700;
          color: #00FFFF;
          letter-spacing: 2px;
          text-transform: uppercase;
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

        .admin-subtitle {
          font-size: 12px;
          color: #40E0D0;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 0 5px #40E0D0;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .shortcut-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 70, 70, 0.15);
          color: #ff6b6b;
          border-color: rgba(255, 70, 70, 0.3);
          transform: translateY(-1px);
        }

        .save-btn {
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          color: #000;
          border: 2px solid #00FFFF;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.4),
            inset 0 0 10px rgba(0, 255, 255, 0.1);
        }

        .save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.8),
            0 6px 20px rgba(0, 255, 255, 0.4),
            inset 0 0 20px rgba(0, 255, 255, 0.2);
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 
            0 0 10px rgba(0, 255, 255, 0.2),
            inset 0 0 5px rgba(0, 255, 255, 0.05);
        }

        .logout-btn {
          background: rgba(255, 0, 100, 0.1);
          color: #FF6B6B;
          border: 2px solid rgba(255, 107, 107, 0.3);
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.2);
        }

        .logout-btn:hover {
          background: rgba(255, 70, 70, 0.2);
          color: #FF4444;
          border-color: rgba(255, 68, 68, 0.5);
          transform: translateY(-1px);
          box-shadow: 
            0 0 25px rgba(255, 107, 107, 0.4),
            0 5px 15px rgba(255, 107, 107, 0.3);
          text-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
        }

        .status-message {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(0, 255, 255, 0.15);
          color: #00FFFF;
          border: 1px solid rgba(0, 255, 255, 0.4);
          animation: slideIn 0.3s ease;
          box-shadow: 
            0 0 15px rgba(0, 255, 255, 0.3),
            0 4px 12px rgba(0, 255, 255, 0.2);
          text-shadow: 0 0 5px #00FFFF;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.4);
          border-bottom: 2px solid rgba(0, 255, 255, 0.2);
          flex-shrink: 0;
          box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .tab-button {
          flex: 1;
          background: transparent;
          color: rgba(0, 255, 255, 0.6);
          border: none;
          padding: 16px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border-bottom: 2px solid transparent;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tab-button:hover {
          background: rgba(0, 255, 255, 0.05);
          color: #00FFFF;
          text-shadow: 0 0 5px #00FFFF;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .tab-button.active {
          background: rgba(0, 255, 255, 0.15);
          color: #00FFFF;
          border-bottom-color: #00FFFF;
          text-shadow: 
            0 0 10px #00FFFF,
            0 0 20px #00FFFF;
          box-shadow: 
            0 0 15px rgba(0, 255, 255, 0.3),
            inset 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00FFFF, #40E0D0, #00FFFF);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
          animation: tabGlow 2s ease-in-out infinite alternate;
        }

        @keyframes tabGlow {
          from {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
          }
          to {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
          }
        }

        .admin-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          background: 
            radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.05), transparent),
            radial-gradient(circle at 80% 70%, rgba(64, 224, 208, 0.03), transparent);
          position: relative;
        }

        .admin-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 48%, rgba(0, 255, 255, 0.01) 50%, transparent 52%);
          animation: adminScan 15s linear infinite;
          pointer-events: none;
        }

        @keyframes adminScan {
          0%, 100% { 
            transform: translateX(0) translateY(0);
            opacity: 0.3;
          }
          50% { 
            transform: translateX(50px) translateY(-30px);
            opacity: 0.1;
          }
        }

        .admin-main::-webkit-scrollbar {
          display: none;
        }

        .section-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-header {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
          }

          .admin-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .admin-tabs::-webkit-scrollbar {
            display: none;
          }

          .tab-button {
            min-width: 120px;
            padding: 12px 16px;
            font-size: 13px;
          }

          .admin-main {
            padding: 16px;
          }
        }
      `}</style>

      <div className="admin-header">
        <div className="header-left">
          <div>
            <div className="admin-title">PIKCHA.AI Admin</div>
            <div className="admin-subtitle">AI Control Matrix</div>
          </div>
        </div>
        
        <div className="admin-actions">
          {saveStatus && <div className="status-message">{saveStatus}</div>}
          {isOverlay && <div className="shortcut-hint">Ctrl+Shift+A</div>}
          <button 
            className="save-btn"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          {isOverlay && onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="admin-main">
          <div className="section-content">
            {activeTab === 'orientation' && (
              <OrientationSettings 
                settings={settings}
                onUpdate={updateSetting}
              />
            )}

            {activeTab === 'effects' && (
              <EffectsManager 
                settings={settings}
                onUpdate={updateSetting}
              />
            )}

            {activeTab === 'capture' && (
              <CaptureSettings 
                settings={settings}
                onUpdate={updateSetting}
              />
            )}

            {activeTab === 'preview' && (
              <PreviewSettings settings={settings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;