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

      const legacyGuardianName = `${parent1.firstName} ${parent1.surname}`.trim();
      const legacyGuardianPhone = otherContact.cellNumber || learner.emergencyTelephone || learner.homeTelephone || '';
      const legacyGuardianEmail = otherContact.emailAddress || learner.learnerEmail || '';

      const app: Application = {
        id: generateId(),
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
            {/* (rest of form unchanged from previous version) */}
          </form>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Note: Applications and uploads are saved in the school browser storage for this demo. For a real deployment,
          connect the staff portal to a database so staff can access submissions from any device.
        </p>
      </div>
    </div>
  );
};
