import React from 'react';

const OrientationSettings = ({ settings, onUpdate }) => {
  const orientationOptions = [
    { 
      id: 'portrait', 
      name: 'Portrait', 
      description: 'Vertical orientation (9:16 ratio)', 
      dimensions: '720 × 1280'
    },
    { 
      id: 'landscape', 
      name: 'Landscape', 
      description: 'Horizontal orientation (16:9 ratio)', 
      dimensions: '1280 × 720'
    },
    { 
      id: 'square', 
      name: 'Square', 
      description: 'Perfect square (1:1 ratio)', 
      dimensions: '1080 × 1080'
    }
  ];

  const handleOrientationChange = async (orientation) => {
    await onUpdate('orientation', orientation);
  };

  return (
    <div className="orientation-settings">
      <style>{`
        .orientation-settings {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .orientation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .orientation-card {
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
        }

        .orientation-card:hover {
          background: rgba(0, 255, 255, 0.12);
          transform: translateY(-2px);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
        }

        .orientation-card.active {
          border-color: #00FFFF;
          background: rgba(0, 255, 255, 0.15);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.4),
            0 8px 32px rgba(0, 255, 255, 0.3);
        }

        .orientation-name {
          font-size: 18px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 0 10px #00FFFF;
        }

        .orientation-description {
          font-size: 13px;
          color: #40E0D0;
          margin-bottom: 12px;
          line-height: 1.4;
          text-shadow: 0 0 5px #40E0D0;
        }

        .orientation-dimensions {
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 11px;
          color: #00FFFF;
          font-family: 'Orbitron', 'Monaco', monospace;
          display: inline-block;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
          text-shadow: 0 0 5px #00FFFF;
        }

        .active-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }

        .orientation-card.active .active-indicator {
          opacity: 1;
          transform: scale(1);
        }

        .preview-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .preview-frame {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(121, 40, 202, 0.15));
          border: 1px solid rgba(255, 0, 128, 0.3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .preview-frame.portrait {
          width: 60px;
          height: 100px;
        }

        .preview-frame.landscape {
          width: 100px;
          height: 60px;
        }

        .preview-frame.square {
          width: 80px;
          height: 80px;
        }

        .preview-info {
          flex: 1;
        }

        .preview-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }

        .preview-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .preview-detail {
          text-align: left;
        }

        .preview-detail-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .preview-detail-value {
          font-size: 14px;
          color: white;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .orientation-grid {
            grid-template-columns: 1fr;
          }

          .preview-section {
            flex-direction: column;
            text-align: center;
          }

          .preview-details {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>

      <div className="orientation-grid">
        {orientationOptions.map(option => (
          <div
            key={option.id}
            className={`orientation-card ${settings.orientation === option.id ? 'active' : ''}`}
            onClick={() => handleOrientationChange(option.id)}
          >
            <div className="active-indicator">
              <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
            </div>
            
            <h4 className="orientation-name">{option.name}</h4>
            <p className="orientation-description">{option.description}</p>
            <span className="orientation-dimensions">{option.dimensions}</span>
          </div>
        ))}
      </div>

      <div className="preview-section">
        <div className={`preview-frame ${settings.orientation}`}>
          <span>Preview</span>
        </div>
        
        <div className="preview-info">
          <h3 className="preview-title">Live Preview</h3>
          <div className="preview-details">
            <div className="preview-detail">
              <div className="preview-detail-label">Selected</div>
              <div className="preview-detail-value">
                {orientationOptions.find(o => o.id === settings.orientation)?.name}
              </div>
            </div>
            <div className="preview-detail">
              <div className="preview-detail-label">Dimensions</div>
              <div className="preview-detail-value">
                {orientationOptions.find(o => o.id === settings.orientation)?.dimensions}
              </div>
            </div>
            <div className="preview-detail">
              <div className="preview-detail-label">Ratio</div>
              <div className="preview-detail-value">
                {settings.orientation === 'portrait' ? '9:16' : 
                 settings.orientation === 'landscape' ? '16:9' : '1:1'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrientationSettings;