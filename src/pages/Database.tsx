
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDepartments, fetchCourses, fetchStudents, fetchFaculty, fetchNotices } from "@/lib/api";
import { Department, Course, Student, Faculty, Notice } from "@/types/database";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for offline use (schema updated to match new database)
const mockData = {
  departments: [
    { department_id: 1, department_name: "Computer Science", hod_id: "FAC001" },
    { department_id: 2, department_name: "Electronics Engineering", hod_id: "FAC002" },
    { department_id: 3, department_name: "Mechanical Engineering", hod_id: "FAC003" },
  ],
  courses: [
    { course_id: "CS101", course_name: "Database Management Systems", department_id: 1, department_name: "Computer Science", semester: 3, credits: 4 },
    { course_id: "CS102", course_name: "Object Oriented Programming", department_id: 1, department_name: "Computer Science", semester: 3, credits: 4 },
  ],
  students: [
    { 
      student_id: "STU001", 
      first_name: "John", 
      last_name: "Doe", 
      name: "John Doe",
      dob: "2000-01-15",
      gender: "Male",
      email: "john.doe@example.com", 
      phone: "1234567890", 
      address: "123 College St", 
      department_id: 1, 
      department_name: "Computer Science",
      degree_id: 1,
      degree_name: "B.Tech",
      section: "A",
      batch: "Batch1",
      status: "active",
      blood_group: "O+"
    },
    { 
      student_id: "STU002", 
      first_name: "Jane", 
      last_name: "Smith", 
      name: "Jane Smith",
      dob: "2001-05-22",
      gender: "Female",
      email: "jane.smith@example.com", 
      phone: "0987654321", 
      address: "456 University Ave", 
      department_id: 2, 
      department_name: "Electronics Engineering",
      degree_id: 1,
      degree_name: "B.Tech",
      section: "B",
      batch: "Batch1",
      status: "active",
      blood_group: "A+"
    },
  ],
  faculty: [
    { faculty_id: "FAC001", first_name: "Robert", last_name: "Miller", email: "robert.miller@example.com", department_id: 1, department_name: "Computer Science", designation: "Professor", status: "active" },
    { faculty_id: "FAC002", first_name: "Susan", last_name: "Clark", email: "susan.clark@example.com", department_id: 2, department_name: "Electronics Engineering", designation: "Associate Professor", status: "active" },
  ],
  notices: [
    { notice_id: 1, title: "Exam Schedule Update", description: "Mid-semester exams postponed", issued_by: "FAC001", issued_to: "students", department_id: 1, date_posted: "2023-03-15" },
    { notice_id: 2, title: "Holiday Announcement", description: "College closed for annual day", issued_by: "FAC002", issued_to: "all", department_id: null, date_posted: "2023-03-10" },
  ]
};

