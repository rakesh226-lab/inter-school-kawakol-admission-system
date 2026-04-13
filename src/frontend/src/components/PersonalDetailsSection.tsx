import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { AdmissionForm, Category, Gender } from "../types";

interface PersonalDetailsSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

const RELIGION_OPTIONS = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Other",
];

export default function PersonalDetailsSection({
  formData,
  setFormData,
  disabled,
}: PersonalDetailsSectionProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    formData.photo ? formData.photo.getDirectURL() : null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // religion stored in formData.religion; caste in formData.caste
  const religionValue = (formData.religion as string) || "";
  const casteValue = formData.caste || "";
  const isOtherReligion =
    religionValue !== "" &&
    !RELIGION_OPTIONS.slice(0, -1).includes(religionValue);
  // If religion holds a non-standard value, it means user typed custom religion
  const selectedReligionDropdown = isOtherReligion ? "Other" : religionValue;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG or PNG images only.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          console.log(`Upload progress: ${percentage}%`);
        },
      );

      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);

      setFormData({ ...formData, photo: blob });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData({ ...formData, photo: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Photo removed");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="studentPhoto">Student Photo (JPG/PNG, Max 5MB)</Label>
          <div className="flex items-start gap-4">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Student"
                  className="w-32 h-40 object-cover rounded-lg border-2 border-primary"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-32 h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                <div className="text-center p-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No photo</p>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                id="studentPhoto"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoUpload}
                disabled={disabled || isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload a passport-size photo. Accepted formats: JPG, PNG.
                Maximum size: 5MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">
              Student Name (In Capital Letters) *
            </Label>
            <Input
              id="studentName"
              value={formData.studentName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  studentName: e.target.value.toUpperCase(),
                })
              }
              placeholder="STUDENT NAME"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={
                formData.dateOfBirth
                  ? new Date(Number(formData.dateOfBirth) / 1000000)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateOfBirth: BigInt(
                    new Date(e.target.value).getTime() * 1000000,
                  ),
                })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fatherName">
              Father's Name (In Capital Letters) *
            </Label>
            <Input
              id="fatherName"
              value={formData.fatherName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fatherName: e.target.value.toUpperCase(),
                })
              }
              placeholder="FATHER NAME"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">
              Mother's Name (In Capital Letters) *
            </Label>
            <Input
              id="motherName"
              value={formData.motherName || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  motherName: e.target.value.toUpperCase(),
                })
              }
              placeholder="MOTHER NAME"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value as Gender })
              }
              disabled={disabled}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as Category })
              }
              disabled={disabled}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="ews">EWS</SelectItem>
                <SelectItem value="sc">SC</SelectItem>
                <SelectItem value="st">ST</SelectItem>
                <SelectItem value="bci">EBC</SelectItem>
                <SelectItem value="bcii">BC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Religion and Caste */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="religion">Religion (धर्म) *</Label>
            <Select
              value={selectedReligionDropdown}
              onValueChange={(value) => {
                if (value === "Other") {
                  // Clear to empty so user can type custom
                  setFormData({ ...formData, religion: "" });
                } else {
                  setFormData({
                    ...formData,
                    religion: value as import("../types").Religion,
                  });
                }
              }}
              disabled={disabled}
            >
              <SelectTrigger id="religion">
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {RELIGION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReligionDropdown === "Other" && (
              <Input
                placeholder="Please specify your religion"
                value={isOtherReligion ? religionValue : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    religion: e.target.value as import("../types").Religion,
                  })
                }
                disabled={disabled}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="caste">Caste (जाति) *</Label>
            <Input
              id="caste"
              value={casteValue}
              onChange={(e) =>
                setFormData({ ...formData, caste: e.target.value })
              }
              placeholder="Enter your caste"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Physically Handicapped *</Label>
          <RadioGroup
            value={formData.physicallyHandicapped ? "yes" : "no"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                physicallyHandicapped: value === "yes",
              })
            }
            disabled={disabled}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="handicapped-yes" />
              <Label htmlFor="handicapped-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="handicapped-no" />
              <Label htmlFor="handicapped-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.physicallyHandicapped && (
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="handicapType">Type *</Label>
              <Input
                id="handicapType"
                value={formData.handicapType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, handicapType: e.target.value })
                }
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handicapPercentage">Percentage (%) *</Label>
              <Input
                id="handicapPercentage"
                type="number"
                value={
                  formData.handicapPercentage
                    ? Number(formData.handicapPercentage)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    handicapPercentage: BigInt(e.target.value || 0),
                  })
                }
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oPercentage">O Percentage (%) *</Label>
              <Input id="oPercentage" type="number" disabled={disabled} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="aadharNumber">Student Aadhaar Number *</Label>
          <Input
            id="aadharNumber"
            value={formData.aadharNumber || ""}
            onChange={(e) =>
              setFormData({ ...formData, aadharNumber: e.target.value })
            }
            placeholder="XXXX XXXX XXXX"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualFamilyIncome">Annual Family Income *</Label>
          <Select
            value={formData.annualFamilyIncome}
            onValueChange={(value) =>
              setFormData({ ...formData, annualFamilyIncome: value })
            }
            disabled={disabled}
          >
            <SelectTrigger id="annualFamilyIncome">
              <SelectValue placeholder="Select annual family income" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Below ₹1 Lakh">Below ₹1 Lakh</SelectItem>
              <SelectItem value="₹1-3 Lakhs">₹1-3 Lakhs</SelectItem>
              <SelectItem value="₹3-5 Lakhs">₹3-5 Lakhs</SelectItem>
              <SelectItem value="₹5-10 Lakhs">₹5-10 Lakhs</SelectItem>
              <SelectItem value="Above ₹10 Lakhs">Above ₹10 Lakhs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
