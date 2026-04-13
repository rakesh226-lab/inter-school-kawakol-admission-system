import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";




actor {

  // ─── Types ───────────────────────────────────────────────────────────────

  type Class = { #class09th; #class10th; #class11th; #class12th };
  type Gender = { #male; #female; #other };
  type Category = { #general; #ebc; #bc; #sc; #st };
  type Religion = { #christianity; #islam; #hinduism; #buddhism; #other };
  type BankName = {
    #stateBankOfIndia;
    #punjabNationalBank;
    #madhyaBiharGraminBank;
    #dakshinBiharGraminBank;
    #unionBankOfIndia;
    #indianPostPaymentBank;
    #finoPaymentBank;
    #other;
  };
  type PassingDivision = { #first; #second; #third };
  type State = { #bihar; #jharkhand; #other };
  type Stream = { #science; #arts; #commerce };
  type ApplicationStatus = { #draft; #pending; #approved; #rejected };

  // Subject selection supporting both Class 9/10 and Class 11/12
  type SubjectSelection = {
    // Classes 9 & 10
    mil : ?Text;            // Mother's Instruction Language (radio single-select)
    sil : ?Text;            // Second Instruction Language (radio single-select)
    extraSubject : ?Text;   // Optional extra subject
    // Classes 11 & 12
    stream : ?Stream;
    compulsoryGroup1 : ?Text;   // Select one: Hindi/English
    compulsoryGroup2 : ?Text;   // Select one language not chosen in Group-1
    electiveSubjects : [Text];  // Exactly 3 subjects
    additionalSubject : ?Text;  // Optional
  };

  // Documents checklist (confirmed by student)
  type DocumentsChecklist = {
    casteCertificate : Bool;
    incomeCertificate : Bool;
    residenceCertificate : Bool;
    transferCertificate : Bool;
    previousMarksheets : Bool;
    studentAadhaarCard : Bool;
    mothersAadhaarCard : Bool;
    fathersAadhaarCard : Bool;
    deathCertificate : Bool; // required if orphaned/destitute
  };

  type AdmissionForm = {
    // Student identifiers
    hasPenAndApaar : Bool;
    studentPen : Text;         // 11 chars if hasPenAndApaar
    apparNumber : Text;        // 12 chars, optional even if hasPenAndApaar
    hasEShikshakosh : Bool;
    eShikshakoshNumber : Text; // 15 chars if hasEShikshakosh
    // Contact
    studentPhone : Text;
    studentEmail : Text;
    // Personal
    dateOfBirth : Int;
    gender : Gender;
    category : Category;
    religion : Religion;
    religionOther : Text;   // manual entry if religion = #other
    caste : Text;
    physicallyHandicapped : Bool;
    handicapType : ?Text;
    handicapPercentage : ?Nat;
    aadharNumber : Text;
    orphanedAndDestitute : Bool;
    // Parent details
    fathersName : Text;
    mothersName : Text;
    fathersOccupation : Text;
    mothersOccupation : Text;
    fathersContact : Text;
    mothersGuardianContact : Text; // mandatory
    fathersAadhaar : Text;
    mothersAadhaar : Text;
    // Bank details
    annualFamilyIncome : Text;
    accountHolderName : Text;
    bankAccountNumber : Text;
    ifscCode : Text;
    bankName : BankName;
    // Address
    village : Text;
    postOffice : Text;
    policeStation : Text;
    block : Text;
    district : Text;
    state : State;
    pinCode : Text;
    // Previous exam
    previousExam : Text;
    previousRollNo : Text;
    previousSchool : Text;
    passingYear : Nat;
    marksObtained : Nat;
    passingDivision : PassingDivision;
    // Subjects
    subjects : SubjectSelection;
    // Documents & declaration
    documentsChecklist : DocumentsChecklist;
    guardianDeclaration : Bool;
    // Photo URL
    photoUrl : ?Text;
  };

  type Student = {
    principal : Principal;
    _class : Class;
    name : Text;
    email : Text;
    password : Text;
    registrationDate : Time.Time;
    admissionNumber : Text;
    form : ?AdmissionForm;
    status : ApplicationStatus;
    rejectionReason : ?Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    _class : Class;
    isStudent : Bool;
  };

  type OtpRecord = {
    otp : Text;
    expiry : Int;
  };

  // ─── State ───────────────────────────────────────────────────────────────

  // Per-class admission counters (persisted via enhanced orthogonal persistence)
  var admissionCounter9  : Nat = 0;
  var admissionCounter10 : Nat = 0;
  var admissionCounter11 : Nat = 0;
  var admissionCounter12 : Nat = 0;

  let students         = Map.empty<Text, Student>();         // email -> Student
  let principalToEmail = Map.empty<Principal, Text>();       // principal -> email
  let userProfiles     = Map.empty<Principal, UserProfile>();
  let otpStore         = Map.empty<Text, OtpRecord>();       // email -> OTP (short-lived)

  let ADMIN_PASSWORD : Text = "InterSchool@951";

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private func classNumText(_class : Class) : Text {
    switch (_class) {
      case (#class09th) { "9"  };
      case (#class10th) { "10" };
      case (#class11th) { "11" };
      case (#class12th) { "12" };
    }
  };

  private func padNat(n : Nat, width : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= width) { return s };
    var pad = "";
    var i = len;
    while (i < width) {
      pad := "0" # pad;
      i += 1;
    };
    pad # s
  };

  private func currentAcademicYear() : Text {
    let ns : Int = Time.now();
    let seconds : Int = ns / 1_000_000_000;
    let JAN1_2024 : Int = 1_704_067_200;
    let SECS_PER_YEAR : Int = 31_536_000;
    let years : Int = (seconds - JAN1_2024) / SECS_PER_YEAR;
    let year : Int = 2024 + years;
    let yearStart : Int = JAN1_2024 + years * SECS_PER_YEAR;
    let dayOfYear : Int = (seconds - yearStart) / 86_400;
    let month : Int = dayOfYear / 30 + 1;
    let startY : Int = if (month >= 4) { year } else { year - 1 };
    let endY : Int = startY + 1;
    let endShort : Int = endY - (endY / 100 * 100);
    let endStr = if (endShort < 10) { "0" # endShort.toText() } else { endShort.toText() };
    startY.toText() # "-" # endStr
  };

  private func nextClassCounter(_class : Class) : Nat {
    switch (_class) {
      case (#class09th) { admissionCounter9  += 1; admissionCounter9  };
      case (#class10th) { admissionCounter10 += 1; admissionCounter10 };
      case (#class11th) { admissionCounter11 += 1; admissionCounter11 };
      case (#class12th) { admissionCounter12 += 1; admissionCounter12 };
    }
  };

  private func generateAdmissionNumber(_class : Class) : Text {
    let counter = nextClassCounter(_class);
    "ISK/" # classNumText(_class) # "/" # currentAcademicYear() # "/-" # padNat(counter, 5)
  };

  private func generateOtpCode() : Text {
    let t : Int = Time.now();
    let raw : Int = (t / 1_000_000) % 1_000_000;
    let n : Nat = Int.abs(raw);
    padNat(100_000 + (n % 900_000), 6)
  };

  let OTP_EXPIRY_NS : Int = 10 * 60 * 1_000_000_000;

  // ─── OTP ─────────────────────────────────────────────────────────────────

  public shared func generateOtp(email : Text) : async Text {
    let otp = generateOtpCode();
    let expiry : Int = Time.now() + OTP_EXPIRY_NS;
    otpStore.add(email, { otp; expiry });
    otp
  };

  public query func verifyOtp(email : Text, otp : Text) : async Bool {
    switch (otpStore.get(email)) {
      case (null) { false };
      case (?record) {
        if (Time.now() > record.expiry) { false }
        else { record.otp == otp }
      };
    }
  };

  public shared func resetPassword(email : Text, otp : Text, newPassword : Text) : async () {
    switch (otpStore.get(email)) {
      case (null) { Runtime.trap("OTP not found or expired") };
      case (?record) {
        if (Time.now() > record.expiry) {
          Runtime.trap("OTP has expired. Please request a new OTP.");
        };
        if (record.otp != otp) {
          Runtime.trap("Invalid OTP");
        };
        switch (students.get(email)) {
          case (null) { Runtime.trap("No account found with this email") };
          case (?student) {
            students.add(email, { student with password = newPassword });
            ignore otpStore.remove(email);
          };
        };
      };
    }
  };

  public shared func resetPasswordDirect(email : Text, newPassword : Text) : async () {
    switch (students.get(email)) {
      case (null) { Runtime.trap("No account found with this email") };
      case (?student) {
        students.add(email, { student with password = newPassword });
      };
    }
  };

  // ─── Registration & Auth ─────────────────────────────────────────────────

  public shared ({ caller }) func registerStudent(
    _class   : Class,
    name     : Text,
    email    : Text,
    password : Text,
  ) : async Text {
    if (students.containsKey(email)) {
      Runtime.trap("Email already registered");
    };
    let admNo = generateAdmissionNumber(_class);
    let student : Student = {
      principal         = caller;
      _class;
      name;
      email;
      password;
      registrationDate  = Time.now();
      admissionNumber   = admNo;
      form              = null;
      status            = #draft;
      rejectionReason   = null;
    };
    students.add(email, student);
    principalToEmail.add(caller, email);
    userProfiles.add(caller, { name; email; _class; isStudent = true });
    admNo
  };

  public query func loginStudent(email : Text, password : Text) : async Bool {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Invalid credentials") };
      case (?student) {
        if (student.password == password) { true }
        else { Runtime.trap("Invalid credentials") }
      };
    }
  };

  // ─── Form Submission ─────────────────────────────────────────────────────

  public shared func saveDraft(email : Text, form : AdmissionForm) : async () {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, { student with form = ?form; status = #draft });
      };
    }
  };

  public shared func submitForm(email : Text, form : AdmissionForm) : async () {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, { student with form = ?form; status = #pending });
      };
    }
  };

  public query func getDraftData(email : Text) : async ?AdmissionForm {
    switch (students.get(email)) {
      case (null) { null };
      case (?student) { student.form };
    }
  };

  // ─── Application Status ──────────────────────────────────────────────────

  public query func getApplicationStatus(email : Text) : async ApplicationStatus {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student.status };
    }
  };

  public query func getAdmissionNumber(email : Text) : async Text {
    switch (students.get(email)) {
      case (null) { "" };
      case (?student) { student.admissionNumber };
    }
  };

  public query func getAllAdmissionNumbers() : async [(Text, Text)] {
    students.values().toArray().map<Student, (Text, Text)>(
      func(s) { (s.email, s.admissionNumber) }
    )
  };

  // ─── Student Queries ─────────────────────────────────────────────────────

  public query func getStudent(email : Text) : async Student {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student };
    }
  };

  public query ({ caller }) func getCallerStudent() : async ?Student {
    switch (principalToEmail.get(caller)) {
      case (null) { null };
      case (?email) { students.get(email) };
    }
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller)
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user)
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ─── Admin — Principal-based (kept for Internet Identity fallback) ────────

  public shared ({ caller }) func approveApplication(email : Text) : async () {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, { student with status = #approved; rejectionReason = null });
      };
    }
  };

  public shared ({ caller }) func rejectApplication(email : Text) : async () {
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, { student with status = #rejected });
      };
    }
  };

  // ─── Admin — Password-based (main admin API) ─────────────────────────────

  public query func getAllApplicationsForAdmin(adminPassword : Text) : async [Student] {
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Unauthorized: Invalid admin password");
    };
    students.values().toArray()
  };

  public shared func approveApplicationForAdmin(
    email         : Text,
    adminPassword : Text,
  ) : async () {
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Unauthorized: Invalid admin password");
    };
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, { student with status = #approved; rejectionReason = null });
      };
    }
  };

  public shared func rejectApplicationForAdmin(
    email           : Text,
    adminPassword   : Text,
    rejectionReason : Text,
  ) : async () {
    if (adminPassword != ADMIN_PASSWORD) {
      Runtime.trap("Unauthorized: Invalid admin password");
    };
    switch (students.get(email)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        students.add(email, {
          student with
          status          = #rejected;
          rejectionReason = ?rejectionReason;
        });
      };
    }
  };

  // ─── Admin — Filtered Queries ─────────────────────────────────────────────

  public query ({ caller }) func getAllApplications() : async [Student] {
    students.values().toArray()
  };

  public query ({ caller }) func getAllPendingApplications() : async [Student] {
    students.values().toArray().filter(func(s : Student) : Bool { s.status == #pending })
  };

  public query ({ caller }) func getAllApprovedApplications() : async [Student] {
    students.values().toArray().filter(func(s : Student) : Bool { s.status == #approved })
  };

  public query ({ caller }) func getAllRejectedApplications() : async [Student] {
    students.values().toArray().filter(func(s : Student) : Bool { s.status == #rejected })
  };

  public query ({ caller }) func getApplicationsSortedByDate() : async [Student] {
    students.values().toArray().sort(
      func(a : Student, b : Student) : Order.Order {
        Int.compare(a.registrationDate, b.registrationDate)
      }
    )
  };
};
