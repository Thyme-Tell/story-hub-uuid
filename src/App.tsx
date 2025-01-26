import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import Storybooks from "@/pages/Storybooks";
import Storybook from "@/pages/Storybook";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/storybooks" element={<Storybooks />} />
        <Route path="/storybooks/:id" element={<Storybook />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;