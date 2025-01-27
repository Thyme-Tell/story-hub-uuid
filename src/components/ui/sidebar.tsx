import { Home, LogIn, User, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
} from "@/components/ui/shadcn-sidebar";

export function AppSidebar() {
  const menuItems = [
    {
      title: "Home",
      icon: Home,
      to: "/",
    },
    {
      title: "Sign In",
      icon: LogIn,
      to: "/signin",
    },
    {
      title: "Profile",
      icon: User,
      to: "/profile",
    },
    {
      title: "Storybooks",
      icon: BookOpen,
      to: "/storybooks",
    },
  ];

  return (
    <ShadcnSidebar>
      <ShadcnSidebarContent>
        <ShadcnSidebarGroup>
          <ShadcnSidebarGroupContent>
            {menuItems.map((item) => (
              <Link 
                key={item.title} 
                to={item.to}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </ShadcnSidebarGroupContent>
        </ShadcnSidebarGroup>
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}