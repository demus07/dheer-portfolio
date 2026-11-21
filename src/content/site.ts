// All site copy lives here, taken from Dheer's questionnaire, portfolio, CV and the Shararat brand book.
// Images come from src/content/media.json, which scripts/prepare-assets.py writes, and from
// src/content/pages.json, which scripts/prepare-pages.py writes for the project pages.

import media from "./media.json";
import pages from "./pages.json";

export type Media = { src: string; width: number; height: number; alt: string; kind: string; poster?: string };
export type Fact = { label: string; value: string };
export type Text = { title?: string; body: string[] };

// A project page follows his portfolio, page by page. Each chapter is one of its spreads:
// a story told beside photographs, a row of columns (concept, space, direction), a plan
// with its notes, or a set of views with the sections that go with them.
export type Chapter =
  | { kind: "story"; texts: Text[]; images: string[] }
  | { kind: "columns"; title?: string; columns: { title?: string; media: string[]; body: string[] }[] }
  | { kind: "layout"; title: string; drawing: string; body: string[] }
  | { kind: "views"; title?: string; images: string[]; body: string[]; drawings?: string[] };

export type Project = {
  slug: string;
  title: string;
  line: string;
  subtitle: string;
  credit?: string;
  cover: string;
  site: { name: string; address: string };
  facts: Fact[];
  intro: string[];
  epigraph?: string;
  chapters: Chapter[];
};

const extra = pages as Record<string, Record<string, Media>>;
export const work = Object.fromEntries(
  Object.entries(media.work).map(([slug, images]) => [slug, { ...images, ...extra[slug] }]),
) as Record<string, Record<string, Media>>;
export const ringCards = media.ring as Record<string, string[]>;
export const sketches = media.sketches as Record<string, { src: string; width: number; height: number }>;
export const filmFrames = media.film as { count: number; fps: number; width: number; height: number; cuts: number[] };

