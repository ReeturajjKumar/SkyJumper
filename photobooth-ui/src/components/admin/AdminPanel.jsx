import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import OrientationSettings from './OrientationSettings';
import EffectsManager from './EffectsManager';
import CaptureSettings from './CaptureSettings';
import PreviewSettings from './PreviewSettings';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('orientation');
  const [settings, setSettings] = useState({
    orientation: 'portrait',
    effects: [
      { id: 'normal', name: 'Normal', prompt: '', enabled: true },
      { id: 'vintage', name: 'Vintage', prompt: 'vintage style, sepia tone', enabled: true },
      { id: 'bw', name: 'Black & White', prompt: 'black and white, artistic', enabled: true },
      { id: 'vivid', name: 'Vivid Colors', prompt: 'vibrant colors, saturated', enabled: true }
    ],
    autoCapture: true,
    captureInterval: 3000,
    photoCount: 3
  });
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

  const loadSettings = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('');
    
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      if (data.success) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={setIsAuthenticated} onSettingsLoad={loadSettings} />;
  }

  const tabs = [
    { id: 'orientation', name: 'Orientation', icon: '📱' },
    { id: 'effects', name: 'Effects & Prompts', icon: '🎨' },
    { id: 'capture', name: 'Capture Settings', icon: '📸' },
    { id: 'preview', name: 'Preview', icon: '👁️' }
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
          min-height: 100vh;
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: white;
        }

        .admin-header {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-title {
          font-size: 28px;
          font-weight: 300;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .admin-logo {
          width: 40px;
          height: 40px;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .save-btn {
          background: linear-gradient(135deg, #46ff90, #25D366);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(70, 255, 144, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .status-message {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          background: rgba(70, 255, 144, 0.2);
          color: #46ff90;
          border: 1px solid rgba(70, 255, 144, 0.3);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .admin-content {
          display: flex;
          height: calc(100vh - 80px);
        }

        .admin-sidebar {
          width: 280px;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px 0;
        }

        .tab-list {
          list-style: none;
        }

        .tab-item {
          margin-bottom: 8px;
        }

        .tab-button {
          width: 100%;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: none;
          padding: 18px 30px;
          text-align: left;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
          border-radius: 0;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .tab-button.active {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.2), rgba(121, 40, 202, 0.2));
          color: white;
          border-right: 3px solid #FF0080;
        }

        .tab-icon {
          font-size: 20px;
        }

        .admin-main {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }

        .section-title {
          font-size: 24px;
          margin-bottom: 30px;
          font-weight: 300;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(255, 0, 128, 0.3), transparent);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-content {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            height: auto;
            padding: 20px 0;
          }

          .tab-list {
            display: flex;
            overflow-x: auto;
            padding: 0 20px;
          }

          .tab-item {
            margin-bottom: 0;
            margin-right: 10px;
            min-width: 150px;
          }

          .admin-main {
            padding: 20px;
          }

          .admin-header {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
          }

          .admin-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="admin-header">
        <div className="admin-title">
          <svg className="admin-logo" viewBox="0 0 100 100">
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
          SkyJumper Admin Panel
        </div>
        
        <div className="admin-actions">
          {saveStatus && <div className="status-message">{saveStatus}</div>}
          <button 
            className="save-btn"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <ul className="tab-list">
            {tabs.map(tab => (
              <li key={tab.id} className="tab-item">
                <button
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-main">
          {activeTab === 'orientation' && (
            <>
              <h2 className="section-title">
                📱 Photo Orientation Settings
              </h2>
              <OrientationSettings 
                settings={settings}
                onUpdate={updateSettings}
              />
            </>
          )}

          {activeTab === 'effects' && (
            <>
              <h2 className="section-title">
                🎨 Effects & AI Prompts Management
              </h2>
              <EffectsManager 
                settings={settings}
                onUpdate={updateSettings}
              />
            </>
          )}

          {activeTab === 'capture' && (
            <>
              <h2 className="section-title">
                📸 Photo Capture Settings
              </h2>
              <CaptureSettings 
                settings={settings}
                onUpdate={updateSettings}
              />
            </>
          )}

          {activeTab === 'preview' && (
            <>
              <h2 className="section-title">
                👁️ Settings Preview
              </h2>
              <PreviewSettings settings={settings} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;