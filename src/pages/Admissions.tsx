import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  BedDouble,
  User,
  Phone,
  MapPin,
  FileText,
  Home,
  Shield,
  HeartPulse,
  Users,
  Mail,
} from 'lucide-react';
import {
  generateId,
  generateStudentNumber,
  getApplications,
  setApplications,
  type Application,
  type UploadedFile,
} from '../admin/utils/storage';

type UploadField = {
  key: string;
  label: string;
  required?: boolean;
};

const uploadFields: UploadField[] = [
  { key: 'learnerId', label: 'Copy of Birth Certificate / ID', required: true },
  { key: 'reportCard', label: 'Progress Report from Previous School', required: true },
  { key: 'guardianId', label: 'Parent/Guardian ID Copy', required: true },
  { key: 'residence', label: 'Proof of Residence', required: true },
  { key: 'transfer', label: 'Transfer Letter from Previous School (if applicable)' },
  { key: 'immunisation', label: 'Copy of Immunisation Records (if available)' },
];

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const SectionPill = (props: { active: boolean; label: string; index: number }) => {
  return (
    <div
      className={
        props.active
          ? 'flex items-center gap-2 text-xs font-black uppercase tracking-widest text-school-green'
          : 'flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400'
      }
    >
      <div
        className={
          props.active
            ? 'w-6 h-6 rounded-full bg-green-100 flex items-center justify-center border border-green-200'
            : 'w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200'
        }
      >
        {props.index}
      </div>
      {props.label}
    </div>
  );
};

