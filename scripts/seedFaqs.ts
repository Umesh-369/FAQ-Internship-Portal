import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const FAQ_SEED = [
  // --- About the Internship ---
  { category: "About the Internship",
    question: "What is the Vicharanashala internship?",
    answer: "A two-month internship run by Vicharanashala, a research lab at IIT Ropar. You will work on a real open-source project under a mentor, after a short training phase. The internship is free." },

  { category: "About the Internship",
    question: "What is VINS?",
    answer: "VINS is the Vicharanashala Internship — an online programme open to anyone who clears the interview. Work is real open-source contribution under a mentor. The certificate is from Vicharanashala Lab at IIT Ropar. No stipend, no fee. If you see a yellow VINS panel on your result page, you are selected." },

  { category: "About the Internship",
    question: "What are the phases of VINS and what do the badges mean?",
    answer: "Bronze (Phase 1): short training. Silver (Phase 2): main open-source project work — completing both earns the certificate. Gold (Phase 3): awarded during Silver for standout contributions. Platinum (Phase 4): standing invitation to visit the lab with a travel stipend." },

  { category: "About the Internship",
    question: "Who is the internship for? Are alumni eligible?",
    answer: "The internship is for currently-enrolled students (UG, PG, or doctoral). Candidates who have already graduated and are not currently enrolled are not eligible for this cycle." },

  { category: "About the Internship",
    question: "Is this the same as IIT Ropar's official Summer Research Internship?",
    answer: "No. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by IIT Ropar. Do not represent it as equivalent to IIT Ropar's institutional summer research internship." },

  { category: "About the Internship",
    question: "Can I take leave to attend a class during the internship?",
    answer: "No. Leave is not permitted. If you are attending classes or exams simultaneously, you will be relieved from the internship immediately and must join the next batch." },

  // --- Timing and Dates ---
  { category: "Timing and Dates",
    question: "When can I start the internship?",
    answer: "You can start any time in 2026, but your internship must finish by 31 December 2026. Starting earlier (May–July) gives access to the main cohort, TA support, and orientation. Later starts are possible but the support is thinner." },

  { category: "Timing and Dates",
    question: "How long is the internship?",
    answer: "Two months from your chosen start date, with an optional one-month grace period. The end date must be on or before 31 December 2026." },

  { category: "Timing and Dates",
    question: "Can I start later if I have exams now?",
    answer: "Yes, but only if exams genuinely prevent an earlier start. Wait until exams are done, then opt in. Do not juggle the internship with ongoing exams. Ensure your start + 2 months lands before 31 December 2026." },

  { category: "Timing and Dates",
    question: "Can I start with the cohort and take a break during my exam window?",
    answer: "No. VINS requires full attention — 6 to 10 hours a day. Splitting with exams is not permitted and has been seen to fail consistently. Defer your start to after your exams." },

  // --- NOC ---
  { category: "NOC",
    question: "What dates do I put on the NOC?",
    answer: "Use your chosen start date to start + 2 months (end must be on or before 31 December 2026). If the NOC will be signed later, pick a start date after the signature date." },

  { category: "NOC",
    question: "Who can sign the NOC?",
    answer: "Any authorised signatory at your college: HOD, Acting HOD, Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign." },

  { category: "NOC",
    question: "Is the NOC deadline hard?",
    answer: "No hard cut-off date, but submit as early as possible to join the summer cohort and get the formal offer letter. Late submission means missing cohort benefits." },

  { category: "NOC",
    question: "What format should the NOC use?",
    answer: "Use the printable format provided on your dashboard (Download blank NOC button). Get it physically signed and stamped, scan it, and upload via Upload signed NOC. No need to design it yourself or use college letterhead." },

  { category: "NOC",
    question: "Can my HOD email the NOC instead of signing a printout?",
    answer: "Yes. Download the text NOC from your dashboard, fill in student-side fields, and ask your HOD to forward it from their official institutional email to sudarshan@iitrpr.ac.in with subject: NOC for my student [Your Full Name]. This email forward counts as the signature." },

  { category: "NOC",
    question: "What if my NOC is not formally verified yet?",
    answer: "Upload a self-declaration on your profile and a tentative offer letter will be issued immediately. The formal offer letter follows after NOC clears verification (typically 1 hour to 1 working day)." },

  { category: "NOC",
    question: "My online course (Masai, NPTEL, Coursera) won't issue an NOC. What do I do?",
    answer: "Online-only courses do not make a candidate eligible on their own. If you are concurrently enrolled in a full-time degree programme, obtain the NOC from that college. If your only enrolment is an online course, you are not eligible this cycle." },

  { category: "NOC",
    question: "Can Prof. Sudarshan Iyengar sign my NOC?",
    answer: "No. Your NOC must be signed by the authorised signatory at the institution where you are enrolled — your HOD, Dean, Principal, or T&P Officer. Prof. Iyengar is at IIT Ropar and cannot sign in a personal capacity." },

  // --- Selection & Offer Letter ---
  { category: "Selection & Offer Letter",
    question: "How do I know I am selected?",
    answer: "If you can see your yellow VINS result panel on samagama.in, you are selected. No separate confirmation email is sent." },

  { category: "Selection & Offer Letter",
    question: "How do I opt into VINS?",
    answer: "Tell Yaksha in the chat: 'I want to take up the online internship without stipend.' Yaksha will confirm. Opting in is the selection." },

  { category: "Selection & Offer Letter",
    question: "When do I get the offer letter?",
    answer: "Formal offer letter: issued after your signed NOC is verified AND you have confirmed internship dates on the dashboard. Tentative offer letter: issued immediately on uploading a self-declaration. The letter lives on your dashboard, not in your email — you receive only a notification email." },

  { category: "Selection & Offer Letter",
    question: "How do I accept the offer letter?",
    answer: "Reply to the offer-letter email from no-reply@vicharanashala.ai. Paste exactly: 'I, [Full Name], confirm that I have read, understood, and accepted all terms, conditions, and obligations set out in this offer letter and in the program FAQ at samagama.in. I formally accept the offer of Summer Internship 2026.' Do not paraphrase. Reply within 5 days." },

  { category: "Selection & Offer Letter",
    question: "What if I reply without using the exact acceptance format?",
    answer: "The offer is withdrawn immediately and finally. This is a deliberate attention-to-detail check. If you believe it was a genuine error, send a fresh email to sudarshansudarshan@gmail.com with subject exactly: Request to Reconsider: Confirmation Reply Error." },

  { category: "Selection & Offer Letter",
    question: "Can I change my internship dates after the offer letter is issued?",
    answer: "Yes, but the change must be requested by the official who signed your NOC via email to harshdeep.r@vicharanashala.ai (CC sudarshan@iitrpr.ac.in) with subject: Date change request — [Your Full Name] — Vicharanashala Summership 2026. Students cannot request this directly." },

  { category: "Selection & Offer Letter",
    question: "Can I switch from VINS (online) to VISE (offline)?",
    answer: "No. The two tracks are finalised at the interview stage and candidates cannot be moved between them." },

  // --- Work & Mentorship ---
  { category: "Work & Mentorship",
    question: "What will I work on during the internship?",
    answer: "A real open-source project from Vicharanashala's portfolio — assigned based on your background. Areas include AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure." },

  { category: "Work & Mentorship",
    question: "How many hours per day is the internship?",
    answer: "Plan for 6 to 10 hours a day, sometimes more during the build phase. This is a full-time internship. Most candidates who drop out are juggling something else." },

  { category: "Work & Mentorship",
    question: "Is there a stipend?",
    answer: "No. The internship is unpaid. Stellar performers may receive a discretionary stipend at the lab's option, but this is not promised." },

  { category: "Work & Mentorship",
    question: "Do I need my own laptop?",
    answer: "Yes. A personal laptop is required. Linux or macOS is preferred. Windows users should install WSL or PuTTY for SSH and Unix-style commands." },

  { category: "Work & Mentorship",
    question: "When will my mentor be assigned?",
    answer: "Mentors are not assigned on day 1. You will be assigned a mentor when you move to the project phase (Phase 2), after completing mandatory Bronze coursework." },

  // --- Certificate ---
  { category: "Certificate",
    question: "Will I get a certificate?",
    answer: "Yes — every intern who completes the internship (Bronze + Silver) gets a certificate from Vicharanashala, IIT Ropar. Candidates who drop out mid-way do not receive a certificate." },

  { category: "Certificate",
    question: "Is the certificate a physical copy or e-certificate?",
    answer: "An e-certificate downloaded from your dashboard on samagama.in. No physical copies are mailed. The certificate is digitally signed and verifiable using the number on it." },

  { category: "Certificate",
    question: "Does the certificate specify online or offline completion?",
    answer: "No. The certificate is the same for both tracks and does not specify whether you completed it online or on campus." },

  { category: "Certificate",
    question: "Does Vicharanashala send a grade report to my university?",
    answer: "No. The certificate is what you submit to your college. Whether they accept it and how they translate it into a grade is their decision." },

  // --- Code of Conduct ---
  { category: "Code of Conduct",
    question: "Are unofficial WhatsApp or Telegram groups allowed?",
    answer: "No. All communication must flow through official channels only: Yaksha chat on samagama.in (use #escalate to reach a human) and email from no-reply@vicharanashala.ai. Creating or joining unofficial groups can result in offer withdrawal, removal from the internship, or blacklisting." },

  // --- Rosetta Journal ---
  { category: "Rosetta Journal",
    question: "What is Rosetta?",
    answer: "Rosetta is your 65-day internship journal — one entry per day, kept privately, submitted at the end as a completion requirement. It uses rotating 'thinking routines' (3-2-1, Muddy/Clear, What-So What-Now What) to build structured daily reflection." },

  { category: "Rosetta Journal",
    question: "Can I use AI tools to write my Rosetta journal entries?",
    answer: "No. AI-generated entries will not be counted. The journal must be in your own voice from your actual experience. Journals that read as AI-generated will not be accepted as a completion requirement." },

  { category: "Rosetta Journal",
    question: "What if I miss a Rosetta entry?",
    answer: "Fill it in as soon as you can. Write the actual date you are filling it in, not the missed date. Be honest about writing it late. A late honest entry is always better than no entry." },

  { category: "Rosetta Journal",
    question: "How do I submit Rosetta at the end?",
    answer: "Share your Rosetta Google Doc with the programme coordinator's email (shared during wrap-up week) with Viewer permission. Ensure all 65 entries are filled, your name is in the title, and the cover page is complete." },

  // --- Phase 1 & ViBe Platform ---
  { category: "Phase 1 & ViBe Platform",
    question: "How do I log in to ViBe?",
    answer: "Go to https://vibe.vicharanashala.ai/auth. Sign up as a student with your registered Samagama email. After logging in, check the Notifications tab and accept the course invite." },

  { category: "Phase 1 & ViBe Platform",
    question: "What is Linear Progression on ViBe?",
    answer: "Linear progression means you must complete every video and quiz in exact sequence. You cannot skip ahead. Each item must be completed before the next unlocks." },

  { category: "Phase 1 & ViBe Platform",
    question: "I see a red 'Access Restricted' banner on ViBe. Is this a bug?",
    answer: "No. It appears when you try to open an item before completing all earlier items. ViBe returns you to your last legitimately completed item. Find and complete any missed item in the left panel to clear it." },

  { category: "Phase 1 & ViBe Platform",
    question: "Can I use a mobile or tablet for ViBe?",
    answer: "No. Only desktop or laptop is supported." },

  { category: "Phase 1 & ViBe Platform",
    question: "Are live sessions mandatory?",
    answer: "Yes. Live sessions are mandatory for every intern regardless of path — coursework track, MERN-exempt returning intern, or viva route." },

  { category: "Phase 1 & ViBe Platform",
    question: "Is the ViBe consent form compulsory?",
    answer: "Yes. The consent form is mandatory. ViBe requires webcam and microphone access for proctoring throughout. Without granting access, you cannot proceed with the course." },

  // --- Team Formation ---
  { category: "Team Formation",
    question: "Is team formation compulsory?",
    answer: "Yes. All Phase 2 and Phase 3 projects must be completed in teams of exactly four members from different institutions." },

  { category: "Team Formation",
    question: "What is the team size?",
    answer: "Exactly four members. This is mandatory — you cannot have fewer or more at final formation." },

  { category: "Team Formation",
    question: "Can I form a team with someone from my own college?",
    answer: "No. Teams must consist of members from different institutions to encourage networking. Exception: students from the same institution but different campuses may be allowed." },

  { category: "Team Formation",
    question: "Can I switch teams after assignment?",
    answer: "No. Team switches are not allowed except in exceptional admin-approved cases involving serious concerns." },

  { category: "Team Formation",
    question: "What happens if a team member becomes inactive?",
    answer: "Report the issue to your mentor/scholar early. Prolonged inactivity may lead to administrative intervention." },

  // --- Yaksha Chat ---
  { category: "Yaksha Chat",
    question: "I cannot type in the Yaksha chat after clicking Interact with Yaksha. What should I do?",
    answer: "Scroll up to the top of your window and click the 'Chat with Yaksha' button to activate Yaksha. This will allow you to type and interact properly." },

  // --- Interviews ---
  { category: "Interviews",
    question: "My interview is not marked as complete on the dashboard. What do I do?",
    answer: "This is a known data-sync issue. The team will manually mark it as complete within 1–2 hours. If you don't hear back and it remains incomplete, email sudarshansudarshan@gmail.com." }
];

async function seed() {
  try {
    console.log("Connecting to database...");
    const dbConnect = (await import('../lib/db')).default;
    const Faq = (await import('../models/Faq')).default;
    const { getOrGenerateFaqEmbedding } = await import('../lib/embeddings');

    await dbConnect();
    
    console.log("Clearing existing FAQs...");
    await Faq.deleteMany({});
    
    console.log("Generating embeddings and seeding new FAQs...");
    const faqsWithEmbeddings = [];
    for (let i = 0; i < FAQ_SEED.length; i++) {
      const item = FAQ_SEED[i];
      const { embedding, embeddingHash } = await getOrGenerateFaqEmbedding(item);
      faqsWithEmbeddings.push({
        ...item,
        embedding,
        embeddingHash,
      });
      console.log(`[${i + 1}/${FAQ_SEED.length}] Prepared embedding for: "${item.question.slice(0, 35)}..."`);
    }

    const result = await Faq.insertMany(faqsWithEmbeddings);
    console.log(`🎉 Seeding complete! Successfully seeded ${result.length} FAQs with embeddings.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
