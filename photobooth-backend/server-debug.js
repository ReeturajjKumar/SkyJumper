// Debug version of server.js with enhanced logging - Run on port 3003
const express = require('express');
require('dotenv').config();

if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const corsMiddleware = require('./middleware/cors');

const app = express();
const PORT = 3003; // Different port to avoid conflicts

// Basic middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Black Forest Labs API integration with enhanced logging
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
    
    // Detect image orientation from base64 image using JPEG header
    let detectedAspectRatio = aspect_ratio || '2:3'; // Default portrait
    
    if (input_image) {
      try {
        // Decode base64 and read JPEG dimensions from header
        const imageBuffer = Buffer.from(input_image, 'base64');
        
        console.log('📊 Raw image buffer size:', imageBuffer.length, 'bytes');
        
        // Simple JPEG dimension detection
        let width, height;
        
        // Look for JPEG SOF (Start of Frame) markers
        for (let i = 0; i < imageBuffer.length - 8; i++) {
          if (imageBuffer[i] === 0xFF && (imageBuffer[i + 1] === 0xC0 || imageBuffer[i + 1] === 0xC2)) {
            // Found SOF0 or SOF2 marker
            height = (imageBuffer[i + 5] << 8) | imageBuffer[i + 6];
            width = (imageBuffer[i + 7] << 8) | imageBuffer[i + 8];
            console.log('✅ Found JPEG dimensions in header at position:', i);
            break;
          }
        }
        
        if (width && height) {
          console.log('📐 DETECTED IMAGE DIMENSIONS:', width, 'x', height);
          console.log('📊 Aspect ratio calculation:', width / height);
          
          // Determine aspect ratio based on image dimensions
          if (width > height) {
            detectedAspectRatio = '3:2'; // Landscape
            console.log('📐 ✅ DETECTED: LANDSCAPE orientation, using aspect ratio 3:2');
          } else {
            detectedAspectRatio = '2:3'; // Portrait  
            console.log('📐 ✅ DETECTED: PORTRAIT orientation, using aspect ratio 2:3');
          }
        } else {
          console.warn('⚠️ Could not parse image dimensions from JPEG header');
          console.log('🔍 First 20 bytes of image:', Array.from(imageBuffer.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        }
      } catch (error) {
        console.warn('⚠️ Could not detect image dimensions, using default aspect ratio:', error.message);
      }
    }
    
    // Use the correct Black Forest Labs API endpoint for image-to-image
    const apiUrl = 'https://api.bfl.ai/v1/flux-kontext-max';
    
    console.log('🌐 Making request to Black Forest Labs API for img2img...');
    console.log('🖼️ Input image length:', input_image ? input_image.length : 'No image provided');
    
    const requestBody = {
      prompt: prompt,
      input_image: input_image,
      prompt_upsampling: prompt_upsampling || false,
      output_format: output_format || 'jpeg',
      aspect_ratio: detectedAspectRatio
    };
    
    console.log('📦 FINAL Request body:', {
      prompt: requestBody.prompt,
      hasImage: !!requestBody.input_image,
      imageLength: requestBody.input_image?.length || 'N/A',
      output_format: requestBody.output_format,
      aspect_ratio: requestBody.aspect_ratio,
      prompt_upsampling: requestBody.prompt_upsampling
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
      
      const imageResponse = await fetch(data.result.sample);
      
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        console.log('📊 Final processed image size:', imageBuffer.byteLength, 'bytes');
        
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

// Start server on different port
app.listen(PORT, () => {
  console.log('🚀 DEBUG Server running on port', PORT);
  console.log('🔍 Enhanced logging enabled for image processing');
  console.log('📐 Aspect ratio detection active');
});