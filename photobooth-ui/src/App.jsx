import { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import ProcessingScreen from './components/ProcessingScreen';
import OutputScreen from './components/OutputScreen';
import ThankYouScreen from './components/ThankYouScreen';
import AdminPanel from './components/admin/AdminPanel';

// Admin Overlay Component
function AdminOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="admin-overlay">
      <style>{`
        .admin-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .admin-window {
          width: 95vw;
          height: 95vh;
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 50px 100px rgba(0, 0, 0, 0.8);
          position: relative;
          overflow: hidden;
          animation: windowSlideIn 0.4s ease;
        }

        @keyframes windowSlideIn {
          from { 
            transform: scale(0.9) translateY(-50px);
            opacity: 0;
          }
          to { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .admin-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 70, 70, 0.2);
          color: #ff4646;
          border: 1px solid rgba(255, 70, 70, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .admin-close-btn:hover {
          background: rgba(255, 70, 70, 0.3);
          transform: scale(1.1);
        }

        .admin-hotkey-hint {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 8px 15px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          font-weight: 600;
          z-index: 10000;
        }

        .admin-panel-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
      
      <div className="admin-window">
        <div className="admin-panel-container">
          <AdminPanel isOverlay={true} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Ctrl+Shift+A
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
      
      // Close admin panel with Escape key
      if (event.key === 'Escape' && isAdminOpen) {
        setIsAdminOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminOpen]);

  return (
    <SettingsProvider>
      <div className="app">
        {currentScreen === 'welcome' && (
          <WelcomeScreen onStart={() => setCurrentScreen('camera')} />
        )}
        {currentScreen === 'camera' && (
          <CameraScreen onComplete={(images) => {
            setCapturedImages(images);
            setCurrentScreen('processing');
          }} />
        )}
        {currentScreen === 'processing' && (
          <ProcessingScreen 
            capturedImages={capturedImages}
            onComplete={(processedImages) => {
              setCapturedImages(processedImages || capturedImages);
              setCurrentScreen('output');
            }} 
          />
        )}
        {currentScreen === 'output' && (
          <OutputScreen 
            capturedImages={capturedImages}
            onComplete={() => setCurrentScreen('thankyou')} 
          />
        )}
        {currentScreen === 'thankyou' && (
          <ThankYouScreen onNewSession={() => setCurrentScreen('welcome')} />
        )}
      </div>

      {/* Admin Panel Overlay */}
      <AdminOverlay 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />

      {/* Hidden shortcut hint */}
      {!isAdminOpen && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'rgba(255, 255, 255, 0.4)',
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '10px',
          fontFamily: 'monospace',
          zIndex: 1000,
          opacity: 0.3,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}>
          Ctrl+Shift+A
        </div>
      )}
    </SettingsProvider>
  );
}

export default App;