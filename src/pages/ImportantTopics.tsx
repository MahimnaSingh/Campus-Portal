
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { subjects } from "@/data/mockData";
import { BookOpen, Download, FileText, PlusCircle, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Map to track uploaded important topics
const uploadedTopics = {};

const ImportantTopics = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicFile, setTopicFile] = useState(null);
  const [topicsList, setTopicsList] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);
  
  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTopicFile(e.target.files[0]);
    }
  };
  
  const handleTopicUpload = () => {
    if (!topicFile || !topicName || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic name and select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new topic entry
    const newTopic = {
      name: topicName,
      type: topicFile.name.split('.').pop().toUpperCase() || "FILE",
      size: `${(topicFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedOn: new Date().toLocaleDateString()
    };
    
    // Update topicsList state
    const updatedTopics = { ...topicsList };
    if (!updatedTopics[selectedSubject]) {
      updatedTopics[selectedSubject] = [];
    }
    updatedTopics[selectedSubject].push(newTopic);
    setTopicsList(updatedTopics);
    
    // Update uploadedTopics map for persistence
    uploadedTopics[selectedSubject] = updatedTopics[selectedSubject];
    
    // Reset form and close dialog
    setTopicName("");
    setTopicFile(null);
    setShowUploadDialog(false);
    
    toast({
      title: "Topic Uploaded",
      description: `${topicName} has been successfully uploaded.`
    });
  };
  
  const handleDownload = (topicName: string) => {
    toast({
      title: "Downloading",
      description: `Downloading ${topicName}...`,
    });
  };

  if (!selectedSubject) {
    return (
      <Layout title={userRole === "student" ? "Important Topics" : "Course Topics"}>
        <div className="mb-6">
          <p className="text-gray-600">
            {userRole === "student" 
              ? "Select a subject to view important topics and study resources prepared by your faculty."
              : "Select a subject to manage course topics for your students."}
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
                    {topicsList[subject.id]?.length || 0} topics available
                  </span>
                  <Button size="sm" variant="ghost">
                    View Topics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }
  
  const subject = subjects.find(s => s.id === selectedSubject);
  const currentTopics = topicsList[selectedSubject] || [];
  const hasTopics = currentTopics.length > 0;
  
  return (
    <Layout title={`${userRole === "student" ? "Important" : "Course"} Topics: ${subject?.name}`}>
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
                Upload New Topic
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p>
            {userRole === "student" 
              ? "Important topics and resources for your exam preparation."
              : "Manage important topics for your students to focus on."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {hasTopics 
              ? `${currentTopics.length} topics available`
              : "No topics uploaded yet"}
          </div>
          <Button variant="outline" onClick={() => setSelectedSubject(null)}>
            Back to Subjects
          </Button>
        </CardFooter>
      </Card>
      
      {hasTopics ? (
        <div className="space-y-4">
          {currentTopics.map((topic, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{topic.name}</h4>
                  <p className="text-sm text-gray-600">
                    {topic.type} • {topic.size} • Uploaded: {topic.uploadedOn}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownload(topic.name)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          {userRole === "student" ? (
            <div className="space-y-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="font-medium text-lg">No Topics Available</h3>
                <p className="text-gray-500">No important topics have been uploaded for this subject yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="font-medium text-lg">No Topics Uploaded Yet</h3>
                <p className="text-gray-500">Share important topics with your students for exam preparation.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add First Topic
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Important Topic</DialogTitle>
            <DialogDescription>
              Add important topics for students to access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="topicname" className="text-right col-span-1">
                Topic Name
              </label>
              <Input
                id="topicname"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Enter a name for this topic"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="topicfile" className="text-right col-span-1">
                File
              </label>
              <Input
                id="topicfile"
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
            <Button onClick={handleTopicUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ImportantTopics;
