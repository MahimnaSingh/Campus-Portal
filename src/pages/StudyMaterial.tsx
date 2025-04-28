import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subjects } from "@/data/mockData";
import { BookOpen, Download, FileText, BookOpenCheck, Video, FileBox, Upload, ArrowLeft, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const defaultMaterialCategories = [
  {
    title: "Lecture Notes",
    icon: FileText,
    items: [
      { name: "Lecture 1 - Introduction", type: "PDF", size: "2.4 MB" },
      { name: "Lecture 2 - Core Concepts", type: "PDF", size: "3.1 MB" },
      { name: "Lecture 3 - Advanced Topics", type: "PDF", size: "2.8 MB" }
    ]
  },
  {
    title: "Presentations",
    icon: BookOpenCheck,
    items: [
      { name: "Course Overview", type: "PPT", size: "4.2 MB" },
      { name: "Chapter Summaries", type: "PPT", size: "5.7 MB" }
    ]
  },
  {
    title: "Video Lectures",
    icon: Video,
    items: [
      { name: "Introduction to the Course", type: "MP4", size: "45.6 MB" },
      { name: "Problem Solving Session", type: "MP4", size: "78.3 MB" }
    ]
  },
  {
    title: "Additional Resources",
    icon: FileBox,
    items: [
      { name: "Practice Problems Set", type: "PDF", size: "1.9 MB" },
      { name: "Reference Material", type: "PDF", size: "3.4 MB" },
      { name: "Previous Year Questions", type: "PDF", size: "2.2 MB" }
    ]
  }
];

const uploadedMaterials = {};

const StudyMaterial = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [materialCategories, setMaterialCategories] = useState(defaultMaterialCategories);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Lecture Notes");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    if (selectedSubject && uploadedMaterials[selectedSubject]) {
      setMaterialCategories(uploadedMaterials[selectedSubject]);
    } else if (selectedSubject) {
      setMaterialCategories(defaultMaterialCategories);
    }
  }, [selectedSubject]);
  
  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    
    if (uploadedMaterials[subjectId]) {
      setMaterialCategories(uploadedMaterials[subjectId]);
    } else {
      setMaterialCategories(defaultMaterialCategories);
    }
  };
  
  const handleDownload = (materialName: string) => {
    toast({
      title: "Downloading",
      description: `Downloading ${materialName}...`,
    });
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  
  const handleFileUpload = () => {
    if (!uploadedFile || !uploadFileName) {
      toast({
        title: "Missing Information",
        description: "Please provide a file name and select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedSubject) return;
    
    const updatedCategories = JSON.parse(JSON.stringify(materialCategories));
    
    const categoryIndex = updatedCategories.findIndex(cat => cat.title === uploadCategory);
    if (categoryIndex !== -1) {
      updatedCategories[categoryIndex].items.push({
        name: uploadFileName,
        type: uploadedFile.name.split('.').pop().toUpperCase() || "FILE",
        size: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
    
    setMaterialCategories(updatedCategories);
    uploadedMaterials[selectedSubject] = updatedCategories;
    
    setUploadedFile(null);
    setUploadFileName("");
    setShowUploadDialog(false);
    
    toast({
      title: "Upload Successful",
      description: `${uploadFileName} has been successfully uploaded.`
    });
  };

  const subject = selectedSubject 
    ? subjects.find(s => s.id === selectedSubject) 
    : null;

  if (!selectedSubject) {
    return (
      <Layout title={userRole === "student" ? "Study Material" : "Teaching Material"}>
        <div className="mb-6">
          <p className="text-gray-600">
            {userRole === "student" 
              ? "Select a subject to access lecture notes, presentations, and additional resources."
              : "Select a subject to manage teaching materials."}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">{subject.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {subject.code} | Faculty: {subject.faculty}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {subject.chapters.length} {subject.chapters.length === 1 ? 'chapter' : 'chapters'}
                  </span>
                  <Button size="sm" variant="ghost">
                    View Material
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${userRole === "student" ? "Study" : "Teaching"} Material: ${subject?.name}`}>
      <div className="mb-6">
        <Button variant="outline" onClick={() => setSelectedSubject(null)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{subject?.name}</CardTitle>
              <CardDescription>
                {subject?.code} | Faculty: {subject?.faculty}
              </CardDescription>
            </div>
            
            {userRole === "faculty" && (
              <Button 
                onClick={() => setShowUploadDialog(true)}
                variant="outline" 
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New Material
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p>
            Below you'll find lecture notes, presentations, and additional resources for this subject.
            {userRole === "student" ? " Click on any item to download or view it." : ""}
          </p>
        </CardContent>
      </Card>

      {materialCategories.map((category, categoryIndex) => {
        const Icon = category.icon;
        const hasItems = category.items.length > 0;
        
        return (
          <div key={categoryIndex} className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Icon className="h-5 w-5 mr-2 text-primary" />
              {category.title}
            </h3>
            
            {hasItems ? (
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <Card key={itemIndex}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.type} • {item.size}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(item.name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
                {userRole === "faculty" ? (
                  <div>
                    <p className="mb-2">No materials uploaded in this category yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setUploadCategory(category.title);
                        setShowUploadDialog(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Material
                    </Button>
                  </div>
                ) : (
                  <p>No materials available in this category.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>* All materials are for educational purposes only and should not be distributed.</p>
      </div>
      
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Teaching Material</DialogTitle>
            <DialogDescription>
              Add new teaching material for students to access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right col-span-1">
                Category
              </label>
              <select
                id="category"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="col-span-3 p-2 border rounded-md"
              >
                {materialCategories.map((cat) => (
                  <option key={cat.title} value={cat.title}>{cat.title}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="filename" className="text-right col-span-1">
                File Name
              </label>
              <Input
                id="filename"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="Enter a descriptive name for the file"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="file" className="text-right col-span-1">
                File
              </label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StudyMaterial;
