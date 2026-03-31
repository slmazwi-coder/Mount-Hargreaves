import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Image as ImageIcon } from 'lucide-react';
import { getAbout, type AboutInfo } from '../admin/utils/storage';

export const About = () => {
  const [data, setData] = useState<AboutInfo>(getAbout());
  const [campusFailed, setCampusFailed] = useState(false);
  const [principalFailed, setPrincipalFailed] = useState(false);

  // Put your images in:
  // public/assets/about/
  const campusImageUrl = '/assets/about/campus.jpg';
  const principalImageUrl = '/assets/about/principal.jpg';

  useEffect(() => {
    setData(getAbout());
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">About Mount Hargreaves SSS</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-school-green mb-6">Our School</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {data.historyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl"
          >
            {!campusFailed ? (
              <img
                src={campusImageUrl}
                alt="School campus"
                className="w-full h-[260px] sm:h-[340px] object-cover"
                onError={() => setCampusFailed(true)}
              />
            ) : (
              <div className="w-full h-[260px] sm:h-[340px] bg-gradient-to-br from-school-green via-[#0B2A57] to-[#081529] flex items-center justify-center">
                <div className="text-center text-white/70 px-6">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                    <ImageIcon />
                  </div>
                  <div className="font-semibold">Campus image placeholder</div>
                  <div className="text-sm text-white/60">Add <span className="font-mono">public/assets/about/campus.jpg</span></div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <section className="bg-gray-50 rounded-3xl p-6 sm:p-10 md:p-12 mb-16 sm:mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-school-green/10">
            <Quote size={120} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-center">
            <div className="col-span-1">
              <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                {!principalFailed ? (
                  <img
                    src={principalImageUrl}
                    alt="Principal"
                    className="w-full h-full object-cover object-top"
                    onError={() => setPrincipalFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <div className="text-center px-6 text-gray-500">
                      <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        <ImageIcon />
                      </div>
                      <div className="font-semibold">Principal image placeholder</div>
                      <div className="text-sm">Add <span className="font-mono">public/assets/about/principal.jpg</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-school-green">{data.principalName}</h3>
                <p className="text-gray-500">{data.principalTitle}</p>
              </div>
            </div>

            <div className="col-span-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-school-green mb-6 italic">Principal's Message</h2>
              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                {data.principalMessage.map((p, i) => (
                  <p key={i}>"{p}"</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
