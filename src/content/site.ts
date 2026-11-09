// All site copy lives here, taken from Dheer's questionnaire, portfolio, CV and the Shararat brand book.
// Images come from src/content/media.json, which scripts/prepare-assets.py writes.

import media from "./media.json";

export type Media = { src: string; width: number; height: number; alt: string; kind: string };
export type Block = { full: string } | { pair: [string, string] };

export type Project = {
  slug: string;
  title: string;
  line: string;
  tags: [string, string];
  cover: string;
  facts: { label: string; value: string }[];
  epigraph?: string;
  story: string[];
  hero?: string;
  gallery: Block[];
  drawings: string[];
  studies?: { title: string; images: string[] };
};

export const work = media.work as Record<string, Record<string, Media>>;
export const ringCards = media.ring as Record<string, string[]>;
export const sketches = media.sketches as Record<string, { src: string; width: number; height: number }>;
export const filmFrames = media.film as { count: number; fps: number; width: number; height: number; cuts: number[] };

export const site = {
  // Keeps the site out of search engines. Set to false at launch.
  draft: true,
  name: "Dheer",
  fullName: "Dheer Chheda",
  role: "Interior design student",
  location: "Mumbai",
  intro: "Intriguing, accessible, thoughtful. I start with the feeling and the people.",
  email: "dheerchheda1@gmail.com",
  // Add a path in public/ to show a portrait in the about section.
  portrait: "",
  socials: [] as { label: string; url: string }[],
};

// The turn after the landing. Three words on paper sink into a line, the page goes dark,
// and what he starts from rises out of it. Then the words scatter into a field and tilt away.
export const creed = {
  eyebrow: "Three words I hold every room to.",
  light: ["Intriguing", "Accessible", "Thoughtful"],
  dark: ["Feeling", "before", "form."],
  line: "Before a single line is drawn, I ask how the room should feel, and who it is for.",
  // The field: his words, large, and what people do in a room, small.
  big: ["Feeling", "Form", "People", "Light", "Intriguing", "Accessible", "Thoughtful"],
  small: ["Sit", "Stay", "Linger", "Touch", "Look up", "Walk in"],
};

// Before the contact: who he'd love to design for, and who he isn't for. Drawn from what he says
// he believes: the feeling and the people first, sketching first, and a person's own taste over a default.
export const fit = {
  title: "Who I’d love to design for.",
  yes: {
    label: "For you if you",
    items: [
      "Want a room that feels like the people in it.",
      "Already have a look you love, and want it taken further.",
      "Would rather have character than minimal by default.",
      "Care how the light falls, not just where the sofa goes.",
      "Like seeing it sketched before it’s drawn.",
      "Have a story the space should tell.",
    ],
  },
  no: {
    label: "Probably not for",
    items: [
      "Anyone after a copy of a Pinterest board.",
      "Rooms meant to look like every other room.",
      "Spaces designed for a photo, not the people in them.",
      "Projects that skip the sketching.",
      "Anyone who wants it done without asking why.",
    ],
  },
  prompt: "Tick what sounds like you.",
  match: "Sounds like we should talk",
};

// The opening, set while the site loads. The words after the lead fall into the grid one by one.
export const hook = {
  lead: "Every room begins",
  fall: ["with", "the", "light."],
  close: "The rest is how it feels.",
};

export const about = {
  lead: "I’m Dheer, an interior design student from Prabhadevi. I walk into a room and watch the light: how it meets the colour, why the space was built, and how it makes me feel.",
  stance: "Minimal became the default. Personal taste paid for it. I design for the visual direction a person already has.",
};

// A short piece in his words, as a small index: a label, then the line.
export const notes = [
  { label: "Where", text: "I grew up in Prabhadevi, sketching. My parents backed every choice I made." },
  { label: "How it began", text: "Interior design started as a minor in my first year. One project went well, and I stayed." },
  { label: "Who I look to", text: "Sameer Kulavoor for his forms. Sanjay Puri for sketching first. Sajid Wajid Shaikh for moving between mediums." },
  { label: "Off the board", text: "I’m a cinephile. Inglourious Basterds, Interstellar and Kung Fu Panda share a shelf." },
];

// How a project moves, shown on Maatik. Each step names an image in media.json.
export const process = [
  { name: "Sketch", line: "After a first round of research I sketch every idea I have. The sketches tell me where to go.", image: "sketch" },
  { name: "Study", line: "Then I refine it and think in 3D. For Maatik, the roof came before the model.", image: "study-truss" },
  { name: "Plan", line: "Then the CAD and the technical part. Where the wheel sits, where the café opens.", image: "plan" },
  { name: "Render", line: "Then the renders. I go back and change any of it whenever something gives me a better answer.", image: "facade" },
];

// His CV as a journey, in order. The internships have no dates, so they sit "along the way".
export const journey = {
  title: "The road so far",
  stops: [
    { when: "2023", what: "Began interior design", where: "ISDI, Atlas SkillTech University" },
    { when: "2023", what: "Painted a mural", where: "Closed Bonet" },
    { when: "Along the way", what: "Interned in interior design", where: "Essence of Art, and Space X" },
    { when: "2025", what: "Designed an exhibit", where: "Freeform × IFLA" },
    { when: "2026", what: "Spatial graphic designer", where: "Alvarez & Marsal" },
    { when: "2027", what: "Graduating", where: "ISDI, Atlas SkillTech University" },
  ],
};

