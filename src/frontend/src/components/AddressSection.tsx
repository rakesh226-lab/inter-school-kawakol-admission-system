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
import type { AdmissionForm, State } from "../types";

interface AddressSectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

export default function AddressSection({
  formData,
  setFormData,
  disabled,
}: AddressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="village">Village *</Label>
            <Input
              id="village"
              value={formData.address?.village || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, village: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postOffice">Post Office (P.O) *</Label>
            <Input
              id="postOffice"
              value={formData.address?.postOffice || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, postOffice: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policeStation">Police Station (P.S) *</Label>
            <Input
              id="policeStation"
              value={formData.address?.policeStation || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address!,
                    policeStation: e.target.value,
                  },
                })
              }
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block">Block *</Label>
            <Input
              id="block"
              value={formData.address?.block || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, block: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="district">District *</Label>
            <Input
              id="district"
              value={formData.address?.district || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, district: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select
              value={formData.address?.state}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, state: value as State },
                })
              }
              disabled={disabled}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bihar">BIHAR</SelectItem>
                <SelectItem value="jharkhand">JHARKHAND</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pinCode">Pin Code *</Label>
            <Input
              id="pinCode"
              value={formData.address?.pinCode || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, pinCode: e.target.value },
                })
              }
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
