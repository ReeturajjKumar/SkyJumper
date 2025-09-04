import React, { useState, useEffect } from 'react';

const EffectsManager = ({ settings, onUpdate }) => {
  const [editingEffect, setEditingEffect] = useState(null);
  const [newEffect, setNewEffect] = useState({
    id: '',
    name: '',
    prompt: '',
    enabled: true
  });
  const [predefinedEffects, setPredefinedEffects] = useState([]);
  const [loadingPredefined, setLoadingPredefined] = useState(true);
  const [predefinedError, setPredefinedError] = useState(null);

  // Fetch enabled effects from settings as predefined effects
  const fetchPredefinedEffects = async () => {
    try {
      setLoadingPredefined(true);
      setPredefinedError(null);
      
      const response = await fetch('http://localhost:3002/api/admin/settings');
      const data = await response.json();
      
      if (data.success && data.settings.effects) {
        // Get only enabled effects from settings
        const enabledEffects = data.settings.effects.filter(effect => effect.enabled);
        setPredefinedEffects(enabledEffects);
      } else {
        setPredefinedError('Failed to load effects from database');
      }
    } catch (error) {
      console.error('Error fetching effects:', error);
      setPredefinedError('Failed to connect to server');
    } finally {
      setLoadingPredefined(false);
    }
  };

  // Load predefined effects on component mount
  useEffect(() => {
    fetchPredefinedEffects();
  }, []);

  const handleEffectToggle = (effectId) => {
    const updatedEffects = settings.effects.map(effect => 
      effect.id === effectId 
        ? { ...effect, enabled: !effect.enabled }
        : effect
    );
    onUpdate('effects', updatedEffects);
  };

  const handleEffectUpdate = (effectId, field, value) => {
    const updatedEffects = settings.effects.map(effect => 
      effect.id === effectId 
        ? { ...effect, [field]: value }
        : effect
    );
    onUpdate('effects', updatedEffects);
  };

  const handleAddEffect = () => {
    if (!newEffect.name.trim() || !newEffect.id.trim()) return;
    
    const updatedEffects = [...settings.effects, { ...newEffect }];
    onUpdate('effects', updatedEffects);
    setNewEffect({ id: '', name: '', prompt: '', enabled: true });
  };

  const handleRemoveEffect = (effectId) => {
    const updatedEffects = settings.effects.filter(effect => effect.id !== effectId);
    onUpdate('effects', updatedEffects);
  };

  const handleAddPredefinedEffect = (predefinedEffect) => {
    const exists = settings.effects.some(effect => effect.id === predefinedEffect.id);
    if (exists) return;

    const updatedEffects = [...settings.effects, {
      ...predefinedEffect,
      enabled: true
    }];
    onUpdate('effects', updatedEffects);
  };

  const generateId = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  };

  return (
    <div className="effects-manager">
      <style>{`
        .effects-manager {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }

        .effects-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow: hidden;
        }

        .effects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .effects-title {
          font-size: 18px;
          font-weight: 700;
          color: #00FFFF;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 0 10px #00FFFF;
        }

        .effects-count {
          background: rgba(0, 255, 255, 0.15);
          color: #00FFFF;
          border: 1px solid rgba(0, 255, 255, 0.3);
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-shadow: 0 0 5px #00FFFF;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .effects-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-right: 4px;
        }

        .effects-grid::-webkit-scrollbar {
          display: none;
        }

        .effect-card {
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          height: fit-content;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .effect-card:hover {
          background: rgba(0, 255, 255, 0.12);
          border-color: rgba(0, 255, 255, 0.4);
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.2);
        }

        .effect-card.disabled {
          opacity: 0.5;
          filter: grayscale(0.3);
        }

        .effect-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .effect-info {
          flex: 1;
        }

        .effect-name {
          font-size: 16px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 0 8px #00FFFF;
        }

        .effect-id {
          font-size: 11px;
          color: #40E0D0;
          font-family: 'SF Mono', 'Monaco', monospace;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 8px;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
        }

        .toggle-switch.enabled {
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .toggle-switch.enabled .toggle-slider {
          transform: translateX(20px);
        }

        .effect-prompt {
          margin-bottom: 12px;
        }

        .prompt-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 6px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .prompt-textarea {
          width: 100%;
          height: 70px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px;
          color: white;
          font-size: 13px;
          font-family: inherit;
          resize: none;
          transition: all 0.3s ease;
          line-height: 1.4;
        }

        .prompt-textarea:focus {
          outline: none;
          border-color: #00FFFF;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px #00FFFF;
        }

        .prompt-textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .effect-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .prompt-length {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .remove-btn {
          background: rgba(255, 70, 70, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 70, 70, 0.3);
          padding: 6px 12px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: rgba(255, 70, 70, 0.25);
          transform: translateY(-1px);
        }

        .add-effect-section {
          background: rgba(0, 255, 255, 0.05);
          border: 1px dashed rgba(0, 255, 255, 0.3);
          border-radius: 12px;
          padding: 20px;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.05);
        }

        .add-title {
          font-size: 14px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 0 8px #00FFFF;
        }

        .add-form {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 12px;
          align-items: end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px;
          color: white;
          font-size: 13px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #00FFFF;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px #00FFFF;
        }

        .add-btn {
          background: linear-gradient(135deg, #00FFFF, #40E0D0);
          color: #000;
          border: 2px solid #00FFFF;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s ease;
          height: fit-content;
        }

        .add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.6),
            0 4px 12px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }

        .predefined-section {
          flex-shrink: 0;
        }

        .predefined-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .predefined-title {
          font-size: 14px;
          font-weight: 700;
          color: #00FFFF;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 0 0 8px #00FFFF;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .predefined-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .predefined-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .predefined-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .predefined-card.exists {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: rgba(0, 255, 255, 0.3);
          background: rgba(0, 255, 255, 0.05);
        }

        .predefined-name {
          font-size: 14px;
          font-weight: 700;
          color: #00FFFF;
          margin-bottom: 4px;
          text-shadow: 0 0 8px #00FFFF;
        }

        .predefined-status {
          font-size: 11px;
          color: #00FFFF;
          font-weight: 600;
          text-shadow: 0 0 5px #00FFFF;
        }

        .predefined-prompt {
          font-size: 11px;
          color: #40E0D0;
          margin: 6px 0;
          line-height: 1.3;
          min-height: 30px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 0 5px #40E0D0;
        }

        .enabled-effect {
          border-color: rgba(0, 255, 255, 0.3);
          background: rgba(0, 255, 255, 0.05);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
        }

        .enabled-effect:hover {
          background: rgba(0, 255, 255, 0.1);
          cursor: default;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }

        .predefined-loading {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top: 2px solid #00FFFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .predefined-error {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .error-icon {
          font-size: 24px;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 14px;
        }

        .retry-btn, .seed-btn {
          background: rgba(0, 255, 255, 0.15);
          color: #00FFFF;
          border: 1px solid rgba(0, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px #00FFFF;
        }

        .retry-btn:hover, .seed-btn:hover {
          background: rgba(0, 255, 255, 0.25);
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
        }

        .predefined-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .effects-grid {
            grid-template-columns: 1fr;
          }

          .add-form {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .predefined-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }
      `}</style>

      <div className="effects-content">
        <div className="effects-header">
          <div className="effects-title">AI Effects & Prompts</div>
          <div className="effects-count">
            {settings.effects.filter(e => e.enabled).length} / {settings.effects.length} Active
          </div>
        </div>
        
        <div className="effects-grid">
          {settings.effects.map(effect => (
            <div key={effect.id} className={`effect-card ${!effect.enabled ? 'disabled' : ''}`}>
              <div className="effect-header">
                <div className="effect-info">
                  <div className="effect-name">{effect.name}</div>
                  <span className="effect-id">#{effect.id}</span>
                </div>
                
                <div 
                  className={`toggle-switch ${effect.enabled ? 'enabled' : ''}`}
                  onClick={() => handleEffectToggle(effect.id)}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>

              <div className="effect-prompt">
                <div className="prompt-label">AI Prompt</div>
                <textarea
                  className="prompt-textarea"
                  value={effect.prompt}
                  onChange={(e) => handleEffectUpdate(effect.id, 'prompt', e.target.value)}
                  placeholder="Enter AI prompt for this effect..."
                  maxLength={500}
                />
              </div>

              <div className="effect-actions">
                <span className="prompt-length">
                  {effect.prompt.length}/500
                </span>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveEffect(effect.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="add-effect-section">
        <div className="add-title">Add New Effect</div>
        
        <div className="add-form">
          <div className="form-group">
            <label className="form-label">Effect Name</label>
            <input
              type="text"
              className="form-input"
              value={newEffect.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewEffect({
                  ...newEffect, 
                  name,
                  id: generateId(name)
                });
              }}
              placeholder="e.g., Retro Style"
            />
          </div>

          <div className="form-group">
            <label className="form-label">AI Prompt</label>
            <input
              type="text"
              className="form-input"
              value={newEffect.prompt}
              onChange={(e) => setNewEffect({...newEffect, prompt: e.target.value})}
              placeholder="e.g., retro style, 80s aesthetic, neon colors"
            />
          </div>

          <button className="add-btn" onClick={handleAddEffect}>
            Add Effect
          </button>
        </div>
      </div>

      <div className="predefined-section">
        <div className="predefined-header">
          <div className="predefined-title">Enabled Effects from Database</div>
          <button 
            className="refresh-btn"
            onClick={fetchPredefinedEffects}
            disabled={loadingPredefined}
          >
            {loadingPredefined ? '⟳' : '↻'} Refresh
          </button>
        </div>
        
        <div className="predefined-grid">
          {loadingPredefined ? (
            <div className="predefined-loading">
              <div className="loading-spinner"></div>
              <span>Loading effects...</span>
            </div>
          ) : predefinedError ? (
            <div className="predefined-error">
              <span className="error-icon">⚠️</span>
              <span className="error-message">{predefinedError}</span>
              <button className="retry-btn" onClick={fetchPredefinedEffects}>
                Retry
              </button>
            </div>
          ) : predefinedEffects.length === 0 ? (
            <div className="predefined-empty">
              <span>No enabled effects in database</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>
                Add and enable effects above to see them here
              </span>
            </div>
          ) : (
            predefinedEffects.map(effect => {
              return (
                <div
                  key={effect.id}
                  className="predefined-card enabled-effect"
                  title={effect.prompt}
                >
                  <div className="predefined-name">{effect.name}</div>
                  <div className="predefined-prompt">
                    {effect.prompt.length > 50 ? 
                      `${effect.prompt.substring(0, 50)}...` : 
                      effect.prompt
                    }
                  </div>
                  <div className="predefined-status">
                    ✓ Enabled
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EffectsManager;