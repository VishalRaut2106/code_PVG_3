"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  type: "student" | "admin";
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/pending", "/about", "/contact", "/terms", "/privacy"];

// Routes that should redirect to dashboard/admin if already logged in
const AUTH_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        const userName = localStorage.getItem("userName");
        const userId = localStorage.getItem("userId");
        const userEmail = localStorage.getItem("userEmail");

        if (token && userType && userName && userId && userEmail) {
          const userData: User = {
            id: userId,
            email: userEmail,
            name: userName,
            type: userType as "student" | "admin",
            token: token,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Clear potentially corrupted data
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (user) {
      // User is logged in
      if (isAuthRoute) {
        // Redirect logged-in users away from auth pages
        const redirectTo = user.type === "admin" ? "/admin" : "/dashboard";
        router.replace(redirectTo);
      }
    } else {
      // User is not logged in
      if (!isPublicRoute) {
        // Redirect to login for protected routes
        router.replace("/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("userBranch");
    localStorage.removeItem("userYear");
    localStorage.removeItem("userPRN");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("totalSolved");
    localStorage.removeItem("totalSubmissions");
    localStorage.removeItem("userRole");
  };

  const login = (userData: User) => {
    setUser(userData);
    // Data is already stored in localStorage by the login process
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
    router.replace("/login");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}