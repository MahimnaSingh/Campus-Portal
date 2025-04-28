
import React from "react";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Campus Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
