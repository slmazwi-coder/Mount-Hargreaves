import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, TrendingUp, BarChart3, Medal, Calendar, User, Award } from 'lucide-react';
import { getHallOfFame, getResultsByYear, type HallOfFameEntry, type YearResults } from '../admin/utils/storage';

const resultsData = {
  "2025": {
    overall: 89.9,
    bachelor: 206,
    bachelorRate: 71.8,
    distinctions: 451,
    wrote: 287,
    subjects: [
      { subject: "Accounting", rate: 90.6 },
      { subject: "Agricultural Sciences", rate: 97.9 },
      { subject: "Business Studies", rate: 98.1 },
      { subject: "Economics", rate: 96.2 },
      { subject: "English FAL", rate: 100 },
      { subject: "Geography", rate: 99.3 },
      { subject: "IsiXhosa HL", rate: 100 },
      { subject: "History", rate: 97.9 },
      { subject: "Life Orientation", rate: 100 },
      { subject: "Life Sciences", rate: 97 },
      { subject: "Mathematics", rate: 71.1 },
      { subject: "Physical Sciences", rate: 82.1 },
    ]
  },
  "2024": {
    overall: 85.4,
    bachelor: 195,
    bachelorRate: 68.2,
    distinctions: 398,
    wrote: 286,
    subjects: [
      { subject: "Accounting", rate: 88.5 },
      { subject: "Agricultural Sciences", rate: 95.0 },
      { subject: "Business Studies", rate: 94.2 },
      { subject: "Economics", rate: 92.1 },
      { subject: "English FAL", rate: 98.4 },
      { subject: "Geography", rate: 96.0 },
      { subject: "IsiXhosa HL", rate: 99.1 },
      { subject: "History", rate: 95.5 },
      { subject: "Life Orientation", rate: 100 },
      { subject: "Life Sciences", rate: 94.2 },
      { subject: "Mathematics", rate: 68.5 },
      { subject: "Physical Sciences", rate: 79.0 },
    ]
  },
  "2023": {
    overall: 82.1,
    bachelor: 178,
    bachelorRate: 64.5,
    distinctions: 345,
    wrote: 276,
    subjects: [
      { subject: "Accounting", rate: 85.0 },
      { subject: "Agricultural Sciences", rate: 92.5 },
      { subject: "Business Studies", rate: 91.0 },
      { subject: "Economics", rate: 89.5 },
      { subject: "English FAL", rate: 97.0 },
      { subject: "Geography", rate: 93.5 },
      { subject: "IsiXhosa HL", rate: 98.5 },
      { subject: "History", rate: 94.0 },
      { subject: "Life Orientation", rate: 100 },
      { subject: "Life Sciences", rate: 91.5 },
      { subject: "Mathematics", rate: 65.0 },
      { subject: "Physical Sciences", rate: 75.5 },
    ]
  }
} as const;

