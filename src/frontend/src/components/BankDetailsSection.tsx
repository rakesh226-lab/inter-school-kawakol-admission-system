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
import type { AdmissionForm, BankName } from "../types";

interface BankDetailsSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

export default function BankDetailsSection({
  formData,
  setFormData,
  disabled,
}: BankDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">
            Bank Account Holder's Name *
          </Label>
          <Input
            id="accountHolderName"
            value={formData.accountHolderName || ""}
            onChange={(e) =>
              setFormData({ ...formData, accountHolderName: e.target.value })
            }
            placeholder="Enter account holder's name"
            disabled={disabled}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
            <Input
              id="bankAccountNumber"
              value={formData.bankAccountNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, bankAccountNumber: e.target.value })
              }
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code *</Label>
            <Input
              id="ifscCode"
              value={formData.ifscCode || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ifscCode: e.target.value.toUpperCase(),
                })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Select
            value={formData.bankName}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                bankName: value as BankName,
                // Clear custom bank name when switching away from Other
                otherBankName: value === "other" ? formData.otherBankName : "",
              })
            }
            disabled={disabled}
          >
            <SelectTrigger id="bankName">
              <SelectValue placeholder="Select bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stateBankOfIndia">
                STATE BANK OF INDIA
              </SelectItem>
              <SelectItem value="punjabNationalBank">
                PUNJAB NATIONAL BANK
              </SelectItem>
              <SelectItem value="madhyaBiharGraminBank">
                MADHYA BIHAR GRAMIN BANK
              </SelectItem>
              <SelectItem value="dakshinBiharGraminBank">
                DAKSHIN BIHAR GRAMIN BANK
              </SelectItem>
              <SelectItem value="unionBankOfIndia">
                UNION BANK OF INDIA
              </SelectItem>
              <SelectItem value="indianPostPaymentBank">
                INDIAN POST PAYMENT BANK
              </SelectItem>
              <SelectItem value="finoPaymentBank">FINO PAYMENT BANK</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.bankName === "other" && (
          <div className="space-y-2">
            <Label htmlFor="otherBankName">
              Bank Name (Please specify) / बैंक का नाम (कृपया बताएं) *
            </Label>
            <Input
              id="otherBankName"
              value={formData.otherBankName || ""}
              onChange={(e) =>
                setFormData({ ...formData, otherBankName: e.target.value })
              }
              placeholder="Enter your bank name / अपने बैंक का नाम दर्ज करें"
              disabled={disabled}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
