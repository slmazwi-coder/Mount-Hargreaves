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

    if (!form.gender) {
      setError('Please select a gender before submitting.');
      return;
    }

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
                  <label className="text-sm font-bold text-gray-700">Gender (required)</label>
                  <select
                    required
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

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-school-green" /> Required Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFields.map((doc) => (
                  <div key={doc.key} className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-left bg-white">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-school-green shrink-0">
                        {doc.key === 'residence' ? <Home size={20} /> : <FileText size={20} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{doc.label}</p>
                          {doc.required ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Required</span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Optional</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PDF recommended</p>
                        <p className="text-xs text-gray-700 mt-2 font-medium">
                          {files[doc.key] ? `Selected: ${files[doc.key]!.name}` : 'No file selected'}
                        </p>

                        <label className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-school-green cursor-pointer">
                          <Upload size={16} /> Choose file
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFiles((prev) => ({ ...prev, [doc.key]: file }));
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {missingRequiredUploads.length > 0 ? (
                <div className="text-xs text-red-600 font-semibold">
                  Missing required uploads: {missingRequiredUploads.map((m) => m.label).join(', ')}
                </div>
              ) : null}
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
          connect the staff portal to a database so staff can access submissions from any device.
        </p>
      </div>
    </div>
  );
};
