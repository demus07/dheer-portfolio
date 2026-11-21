# Dheer Chheda: portfolio

Every word on the site lives in `src/content/site.ts`. It comes from Dheer's questionnaire, his portfolio, his CV and the Shararat brand book.

```bash
npm install
npm run dev
```

## The idea

It opens the way a film does. While the landing loads, one line falls into a grid of hairlines, "Every room begins with the light", and the screen cuts to dark for "The rest is how it feels." Then his name, over a drum of his renders. Scrolling opens the drum into a ring of his renders, his Shararat walkthrough grows out of the dark until it fills the screen, and the page settles into the projects, how he works, and him. Scrolling is smoothed with Lenis.

## Images and film

All images, the film frames and the sketches are generated from his source files:

```bash
pip install pymupdf pillow av
python scripts/prepare-assets.py
python scripts/prepare-videos.py
python scripts/prepare-pages.py
```

It reads `context/` (his portfolio, CV, renders and the Shararat submission, which stay out of the repo) and writes `public/work`, `public/ring`, `public/film`, `public/sketches` and `src/content/media.json`. To add a project, add its files to the script, then list the images by name in `site.ts`.

`prepare-videos.py` reads his Maatik screen recordings from `context/videos/` and makes the frames the process section scrubs (`public/process/maatik-roof`) and the two loops on the Maatik page. `prepare-pages.py` pulls each project page's photographs, sketches, plans and sections from the portfolio into `public/work` and `src/content/pages.json`. Each project page follows the portfolio spread by spread; its chapters are listed in `site.ts`.

The red sketches stay vectors, recoloured to Liquid Lava. The film is his walkthrough at 12 frames a second, which the page draws to a canvas as you scroll.

## Before launch

- **Search engines:** set `draft: false` in `site.ts`.
- **Portrait:** set `portrait` in `site.ts` and it appears in the about section.
- **Socials and CV:** add them to `site.ts`. His CV PDF includes his phone number, so it isn't linked yet.

## Palette

Dark Void `#151419`, Dusty Grey `#878787`, Snow `#FBFBFB`, Liquid Lava `#F56E0F`. Orange comes from the lamp and from his pen, so it stays rare.
