import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchMarks,
  fetchFacultyCourses,
  fetchStudentsByFaculty,
  fetchFacultyMarks,
  updateMarks
} from "@/lib/api";
import {
  BookOpen,
  Save,
  Edit2,
  FileDown,
  BarChart
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Mark, Student, Course } from "@/types/database";

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

export default function Marks() {
  const { toast } = useToast();

  // Role & ID
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [userId, setUserId]     = useState<string>("");

  // Data
  const [marksData, setMarksData]             = useState<Mark[]>([]);
  const [sections, setSections]               = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents]               = useState<Student[]>([]);
  const [courses, setCourses]                 = useState<Course[]>([]);

  // Edit
  const [editMode, setEditMode]               = useState(false);
  const [tempMarks, setTempMarks]             = useState<Record<string,{ marks_obtained:number; total_marks:number; mark_id?:string }>>({});

  // Stats dialog
  const [showStats, setShowStats]             = useState(false);
  const [examType, setExamType]               = useState<Mark['exam_type']>('midterm');

  // UI state
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState<string|null>(null);

  // For student view
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const studentId = userData.student_id;

  // Load data
  const loadInitialData = async (role:string, id:string) => {
    setError(null);
    if (role === "student") {
      setMarksData(await fetchMarks());
    } else {
      const [fCourses, fStudents, fMarks] = await Promise.all([
        fetchFacultyCourses(id),
        fetchStudentsByFaculty(id),
        fetchFacultyMarks(id)
      ]);
      setCourses(fCourses);
      if (fCourses.length) setSelectedSubject(fCourses[0].course_id);

      setStudents(fStudents);
      const secs = Array.from(new Set(fStudents.map(s=>s.section||"")));
      setSections(secs);
      if (secs.length) setSelectedSection(secs[0]);

      setMarksData(fMarks);
    }
  };

  // Retry loader
  const retryLoad = () => {
    setIsLoading(true);
    setError(null);

    const role = (localStorage.getItem("userRole") as "student"|"faculty"|null) || "student";
    setUserRole(role);

    const id = role === "faculty"
      ? (localStorage.getItem("userId")||"")
      : studentId;
    setUserId(id);

    loadInitialData(role, id)
      .catch(()=>setError("Failed to load data"))
      .finally(()=>setIsLoading(false));
  };

  useEffect(retryLoad, []);

  // Grade helper
  const calculateGrade = (pct:number) => {
    if (pct>=90) return 'O';
    if (pct>=80) return 'A+';
    if (pct>=70) return 'A';
    if (pct>=60) return 'B+';
    if (pct>=50) return 'B';
    if (pct>=40) return 'C';
    return 'F';
  };

  // --- Student view helpers ---
  const prepareStudentChartData = () => {
    const map: Record<string,{ assignments:number; midterm:number; final:number }> = {};
    marksData.filter(m=>m.student_id===studentId).forEach(m=>{
      if (!map[m.course_id]) map[m.course_id] = { assignments:0, midterm:0, final:0 };
      if (m.exam_type==='assignment') map[m.course_id].assignments = m.marks_obtained!;
      if (m.exam_type==='midterm')     map[m.course_id].midterm     = m.marks_obtained!;
      if (m.exam_type==='final')       map[m.course_id].final       = m.marks_obtained!;
    });
    return Object.entries(map).map(([name,v])=>({
      name, ...v, total:v.assignments+v.midterm+v.final
    }));
  };

  const prepareStudentPerformanceData = () => {
    const data = prepareStudentChartData();
    return [
      { name:'Excellent', value:data.filter(d=>d.total>=100).length },
      { name:'Good',      value:data.filter(d=>d.total>=80 && d.total<100).length },
      { name:'Average',   value:data.filter(d=>d.total>=60 && d.total<80).length },
      { name:'Poor',      value:data.filter(d=>d.total<50).length },
    ];
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Marks Report",14,22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`,14,30);

    const headers = [["Subject","Assignments","Midterm","Final","Total","Grade"]];
    const body = prepareStudentChartData().map(s=>{
      const p=(s.total/120)*100;
      return [s.name,s.assignments,s.midterm,s.final,s.total,calculateGrade(p)];
    });

    (doc as any).autoTable({
      startY:40,
      head:headers,
      body,
      theme:"grid",
      styles:{fontSize:10},
      headStyles:{fillColor:[22,160,133]}
    });
    doc.save("marks_report.pdf");
  };

  // --- Faculty stats helpers ---
  const prepareClassStatsData = () => {
    const arr = marksData.filter(
      m=>m.course_id===selectedSubject && m.exam_type===examType
    );
    if (!arr.length) return {
      averageScore:0, highestMark:0, lowestMark:0,
      excellentCount:0, goodCount:0, averageCount:0, poorCount:0
    };
    let total=0, high=0, low=100, exc=0, goodCnt=0, avgCnt=0, poorCnt=0;
    arr.forEach(m=>{
      const p = (m.marks_obtained! / m.total_marks!)*100;
      total += p;
      high = Math.max(high,p);
      low  = Math.min(low,p);
      if (p>=90) exc++;
      else if (p>=70) goodCnt++;
      else if (p>=50) avgCnt++;
      else poorCnt++;
    });
    return {
      averageScore: total/arr.length,
      highestMark: high,
      lowestMark: low,
      excellentCount: exc,
      goodCount: goodCnt,
      averageCount: avgCnt,
      poorCount: poorCnt
    };
  };

  const classPerformanceData = () => {
    const s = prepareClassStatsData();
    return [
      { name:'Excellent', value:s.excellentCount },
      { name:'Good',      value:s.goodCount },
      { name:'Average',   value:s.averageCount },
      { name:'Poor',      value:s.poorCount }
    ];
  };

  // Loading / Error fallbacks
  if (isLoading) {
    return (
      <Layout title="Academic Performance">
        <div className="flex items-center justify-center h-64">
          <p>Loading…</p>
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout title="Academic Performance">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
          <Button onClick={retryLoad}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  // --- STUDENT VIEW ---
  if (userRole === "student") {
    const chartData = prepareStudentChartData();
    const pieData   = prepareStudentPerformanceData();

    return (
      <Layout title="Academic Performance">
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5"/> Performance Overview
              </CardTitle>
              <CardDescription>Your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ReBarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fontSize:10}}/>
                  <YAxis/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="assignments" name="Assignments" fill={COLORS[0]}/>
                  <Bar dataKey="midterm"     name="Midterm"     fill={COLORS[1]}/>
                  <Bar dataKey="final"       name="Final"       fill={COLORS[2]}/>
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
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label
                  >
                    {pieData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Detailed Subject Marks</CardTitle></CardHeader>
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
                  {chartData.map(s=>{
                    const pct = (s.total/120)*100;
                    return (
                      <tr key={s.name} className="border-b">
                        <td className="py-3">{s.name}</td>
                        <td className="text-center py-3">{s.assignments}</td>
                        <td className="text-center py-3">{s.midterm}</td>
                        <td className="text-center py-3">{s.final}</td>
                        <td className="text-center py-3 font-medium">{s.total}</td>
                        <td className="text-center py-3 font-bold">
                          {calculateGrade(pct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-sm text-gray-500">
              Total Records: {marksData.length}
            </span>
            <Button variant="outline" onClick={generatePDF}>
              <FileDown className="mr-2 h-4 w-4"/> Download Report
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  // --- FACULTY VIEW ---
  const filteredStudents = students.filter(s=>s.section===selectedSection);
  const stats       = prepareClassStatsData();
  const performance = classPerformanceData();

  const toggleEditMode = async () => {
    if (editMode) {
      try {
        await Promise.all(Object.entries(tempMarks).map(([sid,md])=>
          md.mark_id
            ? updateMarks({
                markId: Number(md.mark_id),
                marksObtained: md.marks_obtained,
                totalMarks: md.total_marks
              })
            : Promise.resolve()
        ));
        toast({ title:"Saved", description:"Marks updated." });
      } catch (err) {
        console.error("Error saving marks:", err);
        toast({ variant:"destructive", title:"Error", description:"Failed to save marks." });
      } finally {
        setEditMode(false);
        await loadInitialData("faculty", userId);
      }
    } else {
      const tm:any = {};
      filteredStudents.forEach(s=>{
        const ex = marksData.find(m=>
          m.student_id===s.student_id &&
          m.course_id===selectedSubject &&
          m.exam_type===examType
        );
        tm[s.student_id] = {
          marks_obtained: ex?.marks_obtained||0,
          total_marks: ex?.total_marks||100,
          mark_id: ex?.mark_id
        };
      });
      setTempMarks(tm);
      setEditMode(true);
    }
  };

  return (
    <Layout title="Marks Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Marks Management</CardTitle>
          <CardDescription>
            Manage and update student marks for your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Section */}
            <div>
              <label className="text-sm font-medium mb-1 block">Section</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedSection}
                onChange={e=>setSelectedSection(e.target.value)}
              >
                <option value="">-- select --</option>
                {sections.map(sec=>(
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            {/* Subject */}
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedSubject}
                onChange={e=>setSelectedSubject(e.target.value)}
              >
                <option value="">-- select --</option>
                {courses.map((c, idx)=>(
                  <option key={`${c.course_id}-${idx}`} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Exam Type */}
            <div>
              <label className="text-sm font-medium mb-1 block">Exam Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={examType}
                onChange={e=>setExamType(e.target.value as Mark['exam_type'])}
              >
                {["midterm","final","quiz","assignment"].map(v=>(
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase()+v.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Actions */}
            <div className="flex items-end space-x-2">
              <Button
                variant={editMode?"default":"outline"}
                onClick={toggleEditMode}
                disabled={!filteredStudents.length||!selectedSubject}
              >
                {editMode
                  ? <>
                      <Save className="mr-2 h-4 w-4"/>
                      Save Marks
                    </>
                  : <>
                      <Edit2 className="mr-2 h-4 w-4"/>
                      Edit Marks
                    </>
                }
              </Button>
              <Button
                variant="outline"
                onClick={()=>setShowStats(true)}
                disabled={!filteredStudents.length||!selectedSubject}
              >
                <BarChart className="mr-2 h-4 w-4"/> View Statistics
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            {selectedSubject && courses.find(c=>c.course_id===selectedSubject)?.course_name} &mdash; {selectedSection}
          </div>
        </CardContent>
      </Card>

      {/* Student Marks Table */}
      <Card>
        <CardHeader><CardTitle>Student Marks</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Student ID</th>
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-center">Obtained</th>
                  <th className="py-2 text-center">Total</th>
                  <th className="py-2 text-center">%</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s=>{
                    const ex = marksData.find(m=>
                      m.student_id===s.student_id &&
                      m.course_id===selectedSubject &&
                      m.exam_type===examType
                    );
                    const curr = editMode
                      ? tempMarks[s.student_id]
                      : {
                          marks_obtained: ex?.marks_obtained||0,
                          total_marks:    ex?.total_marks   ||100
                        };
                    const pct = curr.total_marks
                      ? (curr.marks_obtained/curr.total_marks)*100
                      : 0;
                    const good = pct >= 50;

                    return (
                      <tr key={s.student_id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{s.student_id}</td>
                        <td className="py-2">{s.name}</td>
                        <td className="py-2 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              min={0}
                              max={curr.total_marks}
                              className="w-16 p-1 border rounded text-center"
                              value={curr.marks_obtained}
                              onChange={e=>{
                                const v=Number(e.target.value);
                                setTempMarks(tm=>({
                                  ...tm,
                                  [s.student_id]:{...tm[s.student_id],marks_obtained:v}
                                }));
                              }}
                            />
                          ) : curr.marks_obtained}
                        </td>
                        <td className="py-2 text-center">
                          {editMode ? (
                            <input
                              type="number"
                              min={1}
                              className="w-16 p-1 border rounded text-center"
                              value={curr.total_marks}
                              onChange={e=>{
                                const v=Number(e.target.value);
                                setTempMarks(tm=>({
                                  ...tm,
                                  [s.student_id]:{...tm[s.student_id],total_marks:v}
                                }));
                              }}
                            />
                          ) : curr.total_marks}
                        </td>
                        <td className="py-2 text-center">{pct.toFixed(1)}%</td>
                        <td className="py-2 text-center">
                          {good
                            ? <span className="text-green-600">Good</span>
                            : <span className="text-red-600">Needs improvements !!</span>}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No students found for this section
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-sm text-gray-500">
            Showing {filteredStudents.length} students in “{selectedSection}”
          </span>
        </CardFooter>
      </Card>

      {/* Statistics Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>Class Performance Statistics</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Average / High / Low</h3>
              <div style={{ width:"100%", height:250 }}>
                <ResponsiveContainer>
                  <ReBarChart
                    data={[
                      { name:"Avg",  value:stats.averageScore, fill:COLORS[0] },
                      { name:"High", value:stats.highestMark,  fill:COLORS[1] },
                      { name:"Low",  value:stats.lowestMark,   fill:COLORS[2] }
                    ]}
                  >
                    <XAxis dataKey="name"/>
                    <YAxis domain={[0,100]}/>
                    <Tooltip formatter={(v:number)=>`${v.toFixed(1)}%`}/>
                    <Bar dataKey="value" label={{ position:"top", formatter:(v:number)=>`${v.toFixed(1)}%` }}>
                      <Cell/><Cell/><Cell/>
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Performance Distribution</h3>
              <div style={{ width:"100%", height:250 }} className="flex items-center justify-center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={performance}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label
                    >
                      {performance.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {performance.map((e,i)=>(
                  <div key={i} className="flex items-center text-xs">
                    <div className="w-3 h-3 mr-2" style={{ backgroundColor:COLORS[i%COLORS.length] }}/>
                    {e.name}: {e.value}
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium mb-2">Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>Section: <strong>{selectedSection}</strong></p>
                <p>Subject: <strong>{courses.find(c=>c.course_id===selectedSubject)?.course_name}</strong></p>
                <p>Exam Type: <strong>{examType}</strong></p>
                <p>Total Students: <strong>{filteredStudents.length}</strong></p>
                <p>Class Average: <strong>{stats.averageScore.toFixed(1)}%</strong></p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={()=>setShowStats(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
