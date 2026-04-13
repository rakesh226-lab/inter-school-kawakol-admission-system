import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import type { AdmissionForm } from "../types";

interface StudentIdentifiersSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

interface FieldErrors {
  studentPen?: string;
  apparNumber?: string;
  eShikshakoshNumber?: string;
  studentPhone?: string;
  studentEmail?: string;
}

export default function StudentIdentifiersSection({
  formData,
  setFormData,
  disabled,
}: StudentIdentifiersSectionProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  // Gate: Does the child have a Permanent Enrollment Number (PEN) & APAAR Number?
  const [hasPanAadhaar, setHasPanAadhaar] = useState<"yes" | "no" | null>(
    formData.studentPen || formData.apparNumber ? "yes" : null,
  );
  // Gate: Does the child have an E-Shikshakosh number?
  const [hasEShikshakosh, setHasEShikshakosh] = useState<"yes" | "no" | null>(
    formData.eShikshakoshNumber ? "yes" : null,
  );

  const validateField = (name: keyof FieldErrors, value: string): string => {
    switch (name) {
      case "studentPen":
        if (!value) return "Student PEN is required";
        if (value.length !== 11)
          return "Student PEN must be exactly 11 characters";
        return "";
      case "apparNumber":
        // APAAR is optional — only validate length if provided
        if (value && value.length !== 12)
          return "APAAR Number must be exactly 12 characters";
        return "";
      case "eShikshakoshNumber":
        if (!value) return "E-Shikshakosh Number is required";
        if (value.length !== 15)
          return "E-Shikshakosh Number must be exactly 15 characters";
        return "";
      case "studentPhone":
        if (!value) return "Student Phone is required";
        if (!/^\d{10}$/.test(value))
          return "Student Phone must be exactly 10 digits";
        return "";
      case "studentEmail":
        if (!value) return "Student Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email address";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name: keyof FieldErrors, value: string) => {
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    setFormData({ ...formData, [name]: value });
  };

  const handlePanAadhaarChange = (val: "yes" | "no") => {
    setHasPanAadhaar(val);
    if (val === "no") {
      // Clear PEN and APAAR fields when No is selected; set boolean to false
      setFormData({
        ...formData,
        hasPenAndApaar: false,
        studentPen: "",
        apparNumber: "",
      });
      setErrors((prev) => ({ ...prev, studentPen: "", apparNumber: "" }));
    } else {
      setFormData({ ...formData, hasPenAndApaar: true });
    }
  };

  const handleEShikshakoshChange = (val: "yes" | "no") => {
    setHasEShikshakosh(val);
    if (val === "no") {
      // Clear E-Shikshakosh field when No is selected; set boolean to false
      setFormData({
        ...formData,
        hasEShikshakosh: false,
        eShikshakoshNumber: "",
      });
      setErrors((prev) => ({ ...prev, eShikshakoshNumber: "" }));
    } else {
      setFormData({ ...formData, hasEShikshakosh: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Identifiers &amp; Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PEN/APAAR gate */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="font-semibold text-sm text-blue-900">
            Does the child have Permanent Enrollment Number (PEN) &amp; APAAR
            Number? *
            <span
              className="block text-xs font-normal text-blue-700 mt-0.5"
              lang="hi"
            >
              क्या बच्चे के पास स्थायी नामांकन संख्या (PEN) और APAAR संख्या है?
            </span>
          </Label>
          <RadioGroup
            value={hasPanAadhaar ?? ""}
            onValueChange={(v) => handlePanAadhaarChange(v as "yes" | "no")}
            disabled={disabled}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="pan-aadhaar-yes" />
              <Label
                htmlFor="pan-aadhaar-yes"
                className="cursor-pointer font-medium text-green-700"
              >
                Yes / हाँ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="pan-aadhaar-no" />
              <Label
                htmlFor="pan-aadhaar-no"
                className="cursor-pointer font-medium text-red-700"
              >
                No / नहीं
              </Label>
            </div>
          </RadioGroup>

          {hasPanAadhaar === "yes" && (
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              {/* Student PEN */}
              <div className="space-y-1">
                <Label htmlFor="studentPen">
                  Student Permanent Enrolment Number (PEN) *
                  <span className="ml-1 text-xs text-muted-foreground">
                    (exactly 11 characters)
                  </span>
                </Label>
                <Input
                  id="studentPen"
                  value={formData.studentPen || ""}
                  onChange={(e) => handleChange("studentPen", e.target.value)}
                  placeholder="11-character PEN"
                  maxLength={11}
                  disabled={disabled}
                  className={
                    errors.studentPen
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.studentPen && (
                  <p className="text-xs text-destructive">
                    {errors.studentPen}
                  </p>
                )}
              </div>

              {/* APAAR Number — Not mandatory */}
              <div className="space-y-1">
                <Label htmlFor="apparNumber">
                  APAAR Number
                  <span className="ml-1 text-xs text-muted-foreground">
                    (12 characters, optional)
                  </span>
                </Label>
                <Input
                  id="apparNumber"
                  value={formData.apparNumber || ""}
                  onChange={(e) => handleChange("apparNumber", e.target.value)}
                  placeholder="12-character APAAR Number (optional)"
                  maxLength={12}
                  disabled={disabled}
                  className={
                    errors.apparNumber
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.apparNumber && (
                  <p className="text-xs text-destructive">
                    {errors.apparNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          {hasPanAadhaar === "no" && (
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
              ⚠ PEN and APAAR Number will not be filled.
              <span className="block" lang="hi">
                PEN और APAAR नंबर भरा नहीं जाएगा।
              </span>
            </p>
          )}
        </div>

        {/* E-Shikshakosh gate */}
        <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <Label className="font-semibold text-sm text-green-900">
            Does the child have an E-Shikshakosh Number? *
            <span
              className="block text-xs font-normal text-green-700 mt-0.5"
              lang="hi"
            >
              क्या बच्चे के पास E-Shikshakosh नंबर है?
            </span>
          </Label>
          <RadioGroup
            value={hasEShikshakosh ?? ""}
            onValueChange={(v) => handleEShikshakoshChange(v as "yes" | "no")}
            disabled={disabled}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="eshiksha-yes" />
              <Label
                htmlFor="eshiksha-yes"
                className="cursor-pointer font-medium text-green-700"
              >
                Yes / हाँ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="eshiksha-no" />
              <Label
                htmlFor="eshiksha-no"
                className="cursor-pointer font-medium text-red-700"
              >
                No / नहीं
              </Label>
            </div>
          </RadioGroup>

          {hasEShikshakosh === "yes" && (
            <div className="space-y-1 mt-3">
              <Label htmlFor="eShikshakoshNumber">
                E-Shikshakosh Number *
                <span className="ml-1 text-xs text-muted-foreground">
                  (exactly 15 characters)
                </span>
              </Label>
              <Input
                id="eShikshakoshNumber"
                value={formData.eShikshakoshNumber || ""}
                onChange={(e) =>
                  handleChange("eShikshakoshNumber", e.target.value)
                }
                placeholder="15-character E-Shikshakosh Number"
                maxLength={15}
                disabled={disabled}
                className={
                  errors.eShikshakoshNumber
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.eShikshakoshNumber && (
                <p className="text-xs text-destructive">
                  {errors.eShikshakoshNumber}
                </p>
              )}
            </div>
          )}

          {hasEShikshakosh === "no" && (
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
              ⚠ E-Shikshakosh Number will not be filled.
              <span className="block" lang="hi">
                E-Shikshakosh नंबर भरा नहीं जाएगा।
              </span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Student Phone */}
          <div className="space-y-1">
            <Label htmlFor="studentPhone">
              Student Phone *
              <span className="ml-1 text-xs text-muted-foreground">
                (10 digits)
              </span>
            </Label>
            <Input
              id="studentPhone"
              type="tel"
              value={formData.studentPhone || ""}
              onChange={(e) =>
                handleChange(
                  "studentPhone",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              placeholder="10-digit phone number"
              maxLength={10}
              disabled={disabled}
              className={
                errors.studentPhone
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.studentPhone && (
              <p className="text-xs text-destructive">{errors.studentPhone}</p>
            )}
          </div>

          {/* Student Email */}
          <div className="space-y-1">
            <Label htmlFor="studentEmail">Student Email *</Label>
            <Input
              id="studentEmail"
              type="email"
              value={formData.studentEmail || ""}
              onChange={(e) => handleChange("studentEmail", e.target.value)}
              placeholder="student@example.com"
              disabled={disabled}
              className={
                errors.studentEmail
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.studentEmail && (
              <p className="text-xs text-destructive">{errors.studentEmail}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
