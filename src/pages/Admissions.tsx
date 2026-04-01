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
  Calendar,
  HeartPulse,
  FileText,
  Home,
  Shield,
} from 'lucide-react';
import {
  calculateAverageMark,
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
  { key: 'learnerId', label: 'Learner Birth Certificate / ID', required: true },
  { key: 'reportCard', label: 'Latest Report Card', required: true },
  { key: 'guardianId', label: 'Parent/Guardian ID Copy', required: true },
  { key: 'residence', label: 'Proof of Residence', required: true },
  { key: 'transfer', label: 'Transfer Letter (if transferring)' },
  { key: 'immunisation', label: 'Immunisation Card (if available)' },
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

export const Admissions = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    grade: '',
    year: '2027',

    guardianName: '',
    guardianRelationship: '',
    guardianEmail: '',
    guardianPhone: '',

    address: '',
    locality: '',

    previousSchool: '',
    lastGradeCompleted: '',

    medicalInfo: '',
  });

  const [files, setFiles] = useState<Record<string, File | null>>({});

  const missingRequiredUploads = useMemo(() => {
    return uploadFields.filter((f) => f.required).filter((f) => !files[f.key]);
  }, [files]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (missingRequiredUploads.length > 0) {
      setError('Please upload all required documents before submitting.');
      return;
    }

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

      const app: Application = {
        id: generateId(),

        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        gender: form.gender,
        grade: form.grade,
        year: form.year,

        studentNumber: generateStudentNumber(form.year),

        guardianName: form.guardianName.trim(),
        guardianRelationship: form.guardianRelationship,
        guardianPhone: form.guardianPhone.trim(),
        guardianEmail: form.guardianEmail.trim(),

        address: form.address.trim(),
        locality: form.locality.trim(),

        previousSchool: form.previousSchool.trim(),
        lastGradeCompleted: form.lastGradeCompleted.trim(),

        medicalInfo: form.medicalInfo.trim(),

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
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center p-10 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to Mount Hargreaves SSS. We have received your general application and the school will
            contact you.
          </p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Applications</h1>

        <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-bold text-gray-900">Need boarding accommodation?</div>
            <div className="text-sm text-gray-600">
              General admissions and boarding applications are separate. If the learner needs a hostel bed, submit the
              boarding form as well.
            </div>
          </div>
          <a href="/boarding" className="btn-primary inline-flex items-center justify-center gap-2">
            <BedDouble size={18} /> Boarding application
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-school-green p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">General School Application</h2>
            <p className="text-white/80">Please complete the form below. Fields marked required must be filled in.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
            {/* Learner details */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <User size={20} className="text-school-green" /> Learner Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">First Name</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Surname</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                  <input
                    required
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    type="date"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  >
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Applying for Grade</label>
                  <select
                    required
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
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
                  <label className="text-sm font-bold text-gray-700">Applying for Year</label>
                  <select
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  >
                    <option>2027</option>
                    <option>2028</option>
                    <option>2029</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Parent/Guardian */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Phone size={20} className="text-school-green" /> Parent/Guardian Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Parent/Guardian Full Name</label>
                  <input
                    required
                    value={form.guardianName}
                    onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Relationship to Learner</label>
                  <select
                    value={form.guardianRelationship}
                    onChange={(e) => setForm({ ...form, guardianRelationship: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  >
                    <option value="">Select</option>
                    <option>Parent</option>
                    <option>Guardian</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email</label>
                  <input
                    required
                    value={form.guardianEmail}
                    onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
                    type="email"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input
                    required
                    value={form.guardianPhone}
                    onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                    type="tel"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-school-green" /> Home Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Physical Address</label>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Locality / Village / Suburb</label>
                  <input
                    required
                    value={form.locality}
                    onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                    placeholder="e.g. Mgubo A/A"
                  />
                </div>
              </div>
            </section>

            {/* Previous school */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-school-green" /> Previous School (if applicable)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Previous School Name</label>
                  <input
                    value={form.previousSchool}
                    onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Last Grade Completed</label>
                  <input
                    value={form.lastGradeCompleted}
                    onChange={(e) => setForm({ ...form, lastGradeCompleted: e.target.value })}
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Medical */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <HeartPulse size={20} className="text-school-green" /> Medical Information
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Medical Conditions / Allergies (optional)</label>
                  <textarea
                    value={form.medicalInfo}
                    onChange={(e) => setForm({ ...form, medicalInfo: e.target.value })}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none resize-none"
                    placeholder="List any medical conditions, allergies, or medication"
                  />
                </div>
              </div>
            </section>

            {/* Uploads */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-school-green" /> Required Documents (PDF)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Learner Birth Certificate / ID', icon: FileText },
                  { title: 'Latest Report Card', icon: FileText },
                  { title: 'Parent/Guardian ID Copy', icon: FileText },
                  { title: 'Proof of Residence', icon: FileText },
                  { title: 'Transfer Letter (if transferring)', icon: FileText },
                  { title: 'Immunisation Card (if available)', icon: FileText },
                ].map((doc) => (
                  <div
                    key={doc.title}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-school-green transition-colors cursor-pointer"
                  >
                    <doc.icon className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-400">Click to upload PDF</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <p className="text-sm text-yellow-800">
                By submitting this form, you confirm that the information provided is true and correct. Incomplete
                applications may not be processed.
              </p>
            </div>

            {error ? (
              <div className="bg-red-50 p-4 rounded-xl flex gap-3 items-start">
                <Shield className="text-red-600 shrink-0" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-lg shadow-lg shadow-blue-900/20 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit General Application'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Applications and uploads are saved in the school browser storage for this demo. For a real deployment,
          connect the staff portal to a database (e.g. Supabase) so staff can access submissions from any device.
        </p>
      </div>
    </div>
  );
};
