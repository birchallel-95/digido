import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Framework definition: 6 Jisc-aligned capability areas x 3 levels.
// ---------------------------------------------------------------------------

const LEVELS = [
  {
    name: "Navigator",
    tagline: "Finding the way",
    description:
      "Learning the essentials, finding the right tools, and gaining confidence in digital environments.",
    order: 0,
  },
  {
    name: "Elevator",
    tagline: "Lifting the standard",
    description:
      "Raising personal and team efficiency, deepening expertise, and optimising workflows.",
    order: 1,
  },
  {
    name: "Catalyst",
    tagline: "Changing the game",
    description: "Driving innovation, shaping digital culture, and leading strategic change.",
    order: 2,
  },
] as const;

const AREAS = [
  {
    key: "proficiency",
    name: "Digital Proficiency and Productivity",
    shortName: "Proficiency",
    description:
      "Working confidently and efficiently in everyday digital tools — from files and email to scheduling and automation.",
    color: "#2563EB",
    icon: "gauge",
  },
  {
    key: "literacy",
    name: "Information, Data, and Media Literacies",
    shortName: "Info & Data",
    description:
      "Finding, evaluating and using information, data and media critically, safely and effectively.",
    color: "#0891B2",
    icon: "search",
  },
  {
    key: "creation",
    name: "Digital Creation, Problem-Solving, and Innovation",
    shortName: "Creation",
    description:
      "Building digital resources and solutions that solve real problems — from a simple form to an interactive tool.",
    color: "#7C3AED",
    icon: "wand-2",
  },
  {
    key: "communication",
    name: "Digital Communication, Collaboration, and Participation",
    shortName: "Communication",
    description:
      "Communicating clearly, collaborating well, and participating confidently across digital channels.",
    color: "#DB2777",
    icon: "messages-square",
  },
  {
    key: "learning",
    name: "Digital Learning and Development",
    shortName: "Learning",
    description:
      "Growing your own digital capability continuously, and helping colleagues do the same.",
    color: "#EA580C",
    icon: "graduation-cap",
  },
  {
    key: "identity",
    name: "Digital Identity and Wellbeing",
    shortName: "Identity",
    description:
      "Managing your professional digital identity, security and wellbeing sustainably.",
    color: "#16A34A",
    icon: "heart-handshake",
  },
] as const;

type AreaKey = (typeof AREAS)[number]["key"];
type LevelName = (typeof LEVELS)[number]["name"];

interface SkillSeed {
  title: string;
  description: string;
  practicalOutcome: string;
  whyItMatters: string;
  benefitCategories: string[];
  tool: string;
  estimatedTimeMins: number;
  evidencePrompt?: string;
}

