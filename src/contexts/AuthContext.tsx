
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  profileId: string | null;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const storedProfileId = Cookies.get('profile_id');
    const isAuthorized = Cookies.get('profile_authorized');

    if (!storedProfileId || !isAuthorized) {
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', storedProfileId)
        .maybeSingle();

      if (error || !profile) {
        console.error('Error validating auth:', error);
        Cookies.remove('profile_id');
        Cookies.remove('profile_authorized');
        Cookies.remove('phone_number');
        setIsAuthenticated(false);
        setProfileId(null);
        return false;
      }

      setIsAuthenticated(true);
      setProfileId(profile.id);
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setProfileId(null);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Recheck auth when cookies change
    const handleCookieChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleCookieChange);
    return () => window.removeEventListener('storage', handleCookieChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileId, checkAuth }}>
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