const Database = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    departments: false,
    courses: false,
    students: false,
    faculty: false,
    notices: false,
  });
  const [useMockData, setUseMockData] = useState(false);

  const fetchData = async (tab: string) => {
    setIsLoading(prev => ({ ...prev, [tab]: true }));
    
    try {
      if (useMockData) {
        // Use mock data if the checkbox is checked or after a failed API attempt
        switch (tab) {
          case "departments":
            setDepartments(mockData.departments as Department[]);
            break;
          case "courses":
            setCourses(mockData.courses as Course[]);
            break;
          case "students":
            setStudents(mockData.students as Student[]);
            break;
          case "faculty":
            setFaculty(mockData.faculty as Faculty[]);
            break;
          case "notices":
            setNotices(mockData.notices as Notice[]);
            break;
        }
      } else {
        // Try to fetch from the actual API
        try {
          switch (tab) {
            case "departments":
              const deptData = await fetchDepartments();
              setDepartments(deptData);
              break;
            case "courses":
              const courseData = await fetchCourses();
              setCourses(courseData);
              break;
            case "students":
              const studentData = await fetchStudents();
              setStudents(studentData);
              break;
            case "faculty":
              const facultyData = await fetchFaculty();
              setFaculty(facultyData);
              break;
            case "notices":
              const noticeData = await fetchNotices();
              setNotices(noticeData);
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${tab}:`, error);
          toast({
            title: "API Error",
            description: `Failed to fetch from API. Switching to mock data.`,
            variant: "destructive",
          });
          
          // Set mock data as a fallback
          setUseMockData(true);
          switch (tab) {
            case "departments":
              setDepartments(mockData.departments as Department[]);
              break;
            case "courses":
              setCourses(mockData.courses as Course[]);
              break;
            case "students":
              setStudents(mockData.students as Student[]);
              break;
            case "faculty":
              setFaculty(mockData.faculty as Faculty[]);
              break;
            case "notices":
              setNotices(mockData.notices as Notice[]);
              break;
          }
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  const handleTabChange = (tab: string) => {
    fetchData(tab);
  };

  // Fetch departments on initial load
  useEffect(() => {
    fetchData("departments");
  }, []);

  return (
    <Layout title="Database Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Administration</CardTitle>
          <CardDescription>
            View and manage database tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="useMockData"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              className="mr-1"
            />
            <label htmlFor="useMockData" className="text-sm text-gray-500">
              Use mock data (check this if database server is not running)
            </label>
          </div>
          
          <Tabs defaultValue="departments" onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="departments">
              {isLoading.departments ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department ID</TableHead>
                      <TableHead>Department Name</TableHead>
                      <TableHead>HOD ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map(dept => (
                      <TableRow key={dept.department_id}>
                        <TableCell>{dept.department_id}</TableCell>
                        <TableCell>{dept.department_name}</TableCell>
                        <TableCell>{dept.hod_id || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {departments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No departments found. Make sure your database server is running.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="courses">
              {isLoading.courses ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map(course => (
                      <TableRow key={course.course_id}>
                        <TableCell>{course.course_id}</TableCell>
                        <TableCell>{course.course_name}</TableCell>
                        <TableCell>{course.department_name || '-'}</TableCell>
                        <TableCell>{course.semester || '-'}</TableCell>
                        <TableCell>{course.credits || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {courses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No courses found. Make sure your database server is running.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="students">
              {isLoading.students ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Degree</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.student_id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.name || `${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell>{student.department_name || '-'}</TableCell>
                        <TableCell>{student.degree_name || '-'}</TableCell>
                        <TableCell>{student.status || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No students found. Make sure your database server is running.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="faculty">
              {isLoading.faculty ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map(fac => (
                      <TableRow key={fac.faculty_id}>
                        <TableCell>{fac.faculty_id}</TableCell>
                        <TableCell>{`${fac.first_name} ${fac.last_name}`}</TableCell>
                        <TableCell>{fac.email || '-'}</TableCell>
                        <TableCell>{fac.department_name || '-'}</TableCell>
                        <TableCell>{fac.designation || '-'}</TableCell>
                        <TableCell>{fac.status || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {faculty.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No faculty found. Make sure your database server is running.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="notices">
              {isLoading.notices ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Notice ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Issued To</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date Posted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notices.map(notice => (
                      <TableRow key={notice.notice_id}>
                        <TableCell>{notice.notice_id}</TableCell>
                        <TableCell>{notice.title}</TableCell>
                        <TableCell>{notice.issued_to || 'All'}</TableCell>
                        <TableCell>{notice.department_id ? notice.department_name : 'All Departments'}</TableCell>
                        <TableCell>{notice.date_posted ? new Date(notice.date_posted).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {notices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No notices found. Make sure your database server is running.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
        <h3 className="font-medium text-amber-800 mb-2">Database Instructions</h3>
        <ol className="list-decimal list-inside text-amber-700 space-y-2">
          <li>Set up a MySQL database called 'DBMS'</li>
          <li>Import the schema provided to create all necessary tables</li>
          <li>Update the backend/.env file with your database credentials if needed</li>
          <li>Start the Node.js backend server with: <code className="bg-amber-100 px-1 rounded">cd backend && node server.js</code></li>
          <li>If you don't have a database server running, check the "Use mock data" box</li>
        </ol>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Quick Start Guide</h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-blue-700">Option 1: Run with MySQL Database</h4>
            <ol className="list-decimal list-inside text-blue-700 ml-4 space-y-1">
              <li>Install MySQL Server if you haven't already</li>
              <li>Create a database named 'DBMS'</li>
              <li>Run the SQL commands provided to set up the database schema</li>
              <li>Edit backend/.env file with your MySQL credentials</li>
              <li>Run <code className="bg-blue-100 px-1 rounded">cd backend && node server.js</code> to start the backend</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700">Option 2: Use Mock Data</h4>
            <ol className="list-decimal list-inside text-blue-700 ml-4 space-y-1">
              <li>Simply check "Use mock data" in the login page or database page</li>
              <li>For student login, use ID "STU001" with any password</li>
              <li>For faculty login, use ID "FAC001" with any password</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Database;
