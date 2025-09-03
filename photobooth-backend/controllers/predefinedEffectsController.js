const PredefinedEffect = require('../models/PredefinedEffect');

class PredefinedEffectsController {
  // Get all active predefined effects
  static async getPredefinedEffects(req, res) {
    try {
      const { category, limit } = req.query;
      
      let query = { isActive: true };
      if (category && category !== 'all') {
        query.category = category;
      }

      let effects = await PredefinedEffect.find(query)
        .sort({ order: 1, createdAt: -1 });

      if (limit && !isNaN(parseInt(limit))) {
        effects = effects.slice(0, parseInt(limit));
      }

      console.log(`✅ Retrieved ${effects.length} predefined effects`);

      res.json({
        success: true,
        effects: effects.map(effect => ({
          id: effect.id,
          name: effect.name,
          prompt: effect.prompt,
          category: effect.category,
          description: effect.description,
          tags: effect.tags
        }))
      });

    } catch (error) {
      console.error('❌ Error fetching predefined effects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predefined effects',
        error: error.message
      });
    }
  }

  // Add new predefined effect
  static async addPredefinedEffect(req, res) {
    try {
      const { id, name, prompt, category, description, tags, order } = req.body;

      if (!id || !name || !prompt) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: id, name, and prompt'
        });
      }

      // Check if effect with this ID already exists
      const existingEffect = await PredefinedEffect.findOne({ id });
      if (existingEffect) {
        return res.status(400).json({
          success: false,
          message: 'Predefined effect with this ID already exists'
        });
      }

      const newEffect = new PredefinedEffect({
        id,
        name,
        prompt,
        category: category || 'general',
        description: description || '',
        tags: tags || [],
        order: order || 0,
        createdBy: 'admin'
      });

      await newEffect.save();

      console.log(`✅ Added predefined effect: ${name} (${id})`);

      res.json({
        success: true,
        message: 'Predefined effect added successfully',
        effect: {
          id: newEffect.id,
          name: newEffect.name,
          prompt: newEffect.prompt,
          category: newEffect.category,
          description: newEffect.description,
          tags: newEffect.tags
        }
      });

    } catch (error) {
      console.error('❌ Error adding predefined effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add predefined effect',
        error: error.message
      });
    }
  }

  // Update predefined effect
  static async updatePredefinedEffect(req, res) {
    try {
      const { effectId } = req.params;
      const { name, prompt, category, description, tags, order, isActive } = req.body;

      const updatedEffect = await PredefinedEffect.findOneAndUpdate(
        { id: effectId },
        {
          ...(name && { name }),
          ...(prompt && { prompt }),
          ...(category && { category }),
          ...(description !== undefined && { description }),
          ...(tags && { tags }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive })
        },
        { new: true }
      );

      if (!updatedEffect) {
        return res.status(404).json({
          success: false,
          message: 'Predefined effect not found'
        });
      }

      console.log(`✅ Updated predefined effect: ${effectId}`);

      res.json({
        success: true,
        message: 'Predefined effect updated successfully',
        effect: {
          id: updatedEffect.id,
          name: updatedEffect.name,
          prompt: updatedEffect.prompt,
          category: updatedEffect.category,
          description: updatedEffect.description,
          tags: updatedEffect.tags
        }
      });

    } catch (error) {
      console.error('❌ Error updating predefined effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update predefined effect',
        error: error.message
      });
    }
  }

  // Delete predefined effect
  static async deletePredefinedEffect(req, res) {
    try {
      const { effectId } = req.params;

      const deletedEffect = await PredefinedEffect.findOneAndDelete({ id: effectId });

      if (!deletedEffect) {
        return res.status(404).json({
          success: false,
          message: 'Predefined effect not found'
        });
      }

      console.log(`✅ Deleted predefined effect: ${deletedEffect.name} (${effectId})`);

      res.json({
        success: true,
        message: 'Predefined effect deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error deleting predefined effect:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete predefined effect',
        error: error.message
      });
    }
  }

  // Get effect categories
  static async getCategories(req, res) {
    try {
      const categories = await PredefinedEffect.distinct('category', { isActive: true });
      
      res.json({
        success: true,
        categories: categories.sort()
      });

    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }

  // Seed default predefined effects (for setup)
  static async seedDefaultEffects(req, res) {
    try {
      const defaultEffects = [
        {
          id: 'pixar',
          name: 'Pixar Theme',
          prompt: 'Disney-Pixar style 3D animated characters, smooth rendering, expressive eyes, vibrant colors, playful animation-style lighting',
          category: 'animation',
          description: 'Transform your photos into Pixar-style 3D animated characters',
          tags: ['disney', 'animation', '3d', 'cartoon'],
          order: 1
        },
        {
          id: 'ghibli',
          name: 'Studio Ghibli',
          prompt: 'studio ghibli style, anime, soft colors, dreamy atmosphere, hand-drawn animation',
          category: 'animation',
          description: 'Beautiful hand-drawn anime style inspired by Studio Ghibli',
          tags: ['anime', 'ghibli', 'hand-drawn', 'dreamy'],
          order: 2
        },
        {
          id: 'cyberpunk',
          name: 'Cyberpunk',
          prompt: 'cyberpunk aesthetic, neon lights, futuristic, high tech, dark atmosphere',
          category: 'futuristic',
          description: 'Dark futuristic style with neon lights and high-tech elements',
          tags: ['cyberpunk', 'neon', 'futuristic', 'dark'],
          order: 3
        },
        {
          id: 'watercolor',
          name: 'Watercolor Art',
          prompt: 'watercolor painting style, soft brushstrokes, artistic, painted texture, flowing colors',
          category: 'artistic',
          description: 'Soft watercolor painting effect with flowing colors',
          tags: ['watercolor', 'painting', 'artistic', 'soft'],
          order: 4
        },
        {
          id: 'vintage',
          name: 'Vintage Style',
          prompt: 'vintage photography, sepia tone, aged paper texture, classic, nostalgic atmosphere',
          category: 'vintage',
          description: 'Classic vintage photography with sepia tones',
          tags: ['vintage', 'sepia', 'retro', 'classic'],
          order: 5
        }
      ];

      let addedCount = 0;
      let skippedCount = 0;

      for (const effectData of defaultEffects) {
        const existing = await PredefinedEffect.findOne({ id: effectData.id });
        if (!existing) {
          const effect = new PredefinedEffect(effectData);
          await effect.save();
          addedCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(`✅ Seeded effects: ${addedCount} added, ${skippedCount} skipped`);

      res.json({
        success: true,
        message: `Seeding completed: ${addedCount} effects added, ${skippedCount} already existed`,
        added: addedCount,
        skipped: skippedCount
      });

    } catch (error) {
      console.error('❌ Error seeding effects:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed default effects',
        error: error.message
      });
    }
  }
}

module.exports = PredefinedEffectsController;