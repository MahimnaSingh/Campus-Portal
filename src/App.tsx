
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import HallTicket from "./pages/HallTicket";
import Attendance from "./pages/Attendance";
import Marks from "./pages/Marks";
import Exams from "./pages/Exams";
import ImportantTopics from "./pages/ImportantTopics";
import StudyMaterial from "./pages/StudyMaterial";
import Info from "./pages/Info";
import PaymentPortal from "./pages/PaymentPortal";
import StudentInfo from "./pages/StudentInfo";
import Notices from "./pages/Notices";
import TimeTable from "./pages/TimeTable";
import RoleSelection from "./pages/RoleSelection";
import StudentLogin from "./pages/StudentLogin";
import FacultyLogin from "./pages/FacultyLogin";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login-student" element={<StudentLogin />} />
          <Route path="/login-faculty" element={<FacultyLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hallticket" element={<HallTicket />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/important-topics" element={<ImportantTopics />} />
          <Route path="/study-material" element={<StudyMaterial />} />
          <Route path="/info" element={<Info />} />
          <Route path="/payment-portal" element={<PaymentPortal />} />
          <Route path="/student-info" element={<StudentInfo />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
