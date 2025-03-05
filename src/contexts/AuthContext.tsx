
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      // First check if there's an active session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      // Check both session and cookies
      const storedProfileId = Cookies.get('profile_id');
      const isAuthorized = Cookies.get('profile_authorized');

      if (session) {
        // If we have a valid session, ensure cookies are set
        if (!storedProfileId || !isAuthorized) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            Cookies.set('profile_id', profile.id, { expires: 7 });
            Cookies.set('profile_authorized', 'true', { expires: 7 });
            setIsAuthenticated(true);
            setProfileId(profile.id);
            return true;
          }
        } else {
          setIsAuthenticated(true);
          setProfileId(storedProfileId);
          return true;
        }
      } else if (storedProfileId && isAuthorized) {
        // Validate the cookie-based authentication if no active session
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', storedProfileId)
          .maybeSingle();

        if (error || !profile) {
          console.error('Error validating auth:', error);
          clearAuthCookies();
          setIsAuthenticated(false);
          setProfileId(null);
          return false;
        }

        setIsAuthenticated(true);
        setProfileId(profile.id);
        return true;
      }

      // If no valid session or cookies, user is not authenticated
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    } catch (error) {
      console.error('Error checking auth:', error);
      clearAuthCookies();
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    clearAuthCookies();
    setIsAuthenticated(false);
    setProfileId(null);
    navigate('/sign-in');
  };

  const clearAuthCookies = () => {
    Cookies.remove('profile_id');
    Cookies.remove('profile_authorized');
    Cookies.remove('phone_number');
    // Trigger auth state change event
    window.localStorage.setItem('auth_state_changed', Date.now().toString());
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      checkAuth();
    });
    
    // Set up an interval to periodically check auth status (every 5 minutes)
    const authCheckInterval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(authCheckInterval);
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
