// src/pages/StudyMaterial.tsx
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Download, Upload, ArrowLeft, FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  fetchCoursesWithFaculty,
  fetchStudyMaterials,
  uploadStudyMaterial,
} from "@/lib/api";

const StudyMaterial = () => {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  // On mount: load userRole and courses
  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "student" | "faculty") || "student";
    setUserRole(role);
    fetchCoursesWithFaculty()
      .then(setCourses)
      .catch(err => {
        console.error(err);
        toast({ title: "Error", description: "Could not load courses", variant: "destructive" });
      });
  }, []);

  // Whenever selectedCourse changes, fetch its materials once
  useEffect(() => {
    if (!selectedCourse) return;
    setMaterials([]);            // clear old
    setLoadingMaterials(true);
    fetchStudyMaterials(selectedCourse.course_id)
      .then(data => setMaterials(data))
      .catch(err => {
        console.error(err);
        toast({ title: "Error", description: "Could not load materials", variant: "destructive" });
      })
      .finally(() => setLoadingMaterials(false));
  }, [selectedCourse]);

  const handleDownload = (link: string) => window.open(link, "_blank");

  const handleUpload = async () => {
    if (!file || !title || !selectedCourse) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
      return;
    }
    try {
      await uploadStudyMaterial({
        courseId: selectedCourse.course_id,
        facultyId: localStorage.getItem("facultyId") || "",
        title,
        fileType: file.name.split(".").pop() || "pdf",
        fileLink: `path/to/${file.name}`,
      });
      toast({ title: "Uploaded Successfully" });
      setShowUploadDialog(false);
      // re-fetch materials
      setLoadingMaterials(true);
      const refreshed = await fetchStudyMaterials(selectedCourse.course_id);
      setMaterials(refreshed);
    } catch {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setLoadingMaterials(false);
    }
  };

  // LIST VIEW
  if (!selectedCourse) {
    return (
      <Layout title="Study Materials">
        <p className="mb-6 text-gray-600 animate-fadein">
          {userRole === "student"
            ? "Select a subject to view study materials."
            : "Select a subject to manage study materials."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadein">
          {courses.map(c => (
            <Card
              key={c.course_id}
              onClick={() => setSelectedCourse(c)}
              className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  {c.course_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {c.course_id} | Faculty: {c.faculty_name || "Unknown"}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Material
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  // DETAIL VIEW
  return (
    <Layout title={`Study Material: ${selectedCourse.course_name}`}>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedCourse(null);
            setMaterials([]);
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
        </Button>
        {userRole === "faculty" && (
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Material
          </Button>
        )}
      </div>

      {loadingMaterials ? (
        <p className="text-gray-500">Loading materials…</p>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadein">
          {materials.map(m => (
            <Card key={m.material_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{m.title}</h4>
                  <p className="text-sm text-gray-500">{m.file_type.toUpperCase()}</p>
                </div>
                <Button
                  onClick={() => handleDownload(m.file_link)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 text-center animate-fadein">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="font-semibold text-lg">No Materials Uploaded Yet</h3>
          <p className="text-gray-500 mt-2">
            Once uploaded by faculty, materials will appear here.
          </p>
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
            <DialogDescription>
              Upload PDFs, Videos, or Presentations
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Material Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <Input
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleUpload}
              className="w-full hover:scale-105 transition-all"
            >
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudyMaterial;
