// Frontend type definitions for Inter School Kawakol Admission System
// These mirror the Motoko backend types

import type { ExternalBlob } from "../backend";

export type Class = "class09th" | "class10th" | "class11th" | "class12th";
export type Gender = "male" | "female" | "other";
export type Category =
  | "general"
  | "ews"
  | "sc"
  | "st"
  | "bci"
  | "bcii"
  | "ebc"
  | "bc";
export type Stream = "science" | "arts" | "commerce";
export type BankName =
  | "stateBankOfIndia"
  | "punjabNationalBank"
  | "madhyaBiharGraminBank"
  | "dakshinBiharGraminBank"
  | "unionBankOfIndia"
  | "indianPostPaymentBank"
  | "finoPaymentBank"
  | "other";
export type PassingDivision = "first" | "second" | "third";
export type State = "bihar" | "jharkhand" | "other";
export type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";
export type Religion =
  | "hinduism"
  | "islam"
  | "christianity"
  | "buddhism"
  | "other";

export interface DocumentsChecklist {
  casteCertificate: boolean;
  incomeCertificate: boolean;
  residenceCertificate: boolean;
  transferCertificate: boolean;
  previousMarksheets: boolean;
  studentAadhaarCard: boolean;
  mothersAadhaarCard: boolean;
  fathersAadhaarCard: boolean;
  deathCertificate: boolean;
}

export interface Address {
  village: string;
  postOffice: string;
  policeStation: string;
  block: string;
  district: string;
  state: State;
  pinCode: string;
}

export interface SubjectSelection {
  mil?: string[];
  sil?: string[];
  compulsory?: string[];
  extra?: string;
  stream?: Stream;
  extraSubjects?: string;
  // Backend-compatible fields (used during submission)
  compulsoryGroup1?: string;
  compulsoryGroup2?: string;
  electiveSubjects?: string[];
  additionalSubject?: string;
  extraSubject?: string;
}

export interface AdmissionForm {
  // Personal Details
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: bigint;
  gender: Gender;
  category: Category;
  physicallyHandicapped: boolean;
  handicapType?: string;
  handicapPercentage?: bigint;
  aadharNumber: string;
  annualFamilyIncome: string;
  religion?: Religion | string;
  caste?: string;
  religionOther?: string;

  // Legacy field names kept for backward compat — religion stored here previously
  emailId?: string;
  // Legacy: caste stored here previously
  mobileNumber?: string;

  // Student Identifiers
  studentPen?: string;
  apparNumber?: string;
  eShikshakoshNumber?: string;
  studentPhone?: string;
  studentEmail?: string;
  hasPenAndApaar?: boolean;
  hasEShikshakosh?: boolean;

  // Parent Details
  fathersName?: string;
  mothersName?: string;
  fathersOccupation?: string;
  mothersOccupation?: string;
  fathersContact?: string;
  mothersContact?: string;
  mothersGuardianContact?: string;
  fathersNameAsPerAadhaar?: string;
  mothersNameAsPerAadhaar?: string;
  fatherAadhar?: string;
  motherAadhar?: string;
  fathersAadhaar?: string;
  mothersAadhaar?: string;

  // Bank Details
  accountHolderName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName: BankName;
  otherBankName?: string;

  // Previous Exam
  previousExam?: string;
  previousRollNo?: string;
  previousSchool?: string;
  passingYear?: bigint;
  marksObtained?: bigint;
  passingDivision: PassingDivision;
  panchayatName?: string;
  blockName?: string;

  // Address (nested for form use; flattened for backend submission)
  address?: Address;
  // Flat address fields (backend format)
  village?: string;
  postOffice?: string;
  policeStation?: string;
  block?: string;
  district?: string;
  state?: State;
  pinCode?: string;

  // Subjects
  subjects?: SubjectSelection;

  // Orphaned
  orphanedAndDestitute?: boolean;

  // Documents Checklist
  documentsChecklist?: DocumentsChecklist;

  // Declaration
  guardianDeclaration: boolean;

  // Photo
  photo?: ExternalBlob;
  photoUrl?: string;
}

export interface Student {
  name: string;
  email: string;
  _class: Class;
  status: ApplicationStatus;
  registrationDate: bigint;
  rejectionReason?: string;
  admissionNumber?: string;
  form?: AdmissionForm;
}

// Enum-like constants
export const Gender = {
  male: "male" as Gender,
  female: "female" as Gender,
  other: "other" as Gender,
};

export const Category = {
  general: "general" as Category,
  ews: "ews" as Category,
  sc: "sc" as Category,
  st: "st" as Category,
  bci: "bci" as Category,
  bcii: "bcii" as Category,
  ebc: "ebc" as Category,
  bc: "bc" as Category,
};

export const BankName = {
  stateBankOfIndia: "stateBankOfIndia" as BankName,
  punjabNationalBank: "punjabNationalBank" as BankName,
  madhyaBiharGraminBank: "madhyaBiharGraminBank" as BankName,
  dakshinBiharGraminBank: "dakshinBiharGraminBank" as BankName,
  unionBankOfIndia: "unionBankOfIndia" as BankName,
  indianPostPaymentBank: "indianPostPaymentBank" as BankName,
  finoPaymentBank: "finoPaymentBank" as BankName,
  other: "other" as BankName,
};

export const PassingDivision = {
  first: "first" as PassingDivision,
  second: "second" as PassingDivision,
  third: "third" as PassingDivision,
};

export const State = {
  bihar: "bihar" as State,
  jharkhand: "jharkhand" as State,
  other: "other" as State,
};
