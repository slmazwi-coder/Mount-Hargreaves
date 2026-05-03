import React from 'react';
import { User } from 'lucide-react';

interface StaffMember {
  name: string;
  position: string;
  subject?: string;
  category: string;
  image?: string;
}

const staffData: StaffMember[] = [
  // Leadership
  { name: 'Ms. B. Ngozwana', position: 'Principal', category: 'Leadership', image: './assets/Staff/principal.jpg' },
  { name: 'Mr. M. Leanya', position: 'Deputy Principal', category: 'Leadership', image: './assets/Staff/deputy.jpg' },

  // Departmental Heads
  { name: 'Mrs. N. Mbolekwa', position: 'Head of Department', subject: 'Humanities', category: 'Departmental Heads' },
  { name: 'Mr. A. Venevene', position: 'Head of Department', subject: 'Maths & Science', category: 'Departmental Heads' },
  { name: 'Mr. M. Leanya', position: 'Head of Department', subject: 'Languages', category: 'Departmental Heads', image: './assets/Staff/deputy.jpg' },

  // Class Teachers
  { name: 'Ms. P.E. Chaphi', position: 'Class Teacher — Grade 8A', category: 'Class Teachers' },
  { name: 'Mr. E. Ntloko', position: 'Class Teacher — Grade 8B', category: 'Class Teachers' },
  { name: 'Ms. B. Maqubu', position: 'Class Teacher — Grade 8C', subject: 'IsiXhosa', category: 'Class Teachers', image: './assets/Staff/Ms B Maqubu.jpg' },
  { name: 'Mr. Y.K. Jingxi', position: 'Class Teacher — Grade 9A', subject: 'Agriculture', category: 'Class Teachers', image: './assets/Staff/Mr YK Jingxi.jpg' },
  { name: 'Miss. N. Mdikane', position: 'Class Teacher — Grade 9B', subject: 'English & Xhosa', category: 'Class Teachers', image: './assets/Staff/Ms B Mdikane.jpg' },
  { name: 'Mrs. K.P. Qadi', position: 'Class Teacher — Grade 9C', subject: 'Xhosa', category: 'Class Teachers', image: './assets/Staff/Mrs KP Qadi.jpg' },
  { name: 'Mr. Y. Bhani', position: 'Class Teacher — Grade 10A', subject: 'Geography', category: 'Class Teachers', image: './assets/Staff/Mr Y Bhani.jpg' },
  { name: 'Mr. L. Magadla', position: 'Class Teacher — Grade 10B1', subject: 'Geography', category: 'Class Teachers', image: './assets/Staff/Mr L Magadla.jpg' },
  { name: 'Ms. M.F. Fafudi', position: 'Class Teacher — Grade 10B2', category: 'Class Teachers' },
  { name: 'Mr. M. Mboleni', position: 'Class Teacher — Grade 10C', category: 'Class Teachers' },
  { name: 'Mr. H.M. Senekane', position: 'Class Teacher — Grade 11A', category: 'Class Teachers' },
  { name: 'Ms. V. Mbo', position: 'Class Teacher — Grade 11B', category: 'Class Teachers' },
  { name: 'Mr. P.M. Nkondlo', position: 'Class Teacher — Grade 11C', category: 'Class Teachers' },
  { name: 'Ms. S.E. Meselane', position: 'Class Teacher — Grade 12A', category: 'Class Teachers' },
  { name: 'Mrs. N. Ndlela', position: 'Class Teacher — Grade 12B', subject: 'English', category: 'Class Teachers', image: './assets/Staff/Mrs N Ndlela.jpg' },
  { name: 'Mrs. N.C. Mabindisa', position: 'Class Teacher — Grade 12C', category: 'Class Teachers' },

  // Support Staff
  { name: 'Ms. N.Z. Mteto', position: 'School Administrator', category: 'Support Staff', image: './assets/Staff/Ms NZ Mteto.jpg' },
  { name: 'Mr. D.M. Mfunda', position: 'Security', category: 'Support Staff' },
  { name: 'Ms. T. Sefadi', position: 'Learner Support Agent', category: 'Support Staff' },

  // Hostel Staff
  { name: 'Mr. Lupalule M', position: 'Senior Housekeeping Supervisor', category: 'Hostel Staff', image: './assets/Staff/Mr_M_Lupalule.jpg' },
  { name: 'Ms. Jokozela ZF', position: 'Senior Housekeeping Supervisor', category: 'Hostel Staff', image: './assets/Staff/Ms_ZF_Jokozela.jpg' },
  { name: 'Mrs. Msizi AG', position: 'General Worker', category: 'Hostel Staff', image: './assets/Staff/Mrs AG Msizi.jpg' },
  { name: 'Mrs. Damane N', position: 'General Worker', category: 'Hostel Staff', image: './assets/Staff/Mrs_N_Damane.jpg' },
  { name: 'Miss Tshongwe SM', position: 'Food Aid Service', category: 'Hostel Staff', image: './assets/Staff/Miss SM Tshongwe.jpg' },
  { name: 'Mrs. Skolo NA', position: 'Food Aid Service', category: 'Hostel Staff', image: './assets/Staff/Mrs NA Skolo.jpg' },
  { name: 'Mr. Msizi L', position: 'General Worker', category: 'Hostel Staff', image: './assets/Staff/Mr Le Msizi.jpg' },
  { name: 'Ms. Peane KF', position: 'Hostel Administration Clerk', category: 'Hostel Staff', image: './assets/Staff/Ms KN Pheane.jpg' },
];

const categories = [
  'Leadership',
  'Departmental Heads',
  'Class Teachers',
  'Support Staff',
  'Hostel Staff',
];

const StaffCard = ({ member }: { member: StaffMember }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center p-6 text-center border border-[#dde3f0] hover:-translate-y-1">
    <div className="w-24 h-24 rounded-full bg-[#eef0f7] border-4 border-[#d4d9ec] flex items-center justify-center mb-4 overflow-hidden">
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <User size={40} className="text-[#2a3f7a] opacity-25" />
      )}
    </div>
    <h3 className="text-sm font-bold text-[#0f1f4b] leading-tight">{member.name}</h3>
    <p className="text-xs text-[#c9a84c] font-semibold mt-1">{member.position}</p>
    {member.subject && (
      <span className="mt-2 inline-block bg-[#eef0f7] text-[#0f1f4b] text-xs font-medium px-3 py-1 rounded-full">
        {member.subject}
      </span>
    )}
  </div>
);

export const Staff = () => {
  const [activeCategory, setActiveCategory] = React.useState('Leadership');
  const filtered = staffData.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#f0f2f8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: '#0f1f4b' }}>
            Our Staff
          </h1>
          <div className="w-16 h-1 mx-auto rounded-full mb-4" style={{ background: '#c9a84c' }} />
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            Meet the dedicated team of educators and support staff at Mt Hargreaves Senior Secondary School.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={
                activeCategory === cat
                  ? { background: '#c9a84c', color: '#0f1f4b', borderColor: '#c9a84c' }
                  : { background: '#ffffff', color: '#0f1f4b', borderColor: '#c5cfe0' }
              }
              className="px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:shadow-md"
            >
              {cat}
              <span className="ml-2 text-xs font-bold opacity-60">
                ({staffData.filter(m => m.category === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((member, index) => (
            <StaffCard key={index} member={member} />
          ))}
        </div>

        {/* Photo note */}
        <p className="text-center text-gray-400 text-xs mt-10 italic">
          Staff photos and subject details will be updated progressively.
        </p>
      </div>
    </div>
  );
};
