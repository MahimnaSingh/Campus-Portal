
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects, facultyInfo, classTeacherInfo, departmentInfo } from "@/data/mockData";
import { 
  Book, 
  GraduationCap, 
  User, 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Globe 
} from "lucide-react";

const Info = () => {
  return (
    <Layout title="Information">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Book className="mr-2 h-5 w-5 text-primary" />
            Enrolled Courses
          </h2>
          <div className="space-y-4">
            {subjects.map(subject => (
              <Card key={subject.id}>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">{subject.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-1">
                        <span className="text-gray-500">Course Code:</span> {subject.code}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="text-gray-500">Faculty:</span> {subject.faculty}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1">
                        <span className="text-gray-500">Credit Hours:</span> 4
                      </p>
                      <p className="text-sm mb-1">
                        <span className="text-gray-500">Course Type:</span> Core
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Class Teacher Information
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-4 md:mr-6 md:mb-0">
                  <User className="h-10 w-10 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{classTeacherInfo.name}</h3>
                  <p className="text-gray-600 mb-4">{classTeacherInfo.department}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{classTeacherInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{classTeacherInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Office Hours: {classTeacherInfo.officeHours}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Office: {classTeacherInfo.office}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-primary" />
            Faculty Information
          </h2>
          <div className="space-y-4">
            {facultyInfo.map(faculty => (
              <Card key={faculty.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 md:mr-6 md:mb-0 flex-shrink-0">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{faculty.name}</h3>
                      <p className="text-gray-600 mb-1">{faculty.designation}, {faculty.department}</p>
                      
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{faculty.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{faculty.phone}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2">Courses:</h4>
                        <ul className="space-y-1">
                          {faculty.subjects.map((subj, i) => (
                            <li key={i} className="text-sm flex items-center">
                              <Book className="h-3 w-3 text-gray-500 mr-2" />
                              {subj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-medium mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Department Information
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>{departmentInfo.name}</CardTitle>
              <CardDescription>Department Head: {departmentInfo.head}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{departmentInfo.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{departmentInfo.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{departmentInfo.location}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 text-gray-500 mr-2" />
                  <span>
                    <a href={departmentInfo.website} target="_blank" className="text-primary hover:underline">
                      {departmentInfo.website}
                    </a>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Info;
