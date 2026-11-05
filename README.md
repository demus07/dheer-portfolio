# Dheer: portfolio

Every word on the site lives in `src/content/site.ts`, written from Dheer's questionnaire answers.

```bash
npm install
npm run dev
```

## The idea

One lamp in one dark room. The opening drum is a lampshade made of his work. Scrolling opens its slats into a ring, and the lamp turns each project to the viewer. It joins the Kai Marlow hero to the Minifolio ring, and it comes from his own answers: a lamp as his signature, and film as his obsession.

## Replacing placeholders

- **Images:** the files in `public/plates` are stand-ins drawn by `scripts/plates.mjs`. Put real renders in `public/` and list them under `plates` for each project in `site.ts`. The ring and project pages both read from there.
- **Contact:** set `email` and `socials` in `site.ts`.
- **Portrait:** set `portrait` in `site.ts` and it appears in the about section.
- **Going live:** set `draft: false` so search engines can index the site.

## Palette

Dark Void `#151419`, Dusty Grey `#878787`, Snow `#FBFBFB`, Liquid Lava `#F56E0F`, with Slate Grey `#262626` in the plates. Orange comes from the lamp, so it stays rare.
