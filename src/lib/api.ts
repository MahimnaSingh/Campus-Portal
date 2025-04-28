
import { Department, Course, Student, Faculty, Attendance, Mark, Notice } from "@/types/database";
import axios from "axios";

// Use an environment variable with a fallback for local development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ---------------------------------------------
// Exams APIs
// ---------------------------------------------

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
  const response = await fetch(`${import.meta.env.VITE_API_URL}/sections`);
  if (!response.ok) {
    throw new Error("Failed to fetch sections");
  }
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

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) throw new Error("Failed to fetch courses");
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
  const response = await fetch(`${API_URL}/student/${studentId}`);
  if (!response.ok) throw new Error("Failed to fetch student profile");
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

// lib/api.ts

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
