import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useBackendActor";
import {
  useApproveApplication,
  useDeleteApplications,
  useGetAllAdmissionNumbers,
  useGetApplicationDetail,
  useGetLightweightApplications,
  useRejectApplication,
} from "../hooks/useQueries";
import type { Student, StudentSummary } from "../types";
import { exportToExcel } from "../utils/exportToExcel";

const ADMIN_PASSWORD = "InterSchool@951";

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
  selectedEmail,
  admissionNumber,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  selectedEmail: string | null;
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

  const { data: student, isLoading: isLoadingDetail } = useGetApplicationDetail(
    open ? selectedEmail : null,
  );

  if (!open) return null;

  const form = student?.form;
  const isPending = student?.status === "pending";

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
    if (!student) return;
    await onApprove(student.email);
    onOpenChange(false);
  };

  const handleRejectClick = () => {
    setRejectionReason("");
    setShowRejectConfirm(true);
  };

  const handleConfirmReject = async () => {
    if (!student) return;
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
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  Loading application details...
                </span>
              </div>
            ) : !student ? (
              <div className="mt-6 p-4 bg-muted rounded-md text-muted-foreground text-sm text-center">
                Unable to load application details. Please try again.
              </div>
            ) : (
              <>
                {/* Registration Info */}
                <SectionTitle title="Registration Info" />
                <DetailRow label="Admission Number" value={admissionNumber} />
                <DetailRow label="Name" value={student.name} />
                <DetailRow
                  label="Class"
                  value={getClassLabel(student._class)}
                />
                <DetailRow label="Email" value={student.email} />
                <DetailRow
                  label="Registration Date"
                  value={formatDate(student.registrationDate)}
                />
                <DetailRow
                  label="Status"
                  value={student.status.toUpperCase()}
                />

                {!form ? (
                  <div className="mt-6 p-4 bg-muted rounded-md text-muted-foreground text-sm text-center">
                    No admission form submitted yet.
                  </div>
                ) : (
                  <>
                    {/* Applicant Photo */}
                    {(form.photoUrl ||
                      (typeof form.photo === "string" && form.photo)) && (
                      <div className="flex justify-center mt-3 mb-1">
                        <div className="text-center">
                          <img
                            src={
                              (typeof form.photoUrl === "string" &&
                              form.photoUrl
                                ? form.photoUrl
                                : undefined) ||
                              (typeof form.photo === "string" && form.photo
                                ? form.photo
                                : undefined) ||
                              (form.photo as unknown as { url?: string })?.url
                            }
                            alt="Applicant"
                            className="w-24 h-32 object-cover border rounded shadow-sm mx-auto"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Applicant Photo
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Personal Details */}
                    <SectionTitle title="Personal Details" />
                    <DetailRow
                      label="Student Name"
                      value={student.name || form.studentName}
                    />
                    <DetailRow
                      label="Date of Birth"
                      value={
                        form.dateOfBirth
                          ? formatDate(form.dateOfBirth)
                          : undefined
                      }
                    />
                    <DetailRow label="Gender" value={form.gender} />
                    <DetailRow label="Category" value={form.category} />
                    <DetailRow
                      label="Religion (धर्म)"
                      value={(() => {
                        const rMap: Record<string, string> = {
                          hinduism: "Hinduism",
                          islam: "Islam",
                          christianity: "Christianity",
                          buddhism: "Buddhism",
                          other: form.religionOther || "Other",
                        };
                        return (
                          (form.religion && rMap[form.religion as string]) ||
                          form.religionOther ||
                          (form.religion as string)
                        );
                      })()}
                    />
                    <DetailRow label="Caste (जाति)" value={form.caste} />
                    <DetailRow label="PEN Number" value={form.studentPen} />
                    <DetailRow label="APPAR Number" value={form.apparNumber} />
                    <DetailRow
                      label="E-Shikshakosh Number"
                      value={form.eShikshakoshNumber}
                    />
                    <DetailRow
                      label="Student Phone"
                      value={form.studentPhone}
                    />
                    <DetailRow
                      label="Student Email"
                      value={form.studentEmail}
                    />
                    <DetailRow
                      label="Aadhaar Number"
                      value={form.aadharNumber}
                    />
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
                    {(() => {
                      const ff = form as unknown as Record<
                        string,
                        string | undefined
                      >;
                      const flatOrNested = (key: string) =>
                        ff[key] ||
                        form.address?.[key as keyof typeof form.address];
                      return (
                        <>
                          <DetailRow
                            label="Village"
                            value={flatOrNested("village")}
                          />
                          <DetailRow
                            label="Police Station"
                            value={flatOrNested("policeStation")}
                          />
                          <DetailRow
                            label="Block"
                            value={flatOrNested("block")}
                          />
                          <DetailRow
                            label="Post Office"
                            value={flatOrNested("postOffice")}
                          />
                          <DetailRow
                            label="District"
                            value={flatOrNested("district")}
                          />
                          <DetailRow
                            label="State"
                            value={flatOrNested("state")}
                          />
                          <DetailRow
                            label="Pin Code"
                            value={flatOrNested("pinCode")}
                          />
                        </>
                      );
                    })()}

                    {/* Parent's Details */}
                    <SectionTitle title="Parent's Details" />
                    {(() => {
                      const SEP = "|||";
                      const parseAadhaar = (raw: string | undefined) => {
                        const s = String(raw || "");
                        if (s.includes(SEP)) {
                          const idx = s.indexOf(SEP);
                          return {
                            number: s.slice(0, idx),
                            name: s.slice(idx + SEP.length),
                          };
                        }
                        return { number: s, name: "" };
                      };
                      const ff = form as unknown as Record<
                        string,
                        string | undefined
                      >;
                      const fathersAadhaarParsed = parseAadhaar(
                        form.fathersAadhaar || ff.fatherAadhar,
                      );
                      const mothersAadhaarParsed = parseAadhaar(
                        form.mothersAadhaar || ff.motherAadhar,
                      );
                      const fathersNameAadhaar =
                        fathersAadhaarParsed.name ||
                        (form as unknown as Record<string, string>)
                          .fathersNameAsPerAadhaar ||
                        "";
                      const mothersNameAadhaar =
                        mothersAadhaarParsed.name ||
                        (form as unknown as Record<string, string>)
                          .mothersNameAsPerAadhaar ||
                        "";
                      return (
                        <>
                          <DetailRow
                            label="Father's Name"
                            value={
                              form.fathersName ||
                              (form as unknown as Record<string, string>)
                                .fatherName
                            }
                          />
                          <DetailRow
                            label="Father's Name (Aadhaar)"
                            value={fathersNameAadhaar || undefined}
                          />
                          <DetailRow
                            label="Father's Occupation"
                            value={form.fathersOccupation}
                          />
                          <DetailRow
                            label="Father's Contact"
                            value={form.fathersContact}
                          />
                          <DetailRow
                            label="Father's Aadhaar"
                            value={fathersAadhaarParsed.number || undefined}
                          />
                          <DetailRow
                            label="Mother's Name"
                            value={
                              form.mothersName ||
                              (form as unknown as Record<string, string>)
                                .motherName
                            }
                          />
                          <DetailRow
                            label="Mother's Name (Aadhaar)"
                            value={mothersNameAadhaar || undefined}
                          />
                          <DetailRow
                            label="Mother's Occupation"
                            value={form.mothersOccupation}
                          />
                          <DetailRow
                            label="Mother's / Guardian Contact Number"
                            value={
                              form.mothersGuardianContact ||
                              (form as unknown as Record<string, string>)
                                .mothersContact
                            }
                          />
                          <DetailRow
                            label="Mother's Aadhaar"
                            value={mothersAadhaarParsed.number || undefined}
                          />
                          <DetailRow
                            label="Annual Family Income"
                            value={form.annualFamilyIncome}
                          />
                        </>
                      );
                    })()}

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
                      <DetailRow
                        label="Block Name (ब्लॉक)"
                        value={form.blockName}
                      />
                    )}

                    {/* Subject Selection */}
                    <SectionTitle title="Subject Selection" />
                    {form.subjects?.stream && (
                      <DetailRow label="Stream" value={form.subjects.stream} />
                    )}
                    {form.subjects?.mil !== undefined &&
                      form.subjects?.mil !== null && (
                        <DetailRow
                          label="MIL"
                          value={
                            Array.isArray(form.subjects.mil)
                              ? form.subjects.mil.join(", ")
                              : (form.subjects.mil as string)
                          }
                        />
                      )}
                    {form.subjects?.sil !== undefined &&
                      form.subjects?.sil !== null && (
                        <DetailRow
                          label="SIL"
                          value={
                            Array.isArray(form.subjects.sil)
                              ? form.subjects.sil.join(", ")
                              : (form.subjects.sil as string)
                          }
                        />
                      )}
                    {form.subjects?.compulsoryGroup1 && (
                      <DetailRow
                        label="Compulsory Group-1"
                        value={form.subjects.compulsoryGroup1}
                      />
                    )}
                    {form.subjects?.compulsoryGroup2 && (
                      <DetailRow
                        label="Compulsory Group-2"
                        value={form.subjects.compulsoryGroup2}
                      />
                    )}
                    {(() => {
                      const electives =
                        form.subjects?.electiveSubjects ||
                        form.subjects?.compulsory;
                      const arr = Array.isArray(electives) ? electives : [];
                      return arr.length > 0 ? (
                        <DetailRow
                          label="Elective / Compulsory Subjects"
                          value={arr.join(", ")}
                        />
                      ) : null;
                    })()}
                    {(form.subjects?.additionalSubject ||
                      form.subjects?.extraSubjects ||
                      form.subjects?.extra ||
                      form.subjects?.extraSubject) && (
                      <DetailRow
                        label="Additional / Extra Subject"
                        value={
                          form.subjects.additionalSubject ||
                          form.subjects.extraSubjects ||
                          form.subjects.extraSubject ||
                          form.subjects.extra
                        }
                      />
                    )}

                    {/* Documents Checklist */}
                    <SectionTitle title="Documents Checklist / दस्तावेज़ चेकलिस्ट" />
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {(() => {
                        const ff = form as unknown as Record<string, unknown>;
                        const dc =
                          (ff.documentsChecklist as
                            | Record<string, boolean>
                            | undefined) ?? {};
                        const isGeneral = form.category === "general";
                        const isClass1012 =
                          student._class === "class10th" ||
                          student._class === "class12th";
                        const isOrphaned = !!(
                          form.orphanedAndDestitute ||
                          (ff.isOrphanedDestitute as boolean)
                        );
                        const panchayatName =
                          (ff.panchayatName as string | undefined) ||
                          form.panchayatName ||
                          "";
                        const blockNameVal =
                          (ff.blockName as string | undefined) ||
                          form.blockName ||
                          "";
                        const requireBEO =
                          (student._class === "class09th" &&
                            (panchayatName.trim().toLowerCase() !==
                              "kawakol panchayat" ||
                              blockNameVal.trim().toLowerCase() !==
                                "block kawakol") &&
                            !!(panchayatName || blockNameVal)) ||
                          !!(ff.requireBEOLetter as boolean);

                        const docs: {
                          key: string;
                          label: string;
                          hindi: string;
                          skip?: boolean;
                        }[] = [
                          {
                            key: "casteCertificate",
                            label: "Caste Certificate",
                            hindi: "जाति प्रमाण पत्र",
                            skip: isGeneral,
                          },
                          {
                            key: "incomeCertificate",
                            label: "Income Certificate",
                            hindi: "आय प्रमाण पत्र",
                            skip: isGeneral,
                          },
                          {
                            key: "residenceCertificate",
                            label: "Residence Certificate",
                            hindi: "निवास प्रमाण पत्र",
                          },
                          {
                            key: "transferCertificate",
                            label: "Transfer Certificate (Original)",
                            hindi: "स्थानांतरण प्रमाण पत्र (मूल)",
                            skip: isClass1012,
                          },
                          {
                            key: "previousMarksheets",
                            label: "Previous Class Marksheets",
                            hindi: "पिछली कक्षा की अंकसूची",
                            skip: isClass1012,
                          },
                          {
                            key: "studentAadhaarCard",
                            label: "Student Aadhaar Card Photocopy",
                            hindi: "छात्र/छात्रा आधार कार्ड फोटोकॉपी",
                          },
                          {
                            key: "mothersAadhaarCard",
                            label: "Mother's Aadhaar Card Photocopy",
                            hindi: "माता का आधार कार्ड फोटोकॉपी",
                          },
                          {
                            key: "fathersAadhaarCard",
                            label: "Father's Aadhaar Card Photocopy",
                            hindi: "पिता का आधार कार्ड फोटोकॉपी",
                          },
                          ...(isOrphaned
                            ? [
                                {
                                  key: "deathCertificate",
                                  label: "Mother & Father Death Certificate",
                                  hindi: "माता-पिता का मृत्यु प्रमाण पत्र",
                                },
                              ]
                            : []),
                          ...(requireBEO
                            ? [
                                {
                                  key: "beoCertificate",
                                  label: "BEO Approval Letter (Original)",
                                  hindi: "BEO अनुमोदन पत्र (मूल)",
                                },
                              ]
                            : []),
                        ];

                        return docs
                          .filter((d) => !d.skip)
                          .map((doc) => {
                            const checked = dc[doc.key] === true;
                            return (
                              <div
                                key={doc.key}
                                className="flex items-center gap-1.5 text-xs py-0.5"
                              >
                                <span
                                  className={
                                    checked
                                      ? "text-green-600 font-bold"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {checked ? "✓" : "☐"}
                                </span>
                                <span
                                  className={
                                    checked ? "" : "text-muted-foreground"
                                  }
                                >
                                  {doc.label}{" "}
                                  <span lang="hi">/ {doc.hindi}</span>
                                </span>
                              </div>
                            );
                          });
                      })()}
                    </div>

                    {/* Declaration */}
                    <SectionTitle title="Declaration" />
                    <DetailRow
                      label="Guardian Declaration Accepted"
                      value={form.guardianDeclaration}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {!isLoadingDetail && student && isPending && (
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

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

function getAdmissionYear(admNum: string | undefined): string | null {
  if (!admNum) return null;
  const parts = admNum.split("/");
  if (parts.length < 3) return null;
  const yearRange = parts[2];
  return yearRange.split("-")[0] || null;
}

function getAdmissionClass(
  admNum: string | undefined,
  fallbackClass: string,
): string {
  if (admNum) {
    const parts = admNum.split("/");
    if (parts.length >= 2) return parts[1];
  }
  return fallbackClass;
}

function getAdmissionSeq(admNum: string | undefined): number {
  if (!admNum) return Number.MAX_SAFE_INTEGER;
  const parts = admNum.split("/");
  const last = parts[parts.length - 1];
  const digits = last.replace(/\D/g, "");
  return digits ? Number.parseInt(digits, 10) : Number.MAX_SAFE_INTEGER;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetLightweightApplications();
  const { data: admissionNumbersMap } = useGetAllAdmissionNumbers();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const deleteMutation = useDeleteApplications();

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Feature 1: Search
  const [searchQuery, setSearchQuery] = useState("");

  // Feature 3: Checkbox selection
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Feature 4: Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    if (!isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  // Reset pagination and clear selections when filters/search/pageSize change
  const prevFilterRef = useRef("");
  const filterKey = `${statusFilter}|${yearFilter}|${classFilter}|${searchQuery}|${pageSize}`;
  if (prevFilterRef.current !== filterKey) {
    prevFilterRef.current = filterKey;
    setPageIndex(0);
    setSelectedEmails(new Set());
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast.success("Logged out successfully");
    navigate({ to: "/admin/login" });
  };

  const handleApprove = async (email: string) => {
    try {
      await approveMutation.mutateAsync(email);
      toast.success("Application approved successfully");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to approve application");
    }
  };

  const handleReject = async (email: string, reason?: string) => {
    try {
      if (reason) {
        localStorage.setItem(`rejection_reason_${email}`, reason);
      }
      await rejectMutation.mutateAsync({ email, reason: reason ?? "" });
      toast.success("Application rejected");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to reject application");
    }
  };

  const handleRejectFromRow = (email: string) => {
    const reason = window.prompt(
      "Enter rejection reason / अस्वीकृति का कारण दर्ज करें:",
    );
    if (reason === null) return;
    if (reason.trim()) {
      localStorage.setItem(`rejection_reason_${email}`, reason.trim());
    }
    handleReject(email, reason.trim() || undefined);
  };

  const handleViewDetails = (summary: StudentSummary) => {
    setSelectedEmail(summary.email);
    setDetailOpen(true);
  };

  const handleExport = async () => {
    if (!actor) {
      toast.error("Backend not connected, please try again");
      return;
    }
    setIsExporting(true);
    try {
      const exportData = (await (
        actor as unknown as Record<
          string,
          (...args: unknown[]) => Promise<Student[]>
        >
      ).getAllApplicationsForExport(ADMIN_PASSWORD)) as Student[];

      if (!exportData || exportData.length === 0) {
        toast.error("No applications to export");
        return;
      }
      exportToExcel(exportData, admissionNumbersMap);
      toast.success(
        `Excel file downloaded — ${exportData.length} record(s) exported`,
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to export applications");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info("Refreshing applications...");
  };

  // Feature 3: Delete handlers
  const handleDeleteSelected = async () => {
    try {
      await deleteMutation.mutateAsync(Array.from(selectedEmails));
      toast.success(`${selectedEmails.size} record(s) deleted successfully`);
      setSelectedEmails(new Set());
      setShowDeleteConfirm(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete records");
      setShowDeleteConfirm(false);
    }
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
      "9": "09th",
      "10": "10th",
      "11": "11th",
      "12": "12th",
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

  // Apply year+class filter (used for status summary panel)
  const yearClassFilteredApps = useMemo(
    () =>
      allApps.filter((a) => {
        const admNum = a.admissionNumber || admissionNumbersMap?.get(a.email);
        if (yearFilter !== "all") {
          const year = getAdmissionYear(admNum);
          if (year !== yearFilter) return false;
        }
        if (classFilter !== "all") {
          const cls = getAdmissionClass(admNum, a.class_);
          if (cls !== classFilter) return false;
        }
        return true;
      }),
    [allApps, yearFilter, classFilter, admissionNumbersMap],
  );

  // Feature 2: Status counts for summary panel (from year+class filtered subset)
  const filteredStatusCounts = useMemo(
    () => ({
      draft: yearClassFilteredApps.filter((a) => a.status === "draft").length,
      pending: yearClassFilteredApps.filter((a) => a.status === "pending")
        .length,
      approved: yearClassFilteredApps.filter((a) => a.status === "approved")
        .length,
      rejected: yearClassFilteredApps.filter((a) => a.status === "rejected")
        .length,
      total: yearClassFilteredApps.length,
    }),
    [yearClassFilteredApps],
  );

  const showSummaryPanel = yearFilter !== "all" || classFilter !== "all";

  // Full filter pipeline (status + year/class + search), then sort
  const filteredApps = useMemo(
    () =>
      yearClassFilteredApps
        .filter((a) => {
          if (statusFilter !== "all" && a.status !== statusFilter) return false;
          // Feature 1: Admission number search
          if (searchQuery.trim()) {
            const admNum = (
              a.admissionNumber ||
              admissionNumbersMap?.get(a.email) ||
              ""
            ).toLowerCase();
            const name = (a.studentName || "").toLowerCase();
            const q = searchQuery.trim().toLowerCase();
            if (!admNum.includes(q) && !name.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const seqA = getAdmissionSeq(
            a.admissionNumber || admissionNumbersMap?.get(a.email),
          );
          const seqB = getAdmissionSeq(
            b.admissionNumber || admissionNumbersMap?.get(b.email),
          );
          return seqA - seqB;
        }),
    [yearClassFilteredApps, statusFilter, searchQuery, admissionNumbersMap],
  );

  // Feature 4: Pagination
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize));
  const paginatedApps = filteredApps.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize,
  );
  const showingFrom = filteredApps.length === 0 ? 0 : pageIndex * pageSize + 1;
  const showingTo = Math.min((pageIndex + 1) * pageSize, filteredApps.length);

  // Feature 3: Select-all logic (scoped to current page)
  const pageEmails = paginatedApps.map((a) => a.email);
  const allPageSelected =
    pageEmails.length > 0 && pageEmails.every((e) => selectedEmails.has(e));
  const somePageSelected = pageEmails.some((e) => selectedEmails.has(e));

  const handleSelectAll = (checked: boolean) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const e of pageEmails) next.add(e);
      } else {
        for (const e of pageEmails) next.delete(e);
      }
      return next;
    });
  };

  const handleSelectRow = (email: string, checked: boolean) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (checked) next.add(email);
      else next.delete(email);
      return next;
    });
  };

  // Find the selected summary for passing admissionNumber to modal
  const selectedSummary = selectedEmail
    ? allApps.find((a) => a.email === selectedEmail)
    : null;

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
                disabled={isExporting}
                data-ocid="admin.export.button"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
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
              {(error as Error)?.message ||
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

          {/* Year, Class Filters + Status Summary Panel */}
          <div
            className="mb-4 flex flex-wrap gap-4 items-start"
            data-ocid="admin.year_class_filters"
          >
            <div className="flex flex-wrap gap-4 items-center flex-1">
              {/* Feature 1: Search input */}
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by Admission No. or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 h-9 w-64 text-sm"
                  data-ocid="admin.search_input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                    data-ocid="admin.search_clear_button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

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

            {/* Feature 2: Status summary panel */}
            {showSummaryPanel && (
              <div
                className="flex-shrink-0 border border-border rounded-lg bg-card p-3 shadow-sm"
                data-ocid="admin.status_summary_panel"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Filter Summary
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 text-xs font-semibold tabular-nums text-foreground">
                      {filteredStatusCounts.draft}
                    </span>
                    <span className="text-xs text-muted-foreground">Draft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-yellow-100 px-1.5 text-xs font-semibold tabular-nums text-yellow-700">
                      {filteredStatusCounts.pending}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-green-100 px-1.5 text-xs font-semibold tabular-nums text-green-700">
                      {filteredStatusCounts.approved}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-semibold tabular-nums text-red-700">
                      {filteredStatusCounts.rejected}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Rejected
                    </span>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold tabular-nums text-primary">
                    {filteredStatusCounts.total}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Toolbar: Delete Selected + Entries per page */}
          <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {selectedEmails.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleteMutation.isPending}
                  data-ocid="admin.delete_selected_button"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Selected ({selectedEmails.size})
                </Button>
              )}
              {selectedEmails.size > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => setSelectedEmails(new Set())}
                  data-ocid="admin.clear_selection_button"
                >
                  Clear selection
                </button>
              )}
            </div>
            {/* Feature 4: Entries per page selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm text-muted-foreground whitespace-nowrap"
              >
                Show:
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                data-ocid="admin.page_size_select"
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                entries
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table data-ocid="admin.applications.table">
              <TableHeader>
                <TableRow>
                  {/* Feature 3: Select all checkbox */}
                  <TableHead className="w-10 px-3">
                    <Checkbox
                      checked={allPageSelected}
                      onCheckedChange={(v) => handleSelectAll(!!v)}
                      aria-label="Select all on this page"
                      data-ocid="admin.select_all_checkbox"
                      className={
                        somePageSelected && !allPageSelected ? "opacity-70" : ""
                      }
                    />
                  </TableHead>
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
                {paginatedApps.length > 0 ? (
                  paginatedApps.map((summary, idx) => {
                    const isSelected = selectedEmails.has(summary.email);
                    return (
                      <TableRow
                        key={summary.email}
                        data-ocid={`admin.applications.item.${pageIndex * pageSize + idx + 1}`}
                        className={isSelected ? "bg-primary/5" : undefined}
                      >
                        {/* Feature 3: Row checkbox */}
                        <TableCell className="px-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) =>
                              handleSelectRow(summary.email, !!v)
                            }
                            aria-label={`Select ${summary.studentName}`}
                            data-ocid={`admin.applications.checkbox.${pageIndex * pageSize + idx + 1}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-primary">
                          {summary.admissionNumber ||
                            admissionNumbersMap?.get(summary.email) ||
                            "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {summary.studentName}
                        </TableCell>
                        <TableCell>{getClassLabel(summary.class_)}</TableCell>
                        <TableCell>{summary.email}</TableCell>
                        <TableCell>
                          {new Date(
                            Number(summary.registrationDate) / 1000000,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(summary.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(summary)}
                              data-ocid={`admin.applications.open_modal_button.${pageIndex * pageSize + idx + 1}`}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            {summary.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(summary.email)}
                                  disabled={approveMutation.isPending}
                                  data-ocid={`admin.applications.confirm_button.${pageIndex * pageSize + idx + 1}`}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleRejectFromRow(summary.email)
                                  }
                                  disabled={rejectMutation.isPending}
                                  data-ocid={`admin.applications.delete_button.${pageIndex * pageSize + idx + 1}`}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                      data-ocid="admin.applications.empty_state"
                    >
                      {isFetching
                        ? "Loading applications..."
                        : searchQuery
                          ? `No applications found matching "${searchQuery}".`
                          : statusFilter !== "all"
                            ? `No ${statusFilter} applications found.`
                            : "No applications found. Students must register and submit the admission form to appear here."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Feature 4: Pagination controls */}
          {filteredApps.length > 0 && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <p
                className="text-sm text-muted-foreground"
                data-ocid="admin.pagination_info"
              >
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {showingFrom}
                </span>
                {" to "}
                <span className="font-semibold text-foreground">
                  {showingTo}
                </span>
                {" of "}
                <span className="font-semibold text-foreground">
                  {filteredApps.length}
                </span>{" "}
                entr{filteredApps.length !== 1 ? "ies" : "y"}
              </p>
              <div
                className="flex items-center gap-1"
                data-ocid="admin.pagination_controls"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  data-ocid="admin.pagination_prev"
                  className="h-8 px-3"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i).map((i) => {
                  // Show first, last, current ±1, and ellipsis otherwise
                  const isFirst = i === 0;
                  const isLast = i === totalPages - 1;
                  const isCurrent = i === pageIndex;
                  const isNearCurrent = Math.abs(i - pageIndex) <= 1;
                  if (!isFirst && !isLast && !isCurrent && !isNearCurrent) {
                    if (i === 1 || i === totalPages - 2) {
                      return (
                        <span
                          key={i}
                          className="px-1 text-muted-foreground text-sm"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <Button
                      key={i}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPageIndex(i)}
                      className="h-8 w-8 p-0"
                      data-ocid={`admin.pagination_page.${i + 1}`}
                    >
                      {i + 1}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={pageIndex >= totalPages - 1}
                  data-ocid="admin.pagination_next"
                  className="h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature 3: Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md" data-ocid="admin.delete.dialog">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold">{selectedEmails.size}</span> student
            record{selectedEmails.size !== 1 ? "s" : ""}? This cannot be undone.
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleteMutation.isPending}
              data-ocid="admin.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete {selectedEmails.size} Record
              {selectedEmails.size !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ApplicationDetailModal
        selectedEmail={selectedEmail}
        admissionNumber={
          selectedSummary?.admissionNumber ||
          (selectedEmail ? admissionNumbersMap?.get(selectedEmail) : undefined)
        }
        open={detailOpen}
        onOpenChange={(val) => {
          setDetailOpen(val);
          if (!val) setSelectedEmail(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </div>
  );
}
