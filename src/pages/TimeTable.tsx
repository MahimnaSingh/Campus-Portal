import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, User } from "lucide-react";
import { fetchTimetable } from "@/lib/api";

const dayOrders = ["Day Order 1", "Day Order 2", "Day Order 3", "Day Order 4", "Day Order 5"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["9:00 AM - 10:00 AM", "10:15 AM - 11:15 AM", "11:30 AM - 12:30 PM", "1:30 PM - 2:30 PM"];
const sections = ["CSE-A", "CSE-B", "ECE-A", "ECE-B", "MECH-A", "MECH-B"];

const TimetableNew = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [currentDayOrder, setCurrentDayOrder] = useState(dayOrders[0]);
  const [studentTimetable, setStudentTimetable] = useState<any>({});
  const [facultyTimetable, setFacultyTimetable] = useState<any>({});

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) setUserRole(storedRole);

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fetchedData = await fetchTimetable();
      setStudentTimetable(generateStudentTimetable(fetchedData));
      setFacultyTimetable(generateFacultyTimetable(fetchedData));
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
    }
  };

  const generateRandomRoom = () => {
    const buildings = ["A", "B", "C", "D", "E"];
    return `${buildings[Math.floor(Math.random() * buildings.length)]}${100 + Math.floor(Math.random() * 100)}`;
  };

  const generateRandomSection = () => {
    return sections[Math.floor(Math.random() * sections.length)];
  };

  const shuffleArray = (array: any[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const generateStudentTimetable = (data: any[]) => {
    const timetable: any = {};
    dayOrders.forEach((day) => {
      const shuffledClasses = shuffleArray(data);
      timetable[day] = timeSlots.map((time, index) => {
        const safeClass = shuffledClasses[index % shuffledClasses.length];
        return {
          id: `student-${day}-${index}`,
          subject: safeClass?.course_name ?? "Unknown Subject",
          facultyName: `${safeClass?.first_name ?? "Unknown"} ${safeClass?.last_name ?? ""}`,
          facultyId: safeClass?.faculty_id ?? "Unknown",
          time,
          room: generateRandomRoom()
        };
      });
    });
    return timetable;
  };

  const generateFacultyTimetable = (data: any[]) => {
    const timetable: any = {};
    dayOrders.forEach((day) => {
      const shuffledClasses = shuffleArray(data);
      timetable[day] = Array.from({ length: 3 }).map((_, index) => {
        const safeClass = shuffledClasses[index % shuffledClasses.length];
        return {
          id: `faculty-${day}-${index}`,
          subject: safeClass?.course_name ?? "Unknown Subject",
          section: generateRandomSection(),
          time: timeSlots[index % timeSlots.length],
          room: generateRandomRoom()
        };
      });
    });
    return timetable;
  };

  const handleProfessorClick = (facultyId: string) => {
    navigate(`/info?professor=${facultyId}`);
  };

  return (
    <Layout title={userRole === "student" ? "Student Timetable" : "Faculty Schedule"}>
      <Card className="mb-6 animate-fadeIn">
        <CardHeader>
          <CardTitle>{userRole === "student" ? "Class Schedule" : "Teaching Schedule"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={currentDayOrder} onValueChange={setCurrentDayOrder}>
            <TabsList className="grid grid-cols-5 mb-6">
              {dayOrders.map((day) => (
                <TabsTrigger key={day} value={day}>
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>

            {dayOrders.map((day) => (
              <TabsContent key={day} value={day} className="animate-fadeIn">
                <div className="space-y-4">
                  {(userRole === "student" ? studentTimetable[day] : facultyTimetable[day])?.map((classInfo: any) => (
                    <Card key={classInfo.id} className="transition-transform hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-2 md:mb-0">
                            <h3 className="font-semibold text-lg">{classInfo.subject}</h3>

                            {userRole === "student" ? (
                              <button
                                className="text-primary hover:underline cursor-pointer flex items-center mt-1"
                                onClick={() => handleProfessorClick(classInfo.facultyId)}
                              >
                                <User className="h-4 w-4 mr-1" />
                                {classInfo.facultyName}
                              </button>
                            ) : (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mt-1">
                                {classInfo.section}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col md:items-end">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {classInfo.time}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {classInfo.room}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4 text-sm text-gray-600">
            <p>The timetable follows a Day Order system rather than specific weekdays.</p>
            <p>Current Week: {weekDays.map((day, index) => `${day} - ${dayOrders[index]}`).join(", ")}</p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default TimetableNew;