export const site = {
  // Keeps the site out of search engines. Set to false at launch.
  draft: true,
  // Keep the About section and navigation hidden until its next design pass.
  showAbout: false,
  name: "Dheer",
  fullName: "Dheer Chheda",
  role: "Interior design student",
  location: "Mumbai",
  intro: "Intriguing, accessible, thoughtful. I start with the feeling and the people.",
  email: "dheerchheda1@gmail.com",
  linkedin: "https://in.linkedin.com/in/dheer-chheda-25569526b",
  instagram: "https://www.instagram.com/_dheer_chheda_/",
  // Add a path in public/ to show a portrait in the about section.
  portrait: "",
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

// The opening, set while the site loads. The words after the lead fall into the grid one by one.
export const hook = {
  lead: "Every room begins",
  fall: ["with", "the", "light."],
  close: "The rest is how it feels.",
};

export const about = {
  lead: "Hi! I'm Dheer. I grew up in Mumbai with a pencil in hand, sketching just about everything. My parents always encouraged me to explore, experiment and follow my instincts. That freedom shaped the way I see the world today.",
  stance: "Minimal became the default. Personal taste paid for it. I design for the visual direction a person already has.",
};

// A short piece in his words, as a small index: a label, then the line.
export const notes = [
  { label: "Where", text: "I grew up in Prabhadevi, sketching. My parents backed every choice I made." },
  { label: "How it began", text: "Interior design started as a minor in my first year. One project went well, and I stayed." },
  { label: "Who I look to", text: "Sameer Kulavoor for his forms. Sanjay Puri for sketching first. Sajid Wajid Shaikh for moving between mediums." },
  { label: "Off the board", text: "I’m a cinephile. Inglourious Basterds, Interstellar and Kung Fu Panda share a shelf." },
];

// His CV as a journey, in order. The internships have no dates, so they sit "along the way".
export const journey = {
  title: "The road so far",
  stops: [
    {
      when: "2023",
      what: "Began interior design",
      where: "ISDI, Atlas SkillTech University",
      image: "/work/sketchbook/page-1.webp",
    },
    {
      when: "2023",
      what: "Painted a mural",
      where: "Closed Bonet",
      image: "/work/maatik/facade.webp",
    },
    {
      when: "Along the way",
      what: "Interned in interior design",
      where: "Essence of Art, and Space X",
      image: "/work/hubtown-seasons/plan.webp",
    },
    {
      when: "2025",
      what: "Designed an exhibit",
      where: "Freeform × IFLA",
      image: "/work/light-of-bharat/dining.webp",
    },
    {
      when: "2026",
      what: "Spatial graphic designer",
      where: "Alvarez & Marsal",
      image: "/work/shararat/cowork.webp",
    },
    {
      when: "2027",
      what: "Graduating",
      where: "ISDI, Atlas SkillTech University",
      image: "/work/maatik/workshop.webp",
    },
  ],
};

// Timed against the walkthrough's scroll, from 0 to 1. Lines from his portfolio and the brand book.
export const film = [
  { text: "You weren’t supposed to find this. And yet here you are.", from: 0.08, to: 0.2 },
  { text: "A forgotten jazz club in 1996, inside a tropical hotel.", from: 0.25, to: 0.37 },
  { text: "Somewhere to sit back, listen to vinyl and stay for hours.", from: 0.42, to: 0.55 },
  { text: "Mischief was always going to find you. It just needed the right room.", from: 0.59, to: 0.72 },
];

// In the order of his portfolio, which is also the order on the home page.
export const projects: Project[] = [
  {
    slug: "maatik",
    title: "Maatik",
    line: "A workspace for the potters of Dharavi.",
    subtitle: "Hearts & Hands",
    credit: "Group project",
    cover: "facade",
    site: { name: "IF BE", address: "10–12 Calicut Road, Ballard Estate, Fort, Mumbai" },
    facts: [
      { label: "Site area", value: "11,200 sq ft" },
      { label: "Built up", value: "10,870 sq ft" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    intro: [
      "IF BE is the right place for the potters of Dharavi to work: close to their trade, and easy to see from the street.",
      "Here the artisans can call a place their own, and get the respect they deserve.",
    ],
    chapters: [
      {
        kind: "story",
        texts: [
          {
            title: "Adaptive reuse",
            body: [
              "We kept the structure, the open brickwork and the high ceilings.",
              "The place is rustic but clean. It should feel neither like a crowded workshop nor like an overly luxurious café.",
              "The open floor lets the potters and visitors move freely, and the big windows bring in the daylight a workshop needs.",
            ],
          },
        ],
        images: ["site-map", "site-hall", "site-court", "site-stair"],
      },
      {
        kind: "story",
        texts: [
          {
            title: "Vision",
            body: ["A comfortable place for the potters to work and grow, without worrying about anything else. A cultural hub for the artisans."],
          },
          {
            title: "Concept",
            body: [
              "Where tradition and modern practice, craft and community meet. The curves come from the potter’s wheel and the vessel. Earthy materials and tones keep it grounded, tactile and real.",
            ],
          },
        ],
        images: ["potters-kiln", "potters-shop", "potters-wheel"],
      },
      {
        kind: "columns",
        title: "Concept development",
        columns: [
          { media: ["worktable"], body: ["The worktable takes its shape from क, the first letter of kumbhar, after Kumbharwada in Dharavi, where the potters work."] },
          { media: ["meeting"], body: ["Where the management meets. A workspace shaped by curves, flow and fluidity."] },
          { media: ["concept-pottery"], body: ["A new, ergonomic potter’s table, for throwing on the wheel, drying and curing."] },
          { media: ["concept-cafe"], body: ["The café opens onto the workshop, so people can work over a cup of coffee."] },
        ],
      },
      {
        kind: "columns",
        title: "Concept sketching",
        columns: [
          { media: ["sketch-trusses"], body: [] },
          {
            media: ["sketch-roof"],
            body: [
              "What makes IF BE inspiring is its roof, and the way its spaces overlap.",
              "Light matters most here. There is so much daylight that every detail settles into the earthy room.",
            ],
          },
        ],
      },
      {
        kind: "layout",
        title: "Furniture layout",
        drawing: "layout",
        body: [
          "A central spine links the workspaces, meeting rooms and informal seating, moving between private and shared without losing sight of either.",
          "From the entrance the plan opens into the central workspace, the main place to meet. Meeting rooms, workstations and lounges branch off it, with quieter zones at the edges for focused work.",
        ],
      },
      {
        kind: "views",
        images: ["view-bar", "view-lounge", "view-workshop"],
        body: [
          "Exposed brick, natural wood, concrete and metal. Wood brings warmth and brick its texture, while concrete and black metal give the workshop an industrial edge.",
          "Upholstered seating and plants soften the harder materials, somewhere between the industrial structure and handmade warmth.",
        ],
        drawings: ["section-aa"],
      },
      {
        kind: "views",
        images: ["view-library", "view-hall", "view-shelves"],
        body: [
          "Large glass openings let daylight meet the materials, and warm pendants and concealed lights bring out their texture.",
          "Light also marks the zones: pendants over seating and dining, linear lights along the paths and work surfaces, and daylight through the arched windows.",
        ],
        drawings: ["section-bb"],
      },
      {
        kind: "views",
        images: ["view-reading", "view-arch", "view-court"],
        body: [
          "This section turns on the banyan. The tree rises above the building and breaks its hard lines, bringing nature straight into the space.",
          "Potted plants, timber, brick and warm light carry it inside. I wanted this part to feel calm, open and connected to nature.",
        ],
        drawings: ["section-cc"],
      },
    ],
  },
  {
    slug: "light-of-bharat",
    title: "Light of Bharat",
    line: "An Irani café from 1940, made seen again.",
    subtitle: "A legacy reframed",
    cover: "dining",
    site: { name: "Light of Bharat", address: "Ranade Road, Dadar, Mumbai" },
    facts: [
      { label: "Area", value: "800 sq ft" },
      { label: "Ceiling", value: "10 ft" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    intro: [
      "An Irani café that has been part of the city’s everyday life since 1940, shaped by habit, familiarity and loyal regulars.",
      "It never lacked identity. It lacked visibility. So the work was not to change it, but to make it seen.",
    ],
    chapters: [
      {
        kind: "story",
        texts: [
          {
            title: "Intent",
            body: ["To make the café’s history, roots and everyday relevance visible. Not to change how it works, but to give it presence and clarity."],
          },
          {
            title: "Concept",
            body: ["Persian heritage and the Indian context both define the café. Instead of merging them into something new, each stands on its own, and the room is where they meet."],
          },
          {
            title: "The existing plan",
            body: ["A curved room with a sweeping façade that leads you around it, and the service along the edges. The curve stays its identity."],
          },
        ],
        images: ["today", "signage", "existing-plan"],
      },
      {
        kind: "columns",
        columns: [
          {
            title: "Concept sketching",
            media: ["sketch-concept"],
            body: ["The sketches start from the room as it is, not a blank slate. Its curve, its divisions and its character are kept, and studied over many tries."],
          },
          {
            title: "Space visualisation",
            media: ["sketch-space"],
            body: ["How the old and the new can sit together. Fresh materials, furniture and light respond to what is already there."],
          },
          {
            title: "Visual direction",
            media: ["sketch-direction"],
            body: ["Fresh, but not unfamiliar. Old forms become cues for the new design: revealing, refining and adding, never erasing."],
          },
        ],
      },
      {
        kind: "layout",
        title: "Furniture layout",
        drawing: "layout",
        body: [
          "A new familiarity between the past and the present, like a modern time capsule.",
          "The old colours get new tints. The furniture stays where it always was, so the regulars can take their old seats and enjoy a fresh spin on what was.",
          "The room makes the most of its sunlight, and stays dim and calm inside.",
        ],
      },
      {
        kind: "views",
        images: ["dining", "counter"],
        body: [
          "Persian carpets move to the ceiling, as markers of where the café comes from rather than decoration. Bentwood chairs, simple wooden tables, marble inlay and soft pendants keep it warm and unmistakably Irani.",
          "The patterned wall adds rhythm, and the tables sit close together, for the shared seating Irani cafés are known for.",
        ],
        drawings: ["section-aa"],
      },
      {
        kind: "views",
        images: ["chess", "bar"],
        body: [
          "Chessboards carved into the tables turn a seat into something to do, so people pause and talk, as they always have in Irani cafés.",
          "Upholstered stools soften the seating, and the glass panel keeps the kitchen in view. Surfaces that feel worn in and approachable, never intimidating.",
        ],
        drawings: ["section-bb"],
      },
    ],
  },
  {
    slug: "shararat",
    title: "Shararat",
    line: "A speakeasy for Indian music, inside a heritage building in Fort.",
    subtitle: "Coke Studio Bharat, Stranger & Sons, Jim Sarbh",
    credit: "Group project",
    cover: "bar",
    site: { name: "Fabindia, Fort", address: "Jeroo Building, 137 Mahatma Gandhi Road, Kala Ghoda, Fort, Mumbai" },
    facts: [
      { label: "Area", value: "12,500 sq ft on three levels" },
      { label: "Ceilings", value: "8′6″ to 17′" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    epigraph: "Mischief was always going to find you. It just needed the right room.",
    intro: [
      "Fort’s cultural fabric brings constant footfall, visibility and institutions close by. Turning off the fast roads into calmer lanes slows you down before you walk in.",
      "The old building is permanent yet adaptable, so the project carries on Fort’s rhythm rather than standing apart.",
    ],
    chapters: [
      {
        kind: "story",
        texts: [
          {
            title: "Concept",
            body: ["Coke Studio Bharat as a cultural medium: music moves from screens into a shared room, with Indian folk and classical traditions at the centre of contemporary listening."],
          },
          {
            title: "Stranger & Sons",
            body: ["Rooted in Goa. Gin as a crafted ritual rather than a party accessory, drawn from Indian landscapes, illustration and folklore."],
          },
          {
            title: "Coke Studio Bharat",
            body: ["Collaboration across genres, regions and traditions. Listening closely, with folk, classical and contemporary voices on equal ground."],
          },
          {
            title: "Jim Sarbh",
            body: ["A curator rather than a celebrity endorser. His restraint asks for slow attention: the music is introduced, and the room quietly guides you."],
          },
        ],
        images: ["levels"],
      },
      {
        kind: "columns",
        columns: [
          {
            title: "Concept sketching",
            media: ["sketch-concept"],
            body: ["Ways to adapt the space with new furniture, partitions and built-in pieces, without unnecessary structural change."],
          },
          {
            title: "Space visualisation",
            media: ["sketch-space"],
            body: ["The building is the starting point: its layout, proportions and circulation. Not a blank canvas. What is there stays wherever it can."],
          },
          {
            title: "Visual direction",
            media: ["sketch-direction"],
            body: ["New life, by refining the layout and connecting the spaces, so the building evolves and keeps its character."],
          },
        ],
      },
      {
        kind: "layout",
        title: "Furniture layout",
        drawing: "plans-ground",
        body: [
          "Dark timber, burgundy leather, brushed brass, terrazzo, smoked glass, patterned carpets, tropical plants and warm amber light. Chunky 90s furniture, curved sofas, low lounge chairs, quirky lamps, and a little visual excess.",
          "The White Lotus brings the retro resort, slightly mysterious and old money. The jazz bar keeps it intimate, moody and playful.",
        ],
      },
      {
        kind: "views",
        images: ["view-jazz", "view-cowork"],
        body: [
          "It should feel like walking into a forgotten jazz club in 1996, inside an upscale tropical hotel. Miles Davis playing quietly, martinis on the table, palms casting shadows on textured walls.",
          "In the coworking space, timber columns and panelling set the rhythm, and patterned floors, vintage furniture and art give it a personality of its own.",
        ],
      },
      {
        kind: "layout",
        title: "First floor",
        drawing: "plans-first",
        body: [
          "Communal tables take the centre, with smaller clusters and lounges at the edges, moving from working together to quieter time alone.",
          "The other half stays open, for events and activities that change.",
        ],
      },
      {
        kind: "views",
        images: ["view-open", "view-intimate"],
        body: [
          "An open, social workspace, where lounge seating, shelving and tables invite people to pause and talk. Less a conventional office, more a cultural one.",
          "Then something more intimate: a long seat, small tables and low light, for conversation, reading or working alone.",
        ],
      },
      {
        kind: "views",
        images: ["view-cigar", "view-columns", "view-speakers"],
        body: [
          "Low, warm light holds the room together. The spherical pendant glows softly, and concealed lights and the illuminated speaker wall add depth without making it bright.",
          "Amber light, dark wood, leather and texture: somewhere to sit back, listen to vinyl and stay for hours.",
        ],
        drawings: ["section-aa", "section-bb"],
      },
      {
        kind: "views",
        title: "Looking back",
        images: ["view-office", "view-pantry"],
        body: [
          "So much timber can make the palette feel heavy and repetitive. More contrast, with accent light, darker pockets and sharper highlights, would deepen the cigar bar and the vinyl lounge.",
          "The section reads as more functional than experiential. The large volumes could use stronger moments of compression and release, and a clearer order between the programmes.",
        ],
        drawings: ["section-cc"],
      },
    ],
  },
  {
    slug: "hubtown-seasons",
    title: "Hubtown Seasons",
    line: "A sales lobby in Chembur, from idea to execution.",
    subtitle: "Sales office lobby",
    credit: "Internship at Essence of Art",
    cover: "elevations",
    site: { name: "Hubtown Seasons", address: "Ramakrishna Chemburkar Marg, Chembur East, Mumbai" },
    facts: [
      { label: "Client", value: "Hubtown" },
      { label: "Area", value: "6,000 sq ft" },
      { label: "Ceiling", value: "15 ft" },
    ],
    intro: [
      "My first project from idea to execution, as an intern at Essence of Art.",
      "A spacious, contemporary sales lounge that uses its irregular footprint to make a journey for visitors. The fifteen-foot ceiling gives it openness, and the large floor in the middle leaves room for meetings, presentations and informal talk.",
    ],
    chapters: [
      {
        kind: "layout",
        title: "Floor plan",
        drawing: "plan",
        body: [
          "A premium but approachable sales experience, where materials, light and carefully placed furniture tell visitors who Hubtown is.",
          "Rather than a conventional sales office, warm timber, stone, glass, metal and layered light give it the feel of hospitality. The irregular edges hold the meeting rooms, consultation spaces and storage, and the centre stays open.",
        ],
      },
      {
        kind: "views",
        title: "The passages",
        images: [],
        body: [
          "Large glazed panels and solid walls in a measured vertical rhythm. The glass keeps the lounge open and approachable; the solid parts carry branding and display.",
          "The fifteen-foot height gives the passages their tall proportions, and the textured wall and dark verticals give them definition.",
        ],
        drawings: ["elevations", "passage"],
      },
    ],
  },
];
