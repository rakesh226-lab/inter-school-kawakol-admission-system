import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Download,
  Eye,
  Loader2,
  LogOut,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useApproveApplication,
  useGetAllAdmissionNumbers,
  useGetAllApplications,
  useRejectApplication,
} from "../hooks/useQueries";
import type { Student } from "../types";
import { exportToExcel } from "../utils/exportToExcel";

function DetailRow({
  label,
  value,
}: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === undefined || value === null || value === "" ? (
      <span className="text-muted-foreground italic">—</span>
    ) : typeof value === "boolean" ? (
      value ? (
        "Yes"
      ) : (
        "No"
      )
    ) : (
      String(value)
    );
  return (
    <div className="grid grid-cols-2 gap-2 py-1">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{display}</span>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 mt-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
        {title}
      </h3>
      <Separator className="mt-1" />
    </div>
  );
}

function ApplicationDetailModal({
  student,
  admissionNumber,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  student: Student | null;
  admissionNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (email: string) => Promise<void>;
  onReject: (email: string, reason: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (!student) return null;
  const form = student.form;
  const isPending = student.status === "pending";

  const getClassLabel = (c: string) => {
    const map: Record<string, string> = {
      class09th: "9th",
      class10th: "10th",
      class11th: "11th",
      class12th: "12th",
    };
    return map[c] || c;
  };

  const formatDate = (ts: bigint | number) =>
    new Date(Number(ts) / 1000000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleApprove = async () => {
    await onApprove(student.email);
    onOpenChange(false);
  };

  const handleRejectClick = () => {
    setRejectionReason("");
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error(
        "Please enter a rejection reason / कृपया अस्वीकृति का कारण दर्ज करें",
      );
      return;
    }
    localStorage.setItem(
      `rejection_reason_${student.email}`,
      rejectionReason.trim(),
    );
    await onReject(student.email, rejectionReason.trim());
    setShowRejectConfirm(false);
    setRejectionReason("");
    onOpenChange(false);
  };

  const handleCancelReject = () => {
    setShowRejectConfirm(false);
    setRejectionReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setShowRejectConfirm(false);
          setRejectionReason("");
        }
        onOpenChange(val);
      }}
    >
      <DialogContent
        className="max-w-2xl w-full p-0"
        data-ocid="admin.application.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-bold">
            Application Details
            {admissionNumber && (
              <span className="ml-2 text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                {admissionNumber}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-6">
          <div className="pb-4">
            {/* Registration Info */}
            <SectionTitle title="Registration Info" />
            <DetailRow label="Admission Number" value={admissionNumber} />
            <DetailRow label="Name" value={student.name} />
            <DetailRow label="Class" value={getClassLabel(student._class)} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow
              label="Registration Date"
              value={formatDate(student.registrationDate)}
            />
            <DetailRow label="Status" value={student.status.toUpperCase()} />

            {!form ? (
              <div className="mt-6 p-4 bg-muted rounded-md text-muted-foreground text-sm text-center">
                No admission form submitted yet.
              </div>
            ) : (
              <>
                {/* Personal Details */}
                <SectionTitle title="Personal Details" />
                <DetailRow
                  label="Date of Birth"
                  value={
                    form.dateOfBirth ? formatDate(form.dateOfBirth) : undefined
                  }
                />
                <DetailRow label="Gender" value={form.gender} />
                <DetailRow label="Category" value={form.category} />
                <DetailRow label="Religion (धर्म)" value={form.emailId} />
                <DetailRow label="Caste (जाति)" value={form.mobileNumber} />
                <DetailRow label="PEN Number" value={form.studentPen} />
                <DetailRow label="APPAR Number" value={form.apparNumber} />
                <DetailRow
                  label="E-Shikshakosh Number"
                  value={form.eShikshakoshNumber}
                />
                <DetailRow label="Student Phone" value={form.studentPhone} />
                <DetailRow label="Student Email" value={form.studentEmail} />
                <DetailRow label="Aadhaar Number" value={form.aadharNumber} />
                <DetailRow
                  label="Physically Handicapped"
                  value={form.physicallyHandicapped}
                />
                {form.physicallyHandicapped && (
                  <>
                    <DetailRow
                      label="Handicap Type"
                      value={form.handicapType}
                    />
                    <DetailRow
                      label="Handicap %"
                      value={
                        form.handicapPercentage !== undefined
                          ? Number(form.handicapPercentage)
                          : undefined
                      }
                    />
                  </>
                )}

                {/* Address */}
                <SectionTitle title="Address" />
                <DetailRow label="Village" value={form.address?.village} />
                <DetailRow
                  label="Police Station"
                  value={form.address?.policeStation}
                />
                <DetailRow label="Block" value={form.address?.block} />
                <DetailRow
                  label="Post Office"
                  value={form.address?.postOffice}
                />
                <DetailRow label="District" value={form.address?.district} />
                <DetailRow label="State" value={form.address?.state} />
                <DetailRow label="Pin Code" value={form.address?.pinCode} />

                {/* Parent's Details */}
                <SectionTitle title="Parent's Details" />
                <DetailRow
                  label="Father's Name"
                  value={form.fathersName || form.fatherName}
                />
                <DetailRow
                  label="Father's Name (Aadhaar)"
                  value={form.fathersNameAsPerAadhaar}
                />
                <DetailRow
                  label="Father's Occupation"
                  value={form.fathersOccupation}
                />
                <DetailRow
                  label="Father's Contact"
                  value={form.fathersContact}
                />
                <DetailRow label="Father's Aadhaar" value={form.fatherAadhar} />
                <DetailRow
                  label="Mother's Name"
                  value={form.mothersName || form.motherName}
                />
                <DetailRow
                  label="Mother's Name (Aadhaar)"
                  value={form.mothersNameAsPerAadhaar}
                />
                <DetailRow
                  label="Mother's Occupation"
                  value={form.mothersOccupation}
                />
                <DetailRow
                  label="Mother's / Guardian Contact Number"
                  value={form.mothersContact}
                />
                <DetailRow label="Mother's Aadhaar" value={form.motherAadhar} />
                <DetailRow
                  label="Annual Family Income"
                  value={form.annualFamilyIncome}
                />

                {/* Bank Details */}
                <SectionTitle title="Bank Details" />
                <DetailRow
                  label="Account Holder Name"
                  value={form.accountHolderName}
                />
                <DetailRow label="Bank Name" value={form.bankName} />
                <DetailRow
                  label="Account Number"
                  value={form.bankAccountNumber}
                />
                <DetailRow label="IFSC Code" value={form.ifscCode} />

                {/* Previous Exam */}
                <SectionTitle title="Previous Exam" />
                <DetailRow
                  label="Previous School"
                  value={form.previousSchool}
                />
                <DetailRow label="Exam" value={form.previousExam} />
                <DetailRow label="Roll No." value={form.previousRollNo} />
                <DetailRow
                  label="Passing Year"
                  value={
                    form.passingYear ? Number(form.passingYear) : undefined
                  }
                />
                <DetailRow label="Division" value={form.passingDivision} />
                <DetailRow
                  label="Marks Obtained"
                  value={
                    form.marksObtained && Number(form.marksObtained) > 0
                      ? Number(form.marksObtained)
                      : undefined
                  }
                />
                {form.panchayatName && (
                  <DetailRow
                    label="Panchayat Name (पंचायत)"
                    value={form.panchayatName}
                  />
                )}
                {form.blockName && (
                  <DetailRow label="Block Name (ब्लॉक)" value={form.blockName} />
                )}

                {/* Subject Selection */}
                <SectionTitle title="Subject Selection" />
                {form.subjects?.stream && (
                  <DetailRow label="Stream" value={form.subjects.stream} />
                )}
                <DetailRow label="MIL" value={form.subjects?.mil?.join(", ")} />
                <DetailRow label="SIL" value={form.subjects?.sil?.join(", ")} />
                <DetailRow
                  label="Compulsory Subjects"
                  value={form.subjects?.compulsory?.join(", ")}
                />
                <DetailRow
                  label="Extra Subjects"
                  value={form.subjects?.extraSubjects || form.subjects?.extra}
                />

                {/* Documents Checklist */}
                <SectionTitle title="Documents Checklist / दस्तावेज़ चेकलिस्ट" />
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {[
                    { label: "Caste Certificate", hindi: "जाति प्रमाण पत्र" },
                    { label: "Income Certificate", hindi: "आय प्रमाण पत्र" },
                    {
                      label: "Residence Certificate",
                      hindi: "निवास प्रमाण पत्र",
                    },
                    {
                      label: "Transfer Certificate (Original)",
                      hindi: "स्थानांतरण प्रमाण पत्र (मूल)",
                    },
                    {
                      label: "Previous Class Marksheets",
                      hindi: "पिछली कक्षा की अंकसूची",
                    },
                    {
                      label: "Student Aadhaar Card Photocopy",
                      hindi: "छात्र/छात्रा आधार कार्ड फोटोकॉपी",
                    },
                    {
                      label: "Mother's Aadhaar Card Photocopy",
                      hindi: "माता का आधार कार्ड फोटोकॉपी",
                    },
                    {
                      label: "Father's Aadhaar Card Photocopy",
                      hindi: "पिता का आधार कार्ड फोटोकॉपी",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.label}
                      className="flex items-center gap-1.5 text-xs py-0.5"
                    >
                      <span className="text-green-600 font-bold">✓</span>
                      <span>
                        {doc.label}{" "}
                        <span className="text-muted-foreground" lang="hi">
                          / {doc.hindi}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Declaration */}
                <SectionTitle title="Declaration" />
                <DetailRow
                  label="Guardian Declaration Accepted"
                  value={form.guardianDeclaration}
                />
              </>
            )}
          </div>
        </ScrollArea>

        {isPending && (
          <DialogFooter className="px-6 py-4 border-t gap-2 flex-col items-stretch">
            {showRejectConfirm ? (
              <div className="w-full space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="rejection-reason"
                    className="text-sm font-semibold text-red-700"
                  >
                    Rejection Reason / अस्वीकृति का कारण{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter reason for rejection (required) / अस्वीकृति का कारण दर्ज करें (अनिवार्य)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px] border-red-200 focus-visible:ring-red-400"
                    data-ocid="admin.application.textarea"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancelReject}
                    disabled={isRejecting}
                    data-ocid="admin.application.cancel_button"
                  >
                    Cancel / रद्द करें
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmReject}
                    disabled={isRejecting || !rejectionReason.trim()}
                    data-ocid="admin.application.confirm_button"
                  >
                    {isRejecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Confirm Reject / अस्वीकार करें
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={handleRejectClick}
                  disabled={isRejecting || isApproving}
                  data-ocid="admin.application.reject_button"
                >
                  {isRejecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject Application
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  data-ocid="admin.application.confirm_button"
                >
                  {isApproving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Approve Application
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

type StatusFilter = "all" | "draft" | "pending" | "approved" | "rejected";

const STATUS_TABS: {
  key: StatusFilter;
  label: string;
  color: string;
  activeClass: string;
}[] = [
  {
    key: "all",
    label: "All",
    color: "bg-muted text-foreground",
    activeClass: "bg-primary text-primary-foreground shadow-sm",
  },
  {
    key: "draft",
    label: "Draft",
    color: "bg-muted text-muted-foreground",
    activeClass: "bg-foreground text-background shadow-sm",
  },
  {
    key: "pending",
    label: "Pending",
    color: "bg-yellow-50 text-yellow-700",
    activeClass: "bg-yellow-500 text-white shadow-sm",
  },
  {
    key: "approved",
    label: "Approved",
    color: "bg-green-50 text-green-700",
    activeClass: "bg-green-600 text-white shadow-sm",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "bg-red-50 text-red-700",
    activeClass: "bg-destructive text-destructive-foreground shadow-sm",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllApplications();
  const { data: admissionNumbersMap } = useGetAllAdmissionNumbers();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast.success("Logged out successfully");
    navigate({ to: "/admin/login" });
  };

  const handleApprove = async (email: string) => {
    try {
      await approveMutation.mutateAsync(email);
      toast.success("Application approved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve application");
    }
  };

  const handleReject = async (email: string, reason?: string) => {
    try {
      if (reason) {
        localStorage.setItem(`rejection_reason_${email}`, reason);
      }
      await rejectMutation.mutateAsync(email);
      toast.success("Application rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application");
    }
  };

  const handleRejectFromRow = (email: string) => {
    const reason = window.prompt(
      "Enter rejection reason / अस्वीकृति का कारण दर्ज करें:",
    );
    if (reason === null) return; // User cancelled
    if (reason.trim()) {
      localStorage.setItem(`rejection_reason_${email}`, reason.trim());
    }
    handleReject(email, reason.trim() || undefined);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const handleExport = () => {
    if (applications && applications.length > 0) {
      exportToExcel(applications, admissionNumbersMap);
      toast.success("Excel file downloaded successfully");
    } else {
      toast.error("No applications to export");
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info("Refreshing applications...");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getClassLabel = (classValue: string) => {
    const classMap: Record<string, string> = {
      class09th: "09th",
      class10th: "10th",
      class11th: "11th",
      class12th: "12th",
    };
    return classMap[classValue] || classValue;
  };

  const allApps = applications ?? [];
  const statusCounts: Record<StatusFilter, number> = {
    all: allApps.length,
    draft: allApps.filter((a) => a.status === "draft").length,
    pending: allApps.filter((a) => a.status === "pending").length,
    approved: allApps.filter((a) => a.status === "approved").length,
    rejected: allApps.filter((a) => a.status === "rejected").length,
  };

  const getAdmissionYear = (admNum: string | undefined): string | null => {
    if (!admNum) return null;
    // Format: ISK/9/2026-27/-00001 — segment 2 (0-indexed) is "2026-27"
    const parts = admNum.split("/");
    if (parts.length < 3) return null;
    const yearRange = parts[2]; // e.g. "2026-27"
    const startYear = yearRange.split("-")[0];
    return startYear || null;
  };

  const getAdmissionClass = (
    admNum: string | undefined,
    fallbackClass: string,
  ): string => {
    if (admNum) {
      const parts = admNum.split("/");
      if (parts.length >= 2) {
        return parts[1]; // e.g. "9"
      }
    }
    // fallback from student._class e.g. "class09th" -> "9"
    const m = fallbackClass.match(/(\d+)/);
    return m ? String(Number.parseInt(m[1], 10)) : fallbackClass;
  };

  const getAdmissionSeq = (admNum: string | undefined): number => {
    if (!admNum) return Number.MAX_SAFE_INTEGER;
    const parts = admNum.split("/");
    const last = parts[parts.length - 1]; // e.g. "-00001"
    const digits = last.replace(/\D/g, "");
    return digits ? Number.parseInt(digits, 10) : Number.MAX_SAFE_INTEGER;
  };

  const filteredApps = allApps
    .filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      const admNum = admissionNumbersMap?.get(a.email);
      if (yearFilter !== "all") {
        const year = getAdmissionYear(admNum);
        if (year !== yearFilter) return false;
      }
      if (classFilter !== "all") {
        const cls = getAdmissionClass(admNum, a._class);
        if (cls !== classFilter) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const seqA = getAdmissionSeq(admissionNumbersMap?.get(a.email));
      const seqB = getAdmissionSeq(admissionNumbersMap?.get(b.email));
      return seqA - seqB;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Admin Dashboard - All Applications
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isFetching}
                data-ocid="admin.refresh_button"
              >
                {isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                data-ocid="admin.export.button"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                data-ocid="admin.logout.button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <div
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
              data-ocid="admin.error_state"
            >
              <strong>Error loading applications:</strong>{" "}
              {(error as any)?.message ||
                "Unknown error. Please click Refresh to try again."}
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="mb-4" data-ocid="admin.status_tabs">
            <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg w-fit">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    data-ocid={`admin.status_tab.${tab.key}`}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? tab.activeClass
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-inherit"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {statusCounts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            {statusFilter !== "all" && (
              <p
                className="mt-2 text-sm text-muted-foreground"
                data-ocid="admin.filter_count"
              >
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredApps.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {allApps.length}
                </span>{" "}
                application{allApps.length !== 1 ? "s" : ""} •{" "}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                  onClick={() => setStatusFilter("all")}
                >
                  Show all
                </button>
              </p>
            )}
          </div>

          {/* Year & Class Filters */}
          <div
            className="mb-4 flex flex-wrap gap-4 items-center"
            data-ocid="admin.year_class_filters"
          >
            <div className="flex items-center gap-2">
              <label
                htmlFor="year-filter"
                className="text-sm font-medium text-foreground whitespace-nowrap"
              >
                Year
              </label>
              <select
                id="year-filter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                data-ocid="admin.year_filter"
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="all">All Years</option>
                <option value="2026">2026 (2026-27)</option>
                <option value="2027">2027 (2027-28)</option>
                <option value="2028">2028 (2028-29)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="class-filter"
                className="text-sm font-medium text-foreground whitespace-nowrap"
              >
                Class
              </label>
              <select
                id="class-filter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                data-ocid="admin.class_filter"
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                <option value="all">All Classes</option>
                <option value="9">Class 09</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
            {(yearFilter !== "all" || classFilter !== "all") && (
              <button
                type="button"
                className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                onClick={() => {
                  setYearFilter("all");
                  setClassFilter("all");
                }}
                data-ocid="admin.clear_filters"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="rounded-md border">
            <Table data-ocid="admin.applications.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length > 0 ? (
                  filteredApps.map((student, idx) => (
                    <TableRow
                      key={student.email}
                      data-ocid={`admin.applications.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs text-primary">
                        {admissionNumbersMap?.get(student.email) || "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{getClassLabel(student._class)}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {new Date(
                          Number(student.registrationDate) / 1000000,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(student)}
                            data-ocid={`admin.applications.open_modal_button.${idx + 1}`}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          {student.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApprove(student.email)}
                                disabled={approveMutation.isPending}
                                data-ocid={`admin.applications.confirm_button.${idx + 1}`}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleRejectFromRow(student.email)
                                }
                                disabled={rejectMutation.isPending}
                                data-ocid={`admin.applications.delete_button.${idx + 1}`}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="admin.applications.empty_state"
                    >
                      {isFetching
                        ? "Loading applications..."
                        : statusFilter !== "all"
                          ? `No ${statusFilter} applications found.`
                          : "No applications found. Students must register and submit the admission form to appear here."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ApplicationDetailModal
        student={selectedStudent}
        admissionNumber={
          selectedStudent
            ? admissionNumbersMap?.get(selectedStudent.email)
            : undefined
        }
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </div>
  );
}
