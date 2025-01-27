import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import Profile from "@/pages/Profile";
import Storybooks from "@/pages/Storybooks";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/storybooks" element={<Storybooks />} />
      </Routes>
      <Toaster />
      <SonnerToaster />
    </Router>
  );
}

export default App;