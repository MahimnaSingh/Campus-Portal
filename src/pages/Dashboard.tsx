
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects, semesterInfo } from "@/data/mockData";
import { 
  FileText, 
  Calendar, 
  BookOpen, 
  FileSearch, 
  BookOpenCheck, 
  Info,
  Users,
  ClipboardList,
  Upload,
  PenTool,
  Clock
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const importantNotice = {
  title: "Exam Schedule Update",
  content: "Due to the upcoming holiday, all examinations scheduled for next Friday have been postponed to the following Monday. Please check your email for detailed information."
};

const Dashboard = () => {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [showNotice, setShowNotice] = useState(false);
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    // Show notice only once when the student logs in
    const hasSeenNotice = sessionStorage.getItem("hasSeenNotice") === "true";
    if (!hasSeenNotice && storedRole === "student") {
      setShowNotice(true);
      sessionStorage.setItem("hasSeenNotice", "true");
    }
  }, []);

  const totalAttendance = subjects.reduce((acc, subject) => acc + subject.attendance, 0) / subjects.length;
  const upcomingExams = new Date(semesterInfo.examStartDate) > new Date();

  const classesTaught = 4;
  const pendingGrades = 28;
  const totalStudents = 120;

  return (
    <Layout title={userRole === "student" ? "Student Dashboard" : "Faculty Dashboard"}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">{currentDate}</p>
        </div>
        <h2 className="text-xl font-medium">Welcome Back, {userRole === "student" ? "Student" : "Professor"}</h2>
        <p className="text-gray-600">
          {semesterInfo.current} | {upcomingExams ? 'Upcoming' : 'Ongoing'} Exams
        </p>
      </div>

      {userRole === "student" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/attendance')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Attendance
                </CardTitle>
                <CardDescription>Overall attendance percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalAttendance.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-500 mt-2">{totalAttendance >= 75 ? 'Good standing' : 'Need improvement'}</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/hallticket')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Hall Ticket
                </CardTitle>
                <CardDescription>Exam registration status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium">
                  {upcomingExams ? 'Registration Open' : 'Exams in Progress'}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {upcomingExams 
                    ? `Register by ${new Date(semesterInfo.registrationDeadline).toLocaleDateString()}` 
                    : `Exams end on ${new Date(semesterInfo.examEndDate).toLocaleDateString()}`}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/marks')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  Marks
                </CardTitle>
                <CardDescription>Academic performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium">
                  {subjects.length} Courses
                </div>
                <p className="text-sm text-gray-500 mt-2">View detailed marks breakdown</p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-medium mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/exams')}
            >
              <FileSearch className="h-8 w-8 text-primary mb-2" />
              <span>Exams</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/timetable')}
            >
              <Clock className="h-8 w-8 text-primary mb-2" />
              <span>Time Table</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/study-material')}
            >
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <span>Study Material</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/info')}
            >
              <Info className="h-8 w-8 text-primary mb-2" />
              <span>Info</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/student-info')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Students
                </CardTitle>
                <CardDescription>Total students in your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalStudents}
                </div>
                <p className="text-sm text-gray-500 mt-2">Across {classesTaught} courses</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/marks')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                  Pending Grades
                </CardTitle>
                <CardDescription>Assignments to be graded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {pendingGrades}
                </div>
                <p className="text-sm text-gray-500 mt-2">Deadline in 3 days</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/timetable')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Class Schedule
                </CardTitle>
                <CardDescription>Today's classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium">
                  3 Classes Today
                </div>
                <p className="text-sm text-gray-500 mt-2">Next: Database Systems at 11:30 AM</p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-medium mb-4">Faculty Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/study-material')}
            >
              <Upload className="h-8 w-8 text-primary mb-2" />
              <span>Upload Materials</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/marks')}
            >
              <PenTool className="h-8 w-8 text-primary mb-2" />
              <span>Grade Assignments</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/important-topics')}
            >
              <BookOpenCheck className="h-8 w-8 text-primary mb-2" />
              <span>Add Topics</span>
            </div>
            
            <div 
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate('/exams')}
            >
              <FileSearch className="h-8 w-8 text-primary mb-2" />
              <span>Exam Management</span>
            </div>
          </div>
        </>
      )}

      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{importantNotice.title}</h2>
            <p className="text-gray-700 mb-4">{importantNotice.content}</p>
            <Button className="w-full" onClick={() => setShowNotice(false)}>
              Acknowledge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
