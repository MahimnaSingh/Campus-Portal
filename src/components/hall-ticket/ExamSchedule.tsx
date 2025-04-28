import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ExamScheduleProps {
  examStartDate: Date;
}

interface Course {
  course_id: string;
  course_name: string;
  department_name?: string;
  semester: number;
  credits: number;
}

const ExamSchedule = ({ examStartDate }: ExamScheduleProps) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/courses"); // replace port if needed
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <h3 className="text-xl font-medium mb-4">Examination Schedule</h3>
      <div className="space-y-4">
        {courses.map((course, index) => (
          <Card key={course.course_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{course.course_name}</h4>
                  <p className="text-sm text-gray-600">{course.course_id}</p>
                  <p className="text-xs text-gray-500">
                    Semester {course.semester} | {course.credits} Credits
                  </p>
                  {course.department_name && (
                    <p className="text-xs text-gray-500">{course.department_name}</p>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {new Date(examStartDate.getTime() + index * 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    {" "} | 9:30 AM - 12:30 PM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ExamSchedule;
