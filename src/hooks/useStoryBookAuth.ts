
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useStoryBookAuth(isModalOpen: boolean) {
  const [authVerified, setAuthVerified] = useState(false);
  const { profileId, isAuthenticated, checkAuth, isLoading: authLoading } = useAuth();
  
  // Run an authentication check when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const verifyAuth = async () => {
        const isAuth = await checkAuth();
        console.log("Auth verification result:", isAuth, "Profile ID:", profileId);
        setAuthVerified(isAuth && !!profileId);
      };
      verifyAuth();
    }
  }, [isModalOpen, checkAuth, profileId]);

  return {
    authVerified,
    profileId,
    isAuthenticated,
    authLoading,
    checkAuth
  };
}
