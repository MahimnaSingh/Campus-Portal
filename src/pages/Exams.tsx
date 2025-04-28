"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Upload, 
  BookOpen,
  Users,
  FileEdit,
  FileCheck
} from "lucide-react";
import { fetchExams, fetchExamSubjects, fetchStudentsWithFees, fetchSections } from "@/lib/api";

const Exams = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<"upcoming" | "ongoing" | "completed">("upcoming");
  const [examStartDate, setExamStartDate] = useState<Date>(new Date());
  const [examEndDate, setExamEndDate] = useState<Date>(new Date());

  const examStatusColor: Record<string, string> = {
    completed: "bg-gray-100 text-gray-700",
    ongoing: "bg-green-100 text-green-700",
    upcoming: "bg-blue-100 text-blue-700"
  };
  
  const feeStatusColor: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-red-100 text-red-700"
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchExamSubjectsData(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchData = async () => {
    try {
      const examsData = await fetchExams();
      setExams(examsData);
      if (examsData.length > 0) {
        setSelectedExamId(examsData[0].exam_id);
        setExamStartDate(new Date(examsData[0].start_date));
        setExamEndDate(new Date(examsData[0].end_date));
      }
      const studentsData = await fetchStudentsWithFees();
      setStudents(studentsData);

      const sectionsData = await fetchSections();
      setSections(sectionsData);
      if (sectionsData.length > 0) {
        setSelectedSection(sectionsData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchExamSubjectsData = async (examId: string) => {
    try {
      const subjectsData = await fetchExamSubjects(examId);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching exam subjects:", error);
    }
  };

  const filteredExams = exams.filter(exam => exam.status === currentTab);
  const selectedExam = exams.find(exam => exam.exam_id === selectedExamId);

  if (userRole === "student") {
    // Student View
    return (
      <Layout title="Examinations">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Current Examinations
                </CardTitle>
                <CardDescription>
                  Your examination schedule and information
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-gray-600">Examination Period:</span>
                <span className="font-medium">
                  {examStartDate.toLocaleDateString()} to {examEndDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hall Ticket Status:</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Not Generated Yet
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-medium mb-4">Examination Schedule</h3>

        <div className="space-y-4 mb-8">
          {subjects.map((subject: any) => (
            <Card key={subject.course_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{subject.course_name}</h4>
                    <p className="text-sm text-gray-600">{subject.course_id}</p>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {new Date(subject.exam_date).toLocaleDateString()} | {subject.exam_time}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                Arrive at least 30 minutes before the exam start time
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                Bring your hall ticket and college ID card
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
                Mobile phones and electronic devices are prohibited
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                Use only blue/black pens
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
                No entry for late arrivals after 15 minutes
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              View Complete Exam Guidelines
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  // Faculty View
  return (
    <Layout title="Exam Management">
      <Tabs defaultValue={currentTab} onValueChange={(value: any) => setCurrentTab(value)}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Upload Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <TabsContent value={currentTab} className="mt-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Examinations ({currentTab.charAt(0).toUpperCase() + currentTab.slice(1)})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <Card
                      key={exam.exam_id}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedExamId === exam.exam_id ? 'border-primary' : ''}`}
                      onClick={() => {
                        setSelectedExamId(exam.exam_id);
                        setExamStartDate(new Date(exam.start_date));
                        setExamEndDate(new Date(exam.end_date));
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{exam.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(exam.start_date).toLocaleDateString()} to {new Date(exam.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={examStatusColor[exam.status]}>
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No {currentTab} exams</h3>
                    <p className="text-gray-500">
                      There are currently no exams in this category
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedExam && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedExam.name}</CardTitle>
                    <CardDescription>
                      {new Date(selectedExam.start_date).toLocaleDateString()} to {new Date(selectedExam.end_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <select
                    className="p-2 border rounded-md"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Exam Schedule Table */}
                <h4 className="font-medium mb-2">Examination Schedule</h4>
                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Subject</th>
                        <th className="py-2 text-left">Date</th>
                        <th className="py-2 text-left">Time</th>
                        <th className="py-2 text-left">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject: any) => (
                        <tr key={subject.course_id} className="border-b">
                          <td className="py-2">{subject.course_name}</td>
                          <td className="py-2">{new Date(subject.exam_date).toLocaleDateString()}</td>
                          <td className="py-2">{subject.exam_time}</td>
                          <td className="py-2">{subject.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Student Fee Status Table */}
                <h4 className="font-medium mt-8 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Student Fee Status ({selectedSection})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Student ID</th>
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">Fee Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(stu => stu.section === selectedSection).map(stu => (
                        <tr key={stu.student_id} className="border-b">
                          <td className="py-2">{stu.student_id}</td>
                          <td className="py-2">{stu.name}</td>
                          <td className="py-2">
                            <Badge className={feeStatusColor[stu.fee_status]}>
                              {stu.fee_status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing {students.filter(stu => stu.section === selectedSection).length} students
                </div>
                <Button>
                  Generate Reports
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Exams;
