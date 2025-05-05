import { Department, Course, Student, Faculty, Attendance, Mark, Notice } from "@/types/database";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export async function fetchExams() {
  const response = await fetch(`${API_URL}/exams`);
  if (!response.ok) throw new Error("Failed to fetch exams");
  return response.json();
}

export async function fetchExamSubjects(examId: string) {
  const response = await fetch(`${API_URL}/exam-subjects/${examId}`);
  if (!response.ok) throw new Error("Failed to fetch exam subjects");
  return response.json();
}

export async function fetchStudentsWithFees() {
  const response = await fetch(`${API_URL}/students-with-fees`);
  if (!response.ok) throw new Error("Failed to fetch students with fees");
  return response.json();
}

export async function fetchSections() {
  const response = await fetch(`${API_URL}/sections`);
  if (!response.ok) throw new Error("Failed to fetch sections");
  return response.json();
}

export async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch(`${API_URL}/departments`);
  if (!response.ok) throw new Error("Failed to fetch departments");
  return response.json();
}

export async function fetchTimetable() {
  const response = await fetch(`${API_URL}/timetable/generate`);
  if (!response.ok) throw new Error("Failed to fetch timetable");
  return response.json();
}

export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch(`${API_URL}/students`);
  if (!response.ok) throw new Error("Failed to fetch students");
  return response.json();
}

export async function fetchFaculty(): Promise<Faculty[]> {
  const response = await fetch(`${API_URL}/faculty`);
  if (!response.ok) throw new Error("Failed to fetch faculty");
  return response.json();
}

export async function fetchAttendance(): Promise<Attendance[]> {
  const response = await fetch(`${API_URL}/attendance`);
  if (!response.ok) throw new Error("Failed to fetch attendance");
  return response.json();
}

export async function updateAttendance(data: { studentId: string; courseId: string; date: string; incHours: number; isPresent: boolean; facultyId?: string }): Promise<any> {
  const response = await fetch(`${API_URL}/attendance/update-hours`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!response.ok) throw new Error("Failed to update attendance");
  return response.json();
}

export async function fetchMarks(): Promise<Mark[]> {
  const res = await fetch(`${API_URL}/marks`);
  if (!res.ok) throw new Error("Failed to fetch marks");
  return res.json();
}

export async function fetchFacultyMarks(facultyId: string): Promise<Mark[]> {
  const res = await fetch(`${API_URL}/marks?facultyId=${encodeURIComponent(facultyId)}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch marks for faculty ${facultyId}`);
  return res.json();
}

export const updateMarks = async ({ markId, marksObtained, totalMarks }: { markId: number; marksObtained: number; totalMarks?: number }) => {
  const payload: Record<string, any> = { marks_obtained: marksObtained };
  if (typeof totalMarks === "number") payload.total_marks = totalMarks;
  const response = await axios.put(`${API_URL}/marks/${markId}`, payload, { withCredentials: true });
  return response.data;
};

export async function addMark(data: { student_id: string; course_id: string; exam_type: string; marks_obtained: number; total_marks: number; exam_date: string }): Promise<Mark> {
  const res = await fetch(`${API_URL}/marks`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error("Failed to add mark");
  return res.json();
}

export async function fetchNotices(): Promise<Notice[]> {
  const response = await fetch(`${API_URL}/notices`);
  if (!response.ok) throw new Error("Failed to fetch notices");
  return response.json();
}

export async function fetchStudentProfile(studentId: string): Promise<Student> {
  const response = await fetch(`${API_URL}/students/${studentId}`, { credentials: "include" });
  if (!response.ok) throw new Error(`Failed to fetch student profile (${response.status})`);
  return response.json();
}

export async function fetchFacultyProfile(): Promise<Faculty> {
  const response = await fetch(`${API_URL}/faculty/profile`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch faculty profile");
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
  return response.json();
}

export async function loginStudent(studentId: string, password: string) {
  const response = await fetch(`${API_URL}/login/student`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId, password }) });
  return response.json();
}

export async function loginFaculty(facultyId: string, password: string) {
  const response = await fetch(`${API_URL}/login/faculty`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ facultyId, password }) });
  return response.json();
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) throw new Error("Failed to fetch courses");
  return response.json();
}

export async function fetchCoursesWithFaculty(facultyId: string): Promise<Course[]> {
  const res = await fetch(`${API_URL}/courses?facultyId=${encodeURIComponent(facultyId)}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch courses for faculty ${facultyId}`);
  return res.json();
}

export async function fetchStudentsByFaculty(facultyId: string): Promise<Student[]> {
  const res = await fetch(`${API_URL}/students?facultyId=${encodeURIComponent(facultyId)}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch students for faculty ${facultyId}`);
  return res.json();
}

export async function fetchEnrollments(studentId: string) {
  const res = await fetch(`${API_URL}/enrollments?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error("Failed to fetch enrollments");
  return res.json();
}

export async function fetchClassTeacher(section: string, degreeId: number) {
  const res = await fetch(`${API_URL}/faculty-advisor?section=${encodeURIComponent(section)}&degreeId=${degreeId}`);
  if (!res.ok) throw new Error("Failed to fetch class teacher");
  return res.json();
}

export interface CoursePayload { courseId: string; courseName: string; facultyName: string; facultyId: string }
export interface MaterialPayload { material_id: number; material_title: string; file_url: string; file_type: string }
export interface TopicPayload { topic_id: number; topic_title: string; topic_description: string; important_questions: string; date_posted: string }
export interface UploadParams { courseId: string; facultyId: string; topic: string; description: string; importantQuestions: string }

export async function fetchSubjectsWithFaculty(): Promise<CoursePayload[]> {
  const response = await fetch(`${API_URL}/important-topics/subjects`);
  if (!response.ok) throw new Error("Failed to fetch subjects");
  return response.json();
}

export async function fetchImportantTopics(courseId: string): Promise<TopicPayload[]> {
  const res = await fetch(`${API_URL}/important-topics/${courseId}`);
  if (!res.ok) throw new Error("Failed to fetch important topics");
  return res.json();
}

export async function uploadImportantTopic({ courseId, facultyId, topic, description, importantQuestions }: UploadParams): Promise<TopicPayload> {
  const res = await fetch(`${API_URL}/important-topics`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, facultyId, topic, description, importantQuestions }) });
  if (!res.ok) throw new Error("Failed to upload important topic");
  return res.json();
}

export async function fetchStudyMaterials(courseId: string): Promise<MaterialPayload[]> {
  const res = await fetch(`${API_URL}/study-materials/${courseId}`);
  if (!res.ok) throw new Error(`Failed to fetch study materials: ${res.status}`);
  return res.json();
}

export async function uploadStudyMaterial(form: FormData): Promise<{ material_id: number; file_url: string }> {
  const res = await fetch(`${API_URL}/study-materials/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function fetchFacultyCourses(facultyId: string): Promise<Course[]> {
  const res = await fetch(`${API_URL}/courses?facultyId=${encodeURIComponent(facultyId)}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch courses for faculty ${facultyId}`);
  return res.json();
}
