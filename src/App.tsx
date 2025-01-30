import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SharedStory from "./components/SharedStory";
import StoryBooks from "./pages/storybooks";
import StoryBook from "./pages/storybooks/[id]";
import StoryBookSettings from "./pages/storybooks/[id]/settings";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordResetConfirm from "./components/PasswordResetConfirm";

// Wrapper component to pass the storyBookId from URL params
const StoryBookSettingsWrapper = () => {
  const params = useParams();
  return <StoryBookSettings storyBookId={params.id!} />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/stories/:shareToken" element={<SharedStory />} />
        <Route path="/storybooks" element={<StoryBooks />} />
        <Route path="/storybooks/:id" element={<StoryBook />} />
        <Route path="/storybooks/:id/settings" element={<StoryBookSettingsWrapper />} />
        <Route path="/reset-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;