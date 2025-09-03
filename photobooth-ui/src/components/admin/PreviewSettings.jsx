import React, { useState, useEffect } from 'react';

const PreviewSettings = ({ settings }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [liveSettings, setLiveSettings] = useState(settings || {});
  const [captureSettings, setCaptureSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'effects', name: 'Effects Preview' },
    { id: 'timeline', name: 'Session Flow' },
    { id: 'capture', name: 'Capture Details' },
    { id: 'export', name: 'Export Settings' }
  ];

  // Fetch live settings from API
  useEffect(() => {
    fetchLiveSettings();
    // Set up polling for real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchLiveSettings();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Update when props change
  useEffect(() => {
    if (settings) {
      setLiveSettings(settings);
      setLastUpdated(new Date());
    }
  }, [settings]);

  const fetchLiveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Fetch main settings
      const settingsResponse = await fetch('http://localhost:3002/api/admin/settings');
      const settingsData = await settingsResponse.json();
      
      // Fetch capture settings
      const captureResponse = await fetch('http://localhost:3002/api/admin/settings/capture');
      const captureData = await captureResponse.json();
      
      if (settingsData.success) {
        setLiveSettings(settingsData.settings);
      }
      
      if (captureData.success) {
        setCaptureSettings(captureData.captureSettings);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const calculateTotalTime = () => {
    const photoCount = captureSettings.photoCount || liveSettings.photoCount || 3;
    const captureInterval = captureSettings.captureInterval || liveSettings.captureInterval || 3000;
    const countdownDuration = captureSettings.countdownDuration || liveSettings.countdownDuration || 3000;
    
    // Total time = (photoCount * captureInterval) + (photoCount * countdownDuration) + processing time
    const captureTime = photoCount * captureInterval;
    const countdownTime = photoCount * countdownDuration;
    const processingTime = 2000; // 2 seconds processing time
    
    return ((captureTime + countdownTime + processingTime) / 1000).toFixed(1);
  };

  const getCurrentSettings = () => {
    return {
      ...liveSettings,
      ...captureSettings,
      // Merge capture settings properly
      captureSettings: {
        ...liveSettings.captureSettings,
        ...captureSettings.captureSettings
      }
    };
  };

  const refreshSettings = () => {
    fetchLiveSettings();
  };

  const exportSettings = () => {
    const currentSettings = getCurrentSettings();
    const settingsJson = JSON.stringify(currentSettings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photobooth-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const currentSettings = getCurrentSettings();
    const settingsJson = JSON.stringify(currentSettings, null, 2);
    navigator.clipboard.writeText(settingsJson).then(() => {
      alert('Settings copied to clipboard!');
    });
  };

  return (
    <div className="preview-settings">
      <style>{`
        .preview-settings {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }

        .preview-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .preview-tabs {
          display: flex;
          gap: 12px;
        }

        .preview-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .last-updated {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .refresh-btn.loading {
          opacity: 0.6;
          pointer-events: none;
        }

        .loading-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #46ff90;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #46ff90;
          border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        .preview-tab {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          padding: 10px 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .preview-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .preview-tab.active {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(121, 40, 202, 0.15));
          border-color: #FF0080;
          color: white;
        }

        .tab-content {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-right: 4px;
          animation: fadeIn 0.3s ease;
        }

        .tab-content::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .overview-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
        }

        .overview-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }

        .overview-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .overview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .overview-item:last-child {
          border-bottom: none;
        }

        .item-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .item-value {
          color: white;
          font-weight: 600;
          font-size: 13px;
        }

        .effects-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .effect-preview-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .effect-preview-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .effect-preview-card.disabled {
          opacity: 0.5;
          filter: grayscale(0.3);
        }

        .effect-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .effect-name {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .effect-status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .effect-status.enabled {
          background: rgba(70, 255, 144, 0.15);
          color: #46ff90;
          border: 1px solid rgba(70, 255, 144, 0.3);
        }

        .effect-status.disabled {
          background: rgba(255, 70, 70, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 70, 70, 0.3);
        }

        .effect-prompt {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          line-height: 1.4;
          font-style: italic;
        }

        .effect-prompt.empty {
          color: rgba(255, 255, 255, 0.4);
        }

        .timeline-container {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 24px;
        }

        .timeline-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .timeline-title {
          font-size: 16px;
          color: white;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .timeline-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .timeline-flow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin: 24px 0;
          padding: 0 16px;
        }

        .timeline-line {
          position: absolute;
          top: 50%;
          left: 16px;
          right: 16px;
          height: 2px;
          background: linear-gradient(90deg, #FF0080, #7928CA, #46C3FF);
          border-radius: 1px;
          z-index: 1;
        }

        .timeline-step {
          background: white;
          border: 3px solid;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #FF0080;
          z-index: 2;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .timeline-step:nth-child(2) { border-color: #FF0080; }
        .timeline-step:nth-child(3) { border-color: #7928CA; }
        .timeline-step:nth-child(4) { border-color: #46C3FF; }
        .timeline-step:nth-child(5) { border-color: #46ff90; }
        .timeline-step:nth-child(6) { border-color: #FFD700; }
        .timeline-step:nth-child(7) { border-color: #FF8C42; }

        .step-number {
          font-size: 14px;
          font-weight: 700;
        }

        .step-time {
          font-size: 9px;
          margin-top: -1px;
        }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
          margin-top: 12px;
        }

        .timeline-label {
          text-align: center;
          max-width: 60px;
        }

        .label-title {
          font-size: 11px;
          color: white;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .label-desc {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.2;
        }

        .export-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .export-section {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
        }

        .export-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }

        .export-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .export-btn {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(255, 0, 128, 0.3);
        }

        .export-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .export-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .settings-json {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 16px;
          color: #46ff90;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 11px;
          max-height: 250px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .settings-json::-webkit-scrollbar {
          display: none;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .summary-stat {
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .summary-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .preview-tabs {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .preview-tabs::-webkit-scrollbar {
            display: none;
          }

          .preview-tab {
            min-width: 100px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .export-container {
            grid-template-columns: 1fr;
          }

          .timeline-flow {
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
          }

          .timeline-line {
            display: none;
          }

          .timeline-labels {
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
          }

          .effects-preview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="preview-header">
        <div className="preview-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`preview-tab ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="preview-controls">
          <div className="live-indicator">
            <div className="live-dot"></div>
            LIVE
          </div>
          <div className="last-updated">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button 
            className={`refresh-btn ${isLoading ? 'loading' : ''}`}
            onClick={refreshSettings}
            disabled={isLoading}
          >
            {isLoading ? <div className="loading-spinner"></div> : ''}
            Refresh
          </button>
        </div>
      </div>

      <div className="tab-content">
        {selectedTab === 'overview' && (
          <>
            <div className="overview-grid">
              <div className="overview-card">
                <h3 className="overview-title">Display Settings</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Orientation</span>
                    <span className="item-value">{liveSettings.orientation || 'Not set'}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Aspect Ratio</span>
                    <span className="item-value">
                      {liveSettings.orientation === 'portrait' ? '9:16' : 
                       liveSettings.orientation === 'landscape' ? '16:9' : 
                       liveSettings.orientation === 'square' ? '1:1' : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3 className="overview-title">Capture Settings</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Photo Count</span>
                    <span className="item-value">{captureSettings.photoCount || liveSettings.photoCount || 0} photos</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Countdown Duration</span>
                    <span className="item-value">{formatTime(captureSettings.countdownDuration || liveSettings.countdownDuration || 3000)}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Capture Interval</span>
                    <span className="item-value">{formatTime(captureSettings.captureInterval || liveSettings.captureInterval || 3000)}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Auto Capture</span>
                    <span className="item-value">{(captureSettings.autoCapture !== undefined ? captureSettings.autoCapture : liveSettings.autoCapture) ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Total Session Time</span>
                    <span className="item-value">{calculateTotalTime()}s</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3 className="overview-title">Effects Summary</h3>
                <div className="overview-items">
                  <div className="overview-item">
                    <span className="item-label">Total Effects</span>
                    <span className="item-value">{liveSettings.effects ? liveSettings.effects.length : 0}</span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Enabled Effects</span>
                    <span className="item-value">
                      {liveSettings.effects ? liveSettings.effects.filter(e => e.enabled).length : 0}
                    </span>
                  </div>
                  <div className="overview-item">
                    <span className="item-label">Custom Prompts</span>
                    <span className="item-value">
                      {liveSettings.effects ? liveSettings.effects.filter(e => e.prompt && e.prompt.trim()).length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-stats">
              <div className="summary-stat">
                <div className="summary-value">{captureSettings.photoCount || liveSettings.photoCount || 0}</div>
                <div className="summary-label">Photos</div>
              </div>
              <div className="summary-stat">
                <div className="summary-value">{liveSettings.effects ? liveSettings.effects.filter(e => e.enabled).length : 0}</div>
                <div className="summary-label">Active Effects</div>
              </div>
              <div className="summary-stat">
                <div className="summary-value">{calculateTotalTime()}s</div>
                <div className="summary-label">Session Time</div>
              </div>
              <div className="summary-stat">
                <div className="summary-value">{(captureSettings.autoCapture !== undefined ? captureSettings.autoCapture : liveSettings.autoCapture) ? 'Auto' : 'Manual'}</div>
                <div className="summary-label">Capture Mode</div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'effects' && (
          <div className="effects-preview">
            {liveSettings.effects && liveSettings.effects.length > 0 ? (
              liveSettings.effects.map(effect => (
                <div key={effect.id} className={`effect-preview-card ${!effect.enabled ? 'disabled' : ''}`}>
                  <div className="effect-header">
                    <div className="effect-name">{effect.name}</div>
                    <div className={`effect-status ${effect.enabled ? 'enabled' : 'disabled'}`}>
                      {effect.enabled ? 'Enabled' : 'Disabled'}
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
              {Array.from({ length: Math.min((captureSettings.photoCount || liveSettings.photoCount || 1), 6) }, (_, i) => (
                <div key={i} className="timeline-step">
                  <div className="step-number">{i + 1}</div>
                  <div className="step-time">
                    {i === 0 ? '0s' : `${((i * (captureSettings.captureInterval || liveSettings.captureInterval || 3000)) / 1000).toFixed(1)}s`}
                  </div>
                </div>
              ))}
            </div>

            <div className="timeline-labels">
              {Array.from({ length: Math.min((captureSettings.photoCount || liveSettings.photoCount || 1), 6) }, (_, i) => (
                <div key={i} className="timeline-label">
                  <div className="label-title">Photo {i + 1}</div>
                  <div className="label-desc">
                    {i === 0 ? 'Session start' : `After ${formatTime(i * (captureSettings.captureInterval || liveSettings.captureInterval || 3000))}`}
                  </div>
                </div>
              ))}
            </div>

            {((captureSettings.photoCount || liveSettings.photoCount || 0) > 6) && (
              <div style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                ... and {(captureSettings.photoCount || liveSettings.photoCount || 0) - 6} more photos
              </div>
            )}
          </div>
        )}

        {selectedTab === 'capture' && (
          <div className="overview-grid">
            <div className="overview-card">
              <h3 className="overview-title">Timing Settings</h3>
              <div className="overview-items">
                <div className="overview-item">
                  <span className="item-label">Countdown Duration</span>
                  <span className="item-value">{formatTime(captureSettings.countdownDuration || liveSettings.countdownDuration || 3000)}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Capture Interval</span>
                  <span className="item-value">{formatTime(captureSettings.captureInterval || liveSettings.captureInterval || 3000)}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Preview Time</span>
                  <span className="item-value">{formatTime((captureSettings.captureSettings?.previewTime || liveSettings.captureSettings?.previewTime || 2000))}</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h3 className="overview-title">Capture Features</h3>
              <div className="overview-items">
                <div className="overview-item">
                  <span className="item-label">Flash Effect</span>
                  <span className="item-value">{(captureSettings.captureSettings?.flashEnabled || liveSettings.captureSettings?.flashEnabled) ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Sound Effect</span>
                  <span className="item-value">{(captureSettings.captureSettings?.soundEnabled !== undefined ? captureSettings.captureSettings?.soundEnabled : liveSettings.captureSettings?.soundEnabled) ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Retake Allowed</span>
                  <span className="item-value">{(captureSettings.captureSettings?.retakeAllowed !== undefined ? captureSettings.captureSettings?.retakeAllowed : liveSettings.captureSettings?.retakeAllowed) ? 'Yes' : 'No'}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Max Retakes</span>
                  <span className="item-value">{captureSettings.captureSettings?.maxRetakes || liveSettings.captureSettings?.maxRetakes || 3}</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h3 className="overview-title">Session Overview</h3>
              <div className="overview-items">
                <div className="overview-item">
                  <span className="item-label">Total Photos</span>
                  <span className="item-value">{captureSettings.photoCount || liveSettings.photoCount || 3}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Auto Capture</span>
                  <span className="item-value">{(captureSettings.autoCapture !== undefined ? captureSettings.autoCapture : liveSettings.autoCapture) ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Total Session Duration</span>
                  <span className="item-value">{calculateTotalTime()}s</span>
                </div>
                <div className="overview-item">
                  <span className="item-label">Last Updated</span>
                  <span className="item-value">{new Date(liveSettings.lastUpdated || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'export' && (
          <div className="export-container">
            <div className="export-section">
              <h3 className="export-title">
                Export Configuration
              </h3>
              <div className="export-actions">
                <button className="export-btn" onClick={exportSettings}>
                  Download Settings File
                </button>
                <button className="export-btn secondary" onClick={copyToClipboard}>
                  Copy to Clipboard
                </button>
              </div>
            </div>

            <div className="export-section">
              <h3 className="export-title">
                Settings JSON
              </h3>
              <div className="settings-json">
                {JSON.stringify(getCurrentSettings(), null, 2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSettings;