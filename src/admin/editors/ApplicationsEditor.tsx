import React, { useState } from 'react';
import { getApplications, setApplications, type Application } from '../utils/storage';
import { generateApplicationPDF } from '../utils/generatePDF';
import { Download, ChevronDown, Search, User } from 'lucide-react';

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-600',
  'Reviewed': 'bg-blue-600',
  'Accepted': 'bg-green-600',
  'Rejected': 'bg-red-600',
};

export const ApplicationsEditor = () => {
  const [apps, setApps] = useState<Application[]>(getApplications());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = apps.filter(a =>
    (!statusFilter || a.status === statusFilter) &&
    (!search || `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = (id: string, status: Application['status']) => {
    const updated = apps.map(a => a.id === id ? { ...a, status } : a);
    setApplications(updated);
    setApps(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Student Applications</h1>
        <span className="text-gray-400 text-sm">{apps.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-grow max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <User size={48} className="mx-auto mb-4 opacity-30" />
          <p>{apps.length === 0 ? 'No applications received yet.' : 'No applications match your filters.'}</p>
          {apps.length === 0 && <p className="text-xs mt-2">Applications submitted via the Admissions page will appear here.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-700/50"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white">{app.firstName} {app.lastName}</p>
                  <p className="text-xs text-gray-400">{app.grade} • Submitted: {app.submittedDate}</p>
                </div>
                <span className={`${statusColors[app.status]} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {app.status}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} />
              </div>

              {expanded === app.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="text-gray-400">Date of Birth:</span> <span className="text-white ml-2">{app.dob}</span></div>
                    <div><span className="text-gray-400">Previous School:</span> <span className="text-white ml-2">{app.previousSchool}</span></div>
                    <div><span className="text-gray-400">Guardian:</span> <span className="text-white ml-2">{app.guardianName}</span></div>
                    <div><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{app.guardianPhone}</span></div>
                    <div><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{app.guardianEmail}</span></div>
                    <div><span className="text-gray-400">Address:</span> <span className="text-white ml-2">{app.address}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value as Application['status'])}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => generateApplicationPDF(app)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
