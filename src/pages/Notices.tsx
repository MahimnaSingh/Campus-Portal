
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock notices data
const mockNotices = [
  {
    id: 1,
    title: "Exam Schedule Change",
    category: "Exams",
    priority: "high",
    date: "2025-04-15",
    content: "The final examination schedule for Computer Science department has been revised. The new schedule has been published on the university portal. Please check and plan accordingly.",
    read: false
  },
  {
    id: 2,
    title: "Faculty Meeting",
    category: "Meeting",
    priority: "medium",
    date: "2025-04-13",
    content: "All faculty members are requested to attend a department meeting on 13th April at 2:00 PM in the conference hall to discuss the upcoming semester's course allocation.",
    read: true
  },
  {
    id: 3,
    title: "Grade Submission Deadline",
    category: "Grades",
    priority: "high",
    date: "2025-04-20",
    content: "All faculty members are reminded that the final deadline for submitting student grades for the current semester is April 20th, 2025. Please ensure all evaluations are completed by this date.",
    read: false
  },
  {
    id: 4,
    title: "New Learning Management System",
    category: "Technology",
    priority: "medium",
    date: "2025-04-18",
    content: "The university is implementing a new Learning Management System. Training sessions will be conducted next week. All faculty members are required to attend at least one session.",
    read: false
  },
  {
    id: 5,
    title: "Research Grant Opportunity",
    category: "Research",
    priority: "low",
    date: "2025-04-25",
    content: "A new research grant opportunity is available for faculty members in the fields of Computer Science, Information Technology and Data Science. The last date to apply is May 5th, 2025.",
    read: true
  }
];

const Notices = () => {
  const [notices, setNotices] = useState(mockNotices);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const markAsRead = (id: number) => {
    setNotices(notices.map(notice => 
      notice.id === id ? { ...notice, read: true } : notice
    ));
  };
  
  const getFilteredNotices = () => {
    if (!selectedCategory) return notices;
    return notices.filter(notice => notice.category === selectedCategory);
  };
  
  const categories = [...new Set(notices.map(notice => notice.category))];
  const unreadCount = notices.filter(notice => !notice.read).length;
  
  const filteredNotices = getFilteredNotices();

  return (
    <Layout title="Notice Board">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-bold">Department Notices</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} Unread
            </Badge>
          )}
        </div>
        <div>
          <select 
            className="p-2 border rounded-md"
            value={selectedCategory || ''}
            onChange={e => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredNotices.map(notice => (
          <Card 
            key={notice.id} 
            className={`border-l-4 ${
              notice.priority === 'high' 
                ? 'border-l-red-500' 
                : notice.priority === 'medium' 
                  ? 'border-l-amber-500' 
                  : 'border-l-blue-500'
            } ${!notice.read ? 'bg-gray-50' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    {!notice.read && (
                      <Badge variant="secondary" className="ml-2">New</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(notice.date).toLocaleDateString()}
                    <span className="mx-1">•</span>
                    {notice.category}
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    notice.priority === 'high' ? 'destructive' : 
                    notice.priority === 'medium' ? 'default' : 
                    'outline'
                  }
                >
                  {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)} Priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{notice.content}</p>
              <div className="flex justify-end mt-4 space-x-2">
                {!notice.read ? (
                  <button 
                    onClick={() => markAsRead(notice.id)} 
                    className="flex items-center text-sm text-primary hover:underline"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as read
                  </button>
                ) : (
                  <span className="flex items-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Read
                  </span>
                )}
                <button className="flex items-center text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4 mr-1" />
                  View full notice
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredNotices.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No notices found</h3>
            <p className="text-gray-500">
              {selectedCategory 
                ? `No notices found in the ${selectedCategory} category` 
                : 'There are currently no notices'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notices;
