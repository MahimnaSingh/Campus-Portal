
USE DBMS;

-- Insert Faculty Data
INSERT INTO faculty (faculty_id, first_name, last_name, email, phone, address, designation, joining_date, status)
VALUES 
('FAC001', 'Robert', 'Miller', 'robert.miller@example.com', '1122334455', '789 Faculty Housing', 'Professor', '2015-07-01', 'active'),
('FAC002', 'Susan', 'Clark', 'susan.clark@example.com', '5544332211', '321 Faculty Quarters', 'Associate Professor', '2018-01-15', 'active'),
('FAC003', 'Michael', 'Davis', 'michael.davis@example.com', '9988776655', '654 Faculty Block', 'Assistant Professor', '2020-06-01', 'active'),
('FAC004', 'Elizabeth', 'Taylor', 'elizabeth.taylor@example.com', '3322114455', '987 Faculty Residence', 'Professor', '2010-08-15', 'active'),
('FAC005', 'James', 'Wilson', 'james.wilson@example.com', '6677889900', '123 Faculty Complex', 'Associate Professor', '2016-04-10', 'active');

-- Insert Department Data
INSERT INTO departments (department_name, hod_id)
VALUES 
('Computer Science', 'FAC001'),
('Electronics Engineering', 'FAC002'),
('Mechanical Engineering', 'FAC003'),
('Civil Engineering', 'FAC004'),
('Information Technology', 'FAC005');

-- Update faculty with department_id
UPDATE faculty SET department_id = 1 WHERE faculty_id = 'FAC001';
UPDATE faculty SET department_id = 2 WHERE faculty_id = 'FAC002';
UPDATE faculty SET department_id = 3 WHERE faculty_id = 'FAC003';
UPDATE faculty SET department_id = 4 WHERE faculty_id = 'FAC004';
UPDATE faculty SET department_id = 5 WHERE faculty_id = 'FAC005';

-- Insert Degrees
INSERT INTO degrees (degree_name, duration_years)
VALUES
('B.Tech', 4),
('M.Tech', 2),
('Ph.D', 3),
('B.Sc', 3),
('M.Sc', 2);

-- Insert Students
INSERT INTO students (student_id, first_name, last_name, dob, gender, email, phone, address, department_id, degree_id, section, batch, admission_date, status, blood_group)
VALUES
('STU001', 'John', 'Doe', '2000-01-15', 'Male', 'john.doe@example.com', '1234567890', '123 College St', 1, 1, 'A', 'Batch1', '2022-08-01', 'active', 'O+'),
('STU002', 'Jane', 'Smith', '2001-05-22', 'Female', 'jane.smith@example.com', '0987654321', '456 University Ave', 2, 1, 'B', 'Batch1', '2022-08-01', 'active', 'A+'),
('STU003', 'Alex', 'Johnson', '2000-07-30', 'Male', 'alex.johnson@example.com', '5678901234', '789 Campus Rd', 3, 1, 'A', 'Batch1', '2022-08-01', 'active', 'B+'),
('STU004', 'Emily', 'Brown', '2001-03-12', 'Female', 'emily.brown@example.com', '4321098765', '321 College Ave', 4, 1, 'B', 'Batch1', '2022-08-01', 'active', 'AB+'),
('STU005', 'Michael', 'Wilson', '1999-11-08', 'Male', 'michael.wilson@example.com', '6789012345', '654 University Blvd', 5, 1, 'A', 'Batch1', '2022-08-01', 'active', 'O-');

-- Insert Faculty Advisor
INSERT INTO faculty_advisor (faculty_id, section, degree_id)
VALUES
('FAC001', 'A', 1),
('FAC002', 'B', 1),
('FAC003', 'A', 2),
('FAC004', 'B', 2),
('FAC005', 'A', 3);

-- Insert Courses
INSERT INTO courses (course_id, course_name, department_id, semester, credits)
VALUES
('CS101', 'Database Management Systems', 1, 3, 4),
('CS102', 'Object Oriented Programming', 1, 3, 4),
('EE101', 'Circuit Theory', 2, 3, 4),
('ME101', 'Thermodynamics', 3, 3, 4),
('CE101', 'Structural Engineering', 4, 3, 4),
('IT101', 'Web Development', 5, 3, 4);

-- Insert Course Assignments
INSERT INTO course_assignments (faculty_id, course_id, section, degree_id)
VALUES
('FAC001', 'CS101', 'A', 1),
('FAC001', 'CS102', 'A', 1),
('FAC002', 'EE101', 'B', 1),
('FAC003', 'ME101', 'A', 1),
('FAC004', 'CE101', 'B', 1),
('FAC005', 'IT101', 'A', 1);

