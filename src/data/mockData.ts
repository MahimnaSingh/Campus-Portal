
export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty: string;
  attendance: number;
  lastUpdated: string;
  chapters: Chapter[];
  marks: {
    assignments: number;
    midterm: number;
    project: number;
    final: number;
    total?: number;
  };
}

export interface Chapter {
  id: string;
  name: string;
  importantTopics: string[];
  importantQuestions: string[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  subjects: string[];
}

export const subjects: Subject[] = [
  {
    id: "cs101",
    name: "Introduction to Computer Science",
    code: "CS101",
    faculty: "Dr. Alan Turing",
    attendance: 85,
    lastUpdated: "2025-04-09T14:30:00",
    marks: {
      assignments: 18,
      midterm: 25,
      project: 28,
      final: 38,
      total: 109
    },
    chapters: [
      {
        id: "cs101-ch1",
        name: "Fundamentals of Computing",
        importantTopics: [
          "Binary number system",
          "Boolean logic",
          "Computer organization"
        ],
        importantQuestions: [
          "Explain the difference between analog and digital computing.",
          "Describe how binary numbers are used in computing.",
          "Outline the basic components of a computer system."
        ]
      },
      {
        id: "cs101-ch2",
        name: "Introduction to Programming",
        importantTopics: [
          "Variables and data types",
          "Control structures",
          "Functions and procedures"
        ],
        importantQuestions: [
          "What are the basic data types in programming?",
          "Explain the difference between iteration and recursion.",
          "How do functions help in organizing code?"
        ]
      }
    ]
  },
  {
    id: "math201",
    name: "Discrete Mathematics",
    code: "MATH201",
    faculty: "Dr. Jane Smith",
    attendance: 92,
    lastUpdated: "2025-04-10T10:15:00",
    marks: {
      assignments: 20,
      midterm: 27,
      project: 25,
      final: 41,
      total: 113
    },
    chapters: [
      {
        id: "math201-ch1",
        name: "Set Theory",
        importantTopics: [
          "Basic set operations",
          "Set identities",
          "Power sets"
        ],
        importantQuestions: [
          "Prove the distributive property of sets.",
          "Explain the concept of a power set with examples.",
          "Solve problems using Venn diagrams."
        ]
      },
      {
        id: "math201-ch2",
        name: "Graph Theory",
        importantTopics: [
          "Graph representations",
          "Paths and connectivity",
          "Planar graphs"
        ],
        importantQuestions: [
          "Explain the difference between directed and undirected graphs.",
          "Prove that a tree with n vertices has n-1 edges.",
          "Describe applications of graph theory in computer science."
        ]
      }
    ]
  },
  {
    id: "phys102",
    name: "Physics for Computer Science",
    code: "PHYS102",
    faculty: "Dr. Richard Feynman",
    attendance: 78,
    lastUpdated: "2025-04-08T16:45:00",
    marks: {
      assignments: 16,
      midterm: 22,
      project: 24,
      final: 35,
      total: 97
    },
    chapters: [
      {
        id: "phys102-ch1",
        name: "Electricity and Magnetism",
        importantTopics: [
          "Electric fields",
          "Magnetic fields",
          "Electromagnetic induction"
        ],
        importantQuestions: [
          "Explain Coulomb's law and its applications.",
          "Describe the relationship between electricity and magnetism.",
          "How does electromagnetic induction work in computer hardware?"
        ]
      },
      {
        id: "phys102-ch2",
        name: "Quantum Computing Basics",
        importantTopics: [
          "Quantum bits",
          "Superposition",
          "Quantum entanglement"
        ],
        importantQuestions: [
          "Compare classical bits with quantum bits.",
          "Explain the concept of quantum superposition.",
          "How might quantum computing change computer science?"
        ]
      }
    ]
  }
];

export const facultyInfo: Faculty[] = [
  {
    id: "f001",
    name: "Dr. Alan Turing",
    email: "alan.turing@university.edu",
    phone: "555-123-4567",
    department: "Computer Science",
    designation: "Professor",
    subjects: ["Introduction to Computer Science", "Artificial Intelligence"]
  },
  {
    id: "f002",
    name: "Dr. Jane Smith",
    email: "jane.smith@university.edu",
    phone: "555-234-5678",
    department: "Mathematics",
    designation: "Associate Professor",
    subjects: ["Discrete Mathematics", "Calculus"]
  },
  {
    id: "f003",
    name: "Dr. Richard Feynman",
    email: "richard.feynman@university.edu",
    phone: "555-345-6789",
    department: "Physics",
    designation: "Professor",
    subjects: ["Physics for Computer Science", "Quantum Mechanics"]
  }
];

export const departmentInfo = {
  name: "Computer Science and Engineering",
  head: "Dr. Grace Hopper",
  email: "cs.department@university.edu",
  phone: "555-987-6543",
  location: "Engineering Building, Floor 3",
  website: "https://cs.university.edu"
};

export const classTeacherInfo = {
  name: "Dr. Ada Lovelace",
  email: "ada.lovelace@university.edu",
  phone: "555-456-7890",
  department: "Computer Science",
  officeHours: "Monday and Wednesday, 2:00 PM - 4:00 PM",
  office: "Engineering Building, Room 301"
};

export const semesterInfo = {
  current: "Odd Semester (Fall 2025)",
  examStartDate: "2025-12-10",
  examEndDate: "2025-12-22",
  registrationDeadline: "2025-11-15",
  feeAmount: 2500
};
