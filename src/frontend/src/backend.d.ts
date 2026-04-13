import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubjectSelection {
    mil?: string;
    sil?: string;
    extraSubject?: string;
    stream?: Stream;
    additionalSubject?: string;
    compulsoryGroup1?: string;
    compulsoryGroup2?: string;
    electiveSubjects: Array<string>;
}
export type Time = bigint;
export interface Student {
    status: ApplicationStatus;
    principal: Principal;
    form?: AdmissionForm;
    _class: Class;
    password: string;
    name: string;
    rejectionReason?: string;
    email: string;
    admissionNumber: string;
    registrationDate: Time;
}
export interface DocumentsChecklist {
    mothersAadhaarCard: boolean;
    previousMarksheets: boolean;
    casteCertificate: boolean;
    deathCertificate: boolean;
    fathersAadhaarCard: boolean;
    residenceCertificate: boolean;
    incomeCertificate: boolean;
    studentAadhaarCard: boolean;
    transferCertificate: boolean;
}
export interface AdmissionForm {
    bankAccountNumber: string;
    orphanedAndDestitute: boolean;
    studentEmail: string;
    hasEShikshakosh: boolean;
    subjects: SubjectSelection;
    previousSchool: string;
    ifscCode: string;
    marksObtained: bigint;
    dateOfBirth: bigint;
    eShikshakoshNumber: string;
    caste: string;
    passingYear: bigint;
    apparNumber: string;
    accountHolderName: string;
    passingDivision: PassingDivision;
    studentPhone: string;
    religionOther: string;
    studentPen: string;
    photoUrl?: string;
    mothersOccupation: string;
    policeStation: string;
    fathersName: string;
    bankName: BankName;
    district: string;
    mothersName: string;
    state: State;
    fathersContact: string;
    aadharNumber: string;
    handicapType?: string;
    village: string;
    gender: Gender;
    physicallyHandicapped: boolean;
    category: Category;
    pinCode: string;
    previousRollNo: string;
    block: string;
    postOffice: string;
    mothersGuardianContact: string;
    guardianDeclaration: boolean;
    religion: Religion;
    fathersAadhaar: string;
    documentsChecklist: DocumentsChecklist;
    annualFamilyIncome: string;
    handicapPercentage?: bigint;
    fathersOccupation: string;
    previousExam: string;
    hasPenAndApaar: boolean;
    mothersAadhaar: string;
}
export interface UserProfile {
    _class: Class;
    name: string;
    email: string;
    isStudent: boolean;
}
export enum ApplicationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum BankName {
    other = "other",
    finoPaymentBank = "finoPaymentBank",
    dakshinBiharGraminBank = "dakshinBiharGraminBank",
    indianPostPaymentBank = "indianPostPaymentBank",
    madhyaBiharGraminBank = "madhyaBiharGraminBank",
    stateBankOfIndia = "stateBankOfIndia",
    unionBankOfIndia = "unionBankOfIndia",
    punjabNationalBank = "punjabNationalBank"
}
export enum Category {
    bc = "bc",
    sc = "sc",
    st = "st",
    ebc = "ebc",
    general = "general"
}
export enum Class {
    class09th = "class09th",
    class10th = "class10th",
    class11th = "class11th",
    class12th = "class12th"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum PassingDivision {
    first = "first",
    third = "third",
    second = "second"
}
export enum Religion {
    hinduism = "hinduism",
    other = "other",
    christianity = "christianity",
    buddhism = "buddhism",
    islam = "islam"
}
export enum State {
    other = "other",
    bihar = "bihar",
    jharkhand = "jharkhand"
}
export enum Stream {
    arts = "arts",
    commerce = "commerce",
    science = "science"
}
export interface backendInterface {
    approveApplication(email: string): Promise<void>;
    approveApplicationForAdmin(email: string, adminPassword: string): Promise<void>;
    generateOtp(email: string): Promise<string>;
    getAdmissionNumber(email: string): Promise<string>;
    getAllAdmissionNumbers(): Promise<Array<[string, string]>>;
    getAllApplications(): Promise<Array<Student>>;
    getAllApplicationsForAdmin(adminPassword: string): Promise<Array<Student>>;
    getAllApprovedApplications(): Promise<Array<Student>>;
    getAllPendingApplications(): Promise<Array<Student>>;
    getAllRejectedApplications(): Promise<Array<Student>>;
    getApplicationStatus(email: string): Promise<ApplicationStatus>;
    getApplicationsSortedByDate(): Promise<Array<Student>>;
    getCallerStudent(): Promise<Student | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getDraftData(email: string): Promise<AdmissionForm | null>;
    getStudent(email: string): Promise<Student>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    loginStudent(email: string, password: string): Promise<boolean>;
    registerStudent(_class: Class, name: string, email: string, password: string): Promise<string>;
    rejectApplication(email: string): Promise<void>;
    rejectApplicationForAdmin(email: string, adminPassword: string, rejectionReason: string): Promise<void>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
    resetPasswordDirect(email: string, newPassword: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDraft(email: string, form: AdmissionForm): Promise<void>;
    submitForm(email: string, form: AdmissionForm): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
}
