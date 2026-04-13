import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useBackendActor";
import { useRegisterStudent } from "../hooks/useQueries";
import type { Class } from "../types";
import { getCanisterErrorMessage } from "../utils/errorHandling";
import { generateOtp, verifyOtp } from "../utils/otpService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();

  const [formData, setFormData] = useState({
    class: "" as Class | "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerMutation = useRegisterStudent();

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmailField = () => {
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const handleSendOtp = () => {
    if (!validateEmailField()) return;
    setOtpLoading(true);
    setOtpError(null);

    // Generate OTP locally (no backend call needed)
    const otp = generateOtp(formData.email);
    setOtpSent(true);
    setOtpValue("");
    startCountdown();
    setOtpLoading(false);

    // Show OTP in a prominent toast notification
    toast.info(
      `📋 आपका OTP / Your OTP is: ${otp}\n\nनीचे दर्ज करें / Enter below to verify your email.`,
      {
        duration: 20000,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#1e40af",
          color: "white",
          border: "2px solid #3b82f6",
          padding: "16px",
        },
      },
    );
  };

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setVerifyLoading(true);
    setOtpError(null);

    const result = verifyOtp(formData.email, otpValue);
    setVerifyLoading(false);

    if (result.valid) {
      setEmailVerified(true);
      setOtpSent(false);
      toast.success("Email verified successfully! / ईमेल सत्यापित हो गया!");
    } else if (result.expired) {
      setOtpError(
        "OTP expired. Please request a new one. / OTP की समय सीमा समाप्त हो गई।",
      );
    } else {
      setOtpError("Invalid OTP. Please try again. / गलत OTP, पुनः प्रयास करें।");
    }
  };

  const handleResendOtp = () => {
    setOtpValue("");
    setOtpError(null);
    handleSendOtp();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.class) newErrors.class = "Please select a class";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!emailVerified) {
      newErrors.email = "Please verify your email first.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!actor) {
      setSubmitError(
        "Connecting to server, please wait a moment and try again.",
      );
      return;
    }

    if (!validateForm()) return;

    try {
      await registerMutation.mutateAsync({
        _class: formData.class as Class,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Registration successful! Please login to continue.");
      navigate({ to: "/login" });
    } catch (error: unknown) {
      const friendlyMessage = getCanisterErrorMessage(error);
      setSubmitError(friendlyMessage);
    }
  };

  const isSubmitDisabled =
    actorLoading || !actor || registerMutation.isPending || !emailVerified;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Student Registration
          </CardTitle>
          <CardDescription className="text-center">
            Step 1: Create your account to begin the admission process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(actorLoading || (!actor && !actorLoading)) && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Connecting to server, please wait...
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="class">Class of Admission *</Label>
              <Select
                value={formData.class}
                onValueChange={(value) =>
                  setFormData({ ...formData, class: value as Class })
                }
              >
                <SelectTrigger
                  id="class"
                  className={errors.class ? "border-destructive" : ""}
                  data-ocid="register.class.select"
                >
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class09th">09th</SelectItem>
                  <SelectItem value="class10th">10th</SelectItem>
                  <SelectItem value="class11th">11th</SelectItem>
                  <SelectItem value="class12th">12th</SelectItem>
                </SelectContent>
              </Select>
              {errors.class && (
                <p className="text-sm text-destructive">{errors.class}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={errors.name ? "border-destructive" : ""}
                data-ocid="register.name.input"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email with OTP */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="flex gap-2 items-start">
                <div className="flex-1 relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      if (!emailVerified && !otpSent) {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    readOnly={otpSent || emailVerified}
                    className={`${
                      errors.email ? "border-destructive" : ""
                    } ${emailVerified ? "border-green-500 pr-9" : ""} ${
                      otpSent || emailVerified ? "bg-muted" : ""
                    }`}
                    data-ocid="register.email.input"
                  />
                  {emailVerified && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {!emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 mt-0"
                    onClick={handleSendOtp}
                    disabled={otpLoading || (otpSent && countdown > 0)}
                    data-ocid="register.send_otp.button"
                  >
                    {otpLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 mr-1" />
                    )}
                    {otpSent ? "Resend" : "Send OTP"}
                  </Button>
                )}
              </div>

              {emailVerified && (
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email verified! / ईमेल सत्यापित हो गया!
                </p>
              )}

              {errors.email && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="register.email.error_state"
                >
                  {errors.email}
                </p>
              )}

              {/* OTP Input Section */}
              {otpSent && !emailVerified && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                  <p className="text-sm font-semibold text-blue-800">
                    ✅ OTP screen पर दिख रहा है — नीचे देखें और 6-digit OTP दर्ज करें
                  </p>
                  <p className="text-xs text-blue-600">
                    OTP is shown in the notification at the top of the screen.
                    Enter it below.
                  </p>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={(val) => {
                        setOtpValue(val);
                        if (otpError) setOtpError(null);
                      }}
                      data-ocid="register.otp.input"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {otpError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <AlertDescription className="text-xs">
                        {otpError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyLoading || otpValue.length !== 6}
                      className="flex-1"
                      data-ocid="register.verify_otp.button"
                    >
                      {verifyLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      disabled={otpLoading || countdown > 0}
                      className="shrink-0 text-xs"
                      data-ocid="register.resend_otp.button"
                    >
                      {countdown > 0 ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Resend OTP
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={errors.password ? "border-destructive" : ""}
                data-ocid="register.password.input"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={errors.confirmPassword ? "border-destructive" : ""}
                data-ocid="register.confirm_password.input"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {!emailVerified && (
              <p className="text-xs text-muted-foreground text-center">
                Please verify your email address to enable registration.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitDisabled}
              data-ocid="register.submit_button"
            >
              {actorLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="text-primary hover:underline font-medium"
                data-ocid="register.login.link"
              >
                Login here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
