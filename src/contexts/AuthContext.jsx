import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(undefined);

const PROFILE_LOAD_TIMEOUT = 5000;  // 5 secondes
const INIT_TIMEOUT = 3000;          // 3 secondes

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccountValid, setIsAccountValid] = useState(true);
  
  // Refs pour tracker les timeouts actifs
  const profileTimeoutRef = useRef(null);
  const initTimeoutRef = useRef(null);
  const loadProfileAbortRef = useRef(null);

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

  const loadUserProfile = async (userId) => {
    if (!userId) {
      console.warn('❌ No userId provided to loadUserProfile');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    
    // Timeout de sécurité pour le chargement du profil
    profileTimeoutRef.current = setTimeout(() => {
      console.warn(`⏰ Profile loading timeout après ${PROFILE_LOAD_TIMEOUT}ms pour user ${userId}`);
      setProfileLoading(false);
      setIsAccountValid(true); // Permettre l'accès même si le profil traîne
    }, PROFILE_LOAD_TIMEOUT);

    try {
      // Essayer de charger le profil
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);

      // Gérer les erreurs RLS/500
      if (fetchError) {
        console.warn('⚠️ Profile fetch error (RLS/500):', fetchError.message);
        // Ne pas bloquer, créer un profil par défaut
        throw new Error('RLS_ERROR');
      }

      if (data && data.length > 0) {
        console.log('✅ Profile loaded successfully');
        setUserProfile(data[0]);
        setIsAccountValid(checkAccountStatus(data[0]));
      } else {
        // Profil n'existe pas, créer un par défaut
        console.warn('⚠️ Profile not found, creating default...');
        const defaultProfile = {
          user_id: userId,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        
        try {
          const { data: insertedData, error: insertError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select()
            .single();
          
          if (insertError) {
            console.warn('⚠️ Could not create profile in DB (RLS issue):', insertError.message);
            // Utiliser le profil en mémoire même si l'insert échoue
            setUserProfile(defaultProfile);
            setIsAccountValid(true);
          } else {
            console.log('✅ Default profile created in DB');
            setUserProfile(insertedData);
            setIsAccountValid(true);
          }
        } catch (insertErr) {
          console.warn('⚠️ Insert error:', insertErr);
          setUserProfile(defaultProfile);
          setIsAccountValid(true);
        }
      }
    } catch (err) {
      console.warn('⚠️ Error loading profile - using default:', err instanceof Error ? err.message : err);
      const defaultProfile = {
        user_id: userId,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setUserProfile(defaultProfile);
      setIsAccountValid(true);
    } finally {
      // Nettoyer le timeout
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!isMounted) {
          console.log('⚠️ Component unmounted, ignoring session data');
          return;
        }

        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
        console.log('✅ Session check complete:', sessionData.session ? 'Session found' : 'No session');

        // Charger le profil si on a une session
        if (sessionData.session?.user) {
          console.log('📥 Loading profile for user:', sessionData.session.user.id);
          await loadUserProfile(sessionData.session.user.id);
        } else {
          console.log('ℹ️ No session, skipping profile load');
          setProfileLoading(false);
        }
      } catch (err) {
        console.error('❌ Init auth error:', err);
        setProfileLoading(false);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('✅ Init complete');
        }
      }
    };

    // Timeout global pour initAuth - utiliser une durée plus longue
    initTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn(`⏰ Init timeout après ${INIT_TIMEOUT}ms`);
        setLoading(false);
        setProfileLoading(false);
      }
    }, INIT_TIMEOUT);

    initAuth();

    // Listener pour les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('🔐 Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('📥 Loading profile due to auth change');
        await loadUserProfile(session.user.id);
      } else {
        console.log('ℹ️ No session in auth change event');
        setUserProfile(null);
        setIsAccountValid(false);
        setProfileLoading(false);
        if (profileTimeoutRef.current) {
          clearTimeout(profileTimeoutRef.current);
          profileTimeoutRef.current = null;
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth effect');
      isMounted = false;
      
      // Nettoyer tous les timeouts
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
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

      if (data.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email,
          role: 'user',
          is_active: true,
        });
        if (profileError) throw profileError;
      }
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
        await loadUserProfile(data.user.id);
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
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      // Nettoyer les states IMMÉDIATEMENT
      setLoading(false);  // ← IMPORTANT: Reset loading state
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsAccountValid(false);
      setProfileLoading(false);
      setError(null);
      
      // Nettoyer les timeouts
      if (profileTimeoutRef.current) {
        clearTimeout(profileTimeoutRef.current);
        profileTimeoutRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      console.log('✅ Signout successful - All states reset');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signout error';
      console.error('❌ Signout error:', message);
      setError(message);
      throw err;
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
