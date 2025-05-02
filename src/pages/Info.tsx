import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Book, Mail, Phone, MapPin, Clock, Users, GraduationCap, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchStudentProfile,
  fetchEnrollments,
  fetchCourses,
  fetchDepartments,
  fetchFaculty,
  fetchClassTeacher
} from "@/lib/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Info = () => {
  const { toast } = useToast();
  const query = useQuery();
  const paramId = query.get("student");
  const stored = localStorage.getItem("userData");
  const fallbackId = stored ? JSON.parse(stored).student_id : "";
  const studentId = paramId || fallbackId;

  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [classTeacher, setClassTeacher] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    if (!studentId) {
      toast({ title: "Error", description: "No student ID available", variant: "destructive" });
      setLoadingProfile(false);
      return;
    }
    fetchStudentProfile(studentId)
      .then(p => setProfile(p))
      .catch(e => {
        console.error(e);
        toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
      })
      .finally(() => setLoadingProfile(false));
  }, [studentId]);

  useEffect(() => {
    if (!profile) return;
    setLoadingAll(true);
    Promise.all([
      fetchEnrollments(profile.student_id),
      fetchCourses(),
      fetchClassTeacher(profile.section, profile.degree_id),
      fetchDepartments(),
      fetchFaculty()
    ])
      .then(([enr, allCourses, teacher, depts, allFaculty]) => {
        const enrolledIds = enr.map(e => e.course_id);
        const courses = allCourses
          .filter(c => enrolledIds.includes(c.course_id))
          .map(c => ({
            ...c,
            faculty_name: allFaculty.find(f => f.faculty_id === c.faculty_id)?.first_name + ' ' + allFaculty.find(f => f.faculty_id === c.faculty_id)?.last_name
          }));
        setEnrolledCourses(courses);
        setClassTeacher({
          ...teacher,
          label: 'Faculty Advisor'
        });
        const dept = depts.find(d => d.department_id === profile.department_id) || {
          department_name: 'Information Technology',
          hod_id: 'fc1003',
          email: 'it@srmuniv.ac.in',
          phone: '044-2741-7500',
          location: 'SRMIST, Kattankulathur',
          website: 'https://www.srmist.edu.in'
        };
        setDepartment(dept);
        const facs = allFaculty.filter(f => f.department_id === profile.department_id);
        setFacultyList(facs);
      })
      .catch(e => {
        console.error(e);
        toast({ title: "Error", description: "Failed to load additional info", variant: "destructive" });
      })
      .finally(() => setLoadingAll(false));
  }, [profile]);

  if (loadingProfile) {
    return (
      <Layout title="Loading…">
        <p className="p-6 text-center">Loading profile…</p>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Error">
        <p className="p-6 text-red-600">Could not load student profile.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Information">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="inline mr-2 text-primary" />{profile.first_name} {profile.last_name}
            </CardTitle>
            <CardDescription>ID: {profile.student_id}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center"><Mail className="mr-2 text-gray-600" />{profile.email}</div>
            <div className="flex items-center"><Phone className="mr-2 text-gray-600" />{profile.phone}</div>
            <div className="flex items-center"><MapPin className="mr-2 text-gray-600" />{profile.address}</div>
            <div className="flex items-center"><Clock className="mr-2 text-gray-600" />Batch: {profile.batch}</div>
          </CardContent>
        </Card>

        <section className="mb-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Book className="mr-2 text-primary" />Enrolled Courses
          </h2>
          {loadingAll ? (
            <p>Loading courses…</p>
          ) : enrolledCourses.length ? (
            enrolledCourses.map(c => (
              <Card key={c.course_id} className="mb-4 hover:shadow-lg transition-shadow">
                <CardContent>
                  <h3 className="font-medium text-lg">{c.course_name}</h3>
                  <p className="text-sm text-gray-500">Code: {c.course_id}</p>
                  <p className="text-sm text-gray-500">Faculty: {c.faculty_name}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No enrolled courses found.</p>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Users className="mr-2 text-primary" />{classTeacher?.label}
          </h2>
          {loadingAll ? (
            <p>Loading faculty advisor…</p>
          ) : classTeacher ? (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg">{classTeacher.name}</h3>
                  <p className="text-sm text-gray-500">Section: {classTeacher.section}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center"><Mail className="mr-2 text-gray-600" />{classTeacher.email}</div>
                  <div className="flex items-center"><Phone className="mr-2 text-gray-600" />{classTeacher.phone}</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p>No faculty advisor assigned.</p>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <Users className="mr-2 text-primary" />Department
          </h2>
          {loadingAll ? (
            <p>Loading department…</p>
          ) : department ? (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{department.department_name}</CardTitle>
                <CardDescription>Head: {department.hod_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center"><Mail className="mr-2 text-gray-600" />{department.email}</div>
                <div className="flex items-center"><Phone className="mr-2 text-gray-600" />{department.phone}</div>
                <div className="flex items-center"><MapPin className="mr-2 text-gray-600" />{department.location}</div>
                <div className="flex items-center"><Globe className="mr-2 text-gray-600" />
                  <a href={department.website} target="_blank" className="text-primary hover:underline">
                    {department.website}
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p>No department info.</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <GraduationCap className="mr-2 text-primary" />Faculty
          </h2>
          {loadingAll ? (
            <p>Loading faculty list…</p>
          ) : facultyList.length ? (
            facultyList.map(f => (
              <Card key={f.faculty_id} className="mb-4 hover:shadow-lg transition-shadow">
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg">{f.first_name} {f.last_name}</h3>
                    <p className="text-sm text-gray-500">{f.designation}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center"><Mail className="mr-2 text-gray-600" />{f.email}</div>
                    <div className="flex items-center"><Phone className="mr-2 text-gray-600" />{f.phone}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No faculty in this department.</p>
          )}
        </section>
      </motion.div>
    </Layout>
  );
};

export default Info;
