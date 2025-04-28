
import { Student, Faculty } from "@/types/database";

// Mock student data for testing
const mockStudents: Student[] = [
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
    admission_date: "2022-08-01",
    profile_image: null,
    status: "active",
    blood_group: "O+",
    faculty_advisor_name: "Dr. Robert Miller",
    faculty_advisor_id: "FAC001",
    academic_advisor_email: "robert.miller@example.com"
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
    admission_date: "2022-08-01",
    profile_image: null,
    status: "active",
    blood_group: "A+",
    faculty_advisor_name: "Prof. Susan Clark",
    faculty_advisor_id: "FAC002",
    academic_advisor_email: "susan.clark@example.com"
  }
];

// Mock faculty data for testing
const mockFaculty: Faculty[] = [
  {
    faculty_id: "FAC001",
    first_name: "Robert",
    last_name: "Miller",
    email: "robert.miller@example.com",
    phone: "1122334455",
    address: "789 Faculty Housing",
    designation: "Professor",
    department_id: 1,
    department_name: "Computer Science",
    joining_date: "2015-07-01",
    status: "active"
  },
  {
    faculty_id: "FAC002",
    first_name: "Susan",
    last_name: "Clark",
    email: "susan.clark@example.com",
    phone: "5544332211",
    address: "321 Faculty Quarters",
    designation: "Associate Professor",
    department_id: 2,
    department_name: "Electronics Engineering",
    joining_date: "2018-01-15",
    status: "active"
  }
];

export async function mockStudentLogin(studentId: string, password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const student = mockStudents.find(s => s.student_id === studentId);
  
  if (student) {
    return {
      success: true,
      user: student,
      role: 'student'
    };
  }
  
  return {
    success: false,
    message: 'Invalid credentials'
  };
}

export async function mockFacultyLogin(facultyId: string, password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const faculty = mockFaculty.find(f => f.faculty_id === facultyId);
  
  if (faculty) {
    return {
      success: true,
      user: faculty,
      role: 'faculty'
    };
  }
  
  return {
    success: false,
    message: 'Invalid credentials'
  };
}
