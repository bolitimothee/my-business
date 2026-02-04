import React from 'react';
import { useAuth } from './contexts/AuthContext';
import CommerceApp from './CommerceApp';
import AuthPage from './components/auth/AuthPage';

export default function AppWrapper() {
  const { session, loading, profileLoading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', flexDirection: 'column', gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <p style={{ color: 'white', fontSize: '16px' }}>Initialisation...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (session && profileLoading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', flexDirection: 'column', gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <p style={{ color: 'white', fontSize: '16px' }}>Chargement du profil...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return session ? <CommerceApp /> : <AuthPage />;
}
