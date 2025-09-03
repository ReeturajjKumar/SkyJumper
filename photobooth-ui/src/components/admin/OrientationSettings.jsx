import React from 'react';

const OrientationSettings = ({ settings, onUpdate }) => {
  const orientationOptions = [
    { 
      id: 'portrait', 
      name: 'Portrait', 
      description: 'Vertical orientation (9:16 ratio)', 
      icon: '📱',
      dimensions: '720 × 1280'
    },
    { 
      id: 'landscape', 
      name: 'Landscape', 
      description: 'Horizontal orientation (16:9 ratio)', 
      icon: '📺',
      dimensions: '1280 × 720'
    },
    { 
      id: 'square', 
      name: 'Square', 
      description: 'Perfect square (1:1 ratio)', 
      icon: '⬜',
      dimensions: '1080 × 1080'
    }
  ];

  const handleOrientationChange = (orientation) => {
    onUpdate('orientation', orientation);
  };

  return (
    <div className="orientation-settings">
      <style>{`
        .orientation-settings {
          max-width: 800px;
        }

        .settings-description {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 40px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .settings-description h3 {
          color: white;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }

        .orientation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .orientation-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .orientation-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.1), rgba(121, 40, 202, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .orientation-card:hover::before {
          opacity: 1;
        }

        .orientation-card.active {
          border-color: #FF0080;
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.15), rgba(121, 40, 202, 0.15));
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(255, 0, 128, 0.2);
        }

        .orientation-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .orientation-icon {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
          filter: grayscale(0.5);
          transition: filter 0.3s ease;
        }

        .orientation-card.active .orientation-icon,
        .orientation-card:hover .orientation-icon {
          filter: grayscale(0);
        }

        .orientation-name {
          font-size: 22px;
          font-weight: 600;
          color: white;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .orientation-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 15px;
          position: relative;
          z-index: 1;
        }

        .orientation-dimensions {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-family: monospace;
          display: inline-block;
          position: relative;
          z-index: 1;
        }

        .active-indicator {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #46ff90, #25D366);
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
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
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

        .preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          position: relative;
        }

        .preview-frame {
          background: linear-gradient(135deg, rgba(255, 0, 128, 0.2), rgba(121, 40, 202, 0.2));
          border: 2px solid rgba(255, 0, 128, 0.3);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .preview-frame.portrait {
          width: 120px;
          height: 200px;
        }

        .preview-frame.landscape {
          width: 200px;
          height: 120px;
        }

        .preview-frame.square {
          width: 160px;
          height: 160px;
        }

        .preview-frame::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.1) 50%, transparent 51%);
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .preview-info {
          text-align: center;
          margin-top: 20px;
        }

        .preview-details {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 15px;
        }

        .preview-detail {
          text-align: center;
        }

        .preview-detail-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .preview-detail-value {
          font-size: 16px;
          color: white;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .orientation-grid {
            grid-template-columns: 1fr;
          }

          .preview-details {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>

      <div className="settings-description">
        <h3>📱 Photo Orientation Configuration</h3>
        <p>
          Choose the orientation for captured photos. This setting affects both the camera preview 
          and the final photo output. The orientation will determine how photos are displayed 
          in the photo strip and affects the AI prompt processing.
        </p>
      </div>

      <div className="orientation-grid">
        {orientationOptions.map(option => (
          <div
            key={option.id}
            className={`orientation-card ${settings.orientation === option.id ? 'active' : ''}`}
            onClick={() => handleOrientationChange(option.id)}
          >
            <div className="active-indicator">
              <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
            </div>
            
            <span className="orientation-icon">{option.icon}</span>
            <h4 className="orientation-name">{option.name}</h4>
            <p className="orientation-description">{option.description}</p>
            <span className="orientation-dimensions">{option.dimensions}</span>
          </div>
        ))}
      </div>

      <div className="preview-section">
        <h3 className="preview-title">
          👁️ Live Preview
        </h3>
        
        <div className="preview-container">
          <div className={`preview-frame ${settings.orientation}`}>
            <span>Photo Preview</span>
          </div>
        </div>

        <div className="preview-info">
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