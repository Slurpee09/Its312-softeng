import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import groupImg from "../assets/groupic.jpg";

export default function Alumni() {
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden">
        <img
          src={groupImg}
          alt="Alumni network hero"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-slate-950/70"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
          <p className="text-sm md:text-base lg:text-lg uppercase tracking-[0.35em] md:tracking-[0.45em] text-cyan-300 mb-5">
            ETEEAP Alumni
          </p>
          <h1 className="max-w-4xl text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] md:leading-[0.98] mb-6 md:mb-8">
            Welcome To official Alumni of ETEEAP Graduates
          </h1>
          <p className="mx-auto max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl text-slate-200">
            Connect with fellow graduates and stay engaged with the alumni community.
          </p>

          <div className="mt-10 md:mt-12 flex justify-center">
            <Link
              to="/program-alumni"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 md:px-10 md:py-4 text-sm sm:text-base md:text-lg font-semibold text-white shadow-xl transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              View Graduates
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
