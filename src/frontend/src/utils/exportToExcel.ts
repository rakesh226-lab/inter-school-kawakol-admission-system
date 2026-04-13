import type { Student } from "../types";

export function exportToExcel(
  students: Student[],
  admissionNumbersMap?: Map<string, string>,
) {
  // Create CSV content
  const headers = [
    "Admission Number",
    "Student Name",
    "Class",
    "Email",
    "Registration Date",
    "Status",
    "Father Name",
    "Mother Name",
    "Date of Birth",
    "Gender",
    "Category",
    "Religion",
    "Caste",
    "Physically Handicapped",
    "Handicap Type",
    "Handicap Percentage",
    "Aadhar Number",
    "Annual Family Income",
    "Student PEN",
    "APPAR Number",
    "E-Shikshakosh Number",
    "Student Phone",
    "Student Email",
    "Father's Name",
    "Mother's Name",
    "Father's Occupation",
    "Mother's Occupation",
    "Father's Contact",
    "Mother's Contact",
    "Father's Name as per Aadhaar",
    "Mother's Name as per Aadhaar",
    "Bank Account Holder's Name",
    "Bank Account Number",
    "IFSC Code",
    "Bank Name",
    "Mobile Number",
    "Email ID",
    "Father Aadhar",
    "Mother Aadhar",
    "Previous Exam",
    "Previous Roll No",
    "Previous School",
    "Passing Year",
    "Marks Obtained",
    "Division",
    "Village",
    "Post Office",
    "Police Station",
    "Block",
    "District",
    "State",
    "Pin Code",
    "Guardian Declaration",
    "Stream",
    "M.I.L. Subjects",
    "S.I.L. Subjects",
    "Compulsory Subjects",
    "Extra Subject",
    "Extra Subjects",
  ];

  const rows = students.map((student) => {
    const form = student.form;
    return [
      admissionNumbersMap?.get(student.email) || "-",
      student.name,
      student._class,
      student.email,
      new Date(Number(student.registrationDate) / 1000000).toLocaleDateString(),
      student.status,
      form?.fatherName || "",
      form?.motherName || "",
      form?.dateOfBirth
        ? new Date(Number(form.dateOfBirth) / 1000000).toLocaleDateString()
        : "",
      form?.gender || "",
      form?.category || "",
      form?.emailId || "",
      form?.mobileNumber || "",
      form?.physicallyHandicapped ? "Yes" : "No",
      form?.handicapType || "",
      form?.handicapPercentage ? Number(form.handicapPercentage) : "",
      form?.aadharNumber || "",
      form?.annualFamilyIncome || "",
      form?.studentPen || "",
      form?.apparNumber || "",
      form?.eShikshakoshNumber || "",
      form?.studentPhone || "",
      form?.studentEmail || "",
      form?.fathersName || "",
      form?.mothersName || "",
      form?.fathersOccupation || "",
      form?.mothersOccupation || "",
      form?.fathersContact || "",
      form?.mothersContact || "",
      form?.fathersNameAsPerAadhaar || "",
      form?.mothersNameAsPerAadhaar || "",
      form?.accountHolderName || "",
      form?.bankAccountNumber || "",
      form?.ifscCode || "",
      form?.bankName || "",
      form?.mobileNumber || "",
      form?.emailId || "",
      form?.fatherAadhar || "",
      form?.motherAadhar || "",
      form?.previousExam || "",
      form?.previousRollNo || "",
      form?.previousSchool || "",
      form?.passingYear ? form.passingYear.toString() : "",
      form?.marksObtained ? form.marksObtained.toString() : "",
      form?.passingDivision || "",
      form?.address?.village || "",
      form?.address?.postOffice || "",
      form?.address?.policeStation || "",
      form?.address?.block || "",
      form?.address?.district || "",
      form?.address?.state || "",
      form?.address?.pinCode || "",
      form?.guardianDeclaration ? "Yes" : "No",
      form?.subjects?.stream || "",
      form?.subjects?.mil?.join("; ") || "",
      form?.subjects?.sil?.join("; ") || "",
      form?.subjects?.compulsory?.join("; ") || "",
      form?.subjects?.extra || "",
      form?.subjects?.extraSubjects || "",
    ];
  });

  // Convert to CSV
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
}
