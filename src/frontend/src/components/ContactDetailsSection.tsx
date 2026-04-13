import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdmissionForm } from "../types";

interface ContactDetailsSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

export default function ContactDetailsSection({
  formData,
  setFormData,
  disabled,
}: ContactDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent's Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fathersName">Father's Name *</Label>
            <Input
              id="fathersName"
              value={formData.fathersName || ""}
              onChange={(e) =>
                setFormData({ ...formData, fathersName: e.target.value })
              }
              placeholder="Father's full name"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mothersName">Mother's Name *</Label>
            <Input
              id="mothersName"
              value={formData.mothersName || ""}
              onChange={(e) =>
                setFormData({ ...formData, mothersName: e.target.value })
              }
              placeholder="Mother's full name"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fathersOccupation">Father's Occupation *</Label>
            <Input
              id="fathersOccupation"
              value={formData.fathersOccupation || ""}
              onChange={(e) =>
                setFormData({ ...formData, fathersOccupation: e.target.value })
              }
              placeholder="Father's occupation"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mothersOccupation">Mother's Occupation *</Label>
            <Input
              id="mothersOccupation"
              value={formData.mothersOccupation || ""}
              onChange={(e) =>
                setFormData({ ...formData, mothersOccupation: e.target.value })
              }
              placeholder="Mother's occupation"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fathersContact">Father's Contact *</Label>
            <Input
              id="fathersContact"
              type="tel"
              value={formData.fathersContact || ""}
              onChange={(e) =>
                setFormData({ ...formData, fathersContact: e.target.value })
              }
              placeholder="10-digit mobile number"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mothersContact">
              Mother's / Guardian Contact Number *
            </Label>
            <Input
              id="mothersContact"
              type="tel"
              value={formData.mothersContact || ""}
              onChange={(e) =>
                setFormData({ ...formData, mothersContact: e.target.value })
              }
              placeholder="10-digit mobile number"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fathersNameAsPerAadhaar">
              Father's Name as per Aadhaar *
            </Label>
            <Input
              id="fathersNameAsPerAadhaar"
              value={formData.fathersNameAsPerAadhaar || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fathersNameAsPerAadhaar: e.target.value,
                })
              }
              placeholder="Father's name as on Aadhaar card"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mothersNameAsPerAadhaar">
              Mother's Name as per Aadhaar *
            </Label>
            <Input
              id="mothersNameAsPerAadhaar"
              value={formData.mothersNameAsPerAadhaar || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mothersNameAsPerAadhaar: e.target.value,
                })
              }
              placeholder="Mother's name as on Aadhaar card"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fatherAadhar">Father's Aadhaar Card Number *</Label>
            <Input
              id="fatherAadhar"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              value={formData.fatherAadhar || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                setFormData({ ...formData, fatherAadhar: val });
              }}
              placeholder="12-digit Aadhaar number"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherAadhar">Mother's Aadhaar Card Number *</Label>
            <Input
              id="motherAadhar"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              value={formData.motherAadhar || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                setFormData({ ...formData, motherAadhar: val });
              }}
              placeholder="12-digit Aadhaar number"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
