import React, { useState } from 'react';

const PreviewSettings = ({ settings }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'effects', name: 'Effects Preview', icon: '🎨' },
    { id: 'timeline', name: 'Session Flow', icon: '⏱️' },
    { id: 'export', name: 'Export Settings', icon: '📤' }
  ];

  const formatTime = (ms) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const calculateTotalTime = () => {
    return ((settings.photoCount * settings.captureInterval) / 1000).toFixed(1);
  };

  const exportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photobooth-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(settingsJson).then(() => {
      alert('Settings copied to clipboard!');
    });
  };

  return (
    <div className="preview-settings">
      <style>{`
        .preview-settings {
          max-width: 1000px;
        }

        .preview-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 20px;
        }

        .preview-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .preview-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .preview-tab.active {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.2), rgba(121, 40, 202, 0.2));
          border-color: #FF0080;
          color: white;
        }

        .preview-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .overview-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
        }

        .overview-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .overview-items {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .overview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .overview-item:last-child {
          border-bottom: none;
        }

        .item-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .item-value {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .effects-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .effect-preview-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          opacity: ${settings.effects ? '1' : '0.5'};
          transition: all 0.3s ease;
        }

        .effect-preview-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .effect-preview-card.disabled {
          opacity: 0.5;
          filter: grayscale(0.5);
        }

        .effect-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .effect-name {
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .effect-status {
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
        }

        .effect-status.enabled {
          background: rgba(70, 255, 144, 0.2);
          color: #46ff90;
          border: 1px solid rgba(70, 255, 144, 0.3);
        }

        .effect-status.disabled {
          background: rgba(255, 70, 70, 0.2);
          color: #ff4646;
          border: 1px solid rgba(255, 70, 70, 0.3);
        }

        .effect-prompt {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.4;
          font-style: italic;
        }

        .effect-prompt.empty {
          color: rgba(255, 255, 255, 0.4);
        }

        .timeline-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
        }

        .timeline-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .timeline-title {
          font-size: 20px;
          color: white;
          margin-bottom: 10px;
        }

        .timeline-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .timeline-flow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin: 40px 0;
          padding: 0 20px;
        }

        .timeline-line {
          position: absolute;
          top: 50%;
          left: 20px;
          right: 20px;
          height: 3px;
          background: linear-gradient(90deg, #FF0080, #7928CA, #46C3FF);
          border-radius: 2px;
          z-index: 1;
        }

        .timeline-step {
          background: white;
          border: 4px solid;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #FF0080;
          z-index: 2;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .timeline-step:nth-child(2) { border-color: #FF0080; }
        .timeline-step:nth-child(3) { border-color: #7928CA; }
        .timeline-step:nth-child(4) { border-color: #46C3FF; }
        .timeline-step:nth-child(5) { border-color: #46ff90; }
        .timeline-step:nth-child(6) { border-color: #FFD700; }
        .timeline-step:nth-child(7) { border-color: #FF8C42; }

        .step-number {
          font-size: 18px;
          font-weight: 700;
        }

        .step-time {
          font-size: 10px;
          margin-top: -2px;
        }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          margin-top: 15px;
        }

        .timeline-label {
          text-align: center;
          max-width: 70px;
        }

        .label-title {
          font-size: 12px;
          color: white;
          font-weight: 600;
          margin-bottom: 3px;
        }

        .label-desc {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.2;
        }

        .export-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .export-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
        }

        .export-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .export-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .export-btn {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 0, 128, 0.3);
        }

        .export-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .export-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .settings-json {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          color: #46ff90;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          max-height: 300px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .summary-stat {
          text-align: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .summary-icon {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 5px;
        }

        .summary-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .preview-tabs {
            flex-wrap: wrap;
          }

          .export-container {
            grid-template-columns: 1fr;
          }

          .timeline-flow {
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
          }

          .timeline-line {
            display: none;
          }

          .timeline-labels {
            flex-wrap: wrap;
            gap: 15px;
            justify-content: center;
          }
        }
      `}</style>

      <div className="preview-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`preview-tab ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="preview-content">
        {selectedTab === 'overview' && (
          <>
            <div className="overview-grid">
              <div className="overview-card">
                <h3 className="overview-title">📱 Display Settings</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Orientation</span>
                    <span className="item-value">{settings.orientation || 'Not set'}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Aspect Ratio</span>
                    <span className="item-value">
                      {settings.orientation === 'portrait' ? '9:16' : 
                       settings.orientation === 'landscape' ? '16:9' : 
                       settings.orientation === 'square' ? '1:1' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3 className="overview-title">📸 Capture Settings</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Photo Count</span>
                    <span className="item-value">{settings.photoCount || 0} photos</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Countdown Timer</span>
                    <span className="item-value">{formatTime(settings.captureInterval || 0)}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Auto Capture</span>
                    <span className="item-value">{settings.autoCapture ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Total Session Time</span>
                    <span className="item-value">{calculateTotalTime()}s</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3 className="overview-title">🎨 Effects Summary</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Total Effects</span>
                    <span className="item-value">{settings.effects ? settings.effects.length : 0}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Enabled Effects</span>
                    <span className="item-value">
                      {settings.effects ? settings.effects.filter(e => e.enabled).length : 0}
                    </span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Custom Prompts</span>
                    <span className="item-value">
                      {settings.effects ? settings.effects.filter(e => e.prompt && e.prompt.trim()).length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-stats">
              <div className="summary-stat">
                <span className="summary-icon">📸</span>
                <div className="summary-value">{settings.photoCount || 0}</div>
                <div className="summary-label">Photos</div>
              </div>
              <div className="summary-stat">
                <span className="summary-icon">🎨</span>
                <div className="summary-value">{settings.effects ? settings.effects.filter(e => e.enabled).length : 0}</div>
                <div className="summary-label">Active Effects</div>
              </div>
              <div className="summary-stat">
                <span className="summary-icon">⏱️</span>
                <div className="summary-value">{calculateTotalTime()}s</div>
                <div className="summary-label">Session Time</div>
              </div>
              <div className="summary-stat">
                <span className="summary-icon">{settings.autoCapture ? '🤖' : '👆'}</span>
                <div className="summary-value">{settings.autoCapture ? 'Auto' : 'Manual'}</div>
                <div className="summary-label">Capture Mode</div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'effects' && (
          <div className="effects-preview">
            {settings.effects && settings.effects.length > 0 ? (
              settings.effects.map(effect => (
                <div key={effect.id} className={`effect-preview-card ${!effect.enabled ? 'disabled' : ''}`}>
                  <div className="effect-header">
                    <div className="effect-name">{effect.name}</div>
                    <div className={`effect-status ${effect.enabled ? 'enabled' : 'disabled'}`}>
                      {effect.enabled ? '✅ Enabled' : '❌ Disabled'}
                    </div>
                  </div>
                  <div className={`effect-prompt ${!effect.prompt ? 'empty' : ''}`}>
                    {effect.prompt || 'No custom prompt set'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '40px' }}>
                No effects configured
              </div>
            )}
          </div>
        )}

        {selectedTab === 'timeline' && (
          <div className="timeline-container">
            <div className="timeline-header">
              <h3 className="timeline-title">Photo Session Timeline</h3>
              <p className="timeline-subtitle">
                Complete session will take approximately {calculateTotalTime()} seconds
              </p>
            </div>

            <div className="timeline-flow">
              <div className="timeline-line"></div>
              {Array.from({ length: Math.min(settings.photoCount || 1, 6) }, (_, i) => (
                <div key={i} className="timeline-step">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-time">
                    {i === 0 ? '0s' : `${((i * (settings.captureInterval || 3000)) / 1000).toFixed(1)}s`}
                  </div>
                </div>
              ))}
            </div>

            <div className="timeline-labels">
              {Array.from({ length: Math.min(settings.photoCount || 1, 6) }, (_, i) => (
                <div key={i} className="timeline-label">
                  <div className="label-title">Photo {i + 1}</div>
                  <div className="label-desc">
                    {i === 0 ? 'Session start' : `After ${formatTime(i * (settings.captureInterval || 3000))}`}
                  </div>
                </div>
              ))}
            </div>

            {(settings.photoCount || 0) > 6 && (
              <div style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.6)' }}>
                ... and {(settings.photoCount || 0) - 6} more photos
              </div>
            )}
          </div>
        )}

        {selectedTab === 'export' && (
          <div className="export-container">
            <div className="export-section">
              <h3 className="export-title">
                💾 Export Configuration
              </h3>
              <div className="export-actions">
                <button className="export-btn" onClick={exportSettings}>
                  📤 Download Settings File
                </button>
                <button className="export-btn secondary" onClick={copyToClipboard}>
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>

            <div className="export-section">
              <h3 className="export-title">
                📄 Settings JSON
              </h3>
              <div className="settings-json">
                {JSON.stringify(settings, null, 2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSettings;