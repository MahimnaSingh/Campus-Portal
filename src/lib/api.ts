
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

export async function fetchSections(): Promise<string[]> {
  const res = await fetch(`${API_URL}/sections`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchSections failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Optionally validate that data is an array of strings:
  if (!Array.isArray(data) || !data.every((x) => typeof x === "string")) {
    throw new Error("fetchSections: unexpected response format");
  }
  return data;
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

export async function updateAttendance(data: {
  studentId: string;
  courseId: string;
  date: string;
  incHours: number;
  isPresent: boolean;
}): Promise<any> {
  const response = await fetch(`${API_URL}/attendance/update-hours`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update attendance");
  return response.json();
}

export const fetchMarks = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/marks`);
  if (!res.ok) {
    throw new Error("Failed to fetch marks");
  }
  return res.json();
};


export async function fetchNotices(): Promise<Notice[]> {
  const response = await fetch(`${API_URL}/notices`);
  if (!response.ok) throw new Error("Failed to fetch notices");
  return response.json();
}

export async function fetchStudentProfile(studentId: string): Promise<Student> {
  const response = await fetch(`${API_URL}/students/${studentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch student profile (${response.status})`);
  }
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  
  return response.json();
}

export async function loginStudent(studentId: string, password: string) {
  const response = await fetch(`${API_URL}/login/student`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ studentId, password }),
  });
  
  return response.json();
}

export async function loginFaculty(facultyId: string, password: string) {
  const response = await fetch(`${API_URL}/login/faculty`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ facultyId, password }),
  });
  
  return response.json();
}

export const updateMarks = async ({
  markId,
  marksObtained,
}: {
  markId: number;
  marksObtained: number;
}) => {
  const response = await axios.put(`${API_URL}/marks/${markId}`, {
    marks_obtained: marksObtained,
  });
  return response.data;
};

export async function fetchSubjectsWithFaculty() {
  const response = await fetch(`${API_URL}/important-topics/subjects`);
  if (!response.ok) throw new Error("Failed to fetch subjects");
  return response.json();
}

export async function fetchImportantTopics(courseId: string) {
  const response = await fetch(`${API_URL}/important-topics/${courseId}`);
  if (!response.ok) throw new Error("Failed to fetch important topics");
  return response.json();
}

export async function uploadImportantTopic(data: {
  courseId: string;
  facultyId: string;
  topic: string;
  description?: string;
  importantQuestions?: string;
}) {
  const response = await fetch(`${API_URL}/important-topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to upload topic");
  return response.json();
}

export async function fetchCourses() {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  const courses = await response.json();
  return courses;
}

export async function fetchCoursesWithFaculty(): Promise<any[]> {
  const res = await fetch(`${API_URL}/courses`);
  if (!res.ok) throw new Error(`Failed to fetch courses: ${res.status}`);
  return res.json();
}

export async function fetchStudyMaterials(courseId: string): Promise<any[]> {
  const res = await fetch(`${API_URL}/study-materials/${courseId}`);
  if (!res.ok) throw new Error(`Failed to fetch study materials: ${res.status}`);
  return res.json();
}

export async function uploadStudyMaterial(data: {
  courseId: string;
  facultyId: string;
  title: string;
  fileType: string;
  fileLink: string;
}): Promise<any> {
  const res = await fetch(`${API_URL}/study-materials/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function fetchEnrollments(studentId: string) {
  const res = await fetch(`${API_URL}/enrollments?studentId=${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch enrollments');
  return res.json();  // [{ course_id }, …]
}

export async function fetchClassTeacher(section: string, degreeId: number) {
  const res = await fetch(`${API_URL}/faculty-advisor?section=${section}&degreeId=${degreeId}`);
  if (!res.ok) throw new Error('Failed to fetch class teacher');
  return res.json();  // { faculty_id, name, email, phone, … }
}

  