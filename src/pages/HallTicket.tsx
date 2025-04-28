
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { semesterInfo } from "@/data/mockData";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileDialog from "@/components/hall-ticket/MobileDialog";
import ExamSchedule from "@/components/hall-ticket/ExamSchedule";
import { useRazorpay } from "@/hooks/useRazorpay";

const HallTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  const [showMobileDialog, setShowMobileDialog] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  
  const examStartDate = new Date(semesterInfo.examStartDate);
  const examEndDate = new Date(semesterInfo.examEndDate);
  const registrationDeadline = new Date(semesterInfo.registrationDeadline);
  
  const isOddSemester = semesterInfo.current.includes("Odd");
  const today = new Date();
  const isRegistrationOpen = today < registrationDeadline;
  
  const { isProcessingPayment, initializePayment } = useRazorpay(() => setIsRegistered(true));

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
      if (storedRole === "faculty") {
        navigate("/dashboard");
      }
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded successfully");
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [navigate]);

  const handleDownloadClick = () => {
    toast({
      title: "Hall Ticket Downloaded",
      description: "Hall ticket downloaded successfully!",
    });
  };

  if (userRole === "faculty") {
    return null;
  }

  return (
    <Layout title="Hall Ticket">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {isOddSemester ? "Odd Semester (Fall)" : "Even Semester (Spring)"} Examination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Examination Period:</span>
              <span className="font-medium">
                {examStartDate.toLocaleDateString()} to {examEndDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Registration Deadline:</span>
              <span className="font-medium">{registrationDeadline.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-gray-600">Examination Fee:</span>
              <span className="font-medium">₹{semesterInfo.feeAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Registration Status:</span>
              <span className={`font-medium ${isRegistered ? "text-green-600" : "text-amber-600"}`}>
                {isRegistered ? "Registered" : "Not Registered"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isRegistered ? (
            <Button onClick={handleDownloadClick}>Download Hall Ticket</Button>
          ) : (
            <Button 
              onClick={() => setShowMobileDialog(true)}
              disabled={!isRegistrationOpen || isProcessingPayment}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessingPayment ? "Processing..." : "Pay & Register"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {!isRegistrationOpen && !isRegistered && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start mb-6">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800">
            Registration deadline has passed. Please contact the examination department for late registration options.
          </p>
        </div>
      )}

      <ExamSchedule examStartDate={examStartDate} />

      <MobileDialog
        open={showMobileDialog}
        onOpenChange={setShowMobileDialog}
        mobileNumber={mobileNumber}
        onMobileNumberChange={setMobileNumber}
        onContinue={() => initializePayment(mobileNumber, semesterInfo.feeAmount)}
      />
    </Layout>
  );
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default HallTicket;
