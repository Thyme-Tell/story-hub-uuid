import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Profile from "@/pages/Profile";
import SharedStoryPage from "@/pages/SharedStory";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/profile/:id",
    element: <Profile />,
  },
  {
    path: "/shared/:token",
    element: <SharedStoryPage />,
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;