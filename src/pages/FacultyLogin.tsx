
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { loginFaculty } from "@/lib/api";

const FacultyLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [facultyId, setFacultyId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!facultyId || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await loginFaculty(facultyId, password);
      
      if (response.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to the campus portal",
        });
        
        localStorage.setItem("userRole", "faculty");
        localStorage.setItem("userData", JSON.stringify(response.user));
        
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "There was an error connecting to the server. Please try again later.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Campus Portal</h1>
          <p className="text-gray-600">Faculty Login</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Faculty Login</CardTitle>
            <CardDescription>
              Enter your faculty ID and password to access teaching tools
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty ID</Label>
                <Input 
                  id="facultyId" 
                  placeholder="Enter your faculty ID" 
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default FacultyLogin;
