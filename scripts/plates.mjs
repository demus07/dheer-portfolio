// Draws the stand-in project plates into public/plates. Run: node scripts/plates.mjs
// Each is a flat graphic of what the project is about. Swap for real renders in site.ts.
import { mkdirSync, writeFileSync } from "node:fs";

const VOID = "#151419";
const SLATE = "#262626";
const SNOW = "#FBFBFB";
const LAVA = "#F56E0F";

const inks = {
  void: { bg: VOID, fg: SNOW, ac: LAVA },
  lava: { bg: LAVA, fg: VOID, ac: SNOW },
  snow: { bg: SNOW, fg: VOID, ac: LAVA },
  slate: { bg: SLATE, fg: LAVA, ac: SNOW },
};

const range = (n) => Array.from({ length: n }, (_, i) => i);
const POT =
  "M120 90H180V104C180 120 224 140 224 205C224 270 190 306 150 306C110 306 76 270 76 205C76 140 120 120 120 104Z";

const motifs = {
  coupe: ({ fg, ac }) => `
    <path fill="${fg}" d="M64 112H236C236 190 194 216 157 219V322H208V336H92V322H143V219C106 216 64 190 64 112Z"/>
    <path fill="${ac}" d="M82 134H218C211 182 180 200 150 202C120 200 89 182 82 134Z"/>`,

  record: ({ bg, fg, ac }) => `
    <circle cx="150" cy="200" r="134" fill="${fg}"/>
    ${range(8).map((i) => `<circle cx="150" cy="200" r="${46 + i * 11}" fill="none" stroke="${bg}" stroke-width="1.5"/>`).join("")}
    <circle cx="150" cy="200" r="36" fill="${ac}"/>
    <circle cx="150" cy="200" r="5" fill="${bg}"/>`,

  keyhole: ({ fg, ac }) => `
    <circle cx="150" cy="150" r="66" fill="${ac}"/>
    <polygon fill="${ac}" points="124,190 176,190 200,306 100,306"/>`,

  pot: ({ bg, fg, ac }) => `
    <path fill="${fg}" d="${POT}"/>
    <path fill="none" stroke="${ac}" stroke-width="7" d="M84 176C120 192 180 192 216 176"/>
    <path fill="none" stroke="${bg}" stroke-width="2" d="M78 200C120 216 180 216 222 200M78 222C120 238 180 238 222 222"/>`,

  wheel: ({ bg, fg, ac }) => {
    const spiral = range(160)
      .map((i) => {
        const a = (i / 160) * Math.PI * 9;
        const r = 18 + (i / 160) * 102;
        return `${i ? "L" : "M"}${(150 + Math.cos(a) * r).toFixed(1)} ${(200 + Math.sin(a) * r).toFixed(1)}`;
      })
      .join("");
    return `
    <circle cx="150" cy="200" r="130" fill="${fg}"/>
    <path fill="none" stroke="${bg}" stroke-width="2.5" d="${spiral}"/>
    <circle cx="150" cy="200" r="16" fill="${ac}"/>`;
  },

  shelf: ({ fg, ac }) =>
    range(3)
      .map((row) => {
        const y = 40 + row * 116;
        const pots = range(3)
          .map((col) => {
            const on = row === 1 && col === 2;
            return `<path fill="${on ? ac : fg}" transform="translate(${28 + col * 84} ${y}) scale(.46)" d="${POT}"/>`;
          })
          .join("");
        return `${pots}<rect x="24" y="${y + 142}" width="252" height="4" fill="${fg}"/>`;
      })
      .join(""),

  sun: ({ fg, ac }) => `
    ${range(13)
      .map((i) => {
        const a = Math.PI + (i / 12) * Math.PI;
        const x = (r) => (150 + Math.cos(a) * r).toFixed(1);
        const y = (r) => (292 + Math.sin(a) * r).toFixed(1);
        return `<line x1="${x(112)}" y1="${y(112)}" x2="${x(210)}" y2="${y(210)}" stroke="${fg}" stroke-width="5"/>`;
      })
      .join("")}
    <path fill="${ac}" d="M60 292A90 90 0 0 1 240 292Z"/>
    <rect y="292" width="300" height="108" fill="${fg}"/>`,

  jaali: ({ fg, ac }) =>
    range(7)
      .map((row) =>
        range(5)
          .map((col) => {
            const x = 30 + col * 60 + (row % 2 ? 30 : 0);
            const y = 20 + row * 60;
            if (x > 280) return "";
            const on = row === 3 && col === 1;
            return `<path fill="${on ? ac : fg}" d="M${x} ${y - 25}Q${x + 7} ${y - 7} ${x + 25} ${y}Q${x + 7} ${y + 7} ${x} ${y + 25}Q${x - 7} ${y + 7} ${x - 25} ${y}Q${x - 7} ${y - 7} ${x} ${y - 25}Z"/>`;
          })
          .join(""),
      )
      .join(""),

  window: ({ fg, ac }) => `
    <polygon fill="${fg}" opacity=".16" points="118,236 196,236 150,400 -20,400"/>
    <path fill="${ac}" d="M112 236V118A45 45 0 0 1 202 118V236Z"/>
    <rect x="154" y="72" width="6" height="164" fill="${fg}"/>
    <rect x="112" y="150" width="90" height="6" fill="${fg}"/>`,

  bamboo: ({ bg, fg, ac }) =>
    range(4)
      .map((i) => {
        const x = 34 + i * 62;
        const nodes = range(5)
          .map((j) => `<rect x="${x - 3}" y="${28 + j * 84 + (i % 2) * 34}" width="44" height="7" fill="${bg}"/>`)
          .join("");
        return `<rect x="${x}" y="0" width="38" height="400" fill="${i === 2 ? ac : fg}"/>${nodes}`;
      })
      .join(""),

  weave: ({ fg, ac }) => {
    const w = 20;
    const pitch = 56;
    const horizontal = range(7).map((j) => `<rect x="0" y="${j * pitch + 12}" width="300" height="${w}" fill="${fg}" opacity=".55"/>`);
    const vertical = range(6).flatMap((i) =>
      range(8)
        .filter((j) => (i + j) % 2 === 0)
        .map((j) => `<rect x="${i * pitch + 12}" y="${j * pitch - 14}" width="${w}" height="${pitch + 24}" fill="${ac}"/>`),
    );
    return horizontal.concat(vertical).join("");
  },

  chair: ({ fg, ac }) => `
    <path fill="none" stroke="${fg}" stroke-width="15" stroke-linecap="square" d="M96 64L114 226L92 342M216 226V342"/>
    <rect x="102" y="212" width="130" height="24" fill="${ac}"/>
    <path fill="none" stroke="${fg}" stroke-width="15" stroke-linecap="square" d="M112 286H216"/>`,
};

const plan = {
  shararat: [["coupe", "void"], ["record", "lava"], ["keyhole", "void"], ["coupe", "lava"], ["record", "snow"], ["keyhole", "slate"]],
  maatik: [["pot", "snow"], ["wheel", "void"], ["shelf", "lava"], ["pot", "slate"], ["wheel", "lava"], ["shelf", "void"]],
  bharat: [["sun", "void"], ["jaali", "lava"], ["window", "void"], ["sun", "lava"], ["jaali", "snow"], ["window", "slate"]],
  seat: [["bamboo", "void"], ["weave", "void"], ["chair", "snow"], ["bamboo", "lava"], ["weave", "slate"], ["chair", "void"]],
};

mkdirSync("public/plates", { recursive: true });
for (const [project, plates] of Object.entries(plan)) {
  plates.forEach(([motif, ink], i) => {
    const colours = inks[ink];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="600" height="800"><rect width="300" height="400" fill="${colours.bg}"/>${motifs[motif](colours)}</svg>`;
    writeFileSync(`public/plates/${project}-${i + 1}.svg`, svg);
  });
}
