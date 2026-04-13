import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdmissionForm, Stream } from "../types";

interface Class11And12SubjectSelectionProps {
  formData: Partial<AdmissionForm>;
  setFormData: (data: Partial<AdmissionForm>) => void;
  disabled?: boolean;
}

const COMPULSORY_GROUP2_OPTIONS = [
  "English",
  "Hindi",
  "Urdu",
  "Maithili",
  "Sanskrit",
  "Prakrit",
  "Magahi",
  "Bhojpuri",
  "Arabic",
  "Persian",
  "Pali",
  "Bangla",
];

const STREAM_CONFIG = {
  science: {
    label: "Science Stream",
    elective: ["Physics", "Biology", "Chemistry", "Agriculture", "Mathematics"],
    additional: [
      "Physics",
      "Chemistry",
      "Biology",
      "Agriculture",
      "Mathematics",
      "Computer Science",
      "Multimedia & Web Tech.",
      "English",
      "Hindi",
      "Urdu",
      "Maithili",
      "Sanskrit",
      "Prakrit",
      "Magahi",
      "Bhojpuri",
      "Arabic",
      "Persian",
      "Pali",
      "Bangla",
    ],
  },
  arts: {
    label: "Arts Stream",
    elective: [
      "Music",
      "Home Science",
      "Philosophy",
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Sociology",
      "Economics",
      "Mathematics",
    ],
    additional: [
      "Yoga & Phy. Edu.",
      "Music",
      "Home Science",
      "Philosophy",
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Sociology",
      "Economics",
      "Mathematics",
      "Computer Science",
      "Multimedia & Web. Tech.",
      "English",
      "Hindi",
      "Urdu",
      "Maithili",
      "Sanskrit",
      "Prakrit",
      "Magahi",
      "Bhojpuri",
      "Arabic",
      "Persian",
      "Pali",
      "Bangla",
    ],
  },
  commerce: {
    label: "Commerce Stream",
    elective: [
      "Business Studies",
      "Entrepreneurship",
      "Economics",
      "Accountancy",
    ],
    additional: [
      "Business Studies",
      "Entrepreneurship",
      "Economics",
      "Accountancy",
      "Computer Science",
      "Multimedia & Web. Tech.",
      "English",
      "Hindi",
      "Urdu",
      "Maithili",
      "Sanskrit",
      "Prakrit",
    ],
  },
} as const;

