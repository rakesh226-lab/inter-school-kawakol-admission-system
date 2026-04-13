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
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useBackendActor";
import { useGetCallerStudent, useLoginStudent } from "../hooks/useQueries";
import { getCanisterErrorMessage } from "../utils/errorHandling";

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor, isFetching: actorLoading } = useActor();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loginMutation = useLoginStudent();
  const { refetch: refetchStudent } = useGetCallerStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!actor) {
      setSubmitError(
        "Connecting to server, please wait a moment and try again.",
      );
      return;
    }

    if (!formData.email || !formData.password) {
      setSubmitError("Please enter both email and password");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Fetch student data to determine redirect
      const { data: student } = await refetchStudent();

      if (student) {
        if (student.status === "draft" || !student.form) {
          navigate({ to: "/admission-form" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } else {
        toast.error("Unable to fetch student data");
      }
    } catch (error: unknown) {
      const friendlyMessage = getCanisterErrorMessage(error);
      setSubmitError(friendlyMessage);
    }
  };

  const isSubmitDisabled = actorLoading || !actor || loginMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Student Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your admission form
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

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (submitError) setSubmitError(null);
                }}
                data-ocid="login.email.input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/forgot-password" })}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  data-ocid="login.forgot_password.link"
                >
                  <KeyRound className="h-3 w-3" />
                  Forgot Password? / पासवर्ड भूल गए?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (submitError) setSubmitError(null);
                }}
                data-ocid="login.password.input"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitDisabled}
              data-ocid="login.submit_button"
            >
              {actorLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/register" })}
                className="text-primary hover:underline font-medium"
                data-ocid="login.register.link"
              >
                Register here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
