import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brumaImg from "../assets/Bruma.jpg";
import ellenImg from "../assets/ellen.jpg";
import englishImg from "../assets/english.jpg";
import bsbaHrmImg from "../assets/bsba-hm.jpg";
import bsbaMMImg from "../assets/bsba.mm.jpg";
import bshmImg from "../assets/bshm.jpg";

// Map programs to their images
const programImages = {
  "Bachelor of Arts in English Language Studies": englishImg,
  "Bachelor of Science in Business Administration - Human Resource Management": bsbaHrmImg,
  "Bachelor of Science in Business Administration - Marketing Management": bsbaMMImg,
  "Bachelor of Science in Hospitality Management": bshmImg,
};

const programs = [
  {
    name: "Bachelor of Arts in English Language Studies",
    description:
      "The Bachelor of Arts in English Language Studies is a comprehensive program designed to develop advanced proficiency in the English language while fostering critical thinking, effective communication, and cultural awareness. Students will explore the intricacies of linguistics, literature, and language pedagogy, gaining a deep understanding of how language shapes thought, culture, and society. Through rigorous coursework in grammar, syntax, phonetics, and discourse analysis, participants will master both written and spoken English, preparing them for diverse professional roles where clear communication is paramount.\n\nThis program emphasizes real-world application, equipping graduates with skills essential for careers in education, media, publishing, and international business. Students will engage in practical exercises such as creative writing, public speaking, and media analysis, learning to adapt language for various contexts—from academic research to corporate presentations. The curriculum also incorporates cultural studies, enabling students to navigate multicultural environments and contribute meaningfully to global conversations. With the English language serving as the official language of the Philippines and a key tool in international relations, this degree opens doors to opportunities in government, law, journalism, and corporate sectors, where linguistic expertise drives innovation and understanding.",
  },
  {
    name: "Bachelor of Science in Business Administration - Human Resource Management",
    description:
      "The Bachelor of Science in Business Administration with a specialization in Human Resource Management prepares students to become strategic leaders in workforce development and organizational success. This program delves into the core principles of human capital management, covering essential areas such as recruitment, employee relations, performance management, and workplace diversity. Students will learn to design and implement HR policies that align with business objectives, ensuring that organizations attract, retain, and develop top talent in an increasingly competitive market.\n\nThrough a blend of theoretical knowledge and practical application, participants will explore topics like labor laws, compensation strategies, training and development, and conflict resolution. The curriculum emphasizes ethical decision-making and cultural sensitivity, preparing graduates to foster inclusive work environments that promote employee well-being and productivity. In today's dynamic business landscape, where human resources are the backbone of any organization, this degree equips students with the tools to drive organizational change, enhance employee engagement, and contribute to sustainable business growth. Graduates will be well-positioned for roles in HR departments, consulting firms, and management positions across various industries.",
  },
  {
    name: "Bachelor of Science in Business Administration - Marketing Management",
    description:
      "The Bachelor of Science in Business Administration with a focus on Marketing Management equips students with the strategic acumen and creative skills needed to thrive in the fast-paced world of marketing and brand management. This program covers fundamental marketing principles, including market research, consumer behavior, branding, and digital marketing strategies, while also exploring advanced topics like integrated marketing communications and global market expansion. Students will learn to analyze market trends, develop compelling marketing campaigns, and leverage data-driven insights to drive business success.\n\nEmphasizing innovation and adaptability, the curriculum incorporates hands-on projects in social media marketing, content creation, and e-commerce, preparing graduates for the digital age. Participants will gain expertise in areas such as product positioning, pricing strategies, and customer relationship management, enabling them to create value for both businesses and consumers. In an era where technology and consumer preferences evolve rapidly, this degree fosters critical thinking and entrepreneurial spirit, ensuring graduates can navigate challenges like the COVID-19 pandemic's impact on consumer behavior. Career opportunities abound in advertising agencies, corporate marketing departments, and entrepreneurial ventures, where marketing managers play pivotal roles in shaping brand identity and driving revenue growth.",
  },
  {
    name: "Bachelor of Science in Hospitality Management",
    description:
      "The Bachelor of Science in Hospitality Management offers a dynamic education tailored for those passionate about creating exceptional guest experiences in the tourism and hospitality industry. This program provides a comprehensive understanding of hotel operations, restaurant management, event planning, and tourism development, combining theoretical knowledge with practical training to prepare students for leadership roles in world-class establishments. Participants will explore topics such as service excellence, customer service strategies, revenue management, and sustainable tourism practices, learning to balance operational efficiency with guest satisfaction.\n\nWith a focus on real-world application, students will engage in simulations of hotel management, culinary operations, and event coordination, gaining hands-on experience that mirrors industry standards. The curriculum also addresses emerging trends like eco-friendly practices, digital hospitality platforms, and cultural tourism, ensuring graduates are equipped to meet the evolving demands of the global hospitality sector. As the industry rebounds from challenges like the pandemic, with renewed interest in travel and leisure, this degree opens doors to exciting careers in hotels, resorts, cruise lines, and tourism agencies. Graduates will emerge as skilled professionals capable of delivering memorable experiences while driving business success in this vibrant field.",
  },
];

export default function Alumni() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      // ignore in non-browser env
    }
  }, []);

  const handleLearnMore = (program) => {
    const selectedImage = programImages[program.name] || programImages["Bachelor of Arts in English Language Studies"];
    navigate("/program-alumni", {
      state: {
        program: {
          name: program.name,
          description: program.description,
          image: selectedImage,
        },
      },
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-12 text-blue-800">Alumni</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {programs.map((program, index) => (
          <div
            key={index}
            className="group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer h-96 flex flex-col"
            onClick={() => handleLearnMore(program)}
          >
            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
              <img
                src={programImages[program.name] || programImages["Bachelor of Arts in English Language Studies"]}
                alt={program.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div
              className="flex-1 p-6 flex flex-col justify-between relative"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" style="stop-color:rgb(59,130,246);stop-opacity:0.6" /><stop offset="100%25" style="stop-color:rgb(37,99,235);stop-opacity:0.6" /></linearGradient></defs><rect width="400" height="300" fill="url(%23grad)"/></svg>')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"></div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 text-white">{program.name}</h2>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore(program);
                }}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 self-start shadow-lg hover:shadow-blue-500/50 hover:scale-105 relative z-10"
              >
                Alumni
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
