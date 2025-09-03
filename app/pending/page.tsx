"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Mail, ArrowLeft, RefreshCw, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("PENDING");
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "">("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    userId: ""
  });

  useEffect(() => {
    // Get user info from localStorage
    const pendingUserName = localStorage.getItem("pendingUserName") || "Student";
    const pendingUserEmail = localStorage.getItem("pendingUserEmail") || "";
    const pendingUserId = localStorage.getItem("pendingUserId") || "";
    
    setUserInfo({
      name: pendingUserName,
      email: pendingUserEmail,
      userId: pendingUserId
    });

    // Auto-check status on page load if email exists
    if (pendingUserEmail) {
      checkApprovalStatusSilent(pendingUserEmail);
    }
  }, []);

  const checkApprovalStatusSilent = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:4545/api/auth/status/email/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentStatus(result.status);
        
        // If approved, automatically redirect
        if (result.status === "APPROVED" || result.status === "ACTIVE") {
          localStorage.removeItem("pendingUserId");
          localStorage.removeItem("pendingUserName");
          localStorage.removeItem("pendingUserEmail");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Silent status check failed:", error);
    }
  };

  const checkApprovalStatus = async () => {
    if (!userInfo.email) {
      setStatusMessage("No email found. Please register again.");
      setMessageType("error");
      return;
    }

    setIsChecking(true);
    setStatusMessage("");
    setMessageType("");
    
    try {
      const response = await fetch(`http://localhost:4545/api/auth/status/email/${userInfo.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Status check result:", result);
        
        // Update the current status
        setCurrentStatus(result.status);
        
        // Check if the status has changed from PENDING
        if (result.status === "APPROVED" || result.status === "ACTIVE") {
          // User is approved, redirect to login or dashboard
          localStorage.removeItem("pendingUserId");
          localStorage.removeItem("pendingUserName");
          localStorage.removeItem("pendingUserEmail");
          
          setStatusMessage("Great news! Your account has been approved. You can now sign in.");
          setMessageType("success");
          
          // Redirect after showing the message
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else if (result.status === "PENDING") {
          // Still pending, show current status
          setStatusMessage("Your account is still pending approval. Please check back later.");
          setMessageType("info");
        } else if (result.status === "REJECTED") {
          // Account was rejected
          setStatusMessage("Unfortunately, your account application was not approved. Please contact admin for more information.");
          setMessageType("error");
        } else {
          // Unknown status
          setStatusMessage(`Current status: ${result.status}`);
          setMessageType("info");
        }
      } else {
        const errorData = await response.json();
        console.error("Status check failed:", errorData);
        setStatusMessage(`Error checking status: ${errorData.message || "Please try again later"}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setStatusMessage("Network error. Please check if the server is running on localhost:4545");
      setMessageType("error");
    }
    
    setIsChecking(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-secondary/20 to-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative bg-background/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/5 via-secondary/5 to-accent/5 p-6 border-b border-border/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20">
                <Image
                  src="/images/codepvg-logo.png"
                  alt="CodePVG Logo"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </div>
              <span className="font-heading text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                CodePVG
              </span>
            </div>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted/50 rounded-full border border-border/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/30">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Registration Pending
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Your account has been created successfully and is awaiting admin approval
              </p>
            </div>
          </div>
        </div>

        {/* Content - Landscape Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Status Information */}
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                      Registration Successful!
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                      Your student account has been created successfully. We've received all your information and it's now being reviewed by our administrators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">
                      Awaiting Admin Approval
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed mb-3">
                      Your account is currently under review. This process typically takes 24-48 hours during business days.
                    </p>
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      <strong>Status:</strong> {currentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                      What happens next?
                    </h3>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>You'll receive an email notification once your account is approved</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>After approval, you can sign in and start your coding journey</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Access to all DSA problems and practice materials will be available</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - User Info and Actions */}
            <div className="space-y-6">
              {/* User Information */}
              {userInfo.name && (
                <div className="bg-muted/30 rounded-xl p-6">
                  <h4 className="font-semibold text-foreground mb-4 text-lg">Registration Details</h4>
                  <div className="text-sm text-muted-foreground space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-medium">Name:</span>
                      <span>{userInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/30">
                      <span className="font-medium">Email:</span>
                      <span className="text-right break-all">{userInfo.email}</span>
                    </div>
                    {userInfo.userId && (
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">User ID:</span>
                        <span>{userInfo.userId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Message */}
              {statusMessage && (
                <div className={`rounded-xl p-4 border ${
                  messageType === "success" 
                    ? "bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-400" 
                    : messageType === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-400"
                }`}>
                  <div className="flex items-start space-x-3">
                    {messageType === "success" && <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />}
                    {messageType === "error" && <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />}
                    {messageType === "info" && <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600" />}
                    <p className="text-sm font-medium">{statusMessage}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={checkApprovalStatus}
                  disabled={isChecking}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white h-14 font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 text-lg"
                >
                  {isChecking ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Checking Status...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5" />
                      <span>Check Approval Status</span>
                    </div>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-border/50 hover:bg-muted/50"
                    >
                      Back to Login
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      className="w-full bg-gradient-to-r from-accent via-accent to-secondary text-accent-foreground h-12 font-semibold rounded-xl shadow-lg hover:shadow-xl"
                    >
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Contact Information */}
              <div className="text-center bg-muted/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us at{" "}
                  <a href="mailto:admin@codepvg.com" className="text-accent hover:underline font-medium">
                    admin@codepvg.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}