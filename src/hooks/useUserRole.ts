
import { useState, useEffect } from 'react';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<"student" | "faculty">("student");
  
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
    
    const handleStorageChange = () => {
      const currentRole = localStorage.getItem("userRole") as "student" | "faculty" | null;
      if (currentRole) {
        setUserRole(currentRole);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return userRole;
};
