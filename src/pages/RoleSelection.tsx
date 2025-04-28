
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, User } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: "student" | "faculty") => {
    localStorage.setItem("userRole", role);
    navigate(`/login-${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
            <CardTitle>Select Login Type</CardTitle>
            <CardDescription>
              Choose how you want to access the campus portal
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-8 h-auto"
              onClick={() => handleRoleSelection("student")}
            >
              <div className="flex flex-col items-center">
                <User className="h-12 w-12 mb-2" />
                <span className="text-lg font-medium">Student Login</span>
                <span className="text-sm text-muted-foreground">For students to access their academic information</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-8 h-auto"
              onClick={() => handleRoleSelection("faculty")}
            >
              <div className="flex flex-col items-center">
                <GraduationCap className="h-12 w-12 mb-2" />
                <span className="text-lg font-medium">Faculty Login</span>
                <span className="text-sm text-muted-foreground">For faculty members to access teaching tools</span>
              </div>
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500 w-full text-center">
              For technical support, contact infodesk@srmist.edu.in
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
