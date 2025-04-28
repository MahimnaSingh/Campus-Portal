
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subjects } from "@/data/mockData";
import { BookOpen, Save, Edit2, AlertTriangle, XCircle, BarChart, FileDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data
const mockSections = [
  { id: "CSE-A", name: "CSE A Section" },
  { id: "CSE-B", name: "CSE B Section" },
  { id: "CSE-C", name: "CSE C Section" }
];

const mockStudents = [
  { id: "S001", name: "Arun Kumar", rollNumber: "CSE18001" },
  { id: "S002", name: "Priya Sharma", rollNumber: "CSE18002" },
  { id: "S003", name: "Rahul Verma", rollNumber: "CSE18003" },
  { id: "S004", name: "Neha Gupta", rollNumber: "CSE18004" },
  { id: "S005", name: "Vikram Singh", rollNumber: "CSE18005" },
  { id: "S006", name: "Meera Patel", rollNumber: "CSE18006" }
];

// Mock marks data structure
const generateRandomMarks = () => {
  const marksData = {};
  mockStudents.forEach(student => {
    marksData[student.id] = {};
    subjects.forEach(subject => {
      marksData[student.id][subject.id] = {
        assignments: Math.floor(Math.random() * 11) + 30, // 30-40
        midterm: Math.floor(Math.random() * 11) + 30, // 30-40
        final: Math.floor(Math.random() * 6) + 15 // 15-20
      };
    });
  });
  return marksData;
};

const initialMarksData = generateRandomMarks();

// CGPA calculation
const calculateGrade = (total) => {
  if (total >= 90) return { grade: 'O', points: 10 };
  if (total >= 80) return { grade: 'A+', points: 9 };
  if (total >= 70) return { grade: 'A', points: 8 };
  if (total >= 60) return { grade: 'B+', points: 7 };
  if (total >= 50) return { grade: 'B', points: 6 };
  if (total >= 40) return { grade: 'C', points: 5 };
  return { grade: 'F', points: 0 };
};

const Marks = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [selectedSection, setSelectedSection] = useState("CSE-A");
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "");
  const [marksData, setMarksData] = useState(initialMarksData);
  const [editMode, setEditMode] = useState(false);
  const [tempMarks, setTempMarks] = useState({});
  const [showStats, setShowStats] = useState(false);
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
    } else {
      setTempMarks(JSON.parse(JSON.stringify(marksData)));
      setEditMode(true);
    }
  };
  
  // Save marks changes
  const saveMarks = () => {
    setMarksData(tempMarks);
    setEditMode(false);
  };
  
  // Update marks for a student
  const updateMarks = (studentId, examType, value) => {
    const maxValues = {
      assignments: 50,
      midterm: 50,
      final: 20
    };
    
    const sanitizedValue = Math.min(maxValues[examType], Math.max(0, parseInt(value, 10) || 0));
    
    setTempMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [selectedSubject]: {
          ...prev[studentId][selectedSubject],
          [examType]: sanitizedValue
        }
      }
    }));
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditMode(false);
    setTempMarks({});
  };
  
  // Calculate total marks
  const calculateTotal = (marks) => {
    return marks.assignments + marks.midterm + marks.final;
  };
  
  // Prepare chart data for student view
  const prepareChartData = () => {
    return subjects.map(subject => {
      const marks = subject.marks;
      
      return {
        name: subject.name,
        assignments: marks.assignments,
        midterm: marks.midterm,
        final: marks.final,
        total: marks.assignments + marks.midterm + marks.final
      };
    });
  };
  
  // Prepare statistics data for faculty view
  const prepareClassStatsData = () => {
    const stats = {
      assignments: 0,
      midterm: 0,
      final: 0,
      total: 0,
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0
    };
    
    let studentCount = 0;
    
    // Calculate averages
    Object.values(marksData).forEach((studentData: any) => {
      if (studentData[selectedSubject]) {
        stats.assignments += studentData[selectedSubject].assignments;
        stats.midterm += studentData[selectedSubject].midterm;
        stats.final += studentData[selectedSubject].final;
        
        const total = calculateTotal(studentData[selectedSubject]);
        stats.total += total;
        
        // Categorize performance
        if (total >= 100) stats.excellent++;
        else if (total >= 80) stats.good++;
        else if (total >= 60) stats.average++;
        else stats.poor++;
        
        studentCount++;
      }
    });
    
    if (studentCount > 0) {
      stats.assignments = Math.round(stats.assignments / studentCount);
      stats.midterm = Math.round(stats.midterm / studentCount);
      stats.final = Math.round(stats.final / studentCount);
      stats.total = Math.round(stats.total / studentCount);
    }
    
    return stats;
  };
  
  // Performance data for pie chart
  const studentPerformanceData = [
    { name: 'Excellent', value: subjects.filter(s => {
      const total = s.marks.assignments + s.marks.midterm + s.marks.final;
      return total >= 100;
    }).length },
    { name: 'Good', value: subjects.filter(s => {
      const total = s.marks.assignments + s.marks.midterm + s.marks.final;
      return total >= 80 && total < 100;
    }).length },
    { name: 'Average', value: subjects.filter(s => {
      const total = s.marks.assignments + s.marks.midterm + s.marks.final;
      return total >= 60 && total < 80;
    }).length },
    { name: 'Poor', value: subjects.filter(s => {
      const total = s.marks.assignments + s.marks.midterm + s.marks.final;
      return total < 60;
    }).length }
  ];
  
  // Class performance distribution data
  const classPerformanceData = () => {
    const stats = prepareClassStatsData();
    return [
      { name: 'Excellent', value: stats.excellent },
      { name: 'Good', value: stats.good },
      { name: 'Average', value: stats.average },
      { name: 'Poor', value: stats.poor }
    ];
  };
  
  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#F44336'];

  if (userRole === "student") {
    // Student View
    return (
      <Layout title="Academic Performance">
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
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <ReBarChart data={prepareChartData()}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis max={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assignments" name="Assignments (50)" fill="#1E88E5" />
                    <Bar dataKey="midterm" name="Midterm (50)" fill="#7CB342" />
                    <Bar dataKey="final" name="Final (20)" fill="#FFB74D" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
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
              <div style={{ width: '100%', height: 220 }} className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {studentPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {studentPerformanceData.map((entry, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name}: {entry.value} subjects
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <th className="text-center py-2">Total (120)</th>
                    <th className="text-center py-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => {
                    const total = subject.marks.assignments + subject.marks.midterm + subject.marks.final;
                    const { grade } = calculateGrade(Math.round((total / 120) * 100));
                    
                    return (
                      <tr key={subject.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-xs text-gray-500">{subject.code}</div>
                          </div>
                        </td>
                        <td className="text-center py-3">{subject.marks.assignments}</td>
                        <td className="text-center py-3">{subject.marks.midterm}</td>
                        <td className="text-center py-3">{subject.marks.final}</td>
                        <td className="text-center py-3 font-medium">{total}</td>
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
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Total Subjects: {subjects.length}
            </div>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  } else {
    // Faculty View
    const classStats = prepareClassStatsData();
    const classPerformance = classPerformanceData();
    
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
            <div className="grid gap-4 mb-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Section</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {mockSections.map(section => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant={editMode ? "default" : "outline"} 
                  onClick={toggleEditMode}
                  className="mr-2 flex-1"
                >
                  {editMode ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Marks
                    </>
                  )}
                </Button>
                
                {editMode && (
                  <Button variant="outline" onClick={cancelEdit}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">
                {subjects.find(s => s.id === selectedSubject)?.name || "Subject"} - {selectedSection}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowStats(true)}>
                <BarChart className="mr-2 h-4 w-4" />
                View Statistics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Student Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Roll No.</th>
                    <th className="text-left py-2 font-medium">Student Name</th>
                    <th className="text-center py-2 font-medium">Assignments (50)</th>
                    <th className="text-center py-2 font-medium">Midterm (50)</th>
                    <th className="text-center py-2 font-medium">Final (20)</th>
                    <th className="text-center py-2 font-medium">Total (120)</th>
                    <th className="text-center py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((student) => {
                    const marks = editMode 
                      ? tempMarks[student.id]?.[selectedSubject] || marksData[student.id]?.[selectedSubject] || { assignments: 0, midterm: 0, final: 0 }
                      : marksData[student.id]?.[selectedSubject] || { assignments: 0, midterm: 0, final: 0 };
                    
                    const total = calculateTotal(marks);
                    const needsAttention = total < 60; // Below 50% of total marks
                    
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{student.rollNumber}</td>
                        <td className="py-3">{student.name}</td>
                        
                        {/* Assignments Marks */}
                        <td className="py-3 text-center">
                          {editMode ? (
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              value={marks.assignments}
                              onChange={(e) => updateMarks(student.id, 'assignments', e.target.value)}
                              className="w-16 p-1 border rounded text-center mx-auto block"
                            />
                          ) : (
                            <span>{marks.assignments}</span>
                          )}
                        </td>
                        
                        {/* Midterm Marks */}
                        <td className="py-3 text-center">
                          {editMode ? (
                            <input 
                              type="number" 
                              min="0"
                              max="50"
                              value={marks.midterm}
                              onChange={(e) => updateMarks(student.id, 'midterm', e.target.value)}
                              className="w-16 p-1 border rounded text-center mx-auto block"
                            />
                          ) : (
                            <span>{marks.midterm}</span>
                          )}
                        </td>
                        
                        {/* Final Marks */}
                        <td className="py-3 text-center">
                          {editMode ? (
                            <input 
                              type="number" 
                              min="0"
                              max="20"
                              value={marks.final}
                              onChange={(e) => updateMarks(student.id, 'final', e.target.value)}
                              className="w-16 p-1 border rounded text-center mx-auto block"
                            />
                          ) : (
                            <span>{marks.final}</span>
                          )}
                        </td>
                        
                        {/* Total */}
                        <td className="py-3 text-center font-medium">
                          {total}
                        </td>
                        
                        {/* Status */}
                        <td className="py-3 text-center">
                          {needsAttention && (
                            <div className="flex items-center justify-center text-xs text-amber-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs improvement
                            </div>
                          )}
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
              Showing {mockStudents.length} students from {selectedSection}
            </div>
            {editMode && (
              <Button onClick={saveMarks}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Class Statistics Dialog */}
        <Dialog open={showStats} onOpenChange={setShowStats}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Class Performance Statistics</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div>
                <h3 className="text-md font-medium mb-2">Average Marks</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <ReBarChart data={[
                      { name: 'Assignments', value: classStats.assignments, fill: '#1E88E5' },
                      { name: 'Midterm', value: classStats.midterm, fill: '#7CB342' },
                      { name: 'Final', value: classStats.final, fill: '#FFB74D' },
                      { name: 'Total', value: classStats.total / 3, fill: '#5E35B1' }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" label={{ position: 'top' }}>
                        {[
                          <Cell key="1" fill="#1E88E5" />,
                          <Cell key="2" fill="#7CB342" />,
                          <Cell key="3" fill="#FFB74D" />,
                          <Cell key="4" fill="#5E35B1" />
                        ]}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2">Performance Distribution</h3>
                <div style={{ width: '100%', height: 250 }} className="flex items-center justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={classPerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={3}
                        dataKey="value"
                        label
                      >
                        {classPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {classPerformance.map((entry, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name}: {entry.value} students
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-md font-medium mb-2">Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>Section: {selectedSection}</p>
                  <p>Subject: {subjects.find(s => s.id === selectedSubject)?.name}</p>
                  <p>Total Students: {mockStudents.length}</p>
                  <p>Average Score: {classStats.total} / 120 ({(classStats.total / 120 * 100).toFixed(1)}%)</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowStats(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }
};

export default Marks;
