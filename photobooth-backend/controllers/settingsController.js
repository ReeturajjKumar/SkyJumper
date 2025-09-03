const Settings = require('../models/Settings');

class SettingsController {
  // Helper method to get enabled effects count
  static getEnabledEffectsCount(effects) {
    return effects.filter(effect => effect.enabled).length;
  }

  // Helper method to get enabled effects list
  static getEnabledEffectsList(effects) {
    return effects.filter(effect => effect.enabled).map(e => ({ id: e.id, name: e.name }));
  }
  // Get settings
  static async getSettings(req, res) {
    try {
      let settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        // Create minimal default settings if none exist
        settings = new Settings({
          settingsId: 'main',
          orientation: 'portrait',
          effects: [], // Empty effects array - must be created via admin panel
          autoCapture: true,
          captureInterval: 3000,
          photoCount: 3
        });
        await settings.save();
        console.log('✅ Created minimal default settings - effects must be added via admin panel');
      }
      
      res.json({ 
        success: true, 
        settings: settings.toObject()
      });
      
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to load settings',
        error: error.message
      });
    }
  }

  // Save settings
  static async saveSettings(req, res) {
    try {
      const newSettings = req.body;
      
      // Validate required fields
      if (!newSettings.orientation) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: orientation'
        });
      }

      // Ensure effects array exists (can be empty)
      if (!Array.isArray(newSettings.effects)) {
        newSettings.effects = [];
      }

      // Auto-rotate effects if more than 3 are enabled
      const enabledEffects = newSettings.effects.filter(effect => effect.enabled);
      if (enabledEffects.length > 3) {
        console.log(`🔄 Auto-rotating effects: ${enabledEffects.length} enabled, keeping first 3`);
        
        // Disable effects beyond the first 3
        let disabledCount = 0;
        for (let i = 0; i < newSettings.effects.length; i++) {
          if (newSettings.effects[i].enabled && disabledCount >= 3) {
            newSettings.effects[i].enabled = false;
            console.log(`🔄 Auto-disabled effect: ${newSettings.effects[i].name}`);
          } else if (newSettings.effects[i].enabled) {
            disabledCount++;
          }
        }
      }

      // Update settings with validation
      const updatedSettings = await Settings.findOneAndUpdate(
        { settingsId: 'main' },
        {
          orientation: newSettings.orientation,
          effects: newSettings.effects,
          autoCapture: newSettings.autoCapture,
          captureInterval: newSettings.captureInterval,
          photoCount: newSettings.photoCount,
          updatedBy: 'admin',
          lastUpdated: new Date()
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );

      console.log(`✅ Settings updated: ${newSettings.orientation} orientation`);
      
      res.json({ 
        success: true, 
        message: 'Settings saved successfully',
        settings: updatedSettings.toObject()
      });
      
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save settings',
        error: error.message
      });
    }
  }

  // Update specific setting field
  static async updateSetting(req, res) {
    try {
      const { field, value } = req.body;
      
      if (!field || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: field and value'
        });
      }

      const updateObj = {
        [field]: value,
        lastUpdated: new Date(),
        updatedBy: 'admin'
      };

      const updatedSettings = await Settings.findOneAndUpdate(
        { settingsId: 'main' },
        updateObj,
        { 
          new: true,
          runValidators: true
        }
      );

      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      console.log(`✅ Updated ${field}: ${value}`);
      
      res.json({ 
        success: true, 
        message: `${field} updated successfully`,
        settings: updatedSettings.toObject()
      });
      
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update setting',
        error: error.message
      });
    }
  }

  // Get camera orientation constraints
  static async getCameraOrientation(req, res) {
    try {
      const settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      // Return camera constraints based on orientation
      const constraints = {
        portrait: { width: 720, height: 1280, aspectRatio: 9/16 },
        landscape: { width: 1280, height: 720, aspectRatio: 16/9 },
        square: { width: 1080, height: 1080, aspectRatio: 1 }
      };

      res.json({
        success: true,
        orientation: settings.orientation,
        constraints: constraints[settings.orientation]
      });
      
    } catch (error) {
      console.error('❌ Error getting camera orientation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get camera orientation',
        error: error.message
      });
    }
  }

  // Reset settings to default
  static async resetSettings(req, res) {
    try {
      const defaultSettings = {
        settingsId: 'main',
        orientation: 'portrait',
        effects: [], // Empty - effects must be created via admin panel
        autoCapture: true,
        captureInterval: 3000,
        photoCount: 3,
        updatedBy: 'admin',
        lastUpdated: new Date()
      };

      const resetSettings = await Settings.findOneAndUpdate(
        { settingsId: 'main' },
        defaultSettings,
        { upsert: true, new: true }
      );

      console.log('✅ Settings reset to defaults');

      res.json({
        success: true,
        message: 'Settings reset to defaults',
        settings: resetSettings.toObject()
      });

    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset settings',
        error: error.message
      });
    }
  }

  // Add new effect
  static async addEffect(req, res) {
    try {
      const { id, name, prompt, enabled = true } = req.body;
      
      if (!id || !name || !prompt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: id, name, and prompt'
        });
      }

      const settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      // Check if effect ID already exists
      if (settings.effects.some(effect => effect.id === id)) {
        return res.status(400).json({
          success: false,
          message: 'Effect with this ID already exists'
        });
      }

      // Auto-rotate effects if trying to enable this effect and limit is reached
      if (enabled) {
        const enabledEffects = settings.effects.filter(effect => effect.enabled);
        if (enabledEffects.length >= 3) {
          // Disable the first (oldest) enabled effect
          const oldestEffect = enabledEffects[0];
          const oldestIndex = settings.effects.findIndex(effect => effect.id === oldestEffect.id);
          settings.effects[oldestIndex].enabled = false;
          
          console.log(`🔄 Auto-rotating effects: disabled '${oldestEffect.name}' to enable '${name}'`);
        }
      }

      // Add new effect
      settings.effects.push({ id, name, prompt, enabled });
      await settings.save();

      const currentEnabledCount = SettingsController.getEnabledEffectsCount(settings.effects);
      console.log(`✅ Added new effect: ${name} (${id}) - ${currentEnabledCount}/3 effects enabled`);

      res.json({
        success: true,
        message: enabled && currentEnabledCount === 3 ? 
          `Effect '${name}' added and enabled. Auto-rotated to maintain 3-effect limit.` : 
          `Effect '${name}' added successfully.`,
        settings: settings.toObject(),
        enabledEffectsCount: currentEnabledCount
      });

    } catch (error) {
      console.error('❌ Error adding effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add effect',
        error: error.message
      });
    }
  }

  // Update existing effect
  static async updateEffect(req, res) {
    try {
      const { effectId } = req.params;
      const { name, prompt, enabled } = req.body;
      
      const settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const effectIndex = settings.effects.findIndex(effect => effect.id === effectId);
      
      if (effectIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Effect not found'
        });
      }

      // Auto-rotate effects if trying to enable this effect and limit is reached
      if (enabled !== undefined && enabled === true) {
        // Count currently enabled effects (excluding this one)
        const otherEnabledEffects = settings.effects.filter(
          (effect, index) => index !== effectIndex && effect.enabled
        );
        const currentlyEnabledCount = otherEnabledEffects.length;
        
        if (currentlyEnabledCount >= 3) {
          // Disable the first (oldest) enabled effect
          const oldestEffect = otherEnabledEffects[0];
          const oldestIndex = settings.effects.findIndex(effect => effect.id === oldestEffect.id);
          settings.effects[oldestIndex].enabled = false;
          
          console.log(`🔄 Auto-rotating effects: disabled '${oldestEffect.name}' to enable '${settings.effects[effectIndex].name}'`);
        }
      }

      // Update effect properties
      if (name !== undefined) settings.effects[effectIndex].name = name;
      if (prompt !== undefined) settings.effects[effectIndex].prompt = prompt;
      if (enabled !== undefined) settings.effects[effectIndex].enabled = enabled;

      await settings.save();

      const currentEnabledCount = SettingsController.getEnabledEffectsCount(settings.effects);
      console.log(`✅ Updated effect: ${effectId} - ${currentEnabledCount}/3 effects enabled`);

      res.json({
        success: true,
        message: enabled === true && currentEnabledCount === 3 ? 
          `Effect updated and enabled. Auto-rotated to maintain 3-effect limit.` : 
          `Effect updated successfully.`,
        settings: settings.toObject(),
        enabledEffectsCount: currentEnabledCount
      });

    } catch (error) {
      console.error('❌ Error updating effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update effect',
        error: error.message
      });
    }
  }

  // Delete effect
  static async deleteEffect(req, res) {
    try {
      const { effectId } = req.params;
      
      const settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const effectIndex = settings.effects.findIndex(effect => effect.id === effectId);
      
      if (effectIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Effect not found'
        });
      }

      // Remove effect
      const deletedEffect = settings.effects.splice(effectIndex, 1)[0];
      await settings.save();

      console.log(`✅ Deleted effect: ${deletedEffect.name} (${effectId})`);

      res.json({
        success: true,
        message: 'Effect deleted successfully',
        settings: settings.toObject()
      });

    } catch (error) {
      console.error('❌ Error deleting effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete effect',
        error: error.message
      });
    }
  }

  // Update capture settings specifically
  static async updateCaptureSettings(req, res) {
    try {
      const { 
        autoCapture, 
        countdownDuration, 
        captureInterval, 
        photoCount, 
        captureSettings 
      } = req.body;

      // Validation
      if (photoCount && (photoCount < 1 || photoCount > 6)) {
        return res.status(400).json({
          success: false,
          message: 'Photo count must be between 1 and 6'
        });
      }

      if (countdownDuration && (countdownDuration < 1000 || countdownDuration > 10000)) {
        return res.status(400).json({
          success: false,
          message: 'Countdown duration must be between 1-10 seconds'
        });
      }

      if (captureInterval && (captureInterval < 1000 || captureInterval > 10000)) {
        return res.status(400).json({
          success: false,
          message: 'Capture interval must be between 1-10 seconds'
        });
      }

      const updateData = {
        lastUpdated: new Date(),
        updatedBy: 'admin'
      };

      // Only update provided fields
      if (autoCapture !== undefined) updateData.autoCapture = autoCapture;
      if (countdownDuration !== undefined) updateData.countdownDuration = countdownDuration;
      if (captureInterval !== undefined) updateData.captureInterval = captureInterval;
      if (photoCount !== undefined) updateData.photoCount = photoCount;
      if (captureSettings !== undefined) updateData.captureSettings = captureSettings;

      const updatedSettings = await Settings.findOneAndUpdate(
        { settingsId: 'main' },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedSettings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      console.log(`✅ Updated capture settings`);

      res.json({
        success: true,
        message: 'Capture settings updated successfully',
        settings: {
          autoCapture: updatedSettings.autoCapture,
          countdownDuration: updatedSettings.countdownDuration,
          captureInterval: updatedSettings.captureInterval,
          photoCount: updatedSettings.photoCount,
          captureSettings: updatedSettings.captureSettings
        }
      });

    } catch (error) {
      console.error('❌ Error updating capture settings:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update capture settings',
        error: error.message
      });
    }
  }

  // Get capture settings only
  static async getCaptureSettings(req, res) {
    try {
      const settings = await Settings.findOne({ settingsId: 'main' });
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      res.json({
        success: true,
        captureSettings: {
          autoCapture: settings.autoCapture,
          countdownDuration: settings.countdownDuration || settings.captureInterval, // Fallback for legacy
          captureInterval: settings.captureInterval,
          photoCount: settings.photoCount,
          captureSettings: settings.captureSettings || {}
        }
      });

    } catch (error) {
      console.error('❌ Error getting capture settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get capture settings',
        error: error.message
      });
    }
  }

  // Validate capture settings combination
  static async validateCaptureSettings(req, res) {
    try {
      const { autoCapture, countdownDuration, captureInterval, photoCount } = req.body;

      const validation = {
        isValid: true,
        warnings: [],
        recommendations: []
      };

      // Calculate total session time
      const totalTime = photoCount * (countdownDuration + captureInterval);
      
      if (totalTime > 60000) { // Over 1 minute
        validation.warnings.push('Session duration is very long (over 1 minute)');
        validation.recommendations.push('Consider reducing photo count or intervals');
      }

      if (countdownDuration < 2000 && photoCount > 3) {
        validation.warnings.push('Short countdown with many photos may rush users');
        validation.recommendations.push('Consider longer countdown for multiple photos');
      }

      if (captureInterval < 1500 && photoCount > 2) {
        validation.warnings.push('Very short interval between photos');
        validation.recommendations.push('Users may need more time to change poses');
      }

      res.json({
        success: true,
        validation,
        estimatedSessionTime: `${(totalTime / 1000).toFixed(1)}s`,
        sessionBreakdown: {
          firstPhotoDelay: `${countdownDuration / 1000}s`,
          betweenPhotosDelay: `${captureInterval / 1000}s`,
          totalPhotos: photoCount,
          totalDuration: `${(totalTime / 1000).toFixed(1)}s`
        }
      });

    } catch (error) {
      console.error('❌ Error validating capture settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate settings',
        error: error.message
      });
    }
  }

  // Get capture presets
  static async getCapturePresets(req, res) {
    try {
      const presets = [
        {
          id: 'quick',
          name: 'Quick Session',
          description: 'Fast photos for busy events',
          settings: {
            autoCapture: true,
            countdownDuration: 2000,
            captureInterval: 1500,
            photoCount: 2,
            captureSettings: {
              flashEnabled: false,
              soundEnabled: true,
              previewTime: 1500,
              retakeAllowed: false,
              maxRetakes: 1
            }
          }
        },
        {
          id: 'standard',
          name: 'Standard Session',
          description: 'Balanced timing for most events',
          settings: {
            autoCapture: true,
            countdownDuration: 3000,
            captureInterval: 3000,
            photoCount: 3,
            captureSettings: {
              flashEnabled: false,
              soundEnabled: true,
              previewTime: 2000,
              retakeAllowed: true,
              maxRetakes: 2
            }
          }
        },
        {
          id: 'extended',
          name: 'Extended Session',
          description: 'More photos and time for creativity',
          settings: {
            autoCapture: true,
            countdownDuration: 4000,
            captureInterval: 4000,
            photoCount: 4,
            captureSettings: {
              flashEnabled: false,
              soundEnabled: true,
              previewTime: 3000,
              retakeAllowed: true,
              maxRetakes: 3
            }
          }
        },
        {
          id: 'manual',
          name: 'Manual Mode',
          description: 'Full manual control for professional use',
          settings: {
            autoCapture: false,
            countdownDuration: 5000,
            captureInterval: 5000,
            photoCount: 1,
            captureSettings: {
              flashEnabled: false,
              soundEnabled: false,
              previewTime: 5000,
              retakeAllowed: true,
              maxRetakes: 5
            }
          }
        }
      ];

      res.json({
        success: true,
        presets
      });

    } catch (error) {
      console.error('❌ Error getting capture presets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get presets',
        error: error.message
      });
    }
  }

  // Apply capture preset
  static async applyCapturePreset(req, res) {
    try {
      const { presetId } = req.params;
      
      // Get presets
      const presetsResponse = await this.getCapturePresets({ query: {} }, { json: (data) => data });
      const preset = presetsResponse.presets.find(p => p.id === presetId);
      
      if (!preset) {
        return res.status(404).json({
          success: false,
          message: 'Preset not found'
        });
      }

      const updatedSettings = await Settings.findOneAndUpdate(
        { settingsId: 'main' },
        {
          ...preset.settings,
          lastUpdated: new Date(),
          updatedBy: 'admin'
        },
        { new: true, runValidators: true }
      );

      console.log(`✅ Applied capture preset: ${preset.name}`);

      res.json({
        success: true,
        message: `Applied ${preset.name} preset`,
        preset: preset,
        settings: updatedSettings.toObject()
      });

    } catch (error) {
      console.error('❌ Error applying preset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply preset',
        error: error.message
      });
    }
  }
}

module.exports = SettingsController;