export default function Class11And12SubjectSelection({
  formData,
  setFormData,
  disabled,
}: Class11And12SubjectSelectionProps) {
  const subjects = formData.subjects as any;
  const stream = subjects?.stream as Stream | undefined;
  const group1 = (subjects?.compulsoryGroup1 as string) || "";
  const group2 = (subjects?.compulsoryGroup2 as string) || "";
  const elective: string[] = subjects?.compulsory || [];
  const additional = subjects?.extraSubjects || "";

  const cfg = stream
    ? STREAM_CONFIG[stream as keyof typeof STREAM_CONFIG]
    : null;

  const updateSubjects = (patch: Record<string, unknown>) => {
    setFormData({
      ...formData,
      subjects: { ...formData.subjects!, ...patch } as any,
    });
  };

  const handleStreamChange = (value: string) => {
    setFormData({
      ...formData,
      subjects: {
        ...formData.subjects!,
        stream: value as Stream,
        compulsoryGroup1: "",
        compulsoryGroup2: "",
        compulsory: [],
        extraSubjects: "",
      } as any,
    });
  };

  const toggleElective = (subject: string) => {
    const current = elective;
    if (current.includes(subject)) {
      updateSubjects({ compulsory: current.filter((s) => s !== subject) });
    } else if (current.length < 3) {
      updateSubjects({ compulsory: [...current, subject] });
    }
  };

  return (
    <div className="space-y-5">
      {/* Stream selector */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Class 11th &amp; 12th Subject Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="stream" className="text-sm font-semibold mb-2 block">
            Select Your Stream *
          </Label>
          <Select
            value={stream || ""}
            onValueChange={handleStreamChange}
            disabled={disabled}
          >
            <SelectTrigger id="stream" data-ocid="stream.select">
              <SelectValue placeholder="-- Select Stream --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science Stream</SelectItem>
              <SelectItem value="arts">Arts Stream</SelectItem>
              <SelectItem value="commerce">Commerce Stream</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {cfg && (
        <>
          {/* Section 1 — Compulsory Group 1 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-blue-700">
                Section 1 — Compulsory Subject Group-1
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                100 Marks | Select <strong>any one</strong> subject *
              </p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={group1}
                onValueChange={(v) => {
                  // If same as group2, clear group2
                  const newG2 = group2 === v ? "" : group2;
                  updateSubjects({
                    compulsoryGroup1: v,
                    compulsoryGroup2: newG2,
                  });
                }}
                disabled={disabled}
                className="flex gap-6"
              >
                {["Hindi", "English"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={s}
                      id={`g1-${s}`}
                      data-ocid={`g1.${s.toLowerCase()}.radio`}
                    />
                    <Label htmlFor={`g1-${s}`} className="cursor-pointer">
                      {s}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Section 2 — Compulsory Group 2 */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-purple-700">
                Section 2 — Compulsory Subject Group-2
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                100 Marks | Select <strong>any one</strong> subject (not
                selected in Group-1) *
              </p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={group2}
                onValueChange={(v) => updateSubjects({ compulsoryGroup2: v })}
                disabled={disabled}
                className="grid grid-cols-3 gap-2"
              >
                {COMPULSORY_GROUP2_OPTIONS.map((s) => {
                  const isDisabled = disabled || s === group1;
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-2 rounded px-2 py-1 ${
                        s === group1 ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      <RadioGroupItem
                        value={s}
                        id={`g2-${s}`}
                        disabled={isDisabled}
                        data-ocid="g2.radio"
                      />
                      <Label
                        htmlFor={`g2-${s}`}
                        className={
                          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                        }
                      >
                        {s}
                        {s === group1 && (
                          <span className="ml-1 text-xs text-red-400">
                            (selected in Grp-1)
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Section 3 — Elective Group */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-green-700">
                    Section 3 — Elective Subject Group
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Total 300 Marks | Select <strong>any THREE</strong> subjects
                    (each 100 Marks) *
                  </p>
                </div>
                <Badge
                  variant={elective.length === 3 ? "default" : "outline"}
                  className="text-xs"
                >
                  {elective.length}/3 selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {cfg.elective.map((s) => {
                  const checked = elective.includes(s);
                  const isDisabled =
                    disabled || (!checked && elective.length >= 3);
                  return (
                    <div
                      key={s}
                      className={`flex items-center gap-2 rounded px-2 py-1.5 border ${
                        checked
                          ? "border-green-400 bg-green-50"
                          : isDisabled
                            ? "border-gray-200 opacity-40"
                            : "border-transparent hover:border-green-200"
                      }`}
                    >
                      <Checkbox
                        id={`elective-${s}`}
                        checked={checked}
                        onCheckedChange={() => toggleElective(s)}
                        disabled={isDisabled}
                        data-ocid="elective.checkbox"
                      />
                      <Label
                        htmlFor={`elective-${s}`}
                        className={
                          isDisabled && !checked
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }
                      >
                        {s}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {elective.length === 3 && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ Three subjects selected: {elective.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Section 4 — Additional Subject */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-orange-700">
                Section 4 — Additional Subject Group
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                100 Marks | Select <strong>any one</strong> subject (optional)
              </p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={additional}
                onValueChange={(v) => updateSubjects({ extraSubjects: v })}
                disabled={disabled}
                className="grid grid-cols-3 gap-2"
              >
                {cfg.additional.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 rounded px-2 py-1"
                  >
                    <RadioGroupItem
                      value={s}
                      id={`add-${s}`}
                      data-ocid="additional.radio"
                    />
                    <Label
                      htmlFor={`add-${s}`}
                      className="cursor-pointer text-sm"
                    >
                      {s}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
