
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  School, 
  MapPin, 
  GraduationCap,
  Heart,
  Award,
  Users,
  CreditCard
} from "lucide-react";
import { fetchStudentProfile } from "@/lib/api";
import { Student, Faculty } from "@/types/database";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [userData, setUserData] = useState<Student | Faculty | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedData = localStorage.getItem("userData");
    
    if (storedRole) setUserRole(storedRole);
    
    if (storedData) {
      try {
        // First set the stored data to show something immediately
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        
        // Then try to fetch the latest data from the API
        if ('student_id' in parsedData && storedRole === 'student') {
          fetchStudentProfile(parsedData.student_id)
            .then(data => {
              console.log("Fetched student profile:", data);
              setUserData(data);
              // Update localStorage with fresh data
              localStorage.setItem("userData", JSON.stringify(data));
            })
            .catch(err => {
              console.error("Error fetching profile data:", err);
              setError("Could not fetch the latest profile data");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        setError("Could not load profile data");
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError("No user data found. Please login again.");
    }
  }, [userRole]);

  if (loading) return (
    <Layout title="Profile">
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <h2 className="text-center text-red-500 text-xl font-bold">Error</h2>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );

  if (!userData) return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <h2 className="text-center text-xl font-bold">No Profile Data</h2>
          </CardHeader>
          <CardContent>
            <p className="text-center">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );

  // Handle both student and faculty data
  const name =  (userData.first_name && userData.last_name ? 
      `${userData.first_name} ${userData.last_name}` : 
      (userRole === 'faculty' ? 'Faculty Member' : 'Student'));
  
  const id = 'student_id' in userData ? userData.student_id : 
             'faculty_id' in userData ? userData.faculty_id : '';

  return (
    <Layout title="Profile">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-32 w-32 border-4 border-white mb-4">
                  {userData.profile_image ? (
                    <AvatarImage src={userData.profile_image} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-blue-700 text-4xl">
                      {name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-blue-100 capitalize mt-1">{userRole}</p>
                
                <div className="mt-4 w-full">
                  <div className="flex justify-between items-center py-3 border-b border-blue-400">
                    <span className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      ID
                    </span>
                    <span>{id}</span>
                  </div>
                  
                  {'email' in userData && userData.email && (
                    <div className="flex justify-between items-center py-3 border-b border-blue-400">
                      <span className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </span>
                      <span className="text-sm">{userData.email}</span>
                    </div>
                  )}
                  
                  {'phone' in userData && userData.phone && (
                    <div className="flex justify-between items-center py-3 border-b border-blue-400">
                      <span className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </span>
                      <span>{userData.phone}</span>
                    </div>
                  )}
                  
                  {userRole === 'student' && 'department_name' in userData && userData.department_name && (
                    <div className="flex justify-between items-center py-3 border-b border-blue-400">
                      <span className="font-medium flex items-center">
                        <School className="h-4 w-4 mr-2" />
                        Department
                      </span>
                      <span>{userData.department_name}</span>
                    </div>
                  )}
                  
                  {userRole === 'student' && 'section' in userData && userData.section && (
                    <div className="flex justify-between items-center py-3">
                      <span className="font-medium flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Section
                      </span>
                      <span>{userData.section}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          {/* Details Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {userRole === 'student' && 'dob' in userData && userData.dob && (
                        <InfoItem icon={Calendar} label="Date of Birth" 
                                  value={typeof userData.dob === 'string' ? new Date(userData.dob).toLocaleDateString() : 'Not provided'} />
                      )}
                      
                      {userRole === 'student' && 'gender' in userData && (
                        <InfoItem icon={User} label="Gender" value={userData.gender || 'Not provided'} />
                      )}
                      
                      {userRole === 'student' && 'blood_group' in userData && (
                        <InfoItem icon={Heart} label="Blood Group" value={userData.blood_group || 'Not provided'} />
                      )}
                      
                      <InfoItem icon={MapPin} label="Nationality" value="Indian" />
                      
                      {'address' in userData && (
                        <InfoItem icon={MapPin} label="Address" value={userData.address || 'Not provided'} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academic">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Academic Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {userRole === 'student' && 'degree_name' in userData && (
                        <InfoItem icon={Award} label="Degree" value={userData.degree_name || 'Not provided'} />
                      )}
                      
                      {userRole === 'student' && 'batch' in userData && (
                        <InfoItem icon={Users} label="Batch" value={userData.batch || 'Not provided'} />
                      )}
                      
                      {userRole === 'student' && 'admission_date' in userData && userData.admission_date && (
                        <InfoItem icon={Calendar} label="Admission Date" 
                                  value={typeof userData.admission_date === 'string' ? new Date(userData.admission_date).toLocaleDateString() : 'Not provided'} />
                      )}
                      
                      {userRole === 'student' && 'status' in userData && (
                        <InfoItem icon={GraduationCap} label="Status" value={userData.status || 'Not provided'} capitalizeValue={true} />
                      )}
                    </div>
                    
                    {userRole === 'student' && (
                      <>
                        <h3 className="font-semibold text-lg mt-6 mb-4">Faculty Advisor</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {'faculty_advisor_name' in userData && (
                            <InfoItem icon={User} label="Advisor Name" value={userData.faculty_advisor_name || 'Not assigned'} />
                          )}
                          
                          {'faculty_advisor_id' in userData && (
                            <InfoItem icon={CreditCard} label="Advisor ID" value={userData.faculty_advisor_id || 'Not assigned'} />
                          )}
                          
                          {'academic_advisor_email' in userData && (
                            <InfoItem icon={Mail} label="Advisor Email" value={userData.academic_advisor_email || 'Not provided'} />
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contact">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Contact Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {'email' in userData && (
                        <InfoItem icon={Mail} label="Email" value={userData.email || 'Not provided'} />
                      )}
                      
                      {'phone' in userData && (
                        <InfoItem icon={Phone} label="Phone" value={userData.phone || 'Not provided'} />
                      )}
                      
                      {'address' in userData && (
                        <InfoItem icon={MapPin} label="Address" value={userData.address || 'Not provided'} />
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mt-6 mb-4">Emergency Contact</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoItem icon={User} label="Contact Name" value="Parent/Guardian" />
                      <InfoItem icon={Phone} label="Contact Number" value="Not provided" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value,
  capitalizeValue = false
}: { 
  icon?: any; 
  label: string; 
  value: string | number | null | undefined;
  capitalizeValue?: boolean;
}) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    {Icon && <Icon className="h-5 w-5 text-gray-500 mt-0.5" />}
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-medium ${capitalizeValue ? 'capitalize' : ''}`}>{value}</p>
    </div>
  </div>
);

export default Profile;
