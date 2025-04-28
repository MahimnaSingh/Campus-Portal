-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS Student_Log;
DROP TABLE IF EXISTS Questions;
DROP TABLE IF EXISTS Topic;
DROP TABLE IF EXISTS Exam;
DROP TABLE IF EXISTS Faculty;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Course;
DROP TABLE IF EXISTS Department;

-- Create Department table
CREATE TABLE Department (
    Dept_ID INT PRIMARY KEY AUTO_INCREMENT,
    Dept_Name VARCHAR(100) NOT NULL
);

-- Create Course table
CREATE TABLE Course (
    Course_ID INT PRIMARY KEY AUTO_INCREMENT,
    Course_Name VARCHAR(100) NOT NULL,
    Course_Description TEXT,
    Dept_ID INT,
    FOREIGN KEY (Dept_ID) REFERENCES Department(Dept_ID) ON DELETE SET NULL
);

-- Update Student table with new fields
CREATE TABLE Student (
    Student_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    Date_of_Birth DATE,
    Email VARCHAR(100),
    College_Name VARCHAR(100) DEFAULT 'Sample College',
    Dept_ID INT,
    Degree VARCHAR(50),
    Faculty_Advisor_Name VARCHAR(100),
    Faculty_Advisor_ID VARCHAR(20),
    Academic_Advisor_Email VARCHAR(100),
    Academic_Advisor_ID VARCHAR(20),
    Father_Name VARCHAR(100),
    Mother_Name VARCHAR(100),
    Gender ENUM('Male', 'Female', 'Other'),
    Nationality VARCHAR(50) DEFAULT 'Indian',
    Blood_Group VARCHAR(5),
    Age INT,
    Contact VARCHAR(20),
    Address VARCHAR(255),
    Password VARCHAR(255) DEFAULT 'password',
    FOREIGN KEY (Dept_ID) REFERENCES Department(Dept_ID) ON DELETE SET NULL
);

-- Create Faculty table
CREATE TABLE Faculty (
    Faculty_ID INT PRIMARY KEY AUTO_INCREMENT,
    Faculty_Name VARCHAR(100) NOT NULL,
    Dept_ID INT,
    Password VARCHAR(255) DEFAULT 'password',
    FOREIGN KEY (Dept_ID) REFERENCES Department(Dept_ID) ON DELETE SET NULL
);

-- Create Exam table
CREATE TABLE Exam (
    Exam_ID INT PRIMARY KEY AUTO_INCREMENT,
    Time TIME NOT NULL,
    Date DATE NOT NULL,
    Course_ID INT,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Create Topic table
CREATE TABLE Topic (
    Topic_ID INT PRIMARY KEY AUTO_INCREMENT,
    Topic_Name VARCHAR(100) NOT NULL,
    Course_ID INT,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID) ON DELETE CASCADE
);

-- Create Questions table
CREATE TABLE Questions (
    Q_ID INT PRIMARY KEY AUTO_INCREMENT,
    Q_Type VARCHAR(50) NOT NULL,
    Q_Text TEXT NOT NULL,
    Q_Name VARCHAR(100),
    Model_Answer TEXT,
    Topic_ID INT,
    Exam_ID INT,
    FOREIGN KEY (Topic_ID) REFERENCES Topic(Topic_ID) ON DELETE CASCADE,
    FOREIGN KEY (Exam_ID) REFERENCES Exam(Exam_ID) ON DELETE CASCADE
);

-- Create Student_Log table
CREATE TABLE Student_Log (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT,
    Action VARCHAR(50),
    Log_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger log_new_student
DELIMITER $$

CREATE TRIGGER log_new_student
AFTER INSERT ON Student
FOR EACH ROW
BEGIN
    INSERT INTO Student_Log (Student_ID, Action)
    VALUES (NEW.Student_ID, 'INSERT');
END$$

-- Create procedure PrintStudentNames
CREATE PROCEDURE PrintStudentNames()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE studentName VARCHAR(100);
    DECLARE cur CURSOR FOR SELECT Name FROM Student;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO studentName;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT studentName;
    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;

-- Create StudentWithDept view
CREATE VIEW StudentWithDept AS
SELECT s.Student_ID, s.Name, d.Dept_Name
FROM Student s
JOIN Department d ON s.Dept_ID = d.Dept_ID;

-- Insert sample data
INSERT INTO Department (Dept_Name) VALUES 
('Computer Science'), 
('Electronics Engineering'), 
('Mechanical Engineering'),
('Civil Engineering'),
('Information Technology');

INSERT INTO Course (Course_Name, Course_Description, Dept_ID) VALUES
('Database Management Systems', 'Study of database design and management', 1),
('Object Oriented Programming', 'Programming paradigm based on objects', 1),
('Circuit Theory', 'Analysis of electrical circuits', 2),
('Thermodynamics', 'Study of heat and energy', 3),
('Structural Engineering', 'Analysis and design of structures', 4),
('Web Development', 'Development of web applications', 5);

INSERT INTO Student (Name, First_Name, Last_Name, Date_of_Birth, Email, College_Name, 
    Dept_ID, Degree, Faculty_Advisor_Name, Faculty_Advisor_ID,
    Academic_Advisor_Email, Academic_Advisor_ID, Father_Name, Mother_Name,
    Gender, Nationality, Blood_Group, Age, Contact, Address) VALUES
('John Doe', 'John', 'Doe', '2000-01-15', 'john.doe@college.edu', 'Sample College',
    1, 'B.Tech', 'Dr. Robert Miller', 'FAC001',
    'robert.miller@college.edu', 'ADV001', 'James Doe', 'Mary Doe',
    'Male', 'Indian', 'O+', 21, '1234567890', '123 College St');

INSERT INTO Faculty (Faculty_Name, Dept_ID) VALUES
('Dr. Robert Miller', 1),
('Prof. Susan Clark', 2),
('Dr. Michael Davis', 3),
('Prof. Elizabeth Taylor', 4),
('Dr. James Wilson', 5);

INSERT INTO Exam (Time, Date, Course_ID) VALUES
('09:00:00', '2025-05-15', 1),
('14:00:00', '2025-05-16', 2),
('09:00:00', '2025-05-17', 3),
('14:00:00', '2025-05-18', 4),
('09:00:00', '2025-05-19', 5);

INSERT INTO Topic (Topic_Name, Course_ID) VALUES
('SQL Basics', 1),
('Normalization', 1),
('Classes and Objects', 2),
('Inheritance', 2),
('Ohm\'s Law', 3),
('Kirchhoff\'s Laws', 3),
('First Law of Thermodynamics', 4),
('Entropy', 4),
('Beams and Columns', 5),
('Concrete Design', 5);

INSERT INTO Questions (Q_Type, Q_Text, Q_Name, Model_Answer, Topic_ID, Exam_ID) VALUES
('Multiple Choice', 'Which of the following is not a valid SQL statement?', 'SQL Basics Q1', 'REMOVE FROM table', 1, 1),
('Essay', 'Explain the concept of database normalization.', 'Normalization Q1', 'Normalization is the process of organizing data to minimize redundancy.', 2, 1),
('Multiple Choice', 'Which OOP principle describes "is-a" relationship?', 'OOP Principles', 'Inheritance', 3, 2),
('Essay', 'Explain polymorphism in OOP.', 'Polymorphism', 'Polymorphism allows objects to be treated as instances of their parent class.', 4, 2);
