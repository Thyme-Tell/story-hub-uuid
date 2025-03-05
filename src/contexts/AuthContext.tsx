
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
      const storedProfileId = Cookies.get('profile_id');
      const isAuthorized = Cookies.get('profile_authorized');

      if (!storedProfileId || !isAuthorized) {
        setIsAuthenticated(false);
        setProfileId(null);
        return false;
      }

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
    } catch (error) {
      console.error('Error checking auth:', error);
      clearAuthCookies();
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }
  }, []);

  const logout = async () => {
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
    
    // Watch for cookie changes
    const handleAuthStateChange = () => {
      checkAuth();
    };

    // Set up auth state change detection
    window.addEventListener('storage', handleAuthStateChange);
    
    // Set up an interval to periodically check auth status (every 5 minutes)
    const authCheckInterval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('storage', handleAuthStateChange);
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
