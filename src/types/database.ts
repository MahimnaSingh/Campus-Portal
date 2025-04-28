
export interface Department {
  department_id: number;
  department_name: string;
  hod_id: string | null;
}

export interface Faculty {
  faculty_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  designation: string | null;
  department_id: number | null;
  department_name?: string; // Joined field
  joining_date: string | null;
  status: 'active' | 'retired' | 'on leave' | null;
}

export interface Degree {
  degree_id: number;
  degree_name: string;
  duration_years: number | null;
}

export interface Student {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  department_id: number | null;
  department_name?: string; // Joined field
  degree_id: number | null;
  degree_name?: string; // Joined field
  section: string | null;
  batch: 'Batch1' | 'Batch2' | null;
  admission_date: string | null;
  profile_image: string | null;
  status: 'active' | 'graduated' | 'suspended' | 'dropped' | null;
  blood_group: string | null;
  // Calculated/derived fields
  name?: string; // Full name (combination of first_name and last_name)
  // Additional fields for faculty advisor info (added from joins)
  faculty_advisor_name?: string;
  faculty_advisor_id?: string;
  academic_advisor_email?: string;
}

export interface Course {
  course_id: string;
  course_name: string;
  department_id: number | null;
  department_name?: string; // Joined field
  semester: number | null;
  credits: number | null;
}

export interface Attendance {
  attendance_id: number;
  student_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | null;
  marked_by_faculty: string | null;
  last_edited: string;
  total_classes?: number;
  hours_present?: number;
  hours_absent?: number;
  student_name?: string; // Added this field to fix the TypeScript error
  course_name?: string; // Added for completeness since it's used in the join query
}

export interface Mark {
  mark_id: number;
  student_id: string;
  course_id: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment' | null;
  marks_obtained: number | null;
  total_marks: number | null;
  exam_date: string | null;
}

export interface Notice {
  notice_id: number;
  title: string;
  description: string | null;
  issued_by: string | null;
  issued_to: 'all' | 'students' | 'faculty' | 'department-specific' | null;
  department_id: number | null;
  department_name?: string; // Joined field for displaying department name
  date_posted: string | null;
}

export interface FacultyAdvisor {
  id: number;
  faculty_id: string;
  section: string | null;
  degree_id: number | null;
}

export interface Payment {
  payment_id: number;
  student_id: string;
  fee_id: number | null;
  amount_paid: number | null;
  payment_date: string | null;
  payment_method: 'card' | 'bank transfer' | 'UPI' | 'cash' | null;
  transaction_id: string | null;
  payment_status: 'successful' | 'pending' | 'failed' | null;
}
