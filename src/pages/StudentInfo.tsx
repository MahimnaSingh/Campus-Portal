
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Mail, AlertCircle, Search, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart as Chart } from "recharts";

// Mock data for students
const mockStudents = [
  {
    id: "S001",
    name: "Arun Kumar",
    rollNumber: "CSE18001",
    department: "Computer Science",
    email: "arun.kumar@university.edu",
    phone: "9876543210",
    parentPhone: "9876543211",
    parentEmail: "parent.arun@gmail.com",
    attendance: {
      "Data Structures": 85,
      "Database Systems": 78,
      "Computer Networks": 92
    },
    marks: {
      "Data Structures": { internal: 42, midterm: 38, assignment: 18 },
      "Database Systems": { internal: 38, midterm: 35, assignment: 16 },
      "Computer Networks": { internal: 45, midterm: 40, assignment: 19 }
    }
  },
  {
    id: "S002",
    name: "Priya Sharma",
    rollNumber: "CSE18002",
    department: "Computer Science",
    email: "priya.sharma@university.edu",
    phone: "9876543220",
    parentPhone: "9876543221",
    parentEmail: "parent.priya@gmail.com",
    attendance: {
      "Data Structures": 72,
      "Database Systems": 65,
      "Computer Networks": 68
    },
    marks: {
      "Data Structures": { internal: 35, midterm: 32, assignment: 15 },
      "Database Systems": { internal: 30, midterm: 28, assignment: 14 },
      "Computer Networks": { internal: 32, midterm: 30, assignment: 15 }
    }
  },
  {
    id: "S003",
    name: "Rahul Verma",
    rollNumber: "CSE18003",
    department: "Computer Science",
    email: "rahul.verma@university.edu",
    phone: "9876543230",
    parentPhone: "9876543231",
    parentEmail: "parent.rahul@gmail.com",
    attendance: {
      "Data Structures": 90,
      "Database Systems": 88,
      "Computer Networks": 85
    },
    marks: {
      "Data Structures": { internal: 45, midterm: 42, assignment: 20 },
      "Database Systems": { internal: 43, midterm: 40, assignment: 19 },
      "Computer Networks": { internal: 42, midterm: 38, assignment: 18 }
    }
  }
];

// Mock data for sections and subjects
const mockSections = [
  { id: "CSE-A", name: "CSE A Section" },
  { id: "CSE-B", name: "CSE B Section" },
  { id: "CSE-C", name: "CSE C Section" }
];

const mockSubjects = [
  { id: "DS", name: "Data Structures" },
  { id: "DB", name: "Database Systems" },
  { id: "CN", name: "Computer Networks" }
];

