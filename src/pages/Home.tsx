import React from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, Users } from 'lucide-react';

const stats = [
  { label: 'Matric Pass Rate', value: '89.9%', icon: TrendingUp },
  { label: 'Bachelors Pass', value: '71.8%', icon: Award },
  { label: 'Subject Distinctions', value: '451', icon: Users },
];

export const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Stats Quick View */}
      <section className="py-12 bg-gray-50 -mt-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-6 border-b-4 border-school-green"
            >
              <div className="p-4 bg-green-50 rounded-xl text-school-green">
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="section-title">Our Vision</h2>
          <p className="text-2xl text-gray-700 leading-relaxed font-light italic">
            "A world-class institution that competes in producing holistic and well-equipped citizens, who positively change the world."
          </p>
        </div>
      </section>
    </div>
  );
};
