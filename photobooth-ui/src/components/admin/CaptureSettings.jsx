import React, { useState, useEffect } from 'react';

const CaptureSettings = ({ settings, onUpdate }) => {
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [captureSettings, setCaptureSettings] = useState({
    autoCapture: true,
    countdownDuration: 3000,
    captureInterval: 3000,
    photoCount: 3,
    captureSettings: {}
  });
  const [presets, setPresets] = useState([]);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const countdownOptions = [
    { value: 1000, label: '1 second' },
    { value: 2000, label: '2 seconds' },
    { value: 3000, label: '3 seconds' },
    { value: 4000, label: '4 seconds' },
    { value: 5000, label: '5 seconds' },
    { value: 8000, label: '8 seconds' },
    { value: 10000, label: '10 seconds' }
  ];

  const photoCountOptions = [
    { value: 1, label: '1 Photo', description: 'Single shot' },
    { value: 2, label: '2 Photos', description: 'Double take' },
    { value: 3, label: '3 Photos', description: 'Classic strip' },
    { value: 4, label: '4 Photos', description: 'Quad layout' },
    { value: 5, label: '5 Photos', description: 'Extended strip' },
    { value: 6, label: '6 Photos', description: 'Maximum shots' }
  ];

  const captureIntervalOptions = [
    { value: 2000, label: '2 seconds', description: 'Moderate pace' },
    { value: 3000, label: '3 seconds', description: 'Standard timing' },
    { value: 4000, label: '4 seconds', description: 'Relaxed timing' },
    { value: 5000, label: '5 seconds', description: 'Slow pace' }
  ];

  // Fetch capture settings from API
  const fetchCaptureSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3002/api/admin/settings/capture');
      const data = await response.json();
      
      if (data.success) {
        setCaptureSettings(data.captureSettings);
      }
    } catch (error) {
      console.error('Error fetching capture settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch presets
  const fetchPresets = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings/capture/presets');
      const data = await response.json();
      
      if (data.success) {
        setPresets(data.presets);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  // Update capture settings API
  const updateCaptureSettings = async (newSettings) => {
    try {
      setIsSaving(true);
      const response = await fetch('http://localhost:3002/api/admin/settings/capture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings)
      });
      
      const data = await response.json();
      if (data.success) {
        setCaptureSettings(prev => ({ ...prev, ...newSettings }));
        // Also update parent settings for backward compatibility
        Object.keys(newSettings).forEach(key => {
          if (onUpdate && typeof onUpdate === 'function') {
            onUpdate(key, newSettings[key]);
          }
        });
        
        // Validate new settings
        validateSettings({ ...captureSettings, ...newSettings });
      }
    } catch (error) {
      console.error('Error updating capture settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Validate settings
  const validateSettings = async (settingsToValidate) => {
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings/capture/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToValidate)
      });
      
      const data = await response.json();
      if (data.success) {
        setValidation(data);
      }
    } catch (error) {
      console.error('Error validating settings:', error);
    }
  };

  // Apply preset
  const applyPreset = async (presetId) => {
    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:3002/api/admin/settings/capture/presets/${presetId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        setCaptureSettings(prev => ({ ...prev, ...data.preset.settings }));
        validateSettings(data.preset.settings);
      }
    } catch (error) {
      console.error('Error applying preset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCaptureSettings();
    fetchPresets();
  }, []);

  // Validate settings when they change
  useEffect(() => {
    if (captureSettings.autoCapture !== undefined) {
      validateSettings(captureSettings);
    }
  }, [captureSettings]);

  const handleCountdownChange = (value) => {
    updateCaptureSettings({ countdownDuration: value });
  };

  const handlePhotoCountChange = (value) => {
    updateCaptureSettings({ photoCount: value });
  };

  const handleAutoCaptureToggle = () => {
    updateCaptureSettings({ autoCapture: !captureSettings.autoCapture });
  };

  const handleIntervalChange = (value) => {
    updateCaptureSettings({ captureInterval: value });
  };

  const calculateTotalTime = () => {
    const totalTime = (captureSettings.photoCount * (captureSettings.countdownDuration + captureSettings.captureInterval)) / 1000;
    return totalTime.toFixed(1);
  };

  return (
    <div className="capture-settings">
      <style>{`
        .capture-settings {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }

        .capture-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-right: 4px;
        }

        .capture-content::-webkit-scrollbar {
          display: none;
        }

        .setting-section {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          flex-shrink: 0;
        }

        .setting-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }

        .setting-description {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 16px;
          line-height: 1.4;
          font-size: 13px;
        }

        .auto-capture-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auto-capture-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .auto-capture-info {
          flex: 1;
        }

        .auto-capture-details h4 {
          color: white;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .auto-capture-details p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          line-height: 1.3;
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 26px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 13px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
        }

        .toggle-switch.enabled {
          background: linear-gradient(135deg, #46ff90, #25D366);
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.enabled .toggle-slider {
          transform: translateX(22px);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .option-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 16px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
        }

        .option-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .option-card.active {
          border-color: #FF0080;
          background: rgba(255, 0, 128, 0.1);
          box-shadow: 0 4px 16px rgba(255, 0, 128, 0.2);
        }

        .option-label {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .option-description {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
        }

        .active-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
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
          margin: 16px 0;
        }

        .range-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .range-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .range-value {
          background: rgba(255, 0, 128, 0.15);
          color: #FF0080;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .range-slider {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(255, 0, 128, 0.3);
        }

        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #FF0080, #7928CA);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(255, 0, 128, 0.3);
        }

        .preview-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
          flex-shrink: 0;
        }

        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }

        .preview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 16px 12px;
          text-align: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-preview {
          margin-top: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .timeline-title {
          font-size: 14px;
          color: white;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .timeline-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          margin: 16px 0;
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
          border: 2px solid #FF0080;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
          color: #FF0080;
          z-index: 2;
          position: relative;
        }

        .timeline-step:nth-child(2) { border-color: #FF0080; }
        .timeline-step:nth-child(3) { border-color: #7928CA; }
        .timeline-step:nth-child(4) { border-color: #46C3FF; }
        .timeline-step:nth-child(5) { border-color: #46ff90; }
        .timeline-step:nth-child(6) { border-color: #FFD700; }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .timeline-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          max-width: 50px;
          line-height: 1.2;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
          }

          .preview-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .timeline-steps {
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
          }

          .timeline-line {
            display: none;
          }

          .timeline-labels {
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
          }
        }
      `}</style>

      <div className="capture-content">
        {/* Loading State */}
        {isLoading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <span>Loading capture settings...</span>
          </div>
        )}

        {/* Validation Warnings */}
        {validation && validation.validation.warnings.length > 0 && (
          <div className="validation-section warning">
            <div className="validation-title">⚠️ Warnings</div>
            {validation.validation.warnings.map((warning, index) => (
              <div key={index} className="validation-item">{warning}</div>
            ))}
            {validation.validation.recommendations.length > 0 && (
              <div className="validation-recommendations">
                <strong>Recommendations:</strong>
                {validation.validation.recommendations.map((rec, index) => (
                  <div key={index} className="validation-item">• {rec}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auto Capture Toggle */}
        <div className="setting-section">
          <div className="setting-title">Auto Capture Mode</div>
          <div className="setting-description">
            Enable automatic photo capture with timed intervals, or disable for manual control.
          </div>
          
          <div className="auto-capture-toggle" onClick={handleAutoCaptureToggle}>
            <div className="auto-capture-info">
              <div className="auto-capture-details">
                <h4>{captureSettings.autoCapture ? 'Auto Capture ON' : 'Manual Capture'}</h4>
                <p>
                  {captureSettings.autoCapture 
                    ? 'Photos captured automatically with countdown' 
                    : 'User triggers each photo manually'
                  }
                </p>
              </div>
            </div>
            
            <div className={`toggle-switch ${captureSettings.autoCapture ? 'enabled' : ''} ${isSaving ? 'disabled' : ''}`}>
              <div className="toggle-slider"></div>
              {isSaving && <div className="toggle-loading">⟳</div>}
            </div>
          </div>
        </div>

        {/* Photo Count */}
        <div className="setting-section">
          <div className="setting-title">Number of Photos</div>
          <div className="setting-description">
            Select how many photos will be taken in each session. More photos create longer strips.
          </div>

          <div className="options-grid">
            {photoCountOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${captureSettings.photoCount === option.value ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                onClick={() => !isSaving && handlePhotoCountChange(option.value)}
              >
                <div className="active-indicator">
                  <span style={{ color: 'white', fontSize: '8px' }}>✓</span>
                </div>
                <div className="option-label">{option.label}</div>
                <div className="option-description">{option.description}</div>
                {isSaving && <div className="option-loading">⟳</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="setting-section">
          <div className="setting-title">Countdown Duration</div>
          <div className="setting-description">
            Set the countdown timer before each photo is captured. Gives users time to pose.
          </div>

          <div className="options-grid">
            {countdownOptions.map(option => (
              <div
                key={option.value}
                className={`option-card ${captureSettings.countdownDuration === option.value ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                onClick={() => !isSaving && handleCountdownChange(option.value)}
              >
                <div className="active-indicator">
                  <span style={{ color: 'white', fontSize: '8px' }}>✓</span>
                </div>
                <div className="option-label">{option.label}</div>
                {isSaving && <div className="option-loading">⟳</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Interval Between Photos */}
        {captureSettings.photoCount > 1 && (
          <div className="setting-section">
            <div className="setting-title">Interval Between Photos</div>
            <div className="setting-description">
              Time gap between consecutive photos. Allows users to change poses.
            </div>

            <div className="custom-range">
              <div className="range-label">
                <span className="range-title">Capture Interval</span>
                <span className="range-value">{captureSettings.captureInterval / 1000}s</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="1000"
                max="10000"
                step="500"
                value={captureSettings.captureInterval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                disabled={isSaving}
              />
            </div>

            <div className="options-grid">
              {captureIntervalOptions.map(option => (
                <div
                  key={option.value}
                  className={`option-card ${captureSettings.captureInterval === option.value ? 'active' : ''} ${isSaving ? 'disabled' : ''}`}
                  onClick={() => !isSaving && handleIntervalChange(option.value)}
                >
                  <div className="active-indicator">
                    <span style={{ color: 'white', fontSize: '8px' }}>✓</span>
                  </div>
                  <div className="option-label">{option.label}</div>
                  <div className="option-description">{option.description}</div>
                  {isSaving && <div className="option-loading">⟳</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="preview-section">
          <div className="preview-title">Session Preview</div>
          
          <div className="preview-stats">
            <div className="stat-card">
              <div className="stat-value">{captureSettings.photoCount}</div>
              <div className="stat-label">Photos</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{captureSettings.countdownDuration / 1000}s</div>
              <div className="stat-label">Countdown</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{captureSettings.captureInterval / 1000}s</div>
              <div className="stat-label">Interval</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{calculateTotalTime()}s</div>
              <div className="stat-label">Total Time</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{captureSettings.autoCapture ? 'Auto' : 'Manual'}</div>
              <div className="stat-label">Mode</div>
            </div>
          </div>

          {captureSettings.photoCount > 1 && (
            <div className="timeline-preview">
              <div className="timeline-title">Session Timeline</div>
              <div className="timeline-steps">
                <div className="timeline-line"></div>
                {Array.from({ length: captureSettings.photoCount }, (_, i) => (
                  <div key={i} className="timeline-step">{i + 1}</div>
                ))}
              </div>
              <div className="timeline-labels">
                {Array.from({ length: captureSettings.photoCount }, (_, i) => (
                  <div key={i} className="timeline-label">
                    Photo {i + 1}<br />
                    {i === 0 ? `${captureSettings.countdownDuration / 1000}s` : `${((captureSettings.countdownDuration + i * captureSettings.captureInterval) / 1000).toFixed(1)}s`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptureSettings;