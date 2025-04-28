
import { Link } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { 
  Home, 
  FileText, 
  Calendar, 
  BookOpen, 
  FileSearch, 
  ClipboardCheck,
  Users,
  Bell,
  Clock
} from "lucide-react";

interface NavigationItemsProps {
  userRole: "student" | "faculty";
}

const NavigationItems = ({ userRole }: NavigationItemsProps) => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <Link to="/dashboard">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      
      {userRole === "student" ? (
        <>
          <NavigationMenuItem>
            <Link to="/hallticket">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <FileText className="mr-2 h-4 w-4" />
                HallTicket
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/attendance">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/marks">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <BookOpen className="mr-2 h-4 w-4" />
                Marks
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/exams">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <FileSearch className="mr-2 h-4 w-4" />
                Exams
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link to="/timetable">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Clock className="mr-2 h-4 w-4" />
                TimeTable
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </>
      ) : (
        <>
          <NavigationMenuItem>
            <Link to="/attendance">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/marks">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Marks
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/student-info">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Users className="mr-2 h-4 w-4" />
                Students
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/exams">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <FileSearch className="mr-2 h-4 w-4" />
                Exams
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link to="/notices">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Bell className="mr-2 h-4 w-4" />
                Notices
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link to="/timetable">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                <Clock className="mr-2 h-4 w-4" />
                TimeTable
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </>
      )}
    </NavigationMenuList>
  </NavigationMenu>
);

export default NavigationItems;
