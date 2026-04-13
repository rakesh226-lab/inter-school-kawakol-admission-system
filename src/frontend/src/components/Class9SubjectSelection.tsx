import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AdmissionForm } from "../types";

interface Class9SubjectSelectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

export default function Class9SubjectSelection({
  formData,
  setFormData,
  disabled,
}: Class9SubjectSelectionProps) {
  const milSubjects = ["Hindi", "Urdu", "Bangla", "Maithili"];
  const silSubjects = ["Sanskrit", "HIN(NLH)", "Arabic", "Persian", "Bhojpuri"];
  const compulsorySubjects = ["Math", "Science", "Social Science", "English"];
  const extraSubjects = [
    "Mathematics",
    "Maithili",
    "Sanskrit",
    "Persian",
    "Music",
    "Home Science",
    "Economics",
    "Arabic",
    "Fine Arts",
    "Commerce",
    "Dance",
  ];

  const toggleSubject = (category: "compulsory", subject: string) => {
    const currentSubjects = formData.subjects?.[category] || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];

    setFormData({
      ...formData,
      subjects: {
        ...formData.subjects!,
        [category]: newSubjects,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class 9th Subject Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* M.I.L. - Single Select */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            M.I.L. Subject (Select One) *
          </Label>
          <RadioGroup
            value={formData.subjects?.mil?.[0] || ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                subjects: { ...formData.subjects!, mil: [value] },
              })
            }
            disabled={disabled}
          >
            <div className="grid grid-cols-2 gap-3">
              {milSubjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={subject}
                    id={`mil-${subject}`}
                    data-ocid={"class9.mil.radio"}
                  />
                  <Label htmlFor={`mil-${subject}`}>{subject}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* S.I.L. - Single Select */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            S.I.L. Subject (Select One) *
          </Label>
          <RadioGroup
            value={formData.subjects?.sil?.[0] || ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                subjects: { ...formData.subjects!, sil: [value] },
              })
            }
            disabled={disabled}
          >
            <div className="grid grid-cols-2 gap-3">
              {silSubjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={subject}
                    id={`sil-${subject}`}
                    data-ocid={"class9.sil.radio"}
                  />
                  <Label htmlFor={`sil-${subject}`}>{subject}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Compulsory - Multi Select */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Compulsory Subject's (Select Multiple) *
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {compulsorySubjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={`comp-${subject}`}
                  checked={
                    formData.subjects?.compulsory?.includes(subject) || false
                  }
                  onCheckedChange={() => toggleSubject("compulsory", subject)}
                  disabled={disabled}
                  data-ocid={"class9.compulsory.checkbox"}
                />
                <Label htmlFor={`comp-${subject}`}>{subject}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Subject - Optional Single Select */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Extra Subject (Select One - Optional)
          </Label>
          <RadioGroup
            value={formData.subjects?.extra || ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                subjects: { ...formData.subjects!, extra: value },
              })
            }
            disabled={disabled}
          >
            <div className="grid grid-cols-2 gap-3">
              {extraSubjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={subject}
                    id={`extra-${subject}`}
                    data-ocid={"class9.extra.radio"}
                  />
                  <Label htmlFor={`extra-${subject}`}>{subject}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
