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
  howToSteps: string[];
  benefitCategories: string[];
  tool: string;
  estimatedTimeMins: number;
  evidencePrompt?: string;
  platform?: "GOOGLE" | "MICROSOFT" | "BOTH"; // defaults to "BOTH" (suite-agnostic) when omitted
}

// Representative skills per area/level, written in a Google Workspace
// education context per the brief. Administrators can add/edit/import many
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
          "Secure, smooth sign-in reduces daily friction and protects both your account and institutional data.",
        howToSteps: [
          "On a work device or the login page, choose \"Sign in with Google\" rather than typing a separate password.",
          "Enter your work email address and, if prompted, approve the sign-in on your phone or authenticator app.",
          "Tick \"Stay signed in\" on trusted personal devices so you're not prompted every time.",
          "If a new site asks for a password instead of offering Google sign-in, check with IT before creating a new one.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "Google Workspace SSO",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Sign in securely with Microsoft 365 SSO",
        description: "Log into work devices and Microsoft 365 using single sign-on (SSO) confidently and securely.",
        practicalOutcome:
          "Get straight into your working day without repeated password prompts, while keeping your account secure.",
        whyItMatters:
          "Secure, smooth sign-in reduces daily friction and protects both your account and institutional data.",
        howToSteps: [
          "On a work device or the login page, choose \"Sign in with Microsoft\" rather than typing a separate password.",
          "Enter your work email address and complete multi-factor authentication (an approval on the Microsoft Authenticator app, or a code).",
          "Tick \"Stay signed in\" on trusted personal devices so you're not prompted every time.",
          "If a new site asks for a password instead of offering Microsoft sign-in, check with IT before creating a new one.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "Microsoft 365 SSO",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
      {
        title: "Organise files in Google Drive",
        description: "Create clear folders and subfolders in Google Drive so files are easy to find.",
        practicalOutcome: "Spend less time hunting for documents and more time on the work that matters.",
        whyItMatters: "A tidy Drive structure saves everyone time, especially when sharing with colleagues.",
        howToSteps: [
          "Open Google Drive and click New > Folder to create a top-level folder for each course, project or role.",
          "Inside each, add subfolders for the natural groupings you already use (e.g. by term, unit or cohort).",
          "Move loose files into the right subfolder by dragging them, or right-click > Move to.",
          "Star your 3–4 most-used folders so they appear at the top of the Drive sidebar.",
        ],
        benefitCategories: ["ORGANISATION", "TIME_SAVING", "PRODUCTIVITY"],
        tool: "Google Drive",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Organise files in OneDrive",
        description: "Create clear folders and subfolders in OneDrive so files are easy to find.",
        practicalOutcome: "Spend less time hunting for documents and more time on the work that matters.",
        whyItMatters: "A tidy OneDrive structure saves everyone time, especially when sharing with colleagues.",
        howToSteps: [
          "Open OneDrive and click New > Folder to create a top-level folder for each course, project or role.",
          "Inside each, add subfolders for the natural groupings you already use (e.g. by term, unit or cohort).",
          "Move loose files into the right subfolder by dragging them, or right-click > Move to.",
          "Pin your 3–4 most-used folders so they appear under Quick access.",
        ],
        benefitCategories: ["ORGANISATION", "TIME_SAVING", "PRODUCTIVITY"],
        tool: "OneDrive",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Format documents clearly in Google Docs",
        description: "Use headings, bullet points and consistent formatting to structure Google Docs.",
        practicalOutcome: "Produce documents that are easier for colleagues and students to read and navigate.",
        whyItMatters: "Clear structure improves accessibility and the professionalism of everyday documents.",
        howToSteps: [
          "Select a line of text, then use the Styles dropdown (says \"Normal text\") to set it as Heading 1, 2 or 3.",
          "Use headings for every major section so Docs can auto-build a table of contents (Insert > Table of contents).",
          "Use the bullet/numbered list buttons for lists instead of typing dashes or numbers manually.",
          "Keep one consistent font and size for body text throughout the document.",
        ],
        benefitCategories: ["ACCESSIBILITY", "PROFESSIONAL_PRACTICE"],
        tool: "Google Docs",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Format documents clearly in Word",
        description: "Use headings, bullet points and consistent formatting to structure Word documents.",
        practicalOutcome: "Produce documents that are easier for colleagues and students to read and navigate.",
        whyItMatters: "Clear structure improves accessibility and the professionalism of everyday documents.",
        howToSteps: [
          "Select a line of text, then use the Styles gallery on the Home tab to set it as Heading 1, 2 or 3.",
          "Use headings for every major section so Word can auto-build a table of contents (References > Table of Contents).",
          "Use the bullet/numbered list buttons for lists instead of typing dashes or numbers manually.",
          "Keep one consistent font and size for body text throughout the document.",
        ],
        benefitCategories: ["ACCESSIBILITY", "PROFESSIONAL_PRACTICE"],
        tool: "Word",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Manage tabs and bookmarks in your browser",
        description: "Navigate Chrome or Edge confidently, manage multiple tabs and save bookmarks/favourites.",
        practicalOutcome: "Move between resources quickly without losing track of what you were doing.",
        whyItMatters: "Confident browser use is the foundation for everything else you do online.",
        howToSteps: [
          "Open a link in a new tab with Ctrl/Cmd+Click instead of replacing your current page.",
          "Group related tabs together (right-click a tab and choose \"Add tab to new group\" in Chrome, or \"Add tab to new group\" in Edge).",
          "Bookmark a page you'll need again with Ctrl/Cmd+D, and save it into a named folder.",
          "Reopen an accidentally closed tab with Ctrl/Cmd+Shift+T.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "Chrome / Edge",
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
        howToSteps: [
          "In Google Calendar, click Create > Appointment schedule and set the time slots you're free.",
          "Share the booking page link by email or in Classroom so people can book a slot themselves.",
          "Block out focus time by creating an event, opening its settings and choosing \"Focus time\" as the type.",
          "Turn on Out of Office for holidays so Calendar auto-declines new meeting invites.",
        ],
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY", "DIGITAL_WELLBEING"],
        tool: "Google Calendar",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Use Outlook Calendar's advanced scheduling tools",
        description: "Use Bookable pages, Out of Office settings and Focus time in Outlook Calendar.",
        practicalOutcome:
          "Let colleagues and students book time with you automatically, and protect focused work time.",
        whyItMatters: "Automated scheduling removes back-and-forth emails and protects time for deep work.",
        howToSteps: [
          "In Outlook, open Bookings or Bookable pages and set the time slots you're free.",
          "Share the booking page link by email or Teams so people can book a slot themselves.",
          "Block out focus time by creating an event and marking it \"Focus time\" or \"Busy\" with reminders off.",
          "Turn on Automatic Replies (Out of Office) for holidays so Outlook lets people know you're away.",
        ],
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY", "DIGITAL_WELLBEING"],
        tool: "Outlook Calendar",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Streamline Gmail with filters and templates",
        description: "Use filters, labels, priority inbox and canned templates to manage email efficiently.",
        practicalOutcome: "Cut down time spent triaging email and respond to routine messages in seconds.",
        whyItMatters: "A well-organised inbox reduces workload and prevents important messages getting lost.",
        howToSteps: [
          "Turn on templates: Settings > Advanced > enable \"Templates\", then draft an email and save it as one.",
          "Create a filter: click the search-options arrow in the search bar, set your criteria, then \"Create filter\".",
          "Have the filter apply a label and skip the inbox for routine, low-priority senders.",
          "Switch your inbox type to Priority Inbox under Settings > Inbox so important mail surfaces first.",
        ],
        benefitCategories: ["WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "Gmail",
        estimatedTimeMins: 25,
        platform: "GOOGLE",
      },
      {
        title: "Streamline Outlook with rules and Quick Parts",
        description: "Use rules, categories and Quick Parts (reusable text blocks) to manage email efficiently.",
        practicalOutcome: "Cut down time spent triaging email and respond to routine messages in seconds.",
        whyItMatters: "A well-organised inbox reduces workload and prevents important messages getting lost.",
        howToSteps: [
          "Draft a reusable reply once, select the text, then Insert > Quick Parts > Save Selection to Quick Part Gallery.",
          "Create a rule: File > Manage Rules & Alerts > New Rule, set your criteria and an action (e.g. move to folder).",
          "Have the rule apply a category and skip the inbox for routine, low-priority senders.",
          "Turn on Focused Inbox so important mail surfaces separately from the rest.",
        ],
        benefitCategories: ["WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "Outlook",
        estimatedTimeMins: 25,
        platform: "MICROSOFT",
      },
      {
        title: "Analyse data with Pivot Tables in Sheets",
        description: "Use Pivot Tables, charts and conditional formatting to analyse trends in Google Sheets.",
        practicalOutcome: "Turn raw data into clear insights you can act on or share with your team.",
        whyItMatters: "Being able to interpret data quickly supports better-informed decisions.",
        howToSteps: [
          "Select your data range, then Insert > Pivot table > Create.",
          "Drag the field you want to group by into Rows, and the field you want to total into Values.",
          "Select your data and use Insert > Chart to visualise the pivot table's output.",
          "Use Format > Conditional formatting to colour-highlight values above or below a threshold.",
        ],
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Google Sheets",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Analyse data with PivotTables in Excel",
        description: "Use PivotTables, charts and conditional formatting to analyse trends in Excel.",
        practicalOutcome: "Turn raw data into clear insights you can act on or share with your team.",
        whyItMatters: "Being able to interpret data quickly supports better-informed decisions.",
        howToSteps: [
          "Select your data range, then Insert > PivotTable.",
          "Drag the field you want to group by into Rows, and the field you want to total into Values.",
          "Select your data and use Insert > Recommended Charts to visualise the PivotTable's output.",
          "Use Home > Conditional Formatting to colour-highlight values above or below a threshold.",
        ],
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Excel",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Apply browser extensions to optimise workflow",
        description: "Select and configure browser extensions/add-ons that streamline daily administrative tasks.",
        practicalOutcome: "Automate small repetitive tasks so you have more time for teaching and student support.",
        whyItMatters: "Small workflow tweaks compound into significant time savings over a year.",
        howToSteps: [
          "Open your browser's extension store (Chrome Web Store or Microsoft Edge Add-ons) and search for a task you repeat often (e.g. grammar checking, screen recording).",
          "Check the extension's reviews and permissions before installing — only add what you'll actually use.",
          "Pin useful extensions to the toolbar (puzzle-piece icon > pin) so they're one click away.",
          "Review your installed extensions every term and remove ones you no longer use.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING", "INNOVATION"],
        tool: "Browser extensions",
        estimatedTimeMins: 20,
      },
    ],
    Catalyst: [
      {
        title: "Model advanced Workspace shortcuts for the team",
        description: "Demonstrate advanced time-saving shortcuts and Google Workspace tricks to colleagues.",
        practicalOutcome: "Lift the whole team's productivity by spreading practical time-saving techniques.",
        whyItMatters: "Peer-led tips are often more memorable and relevant than generic training.",
        howToSteps: [
          "Pick 3–4 shortcuts you personally rely on (e.g. Docs voice typing, Sheets keyboard shortcuts).",
          "Prepare one worked example per shortcut showing the before-and-after time saved.",
          "Demo them live in 5 minutes at the start of a regular team meeting rather than a standalone session.",
          "Share a one-page cheat sheet afterwards so people can refer back to it.",
        ],
        benefitCategories: ["LEADERSHIP", "PRODUCTIVITY", "COLLABORATION"],
        tool: "Google Workspace",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Model advanced Microsoft 365 shortcuts for the team",
        description: "Demonstrate advanced time-saving shortcuts and Microsoft 365 tricks to colleagues.",
        practicalOutcome: "Lift the whole team's productivity by spreading practical time-saving techniques.",
        whyItMatters: "Peer-led tips are often more memorable and relevant than generic training.",
        howToSteps: [
          "Pick 3–4 shortcuts you personally rely on (e.g. Word dictation, Excel keyboard shortcuts).",
          "Prepare one worked example per shortcut showing the before-and-after time saved.",
          "Demo them live in 5 minutes at the start of a regular team meeting rather than a standalone session.",
          "Share a one-page cheat sheet afterwards so people can refer back to it.",
        ],
        benefitCategories: ["LEADERSHIP", "PRODUCTIVITY", "COLLABORATION"],
        tool: "Microsoft 365",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Build a team dashboard in Sheets or Looker Studio",
        description: "Build a multi-tab Sheets or Looker Studio dashboard that the team uses for daily insight.",
        practicalOutcome: "Give your team a single, live view of the metrics that matter, without manual reporting.",
        whyItMatters: "Shared dashboards replace repetitive manual reporting with reusable infrastructure.",
        howToSteps: [
          "Agree with the team on the 3–5 metrics that actually matter to track.",
          "Connect Looker Studio to a Google Sheet (Create > Data source > Google Sheets) holding that data.",
          "Add a chart per metric and arrange them on one page in order of importance.",
          "Share the dashboard link with the team and set a monthly reminder to check the data source is still updating.",
        ],
        benefitCategories: ["INNOVATION", "ORGANISATION", "TIME_SAVING"],
        tool: "Looker Studio",
        estimatedTimeMins: 60,
        platform: "GOOGLE",
      },
      {
        title: "Build a team dashboard in Excel or Power BI",
        description: "Build a multi-tab Excel workbook or Power BI dashboard that the team uses for daily insight.",
        practicalOutcome: "Give your team a single, live view of the metrics that matter, without manual reporting.",
        whyItMatters: "Shared dashboards replace repetitive manual reporting with reusable infrastructure.",
        howToSteps: [
          "Agree with the team on the 3–5 metrics that actually matter to track.",
          "Connect Power BI to an Excel workbook or SharePoint list holding that data (Get Data > Excel/SharePoint).",
          "Add a visual per metric and arrange them on one dashboard page in order of importance.",
          "Share the dashboard link with the team and set a monthly reminder to check the data source is still updating.",
        ],
        benefitCategories: ["INNOVATION", "ORGANISATION", "TIME_SAVING"],
        tool: "Power BI",
        estimatedTimeMins: 60,
        platform: "MICROSOFT",
      },
      {
        title: "Create shared template folders colleagues adopt",
        description: "Build structured, shared template folders in Drive that colleagues voluntarily adopt.",
        practicalOutcome: "Standardise good practice across the team without mandating it top-down.",
        whyItMatters:
          "Templates that genuinely save people time spread organically and raise the baseline for everyone.",
        howToSteps: [
          "Identify one document type colleagues rebuild from scratch each time (e.g. a scheme of work).",
          "Build a clean, well-formatted version and save it into a shared Drive folder named clearly, e.g. \"Templates\".",
          "Set the folder's sharing so the team can view and copy, but not edit the master file.",
          "Mention it once in a team meeting or Space rather than mandating its use — let it spread by being useful.",
        ],
        benefitCategories: ["LEADERSHIP", "ORGANISATION", "COLLABORATION"],
        tool: "Google Drive",
        estimatedTimeMins: 45,
        platform: "GOOGLE",
      },
      {
        title: "Create shared template folders colleagues adopt in SharePoint",
        description: "Build structured, shared template folders in SharePoint/OneDrive that colleagues voluntarily adopt.",
        practicalOutcome: "Standardise good practice across the team without mandating it top-down.",
        whyItMatters:
          "Templates that genuinely save people time spread organically and raise the baseline for everyone.",
        howToSteps: [
          "Identify one document type colleagues rebuild from scratch each time (e.g. a scheme of work).",
          "Build a clean, well-formatted version and save it into a shared SharePoint folder named clearly, e.g. \"Templates\".",
          "Set the folder's sharing so the team can view and copy, but not edit the master file.",
          "Mention it once in a team meeting or Teams channel rather than mandating its use — let it spread by being useful.",
        ],
        benefitCategories: ["LEADERSHIP", "ORGANISATION", "COLLABORATION"],
        tool: "SharePoint / OneDrive",
        estimatedTimeMins: 45,
        platform: "MICROSOFT",
      },
      {
        title: "Automate a team task list with AppSheet",
        description: "Build a simple AppSheet app or Workspace add-on to automate a repetitive task list.",
        practicalOutcome: "Replace a manual, error-prone process with a small custom tool the team can rely on.",
        whyItMatters: "Light-touch automation can remove hours of repetitive admin from a team's week.",
        howToSteps: [
          "Write out the repetitive process as a numbered list of steps first, on paper or in a Doc.",
          "Go to AppSheet, create a new app from an existing Google Sheet that holds the task data.",
          "Use the app editor to add simple views (a list, a form for adding new tasks) — no code needed.",
          "Test it yourself for a week before sharing the app link with the team.",
        ],
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "AppSheet",
        estimatedTimeMins: 60,
        platform: "GOOGLE",
      },
      {
        title: "Automate a team task list with Power Automate",
        description: "Build a simple Power Automate flow or Power Apps app to automate a repetitive task list.",
        practicalOutcome: "Replace a manual, error-prone process with a small custom tool the team can rely on.",
        whyItMatters: "Light-touch automation can remove hours of repetitive admin from a team's week.",
        howToSteps: [
          "Write out the repetitive process as a numbered list of steps first, on paper or in a Doc.",
          "Go to Power Automate, create a new flow triggered from an Excel table or SharePoint list holding the task data.",
          "Use the flow editor to add simple actions (notify, update status) — no code needed.",
          "Test it yourself for a week before sharing the flow with the team.",
        ],
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "TIME_SAVING"],
        tool: "Power Automate",
        estimatedTimeMins: 60,
        platform: "MICROSOFT",
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
        howToSteps: [
          "Use 3–5 specific keywords rather than a full sentence, e.g. \"Year 9 photosynthesis revision resources\".",
          "Put exact phrases in quotation marks to search for that precise wording.",
          "Add site:ac.uk or site:gov.uk to restrict results to education or government sources.",
          "Use the search engine's \"Tools\" filter to restrict results to recently published, up-to-date material.",
        ],
        benefitCategories: ["PRODUCTIVITY", "PROFESSIONAL_PRACTICE"],
        tool: "Web search",
        estimatedTimeMins: 10,
      },
      {
        title: "Spot phishing and unreliable sources",
        description: "Identify suspicious emails (phishing) and evaluate the reliability of online sources.",
        practicalOutcome: "Protect yourself and your organisation from scams while helping others spot red flags.",
        whyItMatters: "Basic scepticism and verification habits are a frontline defence against cyber threats.",
        howToSteps: [
          "Hover over (don't click) any link in an email to check where it actually leads before trusting it.",
          "Check the sender's full email address, not just the display name, for misspellings or odd domains.",
          "Be wary of urgency (\"act now\") or requests for passwords/payment — legitimate services rarely ask this way.",
          "Use the \"Report phishing\" option in Gmail rather than just deleting a suspicious email.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "ORGANISATION"],
        tool: "Gmail / browser",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Spot phishing and unreliable sources in Outlook",
        description: "Identify suspicious emails (phishing) and evaluate the reliability of online sources.",
        practicalOutcome: "Protect yourself and your organisation from scams while helping others spot red flags.",
        whyItMatters: "Basic scepticism and verification habits are a frontline defence against cyber threats.",
        howToSteps: [
          "Hover over (don't click) any link in an email to check where it actually leads before trusting it.",
          "Check the sender's full email address, not just the display name, for misspellings or odd domains.",
          "Be wary of urgency (\"act now\") or requests for passwords/payment — legitimate services rarely ask this way.",
          "Use the \"Report\" > \"Phishing\" option in Outlook rather than just deleting a suspicious email.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "ORGANISATION"],
        tool: "Outlook / browser",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Filter and sort data in Sheets",
        description: "Filter basic data lists and sort columns in Google Sheets to find what you need.",
        practicalOutcome: "Quickly locate the exact information you need within a larger spreadsheet.",
        whyItMatters: "Being able to interrogate a spreadsheet, not just read it, saves real time.",
        howToSteps: [
          "Select your data range and click Data > Create a filter.",
          "Click the filter icon on a column header to show only rows matching a value or condition.",
          "Use Data > Sort range to reorder rows by a column, e.g. alphabetically or by date.",
          "Turn the filter off (Data > Remove filter) once you're done so others see all the data again.",
        ],
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Google Sheets",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Filter and sort data in Excel",
        description: "Filter basic data lists and sort columns in Excel to find what you need.",
        practicalOutcome: "Quickly locate the exact information you need within a larger spreadsheet.",
        whyItMatters: "Being able to interrogate a spreadsheet, not just read it, saves real time.",
        howToSteps: [
          "Select your data range and click Data > Filter.",
          "Click the filter arrow on a column header to show only rows matching a value or condition.",
          "Use Data > Sort to reorder rows by a column, e.g. alphabetically or by date.",
          "Turn the filter off (Data > Filter) once you're done so others see all the data again.",
        ],
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Excel",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Reference sources appropriately",
        description: "Cite or reference external sources appropriately when creating teaching or admin materials.",
        practicalOutcome: "Produce materials that model good academic practice and respect copyright.",
        whyItMatters: "Modelling correct referencing sets the standard learners are expected to follow.",
        howToSteps: [
          "Note the author, title, publisher and date for any source as soon as you use it, not afterwards.",
          "In Google Docs, use Tools > Citations to build a formatted reference list in your institution's required style.",
          "Add an in-text citation or footnote wherever you've directly quoted or closely paraphrased a source.",
          "Include a short \"References\" section at the end of the document, not just links scattered through the text.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Docs / Slides",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Reference sources appropriately in Word",
        description: "Cite or reference external sources appropriately when creating teaching or admin materials.",
        practicalOutcome: "Produce materials that model good academic practice and respect copyright.",
        whyItMatters: "Modelling correct referencing sets the standard learners are expected to follow.",
        howToSteps: [
          "Note the author, title, publisher and date for any source as soon as you use it, not afterwards.",
          "In Word, use References > Citations & Bibliography to build a formatted reference list in your institution's required style.",
          "Add an in-text citation or footnote wherever you've directly quoted or closely paraphrased a source.",
          "Include a short \"References\" section at the end of the document, not just links scattered through the text.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Word / PowerPoint",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
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
        howToSteps: [
          "Treat any factual claim from an AI tool as a first draft — verify names, dates and figures independently.",
          "Ask the tool to cite its sources, then actually open and check two or three of them.",
          "Watch for confident-sounding but generic answers — a sign the tool may be guessing rather than knowing.",
          "Have a colleague sense-check anything AI-generated before it goes in front of learners or is published.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Evaluate the credibility of Copilot-generated content",
        description:
          "Evaluate the accuracy and credibility of online information, research, and AI-generated content.",
        practicalOutcome:
          "Use AI tools with confidence, while catching inaccurate or biased output before it reaches learners.",
        whyItMatters: "AI tools are powerful but fallible — critical evaluation prevents misinformation spreading.",
        howToSteps: [
          "Treat any factual claim from an AI tool as a first draft — verify names, dates and figures independently.",
          "Ask Copilot to cite its sources, then actually open and check two or three of them.",
          "Watch for confident-sounding but generic answers — a sign the tool may be guessing rather than knowing.",
          "Have a colleague sense-check anything AI-generated before it goes in front of learners or is published.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Copilot",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Extract insight from documents with Gemini",
        description:
          "Use Gemini to extract text, key insights and structured data from PDFs, CSVs, images or audio transcripts.",
        practicalOutcome: "Turn a pile of source documents into a usable summary in minutes, not hours.",
        whyItMatters:
          "This single skill can remove hours of manual reading and re-typing from admin-heavy weeks.",
        howToSteps: [
          "Open Gemini and attach the PDF, image or transcript using the attachment (paperclip) icon.",
          "Ask a specific question, e.g. \"list the key deadlines and amounts mentioned in this document\".",
          "Ask it to output the result as a table or bullet list so it's easy to scan or paste into a spreadsheet.",
          "Spot-check the extracted details against the original document before relying on them.",
        ],
        benefitCategories: ["TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Gemini",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Extract insight from documents with Copilot",
        description:
          "Use Copilot to extract text, key insights and structured data from PDFs, CSVs, images or audio transcripts.",
        practicalOutcome: "Turn a pile of source documents into a usable summary in minutes, not hours.",
        whyItMatters:
          "This single skill can remove hours of manual reading and re-typing from admin-heavy weeks.",
        howToSteps: [
          "Open Copilot and attach the PDF, image or transcript using the attachment icon.",
          "Ask a specific question, e.g. \"list the key deadlines and amounts mentioned in this document\".",
          "Ask it to output the result as a table or bullet list so it's easy to scan or paste into Excel.",
          "Spot-check the extracted details against the original document before relying on them.",
        ],
        benefitCategories: ["TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Copilot",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Clean and import external data into Sheets",
        description: "Clean and import external raw data (e.g. CSV exports) into Google Sheets.",
        practicalOutcome: "Get messy exported data into a usable, analysable format reliably.",
        whyItMatters:
          "Most 'real world' data needs cleaning before it is useful — this unlocks everything else in Sheets.",
        howToSteps: [
          "Import the file with File > Import > Upload, choosing \"Insert new sheet\" so the original stays intact.",
          "Use Data > Split text to columns if a whole row landed in one column.",
          "Use Data > Data cleanup > Remove duplicates to strip out repeated rows.",
          "Check date and number columns are formatted correctly (Format > Number) before analysing them.",
        ],
        benefitCategories: ["ORGANISATION", "PRODUCTIVITY"],
        tool: "Google Sheets",
        platform: "GOOGLE",
        estimatedTimeMins: 25,
      },
      {
        title: "Clean and import external data into Excel",
        description: "Clean and import external raw data (e.g. CSV exports) into Excel.",
        practicalOutcome: "Get messy exported data into a usable, analysable format reliably.",
        whyItMatters:
          "Most 'real world' data needs cleaning before it is useful — this unlocks everything else in Excel.",
        howToSteps: [
          "Import the file with Data > Get Data > From Text/CSV, so the original file stays untouched.",
          "Use Data > Text to Columns if a whole row landed in one column.",
          "Use Data > Remove Duplicates to strip out repeated rows.",
          "Check date and number columns are formatted correctly (Home > Number format) before analysing them.",
        ],
        benefitCategories: ["ORGANISATION", "PRODUCTIVITY"],
        tool: "Excel",
        platform: "MICROSOFT",
        estimatedTimeMins: 25,
      },
      {
        title: "Apply Creative Commons licensing correctly",
        description: "Apply Creative Commons licenses correctly when re-using external images or media.",
        practicalOutcome: "Use rich media in your materials confidently, without copyright risk to your institution.",
        whyItMatters: "Correct licensing protects your institution and models good digital citizenship.",
        howToSteps: [
          "Search using a filter for reusable content, e.g. an image search's \"Usage rights\" filter.",
          "Check the specific licence (e.g. CC BY, CC BY-NC) on the source page — they have different rules.",
          "Add the required attribution (creator name, licence type, source link) next to the image or in your credits.",
          "Never strip a Creative Commons image of its attribution, even when resizing or editing it.",
        ],
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
        howToSteps: [
          "Collect 2–3 real examples of misleading AI output or unreliable sources colleagues have encountered.",
          "Turn them into a short \"spot the problem\" exercise for a team meeting.",
          "Share a simple checklist: check the author, check the date, check for a second source.",
          "Offer to review one piece of AI-assisted work per colleague as a low-pressure practice run.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Gemini / web search",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Guide colleagues on evaluating Copilot and online sources",
        description:
          "Guide colleagues on how to write effective search queries and evaluate the credibility of online or AI sources.",
        practicalOutcome: "Raise the whole team's information literacy, not just your own.",
        whyItMatters: "A team that can critically evaluate sources produces more reliable teaching materials.",
        howToSteps: [
          "Collect 2–3 real examples of misleading AI output or unreliable sources colleagues have encountered.",
          "Turn them into a short \"spot the problem\" exercise for a team meeting.",
          "Share a simple checklist: check the author, check the date, check for a second source.",
          "Offer to review one piece of AI-assisted work per colleague as a low-pressure practice run.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Copilot / web search",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Translate team data into visual charts",
        description: "Translate complex team data or performance metrics into clean visual charts for meetings.",
        practicalOutcome: "Help colleagues grasp key trends at a glance instead of scanning raw numbers.",
        whyItMatters: "Good visualisation turns data into decisions.",
        howToSteps: [
          "Identify the one question the chart needs to answer before choosing a chart type.",
          "In Sheets, select the relevant data and use Insert > Chart, then pick the simplest type that fits.",
          "Remove clutter — delete gridlines, legends or labels that don't add information.",
          "Add a one-line takeaway as the chart title instead of a generic label like \"Chart 1\".",
        ],
        benefitCategories: ["COMMUNICATION", "ORGANISATION"],
        tool: "Google Sheets",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Translate team data into visual charts in Excel",
        description: "Translate complex team data or performance metrics into clean visual charts for meetings.",
        practicalOutcome: "Help colleagues grasp key trends at a glance instead of scanning raw numbers.",
        whyItMatters: "Good visualisation turns data into decisions.",
        howToSteps: [
          "Identify the one question the chart needs to answer before choosing a chart type.",
          "In Excel, select the relevant data and use Insert > Recommended Charts, then pick the simplest type that fits.",
          "Remove clutter — delete gridlines, legends or labels that don't add information.",
          "Add a one-line takeaway as the chart title instead of a generic label like \"Chart 1\".",
        ],
        benefitCategories: ["COMMUNICATION", "ORGANISATION"],
        tool: "Excel",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Champion open-access resource sharing",
        description:
          "Share clear guidance within the team on using open-access resources such as Creative Commons media.",
        practicalOutcome: "Build a shared library of legally reusable media the whole team can draw on.",
        whyItMatters: "Clear shared norms prevent accidental copyright issues across a department.",
        howToSteps: [
          "Write a short, plain-English one-pager on what Creative Commons licences allow and require.",
          "Create a shared folder (Drive or SharePoint) where colleagues can drop reusable images/media they've found and cleared.",
          "Pin the one-pager and folder link in the team's chat/Space homepage.",
          "Mention it again at the start of a new term when people are planning fresh resources.",
        ],
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
        howToSteps: [
          "Pick one colleague and one of their existing resources to trial an accessibility tool on together.",
          "Show them live captions in Meet, then Docs' Tools > Accessibility settings, in the same short session.",
          "Ask them to try it solo on their next resource and check in a week later on how it went.",
          "Keep a short shared list of \"quick accessibility wins\" the team can refer back to.",
        ],
        benefitCategories: ["ACCESSIBILITY", "INCLUSION", "LEADERSHIP"],
        tool: "Gemini / accessibility tools",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Mentor colleagues on Copilot accessibility tools",
        description:
          "Mentor colleagues on AI-powered accessibility tools — live captioning, text-to-speech, screen-reading optimisation.",
        practicalOutcome: "Help embed accessibility by design across the team's materials, not as an afterthought.",
        whyItMatters: "Inclusive-by-design materials benefit every learner, not just those who request adjustments.",
        howToSteps: [
          "Pick one colleague and one of their existing resources to trial an accessibility tool on together.",
          "Show them live captions in Teams, then Word's Accessibility Checker (Review > Check Accessibility), in the same short session.",
          "Ask them to try it solo on their next resource and check in a week later on how it went.",
          "Keep a short shared list of \"quick accessibility wins\" the team can refer back to.",
        ],
        benefitCategories: ["ACCESSIBILITY", "INCLUSION", "LEADERSHIP"],
        tool: "Copilot / accessibility tools",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
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
        howToSteps: [
          "Start from a simple theme (Slide > Theme) rather than a blank canvas.",
          "Keep one idea per slide — if you need two headlines, make it two slides.",
          "Aim for a short headline plus 3–4 bullet points maximum, or a single image, per slide.",
          "Use the same font and colour scheme throughout by editing the Master (View > Theme builder).",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "STUDENT_ENGAGEMENT"],
        tool: "Google Slides",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Build clean presentations in PowerPoint",
        description: "Build clean PowerPoint presentations with clear text and simple visuals.",
        practicalOutcome: "Deliver sessions that look professional and keep the audience's attention on your message.",
        whyItMatters: "A well-designed slide deck reduces cognitive load for your audience.",
        howToSteps: [
          "Start from a Design theme (Design tab) rather than a blank canvas.",
          "Keep one idea per slide — if you need two headlines, make it two slides.",
          "Aim for a short headline plus 3–4 bullet points maximum, or a single image, per slide.",
          "Use the same font and colour scheme throughout by editing the Slide Master (View > Slide Master).",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "STUDENT_ENGAGEMENT"],
        tool: "PowerPoint",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Create a simple Google Form",
        description: "Create a basic Google Form to capture feedback, registrations or quick checks.",
        practicalOutcome: "Replace a paper or email-based process with a quick digital form.",
        whyItMatters: "One well-built form can eliminate a recurring manual admin task for good.",
        howToSteps: [
          "Go to forms.google.com and click the + (Blank form).",
          "Add a title, then click + to add each question, choosing the right question type (short answer, multiple choice etc.).",
          "Click the Send button and share via link, email, or embed it in Classroom.",
          "Open the Responses tab to view answers, or click the Sheets icon to send them to a spreadsheet.",
        ],
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Google Forms",
        estimatedTimeMins: 15,
        evidencePrompt: "Share a link to a form you built and what it replaced.",
        platform: "GOOGLE",
      },
      {
        title: "Create a simple Microsoft Form",
        description: "Create a basic Microsoft Form to capture feedback, registrations or quick checks.",
        practicalOutcome: "Replace a paper or email-based process with a quick digital form.",
        whyItMatters: "One well-built form can eliminate a recurring manual admin task for good.",
        howToSteps: [
          "Go to forms.office.com and click + New Form.",
          "Add a title, then click + Add new to add each question, choosing the right question type.",
          "Click Share and copy the link, or embed it in Teams.",
          "Open the Responses tab to view answers, or click Open in Excel to send them to a spreadsheet.",
        ],
        benefitCategories: ["TIME_SAVING", "ORGANISATION"],
        tool: "Microsoft Forms",
        estimatedTimeMins: 15,
        evidencePrompt: "Share a link to a form you built and what it replaced.",
        platform: "MICROSOFT",
      },
      {
        title: "Solve routine tech hiccups independently",
        description: "Solve basic tech hiccups such as refreshing browsers, checking Wi-Fi, or restarting devices.",
        practicalOutcome: "Get back to work quickly without waiting on IT for simple issues.",
        whyItMatters: "Basic troubleshooting confidence reduces downtime for you and for IT support.",
        howToSteps: [
          "If a page misbehaves, refresh it first (Ctrl/Cmd+R) before assuming something is broken.",
          "If Wi-Fi drops, check the icon in the system tray and try reconnecting before restarting anything.",
          "If a device is slow or frozen, save your work if possible, then restart it fully rather than force-closing everything.",
          "If the problem persists after these three steps, log it with IT with a note of what you already tried.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "General troubleshooting",
        estimatedTimeMins: 10,
      },
      {
        title: "Insert media cleanly into documents",
        description: "Insert images, charts or media cleanly into Slides, Docs or Forms.",
        practicalOutcome: "Make materials more engaging and easier to understand at a glance.",
        whyItMatters: "Well-placed visuals improve comprehension, especially for visual learners.",
        howToSteps: [
          "Use Insert > Image rather than copy-pasting, so the file is added at full quality.",
          "Resize by dragging a corner handle — never a side handle, which stretches and distorts the image.",
          "Use Insert > Image > Search the web to find a right-to-use image without leaving the document.",
          "Add alt text (right-click the image > Alt text) so screen readers can describe it.",
        ],
        benefitCategories: ["STUDENT_ENGAGEMENT", "PROFESSIONAL_PRACTICE"],
        tool: "Any office app",
        estimatedTimeMins: 10,
      },
    ],
    Elevator: [
      {
        title: "Build multi-page Google Sites",
        description: "Build multi-page Google Sites for team hubs, project pages or student learning portals.",
        practicalOutcome: "Give your team or learners a single, well-organised home for key resources.",
        whyItMatters: "A dedicated site reduces repeated 'where do I find X' questions.",
        howToSteps: [
          "Go to sites.google.com and start a blank site, or pick a template.",
          "Add a page per topic using the Pages tab, and keep the navigation menu to 5–7 items maximum.",
          "Embed Docs, Sheets, Forms or Slides directly onto pages using Insert rather than just linking out to them.",
          "Click Publish and set who can view it (anyone in your organisation, or specific people).",
        ],
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "Google Sites",
        estimatedTimeMins: 45,
        platform: "GOOGLE",
      },
      {
        title: "Build multi-page SharePoint sites",
        description: "Build multi-page SharePoint sites for team hubs, project pages or student learning portals.",
        practicalOutcome: "Give your team or learners a single, well-organised home for key resources.",
        whyItMatters: "A dedicated site reduces repeated 'where do I find X' questions.",
        howToSteps: [
          "Go to your SharePoint home and click + Create site, then choose a template.",
          "Add a page per topic using Pages, and keep the navigation menu to 5–7 items maximum.",
          "Embed Word, Excel, Forms or PowerPoint directly onto pages using the file web part rather than just linking out.",
          "Click Publish and set who can view it (the whole organisation, or specific people/groups).",
        ],
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "SharePoint",
        estimatedTimeMins: 45,
        platform: "MICROSOFT",
      },
      {
        title: "Design Forms with branching logic",
        description: "Create advanced Google Forms with section branching (conditional logic) and auto-scoring.",
        practicalOutcome: "Build a form that adapts its questions based on responses, cutting irrelevant questions.",
        whyItMatters: "Adaptive forms feel personal and reduce respondent drop-off.",
        howToSteps: [
          "Break your form into sections using the \"Add section\" icon (two horizontal lines).",
          "On a multiple-choice question, click the three dots > \"Go to section based on answer\" for each option.",
          "For auto-scoring, turn on quiz mode in Settings, then set correct answers and point values per question.",
          "Test every branch yourself by submitting the form with each possible answer combination.",
        ],
        benefitCategories: ["ASSESSMENT", "TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Google Forms",
        estimatedTimeMins: 30,
        evidencePrompt: "Describe the branching logic you built and what problem it solved.",
        platform: "GOOGLE",
      },
      {
        title: "Design Microsoft Forms with branching logic",
        description: "Create advanced Microsoft Forms with branching logic and auto-scoring.",
        practicalOutcome: "Build a form that adapts its questions based on responses, cutting irrelevant questions.",
        whyItMatters: "Adaptive forms feel personal and reduce respondent drop-off.",
        howToSteps: [
          "On a question, click the three dots > Add branching, then set which question each answer jumps to.",
          "For auto-scoring, switch the form to a Quiz (More form settings > toggle Quiz) and set correct answers and points.",
          "Use \"End of the form\" as a branch target to skip remaining questions for some respondents.",
          "Test every branch yourself by submitting the form with each possible answer combination.",
        ],
        benefitCategories: ["ASSESSMENT", "TIME_SAVING", "WORKLOAD_REDUCTION"],
        tool: "Microsoft Forms",
        estimatedTimeMins: 30,
        evidencePrompt: "Describe the branching logic you built and what problem it solved.",
        platform: "MICROSOFT",
      },
      {
        title: "Write structured Gemini prompts for learning resources",
        description:
          "Write structured, contextual Gemini prompts to design differentiated learning resources and quizzes.",
        practicalOutcome: "Generate first drafts of differentiated resources in minutes instead of starting from scratch.",
        whyItMatters: "Good prompting turns a general-purpose AI tool into a genuinely useful planning assistant.",
        howToSteps: [
          "State the audience, level and topic clearly, e.g. \"Level 2 hospitality learners, food safety basics\".",
          "Ask for a specific format and length, e.g. \"a 10-question multiple-choice quiz with answers\".",
          "Ask for a version at two different difficulty levels in the same prompt to save a second round trip.",
          "Review and edit the output for accuracy and tone before using it — treat it as a first draft.",
        ],
        benefitCategories: ["TIME_SAVING", "STUDENT_OUTCOMES", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 25,
        platform: "GOOGLE",
      },
      {
        title: "Write structured Copilot prompts for learning resources",
        description:
          "Write structured, contextual Copilot prompts to design differentiated learning resources and quizzes.",
        practicalOutcome: "Generate first drafts of differentiated resources in minutes instead of starting from scratch.",
        whyItMatters: "Good prompting turns a general-purpose AI tool into a genuinely useful planning assistant.",
        howToSteps: [
          "State the audience, level and topic clearly, e.g. \"Level 2 hospitality learners, food safety basics\".",
          "Ask for a specific format and length, e.g. \"a 10-question multiple-choice quiz with answers\".",
          "Ask for a version at two different difficulty levels in the same prompt to save a second round trip.",
          "Review and edit the output for accuracy and tone before using it — treat it as a first draft.",
        ],
        benefitCategories: ["TIME_SAVING", "STUDENT_OUTCOMES", "INNOVATION"],
        tool: "Copilot",
        estimatedTimeMins: 25,
        platform: "MICROSOFT",
      },
      {
        title: "Turn documents into video walkthroughs",
        description:
          "Use Google Vids to transform static Docs or PDFs into short video walkthroughs with AI-generated scripts.",
        practicalOutcome: "Turn a dense written process into a short video people actually watch and follow.",
        whyItMatters: "Short video walkthroughs cut down repeat questions about routine processes.",
        howToSteps: [
          "Open Google Vids and choose \"Create from a document\", then select your Doc or PDF.",
          "Review the AI-generated script and scenes, editing anything inaccurate or too wordy.",
          "Record a short voiceover yourself, or use the built-in text-to-speech narration.",
          "Export or share the video link directly rather than the original document.",
        ],
        benefitCategories: ["COMMUNICATION", "TIME_SAVING", "ACCESSIBILITY"],
        tool: "Google Vids",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Turn documents into video walkthroughs with Clipchamp",
        description:
          "Use Clipchamp to transform static Word or PDF documents into short video walkthroughs with AI-generated scripts.",
        practicalOutcome: "Turn a dense written process into a short video people actually watch and follow.",
        whyItMatters: "Short video walkthroughs cut down repeat questions about routine processes.",
        howToSteps: [
          "Open Clipchamp and choose a template, or start from a script generated by Copilot from your document.",
          "Review the script and scenes, editing anything inaccurate or too wordy.",
          "Record a short voiceover yourself, or use the built-in text-to-speech narration.",
          "Export or share the video link directly rather than the original document.",
        ],
        benefitCategories: ["COMMUNICATION", "TIME_SAVING", "ACCESSIBILITY"],
        tool: "Clipchamp",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Explore VR and immersive learning spaces",
        description:
          "Access 3D asset libraries and 360-degree media, and try the Immersive Space or Igloo for a session.",
        practicalOutcome: "Give learners a memorable, hard-to-replicate experience for hands-on or high-stakes topics.",
        whyItMatters: "Immersive tools work best where a topic is otherwise hard, expensive or unsafe to practise.",
        howToSteps: [
          "Book a slot in your institution's Immersive Space or Igloo through the usual room-booking system.",
          "Browse an existing 3D or 360° asset library first rather than building content from scratch.",
          "Run a short, low-stakes trial session with a small group before committing a whole class to it.",
          "Ask attendees for quick feedback afterwards on comfort and clarity, not just enjoyment.",
        ],
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
        howToSteps: [
          "Interview 2–3 people who currently do the manual process to map every step and decision point.",
          "Sketch the form's branching logic on paper before building anything in Forms.",
          "Build and test it with the same people who described the original process.",
          "Run it in parallel with the old process for one cycle before fully retiring the old way.",
        ],
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "LEADERSHIP"],
        tool: "Google Forms",
        estimatedTimeMins: 60,
        platform: "GOOGLE",
      },
      {
        title: "Solve a bottleneck with a logic-based Microsoft Form",
        description: "Solve a long-standing operational bottleneck by designing an interactive, logic-based Microsoft Form.",
        practicalOutcome: "Remove a process that has wasted staff time for years with one well-designed form.",
        whyItMatters: "Digital problem-solving delivers most value when aimed at a real, longstanding pain point.",
        howToSteps: [
          "Interview 2–3 people who currently do the manual process to map every step and decision point.",
          "Sketch the form's branching logic on paper before building anything in Forms.",
          "Build and test it with the same people who described the original process.",
          "Run it in parallel with the old process for one cycle before fully retiring the old way.",
        ],
        benefitCategories: ["INNOVATION", "WORKLOAD_REDUCTION", "LEADERSHIP"],
        tool: "Microsoft Forms",
        estimatedTimeMins: 60,
        platform: "MICROSOFT",
      },
      {
        title: "Build and share custom Gems",
        description: "Build, configure and share custom Gems (tailored AI assistants) loaded with departmental knowledge.",
        practicalOutcome: "Give your team a ready-made AI assistant tuned to your subject or department's needs.",
        whyItMatters: "A well-configured Gem saves every future user the work of re-explaining context each time.",
        howToSteps: [
          "In Gemini, choose \"Create a Gem\" and give it a clear name and purpose.",
          "Write instructions describing exactly how it should behave, e.g. \"always answer as an experienced course assessor would\".",
          "Upload key reference documents (specifications, templates) for it to draw on.",
          "Test it with a colleague's real question before sharing the Gem with the wider team.",
        ],
        benefitCategories: ["INNOVATION", "TIME_SAVING", "COLLABORATION"],
        tool: "Gemini Gems",
        estimatedTimeMins: 60,
        platform: "GOOGLE",
      },
      {
        title: "Build and share custom Copilot agents",
        description: "Build, configure and share custom Copilot agents (tailored AI assistants) loaded with departmental knowledge.",
        practicalOutcome: "Give your team a ready-made AI assistant tuned to your subject or department's needs.",
        whyItMatters: "A well-configured agent saves every future user the work of re-explaining context each time.",
        howToSteps: [
          "In Copilot Studio, choose \"Create an agent\" and give it a clear name and purpose.",
          "Write instructions describing exactly how it should behave, e.g. \"always answer as an experienced course assessor would\".",
          "Upload key reference documents (specifications, templates) for it to draw on.",
          "Test it with a colleague's real question before sharing the agent with the wider team.",
        ],
        benefitCategories: ["INNOVATION", "TIME_SAVING", "COLLABORATION"],
        tool: "Copilot Studio",
        estimatedTimeMins: 60,
        platform: "MICROSOFT",
      },
      {
        title: "Try a new tool and share what worked",
        description: "Try a new Google feature or edtech tool in your own work and present 'what worked / what didn't' to peers.",
        practicalOutcome: "Give colleagues an honest, low-risk way to learn from your experimentation.",
        whyItMatters: "Peer-tested recommendations are trusted more than generic training material.",
        howToSteps: [
          "Pick one new tool and one specific, low-stakes task to try it on — not your most important piece of work.",
          "Keep quick notes on what was easy, what was fiddly, and how long it actually took.",
          "Prepare 2–3 slides or a short demo, honest about the downsides as well as the upsides.",
          "Share it at a regular team meeting rather than creating a separate session.",
        ],
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
        howToSteps: [
          "Identify a scenario across your institution that's genuinely hard, costly or unsafe to practise in real life.",
          "Approach the immersive learning lead with that specific use case rather than a general request.",
          "Run a pilot session with one curriculum area and gather structured feedback from staff and learners.",
          "Present the pilot's outcomes to senior leaders to make the case for wider rollout.",
        ],
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
        howToSteps: [
          "Click the meeting link a few minutes early to check your camera and microphone preview.",
          "Use the microphone and camera icons at the bottom of the screen to mute/unmute and turn video on/off.",
          "Open the chat panel (speech-bubble icon) to send a message or link without interrupting the speaker.",
          "Use the hand-raise icon if you want to speak without talking over someone.",
        ],
        benefitCategories: ["COMMUNICATION", "PRODUCTIVITY"],
        tool: "Google Meet",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Join Teams calls confidently",
        description: "Join Microsoft Teams calls comfortably, managing microphone, camera and text chat.",
        practicalOutcome: "Take part in online meetings and sessions without technical distractions.",
        whyItMatters: "Confidence with the basics is the foundation for everything else in online collaboration.",
        howToSteps: [
          "Click the meeting link a few minutes early to check your camera and microphone preview.",
          "Use the microphone and camera icons at the bottom of the screen to mute/unmute and turn video on/off.",
          "Open the chat panel (speech-bubble icon) to send a message or link without interrupting the speaker.",
          "Use the \"React\" hand-raise icon if you want to speak without talking over someone.",
        ],
        benefitCategories: ["COMMUNICATION", "PRODUCTIVITY"],
        tool: "Microsoft Teams",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
      {
        title: "Comment and suggest in shared Docs",
        description: "Co-author shared Google Docs or Slides by leaving basic comments and suggestions.",
        practicalOutcome: "Collaborate on a shared document without overwriting colleagues' work.",
        whyItMatters: "Comments and suggestions keep collaborative editing transparent and reversible.",
        howToSteps: [
          "Switch to Suggesting mode using the pencil icon (top right) instead of Editing mode.",
          "Highlight text and click the comment icon, or press Ctrl/Cmd+Alt+M, to leave a comment.",
          "Type @ followed by a colleague's name to notify them directly about a comment.",
          "Click Resolve on a comment thread once it's been addressed, rather than deleting it.",
        ],
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Google Docs",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Comment and track changes in shared Word docs",
        description: "Co-author shared Word documents by leaving comments and using Track Changes.",
        practicalOutcome: "Collaborate on a shared document without overwriting colleagues' work.",
        whyItMatters: "Comments and tracked changes keep collaborative editing transparent and reversible.",
        howToSteps: [
          "Turn on Track Changes (Review > Track Changes) instead of editing directly.",
          "Highlight text and click New Comment on the Review tab to leave a comment.",
          "Type @ followed by a colleague's name to notify them directly about a comment.",
          "Mark a comment Resolve once it's been addressed, rather than deleting it.",
        ],
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Word",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
      {
        title: "Communicate professionally by email and Chat",
        description: "Communicate professionally via email and Google Chat using appropriate tone.",
        practicalOutcome: "Build a professional digital reputation through clear, well-judged messages.",
        whyItMatters: "Written tone is easy to misjudge online — a little care avoids real misunderstandings.",
        howToSteps: [
          "Open with a short greeting and state your purpose in the first sentence.",
          "Re-read a message before sending if it was written quickly or while frustrated.",
          "Save Chat for quick, informal questions and Gmail for anything that needs a record or is more formal.",
          "Avoid ALL CAPS and excessive punctuation, which can read as shouting even when not intended.",
        ],
        benefitCategories: ["COMMUNICATION", "PROFESSIONAL_PRACTICE"],
        tool: "Gmail / Google Chat",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Communicate professionally by email and Teams chat",
        description: "Communicate professionally via Outlook and Teams chat using appropriate tone.",
        practicalOutcome: "Build a professional digital reputation through clear, well-judged messages.",
        whyItMatters: "Written tone is easy to misjudge online — a little care avoids real misunderstandings.",
        howToSteps: [
          "Open with a short greeting and state your purpose in the first sentence.",
          "Re-read a message before sending if it was written quickly or while frustrated.",
          "Save Teams chat for quick, informal questions and Outlook for anything that needs a record or is more formal.",
          "Avoid ALL CAPS and excessive punctuation, which can read as shouting even when not intended.",
        ],
        benefitCategories: ["COMMUNICATION", "PROFESSIONAL_PRACTICE"],
        tool: "Outlook / Teams",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
      {
        title: "Set sharing permissions correctly in Drive",
        description: "Set file-sharing permissions correctly in Google Drive ('Viewer' vs 'Editor').",
        practicalOutcome: "Share files with exactly the right level of access, protecting sensitive information.",
        whyItMatters: "Incorrect sharing permissions are a common cause of data protection issues.",
        howToSteps: [
          "Right-click the file or folder and choose Share.",
          "Add people by email rather than using \"Anyone with the link\" for anything sensitive.",
          "Choose Viewer, Commenter or Editor deliberately for each person — don't default to Editor.",
          "Review sharing periodically (Share > see who has access) and remove people who no longer need it.",
        ],
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Google Drive",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Set sharing permissions correctly in OneDrive",
        description: "Set file-sharing permissions correctly in OneDrive/SharePoint ('View' vs 'Edit').",
        practicalOutcome: "Share files with exactly the right level of access, protecting sensitive information.",
        whyItMatters: "Incorrect sharing permissions are a common cause of data protection issues.",
        howToSteps: [
          "Right-click the file or folder and choose Share.",
          "Add specific people by name/email rather than using \"Anyone with the link\" for anything sensitive.",
          "Choose \"Can view\" or \"Can edit\" deliberately for each person — don't default to edit access.",
          "Review sharing periodically (Manage access) and remove people who no longer need it.",
        ],
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "OneDrive / SharePoint",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
    ],
    Elevator: [
      {
        title: "Host Meet sessions with polls and breakouts",
        description: "Host and facilitate Google Meet meetings using features like polls, Q&A and breakout rooms.",
        practicalOutcome: "Run more interactive online sessions that keep attendees engaged, not just listening.",
        whyItMatters: "Interactive facilitation features noticeably improve engagement in online meetings.",
        howToSteps: [
          "Click Activities (bottom right) to launch a Poll or Q&A during the call.",
          "Prepare 2–3 poll questions in advance so they're ready to fire off at the right moment.",
          "For breakout rooms, click Activities > Breakout rooms, set the number of rooms, and assign people.",
          "Pop into each breakout room briefly to check discussions are on track before calling everyone back.",
        ],
        benefitCategories: ["STUDENT_ENGAGEMENT", "COMMUNICATION"],
        tool: "Google Meet",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Host Teams sessions with polls and breakout rooms",
        description: "Host and facilitate Microsoft Teams meetings using features like polls, Q&A and breakout rooms.",
        practicalOutcome: "Run more interactive online sessions that keep attendees engaged, not just listening.",
        whyItMatters: "Interactive facilitation features noticeably improve engagement in online meetings.",
        howToSteps: [
          "Add the Polls app before or during the meeting (+ icon > Polls) to launch a poll.",
          "Prepare 2–3 poll questions in advance so they're ready to fire off at the right moment.",
          "For breakout rooms, click Breakout rooms in the meeting controls, set the number of rooms, and assign people.",
          "Pop into each breakout room briefly to check discussions are on track before calling everyone back.",
        ],
        benefitCategories: ["STUDENT_ENGAGEMENT", "COMMUNICATION"],
        tool: "Microsoft Teams",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Use advanced co-authoring tools in Docs",
        description: "Use Version History, named versions and task assignment in Google Docs.",
        practicalOutcome: "Track how a shared document evolved and know exactly who owns each next step.",
        whyItMatters: "Clear ownership of tasks prevents shared documents stalling or duplicating effort.",
        howToSteps: [
          "Go to File > Version history > See version history to view or restore earlier versions.",
          "Name an important version (e.g. \"Final draft before review\") so it's easy to find later.",
          "Leave a comment, then click Assign and choose a colleague to turn it into an action item.",
          "Check the Tasks panel to see all open action items assigned across the document.",
        ],
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Google Docs",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Use advanced co-authoring tools in Word",
        description: "Use Version History, named versions and @mention task assignment in Word.",
        practicalOutcome: "Track how a shared document evolved and know exactly who owns each next step.",
        whyItMatters: "Clear ownership of tasks prevents shared documents stalling or duplicating effort.",
        howToSteps: [
          "Go to File > Info > Version History to view or restore earlier versions.",
          "Name an important version by restoring and re-saving with a clear name in the file name or a comment.",
          "Leave a comment and @mention a colleague to turn it into an action item they're notified about.",
          "Check the comments pane to see all open action items assigned across the document.",
        ],
        benefitCategories: ["COLLABORATION", "ORGANISATION"],
        tool: "Word",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Manage Shared Drives and Spaces",
        description: "Manage shared working environments — Google Shared Drives and active Google Spaces.",
        practicalOutcome: "Keep a whole team's files and discussion organised in one well-structured place.",
        whyItMatters: "A well-run Shared Drive prevents the 'lost file' problem common with personal-Drive sharing.",
        howToSteps: [
          "In Drive, click New > Shared drive and name it after the team or project, not an individual.",
          "Set member access levels (Viewer, Contributor, Content manager) based on what each person needs to do.",
          "In Google Chat, create a Space for the same team and pin key files or links to the top.",
          "Agree as a team on a simple folder structure before people start adding files.",
        ],
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 25,
        platform: "GOOGLE",
      },
      {
        title: "Manage SharePoint sites and Teams channels",
        description: "Manage shared working environments — SharePoint document libraries and Teams channels.",
        practicalOutcome: "Keep a whole team's files and discussion organised in one well-structured place.",
        whyItMatters: "A well-run SharePoint library prevents the 'lost file' problem common with personal OneDrive sharing.",
        howToSteps: [
          "In Teams, create a Team for the group and name it after the team or project, not an individual.",
          "Set member permissions (Owner, Member) based on what each person needs to do.",
          "Use the Team's built-in SharePoint document library as the single home for shared files.",
          "Agree as a team on a simple folder structure before people start adding files.",
        ],
        benefitCategories: ["ORGANISATION", "COLLABORATION"],
        tool: "SharePoint / Teams",
        estimatedTimeMins: 25,
        platform: "MICROSOFT",
      },
      {
        title: "Use real-time translated captions in Meet",
        description:
          "Use inclusive collaboration methods, including real-time AI-translated captions in Meet, to bridge language barriers.",
        practicalOutcome: "Make cross-department or external meetings genuinely accessible to non-native speakers.",
        whyItMatters: "Live translated captions can be the difference between someone participating fully or not at all.",
        howToSteps: [
          "During a Meet call, click the CC (captions) icon at the bottom of the screen.",
          "Click the settings gear next to captions to choose a translation language if available on your plan.",
          "Let attendees know at the start of the call that translated captions are available and how to turn them on.",
          "Speak a little slower and avoid idioms to help both live captions and translation stay accurate.",
        ],
        benefitCategories: ["INCLUSION", "ACCESSIBILITY", "COMMUNICATION"],
        tool: "Google Meet",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Use real-time translated captions in Teams",
        description:
          "Use inclusive collaboration methods, including real-time AI-translated captions in Teams, to bridge language barriers.",
        practicalOutcome: "Make cross-department or external meetings genuinely accessible to non-native speakers.",
        whyItMatters: "Live translated captions can be the difference between someone participating fully or not at all.",
        howToSteps: [
          "During a Teams call, click More > Language and speech > Turn on live captions.",
          "Click spoken language settings to choose a translation language if available on your plan.",
          "Let attendees know at the start of the call that translated captions are available and how to turn them on.",
          "Speak a little slower and avoid idioms to help both live captions and translation stay accurate.",
        ],
        benefitCategories: ["INCLUSION", "ACCESSIBILITY", "COMMUNICATION"],
        tool: "Microsoft Teams",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
    ],
    Catalyst: [
      {
        title: "Moderate a peer discussion Space",
        description: "Set up and actively moderate a vibrant Google Space or Chat group for peer discussion.",
        practicalOutcome: "Give colleagues an ongoing home for peer support that doesn't depend on scheduled meetings.",
        whyItMatters: "Active, well-moderated spaces build a genuine culture of continuous peer learning.",
        howToSteps: [
          "Create a Space in Google Chat with a clear name and a one-line purpose pinned at the top.",
          "Seed it with the first 2–3 posts yourself so it doesn't feel empty when others arrive.",
          "Ask one genuine question a week to keep discussion moving rather than waiting for it to happen.",
          "Gently redirect off-topic threads and thank people publicly for useful contributions.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Google Chat Spaces",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Moderate a peer discussion channel",
        description: "Set up and actively moderate a vibrant Teams channel for peer discussion.",
        practicalOutcome: "Give colleagues an ongoing home for peer support that doesn't depend on scheduled meetings.",
        whyItMatters: "Active, well-moderated channels build a genuine culture of continuous peer learning.",
        howToSteps: [
          "Create a channel in Teams with a clear name and a one-line purpose pinned at the top.",
          "Seed it with the first 2–3 posts yourself so it doesn't feel empty when others arrive.",
          "Ask one genuine question a week to keep discussion moving rather than waiting for it to happen.",
          "Gently redirect off-topic threads and thank people publicly for useful contributions.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Microsoft Teams",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
      },
      {
        title: "Model inclusive co-authoring etiquette",
        description: "Model inclusive co-authoring etiquette — @mentions, task assignment, clear comment threads.",
        practicalOutcome: "Make shared documents genuinely easier for the whole team to work in together.",
        whyItMatters: "Small etiquette habits, modelled consistently, become team norms.",
        howToSteps: [
          "Always use Suggesting mode, not Editing mode, when working in someone else's document.",
          "@mention the specific person a comment is for, rather than leaving it unaddressed.",
          "Assign a clear owner and, where possible, a date to any action raised in a comment.",
          "Resolve your own comment threads once actioned, modelling that comments are for closing out, not just raising.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "INCLUSION"],
        tool: "Google Docs",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Model inclusive co-authoring etiquette in Word",
        description: "Model inclusive co-authoring etiquette — @mentions, task assignment, clear comment threads.",
        practicalOutcome: "Make shared documents genuinely easier for the whole team to work in together.",
        whyItMatters: "Small etiquette habits, modelled consistently, become team norms.",
        howToSteps: [
          "Always use Track Changes, not direct edits, when working in someone else's document.",
          "@mention the specific person a comment is for, rather than leaving it unaddressed.",
          "Assign a clear owner and, where possible, a date to any action raised in a comment.",
          "Resolve your own comment threads once actioned, modelling that comments are for closing out, not just raising.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "INCLUSION"],
        tool: "Word",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Establish team norms for Chat vs Email",
        description: "Help establish healthy team norms around digital communication — e.g. when to use Chat vs Email.",
        practicalOutcome: "Reduce noise and crossed wires by agreeing what channel is for what.",
        whyItMatters: "Clear channel norms reduce both missed messages and communication overload.",
        howToSteps: [
          "Draft a simple one-line rule for each channel, e.g. \"Chat = quick/urgent, Email = formal/needs a record\".",
          "Bring it to a team meeting for discussion and buy-in rather than issuing it top-down.",
          "Pin the agreed norms in the team's Space so new starters can find them.",
          "Revisit the norms after a term and adjust anything that isn't working in practice.",
        ],
        benefitCategories: ["COLLABORATION", "DIGITAL_WELLBEING"],
        tool: "Google Chat / Gmail",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Establish team norms for Teams chat vs Email",
        description: "Help establish healthy team norms around digital communication — e.g. when to use Teams chat vs Email.",
        practicalOutcome: "Reduce noise and crossed wires by agreeing what channel is for what.",
        whyItMatters: "Clear channel norms reduce both missed messages and communication overload.",
        howToSteps: [
          "Draft a simple one-line rule for each channel, e.g. \"Teams chat = quick/urgent, Email = formal/needs a record\".",
          "Bring it to a team meeting for discussion and buy-in rather than issuing it top-down.",
          "Pin the agreed norms in the team's channel so new starters can find them.",
          "Revisit the norms after a term and adjust anything that isn't working in practice.",
        ],
        benefitCategories: ["COLLABORATION", "DIGITAL_WELLBEING"],
        tool: "Teams / Outlook",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Establish file-naming conventions for the team",
        description: "Establish efficient group-working habits in Shared Drives, such as standard file naming.",
        practicalOutcome: "Make every file in a Shared Drive findable at a glance, for everyone on the team.",
        whyItMatters: "Consistent naming conventions save the whole team time, every single day.",
        howToSteps: [
          "Agree a simple pattern, e.g. \"YYYY-MM-DD_TopicName_Version\", that the whole team can remember.",
          "Rename a handful of existing files as a visible example before asking others to follow it.",
          "Write the convention down in one place (a pinned Doc or Space description).",
          "Mention it to new starters during onboarding so the habit doesn't decay over time.",
        ],
        benefitCategories: ["ORGANISATION", "LEADERSHIP", "TIME_SAVING"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Establish file-naming conventions for the team in SharePoint",
        description: "Establish efficient group-working habits in SharePoint, such as standard file naming.",
        practicalOutcome: "Make every file in a SharePoint library findable at a glance, for everyone on the team.",
        whyItMatters: "Consistent naming conventions save the whole team time, every single day.",
        howToSteps: [
          "Agree a simple pattern, e.g. \"YYYY-MM-DD_TopicName_Version\", that the whole team can remember.",
          "Rename a handful of existing files as a visible example before asking others to follow it.",
          "Write the convention down in one place (a pinned post or channel description).",
          "Mention it to new starters during onboarding so the habit doesn't decay over time.",
        ],
        benefitCategories: ["ORGANISATION", "LEADERSHIP", "TIME_SAVING"],
        tool: "SharePoint",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
    ],
  },
  learning: {
    Navigator: [
      {
        title: "Attend digital training workshops",
        description: "Attend digital training workshops, e.g. internal Workspace or Microsoft 365 CPD sessions.",
        practicalOutcome: "Build your skills through structured, supported learning opportunities.",
        whyItMatters: "Dedicated training time accelerates skill-building beyond what's possible day-to-day.",
        howToSteps: [
          "Check your institution's CPD calendar or staff portal for upcoming digital skills sessions.",
          "Book your place and add it to your Calendar so it's protected time, not squeezed out.",
          "Bring one real task or question from your own work to apply the session to.",
          "Note down one thing you'll actually try afterwards, and add it to your development plan.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Internal CPD",
        estimatedTimeMins: 45,
      },
      {
        title: "Use video tutorials to learn independently",
        description: "Search online video tutorials, e.g. YouTube, to learn new software skills independently.",
        practicalOutcome: "Pick up a new skill in minutes without waiting for formal training.",
        whyItMatters: "Self-directed learning is often the fastest route to solving an immediate problem.",
        howToSteps: [
          "Search for the specific task, e.g. \"how to add conditional logic in Forms\", not just the tool name.",
          "Prefer recent videos (check the upload date) since software features change often.",
          "Follow along in a second window, pausing after each step rather than watching the whole thing first.",
          "Try the task on your own file immediately afterwards, while it's fresh.",
        ],
        benefitCategories: ["PRODUCTIVITY", "TIME_SAVING"],
        tool: "YouTube",
        estimatedTimeMins: 15,
      },
      {
        title: "Draft a personal development plan",
        description: "Use Google Docs to draft and update a personal development plan (PDP).",
        practicalOutcome: "Keep a living record of your development goals rather than a one-off appraisal document.",
        whyItMatters: "A regularly-updated PDP keeps development intentional rather than accidental.",
        howToSteps: [
          "Create a Doc with three simple headings: Where I am now, Where I want to be, How I'll get there.",
          "Add 2–3 specific, realistic goals rather than a long wish list.",
          "Set a recurring reminder in Calendar (e.g. monthly) to revisit and update it.",
          "Link relevant DigiDo achievements or evidence directly into the document as you earn them.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Docs",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Draft a personal development plan in Word or OneNote",
        description: "Use Word or OneNote to draft and update a personal development plan (PDP).",
        practicalOutcome: "Keep a living record of your development goals rather than a one-off appraisal document.",
        whyItMatters: "A regularly-updated PDP keeps development intentional rather than accidental.",
        howToSteps: [
          "Create a Word document or OneNote page with three simple headings: Where I am now, Where I want to be, How I'll get there.",
          "Add 2–3 specific, realistic goals rather than a long wish list.",
          "Set a recurring reminder in Outlook Calendar (e.g. monthly) to revisit and update it.",
          "Link relevant DigiDo achievements or evidence directly into the document as you earn them.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Word / OneNote",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Complete mandatory digital training",
        description: "Navigate your institution's staff portal or VLE to complete mandatory digital training.",
        practicalOutcome: "Stay compliant and up to date with required training with minimum friction.",
        whyItMatters: "Comfort navigating the VLE removes an unnecessary barrier to completing required CPD.",
        howToSteps: [
          "Log into the staff portal/VLE using your institution's SSO credentials.",
          "Find the \"Mandatory training\" or \"My courses\" section from the main dashboard.",
          "Work through each module in order — most auto-save your progress if you need to stop partway.",
          "Download or screenshot your completion certificate for your own records.",
        ],
        benefitCategories: ["ORGANISATION", "PROFESSIONAL_PRACTICE"],
        tool: "Institution VLE",
        estimatedTimeMins: 20,
      },
    ],
    Elevator: [
      {
        title: "Pursue a Google Certified Educator credential",
        description: "Pursue Google Certified Educator or Workspace credentials, or job-specific digital badges.",
        practicalOutcome: "Gain recognised, portable evidence of your digital capability.",
        whyItMatters: "External credentials strengthen both your CV and your confidence with the tools.",
        howToSteps: [
          "Visit the Google for Education Teacher Center and start with the Level 1 training units.",
          "Work through the units at your own pace — they're designed to be done in short sessions.",
          "Book and sit the official exam once you've completed the training units.",
          "Add the badge to your email signature or LinkedIn once earned.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Google Certified Educator",
        estimatedTimeMins: 180,
        evidencePrompt: "Add a link to your certificate or badge.",
        platform: "GOOGLE",
      },
      {
        title: "Pursue a Microsoft Innovative Educator credential",
        description: "Pursue Microsoft Innovative Educator (MIE) or job-specific digital badges.",
        practicalOutcome: "Gain recognised, portable evidence of your digital capability.",
        whyItMatters: "External credentials strengthen both your CV and your confidence with the tools.",
        howToSteps: [
          "Visit the Microsoft Educator Center and start with the Microsoft Innovative Educator (MIE) modules.",
          "Work through the units at your own pace — they're designed to be done in short sessions.",
          "Complete the required modules and assessments to earn the MIE badge.",
          "Add the badge to your email signature or LinkedIn once earned.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "INNOVATION"],
        tool: "Microsoft Innovative Educator",
        estimatedTimeMins: 180,
        evidencePrompt: "Add a link to your certificate or badge.",
        platform: "MICROSOFT",
      },
      {
        title: "Use Gemini to plan and outline projects",
        description: "Use Gemini to research, plan and outline work projects or teaching resources.",
        practicalOutcome: "Get from a blank page to a solid first draft plan in a fraction of the time.",
        whyItMatters: "AI-assisted planning frees up time for the judgement calls only you can make.",
        howToSteps: [
          "Describe the project's goal, audience and any constraints in your first prompt.",
          "Ask for an outline or structure first, before asking it to write full content.",
          "Refine section by section rather than asking for the whole thing to be rewritten at once.",
          "Add your own expertise and examples on top of the draft — it's a starting point, not the finished plan.",
        ],
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY"],
        tool: "Gemini",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Use Copilot to plan and outline projects",
        description: "Use Copilot to research, plan and outline work projects or teaching resources.",
        practicalOutcome: "Get from a blank page to a solid first draft plan in a fraction of the time.",
        whyItMatters: "AI-assisted planning frees up time for the judgement calls only you can make.",
        howToSteps: [
          "Describe the project's goal, audience and any constraints in your first prompt.",
          "Ask for an outline or structure first, before asking it to write full content.",
          "Refine section by section rather than asking for the whole thing to be rewritten at once.",
          "Add your own expertise and examples on top of the draft — it's a starting point, not the finished plan.",
        ],
        benefitCategories: ["TIME_SAVING", "PRODUCTIVITY"],
        tool: "Copilot",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Summarise webinars with NotebookLM",
        description:
          "Use Gemini Notebook (NotebookLM) to synthesise training notes, webinar transcripts and research PDFs into study guides.",
        practicalOutcome: "Turn a long recorded webinar into a short, revisitable summary or audio overview.",
        whyItMatters: "Synthesised notes make CPD content genuinely reusable later, not just 'watched once'.",
        howToSteps: [
          "Open NotebookLM and create a new notebook.",
          "Upload the webinar transcript, recording link, or related PDFs as sources.",
          "Ask it for a short summary, a study guide, or generate an audio overview from the Studio panel.",
          "Save the summary alongside your PDP so it's easy to find again later.",
        ],
        benefitCategories: ["TIME_SAVING", "PROFESSIONAL_PRACTICE"],
        tool: "NotebookLM",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Summarise webinars with Copilot Notebook",
        description:
          "Use Copilot Notebook to synthesise training notes, webinar transcripts and research PDFs into study guides.",
        practicalOutcome: "Turn a long recorded webinar into a short, revisitable summary.",
        whyItMatters: "Synthesised notes make CPD content genuinely reusable later, not just 'watched once'.",
        howToSteps: [
          "Open Copilot Notebook (or a OneNote page with Copilot enabled) and create a new notebook.",
          "Upload the webinar transcript, recording link, or related PDFs as sources.",
          "Ask it for a short summary or a study guide based on the uploaded sources.",
          "Save the summary alongside your PDP so it's easy to find again later.",
        ],
        benefitCategories: ["TIME_SAVING", "PROFESSIONAL_PRACTICE"],
        tool: "Copilot Notebook",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Share learning with colleagues after CPD",
        description: "Teach colleagues a newly mastered software skill after self-directed learning.",
        practicalOutcome: "Multiply the value of your own learning by passing it on to the team.",
        whyItMatters: "Teaching a skill to someone else cements your own understanding of it.",
        howToSteps: [
          "Pick the one thing from your recent learning that would save colleagues the most time.",
          "Prepare a single worked example rather than a full slide deck.",
          "Offer to show it 1-to-1 to a colleague who'd benefit, rather than waiting for a formal session.",
          "Follow up a week later to see if they've tried it and answer any questions.",
        ],
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
        practicalOutcome: "Bring recognised external expertise back into your institution.",
        whyItMatters: "External recognition validates practice and can inform whole-institution strategy.",
        howToSteps: [
          "Complete Google Certified Educator Level 1, then progress to Level 2 training units.",
          "Apply to your regional Google Champion or equivalent programme where available.",
          "Keep a running log of how you've applied what you've learned back at your institution.",
          "Share your progress and outcomes with your line manager as part of appraisal evidence.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Google Certified Educator",
        estimatedTimeMins: 240,
        platform: "GOOGLE",
      },
      {
        title: "Achieve external digital recognition (Microsoft)",
        description:
          "Pursue and achieve external digital recognition, e.g. Microsoft Innovative Educator Expert.",
        practicalOutcome: "Bring recognised external expertise back into your institution.",
        whyItMatters: "External recognition validates practice and can inform whole-institution strategy.",
        howToSteps: [
          "Complete the Microsoft Innovative Educator (MIE) badge, then apply for MIE Expert status.",
          "Submit your application showcasing how you've used Microsoft tools to impact teaching or admin.",
          "Keep a running log of how you've applied what you've learned back at your institution.",
          "Share your progress and outcomes with your line manager as part of appraisal evidence.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Microsoft Innovative Educator Expert",
        estimatedTimeMins: 240,
        platform: "MICROSOFT",
      },
      {
        title: "Offer 1-on-1 peer mentoring",
        description: "Offer 1-on-1 peer mentoring or mini-coaching sessions to help a colleague build confidence.",
        practicalOutcome: "Give a colleague the individual support that a group training session can't.",
        whyItMatters: "Personalised mentoring often succeeds where generic training doesn't land.",
        howToSteps: [
          "Ask the colleague what specific task or tool is causing them the most friction.",
          "Book a focused 20–30 minute session around that one thing, not a general \"catch up\".",
          "Let them drive the keyboard while you guide, rather than doing it for them.",
          "Agree one small thing for them to try solo before you check in again.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION"],
        tool: "Various",
        estimatedTimeMins: 30,
      },
      {
        title: "Run informal skill-share sessions",
        description: "Organise short, 15-minute informal skill-share sessions focused on immediate practical gains.",
        practicalOutcome: "Spread a practical tip to the whole team in less time than a coffee break.",
        whyItMatters: "Short, focused sessions respect colleagues' time while still spreading good practice.",
        howToSteps: [
          "Choose one narrow, practical tip — not a broad topic — that most people will actually use.",
          "Book a 15-minute slot at the start or end of an existing team meeting rather than a new one.",
          "Demo it live on a real example rather than talking through slides.",
          "Send a one-line follow-up message with the key step, for anyone who missed it.",
        ],
        benefitCategories: ["LEADERSHIP", "COLLABORATION", "TIME_SAVING"],
        tool: "Various",
        estimatedTimeMins: 15,
      },
      {
        title: "Mentor new staff through digital onboarding",
        description: "Mentor new staff members during onboarding to help them get comfortable with your institution's digital systems.",
        practicalOutcome: "Help new colleagues become productive with your institution's systems much faster.",
        whyItMatters: "A confident start with digital systems shapes a new colleague's whole first term.",
        howToSteps: [
          "Meet in their first week specifically to walk through the systems they'll use daily.",
          "Give them a short written checklist they can work through at their own pace afterwards.",
          "Check in again after two weeks, once they've hit the questions that only come up with real use.",
          "Point them to DigiDo itself as an ongoing way to keep building confidence.",
        ],
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
        howToSteps: [
          "Click your profile photo (top right of any Google app) and choose \"Change\" to upload a clear headshot.",
          "Go to Settings > See all settings > General in Gmail to add a professional signature.",
          "Include your name, job title and department in the signature.",
          "Check your displayed name is correct in your Google Workspace directory entry.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Workspace",
        estimatedTimeMins: 10,
        platform: "GOOGLE",
      },
      {
        title: "Maintain an accurate Microsoft 365 profile",
        description: "Maintain an accurate Microsoft 365 profile — professional photo, signature and job title.",
        practicalOutcome: "Present a clear, professional identity to colleagues and students online.",
        whyItMatters: "A complete, accurate profile makes it easier for people to know who they're talking to.",
        howToSteps: [
          "Go to your Microsoft 365 account settings (office.com > profile picture > \"View account\") to upload a clear headshot.",
          "In Outlook, go to Settings > Mail > Compose and reply to add a professional signature.",
          "Include your name, job title and department in the signature.",
          "Check your displayed name is correct in your institution's Microsoft 365 directory (Global Address List).",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Microsoft 365",
        estimatedTimeMins: 10,
        platform: "MICROSOFT",
      },
      {
        title: "Take regular screen breaks",
        description: "Take regular screen breaks to prevent eye strain and digital fatigue.",
        practicalOutcome: "Protect your long-term comfort and concentration across a screen-heavy working day.",
        whyItMatters: "Small, regular breaks measurably reduce fatigue and support sustained focus.",
        howToSteps: [
          "Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
          "Stand up and step away from your screen during at least one break per teaching or admin block.",
          "Set a recurring phone or Calendar reminder if breaks tend to get skipped.",
          "Use a longer break to look at something outdoors or across a room, not another screen.",
        ],
        benefitCategories: ["DIGITAL_WELLBEING"],
        tool: "Personal habit",
        estimatedTimeMins: 5,
      },
      {
        title: "Protect passwords and personal data",
        description: "Protect personal data and passwords in line with your institution's IT security policies.",
        practicalOutcome: "Reduce the risk of your account being compromised, and protect institutional data.",
        whyItMatters: "Good password hygiene is one of the simplest, highest-impact security habits.",
        howToSteps: [
          "Use a different, strong password for your work account than any personal account.",
          "Turn on two-factor authentication if it isn't already required by your institution.",
          "Never share your password over email or Chat, even with IT — legitimate staff won't ask for it.",
          "Use a password manager to generate and store passwords rather than reusing memorable ones.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Password manager",
        estimatedTimeMins: 15,
      },
      {
        title: "Recognise symptoms of VR motion sickness",
        description: "Recognise symptoms of cybersickness and take timely breaks during immersive sessions.",
        practicalOutcome: "Keep yourself and learners safe and comfortable when using VR equipment.",
        whyItMatters: "Awareness of cybersickness symptoms prevents a bad first experience putting people off immersive learning.",
        howToSteps: [
          "Before a session, tell participants that mild dizziness or nausea means they should stop immediately.",
          "Keep initial sessions short (under 10–15 minutes) especially for first-time users.",
          "Watch for signs like sudden quietness, hand on the headset, or stepping back — check in if you see them.",
          "Have a seated area nearby where someone can recover after removing the headset.",
        ],
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
        howToSteps: [
          "Create a Calendar event, open its details, and set the event type to \"Focus time\".",
          "Choose whether Focus time should auto-decline meeting invites during that slot.",
          "In Google Chat, click your profile photo > Snooze notifications for evenings or weekends.",
          "Set a clear working-hours schedule in Calendar Settings so colleagues can see when you're generally available.",
        ],
        benefitCategories: ["DIGITAL_WELLBEING", "PRODUCTIVITY"],
        tool: "Google Calendar",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Protect working boundaries with Outlook tools",
        description: "Proactively protect working boundaries using Outlook Focus time and Teams status/notifications.",
        practicalOutcome: "Get uninterrupted time for deep work and protect your time outside working hours.",
        whyItMatters: "Protected focus time is directly linked to lower stress and better quality work.",
        howToSteps: [
          "Create a Calendar event, open its details, and mark it \"Busy\" with a Focus time category.",
          "Use Outlook's \"Focus\" or \"Do not disturb\" mode during that slot.",
          "In Teams, set your status to Do Not Disturb and mute notifications for evenings or weekends.",
          "Set a clear working-hours schedule in Outlook Calendar settings so colleagues can see when you're generally available.",
        ],
        benefitCategories: ["DIGITAL_WELLBEING", "PRODUCTIVITY"],
        tool: "Outlook / Teams",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Curate a professional online identity",
        description: "Curate a professional online identity across workplace and professional platforms.",
        practicalOutcome: "Build a consistent, professional presence that supports your career development.",
        whyItMatters: "A considered online identity increasingly matters for professional opportunities.",
        howToSteps: [
          "Search your own name to see what a colleague or employer would find.",
          "Use the same professional photo across your workplace account and LinkedIn profile.",
          "Update your LinkedIn headline and summary to reflect your current role and interests.",
          "Set personal social accounts to private if they aren't meant for a professional audience.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE", "LEADERSHIP"],
        tool: "LinkedIn",
        estimatedTimeMins: 30,
      },
      {
        title: "Run regular privacy and security checks",
        description: "Conduct regular privacy and security checks on your workplace accounts.",
        practicalOutcome: "Catch and close security gaps before they become a real problem.",
        whyItMatters: "Periodic self-audits catch the small issues that build into big risks.",
        howToSteps: [
          "Go to myaccount.google.com and open the Security checkup.",
          "Review connected devices and sign out of any you don't recognise.",
          "Check third-party apps with account access and remove any you no longer use.",
          "Put a reminder in Calendar to repeat this check every term.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Google Account security checkup",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Run regular privacy and security checks on Microsoft 365",
        description: "Conduct regular privacy and security checks on your Microsoft 365 account.",
        practicalOutcome: "Catch and close security gaps before they become a real problem.",
        whyItMatters: "Periodic self-audits catch the small issues that build into big risks.",
        howToSteps: [
          "Go to account.microsoft.com/security and review your Security dashboard.",
          "Review recent sign-in activity and sign out of any devices you don't recognise.",
          "Check third-party apps with account access (App passwords / connected apps) and remove any you no longer use.",
          "Put a reminder in Calendar to repeat this check every term.",
        ],
        benefitCategories: ["PROFESSIONAL_PRACTICE"],
        tool: "Microsoft account security",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Use digital wellbeing tools to maintain balance",
        description: "Use digital wellbeing tools such as screen time tracking to maintain balance.",
        practicalOutcome: "Get an honest picture of your screen time and adjust where it's not serving you.",
        whyItMatters: "Awareness is the first step to a healthier relationship with always-on technology.",
        howToSteps: [
          "Check your phone's built-in screen time / digital wellbeing dashboard in Settings.",
          "Look at which apps take the most time and decide honestly whether that matches your intentions.",
          "Set an app timer or a \"downtime\" schedule for the biggest, least useful time sink.",
          "Review the trend after a week rather than judging from a single day.",
        ],
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
        howToSteps: [
          "Set an honest out-of-office status outside your working hours, and actually respect it yourself.",
          "If you write an email late at night, use Gmail's \"Schedule send\" so it arrives during working hours.",
          "Block visible Focus time in a shared Calendar so colleagues can see it's a genuine norm, not an excuse.",
          "Say out loud in a team meeting that you don't expect replies outside working hours.",
        ],
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING"],
        tool: "Google Calendar",
        estimatedTimeMins: 15,
        platform: "GOOGLE",
      },
      {
        title: "Model exemplary digital boundary management in Outlook",
        description:
          "Model exemplary digital boundary management — Outlook focus time, clear out-of-office status, no late-night emails.",
        practicalOutcome: "Give colleagues visible permission to protect their own time by seeing you protect yours.",
        whyItMatters: "Leaders who visibly model healthy boundaries shift the whole team's culture.",
        howToSteps: [
          "Set an honest Automatic Reply (out-of-office) outside your working hours, and actually respect it yourself.",
          "If you write an email late at night, use Outlook's \"Delay delivery\" so it arrives during working hours.",
          "Block visible Focus time in a shared Calendar so colleagues can see it's a genuine norm, not an excuse.",
          "Say out loud in a team meeting that you don't expect replies outside working hours.",
        ],
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING"],
        tool: "Outlook",
        estimatedTimeMins: 15,
        platform: "MICROSOFT",
      },
      {
        title: "Share digital stress-relief tips with the team",
        description: "Share digital stress-relief tips such as notification settings and workspace decluttering.",
        practicalOutcome: "Give colleagues practical, low-effort ways to reduce their own digital stress.",
        whyItMatters: "Concrete, specific tips are far more actionable than general wellbeing advice.",
        howToSteps: [
          "Pick one specific tip you've genuinely found useful, e.g. turning off non-essential app notifications.",
          "Write it as a short, step-by-step message rather than general advice to \"switch off more\".",
          "Share it in the team's Space or a team meeting, not just a diary reminder to yourself.",
          "Ask who else has a tip, to make it a two-way exchange rather than a lecture.",
        ],
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING"],
        tool: "Various",
        estimatedTimeMins: 15,
      },
      {
        title: "Champion GDPR and data hygiene in shared areas",
        description: "Act as a champion for GDPR and data hygiene by gently keeping shared drive areas compliant.",
        practicalOutcome: "Reduce data protection risk across the team through everyday good practice.",
        whyItMatters: "Distributed, everyday vigilance catches issues that periodic audits miss.",
        howToSteps: [
          "Periodically scan shared folders for files containing personal or sensitive learner data.",
          "Move anything sensitive into an appropriately restricted folder rather than a general shared area.",
          "Gently flag it to the colleague who added it, framed as a helpful heads-up, not a rebuke.",
          "Remind the team occasionally where sensitive data should and shouldn't live.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "Google Shared Drives",
        estimatedTimeMins: 20,
        platform: "GOOGLE",
      },
      {
        title: "Champion GDPR and data hygiene in SharePoint",
        description: "Act as a champion for GDPR and data hygiene by gently keeping SharePoint areas compliant.",
        practicalOutcome: "Reduce data protection risk across the team through everyday good practice.",
        whyItMatters: "Distributed, everyday vigilance catches issues that periodic audits miss.",
        howToSteps: [
          "Periodically scan shared document libraries for files containing personal or sensitive learner data.",
          "Move anything sensitive into an appropriately restricted site or folder rather than a general shared area.",
          "Gently flag it to the colleague who added it, framed as a helpful heads-up, not a rebuke.",
          "Remind the team occasionally where sensitive data should and shouldn't live.",
        ],
        benefitCategories: ["LEADERSHIP", "PROFESSIONAL_PRACTICE"],
        tool: "SharePoint",
        estimatedTimeMins: 20,
        platform: "MICROSOFT",
      },
      {
        title: "Design asynchronous communication protocols",
        description:
          "Use Gemini to analyse team workload trends and design async communication protocols that reduce notification stress.",
        practicalOutcome: "Reduce the pressure your team feels to respond outside working hours.",
        whyItMatters: "Explicit async norms protect wellbeing without sacrificing team communication.",
        howToSteps: [
          "Ask Gemini to summarise patterns in when your team tends to message each other, based on anonymised examples.",
          "Draft a simple protocol, e.g. \"no expectation of reply after 5pm or before 8am\".",
          "Discuss and agree the protocol with the team rather than imposing it.",
          "Model it yourself for a few weeks before checking whether it's actually being followed.",
        ],
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING", "INNOVATION"],
        tool: "Gemini",
        estimatedTimeMins: 30,
        platform: "GOOGLE",
      },
      {
        title: "Design asynchronous communication protocols with Copilot",
        description:
          "Use Copilot to analyse team workload trends and design async communication protocols that reduce notification stress.",
        practicalOutcome: "Reduce the pressure your team feels to respond outside working hours.",
        whyItMatters: "Explicit async norms protect wellbeing without sacrificing team communication.",
        howToSteps: [
          "Ask Copilot to summarise patterns in when your team tends to message each other, based on anonymised examples.",
          "Draft a simple protocol, e.g. \"no expectation of reply after 5pm or before 8am\".",
          "Discuss and agree the protocol with the team rather than imposing it.",
          "Model it yourself for a few weeks before checking whether it's actually being followed.",
        ],
        benefitCategories: ["LEADERSHIP", "DIGITAL_WELLBEING", "INNOVATION"],
        tool: "Copilot",
        estimatedTimeMins: 30,
        platform: "MICROSOFT",
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
          howToSteps: JSON.stringify(s.howToSteps),
          platform: s.platform ?? "BOTH",
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
    where: { email: "admin@example.ac.uk" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "admin@example.ac.uk",
      passwordHash,
      role: "ADMIN",
      department: "Digital Learning",
      jobTitle: "Digital Learning Lead",
      onboarded: true,
    },
  });

  const freshStaff = await prisma.user.upsert({
    where: { email: "new.starter@example.ac.uk" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "new.starter@example.ac.uk",
      passwordHash,
      role: "STAFF",
      department: "Business Studies",
      jobTitle: "Lecturer",
      onboarded: false,
    },
  });

  // Primary demo account — the product owner's own account, given ADMIN so
  // they see the Administration area, but with a "lived in" staff profile
  // (real momentum, mixed progress, evidence, earned milestones) so their
  // own dashboard demonstrates the full product rather than an empty state.
  const emily = await prisma.user.upsert({
    where: { email: "birchallel@gmail.com" },
    update: {},
    create: {
      name: "Emily",
      email: "birchallel@gmail.com",
      passwordHash,
      role: "ADMIN",
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
    { title: "Manage tabs and bookmarks in your browser", status: "MASTERED", day: 5 },
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
    { title: "Apply browser extensions to optimise workflow", status: "TO_DEVELOP", day: 4 },

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
