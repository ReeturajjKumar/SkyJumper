const Settings = require('../models/Settings');

class ImageController {
  // Store for processing jobs
  static processingJobs = new Map();

  static async processImages(req, res) {
    try {
      console.log('🖼️ Processing images with effects...');
      
      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided'
        });
      }

      // Get current settings to determine enabled effects
      const settings = await Settings.findOne({ settingsId: 'main' });
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Settings not found'
        });
      }

      const enabledEffects = settings.effects.filter(effect => effect.enabled);
      console.log(`✨ Found ${enabledEffects.length} enabled effects:`, enabledEffects.map(e => e.name));

      // Create job ID
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize job status
      ImageController.processingJobs.set(jobId, {
        status: 'processing',
        totalImages: req.files.length,
        processedImages: 0,
        effects: enabledEffects.map(e => ({ id: e.id, name: e.name, prompt: e.prompt })),
        startTime: new Date(),
        processedImageUrls: []
      });

      // Start processing in background
      ImageController.processImagesBackground(jobId, req.files, enabledEffects);

      res.json({
        success: true,
        jobId,
        message: 'Processing started',
        totalImages: req.files.length,
        effects: enabledEffects.map(e => ({ id: e.id, name: e.name }))
      });

    } catch (error) {
      console.error('❌ Error processing images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process images',
        error: error.message
      });
    }
  }

  static async processImagesBackground(jobId, files, effects) {
    try {
      const job = ImageController.processingJobs.get(jobId);
      if (!job) return;

      console.log(`🔄 Background processing started for job ${jobId}`);
      
      // Simulate processing each image with each effect
      const processedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📸 Processing image ${i + 1}/${files.length}`);
        
        // Simulate processing time (2-4 seconds per image)
        const processingTime = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Convert buffer to base64 for demo (in real implementation, you'd apply effects here)
        const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // For demo purposes, we'll create variations for each effect
        const imageWithEffects = [];
        for (const effect of effects) {
          // Simulate effect processing
          await new Promise(resolve => setTimeout(resolve, 500));
          
          imageWithEffects.push({
            effectId: effect.id,
            effectName: effect.name,
            imageUrl: base64Image // In real implementation, this would be the processed image
          });
          
          console.log(`  ✨ Applied ${effect.name} effect`);
        }
        
        processedImages.push({
          originalIndex: i,
          variations: imageWithEffects
        });
        
        // Update job progress
        job.processedImages = i + 1;
        job.processedImageUrls = processedImages;
      }
      
      // Mark job as completed
      job.status = 'completed';
      job.endTime = new Date();
      job.duration = job.endTime - job.startTime;
      
      console.log(`✅ Job ${jobId} completed in ${job.duration}ms`);
      
    } catch (error) {
      console.error(`❌ Background processing failed for job ${jobId}:`, error);
      const job = ImageController.processingJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
    }
  }

  static async getProcessingStatus(req, res) {
    try {
      const { jobId } = req.params;
      const job = ImageController.processingJobs.get(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Calculate progress percentage
      const progressPercent = job.totalImages > 0 ? 
        Math.round((job.processedImages / job.totalImages) * 100) : 0;

      res.json({
        success: true,
        jobId,
        status: job.status,
        progress: {
          current: job.processedImages,
          total: job.totalImages,
          percentage: progressPercent
        },
        effects: job.effects,
        startTime: job.startTime,
        endTime: job.endTime,
        duration: job.duration,
        processedImages: job.status === 'completed' ? job.processedImageUrls : undefined,
        error: job.error
      });

    } catch (error) {
      console.error('❌ Error getting processing status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get processing status',
        error: error.message
      });
    }
  }
}

module.exports = ImageController;