import React, { useState } from 'react';

const CaptureSettings = ({ settings, onUpdate }) => {
  const [isLivePreview, setIsLivePreview] = useState(false);

  const countdownOptions = [
    { value: 1000, label: '1 second', icon: '1️⃣' },
    { value: 2000, label: '2 seconds', icon: '2️⃣' },
    { value: 3000, label: '3 seconds', icon: '3️⃣' },
    { value: 4000, label: '4 seconds', icon: '4️⃣' },
    { value: 5000, label: '5 seconds', icon: '5️⃣' },
    { value: 8000, label: '8 seconds', icon: '8️⃣' },
    { value: 10000, label: '10 seconds', icon: '🔟' }
  ];

  const photoCountOptions = [
    { value: 1, label: '1 Photo', icon: '📸', description: 'Single shot' },
    { value: 2, label: '2 Photos', icon: '📷', description: 'Double take' },
    { value: 3, label: '3 Photos', icon: '🎯', description: 'Classic strip' },
    { value: 4, label: '4 Photos', icon: '🎨', description: 'Quad layout' },
    { value: 5, label: '5 Photos', icon: '🌟', description: 'Extended strip' },
    { value: 6, label: '6 Photos', icon: '💫', description: 'Maximum shots' }
  ];

  const captureIntervalOptions = [
    { value: 1000, label: '1 second', description: 'Quick succession' },
    { value: 1500, label: '1.5 seconds', description: 'Fast pace' },
    { value: 2000, label: '2 seconds', description: 'Moderate pace' },
    { value: 2500, label: '2.5 seconds', description: 'Comfortable pace' },
    { value: 3000, label: '3 seconds', description: 'Standard timing' },
    { value: 4000, label: '4 seconds', description: 'Relaxed timing' },
    { value: 5000, label: '5 seconds', description: 'Slow pace' }
  ];

  const handleCountdownChange = (value) => {
    onUpdate('captureInterval', value);
  };

  const handlePhotoCountChange = (value) => {
    onUpdate('photoCount', value);
  };

  const handleAutoCaptureToggle = () => {
    onUpdate('autoCapture', !settings.autoCapture);
  };

  const handleIntervalChange = (value) => {
    onUpdate('captureInterval', value);
  };

  const calculateTotalTime = () => {
    const totalTime = (settings.photoCount * settings.captureInterval) / 1000;
    return totalTime.toFixed(1);
  };

  return (
    <div className="capture-settings">
      <style>{`
        .capture-settings {
          max-width: 900px;
        }

        .section-description {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .section-description h3 {
          color: white;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }

        .settings-sections {
          display: grid;
          gap: 30px;
        }

        .setting-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
        }

        .setting-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .setting-description {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 25px;
          line-height: 1.5;
        }

        .auto-capture-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          margin-bottom: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auto-capture-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .auto-capture-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .auto-capture-icon {
          font-size: 32px;
        }

        .auto-capture-details h4 {
          color: white;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .auto-capture-details p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .toggle-switch {
          position: relative;
          width: 70px;
          height: 35px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .toggle-switch.enabled {
          background: linear-gradient(135deg, #46ff90, #25D366);
        }

        .toggle-slider {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 29px;
          height: 29px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.enabled .toggle-slider {
          transform: translateX(35px);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .option-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
        }

        .option-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .option-card.active {
          border-color: #FF0080;
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(121, 40, 202, 0.15));
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 0, 128, 0.2);
        }

        .option-icon {
          font-size: 32px;
          margin-bottom: 15px;
          display: block;
        }

        .option-label {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .option-description {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .active-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #46ff90, #25D366);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }

        .option-card.active .active-indicator {
          opacity: 1;
          transform: scale(1);
        }

        .custom-range {
          margin: 25px 0;
        }

        .range-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .range-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .range-value {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .range-slider {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          outline: none;
          -webkit-appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.3);
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.3);
        }

        .preview-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          margin-top: 30px;
        }

        .preview-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-icon {
          font-size: 28px;
          margin-bottom: 10px;
          display: block;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .timeline-preview {
          margin-top: 25px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .timeline-title {
          font-size: 16px;
          color: white;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .timeline-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin: 20px 0;
        }

        .timeline-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #FF0080, #7928CA, #46C3FF);
          z-index: 1;
        }

        .timeline-step {
          background: white;
          border: 3px solid #FF0080;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #FF0080;
          z-index: 2;
          position: relative;
        }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .timeline-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          max-width: 60px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .preview-stats {
            grid-template-columns: 1fr 1fr;
          }

          .timeline-steps {
            flex-wrap: wrap;
            gap: 10px;
          }

          .timeline-line {
            display: none;
          }
        }
      `}</style>

      <div className="section-description">
        <h3>📸 Photo Capture Configuration</h3>
        <p>
          Configure how photos are captured during the photobooth session. You can set the countdown duration, 
          number of photos to capture, intervals between photos, and enable automatic capture mode. 
          These settings directly affect the user experience and session flow.
        </p>
      </div>

      <div className="settings-sections">
        {/* Auto Capture Toggle */}
        <div className="setting-section">
          <h3 className="setting-title">
            🤖 Auto Capture Mode
          </h3>
          <div className="setting-description">
            Enable automatic photo capture with timed intervals, or disable for manual capture control.
          </div>
          
          <div className="auto-capture-toggle" onClick={handleAutoCaptureToggle}>
            <div className="auto-capture-info">
              <span className="auto-capture-icon">
                {settings.autoCapture ? '🟢' : '🔴'}
              </span>
              <div className="auto-capture-details">
                <h4>{settings.autoCapture ? 'Auto Capture ON' : 'Manual Capture'}</h4>
                <p>
                  {settings.autoCapture 
                    ? 'Photos will be captured automatically with countdown' 
                    : 'User will need to trigger each photo manually'
                  }
                </p>
              </div>
            </div>
            
            <div className={`toggle-switch ${settings.autoCapture ? 'enabled' : ''}`}>
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>

        {/* Photo Count */}
        <div className="setting-section">
          <h3 className="setting-title">
            📷 Number of Photos
          </h3>
          <div className="setting-description">
            Select how many photos will be taken in each session. More photos create longer strips.
          </div>

          <div className="options-grid">
            {photoCountOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${settings.photoCount === option.value ? 'active' : ''}`}
                onClick={() => handlePhotoCountChange(option.value)}
              >
                <div className="active-indicator">
                  <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                </div>
                <span className="option-icon">{option.icon}</span>
                <div className="option-label">{option.label}</div>
                <div className="option-description">{option.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="setting-section">
          <h3 className="setting-title">
            ⏰ Countdown Duration
          </h3>
          <div className="setting-description">
            Set the countdown timer before each photo is captured. Gives users time to pose.
          </div>

          <div className="options-grid">
            {countdownOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${settings.captureInterval === option.value ? 'active' : ''}`}
                onClick={() => handleCountdownChange(option.value)}
              >
                <div className="active-indicator">
                  <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                </div>
                <span className="option-icon">{option.icon}</span>
                <div className="option-label">{option.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interval Between Photos */}
        {settings.photoCount > 1 && (
          <div className="setting-section">
            <h3 className="setting-title">
              ⏱️ Interval Between Photos
            </h3>
            <div className="setting-description">
              Time gap between consecutive photos. Allows users to change poses.
            </div>

            <div className="custom-range">
              <div className="range-label">
                <span className="range-title">Capture Interval</span>
                <span className="range-value">{settings.captureInterval / 1000}s</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="1000"
                max="10000"
                step="500"
                value={settings.captureInterval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
              />
            </div>

            <div className="options-grid">
              {captureIntervalOptions.map(option => (
                <div
                  key={option.value}
                  className={`option-card ${settings.captureInterval === option.value ? 'active' : ''}`}
                  onClick={() => handleIntervalChange(option.value)}
                >
                  <div className="active-indicator">
                    <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                  </div>
                  <div className="option-label">{option.label}</div>
                  <div className="option-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <h3 className="preview-title">
          👁️ Session Preview
        </h3>
        
        <div className="preview-stats">
          <div className="stat-card">
            <span className="stat-icon">📸</span>
            <div className="stat-value">{settings.photoCount}</div>
            <div className="stat-label">Photos</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">⏰</span>
            <div className="stat-value">{settings.captureInterval / 1000}s</div>
            <div className="stat-label">Countdown</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <div className="stat-value">{calculateTotalTime()}s</div>
            <div className="stat-label">Total Time</div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">{settings.autoCapture ? '🤖' : '👆'}</span>
            <div className="stat-value">{settings.autoCapture ? 'Auto' : 'Manual'}</div>
            <div className="stat-label">Mode</div>
          </div>
        </div>

        {settings.photoCount > 1 && (
          <div className="timeline-preview">
            <div className="timeline-title">📅 Session Timeline</div>
            <div className="timeline-steps">
              <div className="timeline-line"></div>
              {Array.from({ length: settings.photoCount }, (_, i) => (
                <div key={i} className="timeline-step">{i + 1}</div>
              ))}
            </div>
            <div className="timeline-labels">
              {Array.from({ length: settings.photoCount }, (_, i) => (
                <div key={i} className="timeline-label">
                  Photo {i + 1}<br />
                  {i === 0 ? '0s' : `${(i * settings.captureInterval / 1000).toFixed(1)}s`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptureSettings;