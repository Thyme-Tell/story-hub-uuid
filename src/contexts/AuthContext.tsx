
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Checking authentication status...");
      
      // First check if there's an active session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      // Check both session and cookies
      const storedProfileId = Cookies.get('profile_id');
      const isAuthorized = Cookies.get('profile_authorized');

      console.log("Session check:", !!session, "Cookie check:", !!storedProfileId && !!isAuthorized);

      if (session) {
        // If we have a valid session, ensure cookies are set
        if (!storedProfileId || !isAuthorized) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            // Set cookies with long expiration (30 days)
            Cookies.set('profile_id', profile.id, { expires: 30, path: '/' });
            Cookies.set('profile_authorized', 'true', { expires: 30, path: '/' });
            setIsAuthenticated(true);
            setProfileId(profile.id);
            console.log("Auth check result: Authenticated with session. Profile ID:", profile.id);
            setIsLoading(false);
            return true;
          }
        } else {
          setIsAuthenticated(true);
          setProfileId(storedProfileId);
          console.log("Auth check result: Authenticated with session and cookies. Profile ID:", storedProfileId);
          setIsLoading(false);
          return true;
        }
      } else if (storedProfileId && isAuthorized) {
        // Validate the cookie-based authentication if no active session
        try {
          // Try to establish a session from stored auth data
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
            console.log("Auth check result: Failed cookie validation");
            setIsLoading(false);
            return false;
          }

          // We found a valid profile with the stored ID
          // Refresh cookies to extend session
          Cookies.set('profile_id', profile.id, { expires: 30, path: '/' });
          Cookies.set('profile_authorized', 'true', { expires: 30, path: '/' });
          
          setIsAuthenticated(true);
          setProfileId(profile.id);
          console.log("Auth check result: Successfully revalidated via cookies. Profile ID:", profile.id);
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error('Error during cookie validation:', error);
          clearAuthCookies();
          setIsLoading(false);
          return false;
        }
      }

      // If no valid session or cookies, user is not authenticated
      console.log("Auth check result: Not authenticated");
      setIsAuthenticated(false);
      setProfileId(null);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error checking auth:', error);
      clearAuthCookies();
      setIsAuthenticated(false);
      setProfileId(null);
      console.log("Auth check result: Error occurred");
      setIsLoading(false);
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
    
    // Listen for auth state changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_state_changed') {
        console.log('Auth state change detected from another tab/window');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up an interval to periodically check auth status (every 10 minutes)
    const authCheckInterval = setInterval(() => {
      checkAuth();
    }, 10 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, checkAuth, logout, isLoading }}>
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
