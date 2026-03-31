import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Home, FileText, Upload } from 'lucide-react';

export const Boarding = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md"
        >
          <div className="w-20 h-20 bg-blue-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Boarding Application Submitted</h2>
          <p className="text-gray-600 mb-8">Thank you. Your boarding accommodation application has been received.</p>
          <a href="/" className="btn-primary w-full inline-block">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Boarding Accommodation</h1>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-school-green p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Boarding Accommodation Application</h2>
            <p className="text-white/80">Use this form if the learner is applying for a hostel bed.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Learner First Name</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Learner Surname</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Grade</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none">
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Boarding Type</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none">
                  <option>Weekly boarding</option>
                  <option>Full-time boarding</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent/Guardian Name</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent/Guardian Phone</label>
                <input required type="tel" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent/Guardian Email</label>
                <input required type="email" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Home Address</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-school-green" /> Required Documents (PDF)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-school-green transition-colors cursor-pointer">
                  <FileText className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Learner ID / Birth Certificate</p>
                  <p className="text-xs text-gray-400">Click to upload PDF</p>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-school-green transition-colors cursor-pointer">
                  <Home className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Proof of Residence</p>
                  <p className="text-xs text-gray-400">Click to upload PDF</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <p className="text-sm text-yellow-800">
                Submitting this form does not guarantee accommodation. Allocation depends on availability and the school hostel process.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg shadow-lg shadow-blue-900/20">
              Submit Boarding Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
