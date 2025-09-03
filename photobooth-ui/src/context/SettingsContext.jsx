import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    orientation: 'portrait',
    effects: [],
    autoCapture: true,
    captureInterval: 3000,
    photoCount: 3
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3002/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        setError(null);
      } else {
        setError('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings to backend
  const saveSettings = async (newSettings) => {
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings)
      });
      
      const data = await response.json();
      if (data.success) {
        setSettings(newSettings);
        return { success: true };
      } else {
        return { success: false, message: 'Failed to save settings' };
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, message: 'Failed to connect to server' };
    }
  };

  // Update specific setting and auto-save
  const updateSetting = async (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    // Update local state immediately for UI responsiveness
    setSettings(newSettings);
    
    // Auto-save to backend
    try {
      const response = await fetch('http://localhost:3002/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings)
      });
      
      const data = await response.json();
      if (!data.success) {
        console.error('Failed to auto-save settings:', data.message);
        // Optionally revert local state if save failed
        // setSettings(settings);
      }
    } catch (error) {
      console.error('Failed to auto-save settings:', error);
      // Optionally revert local state if save failed
      // setSettings(settings);
    }
  };

  // Get enabled effects only
  const getEnabledEffects = () => {
    return settings.effects ? settings.effects.filter(effect => effect.enabled) : [];
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    
    // Reload settings every 30 seconds to keep in sync
    const interval = setInterval(loadSettings, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    updateSetting,
    getEnabledEffects
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;