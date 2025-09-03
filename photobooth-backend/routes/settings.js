const express = require('express');
const SettingsController = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (no auth required for now - can be secured later)
router.get('/', SettingsController.getSettings);
router.get('/camera/orientation', SettingsController.getCameraOrientation);

// Admin routes (can add authenticateAdmin middleware when needed)
router.post('/', SettingsController.saveSettings);
router.patch('/update', SettingsController.updateSetting);
router.post('/reset', SettingsController.resetSettings);

// Effect management routes
router.post('/effects', SettingsController.addEffect);
router.put('/effects/:effectId', SettingsController.updateEffect);
router.delete('/effects/:effectId', SettingsController.deleteEffect);

// Capture settings routes
router.get('/capture', SettingsController.getCaptureSettings);
router.put('/capture', SettingsController.updateCaptureSettings);
router.post('/capture/validate', SettingsController.validateCaptureSettings);
router.get('/capture/presets', SettingsController.getCapturePresets);
router.post('/capture/presets/:presetId', SettingsController.applyCapturePreset);

// Example of secured routes (uncomment to enable authentication):
// router.post('/', authenticateAdmin, SettingsController.saveSettings);
// router.patch('/update', authenticateAdmin, SettingsController.updateSetting);
// router.post('/reset', authenticateAdmin, SettingsController.resetSettings);

module.exports = router;