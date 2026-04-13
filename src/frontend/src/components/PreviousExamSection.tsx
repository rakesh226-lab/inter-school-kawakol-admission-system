import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef } from "react";
import type { AdmissionForm, PassingDivision } from "../types";

interface PreviousExamSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
  /** Show Panchayat Name & Block Name fields (Class 9 only) */
  showPanchayatBlock?: boolean;
  /** Disable Marks Obtained & Division (Class 10 & 12) */
  disableMarksAndDivision?: boolean;
}

export default function PreviousExamSection({
  formData,
  setFormData,
  disabled,
  showPanchayatBlock,
  disableMarksAndDivision,
}: PreviousExamSectionProps) {
  const formDataRef = useRef(formData);
  const setFormDataRef = useRef(setFormData);
  formDataRef.current = formData;
  setFormDataRef.current = setFormData;

  // Clear marks & division when they become disabled so stale values don't submit
  useEffect(() => {
    if (disableMarksAndDivision) {
      setFormDataRef.current({
        ...formDataRef.current,
        marksObtained: BigInt(0),
        passingDivision: "first" as PassingDivision,
      });
    }
  }, [disableMarksAndDivision]);

  const marksDisabled = disabled || disableMarksAndDivision;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Exam Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="previousExam">Previous Exam Passed *</Label>
            <Select
              value={formData.previousExam}
              onValueChange={(value) =>
                setFormData({ ...formData, previousExam: value })
              }
              disabled={disabled}
            >
              <SelectTrigger id="previousExam">
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08TH">08TH</SelectItem>
                <SelectItem value="09TH">09TH</SelectItem>
                <SelectItem value="10TH">10TH</SelectItem>
                <SelectItem value="11TH">11TH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="previousRollNo">
              Roll Number of Previous Class *
            </Label>
            <Input
              id="previousRollNo"
              value={formData.previousRollNo || ""}
              onChange={(e) =>
                setFormData({ ...formData, previousRollNo: e.target.value })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousSchool">Previous School Name *</Label>
          <Input
            id="previousSchool"
            value={formData.previousSchool || ""}
            onChange={(e) =>
              setFormData({ ...formData, previousSchool: e.target.value })
            }
            disabled={disabled}
          />
        </div>

        {/* Panchayat Name & Block Name — Class 9 only */}
        {showPanchayatBlock && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="panchayatName">
                Panchayat Name / पंचायत का नाम *
              </Label>
              <Input
                id="panchayatName"
                placeholder="Enter Panchayat Name"
                value={formData.panchayatName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, panchayatName: e.target.value })
                }
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockName">Block Name / ब्लॉक का नाम *</Label>
              <Input
                id="blockName"
                placeholder="Enter Block Name"
                value={formData.blockName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, blockName: e.target.value })
                }
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passingYear">Passing Year *</Label>
            <Select
              value={formData.passingYear?.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, passingYear: BigInt(value) })
              }
              disabled={disabled}
            >
              <SelectTrigger id="passingYear">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="marksObtained"
              className={marksDisabled ? "text-muted-foreground" : ""}
            >
              Marks Obtained
              {!disableMarksAndDivision && " *"}
              {disableMarksAndDivision && (
                <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-normal">
                  Not applicable
                </span>
              )}
            </Label>
            <Input
              id="marksObtained"
              type="number"
              value={
                marksDisabled
                  ? ""
                  : formData.marksObtained
                    ? Number(formData.marksObtained)
                    : ""
              }
              onChange={(e) =>
                !marksDisabled &&
                setFormData({
                  ...formData,
                  marksObtained: BigInt(e.target.value || 0),
                })
              }
              disabled={marksDisabled}
              placeholder={marksDisabled ? "N/A" : "Enter marks"}
              className={
                marksDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="passingDivision"
              className={marksDisabled ? "text-muted-foreground" : ""}
            >
              Division
              {!disableMarksAndDivision && " *"}
              {disableMarksAndDivision && (
                <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-normal">
                  Not applicable
                </span>
              )}
            </Label>
            <Select
              value={marksDisabled ? undefined : formData.passingDivision}
              onValueChange={(value) =>
                !marksDisabled &&
                setFormData({
                  ...formData,
                  passingDivision: value as PassingDivision,
                })
              }
              disabled={marksDisabled}
            >
              <SelectTrigger
                id="passingDivision"
                className={
                  marksDisabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : ""
                }
              >
                <SelectValue
                  placeholder={marksDisabled ? "N/A" : "Select division"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Division</SelectItem>
                <SelectItem value="second">Second Division</SelectItem>
                <SelectItem value="third">Third Division</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