// Timed against the walkthrough's scroll, from 0 to 1. Lines from his portfolio and the brand book.
export const film = [
  { text: "You weren’t supposed to find this. And yet here you are.", from: 0.1, to: 0.26 },
  { text: "A forgotten jazz club in 1996, inside a tropical hotel.", from: 0.32, to: 0.48 },
  { text: "Somewhere to sit back, listen to vinyl and stay for hours.", from: 0.54, to: 0.7 },
  { text: "Mischief was always going to find you. It just needed the right room.", from: 0.76, to: 0.93 },
];

// In the order they appear on the home page.
export const projects: Project[] = [
  {
    slug: "maatik",
    title: "Maatik",
    line: "A workspace for the potters of Dharavi.",
    tags: ["Adaptive reuse", "Co-working"],
    cover: "facade",
    facts: [
      { label: "Site", value: "IF BE, Ballard Estate, Fort" },
      { label: "Area", value: "11,200 sq ft" },
      { label: "Type", value: "Adaptive reuse, co-working" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    story: [
      "IF BE sits in Ballard Estate, close to the trade the potters of Dharavi depend on and easy to see from the street.",
      "We kept the brickwork, the stone and the high ceilings. The building didn’t need to look new. It needed to feel like theirs.",
      "The curves come from the wheel and the vessel. The potters’ worktable takes its shape from क, the first letter of kumbhar.",
      "The café opens onto the workshop, so a cup of coffee comes with a view of the wheel.",
    ],
    hero: "facade",
    gallery: [
      { full: "cafe" },
      { pair: ["workshop", "vessel"] },
      { full: "swing" },
      { pair: ["lounge", "office"] },
      { full: "bar" },
      { pair: ["kitchen", "library"] },
    ],
    drawings: ["plan", "section"],
    studies: { title: "Before the model, the roof.", images: ["study-roof", "study-truss"] },
  },
  {
    slug: "light-of-bharat",
    title: "Light of Bharat",
    line: "An Irani café from 1940, made seen again.",
    tags: ["Renovation", "Irani café"],
    cover: "dining",
    facts: [
      { label: "Site", value: "Ranade Road, Dadar" },
      { label: "Area", value: "800 sq ft" },
      { label: "Type", value: "Renovation, identity" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    story: [
      "Light of Bharat has been part of the street since 1940. It never lacked identity. It lacked visibility.",
      "So we didn’t change it. We made it seen.",
      "Persian carpets move to the ceiling. The furniture stays where the regulars expect it, so they can take their old seats.",
      "Chessboards are carved into the tables, because an Irani café was always a place to stay a while.",
    ],
    hero: "dining",
    gallery: [{ pair: ["today", "counter"] }, { full: "chess" }, { full: "bar" }],
    drawings: ["plan", "section"],
  },
  {
    slug: "hubtown-seasons",
    title: "Hubtown Seasons",
    line: "A sales lobby in Chembur, from idea to execution.",
    tags: ["Sales lobby", "Built"],
    cover: "elevations",
    facts: [
      { label: "Client", value: "Hubtown" },
      { label: "Site", value: "Chembur East" },
      { label: "Area", value: "6,000 sq ft, 15 ft ceilings" },
      { label: "At", value: "Essence of Art, as an intern" },
    ],
    story: [
      "My first project from idea to execution, as an intern at Essence of Art.",
      "The footprint is irregular. Its edges hold the meeting rooms and storage, and the centre stays open.",
      "The fifteen-foot ceiling sets the proportions. Tall glazing, textured walls and dark verticals do the rest.",
    ],
    gallery: [],
    drawings: ["elevations", "passage", "plan"],
  },
  {
    slug: "shararat",
    title: "Shararat",
    line: "A speakeasy for Indian music, inside a heritage building in Fort.",
    tags: ["Speakeasy", "Three brands"],
    cover: "bar",
    facts: [
      { label: "Brief", value: "Coke Studio Bharat, Stranger & Sons, Jim Sarbh" },
      { label: "Site", value: "Jeroo Building, Kala Ghoda" },
      { label: "Area", value: "12,500 sq ft on three levels" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    epigraph: "Mischief was always going to find you. It just needed the right room.",
    story: [
      "Three brands, one room. Coke Studio Bharat brings the music, Stranger & Sons the pour, and Jim Sarbh the eye for what goes on the walls.",
      "Behind the Fabindia shopfront in Fort, a double-height speakeasy, with a mezzanine over the bar.",
      "It should feel like a forgotten jazz club in 1996, inside a tropical hotel. Dark timber, burgundy leather, brushed brass, palms on the walls.",
      "This is my favourite project.",
    ],
    hero: "bar",
    gallery: [
      { full: "passage" },
      { pair: ["lounge", "speakers"] },
      { full: "mezzanine" },
      { pair: ["vinyl", "booths"] },
      { full: "cowork" },
      { pair: ["library", "table"] },
    ],
    drawings: ["plans", "sections"],
    studies: { title: "Pieces we drew for the room.", images: ["piece-sofa", "piece-chair", "piece-bar", "piece-booth"] },
  },
];
