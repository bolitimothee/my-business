import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function AuthPage() {
  const { signUp, signIn, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
        await signUp(email, password);
        alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignUp ? "S'inscrire" : 'Se connecter'}</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isSignUp && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Chargement...' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-toggle">
          {isSignUp ? "Vous avez déjà un compte? " : 'Pas de compte? '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
            className="toggle-button"
          >
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>
      </div>
    </div>
  );
}
