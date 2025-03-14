
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book, MessageSquare, Mic, Bot, User, ArrowRight } from "lucide-react";

const GetStarted = () => {
  useEffect(() => {
    document.title = "Narra Story | Get Started";
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img
              src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
              alt="Narra Logo"
              className="h-12 w-auto"
            />
          </Link>
          <div className="flex gap-4">
            <Link to="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1E293B]">
            Tell Your Stories with Narra,
            <span className="text-[#9b87f5] block mt-2">Your AI Interviewer</span>
          </h1>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Narra guides you through meaningful conversations to create and preserve your personal stories.
          </p>
          <div className="pt-4">
            <Link to="/">
              <Button size="lg" className="gap-2 bg-[#9b87f5] hover:bg-[#7E69AB]">
                Start Your Story <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F8FAFC] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#1E293B]">How Narra Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center space-y-4">
              <div className="bg-[#9b87f5]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Mic className="text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-[#334155]">1. Have a Conversation</h3>
              <p className="text-[#64748B]">
                Narra guides you through thoughtful interviews designed to capture your unique experiences.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center space-y-4">
              <div className="bg-[#9b87f5]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Book className="text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-[#334155]">2. Create Your Story</h3>
              <p className="text-[#64748B]">
                Your conversations are transformed into beautifully written stories you can edit and enhance.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center space-y-4">
              <div className="bg-[#9b87f5]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="text-[#9b87f5]" />
              </div>
              <h3 className="text-xl font-semibold text-[#334155]">3. Share and Preserve</h3>
              <p className="text-[#64748B]">
                Share your stories with loved ones or keep them private - your memories, preserved forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#1E293B]">Why Choose Narra</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-[#9b87f5]/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Bot className="text-[#9b87f5] w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#334155]">AI-Guided Interviews</h3>
                <p className="text-[#64748B]">
                  Narra asks thoughtful questions that help you recall and articulate your most important memories.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-[#9b87f5]/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="text-[#9b87f5] w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#334155]">Personal Touch</h3>
                <p className="text-[#64748B]">
                  Your stories remain authentically yours, with your voice and perspective preserved throughout.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-[#9b87f5]/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <Book className="text-[#9b87f5] w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#334155]">Beautiful Presentation</h3>
                <p className="text-[#64748B]">
                  Your stories are formatted into beautifully designed digital books you can customize.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="bg-[#9b87f5]/10 w-12 h-12 rounded-full flex items-center justify-center">
                  <MessageSquare className="text-[#9b87f5] w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#334155]">Easy Sharing</h3>
                <p className="text-[#64748B]">
                  Share your stories privately with family or friends with secure, customizable sharing options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#9b87f5]/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-[#1E293B]">Start Preserving Your Stories Today</h2>
            <p className="text-xl text-[#64748B]">
              Create an account now and begin your journey with Narra. Your future self and loved ones will thank you.
            </p>
            <div className="pt-4">
              <Link to="/">
                <Button size="lg" className="bg-[#9b87f5] hover:bg-[#7E69AB]">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <img
                src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/narra-logo.svg?t=2025-01-22T21%3A53%3A58.812Z"
                alt="Narra Logo"
                className="h-10 w-auto"
              />
              <p className="text-sm text-[#64748B] mt-4">
                © {new Date().getFullYear()} Narra Story. All rights reserved.
              </p>
            </div>
            <div className="flex gap-8">
              <Link to="/" className="text-[#64748B] hover:text-[#1E293B]">
                Home
              </Link>
              <Link to="/get-started" className="text-[#64748B] hover:text-[#1E293B]">
                Get Started
              </Link>
              <Link to="/sign-in" className="text-[#64748B] hover:text-[#1E293B]">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GetStarted;
