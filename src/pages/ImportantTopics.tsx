import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, PlusCircle, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { fetchSubjectsWithFaculty, fetchImportantTopics, uploadImportantTopic } from "@/lib/api";

interface Subject {
  courseId: string;
  courseName: string;
  facultyName: string;
  facultyId: string;
}

interface Topic {
  topic_id: number;
  topic: string;
  description: string;
  important_questions: string;
  date_added: string;
}

const ImportantTopics = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newImportantQuestions, setNewImportantQuestions] = useState("");
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjectsWithFaculty();
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) setUserRole(storedRole);

    loadSubjects();
  }, []);

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    try {
      const data = await fetchImportantTopics(subject.courseId);
      setTopics(data);
    } catch (err) {
      console.error("Error fetching topics", err);
    }
  };

  const handleUploadTopic = async () => {
    if (!newTopicName || !selectedSubject) {
      toast({ title: "Error", description: "Topic Name is required.", variant: "destructive" });
      return;
    }

    try {
      await uploadImportantTopic({
        courseId: selectedSubject.courseId,
        facultyId: selectedSubject.facultyId,
        topic: newTopicName,
        description: newTopicDescription,
        importantQuestions: newImportantQuestions,
      });

      toast({ title: "Success", description: "Topic uploaded successfully." });
      setShowUploadDialog(false);
      setNewTopicName("");
      setNewTopicDescription("");
      setNewImportantQuestions("");

      // Refresh topics
      const refreshed = await fetchImportantTopics(selectedSubject.courseId);
      setTopics(refreshed);
    } catch (err) {
      console.error("Error uploading topic", err);
      toast({ title: "Upload Failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  if (!selectedSubject) {
    return (
      <Layout title="Important Topics">
        <div className="mb-6">
          <p className="text-gray-600">
            Select a subject to view important topics prepared by your faculty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card 
              key={subject.courseId}
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => handleSelectSubject(subject)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold text-base">{subject.courseName}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {subject.courseId} | Faculty: {subject.facultyName}
                </p>
                <Button variant="outline" size="sm" className="w-full group-hover:scale-105 transition-all">
                  View Topics
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Important Topics: ${selectedSubject.courseName}`}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedSubject.courseName}</CardTitle>
              <CardDescription>
                {selectedSubject.courseId} | Faculty: {selectedSubject.facultyName}
              </CardDescription>
            </div>
            {userRole === "faculty" && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" /> Upload Topic
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {topics.length > 0 ? (
            topics.map((topic) => (
              <Card key={topic.topic_id} className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold">{topic.topic}</h4>
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                  {topic.important_questions && (
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Important Questions:</strong> {topic.important_questions}
                    </p>
                  )}
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No Topics Available</h3>
              <p className="text-gray-500">No important topics have been uploaded for this subject yet.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setSelectedSubject(null)}>
            Back to Subjects
          </Button>
        </CardFooter>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Important Topic</DialogTitle>
            <DialogDescription>Add a new important topic for this course.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Topic Name" 
              value={newTopicName} 
              onChange={(e) => setNewTopicName(e.target.value)} 
            />
            <Input 
              placeholder="Topic Description" 
              value={newTopicDescription} 
              onChange={(e) => setNewTopicDescription(e.target.value)} 
            />
            <Input 
              placeholder="Important Questions" 
              value={newImportantQuestions} 
              onChange={(e) => setNewImportantQuestions(e.target.value)} 
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleUploadTopic} className="w-full hover:scale-105 transition-all">
              Upload Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ImportantTopics;
