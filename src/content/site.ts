// All site copy lives here, written from Dheer's questionnaire answers.

export type Project = {
  slug: string;
  title: string;
  line: string;
  facts: { label: string; value: string }[];
  story: string[];
  plates: string[];
};

const plates = (name: string) =>
  [1, 2, 3, 4, 5, 6].map((n) => `/plates/${name}-${n}.svg`);

export const site = {
  // Keeps the site out of search engines. Set to false at launch.
  draft: true,
  name: "Dheer",
  role: "Interior design student",
  location: "Mumbai",
  intro: "Intriguing, accessible, thoughtful. I start with the feeling and the people.",
  email: "[your@email.com]",
  // Add a path in public/ to show a portrait in the about section.
  portrait: "",
  socials: [] as { label: string; url: string }[],
};

export const about = {
  headline: "I walk in and watch the light.",
  line: "How it reacts with the colour. Why the space was built. How it makes me feel.",
  story: [
    "I grew up in Prabhadevi, sketching. My parents backed every choice I made.",
    "Interior design started as a minor in first year. One project went well, and I stayed.",
    "I work with graphical elements because they show who I am. The details do the rest.",
  ],
  stance: "Minimal became the default. Personal taste paid for it.",
  stanceLine: "I design for the visual direction a person already has.",
  process:
    "Research and sketching go together. The sketches tell me where to go. Then 3D, then CAD, then renders. I change any of them when another gives me a better answer.",
  films: "I call myself a cinephile. Inglourious Basterds, Interstellar and Kung Fu Panda share a shelf.",
  influences:
    "Sameer Kulavoor for his forms. Sanjay Puri for sketching first. Sajid Wajid Shaikh for moving between mediums.",
};

// Timed against the film's scroll, from 0 to 1.
export const film = [
  { text: "A two-storey building, now a Fabindia store.", from: 0.07, to: 0.105 },
  { text: "Inside it, a speakeasy.", from: 0.41, to: 0.51 },
  { text: "You come in for the music.", from: 0.57, to: 0.68 },
  { text: "You stay for a Stranger & Sons cocktail blend.", from: 0.72, to: 0.83 },
];

export const joint = [
  "Prototype after prototype, it didn’t look right.",
  "Five days before the deadline we started again.",
  "The first design only needed a few tweaks.",
  "Its joinery needed a Japanese perspective.",
  "We intertwined bamboo and wood.",
];

export const projects: Project[] = [
  {
    slug: "maatik",
    title: "Maatik",
    line: "A co-working space for the potters of Dharavi.",
    facts: [{ label: "With", value: "Chaarvi Chopra" }],
    story: [],
    plates: plates("maatik"),
  },
  {
    slug: "light-of-bharat",
    title: "Light of Bharat",
    line: "Regenerative interiors.",
    facts: [{ label: "With", value: "Chaarvi Chopra" }],
    story: [],
    plates: plates("bharat"),
  },
  {
    slug: "bamboo-seat",
    title: "The bamboo seat",
    line: "Seating that had to be rebuilt five days before the deadline.",
    facts: [
      { label: "Brief", value: "Seating from sustainable materials" },
      { label: "Joinery", value: "Intertwined bamboo and wood" },
    ],
    story: [
      "We chose materials that would work together through joinery. Prototype after prototype, it didn’t look right.",
      "Five days before the deadline we started again from scratch.",
      "Then I saw it. The first design only needed a few tweaks, and its joinery needed a Japanese perspective.",
      "We intertwined bamboo and wood. It turned out very nice.",
    ],
    plates: plates("seat"),
  },
  {
    slug: "shararat",
    title: "Shararat",
    line: "A speakeasy bar and gallery for India’s musical history.",
    facts: [
      { label: "Brands", value: "Jim Sarbh, Stranger & Sons, Coke Studio Bharat" },
      { label: "Site", value: "A two-storey building, now a Fabindia store" },
      { label: "With", value: "Chaarvi Chopra" },
    ],
    story: [
      "The brief was three brands in one space, each one making the others clearer.",
      "We took a two-storey building that houses a Fabindia store and imagined a speakeasy inside it.",
      "You come in for the music. You stay for a Stranger & Sons cocktail blend.",
      "This is my favourite project.",
    ],
    plates: plates("shararat"),
  },
];
