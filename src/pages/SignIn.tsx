
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhoneNumber } from "@/utils/phoneUtils";
import Cookies from "js-cookie";

const SignIn = () => {
  useEffect(() => {
    document.title = "Narra Story | Sign In";
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedPhoneNumber = normalizePhoneNumber(formData.phoneNumber);

    try {
      const { data: profile, error: searchError } = await supabase
        .from("profiles")
        .select("id, password")
        .eq("phone_number", normalizedPhoneNumber)
        .maybeSingle();

      if (searchError) throw searchError;

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Account Not Found",
          description: (
            <div className="space-y-2">
              <p>No account found with this phone number.</p>
              <p>
                Please check your phone number or{" "}
                <Link to="/" className="text-primary hover:underline">
                  sign up for a new account
                </Link>
              </p>
            </div>
          ),
        });
        setLoading(false);
        return;
      }

      if (profile.password !== formData.password) {
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: (
            <div className="space-y-2">
              <p>The password you entered is incorrect.</p>
              <p>
                <Link to="/reset-password" className="text-primary hover:underline">
                  Reset your password
                </Link>{" "}
                if you've forgotten it.
              </p>
            </div>
          ),
        });
        setLoading(false);
        return;
      }

      // Set cookies to expire in 365 days
      Cookies.set('profile_authorized', 'true', { expires: 365 });
      Cookies.set('phone_number', normalizedPhoneNumber, { expires: 365 });
      Cookies.set('profile_id', profile.id, { expires: 365 });

      // Get the redirect path from URL params or location state
      const redirectTo = searchParams.get('redirectTo') || 
                        (location.state as { redirectTo?: string })?.redirectTo || 
                        `/profile/${profile.id}`;
      
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
            alt="Narra Logo"
            className="mx-auto h-16 w-auto mb-[50px]"
          />
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground mt-2">
            Please enter your credentials below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </Button>

            <div className="text-center space-y-2">
              <Link to="/reset-password" className="text-primary hover:underline text-sm">
                Forgot your password?
              </Link>
              
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Sign up for Narra
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
