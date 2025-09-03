import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import ProcessingScreen from './components/ProcessingScreen';
import OutputScreen from './components/OutputScreen';
import ThankYouScreen from './components/ThankYouScreen';
import AdminPanel from './components/admin/AdminPanel';

// Photobooth Flow Component
function PhotoboothFlow() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  return (
    <div className="app">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={() => setCurrentScreen('camera')} />
      )}
      {currentScreen === 'camera' && (
        <CameraScreen onComplete={() => setCurrentScreen('processing')} />
      )}
      {currentScreen === 'processing' && (
        <ProcessingScreen onComplete={() => setCurrentScreen('output')} />
      )}
      {currentScreen === 'output' && (
        <OutputScreen onComplete={() => setCurrentScreen('thankyou')} />
      )}
      {currentScreen === 'thankyou' && (
        <ThankYouScreen onNewSession={() => setCurrentScreen('welcome')} />
      )}
    </div>
  );
}

// Admin Access Component
function AdminAccess() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <a 
        href="/admin"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'rgba(255, 255, 255, 0.6)',
          padding: '10px 15px',
          borderRadius: '25px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 0, 128, 0.2)';
          e.target.style.color = 'white';
          e.target.style.borderColor = 'rgba(255, 0, 128, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.8)';
          e.target.style.color = 'rgba(255, 255, 255, 0.6)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        ⚙️ Admin
      </a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Photobooth Route */}
        <Route path="/" element={
          <>
            <PhotoboothFlow />
            <AdminAccess />
          </>
        } />
        
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;