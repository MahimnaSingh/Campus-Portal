// src/pages/ImportantTopics.tsx

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Upload, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import {
  fetchSubjectsWithFaculty,
  fetchImportantTopics,
  uploadImportantTopic,
} from "@/lib/api";

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

export default function ImportantTopics() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newImportantQuestions, setNewImportantQuestions] = useState("");
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");

  // Load subjects & role on mount
  useEffect(() => {
    async function loadSubjects() {
      try {
        const subs = await fetchSubjectsWithFaculty();
        setSubjects(subs);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    }

    const role = localStorage.getItem("userRole") as
      | "student"
      | "faculty"
      | null;
    if (role) setUserRole(role);

    loadSubjects();
  }, []);

  // Helper: normalize whatever the API returns into our UI shape
  const normalizeTopic = (t: any): Topic => ({
    topic_id: t.topic_id,
    topic: "topic_title" in t ? t.topic_title : t.topic,
    description: "topic_description" in t ? t.topic_description : t.description,
    important_questions: t.important_questions,
    date_added: "date_posted" in t ? t.date_posted : t.date_added,
  });

  // When a subject is clicked, fetch & normalize its topics
  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    try {
      const raw = await fetchImportantTopics(subject.courseId);
      setTopics(raw.map(normalizeTopic));
    } catch (err) {
      console.error("Error fetching topics", err);
    }
  };

  // Upload a new topic, then re-fetch & normalize to get the full list (including the new one)
  const handleUploadTopic = async () => {
    if (!newTopicName.trim() || !selectedSubject) {
      toast({
        title: "Error",
        description: "Topic Name is required.",
        variant: "destructive",
      });
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

      // Re-fetch the full list so we see the newly-added topic
      const raw = await fetchImportantTopics(selectedSubject.courseId);
      setTopics(raw.map(normalizeTopic));
    } catch (err) {
      console.error("Error uploading topic", err);
      toast({
        title: "Upload Failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  // If no subject selected, show the grid of subjects
  if (!selectedSubject) {
    return (
      <Layout title="Important Topics">
        <p className="text-gray-600 mb-6">
          Select a subject to view important topics prepared by your faculty.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <Card
              key={sub.courseId}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => handleSelectSubject(sub)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold text-base">
                    {sub.courseName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {sub.courseId} | Faculty: {sub.facultyName}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Topics
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  // If a subject is selected, show its topics and (for faculty) the upload dialog
  return (
    <Layout title={`Important Topics: ${selectedSubject.courseName}`}>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedSubject.courseName}</CardTitle>
              <CardDescription>
                {selectedSubject.courseId} | Faculty:{" "}
                {selectedSubject.facultyName}
              </CardDescription>
            </div>
            {userRole === "faculty" && (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Topic
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {topics.length > 0 ? (
            topics.map((t) => (
              <Card key={t.topic_id} className="mb-4">
                <CardContent className="p-4">
                  <h4 className="font-semibold">{t.topic}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.description}
                  </p>
                  {t.important_questions && (
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Important Questions:</strong>{" "}
                      {t.important_questions}
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
              <h3 className="font-medium text-lg mb-2">
                No Topics Available
              </h3>
              <p className="text-gray-500">
                No important topics have been uploaded for this subject yet.
              </p>
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
            <DialogDescription>
              Add a new important topic for this course.
            </DialogDescription>
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
            <Button
              onClick={handleUploadTopic}
              className="w-full hover:scale-105 transition-all"
            >
              Upload Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
