import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export const Admissions = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentSurname: '',
    grade: 'Grade 8',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
  });

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
          <div className="w-20 h-20 bg-green-100 text-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to [SCHOOL NAME]. We have received your application and our admissions team will contact you shortly.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-primary w-full"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Admissions Portal</h1>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-school-green p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Apply for 2026 Academic Year</h2>
            <p className="text-green-100">Please fill in the form below accurately. All fields are required.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Student First Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Student Surname</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="Enter surname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Applying for Grade</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none">
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent/Guardian Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Parent Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-school-green/20 outline-none"
                  placeholder="012 345 6789"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Upload size={20} className="text-school-green" /> Required Documents (PDF)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-school-green transition-colors cursor-pointer">
                  <FileText className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Latest Report Card</p>
                  <p className="text-xs text-gray-400">Click to upload PDF</p>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-school-green transition-colors cursor-pointer">
                  <FileText className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Student ID / Birth Certificate</p>
                  <p className="text-xs text-gray-400">Click to upload PDF</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="text-yellow-600 shrink-0" size={20} />
              <p className="text-sm text-yellow-800">
                By submitting this form, you certify that all information provided is true and correct. Incomplete applications will not be processed.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg shadow-lg shadow-green-900/20">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
