import React, { useState } from 'react';

const EffectsManager = ({ settings, onUpdate }) => {
  const [editingEffect, setEditingEffect] = useState(null);
  const [newEffect, setNewEffect] = useState({
    id: '',
    name: '',
    prompt: '',
    enabled: true
  });

  const predefinedEffects = [
    { id: 'normal', name: 'Normal', prompt: '', icon: '📸' },
    { id: 'vintage', name: 'Vintage', prompt: 'vintage style, sepia tone, old film aesthetic', icon: '📸' },
    { id: 'bw', name: 'Black & White', prompt: 'black and white, monochrome, artistic photography', icon: '⚫' },
    { id: 'vivid', name: 'Vivid Colors', prompt: 'vibrant colors, saturated, high contrast, pop art style', icon: '🌈' },
    { id: 'manga', name: 'Manga Style', prompt: 'manga style, anime art, vibrant colors, comic book illustration', icon: '🎨' },
    { id: 'pixar', name: 'Pixar Theme', prompt: 'Disney-Pixar style 3D animated characters, smooth rendering, expressive eyes, vibrant colors, playful animation-style lighting', icon: '🎭' },
    { id: 'ghibli', name: 'Studio Ghibli', prompt: 'studio ghibli style, anime, soft colors, dreamy atmosphere, hand-drawn animation', icon: '🌸' },
    { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic, high tech, dark atmosphere', icon: '🔮' },
    { id: 'watercolor', name: 'Watercolor', prompt: 'watercolor painting style, soft brushstrokes, artistic, dreamy colors', icon: '🎨' },
    { id: 'cartoon', name: 'Cartoon', prompt: 'cartoon style, animated, bright colors, exaggerated features, playful', icon: '😄' }
  ];

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
          max-width: 1000px;
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

        .current-effects {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .effects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .effect-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .effect-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .effect-card.disabled {
          opacity: 0.6;
          filter: grayscale(0.5);
        }

        .effect-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 20px;
        }

        .effect-info {
          flex: 1;
        }

        .effect-name {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .effect-id {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-family: monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .effect-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .toggle-switch {
          position: relative;
          width: 60px;
          height: 30px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
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
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .toggle-switch.enabled .toggle-slider {
          transform: translateX(30px);
        }

        .effect-prompt {
          margin-bottom: 15px;
        }

        .prompt-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .prompt-textarea {
          width: 100%;
          min-height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 12px;
          color: white;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .prompt-textarea:focus {
          outline: none;
          border-color: #FF0080;
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.2);
        }

        .prompt-textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .effect-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
        }

        .prompt-length {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .remove-btn {
          background: rgba(255, 70, 70, 0.2);
          color: #ff4646;
          border: 1px solid rgba(255, 70, 70, 0.3);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: rgba(255, 70, 70, 0.3);
        }

        .add-effect-section {
          background: rgba(255, 255, 255, 0.03);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .add-effect-form {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr auto;
          gap: 15px;
          align-items: end;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 12px;
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #FF0080;
          background: rgba(255, 255, 255, 0.15);
        }

        .add-btn {
          background: linear-gradient(135deg, #FF0080, #7928CA);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 0, 128, 0.3);
        }

        .predefined-effects {
          margin-top: 40px;
        }

        .predefined-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .predefined-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .predefined-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .predefined-card.exists {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: rgba(70, 255, 144, 0.3);
          background: rgba(70, 255, 144, 0.1);
        }

        .predefined-icon {
          font-size: 32px;
          margin-bottom: 10px;
          display: block;
        }

        .predefined-name {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 5px;
        }

        .predefined-prompt {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .effects-grid {
            grid-template-columns: 1fr;
          }

          .add-effect-form {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .predefined-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
      `}</style>

      <div className="section-description">
        <h3>🎨 AI Effects & Prompts Management</h3>
        <p>
          Configure photo effects and their corresponding AI prompts. Each effect uses advanced AI to transform 
          captured photos. You can enable/disable effects, customize prompts, and add new effects. 
          The prompts are sent to Black Forest AI's Flux model for image transformation.
        </p>
      </div>

      <div className="current-effects">
        <h3 className="section-title">
          ⚡ Active Effects ({settings.effects.filter(e => e.enabled).length}/{settings.effects.length})
        </h3>
        
        <div className="effects-grid">
          {settings.effects.map(effect => (
            <div key={effect.id} className={`effect-card ${!effect.enabled ? 'disabled' : ''}`}>
              <div className="effect-header">
                <div className="effect-info">
                  <div className="effect-name">
                    {effect.name}
                    <span className="effect-id">#{effect.id}</span>
                  </div>
                </div>
                
                <div className="effect-controls">
                  <div 
                    className={`toggle-switch ${effect.enabled ? 'enabled' : ''}`}
                    onClick={() => handleEffectToggle(effect.id)}
                  >
                    <div className="toggle-slider"></div>
                  </div>
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
                  {effect.prompt.length}/500 characters
                </span>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveEffect(effect.id)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="add-effect-section">
        <h3 className="section-title">➕ Add New Effect</h3>
        
        <div className="add-effect-form">
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

          <div className="form-group">
            <label className="form-label">Effect ID</label>
            <input
              type="text"
              className="form-input"
              value={newEffect.id}
              onChange={(e) => setNewEffect({...newEffect, id: e.target.value})}
              placeholder="auto-generated"
            />
          </div>

          <button className="add-btn" onClick={handleAddEffect}>
            ➕ Add Effect
          </button>
        </div>
      </div>

      <div className="predefined-effects">
        <h3 className="section-title">
          📦 Predefined Effects Library
        </h3>
        
        <div className="predefined-grid">
          {predefinedEffects.map(effect => {
            const exists = settings.effects.some(e => e.id === effect.id);
            return (
              <div
                key={effect.id}
                className={`predefined-card ${exists ? 'exists' : ''}`}
                onClick={() => !exists && handleAddPredefinedEffect(effect)}
              >
                <span className="predefined-icon">{effect.icon}</span>
                <div className="predefined-name">{effect.name}</div>
                <div className="predefined-prompt">
                  {exists ? '✅ Already Added' : effect.prompt.substring(0, 60) + '...'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EffectsManager;