const bestEverStudents = [
  { name: "[NAME 1]", title: "National Top Achiever", year: "2018", image: "https://images.unsplash.com/photo-1523240695661-92135f3d325e?q=80&w=2000&auto=format&fit=crop", desc: "Achieved excellence in Mathematics and Physical Sciences" },
  { name: "[NAME 2]", title: "Provincial Number 1", year: "2021", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2000&auto=format&fit=crop", desc: "7 Distinctions, top student in Province" },
  { name: "[NAME 3]", title: "Top Achiever in Commerce", year: "2019", image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2000&auto=format&fit=crop", desc: "Excellence in Accounting and Economics" },
  { name: "[NAME 4]", title: "Overall Distinction", year: "2022", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2000&auto=format&fit=crop", desc: "8 Distinctions with 95% average" },
  { name: "[NAME 5]", title: "Provincial Top 5", year: "2016", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2000&auto=format&fit=crop", desc: "Exceptional performance in Sciences" },
];

const topAchieversByYear: Record<string, {name: string, achievement: string, image: string}[]> = {
  "2025": [
    { name: "Top Achiever 1", achievement: "7 Distinctions", image: "/Achievements/HALL%20OF%20FAME/2025/Achievers%205.jpg" },
    { name: "Top Achiever 2", achievement: "6 Distinctions", image: "/Achievements/HALL%20OF%20FAME/2025/achievers%203.jpg" },
    { name: "Top Achiever 3", achievement: "Top in Math", image: "/Achievements/HALL%20OF%20FAME/2025/achievers%204.jpg" },
  ],
  "2024": [
    { name: "Top Achiever 1", achievement: "Overall Best", image: "/Achievements/HALL%20OF%20FAME/2024/1.jpg" },
  ],
  "2023": [
    { name: "Top Achiever 1", achievement: "7 Distinctions", image: "/Achievements/HALL%20OF%20FAME/2023/1.jpg" },
    { name: "Top Achiever 2", achievement: "Top in Physics", image: "/Achievements/HALL%20OF%20FAME/2023/2.jpg" },
    { name: "Top Achiever 3", achievement: "Top in English", image: "/Achievements/HALL%20OF%20FAME/2023/3.jpg" },
  ],
};

// Initialize other years with empty image arrays
for (let year = 2015; year <= 2022; year++) {
  if (!topAchieversByYear[year]) {
    topAchieversByYear[year.toString()] = [
      { name: "Outstanding Student", achievement: "Top Performer", image: "" },
    ];
  }
}

const StudentAvatar = ({ image, name, title, year }: { image: string, name: string, title?: string, year: string }) => {
  const [hasError, setHasError] = useState(!image);

  return (
    <div className="aspect-[3/4] sm:aspect-square w-full relative overflow-hidden bg-gray-100 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center group">
      {!hasError ? (
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
          <User size={64} className="mb-4 opacity-30" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">{name}</p>
          <p className="text-xs text-gray-400 italic">Class of {year}</p>
        </div>
      )}
      <div className="absolute top-0 right-0 bg-school-green/10 p-4 text-school-green opacity-0 group-hover:opacity-100 transition-opacity">
        <Award size={24} />
      </div>
    </div>
  );
};

export const Achievements = () => {
  const [activeResultsYear, setActiveResultsYear] = useState<"2025"|"2024"|"2023">("2025");
  const [activeAchieversYear, setActiveAchieversYear] = useState<string>("2025");
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>(getHallOfFame());
  const [currentResults, setCurrentResults] = useState<YearResults | null>(getResultsByYear(activeResultsYear));

  useEffect(() => {
    setHallOfFame(getHallOfFame());
  }, []);

  useEffect(() => {
    setCurrentResults(getResultsByYear(activeResultsYear));
  }, [activeResultsYear]);

  // Group hall of fame by year for the tabs
  const achieversByYear: Record<string, HallOfFameEntry[]> = {};
  hallOfFame.forEach(entry => {
    if (!achieversByYear[entry.year]) achieversByYear[entry.year] = [];
    achieversByYear[entry.year].push(entry);
  });

  const yearsList = Object.keys(achieversByYear).sort((a,b) => parseInt(b) - parseInt(a));
  
  if (yearsList.length > 0 && !yearsList.includes(activeAchieversYear)) {
    setActiveAchieversYear(yearsList[0]);
  }

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title text-center mb-16">Academic Excellence</h1>

        {/* --- HISTORIC MILESTONE SECTION --- */}
        <section className="mb-24">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Star size={200} className="text-yellow-600" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-40 h-40 bg-yellow-400 rounded-full flex flex-col items-center justify-center text-yellow-900 border-8 border-white shadow-lg shrink-0">
                <span className="text-4xl font-black">95.4%</span>
                <span className="text-sm font-bold uppercase tracking-tighter italic">Pass Rate</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-yellow-700 font-bold uppercase tracking-widest text-sm mb-2">
                  <Star size={16} fill="currentColor" /> Highest Historic Achievement <Star size={16} fill="currentColor" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-school-green mb-4">
                  2019: A Year of Unparalleled Excellence
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl italic leading-relaxed">
                  "In 2019, [SCHOOL NAME] reached a historic peak, recording a monumental 95.4% pass rate. This achievement remains a testament to the dedication of our students and the excellence of our academic tradition."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- HALL OF FAME: 5 BEST EVER --- */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-school-green mb-4 flex items-center justify-center gap-4">
              <Trophy className="text-yellow-500 w-12 h-12" />
              Hall of Fame
              <Trophy className="text-yellow-500 w-12 h-12" />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Celebrating our 5 best ever students recorded who have left an indelible mark on [SCHOOL NAME] history.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {bestEverStudents.map((student, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full md:w-[280px] border border-gray-100"
              >
                <StudentAvatar 
                  image={student.image} 
                  name={student.name} 
                  year={student.year} 
                  title={student.title}
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                  <div className="text-school-green text-sm font-bold mb-3 flex items-center justify-center gap-1">
                    <Medal size={16} /> {student.title}
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{student.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* --- MATRIC RESULTS BY YEAR --- */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-school-green flex items-center gap-3">
              <BarChart3 className="text-school-green" /> Matric Results Summary
            </h2>
            <div className="flex gap-2 mt-4 md:mt-0 bg-gray-100 p-1 rounded-xl">
              {(["2025", "2024", "2023"] as const).map(year => (
                <button
                  key={year}
                  onClick={() => setActiveResultsYear(year)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${activeResultsYear === year ? 'bg-school-green text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeResultsYear}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!currentResults ? (
                <div className="text-center py-24 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                   <p className="text-xl font-bold mb-2">Notice</p>
                   <p>No results data recorded for the year {activeResultsYear}.</p>
                </div>
              ) : (
                <>
                  <div className="bg-school-green rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                      <TrendingUp size={200} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Star className="text-yellow-400" /> {activeResultsYear} Performance Overview
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-4xl md:text-5xl font-bold mb-2">{currentResults.overall}%</p>
                          <p className="text-green-100 text-sm font-medium">Overall Pass Rate</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-4xl md:text-5xl font-bold mb-2">{currentResults.bachelor}</p>
                          <p className="text-green-100 text-sm font-medium">Bachelor Passes ({currentResults.bachelorRate}%)</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-4xl md:text-5xl font-bold mb-2">{currentResults.distinctions}</p>
                          <p className="text-green-100 text-sm font-medium">Total Distinctions</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 text-center md:text-left">
                          <p className="text-4xl md:text-5xl font-bold mb-2">{currentResults.wrote}</p>
                          <p className="text-green-100 text-sm font-medium">Learners Wrote</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-8">{activeResultsYear} Subject Pass Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentResults.subjects.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-700">{stat.subject}</span>
                            <span className="text-school-green font-bold">{stat.rate}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.rate}%` }}
                              transition={{ duration: 1, delay: i * 0.05 }}
                              className="bg-school-green h-2 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>


        {/* --- TOP ACHIEVERS PER YEAR —-- */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-school-green flex items-center justify-center gap-3 mb-4">
              <Calendar className="text-school-green" /> Top Achievers Timeline
            </h2>
            <p className="text-gray-600 italic">Select a year to see the class achievers.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {yearsList.map(year => (
              <button
                key={year}
                onClick={() => setActiveAchieversYear(year)}
                className={`px-5 py-2 rounded-full font-bold transition-all text-sm ${
                  activeAchieversYear === year 
                    ? 'bg-school-green text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-school-green hover:text-school-green'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeAchieversYear}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {achieversByYear[activeAchieversYear] && achieversByYear[activeAchieversYear].length > 0 ? (
                achieversByYear[activeAchieversYear].map((person, i) => (
                  <div key={i} className="text-center">
                    <StudentAvatar 
                      image={person.image} 
                      name={person.name} 
                      year={activeAchieversYear} 
                      title={person.title}
                    />
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                      <p className="text-xs font-semibold text-school-green uppercase tracking-wider">{person.title}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <p>No achiever records found for {activeAchieversYear}.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
};
