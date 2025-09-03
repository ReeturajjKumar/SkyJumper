const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Add fetch polyfill for Node.js versions that don't have it built-in
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Import middleware
const corsMiddleware = require('./middleware/cors');
const logger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const predefinedEffectsRoutes = require('./routes/predefinedEffects');
const imageRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB Connection
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('🗄️  Database: SkyJumper');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('📋 Please check:');
    console.error('   - Internet connection');
    console.error('   - MongoDB Atlas cluster status');
    console.error('   - Database credentials in .env file');
    process.exit(1);
  });

// Connection event handlers
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Middleware
app.use(logger); // Request logging
app.use(corsMiddleware); // CORS configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/predefined-effects', predefinedEffectsRoutes);
app.use('/api/images', imageRoutes);

// Legacy route mapping for backward compatibility
app.get('/api/camera/orientation', settingsRoutes);

// Black Forest Labs API integration - Production implementation
app.post('/api/apply-effect', async (req, res) => {
  try {
    const { input_image, prompt, prompt_upsampling, output_format, aspect_ratio } = req.body;
    
    console.log('🎨 Applying effect with prompt:', prompt);
    console.log('📸 Image size:', input_image?.length || 'No image');
    
    // Check if API key is configured
    const apiKey = process.env.BLACK_FOREST_API_KEY;
    if (!apiKey) {
      console.error('❌ BLACK_FOREST_API_KEY not configured in environment');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'BLACK_FOREST_API_KEY environment variable is required' 
      });
    }
    
    // Use the correct Black Forest Labs API endpoint for image-to-image
    const apiUrl = 'https://api.bfl.ai/v1/flux-kontext-max';
    
    console.log('🌐 Making request to Black Forest Labs API for img2img...');
    console.log('🖼️ Input image length:', input_image ? input_image.length : 'No image provided');
    
    const requestBody = {
      prompt: prompt,
      input_image: input_image, // Base64 image for img2img transformation
      prompt_upsampling: prompt_upsampling || false,
      output_format: output_format || 'jpeg',
      aspect_ratio: aspect_ratio || '2:3' // Portrait orientation for photobooth
    };
    
    console.log('📦 Request body:', {
      prompt: requestBody.prompt,
      hasImage: !!requestBody.input_image,
      imageLength: requestBody.input_image?.length || 'N/A',
      output_format: requestBody.output_format,
      aspect_ratio: requestBody.aspect_ratio
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Black Forest API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Black Forest API request failed',
        message: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('✅ Black Forest API response:', { id: data.id, polling_url: data.polling_url, status: 'received' });
    
    // Store the polling URL for this task ID
    if (data.polling_url) {
      global.pollingUrls = global.pollingUrls || {};
      global.pollingUrls[data.id] = data.polling_url;
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Black Forest AI error:', error);
    res.status(500).json({ 
      error: 'Failed to process image effect',
      message: error.message 
    });
  }
});


app.get('/api/get-result', async (req, res) => {
  try {
    const { id } = req.query;
    
    console.log('🔍 Getting result for ID:', id);
    
    // Check if API key is configured
    const apiKey = process.env.BLACK_FOREST_API_KEY;
    if (!apiKey) {
      console.error('❌ BLACK_FOREST_API_KEY not configured in environment');
      return res.status(500).json({ 
        error: 'API key not configured',
        message: 'BLACK_FOREST_API_KEY environment variable is required' 
      });
    }
    
    // Get the polling URL for this task ID, or use default
    global.pollingUrls = global.pollingUrls || {};
    const pollingUrl = global.pollingUrls[id] || `https://api.bfl.ai/v1/get_result?id=${id}`;
    
    console.log('🔗 Using polling URL:', pollingUrl);
    
    // Get the task result from Black Forest Labs API
    const response = await fetch(pollingUrl, {
      method: 'GET',
      headers: {
        'x-key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Black Forest get result error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to get result from Black Forest API',
        message: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('📊 Black Forest result status:', data.status);

    if (data.status === 'Ready' && data.result) {
      console.log('✅ Result ready, fetching image from:', data.result.sample);
      
      // Fetch the actual image from the signed URL
      const imageResponse = await fetch(data.result.sample);
      
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        res.set('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
        res.send(Buffer.from(imageBuffer));
        console.log('✅ Image fetched and sent successfully');
      } else {
        console.error('❌ Failed to fetch image from result URL');
        res.status(500).json({ 
          error: 'Failed to fetch processed image',
          message: 'Could not download image from result URL' 
        });
      }
    } else {
      // Task is still processing or failed
      res.json({
        status: data.status,
        id: id,
        message: data.status === 'Pending' ? 'Still processing' : 'Task failed'
      });
    }
  } catch (error) {
    console.error('❌ Get result error:', error);
    res.status(500).json({ 
      error: 'Failed to get result',
      message: error.message 
    });
  }
});

// Error handling middleware (must be last)
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// Start server
app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
  console.log('🗄️  Using MongoDB for settings storage');
  console.log('📁 MVC structure initialized');
  console.log('🌐 API endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   GET  /api/admin/settings - Get settings');
  console.log('   POST /api/admin/settings - Save settings');
  console.log('   POST /api/auth/admin/login - Admin login');
  console.log('   GET  /api/camera/orientation - Camera orientation');
  console.log('   GET  /api/predefined-effects - Get predefined effects');
  console.log('   POST /api/predefined-effects/seed - Seed default effects');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});