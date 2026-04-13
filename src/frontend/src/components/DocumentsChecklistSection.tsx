import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DOCUMENTS = [
  {
    id: "casteCertificate",
    label: "Caste Certificate",
    hindi: "जाति प्रमाण पत्र",
    generalDisabled: true,
  },
  {
    id: "incomeCertificate",
    label: "Income Certificate",
    hindi: "आय प्रमाण पत्र",
    generalDisabled: true,
  },
  {
    id: "residenceCertificate",
    label: "Residence Certificate",
    hindi: "निवास प्रमाण पत्र",
    generalDisabled: false,
  },
  {
    id: "transferCertificate",
    label: "Transfer Certificate (Original)",
    hindi: "स्थानांतरण प्रमाण पत्र (मूल)",
    generalDisabled: false,
  },
  {
    id: "previousMarksheets",
    label: "Previous Class Marksheets",
    hindi: "पिछली कक्षा की अंकसूची",
    generalDisabled: false,
  },
  {
    id: "studentAadhaarCard",
    label: "Student Aadhaar Card Photocopy",
    hindi: "छात्र/छात्रा आधार कार्ड फोटोकॉपी",
    generalDisabled: false,
  },
  {
    id: "mothersAadhaarCard",
    label: "Mother's Aadhaar Card Photocopy",
    hindi: "माता का आधार कार्ड फोटोकॉपी",
    generalDisabled: false,
  },
  {
    id: "fathersAadhaarCard",
    label: "Father's Aadhaar Card Photocopy",
    hindi: "पिता का आधार कार्ड फोटोकॉपी",
    generalDisabled: false,
  },
];

const ORPHAN_DOCUMENT = {
  id: "deathCertificate",
  label: "Mother & Father Death Certificate",
  hindi: "माता एवं पिता का मृत्यु प्रमाण पत्र",
  generalDisabled: false,
};

const BEO_DOCUMENT = {
  id: "beoApprovalLetter",
  label: "BEO Approval Letter Required Original",
  hindi: "BEO अनुमोदन पत्र (मूल)",
  generalDisabled: false,
};

interface Props {
  checked: Record<string, boolean>;
  onChange: (id: string) => void;
  disabled?: boolean;
  isOrphanedDestitute?: boolean;
  isGeneralCategory?: boolean;
  requireBEOLetter?: boolean;
  /** Disable Previous Class Marksheets & Transfer Certificate for Class 10 & 12 */
  isClass10or12?: boolean;
}

export default function DocumentsChecklistSection({
  checked,
  onChange,
  disabled,
  isOrphanedDestitute,
  isGeneralCategory,
  requireBEOLetter,
  isClass10or12,
}: Props) {
  const CLASS10OR12_DISABLED_IDS = [
    "previousMarksheets",
    "transferCertificate",
  ];

  const allDocs = [
    ...DOCUMENTS,
    ...(isOrphanedDestitute ? [ORPHAN_DOCUMENT] : []),
    ...(requireBEOLetter ? [BEO_DOCUMENT] : []),
  ];

  // For validation: only non-disabled docs are required
  const requiredDocs = allDocs.filter((doc) => {
    if (isGeneralCategory && doc.generalDisabled) return false;
    if (isClass10or12 && CLASS10OR12_DISABLED_IDS.includes(doc.id))
      return false;
    return true;
  });
  const allChecked = requiredDocs.every((doc) => checked[doc.id]);

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Documents Checklist / दस्तावेज़ चेकलिस्ट
          <span className="text-red-500 text-sm font-semibold">
            * Mandatory / अनिवार्य
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          All documents below must be confirmed before submitting the form.
          <br />
          <span lang="hi">
            फॉर्म जमा करने से पहले नीचे दिए गए सभी दस्तावेज़ों की पुष्टि करना अनिवार्य है।
          </span>
        </p>
        {isGeneralCategory && (
          <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            ℹ️ General category students are not required to submit Caste
            Certificate and Income Certificate.
            <span className="block" lang="hi">
              सामान्य श्रेणी के छात्रों को जाति प्रमाण पत्र और आय प्रमाण पत्र जमा करना
              आवश्यक नहीं है।
            </span>
          </p>
        )}
        {isClass10or12 && (
          <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-3 py-2 rounded border border-blue-200">
            ℹ️ Class 10 &amp; 12 students are not required to submit Previous
            Class Marksheets and Transfer Certificate (Original).
            <span className="block" lang="hi">
              कक्षा 10 एवं 12 के छात्रों को पिछली कक्षा की अंकसूची और स्थानांतरण प्रमाण पत्र
              जमा करना आवश्यक नहीं है।
            </span>
          </p>
        )}
        {requireBEOLetter && (
          <p className="text-xs text-amber-700 font-medium mt-1 bg-amber-50 px-3 py-2 rounded border border-amber-200">
            ⚠ BEO Approval Letter (Original) is required because Panchayat Name
            or Block Name is not &quot;Kawakol&quot;.
            <span className="block" lang="hi">
              BEO अनुमोदन पत्र (मूल) आवश्यक है क्योंकि पंचायत/ब्लॉक का नाम
              &quot;कवाकोल&quot; नहीं है।
            </span>
          </p>
        )}
        {!allChecked && (
          <p className="text-xs text-red-500 font-medium mt-1">
            ⚠ Please confirm all required documents before final submission.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {allDocs.map((doc) => {
            const isDisabledByCategory =
              isGeneralCategory && doc.generalDisabled;
            const isDisabledByClass =
              isClass10or12 && CLASS10OR12_DISABLED_IDS.includes(doc.id);
            const isItemDisabled = isDisabledByCategory || isDisabledByClass;
            const isChecked = isItemDisabled ? false : checked[doc.id] || false;

            return (
              <div
                key={doc.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  isItemDisabled
                    ? "border-gray-200 bg-gray-50 opacity-50"
                    : isChecked
                      ? "border-green-400 bg-green-50"
                      : "border-red-200 bg-red-50/40 hover:bg-red-50/70"
                } ${doc.id === "deathCertificate" ? "sm:col-span-2 border-orange-300 bg-orange-50/40" : ""} ${doc.id === "beoApprovalLetter" ? "sm:col-span-2 border-amber-300 bg-amber-50/40" : ""}`}
              >
                <Checkbox
                  id={doc.id}
                  checked={isChecked}
                  onCheckedChange={() =>
                    !disabled && !isItemDisabled && onChange(doc.id)
                  }
                  disabled={disabled || isItemDisabled}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={doc.id}
                  className={`leading-snug ${
                    isItemDisabled
                      ? "cursor-not-allowed text-muted-foreground"
                      : "cursor-pointer"
                  }`}
                >
                  <span className="block font-medium text-sm">
                    {doc.label}
                    {!isItemDisabled && (
                      <span className="text-red-500"> *</span>
                    )}
                    {isItemDisabled && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal">
                        Not required / आवश्यक नहीं
                      </span>
                    )}
                    {doc.id === "deathCertificate" && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-normal">
                        अनाथ/निराश्रित
                      </span>
                    )}
                    {doc.id === "beoApprovalLetter" && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-normal">
                        BEO Required
                      </span>
                    )}
                  </span>
                  <span
                    className="block text-xs text-muted-foreground mt-0.5"
                    lang="hi"
                  >
                    {doc.hindi}
                  </span>
                </Label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { DOCUMENTS, ORPHAN_DOCUMENT, BEO_DOCUMENT };
