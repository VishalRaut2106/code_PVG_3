"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "admin";
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = "/login" 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.replace(fallbackPath);
        return;
      }

      if (requiredRole && user.type !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        const redirectTo = user.type === "admin" ? "/admin" : "/dashboard";
        router.replace(redirectTo);
        return;
      }
    }
  }, [user, isLoading, requiredRole, router, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or wrong role
  if (!user || (requiredRole && user.type !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}