const StudentInfo = () => {
  const [selectedSection, setSelectedSection] = useState("CSE-A");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [statsSubject, setStatsSubject] = useState(mockSubjects[0].name);

  // Filter students based on search query and selected filters
  const handleSearch = () => {
    const filtered = mockStudents.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === "all" || 
        student.attendance[selectedSubject] !== undefined;
      
      return matchesSearch && matchesSubject;
    });
    
    setFilteredStudents(filtered);
  };

  // Check if attendance is below threshold
  const isLowAttendance = (attendance) => {
    return attendance < 75;
  };

  // Check if marks are below passing threshold (60% of total - 120*0.6 = 72)
  const isLowMarks = (marks) => {
    const total = marks.internal + marks.midterm + marks.assignment;
    return total < 72; // 60% of 120
  };

  const handleShowStats = (subject) => {
    setStatsSubject(subject);
    setShowStatsDialog(true);
  };

  // Generate stats data for selected subject
  const generateStatsData = (subject) => {
    // Attendance distribution
    const attendanceData = [
      { name: "Below 60%", count: 0, color: "#ef4444" },
      { name: "60-75%", count: 0, color: "#f97316" },
      { name: "75-85%", count: 0, color: "#eab308" },
      { name: "Above 85%", count: 0, color: "#22c55e" }
    ];
    
    mockStudents.forEach(student => {
      const attendance = student.attendance[subject];
      if (attendance < 60) attendanceData[0].count++;
      else if (attendance >= 60 && attendance < 75) attendanceData[1].count++;
      else if (attendance >= 75 && attendance < 85) attendanceData[2].count++;
      else attendanceData[3].count++;
    });
    
    // Marks distribution
    const marksData = [
      { name: "Below 60", count: 0, color: "#ef4444" },
      { name: "60-80", count: 0, color: "#f97316" },
      { name: "80-100", count: 0, color: "#eab308" },
      { name: "Above 100", count: 0, color: "#22c55e" }
    ];
    
    mockStudents.forEach(student => {
      const marks = student.marks[subject];
      const total = marks.internal + marks.midterm + marks.assignment;
      
      if (total < 60) marksData[0].count++;
      else if (total >= 60 && total < 80) marksData[1].count++;
      else if (total >= 80 && total < 100) marksData[2].count++;
      else marksData[3].count++;
    });
    
    return { attendanceData, marksData };
  };

  return (
    <Layout title="Student Information">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-4 md:grid-cols-4">
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
                <option value="all">All Subjects</option>
                {mockSubjects.map(subject => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Search by Name or Roll Number</label>
              <div className="flex">
                <Input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch} 
                  className="ml-2"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {filteredStudents.map(student => (
          <Card key={student.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{student.name}</CardTitle>
                  <p className="text-sm text-gray-500">{student.rollNumber} | {student.department}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="marks">Marks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Student Contact</h4>
                      <div className="space-y-2">
                        <p className="text-sm flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {student.phone}
                        </p>
                        <p className="text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Parent Contact</h4>
                      <div className="space-y-2">
                        <p className="text-sm flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {student.parentPhone}
                        </p>
                        <p className="text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {student.parentEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="attendance">
                  <div className="space-y-4">
                    {Object.entries(student.attendance).map(([subject, percentage]) => (
                      <div key={subject} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center">
                          <span className="mr-2">{subject}</span>
                          {isLowAttendance(percentage) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className={`font-bold ${isLowAttendance(percentage) ? 'text-red-500' : 'text-green-600'}`}>
                            {percentage}%
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-4"
                            onClick={() => handleShowStats(subject)}
                          >
                            <BarChart className="h-4 w-4" />
                            <span className="ml-1">Stats</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="marks">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Subject</th>
                          <th className="text-center py-2">Internal (50)</th>
                          <th className="text-center py-2">Midterm (50)</th>
                          <th className="text-center py-2">Assignment (20)</th>
                          <th className="text-center py-2">Total</th>
                          <th className="text-center py-2">Status</th>
                          <th className="text-center py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(student.marks).map(([subject, marks]) => {
                          const total = marks.internal + marks.midterm + marks.assignment;
                          const lowMarks = isLowMarks(marks);
                          
                          return (
                            <tr key={subject} className="border-b">
                              <td className="py-2">{subject}</td>
                              <td className="text-center py-2">{marks.internal}</td>
                              <td className="text-center py-2">{marks.midterm}</td>
                              <td className="text-center py-2">{marks.assignment}</td>
                              <td className="text-center py-2 font-medium">
                                {total}
                              </td>
                              <td className="text-center py-2">
                                {lowMarks && (
                                  <AlertCircle className="inline h-5 w-5 text-red-500" />
                                )}
                              </td>
                              <td className="text-center py-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleShowStats(subject)}
                                >
                                  <BarChart className="h-4 w-4" />
                                  <span className="ml-1">Stats</span>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Statistics Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{statsSubject} - Class Statistics</DialogTitle>
            <DialogDescription>
              Performance overview for {selectedSection}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div>
              <h3 className="text-md font-medium mb-3">Attendance Distribution</h3>
              <div className="h-[200px] w-full bg-gray-50 p-4 rounded-md flex justify-around items-end">
                {generateStatsData(statsSubject).attendanceData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-sm font-medium">{item.count}</div>
                    <div 
                      style={{ 
                        height: `${Math.max(20, item.count * 50)}px`, 
                        backgroundColor: item.color,
                        width: '40px'
                      }}
                      className="rounded-t-md"
                    />
                    <div className="text-xs mt-1">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Marks Distribution</h3>
              <div className="h-[200px] w-full bg-gray-50 p-4 rounded-md flex justify-around items-end">
                {generateStatsData(statsSubject).marksData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-sm font-medium">{item.count}</div>
                    <div 
                      style={{ 
                        height: `${Math.max(20, item.count * 50)}px`, 
                        backgroundColor: item.color,
                        width: '40px'
                      }}
                      className="rounded-t-md"
                    />
                    <div className="text-xs mt-1">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Note: Statistics are based on all students in {selectedSection}.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudentInfo;
