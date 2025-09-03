"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";

const DEV_MODE = false; // <-- set false before final commit

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [userType, setUserType] = useState<"student" | "admin">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    prnNo: "",
    mobile: "",
    branch: "",
    year: "",
    adminCode: "",
    department: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (DEV_MODE) {
      localStorage.setItem("token", "dummy-token");
      localStorage.setItem("userType", userType);
      localStorage.setItem("userName", formData.firstName || "Student");
      
      // Redirect based on user type
      if (userType === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      setIsLoading(false);
      return;
    }

    // API Integration for registration
    if (authMode === "signup" && userType === "student") {
      try {
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.email ||
          !formData.password || !formData.prnNo || !formData.mobile ||
          !formData.branch || !formData.year) {
          setError("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const registrationData = {
          username: formData.firstName.toLowerCase() + formData.lastName.toLowerCase(),
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`,
          year: formData.year === "first" ? "1st Year" :
            formData.year === "second" ? "2nd Year" :
              formData.year === "third" ? "3rd Year" : "4th Year",
          branch: formData.branch === "computer" ? "Computer Engineering" :
            formData.branch === "it" ? "Information Technology" :
              formData.branch === "aids" ? "AI & Data Science" : "Electronics & Telecommunication",
          prnNumber: formData.prnNo,
          mobileNumber: formData.mobile,
          role: "student"
        };

        const response = await fetch("http://localhost:4545/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Registration successful:", result);

          // Check if the registration is pending approval
          if (result.status === "PENDING") {
            // Store pending user data
            localStorage.setItem("pendingUserId", result.userId || "");
            localStorage.setItem("pendingUserName", formData.firstName);
            localStorage.setItem("pendingUserEmail", formData.email);
            router.push("/pending");
          } else {
            // Store user data and redirect to dashboard for approved users
            localStorage.setItem("token", result.token || "dummy-token");
            localStorage.setItem("userType", "student");
            localStorage.setItem("userName", formData.firstName);
            router.push("/dashboard");
          }
        } else {
          const errorData = await response.json();
          console.error("Registration failed:", errorData);
          setError(errorData.message || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Network error:", error);
        setError("Network error. Please check if the server is running on localhost:4545");
      }
    }

    // API Integration for login
    if (authMode === "login") {
      try {
        // Validate required fields for login
        if (!formData.email || !formData.password) {
          setError("Please enter both email and password");
          setIsLoading(false);
          return;
        }

        const loginData = {
          email: formData.email,
          password: formData.password
        };

        const response = await fetch("http://localhost:4545/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Login successful:", result);

          // Store user data from login response
          localStorage.setItem("token", result.token);
          localStorage.setItem("userType", result.user.role.toLowerCase());
          localStorage.setItem("userName", result.user.fullName);
          localStorage.setItem("userId", result.user.id);
          localStorage.setItem("userEmail", result.user.email);

          // Store role-specific data
          if (result.user.role === "ADMIN") {
            localStorage.setItem("userDepartment", result.user.department || "");
            localStorage.setItem("userUsername", result.user.username);
            localStorage.setItem("totalSolved", result.user.totalSolved?.toString() || "0");
            localStorage.setItem("totalSubmissions", result.user.totalSubmissions?.toString() || "0");
          } else {
            localStorage.setItem("userBranch", result.user.branch || "");
            localStorage.setItem("userYear", result.user.year || "");
            localStorage.setItem("userPRN", result.user.prnNumber || "");
            localStorage.setItem("userUsername", result.user.username || "");
            localStorage.setItem("totalSolved", result.user.totalSolved?.toString() || "0");
            localStorage.setItem("totalSubmissions", result.user.totalSubmissions?.toString() || "0");
          }

          // Update auth context
          login({
            id: result.user.id,
            email: result.user.email,
            name: result.user.fullName,
            type: result.user.role.toLowerCase() as "student" | "admin",
            token: result.token,
          });

          // AuthProvider will handle the redirect
        } else {
          const errorData = await response.json();
          console.error("Login failed:", errorData);
          
          // Check if account is not approved yet
          if (errorData.error === "Account not approved yet. Please wait for admin approval.") {
            // Store pending user data and redirect to pending page
            localStorage.setItem("pendingUserEmail", formData.email);
            localStorage.setItem("pendingUserName", "Student"); // We don't have the name from login
            router.push("/pending");
          } else {
            setError(errorData.error || errorData.message || "Login failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Network error:", error);
        setError("Network error. Please check if the server is running on localhost:4545");
      }
    }

    // API Integration for admin registration
    if (authMode === "signup" && userType === "admin") {
      try {
        // Validate required fields for admin
        if (!formData.firstName || !formData.lastName || !formData.email ||
          !formData.password || !formData.department || !formData.adminCode) {
          setError("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const adminRegistrationData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          adminAccessCode: formData.adminCode,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };

        const response = await fetch("http://localhost:4545/api/auth/register/admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adminRegistrationData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Admin registration successful:", result);

          // Store admin data from the API response
          localStorage.setItem("token", result.token);
          localStorage.setItem("userType", "admin");
          localStorage.setItem("userName", result.user.fullName || formData.firstName);
          localStorage.setItem("userId", result.user.id);
          localStorage.setItem("userEmail", result.user.email);
          localStorage.setItem("userDepartment", result.user.department);
          localStorage.setItem("userRole", result.user.role);
          
          // Redirect to admin page
          router.push("/admin");
        } else {
          const errorData = await response.json();
          console.error("Admin registration failed:", errorData);
          setError(errorData.message || "Admin registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Network error:", error);
        setError("Network error. Please check if the server is running on localhost:4545");
      }
    }

    setIsLoading(false);
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

      <div className="relative bg-background/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/5 via-secondary/5 to-accent/5 p-8 border-b border-border/30">
          <div className="flex items-center justify-between mb-6">
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

          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
              {authMode === "login" ? "Welcome Back!" : "Join CodePVG"}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {authMode === "login"
                ? "Sign in to continue your coding journey and track your progress"
                : "Start your personalized learning experience with our community"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Select Role */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground mb-4 block">
              Select your role:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${userType === "student"
                  ? "border-accent bg-gradient-to-br from-accent/10 to-accent/5 text-accent shadow-lg"
                  : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
              >
                <GraduationCap className="h-7 w-7 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="font-semibold text-base">Student</div>
                <div className="text-xs opacity-75 mt-1">
                  Learn & Practice DSA
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${userType === "admin"
                  ? "border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5 text-secondary shadow-lg"
                  : "border-border hover:border-secondary/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
              >
                <Shield className="h-7 w-7 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="font-semibold text-base">Admin</div>
                <div className="text-xs opacity-75 mt-1">Manage Platform</div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === "signup" && (
              <>
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      First Name
                    </label>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Last Name
                    </label>
                    <Input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-accent"
                      required
                    />
                  </div>
                </div>

                {userType === "student" ? (
                  <>
                    {/* PRN Number */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        PRN Number
                      </label>
                      <Input
                        name="prnNo"
                        placeholder="Enter your PRN number"
                        value={formData.prnNo}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-accent"
                        required
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Mobile Number
                      </label>
                      <Input
                        name="mobile"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-accent"
                        required
                      />
                    </div>

                    {/* Branch */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Branch
                      </label>
                      <Select
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, branch: val }))
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 focus:border-accent">
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="computer">Computer</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="aids">AIDS</SelectItem>
                          <SelectItem value="entc">E&TC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Year
                      </label>
                      <Select
                        onValueChange={(val) =>
                          setFormData((prev) => ({ ...prev, year: val }))
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 focus:border-accent">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First Year</SelectItem>
                          <SelectItem value="second">Second Year</SelectItem>
                          <SelectItem value="third">Third Year</SelectItem>
                          <SelectItem value="final">Final Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Department
                      </label>
                      <Input
                        name="department"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-secondary"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Admin Access Code
                      </label>
                      <Input
                        name="adminCode"
                        placeholder="Enter admin access code"
                        value={formData.adminCode}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-secondary"
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Email Address
              </label>
              <Input
                name="email"
                type="email"
                placeholder="your.email@college.edu"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 rounded-xl border-border/50 focus:border-accent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Password
              </label>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-12 rounded-xl border-border/50 focus:border-accent"
                required
              />
            </div>

            {authMode === "signup" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Confirm Password
                </label>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl border-border/50 focus:border-accent"
                  required
                />
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent via-accent to-secondary text-accent-foreground py-4 font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                authMode === "login"
                  ? `Sign In as ${userType}`
                  : `Create ${userType} Account`
              )}
            </Button>
          </form>

          {/* Forgot Password + Switch Mode */}
          {authMode === "login" && (
            <div className="text-center mt-6">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-accent font-medium"
              >
                Forgot your password?
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
              <Button
                variant="link"
                className="ml-1 p-0 h-auto font-semibold text-accent hover:text-accent/80 transition-colors"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "signup" : "login")
                }
              >
                {authMode === "login" ? "Sign up here" : "Sign in here"}
              </Button>
            </p>

            {authMode === "signup" && (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
