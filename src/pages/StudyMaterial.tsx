// src/pages/StudyMaterial.tsx
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Upload, ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  fetchSubjectsWithFaculty,
  fetchStudyMaterials,
  uploadStudyMaterial,
  CoursePayload,
  MaterialPayload,
} from "@/lib/api";

export default function StudyMaterial() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [courses, setCourses] = useState<CoursePayload[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CoursePayload | null>(null);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const role = (localStorage.getItem("userRole") as "student" | "faculty") || "student";
    setUserRole(role);
    fetchSubjectsWithFaculty()
      .then(setCourses)
      .catch((err) =>
        toast({
          title: "Error",
          description: "Could not load courses",
          variant: "destructive",
        })
      );
  }, [toast]);

  useEffect(() => {
    if (!selectedCourse) return;
    setMaterials([]);
    setLoadingMaterials(true);
    fetchStudyMaterials(selectedCourse.courseId)
      .then(setMaterials)
      .catch((err) =>
        toast({
          title: "Error",
          description: "Could not load materials",
          variant: "destructive",
        })
      )
      .finally(() => setLoadingMaterials(false));
  }, [selectedCourse, toast]);

  const handleDownload = (url: string) => window.open(url, "_blank");

  const handleUpload = async () => {
    if (!file || !title || !selectedCourse) {
      toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
      return;
    }
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("courseId", selectedCourse.courseId);
      form.append("facultyId", selectedCourse.facultyId);
      form.append("title", title);

      await uploadStudyMaterial(form);

      toast({ title: "Uploaded Successfully" });
      setShowUploadDialog(false);
      setTitle("");
      setFile(null);

      setLoadingMaterials(true);
      const refreshed = await fetchStudyMaterials(selectedCourse.courseId);
      setMaterials(refreshed);
    } catch (err: any) {
      console.error("Upload error ➡️", err);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMaterials(false);
    }
  };

  if (!selectedCourse) {
    return (
      <Layout title="Study Materials">
        <p className="mb-6 text-gray-600">
          {userRole === "student"
            ? "Select a subject to view study materials."
            : "Select a subject to manage study materials."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Card
              key={c.courseId}
              onClick={() => setSelectedCourse(c)}
              className="cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  {c.courseName}
                </h3>
                <p className="text-sm text-gray-500">
                  {c.courseId} | Faculty: {c.facultyName}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Materials
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Study Material: ${selectedCourse.courseName}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((m) => (
            <Card key={m.material_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{m.material_title}</h4>
                  <p className="text-sm text-gray-500">
                    {m.file_type.split("/")[1]?.toUpperCase() || m.file_type}
                  </p>
                </div>
                <Button onClick={() => handleDownload(m.file_url)} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 text-center">
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
              Upload any file type: PDFs, Word, images, videos…
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <input
              className="border rounded p-2"
              placeholder="Material Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUpload} className="w-full hover:scale-105 transition-all">
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