export const Admissions = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [files, setFiles] = useState<Record<string, File | null>>({});

  // Step 1: Learner particulars + Previous school + Medical
  const [learner, setLearner] = useState({
    firstName: '',
    lastName: '',
    initials: '',
    otherNames: '',
    dob: '',
    gender: '',
    identificationNumber: '',
    citizenship: '',
    race: '',

    grade: '',
    year: '2027',

    highestGradePassed: '',
    yearWhenGradeWasPassed: '',
    accessionNo: '',

    countryOfResidence: '',
    province: '',
    physicalAddress: '',
    citySuburb: '',
    postalCode: '',

    homeLanguage: '',
    preferredLanguageOfInstruction: '',

    homeTelephone: '',
    emergencyTelephone: '',
    learnerCell: '',
    learnerEmail: '',

    isBoarder: '',
    modeOfTransport: '',
    deceasedParent: 'None',
    religion: '',
  });

  const [previousSchoolInfo, setPreviousSchoolInfo] = useState({
    name: '',
    address: '',
    code: '',
    province: '',
    country: '',
  });

  const [medical, setMedical] = useState({
    medicalAidNumber: '',
    medicalAidName: '',
    medicalAidMainMember: '',
    doctorName: '',
    doctorTelephoneNumber: '',
    doctorAddress: '',
    medicalCondition: '',
    specialProblemsRequiringCounselling: '',
    dexterity: '',
    socialGrantReg: '',
    socialGrantRec: '',
  });

  // Step 2: Siblings
  const [siblings, setSiblings] = useState({
    numberOfOtherChildrenAtSchool: '',
    sibling1Name: '',
    sibling1Grade: '',
    sibling2Name: '',
    sibling2Grade: '',
    sibling3Name: '',
    sibling3Grade: '',
    positionInFamily: '',
  });

  // Step 3: Parent/Guardian (up to 2) + correspondence + other contacts
  const [hasSecondParent, setHasSecondParent] = useState(false);

  const [parent1, setParent1] = useState({
    title: '',
    initials: '',
    firstName: '',
    surname: '',
    gender: '',
    race: '',
    homeLanguage: '',
    identificationNumber: '',
    accountPayer: 'Yes',

    residentialStreetAddress: '',
    citySuburb: '',
    code: '',

    employer: '',
    occupation: '',

    surnameOfSpouse: '',
    occupationOfSpouse: '',
    spouseIdNumber: '',

    learnerResidesWithThisParent: '',
    relationshipToLearner: '',
    maritalStatusOfParent: '',
  });

  const [parent2, setParent2] = useState({
    title: '',
    initials: '',
    firstName: '',
    surname: '',
    gender: '',
    race: '',
    homeLanguage: '',
    identificationNumber: '',
    accountPayer: 'No',

    residentialStreetAddress: '',
    citySuburb: '',
    code: '',

    employer: '',
    occupation: '',

    surnameOfSpouse: '',
    occupationOfSpouse: '',
    spouseIdNumber: '',

    learnerResidesWithThisParent: '',
    relationshipToLearner: '',
    maritalStatusOfParent: '',
  });

  const [correspondence, setCorrespondence] = useState({
    title: '',
    surname: '',
    postalAddress: '',
  });

  const [otherContact, setOtherContact] = useState({
    homeTelephone: '',
    faxNumber: '',
    spouseWorkTelephoneNumber: '',
    emailAddress: '',
    workTelephone: '',
    cellNumber: '',
    spouseCellNumber: '',
    spouseEmailAddress: '',
  });

  const missingRequiredUploads = useMemo(() => {
    return uploadFields.filter((f) => f.required).filter((f) => !files[f.key]);
  }, [files]);

  const validateStep = () => {
    // Keep validation light but enforce essentials
    if (step === 1) {
      if (!learner.firstName || !learner.lastName || !learner.dob || !learner.gender) {
        setError('Please complete learner particulars (name, date of birth, and gender).');
        return false;
      }
      if (!learner.grade || !learner.year) {
        setError('Please select grade and year.');
        return false;
      }
      setError('');
      return true;
    }

    if (step === 2) {
      setError('');
      return true;
    }

    if (step === 3) {
      if (!parent1.firstName || !parent1.surname) {
        setError('Please complete Parent/Guardian 1 name and surname.');
        return false;
      }
      if (missingRequiredUploads.length > 0) {
        setError('Please upload all required documents before submitting.');
        return false;
      }
      setError('');
      return true;
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const goBack = () => {
    setError('');
    setStep((s) => (s === 3 ? 2 : 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const uploads: UploadedFile[] = [];
      for (const field of uploadFields) {
        const file = files[field.key];
        if (!file) continue;
        const dataUrl = await fileToDataUrl(file);
        uploads.push({
          key: field.key,
          label: field.label,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          dataUrl,
        });
      }

      const studentNumber = generateStudentNumber(learner.year);

      // Backward-compatible “legacy” fields used by the existing admin views.
      const legacyGuardianName = `${parent1.firstName} ${parent1.surname}`.trim();
      const legacyGuardianPhone = otherContact.cellNumber || learner.emergencyTelephone || learner.homeTelephone || '';
      const legacyGuardianEmail = otherContact.emailAddress || learner.learnerEmail || '';

      const app: Application = {
        id: generateId(),

        // Legacy learner fields
        firstName: learner.firstName.trim(),
        lastName: learner.lastName.trim(),
        dob: learner.dob,
        gender: learner.gender,
        grade: learner.grade,
        year: learner.year,

        studentNumber,

        guardianName: legacyGuardianName,
        guardianRelationship: parent1.relationshipToLearner || '',
        guardianPhone: legacyGuardianPhone,
        guardianEmail: legacyGuardianEmail,

        address: learner.physicalAddress.trim(),
        locality: learner.citySuburb.trim(),

        previousSchool: previousSchoolInfo.name.trim(),
        lastGradeCompleted: learner.highestGradePassed.trim(),

        medicalInfo: medical.medicalCondition.trim() || medical.specialProblemsRequiringCounselling.trim(),

        // New structured fields
        learner: {
          initials: learner.initials,
          otherNames: learner.otherNames,
          identificationNumber: learner.identificationNumber,
          citizenship: learner.citizenship,
          race: learner.race,
          homeLanguage: learner.homeLanguage,
          physicalAddress: learner.physicalAddress,
          citySuburb: learner.citySuburb,
          postalCode: learner.postalCode,
          isBoarder: learner.isBoarder as any,
          modeOfTransport: learner.modeOfTransport,
          deceasedParent: learner.deceasedParent as any,
          religion: learner.religion,
          accessionNo: learner.accessionNo,
          highestGradePassed: learner.highestGradePassed,
          yearWhenGradeWasPassed: learner.yearWhenGradeWasPassed,
          // keep parity with type
          citizenship: learner.citizenship,
          race: learner.race,
        },
        learnerContact: {
          homeTelephone: learner.homeTelephone,
          emergencyTelephone: learner.emergencyTelephone,
          learnerCell: learner.learnerCell,
          learnerEmail: learner.learnerEmail,
        },
        previousSchoolInfo: {
          name: previousSchoolInfo.name,
          address: previousSchoolInfo.address,
          code: previousSchoolInfo.code,
          province: previousSchoolInfo.province,
          country: previousSchoolInfo.country,
        },
        learnerMedicalInfo: {
          medicalAidNumber: medical.medicalAidNumber,
          medicalAidName: medical.medicalAidName,
          medicalAidMainMember: medical.medicalAidMainMember,
          doctorName: medical.doctorName,
          doctorTelephoneNumber: medical.doctorTelephoneNumber,
          doctorAddress: medical.doctorAddress,
          medicalCondition: medical.medicalCondition,
          specialProblemsRequiringCounselling: medical.specialProblemsRequiringCounselling,
          dexterity: medical.dexterity as any,
          socialGrant: {
            reg: medical.socialGrantReg as any,
            rec: medical.socialGrantRec as any,
          },
        },
        siblingInfo: {
          numberOfOtherChildrenAtSchool: siblings.numberOfOtherChildrenAtSchool,
          siblings: [
            siblings.sibling1Name
              ? { name: siblings.sibling1Name, grade: siblings.sibling1Grade, positionInFamily: siblings.positionInFamily }
              : null,
            siblings.sibling2Name
              ? { name: siblings.sibling2Name, grade: siblings.sibling2Grade, positionInFamily: siblings.positionInFamily }
              : null,
            siblings.sibling3Name
              ? { name: siblings.sibling3Name, grade: siblings.sibling3Grade, positionInFamily: siblings.positionInFamily }
              : null,
          ].filter(Boolean) as any,
        },
        parentGuardian1: parent1 as any,
        parentGuardian2: hasSecondParent ? (parent2 as any) : undefined,
        correspondenceDetails: correspondence as any,
        otherContactDetails: otherContact as any,

        applicationType: 'General',
        uploads,

        subjectMarks: [],
        averageMark: 0,

        status: 'Pending',
        submittedDate: todayISO(),
      };

      const current = getApplications();
      setApplications([app, ...current]);
      setSubmitted(true);
    } catch {
      setError('Something went wrong while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial= opacity: 0, y: 18, scale: 0.98 
          animate= opacity: 1, y: 0, scale: 1 
          transition= duration: 0.25 
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying. We have received your general application and the school will contact you.
          </p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">General Application</h1>

        <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-bold text-gray-900">Need boarding accommodation?</div>
            <div className="text-sm text-gray-600">
              General admissions and boarding applications are separate. If the learner needs a hostel bed, submit the boarding form as well.
            </div>
          </div>
          <a href="/boarding" className="btn-primary inline-flex items-center justify-center gap-2">
            <BedDouble size={18} /> Boarding application
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-school-green p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Application for admission to school</h2>
            <p className="text-white/80">Please complete the form below. You can move between sections using Next / Back.</p>

            <div className="mt-6 flex flex-wrap gap-6">
              <SectionPill index={1} label="Learner" active={step === 1} />
              <SectionPill index={2} label="Siblings" active={step === 2} />
              <SectionPill index={3} label="Parent/Guardian" active={step === 3} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {step === 1 ? (
              <>
                {/* Learner particulars */}
                <section>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <User size={20} className="text-school-green" /> Learner particulars
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Surname</label>
                      <input
                        required
                        value={learner.lastName}
                        onChange={(e) => setLearner({ ...learner, lastName: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">First name</label>
                      <input
                        required
                        value={learner.firstName}
                        onChange={(e) => setLearner({ ...learner, firstName: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Initials</label>
                      <input
                        value={learner.initials}
                        onChange={(e) => setLearner({ ...learner, initials: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Other names</label>
                      <input
                        value={learner.otherNames}
                        onChange={(e) => setLearner({ ...learner, otherNames: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Date of birth</label>
                      <input
                        required
                        value={learner.dob}
                        onChange={(e) => setLearner({ ...learner, dob: e.target.value })}
                        type="date"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Gender</label>
                      <select
                        required
                        value={learner.gender}
                        onChange={(e) => setLearner({ ...learner, gender: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>Female</option>
                        <option>Male</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Identification or Passport No.</label>
                      <input
                        value={learner.identificationNumber}
                        onChange={(e) => setLearner({ ...learner, identificationNumber: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Citizenship</label>
                      <input
                        value={learner.citizenship}
                        onChange={(e) => setLearner({ ...learner, citizenship: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Applying for grade</label>
                      <select
                        required
                        value={learner.grade}
                        onChange={(e) => setLearner({ ...learner, grade: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select grade</option>
                        <option>Grade 8</option>
                        <option>Grade 9</option>
                        <option>Grade 10</option>
                        <option>Grade 11</option>
                        <option>Grade 12</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Year</label>
                      <select
                        required
                        value={learner.year}
                        onChange={(e) => setLearner({ ...learner, year: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option>2027</option>
                        <option>2028</option>
                        <option>2029</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Highest grade passed</label>
                      <input
                        value={learner.highestGradePassed}
                        onChange={(e) => setLearner({ ...learner, highestGradePassed: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Year when grade was passed</label>
                      <input
                        value={learner.yearWhenGradeWasPassed}
                        onChange={(e) => setLearner({ ...learner, yearWhenGradeWasPassed: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                        placeholder="e.g. 2025"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Accession No.</label>
                      <input
                        value={learner.accessionNo}
                        onChange={(e) => setLearner({ ...learner, accessionNo: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Learner address & contact */}
                <section className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-school-green" /> Address & contact
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Physical address</label>
                      <input
                        value={learner.physicalAddress}
                        onChange={(e) => setLearner({ ...learner, physicalAddress: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">City/Suburb</label>
                      <input
                        value={learner.citySuburb}
                        onChange={(e) => setLearner({ ...learner, citySuburb: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Code</label>
                      <input
                        value={learner.postalCode}
                        onChange={(e) => setLearner({ ...learner, postalCode: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Home language</label>
                      <input
                        value={learner.homeLanguage}
                        onChange={(e) => setLearner({ ...learner, homeLanguage: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Preferred language of instruction</label>
                      <input
                        value={learner.preferredLanguageOfInstruction}
                        onChange={(e) => setLearner({ ...learner, preferredLanguageOfInstruction: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Home telephone</label>
                      <input
                        value={learner.homeTelephone}
                        onChange={(e) => setLearner({ ...learner, homeTelephone: e.target.value })}
                        type="tel"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Emergency telephone</label>
                      <input
                        value={learner.emergencyTelephone}
                        onChange={(e) => setLearner({ ...learner, emergencyTelephone: e.target.value })}
                        type="tel"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Learner cell</label>
                      <input
                        value={learner.learnerCell}
                        onChange={(e) => setLearner({ ...learner, learnerCell: e.target.value })}
                        type="tel"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Learner email address</label>
                      <input
                        value={learner.learnerEmail}
                        onChange={(e) => setLearner({ ...learner, learnerEmail: e.target.value })}
                        type="email"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Boarder</label>
                      <select
                        value={learner.isBoarder}
                        onChange={(e) => setLearner({ ...learner, isBoarder: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Mode of transport</label>
                      <select
                        value={learner.modeOfTransport}
                        onChange={(e) => setLearner({ ...learner, modeOfTransport: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>None</option>
                        <option>Non Formal</option>
                        <option>Formal</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Deceased parent</label>
                      <select
                        value={learner.deceasedParent}
                        onChange={(e) => setLearner({ ...learner, deceasedParent: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option>None</option>
                        <option>Mother</option>
                        <option>Father</option>
                        <option>Both</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-sm font-bold text-gray-700">Religion</label>
                      <input
                        value={learner.religion}
                        onChange={(e) => setLearner({ ...learner, religion: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Previous school */}
                <section className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Home size={20} className="text-school-green" /> Previous school information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Name of previous school</label>
                      <input
                        value={previousSchoolInfo.name}
                        onChange={(e) => setPreviousSchoolInfo({ ...previousSchoolInfo, name: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Previous school address</label>
                      <input
                        value={previousSchoolInfo.address}
                        onChange={(e) => setPreviousSchoolInfo({ ...previousSchoolInfo, address: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Code</label>
                      <input
                        value={previousSchoolInfo.code}
                        onChange={(e) => setPreviousSchoolInfo({ ...previousSchoolInfo, code: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Province</label>
                      <input
                        value={previousSchoolInfo.province}
                        onChange={(e) => setPreviousSchoolInfo({ ...previousSchoolInfo, province: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Country</label>
                      <input
                        value={previousSchoolInfo.country}
                        onChange={(e) => setPreviousSchoolInfo({ ...previousSchoolInfo, country: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Medical */}
                <section className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <HeartPulse size={20} className="text-school-green" /> Learner medical information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Medical aid number</label>
                      <input
                        value={medical.medicalAidNumber}
                        onChange={(e) => setMedical({ ...medical, medicalAidNumber: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Medical aid name</label>
                      <input
                        value={medical.medicalAidName}
                        onChange={(e) => setMedical({ ...medical, medicalAidName: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Medical aid main member</label>
                      <input
                        value={medical.medicalAidMainMember}
                        onChange={(e) => setMedical({ ...medical, medicalAidMainMember: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Doctor name</label>
                      <input
                        value={medical.doctorName}
                        onChange={(e) => setMedical({ ...medical, doctorName: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Doctor telephone number</label>
                      <input
                        value={medical.doctorTelephoneNumber}
                        onChange={(e) => setMedical({ ...medical, doctorTelephoneNumber: e.target.value })}
                        type="tel"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Doctor's address</label>
                      <input
                        value={medical.doctorAddress}
                        onChange={(e) => setMedical({ ...medical, doctorAddress: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Medical condition</label>
                      <input
                        value={medical.medicalCondition}
                        onChange={(e) => setMedical({ ...medical, medicalCondition: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-gray-700">Special problems requiring counselling</label>
                      <input
                        value={medical.specialProblemsRequiringCounselling}
                        onChange={(e) => setMedical({ ...medical, specialProblemsRequiringCounselling: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Dexterity</label>
                      <select
                        value={medical.dexterity}
                        onChange={(e) => setMedical({ ...medical, dexterity: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>Right Handed</option>
                        <option>Left Handed</option>
                        <option>Ambidextrous</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Social grant (Reg.)</label>
                      <select
                        value={medical.socialGrantReg}
                        onChange={(e) => setMedical({ ...medical, socialGrantReg: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Social grant (Rec.)</label>
                      <select
                        value={medical.socialGrantRec}
                        onChange={(e) => setMedical({ ...medical, socialGrantRec: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                      >
                        <option value="">Select</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <section>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Users size={20} className="text-school-green" /> Sibling information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Number of other children at this school</label>
                      <input
                        value={siblings.numberOfOtherChildrenAtSchool}
                        onChange={(e) => setSiblings({ ...siblings, numberOfOtherChildrenAtSchool: e.target.value })}
                        type="text"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring--180483? no