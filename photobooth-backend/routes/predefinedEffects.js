const express = require('express');
const PredefinedEffectsController = require('../controllers/predefinedEffectsController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes (for fetching predefined effects)
router.get('/', PredefinedEffectsController.getPredefinedEffects);
router.get('/categories', PredefinedEffectsController.getCategories);

// Admin routes (for managing predefined effects)
router.post('/', PredefinedEffectsController.addPredefinedEffect);
router.put('/:effectId', PredefinedEffectsController.updatePredefinedEffect);
router.delete('/:effectId', PredefinedEffectsController.deletePredefinedEffect);
router.post('/seed', PredefinedEffectsController.seedDefaultEffects);

// Example of secured routes (uncomment to enable authentication):
// router.post('/', authenticateAdmin, PredefinedEffectsController.addPredefinedEffect);
// router.put('/:effectId', authenticateAdmin, PredefinedEffectsController.updatePredefinedEffect);
// router.delete('/:effectId', authenticateAdmin, PredefinedEffectsController.deletePredefinedEffect);

module.exports = router;