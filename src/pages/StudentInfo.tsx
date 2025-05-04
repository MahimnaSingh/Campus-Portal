// src/pages/StudentInfo.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Phone, Mail, Search, BarChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  fetchSections,
  fetchCoursesWithFaculty,
  fetchStudents,
  fetchAttendance,
  fetchFacultyMarks
} from "@/lib/api";
import {
  Attendance as AttendanceType,
  Mark as MarkType,
  Student,
  Course
} from "@/types/database";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

interface Section { id: string; name: string }
interface DisplayStudent {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  attendancePct: number;
  totalMarks: number;
  status: "Good" | "Needs improvement";
}

export default function StudentInfo() {
  // ─── CONTEXT ────────────────────────────────────────────────
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as
      | "student"
      | "faculty"
      | null;
    setUserRole(role || "student");

    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(stored);
    } else {
      const ud = JSON.parse(localStorage.getItem("userData") || "{}");
      if (role === "faculty" && ud.faculty_id) setUserId(ud.faculty_id);
      if (role === "student" && ud.student_id) setUserId(ud.student_id);
    }
  }, []);

  // ─── FETCH DATA ───────────────────────────────────────────
  const { data: sections = [], isLoading: loadingSections } = useQuery<Section[], Error>({
    queryKey: ["sections"],
    queryFn: fetchSections,
  });

  const { data: courses = [], isLoading: loadingCourses } = useQuery<Course[], Error>({
    queryKey: ["facultyCourses", userId],
    queryFn: () => fetchCoursesWithFaculty(userId!),
    enabled: !!userId && userRole === "faculty"
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery<Student[], Error>({
    queryKey: ["students"],
    queryFn: fetchStudents
  });

  const { data: attendanceData = [], isLoading: loadingAttendance } = useQuery<
    AttendanceType[],
    Error
  >({
    queryKey: ["attendance"],
    queryFn: fetchAttendance
  });

  const { data: marksData = [], isLoading: loadingMarks } = useQuery<MarkType[], Error>({
    queryKey: ["facultyMarks", userId],
    queryFn: () => fetchFacultyMarks(userId!),
    enabled: !!userId && userRole === "faculty"
  });

  // ─── UI STATE ─────────────────────────────────────────────
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  useEffect(() => {
    if (sections.length && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections]);

  useEffect(() => {
    if (courses.length && !selectedSubject) {
      setSelectedSubject(courses[0].course_id);
    }
  }, [courses]);

  // ─── COMPUTE DISPLAY LIST ─────────────────────────────────
  const displayStudents: DisplayStudent[] =
    userRole === "faculty" && selectedSubject
      ? students
          .filter((s) => s.section === selectedSection)
          .filter((s) =>
            marksData.some(
              (m) =>
                m.student_id === s.student_id &&
                m.course_id === selectedSubject
            )
          )
          .filter((s) => {
            const fullname = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
            return (
              fullname.includes(searchQuery.toLowerCase()) ||
              s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
          .map((s) => {
            const att = attendanceData.find(
              (a) =>
                a.student_id === s.student_id &&
                a.course_id === selectedSubject
            );
            const attendancePct =
              att && att.total_classes
                ? Math.round(((att.hours_present || 0) / att.total_classes) * 100)
                : 0;

            const relevant = marksData.filter(
              (m) =>
                m.student_id === s.student_id &&
                m.course_id === selectedSubject
            );
            const totalMarks = relevant.reduce(
              (sum, m) => sum + (m.marks_obtained || 0),
              0
            );

            return {
              id: s.student_id,
              name: `${s.first_name || ""} ${s.last_name || ""}`.trim(),
              phone: s.phone,
              email: s.email,
              attendancePct,
              totalMarks,
              status:
                attendancePct < 75 || totalMarks < 0.6 * 120
                  ? "Needs improvement"
                  : "Good"
            };
          })
      : [];

  // ─── LOADING GUARD ────────────────────────────────────────
  if (
    loadingSections ||
    loadingCourses ||
    loadingStudents ||
    loadingAttendance ||
    loadingMarks
  ) {
    return (
      <Layout title="Student Information">
        <p className="text-center py-10">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout title="Student Information">
      {/* ─── FILTER BAR ───────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Search by name or ID
              </label>
              <div className="flex">
                <Input
                  className="flex-1"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="ml-2">
                  <Search className="h-4 w-4 mr-1" />
                  Go
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── STUDENT LIST ─────────────────────────────────────── */}
      <div className="space-y-6 pb-12">
        {displayStudents.length === 0 ? (
          <Card>
            <CardContent className="text-center text-gray-500 py-10">
              No students found in <strong>{selectedSection}</strong> for{" "}
              <strong>
                {courses.find((c) => c.course_id === selectedSubject)
                  ?.course_name || selectedSubject}
              </strong>.
            </CardContent>
          </Card>
        ) : (
          displayStudents.map((st) => (
            <Card key={st.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{st.name}</CardTitle>
                    <p className="text-sm text-gray-500">{st.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      {st.phone || "—"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      {st.email || "—"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Attendance %</th>
                        <th className="py-2 text-left">Total Marks</th>
                        <th className="py-2 text-left">Status</th>
                        <th className="py-2 text-left">Stats</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">
                          <span
                            className={
                              st.attendancePct < 75
                                ? "text-red-600 font-bold"
                                : "text-green-600 font-bold"
                            }
                          >
                            {st.attendancePct}%
                          </span>
                        </td>
                        <td className="py-2">{st.totalMarks}</td>
                        <td className="py-2">{st.status}</td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowStatsDialog(true)}
                          >
                            <BarChart className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ─── STATS DIALOG ─────────────────────────────────────── */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Distribution for{" "}
              {
                courses.find((c) => c.course_id === selectedSubject)
                  ?.course_name
              }
            </DialogTitle>
            <DialogDescription>
              Section: {selectedSection}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "<75%",
                        value: displayStudents.filter(
                          (s) => s.attendancePct < 75
                        ).length
                      },
                      {
                        name: "≥75%",
                        value: displayStudents.filter(
                          (s) => s.attendancePct >= 75
                        ).length
                      }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={50}
                    label
                  >
                    {["#ef4444", "#22c55e"].map((col, i) => (
                      <Cell key={i} fill={col} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "<60%",
                        value: displayStudents.filter(
                          (s) => s.totalMarks < 0.6 * 120
                        ).length
                      },
                      {
                        name: "≥60%",
                        value: displayStudents.filter(
                          (s) => s.totalMarks >= 0.6 * 120
                        ).length
                      }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    outerRadius={50}
                    label
                  >
                    {["#ef4444", "#22c55e"].map((col, i) => (
                      <Cell key={i} fill={col} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
