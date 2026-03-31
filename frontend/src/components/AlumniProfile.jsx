import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import alumni from "./alumniData";

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const person = alumni.find((a) => a.id === id);

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch (e) {}
  }, []);

  if (!person) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold mb-4">Alumni Not Found</h1>
        <p className="text-gray-600">We couldn't find that alumni profile.</p>
        <div className="mt-6">
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded">Back</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="w-full h-64 bg-gray-100 overflow-hidden">
          <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-blue-800">{person.name}</h1>
          <div className="text-sm text-gray-600 mt-2 mb-4">{person.program}</div>

          {person.quote && (
            <div className="mb-6">
              <div className="text-xs text-gray-500">Testimonial</div>
              <blockquote className="mt-2 italic text-gray-700 border-l-4 pl-4">“{person.quote}”</blockquote>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500">Year Enrolled</div>
              <div className="font-semibold">{person.yearEnrolled}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Year Graduated</div>
              <div className="font-semibold">{person.yearGraduated}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-gray-500">Current Job / Role</div>
            <div className="font-semibold">{person.job}</div>
          </div>

          {person.business && (
            <div className="mb-6">
              <div className="text-xs text-gray-500">Business</div>
              <div className="font-semibold">{person.business}</div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-2">About</h3>
            <p className="text-gray-700">{person.bio}</p>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded">Back</button>
          </div>
        </div>
      </div>
    </main>
  );
}
