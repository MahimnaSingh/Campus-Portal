import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchMarks } from "@/lib/api"; // ✅ Fetch real marks
import { BookOpen, Save, Edit2, AlertTriangle, XCircle, BarChart, FileDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

const Marks = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [marksData, setMarksData] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [tempMarks, setTempMarks] = useState({});
  const [showStats, setShowStats] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const studentId = userData.student_id;

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetchMarks();
      setMarksData(data);
      if (data.length > 0) {
        setSelectedCourse(data[0].course_id);
      }
    } catch (error) {
      console.error("Failed to fetch marks:", error);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
    } else {
      setTempMarks(JSON.parse(JSON.stringify(marksData)));
      setEditMode(true);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setTempMarks({});
  };

  const calculateTotal = (studentMarks: any[]) => {
    const total = studentMarks.reduce((acc, m) => acc + m.marks_obtained, 0);
    return total;
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'O', points: 10 };
    if (percentage >= 80) return { grade: 'A+', points: 9 };
    if (percentage >= 70) return { grade: 'A', points: 8 };
    if (percentage >= 60) return { grade: 'B+', points: 7 };
    if (percentage >= 50) return { grade: 'B', points: 6 };
    if (percentage >= 40) return { grade: 'C', points: 5 };
    return { grade: 'F', points: 0 };
  };

  const prepareStudentChartData = () => {
    const subjectMap: any = {};

    marksData
      .filter((m) => m.student_id === studentId)
      .forEach((mark) => {
        if (!subjectMap[mark.course_name]) {
          subjectMap[mark.course_name] = { assignments: 0, midterm: 0, final: 0 };
        }
        if (mark.exam_type === "assignment") subjectMap[mark.course_name].assignments = mark.marks_obtained;
        else if (mark.exam_type === "midterm") subjectMap[mark.course_name].midterm = mark.marks_obtained;
        else if (mark.exam_type === "final") subjectMap[mark.course_name].final = mark.marks_obtained;
      });

    return Object.keys(subjectMap).map((name) => ({
      name,
      ...subjectMap[name],
      total: subjectMap[name].assignments + subjectMap[name].midterm + subjectMap[name].final,
    }));
  };

  const prepareStudentPerformanceData = () => {
    const chartData = prepareStudentChartData();
    return [
      { name: 'Excellent', value: chartData.filter(c => c.total >= 100).length },
      { name: 'Good', value: chartData.filter(c => c.total >= 80 && c.total < 100).length },
      { name: 'Average', value: chartData.filter(c => c.total >= 60 && c.total < 80).length },
      { name: 'Poor', value: chartData.filter(c => c.total < 60).length }
    ];
  };

  const prepareClassStatsData = () => {
    const courseMarks = marksData.filter((m) => m.course_id === selectedCourse);
    const studentGroups: any = {};

    courseMarks.forEach((mark) => {
      if (!studentGroups[mark.student_id]) {
        studentGroups[mark.student_id] = [];
      }
      studentGroups[mark.student_id].push(mark);
    });

    const stats = {
      assignments: 0,
      midterm: 0,
      final: 0,
      total: 0,
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    };

    const studentCount = Object.keys(studentGroups).length;

    for (const student in studentGroups) {
      const marks = studentGroups[student];
      const total = calculateTotal(marks);

      if (total >= 100) stats.excellent++;
      else if (total >= 80) stats.good++;
      else if (total >= 60) stats.average++;
      else stats.poor++;

      marks.forEach((m) => {
        if (m.exam_type === "assignment") stats.assignments += m.marks_obtained;
        if (m.exam_type === "midterm") stats.midterm += m.marks_obtained;
        if (m.exam_type === "final") stats.final += m.marks_obtained;
      });

      stats.total += total;
    }

    if (studentCount > 0) {
      stats.assignments = Math.round(stats.assignments / studentCount);
      stats.midterm = Math.round(stats.midterm / studentCount);
      stats.final = Math.round(stats.final / studentCount);
      stats.total = Math.round(stats.total / studentCount);
    }

    return stats;
  };

  const classPerformanceData = () => {
    const stats = prepareClassStatsData();
    return [
      { name: 'Excellent', value: stats.excellent },
      { name: 'Good', value: stats.good },
      { name: 'Average', value: stats.average },
      { name: 'Poor', value: stats.poor }
    ];
  };

  if (userRole === "student") {
    const studentMarks = marksData.filter((m) => m.student_id === studentId);

    return (
      <Layout title="Academic Performance">
        {/* --- Top Overview --- */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Your academic performance across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ReBarChart data={prepareStudentChartData()}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="assignments" fill="#1E88E5" />
                  <Bar dataKey="midterm" fill="#7CB342" />
                  <Bar dataKey="final" fill="#FFB74D" />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>
                Categorization of your performance across subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prepareStudentPerformanceData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label
                  >
                    {prepareStudentPerformanceData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* --- Detailed Marks --- */}
        <h3 className="text-lg font-medium mb-4">Detailed Subject Marks</h3>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Subject</th>
                    <th className="text-center py-2">Assignments (50)</th>
                    <th className="text-center py-2">Midterm (50)</th>
                    <th className="text-center py-2">Final (20)</th>
                    <th className="text-center py-2">Total</th>
                    <th className="text-center py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {prepareStudentChartData().map((subject) => {
                    const percentage = (subject.total / 120) * 100;
                    const { grade } = calculateGrade(percentage);

                    return (
                      <tr key={subject.name} className="border-b">
                        <td className="py-3 font-medium">{subject.name}</td>
                        <td className="text-center py-3">{subject.assignments}</td>
                        <td className="text-center py-3">{subject.midterm}</td>
                        <td className="text-center py-3">{subject.final}</td>
                        <td className="text-center py-3 font-medium">{subject.total}</td>
                        <td className="text-center py-3">
                          <span className={`font-bold ${
                            grade === 'F' ? 'text-red-600' :
                            grade === 'O' || grade === 'A+' ? 'text-green-600' :
                            'text-amber-600'
                          }`}>
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  } else {
    return (
      <Layout title="Faculty Marks Management">
        {/* Faculty Side Work Here */}
        {/* Same structure, we can continue after student part working perfectly */}
        <div className="text-gray-600 p-10">
          Faculty view is still under construction in this version.
        </div>
      </Layout>
    );
  }
};

export default Marks;
