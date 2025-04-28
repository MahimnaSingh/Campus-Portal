
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, BookOpenCheck, BookOpen, InfoIcon, Settings } from "lucide-react";

interface UserMenuProps {
  userRole: "student" | "faculty";
}

const UserMenu = ({ userRole }: UserMenuProps) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={moreMenuRef}>
      <button 
        className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-md"
        onClick={() => setShowMoreMenu(!showMoreMenu)}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      
      {showMoreMenu && (
        <div className="absolute right-0 top-full mt-1 w-[200px] bg-white shadow-lg rounded-md z-50">
          <ul className="py-2">
            {userRole === "student" ? (
              <>
                <li>
                  <Link 
                    to="/important-topics"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Important Topics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/study-material"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Study Material
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/info"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <InfoIcon className="mr-2 h-4 w-4" />
                    Info
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/important-topics"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Course Topics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/study-material"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Teaching Material
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/settings"
                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
