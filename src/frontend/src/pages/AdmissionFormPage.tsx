import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddressSection from "../components/AddressSection";
import BankDetailsSection from "../components/BankDetailsSection";
import Class9SubjectSelection from "../components/Class9SubjectSelection";
import Class10SubjectSelection from "../components/Class10SubjectSelection";
import Class11And12SubjectSelection from "../components/Class11And12SubjectSelection";
import ContactDetailsSection from "../components/ContactDetailsSection";
import DocumentsChecklistSection, {
  BEO_DOCUMENT,
  DOCUMENTS,
  ORPHAN_DOCUMENT,
} from "../components/DocumentsChecklistSection";
import GuardianDeclarationSection from "../components/GuardianDeclarationSection";
import PersonalDetailsSection from "../components/PersonalDetailsSection";
import PreviousExamSection from "../components/PreviousExamSection";
import StudentIdentifiersSection from "../components/StudentIdentifiersSection";
import {
  useGetCallerStudent,
  useSaveDraft,
  useSubmitForm,
} from "../hooks/useQueries";
import {
  type AdmissionForm,
  BankName,
  Category,
  Gender,
  PassingDivision,
  State,
} from "../types";
import { getCanisterErrorMessage } from "../utils/errorHandling";

export default function AdmissionFormPage() {
  const navigate = useNavigate();
  const { data: student, isLoading: studentLoading } = useGetCallerStudent();
  const saveDraftMutation = useSaveDraft();
  const submitFormMutation = useSubmitForm();

  const [formData, setFormData] = useState<Partial<AdmissionForm>>({
    studentPen: "",
    apparNumber: "",
    eShikshakoshNumber: "",
    studentPhone: "",
    studentEmail: "",
    fathersName: "",
    mothersName: "",
    fathersOccupation: "",
    mothersOccupation: "",
    fathersContact: "",
    mothersContact: "",
    fathersNameAsPerAadhaar: "",
    mothersNameAsPerAadhaar: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: BigInt(0),
    gender: Gender.male,
    category: Category.general,
    physicallyHandicapped: false,
    handicapType: undefined,
    handicapPercentage: undefined,
    aadharNumber: "",
    annualFamilyIncome: "",
    accountHolderName: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: BankName.stateBankOfIndia,
    mobileNumber: "",
    emailId: "",
    fatherAadhar: "",
    motherAadhar: "",
    previousExam: "",
    previousRollNo: "",
    previousSchool: "",
    passingYear: BigInt(2024),
    marksObtained: BigInt(0),
    passingDivision: PassingDivision.first,
    address: {
      village: "",
      postOffice: "",
      policeStation: "",
      block: "",
      district: "",
      state: State.bihar,
      pinCode: "",
    },
    guardianDeclaration: false,
    subjects: {
      mil: [],
      sil: [],
      compulsory: [],
      extra: undefined,
      stream: undefined,
      extraSubjects: undefined,
    },
  });

  const [documentsChecked, setDocumentsChecked] = useState<
    Record<string, boolean>
  >({});
  const [isOrphanedDestitute, setIsOrphanedDestitute] =
    useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (student?.form) {
      // Normalize subjects from backend shape to UI shape.
      // IDL.Opt fields are decoded as [] (None) or [value] (Some).
      // UI components expect mil/sil as string[], stream/extra/etc as string|undefined.
      const backendSubjects = student.form.subjects as unknown as {
        mil?: string | string[];
        sil?: string | string[];
        electiveSubjects?: string[];
        extraSubject?: string | string[];
        additionalSubject?: string | string[];
        stream?: string | string[];
        compulsoryGroup1?: string | string[];
        compulsoryGroup2?: string | string[];
      };

      // Helper: unwrap IDL.Opt ([value] or []) to string | undefined
      const unwrapOpt = (
        v: string | string[] | undefined,
      ): string | undefined => {
        if (Array.isArray(v)) return v.length > 0 ? v[0] : undefined;
        return v || undefined;
      };

      const normalizedSubjects = {
        mil: Array.isArray(backendSubjects?.mil)
          ? backendSubjects.mil.length > 0
            ? backendSubjects.mil
            : []
          : backendSubjects?.mil
            ? [backendSubjects.mil]
            : [],
        sil: Array.isArray(backendSubjects?.sil)
          ? backendSubjects.sil.length > 0
            ? backendSubjects.sil
            : []
          : backendSubjects?.sil
            ? [backendSubjects.sil]
            : [],
        compulsory: Array.isArray(backendSubjects?.electiveSubjects)
          ? backendSubjects.electiveSubjects
          : [],
        extra: unwrapOpt(backendSubjects?.extraSubject),
        stream: unwrapOpt(backendSubjects?.stream) as
          | import("../types").Stream
          | undefined,
        compulsoryGroup1: unwrapOpt(backendSubjects?.compulsoryGroup1),
        compulsoryGroup2: unwrapOpt(backendSubjects?.compulsoryGroup2),
        extraSubjects: unwrapOpt(backendSubjects?.additionalSubject),
      };

      const backendForm = student.form;
      const bf = backendForm as unknown as Record<string, unknown>;

      // Decode fathersAadhaar / mothersAadhaar — we encode them as
      // "AADHARNUMBER|||NameAsPerAadhaar" to work around IDL field limits.
      const SEP = "|||";
      const decodeFathersAadhaar = (raw: string) => {
        if (raw.includes(SEP)) {
          const [num, name] = raw.split(SEP);
          return { number: num, nameAsPerAadhaar: name };
        }
        return { number: raw, nameAsPerAadhaar: "" };
      };
      const decodeMothersAadhaar = (raw: string) => {
        if (raw.includes(SEP)) {
          const [num, name] = raw.split(SEP);
          return { number: num, nameAsPerAadhaar: name };
        }
        return { number: raw, nameAsPerAadhaar: "" };
      };

      const fathersAadhaarRaw = (bf.fathersAadhaar as string) || "";
      const mothersAadhaarRaw = (bf.mothersAadhaar as string) || "";
      const fathersDecoded = decodeFathersAadhaar(fathersAadhaarRaw);
      const mothersDecoded = decodeMothersAadhaar(mothersAadhaarRaw);

      // Prefer the decoded name; fall back to direct field if somehow stored separately
      const fathersNameAsPerAadhaarVal =
        (bf.fathersNameAsPerAadhaar as string) ||
        fathersDecoded.nameAsPerAadhaar;
      const mothersNameAsPerAadhaarVal =
        (bf.mothersNameAsPerAadhaar as string) ||
        mothersDecoded.nameAsPerAadhaar;

      setFormData({
        ...backendForm,
        fatherName: backendForm.fathersName || "",
        motherName: backendForm.mothersName || "",
        fathersName: backendForm.fathersName || "",
        mothersName: backendForm.mothersName || "",
        // Restore Aadhaar numbers without the encoded name suffix
        fatherAadhar: fathersDecoded.number,
        motherAadhar: mothersDecoded.number,
        fathersAadhaar: fathersDecoded.number,
        mothersAadhaar: mothersDecoded.number,
        fathersNameAsPerAadhaar: fathersNameAsPerAadhaarVal,
        mothersNameAsPerAadhaar: mothersNameAsPerAadhaarVal,
        // Restore mothersContact from mothersGuardianContact
        mothersContact: (bf.mothersGuardianContact as string) || "",
        subjects: normalizedSubjects,
      });
    }
  }, [student]);

  const isFormDisabled =
    student?.status === "approved" || student?.status === "rejected";

  const isGeneralCategory = formData.category === Category.general;
  const isClass9 = student?._class === "class09th";
  const isClass10 = student?._class === "class10th";
  const isClass12 = student?._class === "class12th";
  const isClass10or12 = isClass10 || isClass12;

  // BEO letter required for Class 9 when panchayat or block doesn't match "Kawakol Panchayat" / "Block Kawakol"
  const panchayatOk =
    formData.panchayatName?.trim().toLowerCase() === "kawakol panchayat";
  const blockOk = formData.blockName?.trim().toLowerCase() === "block kawakol";
  const requireBEOLetter = isClass9 && (!panchayatOk || !blockOk);

  const toggleDocument = (id: string) =>
    setDocumentsChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const validateForm = (): boolean => {
    // --- Personal Details ---
    if (!formData.studentName?.trim()) {
      toast.error("Student Name is required");
      return false;
    }
    if (!formData.dateOfBirth || formData.dateOfBirth === BigInt(0)) {
      toast.error("Date of Birth is required");
      return false;
    }
    if (!formData.fatherName?.trim()) {
      toast.error("Father's Name is required");
      return false;
    }
    if (!formData.motherName?.trim()) {
      toast.error("Mother's Name is required");
      return false;
    }
    if (!formData.gender) {
      toast.error("Gender is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.aadharNumber?.trim()) {
      toast.error("Student Aadhaar Number is required");
      return false;
    }
    if (!formData.religion?.toString().trim()) {
      toast.error("Religion is required");
      return false;
    }
    if (!formData.caste?.trim()) {
      toast.error("Caste is required");
      return false;
    }
    if (!formData.annualFamilyIncome?.trim()) {
      toast.error("Annual Family Income is required");
      return false;
    }

    // --- Student Identifiers & Contact ---
    // PEN, APAAR, and E-Shikshakosh are conditional (shown only if student has PAN/Aadhaar/E-Shikshakosh)
    if (formData.studentPen && formData.studentPen.length !== 11) {
      toast.error("Student PEN must be exactly 11 characters");
      return false;
    }
    // APAAR is not mandatory — only validate length if filled
    if (formData.apparNumber && formData.apparNumber.length !== 12) {
      toast.error("APAAR Number must be exactly 12 characters");
      return false;
    }
    if (
      formData.eShikshakoshNumber &&
      formData.eShikshakoshNumber.length !== 15
    ) {
      toast.error("E-Shikshakosh Number must be exactly 15 characters");
      return false;
    }
    if (!formData.studentPhone?.trim()) {
      toast.error("Student Phone is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.studentPhone)) {
      toast.error("Student Phone must be exactly 10 digits");
      return false;
    }
    if (!formData.studentEmail?.trim()) {
      toast.error("Student Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.studentEmail)) {
      toast.error("Student Email must be a valid email address");
      return false;
    }

    // --- Bank Details ---
    if (!formData.accountHolderName?.trim()) {
      toast.error("Bank Account Holder Name is required");
      return false;
    }
    if (!formData.bankAccountNumber?.trim()) {
      toast.error("Bank Account Number is required");
      return false;
    }
    if (!formData.ifscCode?.trim()) {
      toast.error("IFSC Code is required");
      return false;
    }
    if (!formData.bankName) {
      toast.error("Bank Name is required");
      return false;
    }
    if (formData.bankName === "other" && !formData.otherBankName?.trim()) {
      toast.error("Please specify your bank name");
      return false;
    }

    // --- Parent's Details ---
    if (!formData.fathersName?.trim()) {
      toast.error("Father's Name (Parent Details) is required");
      return false;
    }
    if (!formData.mothersName?.trim()) {
      toast.error("Mother's Name (Parent Details) is required");
      return false;
    }
    if (!formData.fathersOccupation?.trim()) {
      toast.error("Father's Occupation is required");
      return false;
    }
    if (!formData.mothersOccupation?.trim()) {
      toast.error("Mother's Occupation is required");
      return false;
    }
    if (!formData.fathersContact?.trim()) {
      toast.error("Father's Contact is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.fathersContact)) {
      toast.error("Father's Contact must be exactly 10 digits");
      return false;
    }
    if (!formData.mothersContact?.trim()) {
      toast.error("Mother's / Guardian Contact Number is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.mothersContact)) {
      toast.error(
        "Mother's / Guardian Contact Number must be exactly 10 digits",
      );
      return false;
    }
    if (!formData.fathersNameAsPerAadhaar?.trim()) {
      toast.error("Father's Name as per Aadhaar is required");
      return false;
    }
    if (!formData.mothersNameAsPerAadhaar?.trim()) {
      toast.error("Mother's Name as per Aadhaar is required");
      return false;
    }
    if (!formData.fatherAadhar?.trim()) {
      toast.error("Father's Aadhaar Card Number is required");
      return false;
    }
    if (!formData.motherAadhar?.trim()) {
      toast.error("Mother's Aadhaar Card Number is required");
      return false;
    }

    // --- Previous Exam ---
    if (!formData.previousExam?.trim()) {
      toast.error("Previous Exam Passed is required");
      return false;
    }
    if (!formData.previousRollNo?.trim()) {
      toast.error("Roll Number of Previous Class is required");
      return false;
    }
    if (!formData.previousSchool?.trim()) {
      toast.error("Previous School Name is required");
      return false;
    }
    if (!formData.passingYear || formData.passingYear === BigInt(0)) {
      toast.error("Passing Year is required");
      return false;
    }
    // Marks Obtained and Division are not required for Class 10 & 12
    if (!isClass10or12) {
      if (!formData.marksObtained || formData.marksObtained === BigInt(0)) {
        toast.error("Marks Obtained is required");
        return false;
      }
      if (!formData.passingDivision) {
        toast.error("Division is required");
        return false;
      }
    }
    // Panchayat Name & Block Name required for Class 9
    if (isClass9) {
      if (!formData.panchayatName?.trim()) {
        toast.error("Panchayat Name is required for Class 9");
        return false;
      }
      if (!formData.blockName?.trim()) {
        toast.error("Block Name is required for Class 9");
        return false;
      }
    }

    // --- Address ---
    if (!formData.address?.village?.trim()) {
      toast.error("Village is required");
      return false;
    }
    if (!formData.address?.postOffice?.trim()) {
      toast.error("Post Office is required");
      return false;
    }
    if (!formData.address?.policeStation?.trim()) {
      toast.error("Police Station is required");
      return false;
    }
    if (!formData.address?.block?.trim()) {
      toast.error("Block is required");
      return false;
    }
    if (!formData.address?.district?.trim()) {
      toast.error("District is required");
      return false;
    }
    if (!formData.address?.state) {
      toast.error("State is required");
      return false;
    }
    if (!formData.address?.pinCode?.trim()) {
      toast.error("Pin Code is required");
      return false;
    }

    // --- Subject Selection ---
    if (student?._class === "class09th" || student?._class === "class10th") {
      if (!formData.subjects?.mil?.length) {
        toast.error("M.I.L. Subject selection is required");
        return false;
      }
      if (!formData.subjects?.sil?.length) {
        toast.error("S.I.L. Subject selection is required");
        return false;
      }
      if (!formData.subjects?.compulsory?.length) {
        toast.error("Please select at least one Compulsory Subject");
        return false;
      }
    }

    if (student?._class === "class11th" || student?._class === "class12th") {
      if (!formData.subjects?.stream) {
        toast.error("Stream selection is required for Class 11/12");
        return false;
      }
      if (!formData.subjects?.compulsory?.length) {
        toast.error("Please select at least one stream subject");
        return false;
      }
    }

    // --- Documents Checklist (all mandatory except general-disabled and class10or12-disabled) ---
    const CLASS10OR12_DISABLED_IDS = [
      "previousMarksheets",
      "transferCertificate",
    ];
    const allDocsList = [
      ...DOCUMENTS,
      ...(isOrphanedDestitute ? [ORPHAN_DOCUMENT] : []),
      ...(requireBEOLetter ? [BEO_DOCUMENT] : []),
    ];
    const requiredDocs = allDocsList.filter((doc) => {
      if (isGeneralCategory && doc.generalDisabled) return false;
      if (isClass10or12 && CLASS10OR12_DISABLED_IDS.includes(doc.id))
        return false;
      return true;
    });
    const uncheckedDoc = requiredDocs.find((doc) => !documentsChecked[doc.id]);
    if (uncheckedDoc) {
      toast.error(
        `Documents Checklist: Please confirm "${uncheckedDoc.label}" is available`,
      );
      return false;
    }

    // --- Declaration ---
    if (!formData.guardianDeclaration) {
      toast.error("Guardian declaration must be accepted");
      return false;
    }

    return true;
  };

  // unwrapOptStr: converts any stored shape to a plain string | undefined.
  // Handles: undefined/null, plain string, IDL opt [] → undefined, ["val"] → "val",
  // double-wrapped [["val"]] → "val" (stale backend round-trip).
  // NOTE: The backend.ts generated layer (to_candid_SubjectSelection) expects SubjectSelection
  // with plain optional strings (mil?: string, stream?: Stream) and handles Candid opt-encoding
  // itself — so we must NOT manually wrap into [] | [string] for subject fields.
  const unwrapOptStr = (v: unknown): string | undefined => {
    if (v === undefined || v === null) return undefined;
    if (Array.isArray(v)) {
      if (v.length === 0) return undefined;
      const inner = v[0];
      if (Array.isArray(inner)) {
        return inner.length > 0 && inner[0]
          ? String(inner[0]).trim() || undefined
          : undefined;
      }
      return inner && String(inner).trim() ? String(inner).trim() : undefined;
    }
    const s = String(v).trim();
    return s || undefined;
  };

  const buildBackendSubjects = (s: typeof formData.subjects) => {
    // Returns a SubjectSelection-compatible object with plain optional strings.
    // The backend.ts generated to_candid_SubjectSelection_n40 will Candid-encode them.
    // mil, sil, compulsoryGroup1/2, extraSubject, additionalSubject: string | undefined
    // stream: Stream | undefined (plain string like "science", NOT {science:null})
    // electiveSubjects: string[] (flat array of plain strings)
    const mil = unwrapOptStr(s?.mil);
    const sil = unwrapOptStr(s?.sil);
    const extraSubject = unwrapOptStr(s?.extra ?? s?.extraSubject);
    const compulsoryGroup1 = unwrapOptStr(s?.compulsoryGroup1);
    const compulsoryGroup2 = unwrapOptStr(s?.compulsoryGroup2);
    const additionalSubject = unwrapOptStr(
      s?.extraSubjects ?? s?.additionalSubject,
    );
    const stream = unwrapOptStr(s?.stream) as
      | import("../types").Stream
      | undefined;

    const electiveSubjects = (
      Array.isArray(s?.compulsory)
        ? s.compulsory
        : Array.isArray(s?.electiveSubjects)
          ? s.electiveSubjects
          : []
    )
      .flat()
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .map((v) => v.trim());

    return {
      mil,
      sil,
      extraSubject,
      stream,
      compulsoryGroup1,
      compulsoryGroup2,
      electiveSubjects,
      additionalSubject,
    };
  };

  const handleSaveDraft = async () => {
    setActionError(null);
    if (!student?.email) {
      toast.error("Student email not found");
      return;
    }

    const addr = formData.address;
    const draftSubjects = buildBackendSubjects(formData.subjects);
    const draftForm = {
      // All text fields guaranteed non-undefined
      bankAccountNumber: formData.bankAccountNumber || "",
      studentEmail: formData.studentEmail || "",
      eShikshakoshNumber: formData.eShikshakoshNumber || "",
      caste: formData.caste || "",
      apparNumber: formData.apparNumber || "",
      accountHolderName: formData.accountHolderName || "",
      studentPhone: formData.studentPhone || "",
      religionOther: formData.religionOther || "",
      studentPen: formData.studentPen || "",
      mothersOccupation: formData.mothersOccupation || "",
      policeStation: addr?.policeStation ?? formData.policeStation ?? "",
      fathersNameAsPerAadhaar: formData.fathersNameAsPerAadhaar || "",
      mothersNameAsPerAadhaar: formData.mothersNameAsPerAadhaar || "",
      fathersName: formData.fathersName || formData.fatherName || "",
      district: addr?.district ?? formData.district ?? "",
      mothersName: formData.mothersName || formData.motherName || "",
      fathersContact: formData.fathersContact || "",
      aadharNumber: formData.aadharNumber || "",
      village: addr?.village ?? formData.village ?? "",
      pinCode: addr?.pinCode ?? formData.pinCode ?? "",
      previousRollNo: formData.previousRollNo || "",
      block: addr?.block ?? formData.block ?? "",
      postOffice: addr?.postOffice ?? formData.postOffice ?? "",
      mothersGuardianContact:
        formData.mothersContact || formData.mothersGuardianContact || "",
      fathersAadhaar: formData.fatherAadhar || formData.fathersAadhaar || "",
      mothersAadhaar: formData.motherAadhar || formData.mothersAadhaar || "",
      annualFamilyIncome: formData.annualFamilyIncome || "",
      fathersOccupation: formData.fathersOccupation || "",
      previousExam: formData.previousExam || "",
      previousSchool: formData.previousSchool || "",
      ifscCode: formData.ifscCode || "",
      // Bool fields
      orphanedAndDestitute: isOrphanedDestitute === true,
      hasEShikshakosh: formData.hasEShikshakosh === true,
      physicallyHandicapped: formData.physicallyHandicapped === true,
      guardianDeclaration: formData.guardianDeclaration === true,
      hasPenAndApaar: formData.hasPenAndApaar === true,
      // Nat fields
      marksObtained: formData.marksObtained ?? BigInt(0),
      passingYear: formData.passingYear ?? BigInt(2024),
      dateOfBirth: formData.dateOfBirth ?? BigInt(0),
      // Variant fields
      gender: formData.gender ?? "male",
      category: formData.category ?? "general",
      state: (addr?.state ??
        formData.state ??
        "bihar") as AdmissionForm["state"],
      bankName: formData.bankName ?? "stateBankOfIndia",
      passingDivision: formData.passingDivision ?? "first",
      religion: formData.religion ?? "hinduism",
      // Opt fields — pass plain values; backend.ts encoder handles Candid opt-wrapping
      photoUrl: formData.photoUrl || undefined,
      handicapType: formData.physicallyHandicapped
        ? formData.handicapType || undefined
        : undefined,
      handicapPercentage:
        formData.physicallyHandicapped && formData.handicapPercentage != null
          ? typeof formData.handicapPercentage === "bigint"
            ? formData.handicapPercentage
            : BigInt(Number(formData.handicapPercentage))
          : undefined,
      // Subjects
      subjects: draftSubjects,
      // Documents checklist — all booleans
      documentsChecklist: {
        casteCertificate: !!formData.documentsChecklist?.casteCertificate,
        incomeCertificate: !!formData.documentsChecklist?.incomeCertificate,
        residenceCertificate:
          !!formData.documentsChecklist?.residenceCertificate,
        transferCertificate: !!formData.documentsChecklist?.transferCertificate,
        previousMarksheets: !!formData.documentsChecklist?.previousMarksheets,
        studentAadhaarCard: !!formData.documentsChecklist?.studentAadhaarCard,
        mothersAadhaarCard: !!formData.documentsChecklist?.mothersAadhaarCard,
        fathersAadhaarCard: !!formData.documentsChecklist?.fathersAadhaarCard,
        deathCertificate: !!formData.documentsChecklist?.deathCertificate,
      },
    } as unknown as AdmissionForm;

    try {
      await saveDraftMutation.mutateAsync({
        email: student.email,
        form: draftForm,
      });
      toast.success("Draft saved successfully");
    } catch (error: unknown) {
      const friendlyMessage = getCanisterErrorMessage(error);
      setActionError(friendlyMessage);
    }
  };

  const handleFinalSubmit = async () => {
    setActionError(null);
    if (!validateForm()) return;

    if (!student?.email) {
      toast.error("Student email not found");
      return;
    }

    // Resolve religion value: map display string to Religion enum value
    const rawReligion = (formData.religion as string) || "";
    const religionMap: Record<string, string> = {
      Christianity: "christianity",
      Islam: "islam",
      Hinduism: "hinduism",
      Buddhism: "buddhism",
      Other: "other",
      christianity: "christianity",
      islam: "islam",
      hinduism: "hinduism",
      buddhism: "buddhism",
      other: "other",
    };
    const resolvedReligion = religionMap[rawReligion] ?? "other";
    // If user typed a custom religion (not one of the enum values), store it in religionOther
    const isStandardReligion = [
      "Christianity",
      "Islam",
      "Hinduism",
      "Buddhism",
      "Other",
      "christianity",
      "islam",
      "hinduism",
      "buddhism",
      "other",
    ].includes(rawReligion);
    const religionOther = isStandardReligion ? "" : rawReligion;

    // Build documentsChecklist with correct backend field names, all guaranteed boolean
    const checklist = {
      casteCertificate: !!documentsChecked.casteCertificate,
      incomeCertificate: !!documentsChecked.incomeCertificate,
      residenceCertificate: !!documentsChecked.residenceCertificate,
      transferCertificate: !!documentsChecked.transferCertificate,
      previousMarksheets: !!documentsChecked.previousMarksheets,
      studentAadhaarCard: !!(
        documentsChecked.studentAadhaarCard || documentsChecked.studentAadhaar
      ),
      mothersAadhaarCard: !!(
        documentsChecked.mothersAadhaarCard || documentsChecked.motherAadhaar
      ),
      fathersAadhaarCard: !!(
        documentsChecked.fathersAadhaarCard || documentsChecked.fatherAadhaar
      ),
      deathCertificate: !!documentsChecked.deathCertificate,
    };

    // Flatten address for backend (backend expects flat fields, not nested address object)
    const addr = formData.address;

    // Build the complete backend-compatible AdmissionForm payload
    // All boolean fields must be true/false, never undefined
    const submissionForm = {
      // Personal
      studentName: formData.studentName ?? "",
      fatherName: formData.fatherName ?? formData.fathersName ?? "",
      motherName: formData.motherName ?? formData.mothersName ?? "",
      dateOfBirth: formData.dateOfBirth ?? BigInt(0),
      gender: formData.gender ?? "male",
      category: formData.category ?? "general",
      physicallyHandicapped: formData.physicallyHandicapped === true,
      // handicapType: opt text — pass plain string | undefined; backend.ts handles Candid encoding
      handicapType: formData.physicallyHandicapped
        ? formData.handicapType || undefined
        : undefined,
      // handicapPercentage: opt nat — pass plain bigint | undefined; backend.ts handles Candid encoding
      handicapPercentage:
        formData.physicallyHandicapped && formData.handicapPercentage != null
          ? typeof formData.handicapPercentage === "bigint"
            ? formData.handicapPercentage
            : BigInt(Number(formData.handicapPercentage))
          : undefined,
      aadharNumber: formData.aadharNumber ?? "",
      annualFamilyIncome: formData.annualFamilyIncome ?? "",
      religion: resolvedReligion as AdmissionForm["religion"],
      caste: formData.caste ?? "",
      religionOther: religionOther,

      // Student Identifiers
      studentPen: formData.studentPen ?? "",
      apparNumber: formData.apparNumber ?? "",
      eShikshakoshNumber: formData.eShikshakoshNumber ?? "",
      studentPhone: formData.studentPhone ?? "",
      studentEmail: formData.studentEmail ?? "",
      hasPenAndApaar: formData.hasPenAndApaar === true,
      hasEShikshakosh: formData.hasEShikshakosh === true,

      // Parent Details — ensure BOTH fathersName and mothersName are populated
      // fathersName/mothersName come from ContactDetailsSection (Parent's Details)
      // fatherName/motherName come from PersonalDetailsSection (Personal Details)
      // Sync both directions so backend always has data regardless of which was filled
      fathersName: formData.fathersName ?? formData.fatherName ?? "",
      mothersName: formData.mothersName ?? formData.motherName ?? "",
      fathersOccupation: formData.fathersOccupation ?? "",
      mothersOccupation: formData.mothersOccupation ?? "",
      fathersContact: formData.fathersContact ?? "",
      mothersContact: formData.mothersContact ?? "",
      mothersGuardianContact:
        formData.mothersContact ?? formData.mothersGuardianContact ?? "",
      // Send Aadhaar names as their own direct text fields (IDL requires them separately)
      fathersNameAsPerAadhaar: formData.fathersNameAsPerAadhaar || "",
      mothersNameAsPerAadhaar: formData.mothersNameAsPerAadhaar || "",
      // Send clean Aadhaar numbers without any encoding
      fathersAadhaar: formData.fatherAadhar || formData.fathersAadhaar || "",
      mothersAadhaar: formData.motherAadhar || formData.mothersAadhaar || "",

      // Bank
      accountHolderName: formData.accountHolderName ?? "",
      bankAccountNumber: formData.bankAccountNumber ?? "",
      ifscCode: formData.ifscCode ?? "",
      bankName: formData.bankName ?? "stateBankOfIndia",
      otherBankName: formData.otherBankName ?? "",

      // Previous Exam
      previousExam: formData.previousExam ?? "",
      previousRollNo: formData.previousRollNo ?? "",
      previousSchool: formData.previousSchool ?? "",
      passingYear: formData.passingYear ?? BigInt(2024),
      marksObtained: formData.marksObtained ?? BigInt(0),
      passingDivision: formData.passingDivision ?? "first",
      panchayatName: formData.panchayatName ?? "",
      blockName: formData.blockName ?? "",

      // Address — flat fields for backend, also keep nested for form
      village: addr?.village ?? formData.village ?? "",
      postOffice: addr?.postOffice ?? formData.postOffice ?? "",
      policeStation: addr?.policeStation ?? formData.policeStation ?? "",
      block: addr?.block ?? formData.block ?? "",
      district: addr?.district ?? formData.district ?? "",
      state: (addr?.state ??
        formData.state ??
        "bihar") as AdmissionForm["state"],
      pinCode: addr?.pinCode ?? formData.pinCode ?? "",
      address: formData.address,

      // Subjects — map frontend UI field names to backend Candid field names.
      subjects: buildBackendSubjects(formData.subjects),

      // Orphaned
      orphanedAndDestitute: isOrphanedDestitute === true,

      // Documents Checklist — all boolean, never undefined
      documentsChecklist: checklist,

      // Declaration
      guardianDeclaration: formData.guardianDeclaration === true,

      // Photo — opt text: pass plain string | undefined; backend.ts handles Candid encoding
      photoUrl: formData.photoUrl || undefined,
    } as unknown as AdmissionForm;

    try {
      await submitFormMutation.mutateAsync({
        email: student.email,
        form: submissionForm,
      });
      toast.success("Application submitted successfully!");
      navigate({ to: "/dashboard" });
    } catch (error: unknown) {
      const friendlyMessage = getCanisterErrorMessage(error);
      setActionError(friendlyMessage);
    }
  };

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Admission Application Form - Step 2
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Complete all sections below to submit your admission application
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <PersonalDetailsSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />
        <StudentIdentifiersSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />
        <BankDetailsSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />
        <ContactDetailsSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />
        <PreviousExamSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
          showPanchayatBlock={isClass9}
          disableMarksAndDivision={isClass10or12}
        />
        <AddressSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />

        {student._class === "class09th" && (
          <Class9SubjectSelection
            formData={formData}
            setFormData={setFormData}
            disabled={isFormDisabled}
          />
        )}
        {student._class === "class10th" && (
          <Class10SubjectSelection
            formData={formData}
            setFormData={setFormData}
            disabled={isFormDisabled}
          />
        )}
        {(student._class === "class11th" || student._class === "class12th") && (
          <Class11And12SubjectSelection
            formData={formData}
            setFormData={setFormData}
            disabled={isFormDisabled}
          />
        )}

        {/* Orphaned and Destitute */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Orphaned and Destitute / अनाथ एवं निराश्रित
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground" lang="hi">
                क्या छात्र/छात्रा अनाथ एवं निराश्रित है? / Is the student orphaned and
                destitute?
              </p>
              <RadioGroup
                value={isOrphanedDestitute ? "yes" : "no"}
                onValueChange={(val) => {
                  const isYes = val === "yes";
                  setIsOrphanedDestitute(isYes);
                  if (!isYes) {
                    setDocumentsChecked((prev) => {
                      const updated = { ...prev };
                      updated.deathCertificate = false;
                      return updated;
                    });
                  }
                }}
                disabled={isFormDisabled}
                className="flex gap-6 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="orphan-yes" />
                  <Label
                    htmlFor="orphan-yes"
                    className="cursor-pointer font-medium text-green-700"
                  >
                    Yes / हाँ
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="orphan-no" />
                  <Label
                    htmlFor="orphan-no"
                    className="cursor-pointer font-medium text-red-700"
                  >
                    No / नहीं
                  </Label>
                </div>
              </RadioGroup>
              {isOrphanedDestitute && (
                <p className="text-sm text-orange-600 font-medium mt-1">
                  ⚠ Mother &amp; Father Death Certificate is required in the
                  Documents Checklist below.
                  <span className="block text-xs" lang="hi">
                    माता एवं पिता का मृत्यु प्रमाण पत्र दस्तावेज़ चेकलिस्ट में आवश्यक है।
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <DocumentsChecklistSection
          checked={documentsChecked}
          onChange={toggleDocument}
          disabled={isFormDisabled}
          isOrphanedDestitute={isOrphanedDestitute}
          isGeneralCategory={isGeneralCategory}
          requireBEOLetter={requireBEOLetter}
          isClass10or12={isClass10or12}
        />

        <GuardianDeclarationSection
          formData={formData}
          setFormData={setFormData}
          disabled={isFormDisabled}
        />

        {!isFormDisabled && (
          <Card>
            <CardContent className="pt-6">
              {actionError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={
                    saveDraftMutation.isPending || submitFormMutation.isPending
                  }
                >
                  {saveDraftMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={
                    submitFormMutation.isPending || saveDraftMutation.isPending
                  }
                >
                  {submitFormMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Final Submit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
