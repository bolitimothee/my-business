import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(undefined);

const PROFILE_LOAD_TIMEOUT = 8000;  // 8 secondes (réseau lent)
const INIT_TIMEOUT = 6000;          // 6 secondes (getSession peut être lent)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccountValid, setIsAccountValid] = useState(true);
  
  // Refs pour tracker les timeouts actifs et éviter les race conditions
  const profileTimeoutRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const profileLoadIdRef = useRef(0);

  const checkAccountStatus = (profile) => {
    // Vérifier si le compte est désactivé
    if (!profile.is_active) {
      console.log('🔴 Compte désactivé');
      setError('Votre compte a été désactivé. Veuillez contacter le support.');
      return false;
    }
    
    // Vérifier si le compte est expiré
    if (profile.expiry_date) {
      const expiry = new Date(profile.expiry_date);
      const now = new Date();
      
      if (now > expiry) {
        console.log('⏰ Abonnement expiré:', profile.expiry_date);
        setError('🔴 Votre abonnement a expiré. Vous êtes déconnecté.');
        
        // Forcer la déconnexion - sera appelée via le useEffect
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setIsAccountValid(false);
        
        return false;
      }
      
      // Afficher un avertissement si proche de l'expiration (5 jours avant)
      const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 5 && daysUntilExpiry > 0) {
        console.log(`⚠️ Abonnement expire dans ${daysUntilExpiry} jours`);
        setError(`⚠️ Attention: Votre abonnement expire dans ${daysUntilExpiry} jours`);
      }
    }
    
    return true;
  };

  // Force la fermeture du loading du profil (utile pour les timeouts)
  const forceCloseProfileLoading = () => {
    console.log('🔴 Force closing profile loading');
    setProfileLoading(false);
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
  };

  const loadUserProfile = async (userId, userEmail = '') => {
    if (!userId) {
      console.warn('❌ No userId provided to loadUserProfile');
      setProfileLoading(false);
      return;
    }

    const loadId = ++profileLoadIdRef.current;
    setProfileLoading(true);
    
    // Timeout de sécurité pour le chargement du profil
    profileTimeoutRef.current = setTimeout(() => {
      console.warn(`⏰ Profile loading timeout après ${PROFILE_LOAD_TIMEOUT}ms pour user ${userId}`);
      if (loadId === profileLoadIdRef.current) {
        setProfileLoading(false);
        setIsAccountValid(true);
      }
    }, PROFILE_LOAD_TIMEOUT);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);

      if (loadId !== profileLoadIdRef.current) return;

      if (fetchError) {
        console.warn('⚠️ Profile fetch error (RLS/500):', fetchError.message);
        throw new Error('RLS_ERROR');
      }

      if (data && data.length > 0) {
        setUserProfile(data[0]);
        setIsAccountValid(checkAccountStatus(data[0]));
      } else {
        console.warn('⚠️ Profile not found, creating default...');
        const defaultProfile = {
          user_id: userId,
          email: userEmail || '',
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ ...defaultProfile, email: userEmail || 'inconnu@temp.local' }])
            .select()
            .single();
          
          if (loadId !== profileLoadIdRef.current) return;
          
          if (insertError) {
            console.warn('⚠️ Could not create profile in DB (RLS issue):', insertError.message);
            setUserProfile(defaultProfile);
            setIsAccountValid(true);
          } else {
            setUserProfile(insertedData);
            setIsAccountValid(true);
          }
        } catch (insertErr) {
          if (loadId !== profileLoadIdRef.current) return;
          setUserProfile(defaultProfile);
          setIsAccountValid(true);
        }
      }
    } catch (err) {
      if (loadId !== profileLoadIdRef.current) return;
      console.warn('⚠️ Error loading profile - using default:', err instanceof Error ? err.message : err);
      const defaultProfile = {
        user_id: userId,
        email: userEmail || '',
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setUserProfile(defaultProfile);
      setIsAccountValid(true);
    } finally {
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
      if (loadId === profileLoadIdRef.current) {
        setProfileLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initialHandled = false;

    const handleAuthEvent = async (event, session) => {
      if (!isMounted) return;

      console.log('🔐 Auth event:', event);

      // Au refresh, rafraîchir le JWT pour éviter token expiré
      if (event === 'INITIAL_SESSION' && session?.user) {
        try {
          const { data } = await supabase.auth.refreshSession();
          if (data?.session) session = data.session;
        } catch (e) {
          console.warn('Refresh session:', e);
        }
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setProfileLoading(true);
        await loadUserProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
        setIsAccountValid(true);
        setProfileLoading(false);
        if (profileTimeoutRef.current) {
          clearTimeout(profileTimeoutRef.current);
          profileTimeoutRef.current = null;
        }
      }

      if (!initialHandled) {
        initialHandled = true;
        setLoading(false);
        console.log('✅ Initial auth state resolved');
      }
    };

    // PRIORITÉ: onAuthStateChange pour récupérer la session au refresh
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthEvent);

    // Fallback: getSession si pas d'événement après 2s
    const fallbackTimer = setTimeout(async () => {
      if (initialHandled) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted && data?.session) {
          await handleAuthEvent('FALLBACK_SESSION', data.session);
        }
        if (isMounted && !initialHandled) {
          initialHandled = true;
          setLoading(false);
        }
      } catch {
        if (isMounted && !initialHandled) {
          initialHandled = true;
          setLoading(false);
        }
      }
    }, 2000);

    initTimeoutRef.current = setTimeout(() => {
      if (isMounted && !initialHandled) {
        initialHandled = true;
        setLoading(false);
        setProfileLoading(false);
      }
    }, INIT_TIMEOUT);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Vérifier l'expiration de l'abonnement toutes les 30 secondes
  useEffect(() => {
    if (!userProfile || !userProfile.expiry_date) return;

    const checkExpiration = () => {
      const expiry = new Date(userProfile.expiry_date);
      const now = new Date();
      
      if (now > expiry) {
        console.log('⏰ Abonnement expiré - Déconnexion automatique');
        setError('🔴 Votre abonnement a expiré. Vous êtes déconnecté.');
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setIsAccountValid(false);
      }
    };

    const expirationCheckInterval = setInterval(checkExpiration, 30000); // Vérifier chaque 30 secondes
    
    // Vérification immédiate au montage
    checkExpiration();

    return () => {
      clearInterval(expirationCheckInterval);
    };
  }, [userProfile]);

  const signUp = async (email, password) => {
    try {
      setError(null);
      console.log('📝 Signing up...');
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      // Le profil est créé automatiquement par le trigger handle_new_user sur auth.users
      // Pas d'insertion manuelle ici pour éviter la violation UNIQUE(user_id)
      console.log('✅ Signup successful');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup error';
      console.error('❌ Signup error:', message);
      setError(message);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Signing in...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email);
      }
      console.log('✅ Signin successful');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signin error';
      console.error('❌ Signin error:', message);
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      setError(null);
      await supabase.auth.signOut({ scope: 'global' });
      
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsAccountValid(true);
      setProfileLoading(false);
      setLoading(false);
      
      // Forcer le rechargement pour état propre (évite bugs après refresh)
      window.location.href = '/';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signout error';
      console.error('❌ Signout error:', message);
      setError(message);
      // Même en erreur, forcer le reset
      setSession(null);
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile,
        loading,
        profileLoading,
        error,
        signUp,
        signIn,
        signOut,
        isAccountValid,
        forceCloseProfileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
