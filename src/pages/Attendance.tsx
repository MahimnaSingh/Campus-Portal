import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Edit2,
  Save,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calculator,
  Plus,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAttendance } from "@/lib/api";
import { Attendance as AttendanceType } from "@/types/database";

const TOTAL_CLASSES = 30;

const calculateAttendanceProgress = (currentPercentage: number) => {
  const attended = Math.round((currentPercentage / 100) * TOTAL_CLASSES);
  const required = Math.ceil(0.75 * TOTAL_CLASSES);

  if (currentPercentage < 75) {
    const needed = required - attended;
    const remaining = TOTAL_CLASSES - attended;
    if (needed > remaining) {
      return {
        canReach75: false,
        message: `Cannot reach 75%. Need to attend all ${remaining} remaining classes.`,
      };
    }
    return {
      canReach75: true,
      message: `Need to attend ${needed} more class${needed !== 1 ? "es" : ""} to reach 75%`,
    };
  } else {
    const skip = attended - required;
    return {
      canReach75: true,
      message: `Can skip ${skip} class${skip !== 1 ? "es" : ""} and still maintain 75%`,
    };
  }
};

export default function Attendance() {
  // Role determination
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  useEffect(() => {
    const stored = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (stored) setUserRole(stored);
  }, []);

  // Shared state
  const [attendanceData, setAttendanceData] = useState<AttendanceType[]>([]);
  const [courseList, setCourseList] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [editMode, setEditMode] = useState(false);
  const [deltaMap, setDeltaMap] = useState<{
    [attendanceId: number]: { present: number; absent: number };
  }>({});

  const queryClient = useQueryClient();

  // Fetch data
  const { data: dbAttendance, refetch } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
  });

  // Mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async (params: {
      studentId: string;
      courseId: string;
      date: string;
      incHours: number;
      isPresent: boolean;
    }) => {
      console.log("💥 Calling update-hours with:", params);
      console.log("🔗 API URL:", import.meta.env.VITE_API_URL);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/attendance/update-hours`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("❌ update-hours failed:", res.status, text);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("✅ update-hours response:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Success", description: "Attendance updated successfully" });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update attendance",
        variant: "destructive",
      });
      console.error("Mutation error:", err);
    },
  });
  const { mutateAsync: updateMutateAsync } = updateAttendanceMutation;

  // Build derived state when data arrives
  useEffect(() => {
    if (dbAttendance) {
      setAttendanceData(dbAttendance);
      const map: Record<string, string> = {};
      dbAttendance.forEach((a) => {
        map[a.course_id] = a.course_name || a.course_id;
      });
      const list = Object.entries(map).map(([id, name]) => ({ id, name }));
      setCourseList(list);
      if (!selectedCourse && list.length) setSelectedCourse(list[0].id);
      setDeltaMap({});
    }
  }, [dbAttendance]);

  // Handlers
  const toggleEditMode = () => setEditMode((v) => !v);
  const cancelEdit = () => {
    setDeltaMap({});
    setEditMode(false);
  };
  const onSave = async () => {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const tasks: Promise<any>[] = [];

    Object.entries(deltaMap).forEach(([idStr, { present, absent }]) => {
      const id = Number(idStr);
      const att = attendanceData.find((a) => a.attendance_id === id);
      if (!att) return;

      const formattedDate = att.date
        ? new Date(att.date).toISOString().split("T")[0]
        : today;

      if (present !== 0) {
        tasks.push(
          updateMutateAsync({
            studentId: att.student_id,
            courseId: att.course_id,
            date: formattedDate,
            incHours: present,
            isPresent: true,
          })
        );
      }
      if (absent !== 0) {
        tasks.push(
          updateMutateAsync({
            studentId: att.student_id,
            courseId: att.course_id,
            date: formattedDate,
            incHours: absent,
            isPresent: false,
          })
        );
      }
    });

    await Promise.all(tasks);
    setDeltaMap({});
    setEditMode(false);
    setLastUpdated(new Date().toISOString());
    refetch();
  };

  const handleLocalUpdate = (
    id: number,
    isPresent: boolean,
    delta: number
  ) => {
    setDeltaMap((prev) => {
      const existing = prev[id] || { present: 0, absent: 0 };
      const updated = isPresent
        ? { ...existing, present: existing.present + delta }
        : { ...existing, absent: existing.absent + delta };
      return { ...prev, [id]: updated };
    });
  };

  // ─── STUDENT VIEW ─────────────────────────────────────────────────────────
  if (userRole === "student") {
    const overall =
      attendanceData.length > 0
        ? Math.round(
            attendanceData.reduce((sum, a) => {
              const pct = a.total_classes
                ? (100 * (a.hours_present || 0)) / a.total_classes
                : 0;
              return sum + pct;
            }, 0) / attendanceData.length
          )
        : 0;
    const overallProg = calculateAttendanceProgress(overall);

    return (
      <Layout title="Attendance">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Overview
            </CardTitle>
            <CardDescription>Your overall attendance this semester</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div
                  className={`text-5xl font-bold ${
                    overall >= 90
                      ? "text-green-600"
                      : overall >= 75
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {overall}%
                </div>
                <p className="text-gray-500 mt-2">
                  {overall >= 75 ? "Good Standing" : "Below required (75%)"}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    overallProg.canReach75 ? "text-blue-600" : "text-red-600"
                  } font-medium`}
                >
                  <Calculator className="h-4 w-4 inline mr-1" />
                  {overallProg.message}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-right">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <h3 className="text-lg font-medium mb-4">Subject-wise Attendance</h3>
        <div className="space-y-4">
          {attendanceData.map((a) => {
            const pct = a.total_classes
              ? Math.round((100 * (a.hours_present || 0)) / a.total_classes)
              : 0;
            const prog = calculateAttendanceProgress(pct);
            return (
              <Card key={a.attendance_id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{a.course_name}</h4>
                      <p className="text-sm text-gray-600">{a.course_id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Faculty: {a.marked_by_faculty || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          pct >= 90
                            ? "text-green-600"
                            : pct >= 75
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {pct}%
                      </div>
                      <p className="text-xs text-gray-500">
                        Attended: {Math.round(a.hours_present || 0)}/
                        {Math.round(a.total_classes || 0)}
                      </p>
                      <div
                        className={`flex items-center text-xs mt-1 ${
                          prog.canReach75 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {pct < 75 ? (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {prog.message}
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

  // ─── FACULTY VIEW ─────────────────────────────────────────────────────────
  const filtered = selectedCourse
    ? attendanceData.filter((a) => a.course_id === selectedCourse)
    : attendanceData;

  return (
    <Layout title="Attendance Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
          <CardDescription>Manage student attendance per course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Course</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courseList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              {!editMode ? (
                <Button onClick={toggleEditMode} variant="secondary">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={onSave} variant="default">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}

              <Button onClick={() => void refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>

            <div className="text-sm text-gray-500 mb-2 col-span-4 flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" />
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          </div>
        </CardContent>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              Student Attendance:{" "}
              {courseList.find((c) => c.id === selectedCourse)?.name ||
                "All Courses"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Roll No.</th>
                    <th className="text-left py-2 font-medium">Student Name</th>
                    <th className="text-center py-2 font-medium">
                      Hours Present
                    </th>
                    <th className="text-center py-2 font-medium">Hours Absent</th>
                    <th className="text-center py-2 font-medium">
                      Total Classes
                    </th>
                    <th className="text-center py-2 font-medium">
                      Attendance %
                    </th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const basePresent = Math.round(a.hours_present || 0);
                    const baseAbsent = Math.round(a.hours_absent || 0);
                    const del = deltaMap[a.attendance_id] || {
                      present: 0,
                      absent: 0,
                    };
                    const displayedPresent = basePresent + del.present;
                    const displayedAbsent = baseAbsent + del.absent;
                    const totalClasses = a.total_classes || 0;
                    const pct = totalClasses
                      ? Math.round((100 * displayedPresent) / totalClasses)
                      : 0;
                    const prog = calculateAttendanceProgress(pct);

                    return (
                      <tr
                        key={`${a.student_id}-${a.course_id}`}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3">{a.student_id}</td>
                        <td className="py-3">{a.student_name}</td>

                        {/* HOURS PRESENT */}
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!editMode}
                              onClick={() =>
                                handleLocalUpdate(a.attendance_id, true, +1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="mx-2">{displayedPresent}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!editMode || displayedPresent <= 0}
                              onClick={() =>
                                handleLocalUpdate(a.attendance_id, true, -1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>

                        {/* HOURS ABSENT */}
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!editMode}
                              onClick={() =>
                                handleLocalUpdate(a.attendance_id, false, +1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="mx-2">{displayedAbsent}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!editMode || displayedAbsent <= 0}
                              onClick={() =>
                                handleLocalUpdate(a.attendance_id, false, -1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>

                        <td className="py-3 text-center">{totalClasses}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`font-medium ${
                              pct < 75 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {pct < 75 ? (
                                  <Badge
                                    variant="destructive"
                                    className="flex items-center w-fit"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Detention Risk
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 flex items-center w-fit"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Good Standing
                                  </Badge>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>{prog.message}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {filtered.length} student(s)
            </div>
          </CardFooter>
        </Card>
      </Card>
    </Layout>
  );
}
