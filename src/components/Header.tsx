
import { Link } from "react-router-dom";
import Logo from "./header/Logo";
import NavigationItems from "./header/NavigationItems";
import UserMenu from "./header/UserMenu";
import { useUserRole } from "@/hooks/useUserRole";
import { User } from "lucide-react";

const Header = () => {
  const userRole = useUserRole();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />
        <NavigationItems userRole={userRole} />
        <div className="flex items-center space-x-4">
          <UserMenu userRole={userRole} />
          <Link 
            to="/profile" 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link 
            to="/" 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Logout
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
