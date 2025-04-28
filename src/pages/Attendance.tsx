import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit2, Save, AlertCircle, RefreshCw, CheckCircle, XCircle, Calculator, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAttendance } from "@/lib/api";
import { Attendance as AttendanceType } from "@/types/database";

const mockSections = [
  { id: "CSE-A", name: "CSE A Section" },
  { id: "CSE-B", name: "CSE B Section" },
  { id: "CSE-C", name: "CSE C Section" }
];

const TOTAL_CLASSES = 30;

const calculateAttendanceProgress = (currentPercentage: number) => {
  const currentAttendedClasses = Math.round((currentPercentage / 100) * TOTAL_CLASSES);
  const requiredClassesFor75Percent = Math.ceil(0.75 * TOTAL_CLASSES);

  if (currentPercentage < 75) {
    const classesNeeded = requiredClassesFor75Percent - currentAttendedClasses;
    const remainingClasses = TOTAL_CLASSES - currentAttendedClasses;
    if (classesNeeded > remainingClasses) {
      return { canReach75: false, message: `Cannot reach 75%. Need to attend all ${remainingClasses} remaining classes.` };
    }
    return { canReach75: true, message: `Need to attend ${classesNeeded} more class${classesNeeded !== 1 ? 'es' : ''} to reach 75%` };
  } else {
    const classesCanSkip = currentAttendedClasses - requiredClassesFor75Percent;
    return { canReach75: true, message: `Can skip ${classesCanSkip} class${classesCanSkip !== 1 ? 'es' : ''} and still maintain 75%` };
  }
};

const Attendance = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [selectedSection, setSelectedSection] = useState("CSE-A");
  const [editMode, setEditMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) setUserRole(storedRole);
  }, []);

  const toggleEditMode = () => setEditMode(!editMode);
  const saveAttendance = () => { setEditMode(false); setLastUpdated(new Date().toISOString()); };
  const cancelEdit = () => setEditMode(false);
  const isLowAttendance = (percentage: number) => percentage < 75;
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const queryClient = useQueryClient();
  const { data: dbAttendance, refetch } = useQuery({ queryKey: ['attendance'], queryFn: fetchAttendance });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, courseId, date, incHours, isPresent }: { studentId: string, courseId: string, date: string, incHours: number, isPresent: boolean }) => {
      return fetch(`${import.meta.env.VITE_API_URL}/attendance/update-hours`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId, date, incHours, isPresent }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: "Success", description: "Attendance updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update attendance", variant: "destructive" });
      console.error("Error updating attendance:", error);
    }
  });

  const handleAttendanceUpdate = (attendance: AttendanceType, isPresent: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    updateAttendanceMutation.mutate({
      studentId: attendance.student_id,
      courseId: attendance.course_id,
      date: attendance.date || today,
      incHours: 1,
      isPresent
    });
  };

  if (userRole === "student") {
    const overallAttendance = dbAttendance && dbAttendance.length > 0
      ? Math.round(dbAttendance.reduce((sum, att) => sum + (att.total_classes ? (100 * (att.hours_present || 0) / att.total_classes) : 0), 0) / dbAttendance.length)
      : 0;
    const overallProgress = calculateAttendanceProgress(overallAttendance);

    return (
      <Layout title="Attendance">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Overview
            </CardTitle>
            <CardDescription>Your overall attendance for the current semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getAttendanceColor(overallAttendance)}`}>{overallAttendance}%</div>
                <p className="text-gray-500 mt-2">{overallAttendance >= 75 ? "Good Standing" : "Attendance below required percentage (75%)"}</p>
                <p className={`text-sm mt-2 ${overallProgress.canReach75 ? "text-blue-600" : "text-red-600"} font-medium`}>
                  <Calculator className="h-4 w-4 inline mr-1" />
                  {overallProgress.message}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-right">Last updated: {new Date(lastUpdated).toLocaleString()}</div>
          </CardContent>
        </Card>

        <h3 className="text-lg font-medium mb-4">Subject-wise Attendance</h3>

        <div className="space-y-4">
          {dbAttendance?.map((att) => {
            const percentage = att.total_classes && att.total_classes > 0 ? Math.round(100 * (att.hours_present || 0) / att.total_classes) : 0;
            const attendanceProgress = calculateAttendanceProgress(percentage);

            return (
              <Card key={att.attendance_id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{att.course_name}</h4>
                      <p className="text-sm text-gray-600">{att.course_id}</p>
                      <p className="text-sm text-gray-600 mt-1">Faculty: {att.marked_by_faculty || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getAttendanceColor(percentage)}`}>{percentage}%</div>
                      <p className="text-xs text-gray-500">Classes attended: {att.hours_present || 0}/{att.total_classes || 0}</p>
                      <div className={`flex items-center text-xs mt-1 ${attendanceProgress.canReach75 ? "text-blue-600" : "text-red-600"}`}>
                        {isLowAttendance(percentage) ? <AlertCircle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        {attendanceProgress.message}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Layout>
    );
  }

  return <div>Faculty View Coming Soon...</div>;
};

export default Attendance;
