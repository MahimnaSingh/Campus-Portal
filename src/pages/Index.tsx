
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, User, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFaculty, setIsFaculty] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Set user role based on switch selection
    localStorage.setItem("userRole", isFaculty ? "faculty" : "student");
    
    toast({
      title: "Login Successful",
      description: `You are now logged in as a ${isFaculty ? "faculty" : "student"}.`,
    });

    navigate("/dashboard");
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email to reset password.",
        variant: "destructive",
      });
      return;
    }

    // You'd replace this with an API call to send reset email
    toast({
      title: "Reset Link Sent",
      description: `A reset password link has been sent to ${forgotEmail}.`,
    });

    setShowForgotModal(false);
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Campus Portal</h1>
          <p className="text-gray-600">Access your academic information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Sign in to your account to access the campus portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email / Roll Number
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter roll number or email"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="faculty-mode" checked={isFaculty} onCheckedChange={setIsFaculty} />
                <label
                  htmlFor="faculty-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I am a faculty member
                </label>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full mb-4" onClick={handleSubmit}>
              Sign In
            </Button>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot password?
            </button>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-600">
          For technical support, contact infodesk@srmist.edu.in
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowForgotModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-2">Reset Password</h2>
            <p className="text-sm mb-4">
              Enter your registered email to receive a reset link.
            </p>
            <input
              type="email"
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <Button className="w-full" onClick={handleForgotPassword}>
              Send Reset Link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
