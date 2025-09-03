const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple file-based admin settings storage
const SETTINGS_FILE = path.join(__dirname, 'admin-settings.json');

// Default settings
const defaultSettings = {
  orientation: 'portrait',
  effects: [
    { id: 'normal', name: 'Normal', prompt: '', enabled: true },
    { id: 'vintage', name: 'Vintage', prompt: 'vintage style, sepia tone', enabled: true },
    { id: 'bw', name: 'Black & White', prompt: 'black and white, artistic', enabled: true },
    { id: 'vivid', name: 'Vivid Colors', prompt: 'vibrant colors, saturated', enabled: true }
  ],
  autoCapture: true,
  captureInterval: 3000,
  photoCount: 3
};

// Helper functions for file operations
const readSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error reading settings:', error);
    return defaultSettings;
  }
};

const writeSettings = (settings) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
};

// API Routes
app.get('/api/admin/settings', (req, res) => {
  try {
    const settings = readSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

app.post('/api/admin/settings', (req, res) => {
  try {
    const settings = req.body;
    const success = writeSettings(settings);
    
    if (success) {
      res.json({ success: true, message: 'Settings saved successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
});

// Black Forest AI API routes
app.post('/api/apply-effect', async (req, res) => {
  try {
    const { input_image, prompt, prompt_upsampling, output_format, aspect_ratio } = req.body;
    
    const response = await fetch('https://api.blackforest.ai/v1/image/generations/flux-1.1-pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bfl-5c8e5f78d9db3d8b6b8b8e6f68e1e8f68d8d8e6f68e1e8f68d8d8e6f68e1e8f6'
      },
      body: JSON.stringify({
        input_image,
        prompt,
        prompt_upsampling,
        output_format,
        aspect_ratio
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Black Forest API error:', error);
    res.status(500).json({ error: 'Failed to apply effect' });
  }
});

app.post('/api/poll-url', async (req, res) => {
  try {
    const { polling_url } = req.body;
    
    const response = await fetch(polling_url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Polling error:', error);
    res.status(500).json({ error: 'Failed to poll for result' });
  }
});

app.get('/api/get-result', async (req, res) => {
  try {
    const { id } = req.query;
    
    const response = await fetch(`https://api.blackforest.ai/v1/get_result?id=${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Settings file: ${SETTINGS_FILE}`);
});