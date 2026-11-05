// All site copy lives here. Text in [square brackets] is a placeholder.

export type DrawingKind = "plan" | "section" | "elevation" | "axon" | "spiral" | "board";
export type Tone = "ink" | "lava" | "snow";
export type Status = "Now Showing" | "In Development" | "Archive";

export type Project = {
  slug: string;
  no: string;
  title: string;
  type: string;
  status: Status;
  tone: Tone;
  drawing: DrawingKind;
  year: string;
  logline: string;
  credits: { label: string; value: string }[];
  brief: string;
  idea: string;
  wrong: string;
  materials: string[];
};

export const site = {
  // Keeps the site out of search engines. Set to false at launch.
  draft: true,
  name: "Dheer",
  fullName: "Dheer [Surname]",
  role: "Interior designer, student",
  location: "[City]",
  words: "[Word]. [Word]. [Word].",
  notices: "[I'm the person who always notices ___ when I walk into a room.]",
  refuses: "[The one thing you refuse to do to a room, said plainly.]",
  startsWith: "[Light / material / the person / the plan / a story]",
  currently: "[Looking for an internship from Month Year]",
  email: "[your@email.com]",
  cv: "",
  socials: [
    { label: "Instagram", url: "" },
    { label: "LinkedIn", url: "" },
    { label: "Behance", url: "" },
  ],
};

export const about = {
  opening: "[One sentence that could only be about you.]",
  story: [
    "[Where you're from, where you live now, and how each place shaped your eye.]",
    "[What you wanted to be before interior design, and what made you switch.]",
    "[The room you still think about: a grandparent's home, a school, a shop. What stayed with you?]",
  ],
  outside:
    "[Life outside the studio. Be specific: what you do obsessively, what you rewatch, the long way home you always take.]",
  object: "[The object that's most you, and the story behind it.]",
  influences: [
    { label: "Films", items: ["[Film]", "[Film]", "[Film]"] },
    { label: "Books", items: ["[Book]", "[Book]", "[Book]"] },
    { label: "Spaces", items: ["[Space]", "[Space]", "[Space]"] },
    { label: "Makers", items: ["[Name]", "[Name]", "[Name]"] },
  ],
  record: [
    { label: "Education", rows: [["[Year]", "[Degree, Institution]"]] },
    { label: "Experience", rows: [["[Year]", "[Role, Studio]"]] },
    { label: "Recognition", rows: [["[Year]", "[Award or exhibition]"]] },
    { label: "Tools", rows: [["", "[Software, hand drawing, model making]"]] },
  ],
};

export const notes = [
  { tag: "Light", date: "[DD.MM.YY]", question: "[A question you keep asking about space?]" },
  { tag: "Material", date: "[DD.MM.YY]", question: "[A question a material has made you ask?]" },
  { tag: "People", date: "[DD.MM.YY]", question: "[A question about how people really use rooms?]" },
];

const project = (
  no: string,
  type: string,
  status: Status,
  tone: Tone,
  drawing: DrawingKind,
): Project => ({
  slug: `working-title-${no}`,
  no,
  title: `Working Title ${no}`,
  type,
  status,
  tone,
  drawing,
  year: "[Year]",
  logline: "[One line, like a film poster tagline.]",
  credits: [
    { label: "Type", value: `[${type}]` },
    { label: "Site", value: "[Site, City]" },
    { label: "Area", value: "[000 sq m]" },
    { label: "Year", value: "[Year]" },
    { label: "Context", value: "[Academic / Competition / Live / Personal]" },
    { label: "Role", value: "[What you did]" },
    { label: "With", value: "[Collaborators and tutors]" },
  ],
  brief: "[The real brief, in two or three sentences. Who was it for, and what did they need?]",
  idea: "[Your idea, in one sentence.]",
  wrong: "[What went wrong, and what you changed because of it.]",
  materials: ["[Material]", "[Material]", "[Material]", "[Material]"],
});

// Types and statuses are sample values so the index filter works.
export const projects: Project[] = [
  project("01", "Residential", "Now Showing", "lava", "section"),
  project("02", "Hospitality", "Now Showing", "ink", "plan"),
  project("03", "Retail", "Now Showing", "snow", "elevation"),
  project("04", "Workplace", "In Development", "ink", "axon"),
  project("05", "Residential", "In Development", "ink", "spiral"),
  project("06", "Furniture", "Archive", "ink", "board"),
];
