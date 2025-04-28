import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchMarks, fetchSections } from "@/lib/api";
import { BookOpen, Save, Edit2, FileDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

const Marks = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [marksData, setMarksData] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editMode, setEditMode] = useState(false);

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
      const [marks, sections] = await Promise.all([
        fetchMarks(),
        fetchSections()
      ]);
      setMarksData(marks);
      setSections(sections.map((sec: any) => sec.id));
      if (sections.length > 0) setSelectedSection(sections[0].id);
      if (marks.length > 0) setSelectedSubject(marks[0].course_id);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B+';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    return 'F';
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

  const generatePDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text("Student Marks Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const headers = [["Subject", "Assignments", "Midterm", "Final", "Total", "Grade"]];
  
    const data = prepareStudentChartData().map((subject) => {
      const percentage = (subject.total / 120) * 100;
      const grade = calculateGrade(percentage);

      return [
        subject.name,
        subject.assignments,
        subject.midterm,
        subject.final,
        subject.total,
        grade
      ];
    });

    (doc as any).autoTable({
      startY: 40,
      head: headers,
      body: data,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save("marks_report.pdf");
  };

  const groupMarksByStudent = () => {
    const grouped: any = {};

    marksData.forEach((mark) => {
      const key = `${mark.student_id}_${mark.course_id}`;
      if (!grouped[key]) {
        grouped[key] = {
          studentName: mark.student_name,
          studentId: mark.student_id,
          assignments: 0,
          midterm: 0,
          final: 0
        };
      }
      if (mark.exam_type === "assignment") grouped[key].assignments = mark.marks_obtained;
      if (mark.exam_type === "midterm") grouped[key].midterm = mark.marks_obtained;
      if (mark.exam_type === "final") grouped[key].final = mark.marks_obtained;
    });

    return Object.values(grouped);
  };

  // === Student View ===
  if (userRole === "student") {
    return (
      <Layout title="Academic Performance">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>Your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ReBarChart data={prepareStudentChartData()}>
                  <XAxis dataKey="name" />
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

        <Card>
          <CardHeader>
            <CardTitle>Detailed Subject Marks</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Subject</th>
                    <th className="text-center py-2">Assignments</th>
                    <th className="text-center py-2">Midterm</th>
                    <th className="text-center py-2">Final</th>
                    <th className="text-center py-2">Total</th>
                    <th className="text-center py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {prepareStudentChartData().map((subject) => {
                    const percentage = (subject.total / 120) * 100;
                    const grade = calculateGrade(percentage);
                    return (
                      <tr key={subject.name} className="border-b">
                        <td className="py-3">{subject.name}</td>
                        <td className="text-center py-3">{subject.assignments}</td>
                        <td className="text-center py-3">{subject.midterm}</td>
                        <td className="text-center py-3">{subject.final}</td>
                        <td className="text-center py-3 font-medium">{subject.total}</td>
                        <td className="text-center py-3 font-bold">{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button variant="outline" className="mt-4" onClick={generatePDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Report as PDF
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // === Faculty View ===
  const groupedData = groupMarksByStudent();

  return (
    <Layout title="Faculty - Manage Marks">
      <Card>
        <CardHeader>
          <CardTitle>Faculty Marks Management</CardTitle>
          <CardDescription>Manage and review marks across sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Student Name</th>
                  <th className="text-center py-2">Assignments</th>
                  <th className="text-center py-2">Midterm</th>
                  <th className="text-center py-2">Final</th>
                  <th className="text-center py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((student: any) => {
                  const total = student.assignments + student.midterm + student.final;
                  return (
                    <tr key={student.studentId} className="border-b">
                      <td className="py-3 font-medium">{student.studentName}</td>
                      <td className="text-center py-3">{student.assignments}</td>
                      <td className="text-center py-3">{student.midterm}</td>
                      <td className="text-center py-3">{student.final}</td>
                      <td className="text-center py-3 font-medium">{total}</td>
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
};

export default Marks;
