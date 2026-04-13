import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  LogOut,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import PrintableAdmissionForm from "../components/PrintableAdmissionForm";
import {
  useGetAdmissionNumber,
  useGetCallerStudent,
} from "../hooks/useQueries";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: student, isLoading } = useGetCallerStudent();
  const { data: admissionNumber } = useGetAdmissionNumber(student?.email);

  const handleLogout = () => {
    queryClient.clear();
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (!isLoading && !student) {
      navigate({ to: "/login" });
    }
  }, [student, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) return null;

  const getStatusBadge = () => {
    switch (student.status) {
      case "pending":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Clock className="mr-1 h-4 w-4" />
            Under Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-1 h-4 w-4" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-4 w-4" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (student.status) {
      case "pending":
        return "Your application is currently under review by the school administration. You can still edit your form before a final decision is made.";
      case "approved":
        return "Congratulations! Your application has been approved. Please print your admission form and submit it to the school office.";
      case "rejected":
        return "Unfortunately, your application has been rejected. Please contact the school administration for more information.";
      default:
        return "";
    }
  };

  // Students can edit their form only when status is pending (under review)
  const canEdit = student.status === "pending" && !!student.form;

  const getClassLabel = (classValue: string) => {
    const classMap: Record<string, string> = {
      class09th: "09th",
      class10th: "10th",
      class11th: "11th",
      class12th: "12th",
    };
    return classMap[classValue] || classValue;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Student Dashboard</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-ocid="dashboard.logout_button"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-semibold">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-semibold">{getClassLabel(student._class)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Application Status
              </p>
              <div className="mt-1">{getStatusBadge()}</div>
            </div>
            {admissionNumber && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Admission Number
                </p>
                <p className="font-semibold text-primary font-mono text-sm">
                  {admissionNumber}
                </p>
              </div>
            )}
          </div>

          {student.status !== "draft" && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{getStatusMessage()}</p>
              {student.status === "rejected" &&
                (() => {
                  const reason = localStorage.getItem(
                    `rejection_reason_${student.email}`,
                  );
                  return reason ? (
                    <div
                      className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md"
                      data-ocid="dashboard.rejection.panel"
                    >
                      <p className="text-sm font-semibold text-red-700">
                        Rejection Reason / अस्वीकृति का कारण:
                      </p>
                      <p className="text-sm text-red-600 mt-1">{reason}</p>
                    </div>
                  ) : null;
                })()}
            </div>
          )}

          {canEdit && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/admission-form" })}
                data-ocid="dashboard.edit_button"
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Application Form
              </Button>
            </div>
          )}

          {!student.form && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={() => navigate({ to: "/admission-form" })}
                data-ocid="dashboard.primary_button"
                className="gap-2"
              >
                Complete Admission Form
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {student.form && (
        <PrintableAdmissionForm
          student={student}
          admissionNumber={admissionNumber}
        />
      )}
    </div>
  );
}
