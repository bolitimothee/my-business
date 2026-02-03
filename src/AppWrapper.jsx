import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import CommerceApp from './CommerceApp';
import AuthPage from './components/auth/AuthPage';

export default function AppWrapper() {
  const { session, loading, profileLoading, forceCloseProfileLoading } = useAuth();
  const [displayContent, setDisplayContent] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('Initialisation...');
  const [fadeIn, setFadeIn] = useState(false);

  // Réinitialiser quand la session change (déconnexion)
  useEffect(() => {
    if (!session) {
      console.log('🔄 Session ended - Resetting display state');
      setDisplayContent(false);
      setFadeIn(false);
      setDisplayMessage('Initialisation...');
    }
  }, [session]);

  // Timeout - Force show content after 8 seconds if still loading
  useEffect(() => {
    if (!session) return;
    
    const timer = setTimeout(() => {
      if (profileLoading) {
        console.warn('⏰ Force close profile loading (8s) - content shown with default profile');
        forceCloseProfileLoading();
        setDisplayContent(true);
        setFadeIn(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [profileLoading, forceCloseProfileLoading, session]);

  // Gérer l'affichage avec transitions ultra-rapides
  useEffect(() => {
    if (!session) return; // Ne pas déclencher si pas de session
    
    if (!loading && !profileLoading) {
      // Tous les loadings sont finis
      console.log('✅ Ready to show content (fade-in)');
      setDisplayContent(true);
      requestAnimationFrame(() => {
        setFadeIn(true);
      });
    } else if (loading) {
      console.log('⏳ Session loading...');
      setFadeIn(false);
      setDisplayMessage('Initialisation...');
    } else if (profileLoading) {
      console.log('⏳ Profile loading...');
      setFadeIn(false);
      setDisplayMessage('Chargement du profil...');
    }
  }, [loading, profileLoading, session]);

  // Si tout est chargé, afficher le contenu approprié
  if (displayContent) {
    const content = session ? <CommerceApp /> : <AuthPage />;
    return (
      <div className="fade-in" style={{
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.15s ease-in',
      }}>
        {content}
      </div>
    );
  }

  // Montrer l'écran de chargement avec animation ultra-rapide
  if (loading || profileLoading) {
    return (
      <div className="loading-screen pulse" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        flexDirection: 'column',
        gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div className="pulse" style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}>
        </div>
        <p style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: '500',
          margin: '0',
          textAlign: 'center',
        }}>{displayMessage}</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  // Affichage par défaut basé sur la session
  return session ? <CommerceApp /> : <AuthPage />;
}
