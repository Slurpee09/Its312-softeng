import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import alumni from "./alumniData";
import englishImg from "../assets/english.jpg";
import bsbaHrmImg from "../assets/bsba-hm.jpg";
import bsbaMMImg from "../assets/bsba.mm.jpg";
import bshmImg from "../assets/bshm.jpg";

const heroImages = {
  "Bachelor of Arts in English Language Studies": englishImg,
  "Bachelor of Science in Business Administration - Human Resource Management": bsbaHrmImg,
  "Bachelor of Science in Business Administration - Marketing Management": bsbaMMImg,
  "Bachelor of Science in Hospitality Management": bshmImg,
};

export default function ProgramAlumni() {
  const location = useLocation();
  const navigate = useNavigate();
  const program = location.state?.program || { name: "Program Not Found", description: "" };

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch (e) {}
  }, []);

  const filtered = alumni.filter((a) => a.program === program.name);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section
        className="relative w-full h-[260px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImages[program.name] || englishImg})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl font-bold text-white">{program.name}</h1>
          <p className="text-white mt-3 max-w-3xl text-center">
            Meet the alumni who graduated from this program — their stories,
            career paths, and how the degree helped them succeed.
            Click a card to learn more about each graduate.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 relative">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Alumni — {program.name.split(" - ")[0]}</h2>
        <div className="w-full flex justify-center items-center mb-4">
          <span className="bg-blue-600 rounded-full p-2 shadow-lg flex items-center justify-center" style={{width:'40px',height:'40px',zIndex:20}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-gray-700">No alumni found for this program.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((a) => (
              <article
                key={a.id}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <div className="text-blue-200 text-4xl mt-4">“</div>

                <p className="italic text-gray-700 mt-4 text-lg leading-relaxed">
                  {a.quote || a.bio}
                </p>

                <div className="mt-6">
                  <div className="font-semibold text-blue-800 text-lg">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.job}{a.business ? `, ${a.business}` : ''} • Class of {a.yearGraduated}</div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/alumni')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Back to Programs
          </button>
        </div>
      </section>
    </main>
  );
}
