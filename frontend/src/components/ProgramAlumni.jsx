import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import api from "../api/axios";
import seedAlumni from "./alumniData";
import alumniImg from "../assets/alumni.png";
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

const programDescriptions = {
  "Bachelor of Arts in English Language Studies": "Read how English graduates use communication, writing, and critical thinking to grow in education, media, and leadership roles.",
  "Bachelor of Science in Business Administration - Human Resource Management": "Learn how HR alumni support people, shape workplace culture, and lead talent development in different organizations.",
  "Bachelor of Science in Business Administration - Marketing Management": "See how marketing alumni build brands, plan campaigns, and grow businesses through creative strategy.",
  "Bachelor of Science in Hospitality Management": "Explore how hospitality graduates deliver service excellence and manage operations across hotels, resorts, and events.",
};

function ProgramAlumni() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const getProgramFromLocation = () => {
    const stateProgram = location.state?.program?.name || location.state?.programName;
    const urlProgram = new URLSearchParams(location.search).get("program");
    return stateProgram || urlProgram || "";
  };

  const [selectedProgram, setSelectedProgram] = useState(getProgramFromLocation());
  const [alumniRecords, setAlumniRecords] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);
  const [alumniError, setAlumniError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [hasAcceptedApplication, setHasAcceptedApplication] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [batchForm, setBatchForm] = useState({
    firstName: "",
    lastName: "",
    collegeId: "",
    gender: "",
    programName: getProgramFromLocation(),
    batch: "",
    email: "",
    successStory: "",
    pictureFile: null,
  });
  const [picturePreview, setPicturePreview] = useState("");

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (error) {
      // ignore in non-browser env
    }
  }, []);

  useEffect(() => {
    const incomingProgram = getProgramFromLocation();
    if (incomingProgram) {
      setSelectedProgram(incomingProgram);
      setBatchForm((prev) => ({ ...prev, programName: incomingProgram }));
    }
  }, [location.state, location.search]);

  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  useEffect(() => {
    if (!user) {
      setHasAcceptedApplication(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await api.get("/profile/applications");
        const apps = Array.isArray(res.data) ? res.data : [];
        setHasAcceptedApplication(apps.some((app) => String(app.status || "").toLowerCase() === "accepted"));
      } catch (error) {
        console.error("Failed to fetch user applications:", error);
        setHasAcceptedApplication(false);
      }
    };

    fetchApplications();
  }, [user]);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoadingAlumni(true);
      setAlumniError("");
      try {
        const res = await api.get("/alumni");
        setAlumniRecords(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch alumni list:", error);
        setAlumniError("Unable to load alumni records right now.");
        setAlumniRecords([]);
      } finally {
        setLoadingAlumni(false);
      }
    };

    fetchAlumni();
  }, []);

  useEffect(() => {
    if (!showBatchModal) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showBatchModal]);

  useEffect(() => {
    if (!showSuccessPopup) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showSuccessPopup]);

  useEffect(() => {
    if (!showBatchModal) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowBatchModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showBatchModal]);

  const normalizedAlumni = useMemo(() => {
    const source = alumniRecords.length > 0 ? alumniRecords : seedAlumni;

    return source.map((item) => ({
      id: item.id,
      name: item.full_name || item.name,
      program: item.program_name || item.program || "",
      yearGraduated: item.batch || item.yearGraduated || "",
      job: item.job_title || item.job || "Alumni",
      business: item.company || item.business || null,
      quote: item.success_story || item.quote || item.bio || "",
      image: item.picture || item.image || englishImg,
    }));
  }, [alumniRecords]);

  const programs = useMemo(() => {
    const unique = [];

    normalizedAlumni.forEach((item) => {
      if (!item.program) {
        return;
      }

      if (!unique.some((program) => program.name === item.program)) {
        unique.push({
          name: item.program,
          count: normalizedAlumni.filter((alumnus) => alumnus.program === item.program).length,
          image: heroImages[item.program] || englishImg,
          description: programDescriptions[item.program] || "Explore alumni stories for this bachelor program.",
        });
      }
    });

    return unique;
  }, [normalizedAlumni]);

  const selectedProgramData = programs.find((program) => program.name === selectedProgram);
  const filteredAlumni = selectedProgram
    ? normalizedAlumni.filter((item) => item.program === selectedProgram)
    : [];

  const handleBatchFieldChange = (event) => {
    const { name, value } = event.target;
    setBatchForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
    }

    if (!file) {
      setBatchForm((prev) => ({ ...prev, pictureFile: null }));
      setPicturePreview("");
      return;
    }

    setBatchForm((prev) => ({ ...prev, pictureFile: file }));
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleBatchFormSubmit = async (event) => {
    event.preventDefault();
    setShowBatchModal(false);

    if (!user || !hasAcceptedApplication) {
      return;
    }

    setSubmitting(true);
    setAlumniError("");

    try {
      const fullName = `${batchForm.firstName} ${batchForm.lastName}`.trim();
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("college_id", batchForm.collegeId || "");
      formData.append("gender", batchForm.gender || "");
      formData.append("batch", batchForm.batch || "");
      formData.append("email", batchForm.email || "");
      formData.append("success_story", batchForm.successStory || "");
      formData.append("program_name", batchForm.programName || selectedProgram || "");

      if (batchForm.pictureFile) {
        formData.append("pictureFile", batchForm.pictureFile);
      }

      await api.post("/alumni", formData);

      setBatchForm({
        firstName: "",
        lastName: "",
        collegeId: "",
        gender: "",
        programName: selectedProgram || "",
        batch: "",
        email: "",
        successStory: "",
        pictureFile: null,
      });
      setPicturePreview("");
      setShowBatchModal(false);
      setShowSuccessPopup(true);

      const refreshed = await api.get("/alumni");
      setAlumniRecords(Array.isArray(refreshed.data) ? refreshed.data : []);
      try {
        window.dispatchEvent(new CustomEvent("alumni-updated"));
      } catch (eventError) {
        // ignore cross-component refresh failures
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message || "";
      if (backendMessage === "Only accepted applicants can add alumni") {
        setAlumniError("");
      } else {
        setAlumniError(backendMessage || "Failed to create alumni entry.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {showSuccessPopup && (
        <div
          className="fixed right-5 top-20 z-[70] rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg"
          role="status"
          aria-live="polite"
        >
          Alumni added successfully.
        </div>
      )}

      <section
        className="relative flex h-[320px] w-full items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${alumniImg})` }}
      >
        <div className="absolute inset-0 bg-slate-950/70"></div>
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-300">Program Alumni</p>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {selectedProgramData ? selectedProgramData.name : "Explore Bachelor Alumni Programs"}
          </h1>
          <p className="text-base text-slate-100 md:text-lg">
            {selectedProgramData
              ? programDescriptions[selectedProgramData.name]
              : "Browse the bachelor programs below to explore alumni achievements, success stories, and the impact of each degree program."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {!selectedProgram ? (
          <>
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">All bachelors</p>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Choose a Bachelor Program</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {programs.map((program) => (
                <button
                  key={program.name}
                  type="button"
                  onClick={() =>
                    navigate(`/program-alumni?program=${encodeURIComponent(program.name)}`, {
                      state: { program: { name: program.name } },
                    })
                  }
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    <img
                      src={program.image}
                      alt={program.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Bachelor</p>
                    <h3 className="mb-3 text-xl font-semibold text-slate-900">{program.name}</h3>
                    <p className="mb-5 text-slate-600">{program.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{program.count} graduates</span>
                      <span className="font-semibold text-blue-600">View alumni →</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Graduates</p>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">{selectedProgramData?.name}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                This section highlights the alumni from this program, along with the roles they hold and the stories that show how their degree helped shape their careers.
              </p>
            </div>

            <div className="mb-10 flex justify-center">
              <button
                type="button"
                disabled={!user || !hasAcceptedApplication}
                title={!user ? "Login to join alumni" : !hasAcceptedApplication ? "Only accepted applicants can join alumni" : "Join alumni"}
                onClick={() => {
                  if (user && hasAcceptedApplication) {
                    setShowBatchModal(true);
                  }
                }}
                className={`flex w-full max-w-3xl items-center justify-center gap-4 rounded-full border border-slate-200 bg-white px-6 py-4 shadow-sm transition ${!user || !hasAcceptedApplication ? "cursor-not-allowed opacity-60 hover:border-slate-200" : "hover:border-blue-300"}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white" aria-hidden="true">
                  +
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-600">Join Alumni</p>
                  <p className="text-xl font-semibold text-slate-900">Add your alumni profile</p>
                </div>
              </button>
            </div>

            {showBatchModal && (
              <div
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/35 px-4 py-4 backdrop-blur-[1px] md:py-8"
                onClick={() => setShowBatchModal(false)}
              >
                <div
                  className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-7 shadow-2xl md:my-8 md:max-h-[calc(100vh-4rem)] md:p-8"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Join Alumni</p>
                      <h2 className="text-2xl font-bold text-slate-900">Join Alumni</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBatchModal(false)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl leading-none text-slate-500 transition hover:bg-slate-200"
                      aria-label="Close modal"
                    >
                      <span className="-mt-1">&times;</span>
                    </button>
                  </div>

                  <form className="space-y-5" onSubmit={handleBatchFormSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">First name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={batchForm.firstName}
                          onChange={handleBatchFieldChange}
                          placeholder="Enter your first name"
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Last name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={batchForm.lastName}
                          onChange={handleBatchFieldChange}
                          placeholder="Enter your last name"
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">College ID</label>
                        <input
                          type="text"
                          name="collegeId"
                          value={batchForm.collegeId}
                          onChange={handleBatchFieldChange}
                          placeholder="Enter your college ID"
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Bachelor program</label>
                        <select
                          name="programName"
                          value={batchForm.programName}
                          onChange={handleBatchFieldChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select bachelor program</option>
                          {Object.keys(programDescriptions).map((program) => (
                            <option key={program} value={program}>
                              {program}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                        <select
                          name="gender"
                          value={batchForm.gender}
                          onChange={handleBatchFieldChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Batch</label>
                        <input
                          type="text"
                          name="batch"
                          value={batchForm.batch}
                          onChange={handleBatchFieldChange}
                          placeholder="Enter batch"
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={batchForm.email}
                          onChange={handleBatchFieldChange}
                          placeholder="Enter your email"
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePictureChange}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                        {picturePreview && (
                          <img
                            src={picturePreview}
                            alt="Selected alumni preview"
                            className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Success story</label>
                      <textarea
                        name="successStory"
                        value={batchForm.successStory}
                        onChange={handleBatchFieldChange}
                        placeholder="Write your success story"
                        className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowBatchModal(false)}
                        className="rounded-full border border-slate-300 bg-white px-8 py-3 text-lg font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-green-500 px-8 py-3 text-lg font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submitting ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {alumniError && <p className="mb-6 text-sm text-red-600">{alumniError}</p>}
            {loadingAlumni && <p className="mb-6 text-sm text-slate-500">Loading alumni...</p>}

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Success story</p>
                <h3 className="mb-4 text-2xl font-semibold text-slate-900">Why Alumni Success Matters</h3>
                <p className="leading-relaxed text-slate-600">
                  Our {selectedProgramData?.name} alumni show how the program prepares graduates for real-world growth. Their journeys reflect discipline, practical skills, leadership, and a commitment to lifelong learning.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredAlumni.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-700 shadow-lg md:col-span-2">
                  No graduates are available for this program yet.
                </div>
              ) : (
                filteredAlumni.map((alumnus) => (
                  <article key={alumnus.id} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                    <div className="flex items-start gap-4">
                      <img
                        src={alumnus.image}
                        alt={alumnus.name}
                        className="h-20 w-20 rounded-3xl border border-slate-200 object-cover"
                      />
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{alumnus.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {alumnus.job}
                          {alumnus.business ? `, ${alumnus.business}` : ""}
                          {alumnus.yearGraduated ? ` • Class of ${alumnus.yearGraduated}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-3xl bg-blue-50 p-6">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Success line</p>
                      <p className="leading-relaxed text-slate-700">{alumnus.quote}</p>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <button
                type="button"
                onClick={() => setSelectedProgram("")}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Back to Bachelor List
              </button>
              <button
                type="button"
                onClick={() => navigate("/alumni")}
                className="rounded-full bg-blue-600 px-6 py-3 text-white shadow hover:bg-blue-700"
              >
                Back to Alumni Home
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default ProgramAlumni;