// Representative skills per area/level, written in the college's Google
// Workspace context per the brief. Administrators can add/edit/import many
// more via the admin console — this seed is a realistic starting set, not a
// literal transcription of the full spreadsheet.
const SKILLS: Record<AreaKey, Record<LevelName, SkillSeed[]>> = {
  proficiency: {
    Navigator: [
      {
        title: "Sign in securely with single sign-on",
        description:
          "Log into Chromebooks and Google Workspace using single sign-on (SSO) confidently and securely.",
        practicalOutcome:
          "Get straight into your working day without repeated password prompts, while keeping your account secure.",
        whyItMatters:
          "Secure, smooth sign-in reduces daily friction and protects both your account and college data.",
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "Google Workspace SSO",
        estimatedTimeMins: 10,
      },
      {
        title: "Organise files in Google Drive",
        description: "Create clear folders and subfolders in Google Drive so files are easy to find.",
        practicalOutcome: "Spend less time hunting for documents and more time on the work that matters.",
        whyItMatters: "A tidy Drive structure saves everyone time, especially when sharing with colleagues.",
        benefitCategories: ["ORGANISATION", "TIME_SAVING", "PRODUCTIVITY"],
        tool: "Google Drive",
        estimatedTimeMins: 15,
      },
      {
        title: "Format documents clearly in Google Docs",
        description: "Use headings, bullet points and consistent formatting to structure Google Docs.",
        practicalOutcome: "Produce documents that are easier for colleagues and students to read and navigate.",
        whyItMatters: "Clear structure improves accessibility and the professionalism of everyday documents.",
        benefitCategories: ["ACCESSIBILITY", "PROFESSIONAL_PRACTICE"],
        tool: "Google Docs",
        estimatedTimeMins: 15,
      },
      {
        title: "Manage tabs and bookmarks in Chrome",
        description: "Navigate the Chrome browser confidently, manage multiple tabs and save bookmarks.",
        practicalOutcome: "Move between resources quickly without losing track of what you were doing.",
        whyItMatters: "Confident browser use is the foundation for everything else you do online.",
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "Chrome",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Use Google Calendar's advanced scheduling tools",
        description: "Use Appointment Slots, Out of Office settings and time-blocking in Google Calendar.",
        practicalOutcome:
          "Let colleagues and students book time with you automatically, and protect focused work time.",
        whyItMatters: "Automated scheduling removes back-and-forth emails and protects time for deep work.",
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY", "DIGITAL_WELLBEING"],
        tool: "Google Calendar",
        estimatedTimeMins: 20,
      },
      {
        title: "Streamline Gmail with filters and templates",
        description: "Use filters, labels, priority inbox and canned templates to manage email efficiently.",
        practicalOutcome: "Cut down time spent triaging email and respond to routine messages in seconds.",
        whyItMatters: "A well-organised inbox reduces workload and prevents important messages getting lost.",
        benefitCategories: ["WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "Gmail",
        estimatedTimeMins: 25,
      },
      {
        title: "Analyse data with Pivot Tables in Sheets",
        description: "Use Pivot Tables, charts and conditional formatting to analyse trends in Google Sheets.",
        practicalOutcome: "Turn raw data into clear insights you can act on or share with your team.",
        whyItMatters: "Being able to interpret data quickly supports better-informed decisions.",
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Google Sheets",
        estimatedTimeMins: 30,
      },
      {
        title: "Apply Chrome extensions to optimise workflow",
        description: "Select and configure Chrome extensions that streamline daily administrative tasks.",
        practicalOutcome: "Automate small repetitive tasks so you have more time for teaching and student support.",
        whyItMatters: "Small workflow tweaks compound into significant time savings over a year.",
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING", "INNOVATION"],
        tool: "Chrome extensions",
        estimatedTimeMins: 20,
      },
    ],
    Catalyst: [
      {
        title: "Model advanced Workspace shortcuts for the team",
        description: "Demonstrate advanced time-saving shortcuts and Google Workspace tricks to colleagues.",
        practicalOutcome: "Lift the whole team's productivity by spreading practical time-saving techniques.",
        whyItMatters: "Peer-led tips are often more memorable and relevant than generic training.",
        benefitCategories: ["LEADERSHIP", "PRODUCTIVITY", "COLLABORATION"],
        tool: "Google Workspace",
        estimatedTimeMins: 30,
      },
      {
        title: "Build a team dashboard in Sheets or Looker Studio",
        description: "Build a multi-tab Sheets or Looker Studio dashboard that the team uses for daily insight.",
        practicalOutcome: "Give your team a single, live view of the metrics that matter, without manual reporting.",
        whyItMatters: "Shared dashboards replace repetitive manual reporting with reusable infrastructure.",
        benefitCategories: ["INNOVATION", "ORGANISATION", "TIME_SAVING"],
        tool: "Looker Studio",
        estimatedTimeMins: 60,
      },
      {
        title: "Create shared template folders colleagues adopt",
        description: "Build structured, shared template folders in Drive that colleagues voluntarily adopt.",
        practicalOutcome: "Standardise good practice across the team without mandating it top-down.",
        whyItMatters:
          "Templates that genuinely save people time spread organically and raise the baseline for everyone.",
        benefitCategories: ["LEADERSHIP", "ORGANISATION", "COLLABORATION"],
        tool: "Google Drive",
        estimatedTimeMins: 45,
      },
      {
        title: "Automate a team task list with AppSheet",
        description: "Build a simple AppSheet app or Workspace add-on to automate a repetitive task list.",
        practicalOutcome: "Replace a manual, error-prone process with a small custom tool the team can rely on.",
        whyItMatters: "Light-touch automation can remove hours of repetitive admin from a team's week.",
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "AppSheet",
        estimatedTimeMins: 60,
      },
    ],
  },
  literacy: {
    Navigator: [
      {
        title: "Search effectively for reliable sources",
        description: "Use keyword searches to find reliable online resources, images or documents.",
        practicalOutcome: "Find trustworthy material quickly instead of wading through irrelevant results.",
        whyItMatters: "Strong search skills underpin almost every other digital task.",
        benefitCategories: ["PRODUCTIVITY", "PROFESSIONAL_PRACTICE"],
        tool: "Web search",
        estimatedTimeMins: 10,
      },
      {
        title: "Spot phishing and unreliable sources",
        description: "Identify suspicious emails (phishing) and evaluate the reliability of online sources.",
        practicalOutcome: "Protect yourself and the college from scams while helping others spot red flags.",
        whyItMatters: "Basic scepticism and verification habits are a frontline defence against cyber threats.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "ORGANISATION"],
        tool: "Gmail / browser",
        estimatedTimeMins: 15,
      },
      {
        title: "Filter and sort data in Sheets",
        description: "Filter basic data lists and sort columns in Google Sheets to find what you need.",
        practicalOutcome: "Quickly locate the exact information you need within a larger spreadsheet.",
        whyItMatters: "Being able to interrogate a spreadsheet, not just read it, saves real time.",
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Google Sheets",
        estimatedTimeMins: 15,
      },
      {
        title: "Reference sources appropriately",
        description: "Cite or reference external sources appropriately when creating teaching or admin materials.",
        practicalOutcome: "Produce materials that model good academic practice and respect copyright.",
        whyItMatters: "Modelling correct referencing sets the standard learners are expected to follow.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Docs / Slides",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Evaluate the credibility of AI-generated content",
        description:
          "Evaluate the accuracy and credibility of online information, research, and AI-generated content.",
        practicalOutcome:
          "Use AI tools with confidence, while catching inaccurate or biased output before it reaches learners.",
        whyItMatters: "AI tools are powerful but fallible — critical evaluation prevents misinformation spreading.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 20,
      },
      {
        title: "Extract insight from documents with Gemini",
        description:
          "Use Gemini to extract text, key insights and structured data from PDFs, CSVs, images or audio transcripts.",
        practicalOutcome: "Turn a pile of source documents into a usable summary in minutes, not hours.",
        whyItMatters:
          "This single skill can remove hours of manual reading and re-typing from admin-heavy weeks.",
        benefitCategories: ["TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Gemini",
        estimatedTimeMins: 20,
      },
      {
        title: "Clean and import external data into Sheets",
        description: "Clean and import external raw data (e.g. CSV exports) into Google Sheets.",
        practicalOutcome: "Get messy exported data into a usable, analysable format reliably.",
        whyItMatters:
          "Most 'real world' data needs cleaning before it is useful — this unlocks everything else in Sheets.",
        benefitCategories: ["ORGANISATION", "PRODUCTIVITY"],
        tool: "Google Sheets",
        estimatedTimeMins: 25,
      },
      {
        title: "Apply Creative Commons licensing correctly",
        description: "Apply Creative Commons licenses correctly when re-using external images or media.",
        practicalOutcome: "Use rich media in your materials confidently, without copyright risk to the college.",
        whyItMatters: "Correct licensing protects the college and models good digital citizenship.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Creative Commons",
        estimatedTimeMins: 15,
      },
    ],
    Catalyst: [
      {
        title: "Guide colleagues on evaluating AI and online sources",
        description:
          "Guide colleagues on how to write effective search queries and evaluate the credibility of online or AI sources.",
        practicalOutcome: "Raise the whole team's information literacy, not just your own.",
        whyItMatters: "A team that can critically evaluate sources produces more reliable teaching materials.",
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Gemini / web search",
        estimatedTimeMins: 30,
      },
      {
        title: "Translate team data into visual charts",
        description: "Translate complex team data or performance metrics into clean visual charts for meetings.",
        practicalOutcome: "Help colleagues grasp key trends at a glance instead of scanning raw numbers.",
        whyItMatters: "Good visualisation turns data into decisions.",
        benefitCategories: ["COMMUNICATION", "ORGANISATION"],
        tool: "Google Sheets",
        estimatedTimeMins: 30,
      },
      {
        title: "Champion open-access resource sharing",
        description:
          "Share clear guidance within the team on using open-access resources such as Creative Commons media.",
        practicalOutcome: "Build a shared library of legally reusable media the whole team can draw on.",
        whyItMatters: "Clear shared norms prevent accidental copyright issues across a department.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Creative Commons",
        estimatedTimeMins: 20,
      },
      {
        title: "Mentor colleagues on AI accessibility tools",
        description:
          "Mentor colleagues on AI-powered accessibility tools — live captioning, text-to-speech, screen-reading optimisation.",
        practicalOutcome: "Help embed accessibility by design across the team's materials, not as an afterthought.",
        whyItMatters: "Inclusive-by-design materials benefit every learner, not just those who request adjustments.",
        benefitCategories: ["ACCESSIBILITY", "INCLUSION", "LEADERSHIP"],
        tool: "Gemini / accessibility tools",
        estimatedTimeMins: 30,
      },
    ],
  },
  creation: {
    Navigator: [
      {
        title: "Build clean presentations in Slides",
        description: "Build clean Google Slides presentations with clear text and simple visuals.",
        practicalOutcome: "Deliver sessions that look professional and keep the audience's attention on your message.",
        whyItMatters: "A well-designed slide deck reduces cognitive load for your audience.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "STUDENT_ENGAGEMENT"],
        tool: "Google Slides",
        estimatedTimeMins: 20,
      },
      {
        title: "Create a simple Google Form",
        description: "Create a basic Google Form to capture feedback, registrations or quick checks.",
        practicalOutcome: "Replace a paper or email-based process with a quick digital form.",
        whyItMatters: "One well-built form can eliminate a recurring manual admin task for good.",
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Google Forms",
        estimatedTimeMins: 15,
        evidencePrompt: "Share a link to a form you built and what it replaced.",
      },
      {
        title: "Solve routine tech hiccups independently",
        description: "Solve basic tech hiccups such as refreshing browsers, checking Wi-Fi, or restarting devices.",
        practicalOutcome: "Get back to work quickly without waiting on IT for simple issues.",
        whyItMatters: "Basic troubleshooting confidence reduces downtime for you and for IT support.",
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "General troubleshooting",
        estimatedTimeMins: 10,
      },
      {
        title: "Insert media cleanly into documents",
        description: "Insert images, charts or media cleanly into Slides, Docs or Forms.",
        practicalOutcome: "Make materials more engaging and easier to understand at a glance.",
        whyItMatters: "Well-placed visuals improve comprehension, especially for visual learners.",
        benefitCategories: ["STUDENT_ENGAGEMENT", "PROFESSIONAL_PRACTICE"],
        tool: "Google Workspace",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Build multi-page Google Sites",
        description: "Build multi-page Google Sites for team hubs, project pages or student learning portals.",
        practicalOutcome: "Give your team or learners a single, well-organised home for key resources.",
        whyItMatters: "A dedicated site reduces repeated 'where do I find X' questions.",
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "Google Sites",
        estimatedTimeMins: 45,
      },
      {
        title: "Design Forms with branching logic",
        description: "Create advanced Google Forms with section branching (conditional logic) and auto-scoring.",
        practicalOutcome: "Build a form that adapts its questions based on responses, cutting irrelevant questions.",
        whyItMatters: "Adaptive forms feel personal and reduce respondent drop-off.",
        benefitCategories: ["ASSESSMENT", "TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Google Forms",
        estimatedTimeMins: 30,
        evidencePrompt: "Describe the branching logic you built and what problem it solved.",
      },
      {
        title: "Write structured Gemini prompts for learning resources",
        description:
          "Write structured, contextual Gemini prompts to design differentiated learning resources and quizzes.",
        practicalOutcome: "Generate first drafts of differentiated resources in minutes instead of starting from scratch.",
        whyItMatters: "Good prompting turns a general-purpose AI tool into a genuinely useful planning assistant.",
        benefitCategories: ["TIME_SAVING", "STUDENT_OUTCOMES", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 25,
      },
      {
        title: "Turn documents into video walkthroughs",
        description:
          "Use Google Vids to transform static Docs or PDFs into short video walkthroughs with AI-generated scripts.",
        practicalOutcome: "Turn a dense written process into a short video people actually watch and follow.",
        whyItMatters: "Short video walkthroughs cut down repeat questions about routine processes.",
        benefitCategories: ["COMMUNICATION", "TIME_SAVING", "ACCESSIBILITY"],
        tool: "Google Vids",
        estimatedTimeMins: 30,
      },
      {
        title: "Explore VR and immersive learning spaces",
        description:
          "Access 3D asset libraries and 360-degree media, and try the Immersive Space or Igloo for a session.",
        practicalOutcome: "Give learners a memorable, hard-to-replicate experience for hands-on or high-stakes topics.",
        whyItMatters: "Immersive tools work best where a topic is otherwise hard, expensive or unsafe to practise.",
        benefitCategories: ["STUDENT_ENGAGEMENT", "INNOVATION"],
        tool: "VR / Igloo",
        estimatedTimeMins: 30,
      },
    ],
    Catalyst: [
      {
        title: "Solve a bottleneck with a logic-based Form",
        description: "Solve a long-standing operational bottleneck by designing an interactive, logic-based Google Form.",
        practicalOutcome: "Remove a process that has wasted staff time for years with one well-designed form.",
        whyItMatters: "Digital problem-solving delivers most value when aimed at a real, longstanding pain point.",
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "LEADERSHIP"],
        tool: "Google Forms",
        estimatedTimeMins: 60,
      },
      {
        title: "Build and share custom Gems",
        description: "Build, configure and share custom Gems (tailored AI assistants) loaded with departmental knowledge.",
        practicalOutcome: "Give your team a ready-made AI assistant tuned to your subject or department's needs.",
        whyItMatters: "A well-configured Gem saves every future user the work of re-explaining context each time.",
        benefitCategories: ["INNOVATION", "TIME_SAVING", "COLLABORATION"],
        tool: "Gemini Gems",
        estimatedTimeMins: 60,
      },
      {
        title: "Try a new tool and share what worked",
        description: "Try a new Google feature or edtech tool in your own work and present 'what worked / what didn't' to peers.",
        practicalOutcome: "Give colleagues an honest, low-risk way to learn from your experimentation.",
        whyItMatters: "Peer-tested recommendations are trusted more than generic training material.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "INNOVATION"],
        tool: "Various",
        estimatedTimeMins: 30,
      },
      {
        title: "Champion immersive tech for hard-to-replicate learning",
        description:
          "Champion cross-curricular use of VR headsets, 360° tours, or Igloo environments for high-stakes vocational scenarios.",
        practicalOutcome: "Give learners safe practice in scenarios that would otherwise be impossible, expensive or unsafe.",
        whyItMatters:
          "Some vocational skills — healthcare simulation, site inspection — are best taught immersively.",
        benefitCategories: ["INNOVATION", "STUDENT_OUTCOMES", "LEADERSHIP"],
        tool: "VR / Igloo",
        estimatedTimeMins: 45,
      },
    ],
  },
  communication: {
    Navigator: [
      {
        title: "Join Meet calls confidently",
        description: "Join Google Meet calls comfortably, managing microphone, camera and text chat.",
        practicalOutcome: "Take part in online meetings and sessions without technical distractions.",
        whyItMatters: "Confidence with the basics is the foundation for everything else in online collaboration.",
        benefitCategories: ["COMMUNICATION", "PRODUCTIVITY"],
        tool: "Google Meet",
        estimatedTimeMins: 10,
      },
      {
        title: "Comment and suggest in shared Docs",
        description: "Co-author shared Google Docs or Slides by leaving basic comments and suggestions.",
        practicalOutcome: "Collaborate on a shared document without overwriting colleagues' work.",
        whyItMatters: "Comments and suggestions keep collaborative editing transparent and reversible.",
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Google Docs",
        estimatedTimeMins: 10,
      },
      {
        title: "Communicate professionally by email and Chat",
        description: "Communicate professionally via email and Google Chat using appropriate tone.",
        practicalOutcome: "Build a professional digital reputation through clear, well-judged messages.",
        whyItMatters: "Written tone is easy to misjudge online — a little care avoids real misunderstandings.",
        benefitCategories: ["COMMUNICATION", "PROFESSIONAL_PRACTICE"],
        tool: "Gmail / Google Chat",
        estimatedTimeMins: 10,
      },
      {
        title: "Set sharing permissions correctly in Drive",
        description: "Set file-sharing permissions correctly in Google Drive ('Viewer' vs 'Editor').",
        practicalOutcome: "Share files with exactly the right level of access, protecting sensitive information.",
        whyItMatters: "Incorrect sharing permissions are a common cause of data protection issues.",
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Google Drive",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Host Meet sessions with polls and breakouts",
        description: "Host and facilitate Google Meet meetings using features like polls, Q&A and breakout rooms.",
        practicalOutcome: "Run more interactive online sessions that keep attendees engaged, not just listening.",
        whyItMatters: "Interactive facilitation features noticeably improve engagement in online meetings.",
        benefitCategories: ["STUDENT_ENGAGEMENT", "COMMUNICATION"],
        tool: "Google Meet",
        estimatedTimeMins: 20,
      },
      {
        title: "Use advanced co-authoring tools in Docs",
        description: "Use Version History, named versions and task assignment in Google Docs.",
        practicalOutcome: "Track how a shared document evolved and know exactly who owns each next step.",
        whyItMatters: "Clear ownership of tasks prevents shared documents stalling or duplicating effort.",
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Google Docs",
        estimatedTimeMins: 20,
      },
      {
        title: "Manage Shared Drives and Spaces",
        description: "Manage shared working environments — Google Shared Drives and active Google Spaces.",
        practicalOutcome: "Keep a whole team's files and discussion organised in one well-structured place.",
        whyItMatters: "A well-run Shared Drive prevents the 'lost file' problem common with personal-Drive sharing.",
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 25,
      },
      {
        title: "Use real-time translated captions in Meet",
        description:
          "Use inclusive collaboration methods, including real-time AI-translated captions in Meet, to bridge language barriers.",
        practicalOutcome: "Make cross-department or external meetings genuinely accessible to non-native speakers.",
        whyItMatters: "Live translated captions can be the difference between someone participating fully or not at all.",
        benefitCategories: ["INCLUSION", "ACCESSIBILITY", "COMMUNICATION"],
        tool: "Google Meet",
        estimatedTimeMins: 15,
      },
    ],
    Catalyst: [
      {
        title: "Moderate a peer discussion Space",
        description: "Set up and actively moderate a vibrant Google Space or Chat group for peer discussion.",
        practicalOutcome: "Give colleagues an ongoing home for peer support that doesn't depend on scheduled meetings.",
        whyItMatters: "Active, well-moderated spaces build a genuine culture of continuous peer learning.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Google Chat Spaces",
        estimatedTimeMins: 30,
      },
      {
        title: "Model inclusive co-authoring etiquette",
        description: "Model inclusive co-authoring etiquette — @mentions, task assignment, clear comment threads.",
        practicalOutcome: "Make shared documents genuinely easier for the whole team to work in together.",
        whyItMatters: "Small etiquette habits, modelled consistently, become team norms.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "INCLUSION"],
        tool: "Google Docs",
        estimatedTimeMins: 15,
      },
      {
        title: "Establish team norms for Chat vs Email",
        description: "Help establish healthy team norms around digital communication — e.g. when to use Chat vs Email.",
        practicalOutcome: "Reduce noise and crossed wires by agreeing what channel is for what.",
        whyItMatters: "Clear channel norms reduce both missed messages and communication overload.",
        benefitCategories: ["COLLABORATION", "DIGITAL_WELLBEING"],
        tool: "Google Chat / Gmail",
        estimatedTimeMins: 20,
      },
      {
        title: "Establish file-naming conventions for the team",
        description: "Establish efficient group-working habits in Shared Drives, such as standard file naming.",
        practicalOutcome: "Make every file in a Shared Drive findable at a glance, for everyone on the team.",
        whyItMatters: "Consistent naming conventions save the whole team time, every single day.",
        benefitCategories: ["ORGANISATION", "LEADERSHIP", "TIME_SAVING"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 20,
      },
    ],
  },
  learning: {
    Navigator: [
      {
        title: "Attend digital training workshops",
        description: "Attend digital training workshops, e.g. internal Google Workspace CPD sessions.",
        practicalOutcome: "Build your skills through structured, supported learning opportunities.",
        whyItMatters: "Dedicated training time accelerates skill-building beyond what's possible day-to-day.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Internal CPD",
        estimatedTimeMins: 45,
      },
      {
        title: "Use video tutorials to learn independently",
        description: "Search online video tutorials, e.g. YouTube, to learn new software skills independently.",
        practicalOutcome: "Pick up a new skill in minutes without waiting for formal training.",
        whyItMatters: "Self-directed learning is often the fastest route to solving an immediate problem.",
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "YouTube",
        estimatedTimeMins: 15,
      },
      {
        title: "Draft a personal development plan",
        description: "Use Google Docs to draft and update a personal development plan (PDP).",
        practicalOutcome: "Keep a living record of your development goals rather than a one-off appraisal document.",
        whyItMatters: "A regularly-updated PDP keeps development intentional rather than accidental.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Docs",
        estimatedTimeMins: 20,
      },
      {
        title: "Complete mandatory digital training",
        description: "Navigate the college staff portal or VLE to complete mandatory digital training.",
        practicalOutcome: "Stay compliant and up to date with required training with minimum friction.",
        whyItMatters: "Comfort navigating the VLE removes an unnecessary barrier to completing required CPD.",
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "College VLE",
        estimatedTimeMins: 20,
      },
    ],
    Elevator: [
      {
        title: "Pursue a Google Certified Educator credential",
        description: "Pursue Google Certified Educator or Workspace credentials, or job-specific digital badges.",
        practicalOutcome: "Gain recognised, portable evidence of your digital capability.",
        whyItMatters: "External credentials strengthen both your CV and your confidence with the tools.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Google Certified Educator",
        estimatedTimeMins: 180,
        evidencePrompt: "Add a link to your certificate or badge.",
      },
      {
        title: "Use Gemini to plan and outline projects",
        description: "Use Gemini to research, plan and outline work projects or teaching resources.",
        practicalOutcome: "Get from a blank page to a solid first draft plan in a fraction of the time.",
        whyItMatters: "AI-assisted planning frees up time for the judgement calls only you can make.",
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY"],
        tool: "Gemini",
        estimatedTimeMins: 20,
      },
      {
        title: "Summarise webinars with NotebookLM",
        description:
          "Use Gemini Notebook (NotebookLM) to synthesise training notes, webinar transcripts and research PDFs into study guides.",
        practicalOutcome: "Turn a long recorded webinar into a short, revisitable summary or audio overview.",
        whyItMatters: "Synthesised notes make CPD content genuinely reusable later, not just 'watched once'.",
        benefitCategories: ["TIME_SAVING", "PROFESSIONAL_PRACTICE"],
        tool: "NotebookLM",
        estimatedTimeMins: 20,
      },
      {
        title: "Share learning with colleagues after CPD",
        description: "Teach colleagues a newly mastered software skill after self-directed learning.",
        practicalOutcome: "Multiply the value of your own learning by passing it on to the team.",
        whyItMatters: "Teaching a skill to someone else cements your own understanding of it.",
        benefitCategories: ["COLLABORATION", "LEADERSHIP"],
        tool: "Various",
        estimatedTimeMins: 20,
      },
    ],
    Catalyst: [
      {
        title: "Achieve external digital recognition",
        description:
          "Pursue and achieve external digital recognition, e.g. Google Certified Educator Level 1/2 or Google Champion.",
        practicalOutcome: "Bring recognised external expertise back into the college.",
        whyItMatters: "External recognition validates practice and can inform whole-college strategy.",
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Google Certified Educator",
        estimatedTimeMins: 240,
      },
      {
        title: "Offer 1-on-1 peer mentoring",
        description: "Offer 1-on-1 peer mentoring or mini-coaching sessions to help a colleague build confidence.",
        practicalOutcome: "Give a colleague the individual support that a group training session can't.",
        whyItMatters: "Personalised mentoring often succeeds where generic training doesn't land.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Various",
        estimatedTimeMins: 30,
      },
      {
        title: "Run informal skill-share sessions",
        description: "Organise short, 15-minute informal skill-share sessions focused on immediate practical gains.",
        practicalOutcome: "Spread a practical tip to the whole team in less time than a coffee break.",
        whyItMatters: "Short, focused sessions respect colleagues' time while still spreading good practice.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "TIME_SAVING"],
        tool: "Various",
        estimatedTimeMins: 15,
      },
      {
        title: "Mentor new staff through digital onboarding",
        description: "Mentor new staff members during onboarding to help them get comfortable with college digital systems.",
        practicalOutcome: "Help new colleagues become productive with college systems much faster.",
        whyItMatters: "A confident start with digital systems shapes a new colleague's whole first term.",
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Various",
        estimatedTimeMins: 30,
      },
    ],
  },
  identity: {
    Navigator: [
      {
        title: "Maintain an accurate Google profile",
        description: "Maintain an accurate Google account profile — professional photo, signature and job title.",
        practicalOutcome: "Present a clear, professional identity to colleagues and students online.",
        whyItMatters: "A complete, accurate profile makes it easier for people to know who they're talking to.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Workspace",
        estimatedTimeMins: 10,
      },
      {
        title: "Take regular screen breaks",
        description: "Take regular screen breaks to prevent eye strain and digital fatigue.",
        practicalOutcome: "Protect your long-term comfort and concentration across a screen-heavy working day.",
        whyItMatters: "Small, regular breaks measurably reduce fatigue and support sustained focus.",
        benefitCategories: ["DIGITAL_WELLBEING"],
        tool: "Personal habit",
        estimatedTimeMins: 5,
      },
      {
        title: "Protect passwords and personal data",
        description: "Protect personal data and passwords in line with college IT security policies.",
        practicalOutcome: "Reduce the risk of your account being compromised, and protect college data.",
        whyItMatters: "Good password hygiene is one of the simplest, highest-impact security habits.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Password manager",
        estimatedTimeMins: 15,
      },
      {
        title: "Recognise symptoms of VR motion sickness",
        description: "Recognise symptoms of cybersickness and take timely breaks during immersive sessions.",
        practicalOutcome: "Keep yourself and learners safe and comfortable when using VR equipment.",
        whyItMatters: "Awareness of cybersickness symptoms prevents a bad first experience putting people off immersive learning.",
        benefitCategories: ["DIGITAL_WELLBEING", "ACCESSIBILITY"],
        tool: "VR headset",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Protect working boundaries with Calendar tools",
        description: "Proactively protect working boundaries using Google Calendar Focus Time and Chat notification snoozing.",
        practicalOutcome: "Get uninterrupted time for deep work and protect your time outside working hours.",
        whyItMatters: "Protected focus time is directly linked to lower stress and better quality work.",
        benefitCategories: ["DIGITAL_WELLBEING", "PRODUCTIVITY"],
        tool: "Google Calendar",
        estimatedTimeMins: 15,
      },
      {
        title: "Curate a professional online identity",
        description: "Curate a professional online identity across workplace and professional platforms.",
        practicalOutcome: "Build a consistent, professional presence that supports your career development.",
        whyItMatters: "A considered online identity increasingly matters for professional opportunities.",
        benefitCategories: ["PROFESSIONAL_PRACTICE", "LEADERSHIP"],
        tool: "LinkedIn / Google Workspace",
        estimatedTimeMins: 30,
      },
      {
        title: "Run regular privacy and security checks",
        description: "Conduct regular privacy and security checks on your workplace accounts.",
        practicalOutcome: "Catch and close security gaps before they become a real problem.",
        whyItMatters: "Periodic self-audits catch the small issues that build into big risks.",
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Account security checkup",
        estimatedTimeMins: 15,
      },
      {
        title: "Use digital wellbeing tools to maintain balance",
        description: "Use digital wellbeing tools such as screen time tracking to maintain balance.",
        practicalOutcome: "Get an honest picture of your screen time and adjust where it's not serving you.",
        whyItMatters: "Awareness is the first step to a healthier relationship with always-on technology.",
        benefitCategories: ["DIGITAL_WELLBEING"],
        tool: "Digital wellbeing dashboard",
        estimatedTimeMins: 10,
      },
    ],
    Catalyst: [
      {
        title: "Model exemplary digital boundary management",
        description:
          "Model exemplary digital boundary management — Calendar focus time, clear out-of-office status, no late-night emails.",
        practicalOutcome: "Give colleagues visible permission to protect their own time by seeing you protect yours.",
        whyItMatters: "Leaders who visibly model healthy boundaries shift the whole team's culture.",
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING"],
        tool: "Google Calendar",
        estimatedTimeMins: 15,
      },
      {
        title: "Share digital stress-relief tips with the team",
        description: "Share digital stress-relief tips such as notification settings and workspace decluttering.",
        practicalOutcome: "Give colleagues practical, low-effort ways to reduce their own digital stress.",
        whyItMatters: "Concrete, specific tips are far more actionable than general wellbeing advice.",
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING"],
        tool: "Various",
        estimatedTimeMins: 15,
      },
      {
        title: "Champion GDPR and data hygiene in shared areas",
        description: "Act as a champion for GDPR and data hygiene by gently keeping shared drive areas compliant.",
        practicalOutcome: "Reduce data protection risk across the team through everyday good practice.",
        whyItMatters: "Distributed, everyday vigilance catches issues that periodic audits miss.",
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 20,
      },
      {
        title: "Design asynchronous communication protocols",
        description:
          "Use Gemini to analyse team workload trends and design async communication protocols that reduce notification stress.",
        practicalOutcome: "Reduce the pressure your team feels to respond outside working hours.",
        whyItMatters: "Explicit async norms protect wellbeing without sacrificing team communication.",
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 30,
      },
    ],
  },
};

const MILESTONES = [
  {
    name: "First Digital Step",
    description: "Complete your first capability assessment.",
    icon: "footprints",
    criteriaType: "FIRST_ASSESSMENT",
    criteriaValue: null as number | null,
  },
  {
    name: "Getting Started",
    description: "3 active development days.",
    icon: "flame",
    criteriaType: "ACTIVE_DAYS_TOTAL",
    criteriaValue: 3,
  },
  {
    name: "Building Momentum",
    description: "7 active development days.",
    icon: "flame",
    criteriaType: "ACTIVE_DAYS_TOTAL",
    criteriaValue: 7,
  },
  {
    name: "Digital Explorer",
    description: "Master 10 capabilities.",
    icon: "compass",
    criteriaType: "SKILLS_MASTERED_TOTAL",
    criteriaValue: 10,
  },
  {
    name: "Navigator",
    description: "Complete your first Navigator pathway.",
    icon: "compass",
    criteriaType: "LEVEL_COMPLETED_SPECIFIC",
    criteriaValue: 0,
  },
  {
    name: "Elevating Practice",
    description: "Complete your first Elevator pathway.",
    icon: "trending-up",
    criteriaType: "LEVEL_COMPLETED_SPECIFIC",
    criteriaValue: 1,
  },
  {
    name: "Catalyst",
    description: "Complete your first Catalyst pathway.",
    icon: "sparkles",
    criteriaType: "LEVEL_COMPLETED_SPECIFIC",
    criteriaValue: 2,
  },
  {
    name: "Across the Map",
    description: "Make progress in all six capability areas.",
    icon: "map",
    criteriaType: "ALL_AREAS_STARTED",
    criteriaValue: null,
  },
  {
    name: "Digital Habit",
    description: "30 active development days.",
    icon: "flame",
    criteriaType: "ACTIVE_DAYS_TOTAL",
    criteriaValue: 30,
  },
];

const PEDTECH_FACTS = [
  {
    title: "Retrieval practice beats re-reading",
    fact: "Retrieval practice is more effective when learners generate an answer before seeing the correct response.",
    category: "COGNITIVE_SCIENCE",
    source: "Roediger & Karpicke",
    sourceUrl: null as string | null,
  },
  {
    title: "Captions help more learners than you'd think",
    fact: "Live captions in video meetings can improve comprehension for learners with auditory processing differences, not just those who are D/deaf or hard of hearing.",
    category: "ACCESSIBILITY",
    source: null,
    sourceUrl: null,
  },
  {
    title: "AI can sound confident and still be wrong",
    fact: "Generative AI tools can produce confident but incorrect answers ('hallucinations') — always verify factual claims before sharing them with learners.",
    category: "AI",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Simpler slides aid recall",
    fact: "Splitting information across fewer, simpler slides reduces cognitive load and improves recall compared to dense, text-heavy slides.",
    category: "DIGITAL_PEDAGOGY",
    source: "Mayer's Cognitive Theory of Multimedia Learning",
    sourceUrl: null,
  },
  {
    title: "Notifications cost more than a glance",
    fact: "It can take over 20 minutes to fully refocus after an interrupting notification — batching checks reduces this cost.",
    category: "DIGITAL_WELLBEING",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Little and often beats cramming",
    fact: "Spacing learning out over several short sessions produces stronger long-term retention than one long cramming session.",
    category: "COGNITIVE_SCIENCE",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Quick checks catch misconceptions early",
    fact: "Frequent, low-stakes formative checks help identify misconceptions while there's still time to address them.",
    category: "ASSESSMENT",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Presence improves procedural recall",
    fact: "A sense of 'presence' in VR-based simulations can improve recall of procedural tasks compared with watching a video of the same task.",
    category: "IMMERSIVE_LEARNING",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Shared Drives end version chaos",
    fact: "Files in a Shared Drive belong to the team, not an individual — this alone eliminates most 'who has the latest version' problems.",
    category: "GOOGLE_WORKSPACE",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Batching email doesn't slow you down",
    fact: "Checking email at set times rather than continuously can reduce perceived workload without slowing response times noticeably.",
    category: "PRODUCTIVITY",
    source: null,
    sourceUrl: null,
  },
  {
    title: "Suggestions build trust, not just track changes",
    fact: "Teams collaborate more openly in shared digital spaces when comments default to suggestions rather than direct edits.",
    category: "COLLABORATION",
    source: null,
    sourceUrl: null,
  },
];

async function main() {
  console.log("Seeding levels...");
  const levelByName: Record<string, { id: string }> = {};
  for (const level of LEVELS) {
    const created = await prisma.level.upsert({
      where: { name: level.name },
      update: { tagline: level.tagline, description: level.description, order: level.order },
      create: level,
    });
    levelByName[level.name] = created;
  }

  console.log("Seeding capability areas...");
  const areaByKey: Record<AreaKey, { id: string; name: string }> = {} as never;
  for (let i = 0; i < AREAS.length; i++) {
    const area = AREAS[i];
    const created = await prisma.capabilityArea.upsert({
      where: { name: area.name },
      update: {
        shortName: area.shortName,
        description: area.description,
        color: area.color,
        icon: area.icon,
        order: i,
      },
      create: {
        name: area.name,
        shortName: area.shortName,
        description: area.description,
        color: area.color,
        icon: area.icon,
        order: i,
      },
    });
    areaByKey[area.key] = created;
  }

  console.log("Seeding skills...");
  const skillIdByTitle: Record<string, string> = {};
  for (const area of AREAS) {
    for (const level of LEVELS) {
      const skills = SKILLS[area.key][level.name];
      for (let order = 0; order < skills.length; order++) {
        const s = skills[order];
        const existing = await prisma.skill.findFirst({
          where: { title: s.title, capabilityAreaId: areaByKey[area.key].id },
        });
        const data = {
          capabilityAreaId: areaByKey[area.key].id,
          levelId: levelByName[level.name].id,
          title: s.title,
          description: s.description,
          practicalOutcome: s.practicalOutcome,
          whyItMatters: s.whyItMatters,
          benefitCategories: JSON.stringify(s.benefitCategories),
          tool: s.tool,
          estimatedTimeMins: s.estimatedTimeMins,
          evidencePrompt: s.evidencePrompt ?? null,
          order,
          active: true,
        };
        const record = existing
          ? await prisma.skill.update({ where: { id: existing.id }, data })
          : await prisma.skill.create({ data });
        skillIdByTitle[s.title] = record.id;
      }
    }
  }

  console.log("Seeding badges (one per area x level)...");
  for (const area of AREAS) {
    for (const level of LEVELS) {
      await prisma.badge.upsert({
        where: {
          capabilityAreaId_levelId: {
            capabilityAreaId: areaByKey[area.key].id,
            levelId: levelByName[level.name].id,
          },
        },
        update: {},
        create: {
          capabilityAreaId: areaByKey[area.key].id,
          levelId: levelByName[level.name].id,
          name: `${area.shortName} — ${level.name}`,
          description: `Awarded for completing the ${level.name} pathway in ${area.name}.`,
          criteria: "Master every active skill in this stage",
        },
      });
    }
  }

  console.log("Seeding milestones...");
  const milestoneByName: Record<string, { id: string }> = {};
  for (const m of MILESTONES) {
    const created = await prisma.milestone.upsert({
      where: { id: `seed-${m.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {
        description: m.description,
        icon: m.icon,
        criteriaType: m.criteriaType,
        criteriaValue: m.criteriaValue,
        active: true,
      },
      create: {
        id: `seed-${m.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: m.name,
        description: m.description,
        icon: m.icon,
        criteriaType: m.criteriaType,
        criteriaValue: m.criteriaValue,
        active: true,
      },
    });
    milestoneByName[m.name] = created;
  }

  console.log("Seeding PedTech facts...");
  for (const f of PEDTECH_FACTS) {
    const existing = await prisma.pedTechFact.findFirst({ where: { title: f.title } });
    if (!existing) {
      await prisma.pedTechFact.create({
        data: {
          title: f.title,
          fact: f.fact,
          category: f.category,
          source: f.source,
          sourceUrl: f.sourceUrl,
          active: true,
        },
      });
    }
  }

  console.log("Seeding system config...");
  await prisma.systemConfig.upsert({
    where: { key: "stageCompletionThreshold" },
    update: {},
    create: { key: "stageCompletionThreshold", value: "100" },
  });

  console.log("Seeding demo users...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@college.ac.uk" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "admin@college.ac.uk",
      passwordHash,
      role: "ADMIN",
      department: "Digital Learning",
      jobTitle: "Digital Learning Lead",
      onboarded: true,
    },
  });

  const freshStaff = await prisma.user.upsert({
    where: { email: "new.starter@college.ac.uk" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "new.starter@college.ac.uk",
      passwordHash,
      role: "STAFF",
      department: "Business Studies",
      jobTitle: "Lecturer",
      onboarded: false,
    },
  });

  // Primary demo staff account — a "lived in" profile with real momentum,
  // mixed progress across areas, evidence, and earned milestones so the
  // dashboard demonstrates the full product rather than an empty state.
  const emily = await prisma.user.upsert({
    where: { email: "birchallel@gmail.com" },
    update: {},
    create: {
      name: "Emily",
      email: "birchallel@gmail.com",
      passwordHash,
      role: "STAFF",
      department: "Digital Learning",
      jobTitle: "Curriculum Lead",
      onboarded: true,
    },
  });

  console.log("Seeding Emily's demo progress...");
  // Idempotent: clear Emily's transactional demo data first so re-running
  // the seed never duplicates activity/evidence rows.
  await prisma.developmentActivity.deleteMany({ where: { userId: emily.id } });
  await prisma.evidence.deleteMany({ where: { userId: emily.id } });
  await prisma.userMilestone.deleteMany({ where: { userId: emily.id } });
  await prisma.userPriority.deleteMany({ where: { userId: emily.id } });
  await prisma.userSkillStatus.deleteMany({ where: { userId: emily.id } });
  await seedEmilyProgress(emily.id, areaByKey, skillIdByTitle);

  console.log("\nDone. Demo accounts (password: Password123! for all):");
  console.log(`  Admin:        ${admin.email}`);
  console.log(`  Staff (rich): ${emily.email}`);
  console.log(`  Staff (new):  ${freshStaff.email}`);
}

async function seedEmilyProgress(
  userId: string,
  areaByKey: Record<AreaKey, { id: string; name: string }>,
  skillIdByTitle: Record<string, string>
) {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  // 6 consecutive active days ending today -> currentStreak = longestStreak = 6,
  // matching the brief's own worked dashboard example ("6 development days").
  const dayOffsets = [5, 4, 3, 2, 1, 0];

  type Plan = { title: string; status: "MASTERED" | "IN_PROGRESS" | "TO_DEVELOP"; day: number };

  const plan: Plan[] = [
    // Day -5: big first swipe session — Proficiency Navigator complete,
    // Literacy/Communication/Learning Navigator mostly assessed.
    { title: "Sign in securely with single sign-on", status: "MASTERED", day: 5 },
    { title: "Organise files in Google Drive", status: "MASTERED", day: 5 },
    { title: "Format documents clearly in Google Docs", status: "MASTERED", day: 5 },
    { title: "Manage tabs and bookmarks in Chrome", status: "MASTERED", day: 5 },
    { title: "Search effectively for reliable sources", status: "MASTERED", day: 5 },
    { title: "Spot phishing and unreliable sources", status: "MASTERED", day: 5 },
    { title: "Filter and sort data in Sheets", status: "MASTERED", day: 5 },
    { title: "Reference sources appropriately", status: "TO_DEVELOP", day: 5 },
    { title: "Join Meet calls confidently", status: "MASTERED", day: 5 },
    { title: "Comment and suggest in shared Docs", status: "MASTERED", day: 5 },
    { title: "Communicate professionally by email and Chat", status: "MASTERED", day: 5 },
    { title: "Attend digital training workshops", status: "MASTERED", day: 5 },
    { title: "Use video tutorials to learn independently", status: "MASTERED", day: 5 },

    // Day -4: Proficiency Elevator started.
    { title: "Use Google Calendar's advanced scheduling tools", status: "MASTERED", day: 4 },
    { title: "Streamline Gmail with filters and templates", status: "MASTERED", day: 4 },
    { title: "Analyse data with Pivot Tables in Sheets", status: "TO_DEVELOP", day: 4 },
    { title: "Apply Chrome extensions to optimise workflow", status: "TO_DEVELOP", day: 4 },

    // Day -3: Digital Learning & Development Navigator — 2 remaining
    // (matches the brief's "Nearly There" worked example).
    { title: "Draft a personal development plan", status: "TO_DEVELOP", day: 3 },
    { title: "Complete mandatory digital training", status: "TO_DEVELOP", day: 3 },

    // Day -1: the one in-progress skill in the whole dataset — this is what
    // "Today's Digital Step" should surface (matches the brief's sample UX).
    { title: "Set sharing permissions correctly in Drive", status: "IN_PROGRESS", day: 1 },
  ];

  for (const item of plan) {
    const skillId = skillIdByTitle[item.title];
    if (!skillId) continue;
    const date = daysAgo(item.day);
    await prisma.userSkillStatus.upsert({
      where: { userId_skillId: { userId, skillId } },
      update: {},
      create: {
        userId,
        skillId,
        status: item.status,
        createdAt: date,
        updatedAt: date,
        startedAt: item.status !== "TO_DEVELOP" ? date : null,
        masteredAt: item.status === "MASTERED" ? date : null,
      },
    });

    const activityType =
      item.status === "MASTERED" ? "SKILL_MASTERED" : item.status === "IN_PROGRESS" ? "SKILL_STARTED" : "SKILL_ASSESSED";
    await prisma.developmentActivity.create({
      data: { userId, skillId, activityType, detail: item.title, activityDate: date, createdAt: date },
    });
  }

  // Log LEVEL_COMPLETED for Proficiency & Productivity — Navigator (4/4 mastered).
  await prisma.developmentActivity.create({
    data: {
      userId,
      activityType: "LEVEL_COMPLETED",
      detail: `${areaByKey.proficiency.name}::Navigator`,
      activityDate: daysAgo(5),
      createdAt: daysAgo(5),
    },
  });

  // Evidence + reflection on day -2 (also a qualifying activity for momentum).
  const ssoSkillId = skillIdByTitle["Sign in securely with single sign-on"];
  if (ssoSkillId) {
    const date = daysAgo(2);
    await prisma.evidence.create({
      data: {
        userId,
        skillId: ssoSkillId,
        reflection:
          "Set up SSO on a new laptop for a colleague who was struggling — took two minutes instead of a support ticket.",
        createdAt: date,
      },
    });
    await prisma.developmentActivity.create({
      data: { userId, skillId: ssoSkillId, activityType: "EVIDENCE_ADDED", detail: "Reflection added", activityDate: date, createdAt: date },
    });
  }

  // A personal development priority flag.
  const pivotSkillId = skillIdByTitle["Analyse data with Pivot Tables in Sheets"];
  if (pivotSkillId) {
    await prisma.userPriority.upsert({
      where: { userId_skillId: { userId, skillId: pivotSkillId } },
      update: {},
      create: { userId, skillId: pivotSkillId },
    });
  }

  // A same-day general reflection, so "today" has a qualifying activity too
  // (keeps the 6-day streak below consistent with the actual activity log,
  // and gives the Activity timeline a "Today" entry).
  await prisma.developmentActivity.create({
    data: {
      userId,
      activityType: "REFLECTION_ADDED",
      detail: "Weekly reflection on digital development progress",
      activityDate: daysAgo(0),
      createdAt: daysAgo(0),
    },
  });

  // Momentum: 6-day streak ending today.
  await prisma.userMomentum.upsert({
    where: { userId },
    update: {
      currentStreak: dayOffsets.length,
      longestStreak: dayOffsets.length,
      totalDevelopmentDays: dayOffsets.length,
      lastQualifyingActivityDate: daysAgo(0),
      weeklyTarget: 3,
    },
    create: {
      userId,
      currentStreak: dayOffsets.length,
      longestStreak: dayOffsets.length,
      totalDevelopmentDays: dayOffsets.length,
      lastQualifyingActivityDate: daysAgo(0),
      weeklyTarget: 3,
    },
  });

  // Earned milestones matching the seeded stats above:
  // First Digital Step, Getting Started (3 days), Digital Explorer (10+
  // mastered), Navigator (first Navigator pathway complete).
  const earned = ["seed-first-digital-step", "seed-getting-started", "seed-digital-explorer", "seed-navigator"];
  for (const milestoneId of earned) {
    const exists = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!exists) continue;
    await prisma.userMilestone.upsert({
      where: { userId_milestoneId: { userId, milestoneId } },
      update: {},
      create: { userId, milestoneId, earnedAt: daysAgo(5) },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
