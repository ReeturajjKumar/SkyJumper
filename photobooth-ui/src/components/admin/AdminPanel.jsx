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
          background: ${isOverlay ? 'transparent' : 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-header {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          position: relative;
        }

        .admin-header::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 0, 128, 0.3), rgba(121, 40, 202, 0.3), rgba(70, 195, 255, 0.3), transparent);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-title {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #FF0080, #7928CA, #46C3FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .admin-subtitle {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
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
          background: linear-gradient(135deg, #46ff90, #25D366);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(70, 255, 144, 0.2);
        }

        .save-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(70, 255, 144, 0.35);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 8px rgba(70, 255, 144, 0.1);
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 500;
        }

        .logout-btn:hover {
          background: rgba(255, 70, 70, 0.15);
          color: #ff6b6b;
          border-color: rgba(255, 70, 70, 0.3);
          transform: translateY(-1px);
        }

        .status-message {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(70, 255, 144, 0.15);
          color: #46ff90;
          border: 1px solid rgba(70, 255, 144, 0.3);
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 12px rgba(70, 255, 144, 0.2);
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
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .tab-button {
          flex: 1;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          border: none;
          padding: 16px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border-bottom: 2px solid transparent;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
        }

        .tab-button.active {
          background: rgba(255, 0, 128, 0.1);
          color: white;
          border-bottom-color: #FF0080;
        }

        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #FF0080, #7928CA);
        }

        .admin-main {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
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
            <div className="admin-title">SkyJumper Admin</div>
            <div className="admin-subtitle">Configuration Panel</div>
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