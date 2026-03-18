import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import englishImg from "../assets/english.jpg";
import artsImg from "../assets/arts.png";
import bsbaHrmImg from "../assets/bsba-hm.jpg";
import bsbaMMImg from "../assets/bsba.mm.jpg";
import bshmImg from "../assets/bshm.jpg";
import hrmImg from "../assets/hrm.png";
import mmImg from "../assets/mm.png";
import hmImg from "../assets/hm.png";

// Map programs to their hero background images
const heroImages = {
  "Bachelor of Arts in English Language Studies": englishImg,
  "Bachelor of Science in Business Administration - Human Resource Management": bsbaHrmImg,
  "Bachelor of Science in Business Administration - Marketing Management": bsbaMMImg,
  "Bachelor of Science in Hospitality Management": bshmImg,
};

// Map programs to their gallery images
const programImages = {
  "Bachelor of Arts in English Language Studies": [artsImg],
  "Bachelor of Science in Business Administration - Human Resource Management": [hrmImg],
  "Bachelor of Science in Business Administration - Marketing Management": [mmImg],
  "Bachelor of Science in Hospitality Management": [hmImg],
};

function DetailedPrograms() {
  const location = useLocation();
  const navigate = useNavigate();
  const program = location.state?.program || {
    name: "Program Not Found",
    description: "",
  };

  // Get hero image for the current program
  const heroImage = heroImages[program.name] || englishImg;

  // Get images for the current program gallery
  const images = programImages[program.name] || [];

  // Scroll to top on component mount
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  // Handle Apply Now button click
  const handleApplyNow = () => {
    navigate("/program-details", {
      state: {
        program: {
          name: program.name,
          description: program.description,
        },
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section
        className="relative w-full h-[300px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl font-bold text-white">
            {program.name}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {/* Overview Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-blue-800 mb-6">Overview</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
            <p className="text-gray-700 text-lg leading-relaxed">
              {program.description}
            </p>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Benefits Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-green-700">Benefits</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">✓</span>
                <span>
                  Comprehensive curriculum designed by industry experts
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">✓</span>
                <span>
                  Hands-on training and practical experience in your field
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">✓</span>
                <span>Network with professionals and peer students</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">✓</span>
                <span>Earn recognized credentials valued by employers</span>
              </li>
            </ul>
          </div>

          {/* Career Opportunities Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-700">
                Career Opportunities
              </h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">→</span>
                <span>Positions in leading organizations and companies</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">→</span>
                <span>
                  Opportunities for career advancement and specialization
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">→</span>
                <span>Competitive salaries and benefits packages</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">→</span>
                <span>
                  Potential for entrepreneurship and independent practice
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Skills You Will Learn */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-6">
            Skills You Will Learn
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Critical thinking and problem-solving",
                "Professional communication and presentation",
                "Leadership and team management",
                "Strategic planning and analysis",
                "Technical expertise in your field",
                "Project management and execution",
                "Research and innovation methodologies",
                "Ethical decision-making and professionalism",
              ].map((skill, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <p className="text-gray-800 font-semibold flex items-center">
                    <span className="text-blue-600 font-bold mr-3">◆</span>
                    {skill}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Take the first step towards your future in {program.name.split(" - ")[0]}
          </p>
          <button
            onClick={handleApplyNow}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Apply Now
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-6">
          <h4 className="font-bold text-yellow-800 mb-2">📋 Before You Apply</h4>
          <p className="text-gray-700">
            Ensure you have all required documents ready, including transcripts, resume, letter of intent, and any other credentials requested. The application process typically takes 20-30 minutes to complete.
          </p>
        </div>
      </section>
    </main>
  );
}

export default DetailedPrograms;
