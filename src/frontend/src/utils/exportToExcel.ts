import type { Student } from "../types";

export function exportToExcel(
  applications: Student[],
  admissionNumbersMap?: Map<string, string>,
) {
  const headers = [
    "Admission No.",
    "Student Name",
    "Class",
    "Stream",
    "Email",
    "Student Phone",
    "Parent Contact",
    "Category",
    "Religion",
    "Caste",
    "Date of Birth",
    "Gender",
    "Father's Name",
    "Mother's Name",
    "Father's Name as per Aadhaar",
    "Mother's Name as per Aadhaar",
    "Father's Aadhaar",
    "Mother's Aadhaar",
    "Father's Occupation",
    "Mother's Occupation",
    "Father's Contact",
    "Mother's / Guardian Contact",
    "Village",
    "Block",
    "District",
    "State",
    "Pin Code",
    "MIL Subject",
    "SIL Subject",
    "Extra Subject",
    "Compulsory Subject Group-1",
    "Compulsory Subject Group-2",
    "Elective Subjects",
    "Additional Subject",
    "PEN Number",
    "APAAR Number",
    "E-Shikshakosh Number",
    "Bank Account Holder",
    "Bank Name",
    "Account Number",
    "IFSC Code",
    "Status",
    "Rejection Reason",
  ];

  const safe = (v: unknown): string => {
    if (v === undefined || v === null) return "";
    const s = String(v).trim();
    return s;
  };

  const getAdmNo = (student: Student): string => {
    return (
      admissionNumbersMap?.get(student.email) || student.admissionNumber || ""
    );
  };

  const getClassLabel = (c: string): string => {
    const map: Record<string, string> = {
      class09th: "09",
      class10th: "10",
      class11th: "11",
      class12th: "12",
    };
    return map[c] || c;
  };

  const getSubjectStr = (field: unknown): string => {
    if (!field) return "";
    if (Array.isArray(field)) return field.join(", ");
    return safe(field);
  };

  const rows = applications.map((student) => {
    const form = student.form;
    // Cast to loose record to handle both typed and untyped backend fields
    const f = form as unknown as Record<string, unknown>;

    // Address: flat fields first (backend canonical), then nested fallback
    const addr = (key: string): string => {
      const flat = f?.[key];
      const nested =
        form?.address?.[key as keyof NonNullable<typeof form.address>];
      return safe(flat ?? nested);
    };

    // Decode aadhaar fields — encoded as "AADHARNUMBER|||NameAsPerAadhaar"
    const SEP = "|||";
    const parseAadhaar = (raw: unknown) => {
      const s = safe(raw);
      if (s.includes(SEP)) {
        const idx = s.indexOf(SEP);
        return { number: s.slice(0, idx), name: s.slice(idx + SEP.length) };
      }
      return { number: s, name: "" };
    };
    const fathersAadhaarParsed = parseAadhaar(
      form?.fathersAadhaar ?? f?.fatherAadhar,
    );
    const mothersAadhaarParsed = parseAadhaar(
      form?.mothersAadhaar ?? f?.motherAadhar,
    );
    const fathersNameAadhaar =
      fathersAadhaarParsed.name || safe(f?.fathersNameAsPerAadhaar);
    const mothersNameAadhaar =
      mothersAadhaarParsed.name || safe(f?.mothersNameAsPerAadhaar);

    const subjects = form?.subjects;
    const sf = subjects as unknown as Record<string, unknown> | undefined;

    const milRaw = sf?.mil ?? subjects?.mil;
    const silRaw = sf?.sil ?? subjects?.sil;
    const electiveRaw = sf?.electiveSubjects ?? subjects?.electiveSubjects;

    return [
      getAdmNo(student),
      safe(student.name || f?.studentName),
      getClassLabel(student._class),
      safe(subjects?.stream),
      safe(student.email),
      safe(form?.studentPhone),
      safe(form?.mothersGuardianContact || f?.mothersContact),
      safe(form?.category),
      (() => {
        const religionMap: Record<string, string> = {
          hinduism: "Hinduism",
          islam: "Islam",
          christianity: "Christianity",
          buddhism: "Buddhism",
          other: safe(form?.religionOther) || "Other",
        };
        const r = form?.religion as string | undefined;
        return r ? religionMap[r] || safe(r) : safe(f?.religion);
      })(),
      safe(form?.caste),
      form?.dateOfBirth && Number(form.dateOfBirth) > 0
        ? new Date(Number(form.dateOfBirth) / 1000000).toLocaleDateString(
            "en-IN",
          )
        : "",
      safe(form?.gender),
      safe(form?.fathersName || f?.fatherName),
      safe(form?.mothersName || f?.motherName),
      fathersNameAadhaar,
      mothersNameAadhaar,
      fathersAadhaarParsed.number,
      mothersAadhaarParsed.number,
      safe(form?.fathersOccupation),
      safe(form?.mothersOccupation),
      safe(form?.fathersContact),
      safe(form?.mothersGuardianContact || f?.mothersContact),
      addr("village"),
      addr("block"),
      addr("district"),
      addr("state"),
      addr("pinCode"),
      getSubjectStr(milRaw),
      getSubjectStr(silRaw),
      safe(
        sf?.extraSubject ??
          subjects?.extraSubject ??
          subjects?.extra ??
          sf?.extra,
      ),
      safe(sf?.compulsoryGroup1 ?? subjects?.compulsoryGroup1),
      safe(sf?.compulsoryGroup2 ?? subjects?.compulsoryGroup2),
      Array.isArray(electiveRaw) ? electiveRaw.join(", ") : safe(electiveRaw),
      safe(
        sf?.additionalSubject ??
          subjects?.additionalSubject ??
          sf?.extraSubjects ??
          subjects?.extraSubjects,
      ),
      safe(form?.studentPen),
      safe(form?.apparNumber),
      safe(form?.eShikshakoshNumber),
      safe(form?.accountHolderName),
      (() => {
        const bankMap: Record<string, string> = {
          stateBankOfIndia: "State Bank of India",
          punjabNationalBank: "Punjab National Bank",
          madhyaBiharGraminBank: "Madhya Bihar Gramin Bank",
          dakshinBiharGraminBank: "Dakshin Bihar Gramin Bank",
          unionBankOfIndia: "Union Bank of India",
          indianPostPaymentBank: "Indian Post Payment Bank",
          finoPaymentBank: "Fino Payment Bank",
          other: safe(form?.otherBankName) || "Other",
        };
        const b = form?.bankName as string | undefined;
        return b ? bankMap[b] || safe(b) : "";
      })(),
      safe(form?.bankAccountNumber),
      safe(form?.ifscCode),
      safe(student.status),
      safe(
        student.rejectionReason ||
          f?.rejectionReason ||
          localStorage.getItem(`rejection_reason_${student.email}`) ||
          "",
      ),
    ];
  });

  // Escape CSV cell: wrap in quotes and escape internal quotes
  const escapeCell = (val: string): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `admission_applications_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