-- Insert Enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, status)
VALUES
('STU001', 'CS101', '2022-08-05', 'enrolled'),
('STU001', 'CS102', '2022-08-05', 'enrolled'),
('STU002', 'EE101', '2022-08-05', 'enrolled'),
('STU003', 'ME101', '2022-08-05', 'enrolled'),
('STU004', 'CE101', '2022-08-05', 'enrolled'),
('STU005', 'IT101', '2022-08-05', 'enrolled');

-- Insert Attendance
INSERT INTO attendance (student_id, course_id, date, status, marked_by_faculty)
VALUES
('STU001', 'CS101', '2023-01-10', 'present', 'FAC001'),
('STU001', 'CS102', '2023-01-10', 'present', 'FAC001'),
('STU001', 'CS101', '2023-01-11', 'present', 'FAC001'),
('STU001', 'CS102', '2023-01-11', 'absent', 'FAC001'),
('STU001', 'CS101', '2023-01-12', 'present', 'FAC001'),
('STU001', 'CS102', '2023-01-12', 'present', 'FAC001');

-- Insert Marks
INSERT INTO marks (student_id, course_id, exam_type, marks_obtained, total_marks, exam_date)
VALUES
('STU001', 'CS101', 'midterm', 40, 50, '2023-02-15'),
('STU001', 'CS102', 'midterm', 42, 50, '2023-02-16'),
('STU002', 'EE101', 'midterm', 38, 50, '2023-02-15'),
('STU003', 'ME101', 'midterm', 45, 50, '2023-02-16'),
('STU004', 'CE101', 'midterm', 37, 50, '2023-02-15'),
('STU005', 'IT101', 'midterm', 43, 50, '2023-02-16');

-- Insert Results
INSERT INTO results (student_id, course_id, final_grade, remarks)
VALUES
('STU001', 'CS101', 'A', 'Excellent performance'),
('STU001', 'CS102', 'A-', 'Very good performance'),
('STU002', 'EE101', 'B+', 'Good understanding of concepts'),
('STU003', 'ME101', 'A', 'Outstanding work'),
('STU004', 'CE101', 'B', 'Solid understanding'),
('STU005', 'IT101', 'A-', 'Very good technical skills');

-- Insert Fees
INSERT INTO fees (fee_type, amount, due_date)
VALUES
('semester_exam', 1000.00, '2023-03-01');

-- Insert Payments
INSERT INTO payments (student_id, fee_id, amount_paid, payment_date, payment_method, transaction_id, payment_status)
VALUES
('STU001', 1, 1000.00, '2023-02-20', 'UPI', 'TXN123456', 'successful'),
('STU002', 1, 1000.00, '2023-02-21', 'card', 'TXN123457', 'successful'),
('STU003', 1, 1000.00, '2023-02-22', 'bank transfer', 'TXN123458', 'successful'),
('STU004', 1, 1000.00, '2023-02-23', 'UPI', 'TXN123459', 'successful'),
('STU005', 1, 1000.00, '2023-02-24', 'card', 'TXN123460', 'successful');

-- Insert Login Credentials
-- Note: In a real app, passwords would be hashed
INSERT INTO login_credentials (user_id, username, password_hash, role)
VALUES
('STU001', 'john.doe', 'password', 'student'),
('STU002', 'jane.smith', 'password', 'student'),
('STU003', 'alex.johnson', 'password', 'student'),
('STU004', 'emily.brown', 'password', 'student'),
('STU005', 'michael.wilson', 'password', 'student'),
('FAC001', 'robert.miller', 'password', 'faculty'),
('FAC002', 'susan.clark', 'password', 'faculty'),
('FAC003', 'michael.davis', 'password', 'faculty'),
('FAC004', 'elizabeth.taylor', 'password', 'faculty'),
('FAC005', 'james.wilson', 'password', 'faculty');

-- Insert Notices
INSERT INTO notices (title, description, issued_by, issued_to, department_id, date_posted)
VALUES
('Mid-Term Exam Schedule', 'Mid-term exams will be held from March 15 to March 22, 2023', 'FAC001', 'all', NULL, '2023-03-01'),
('Computer Science Workshop', 'A workshop on Advanced Database Concepts will be conducted on March 10, 2023', 'FAC001', 'department-specific', 1, '2023-03-02'),
('Electronics Lab Maintenance', 'Electronics Lab will be closed for maintenance on March 12, 2023', 'FAC002', 'department-specific', 2, '2023-03-02'),
('Guest Lecture on Machine Learning', 'A guest lecture on Machine Learning will be held on March 18, 2023', 'FAC001', 'students', NULL, '2023-03-03'),
('Faculty Meeting', 'A faculty meeting will be held on March 8, 2023 at 2:00 PM', 'FAC004', 'faculty', NULL, '2023-03-04');
