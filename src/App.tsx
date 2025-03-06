
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SharedStory from "./components/SharedStory";
import StoryBooks from "./pages/storybooks";
import StoryBook from "./pages/storybooks/[id]";
import StoryBookSettings from "./pages/storybooks/[id]/settings";
import StoryBookOwnerView from "./pages/storybooks/[id]/owner-view";
import AddStoryPage from "./pages/storybooks/[id]/add-story";
import PasswordResetRequest from "./components/PasswordResetRequest";
import PasswordResetConfirm from "./components/PasswordResetConfirm";
import { AuthProvider } from "./contexts/AuthContext";

// Wrapper component to pass the storyBookId from URL params
const StoryBookSettingsWrapper = () => {
  const params = useParams();
  return <StoryBookSettings storyBookId={params.id!} />;
};

// Wrapper for the AddStoryPage
const AddStoryWrapper = () => {
  const params = useParams();
  return <AddStoryPage storyBookId={params.id!} />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/signin" element={<Navigate to="/sign-in" replace />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/stories/:shareToken" element={<SharedStory />} />
          <Route path="/storybooks" element={<StoryBooks />} />
          <Route path="/storybooks/:id" element={<StoryBook />} />
          <Route path="/storybooks/:id/owner-view" element={<StoryBookOwnerView />} />
          <Route path="/storybooks/:id/settings" element={<StoryBookSettingsWrapper />} />
          <Route path="/storybooks/:id/add-story" element={<AddStoryWrapper />} />
          <Route path="/reset-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password/confirm" element={<PasswordResetConfirm />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
