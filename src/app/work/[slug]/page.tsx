import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { LoopVideo } from "@/components/LoopVideo";
import { projects, sketches, work, type Chapter, type Text } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project?.title, description: project?.line };
}

function Figure({ slug, name, sizes, caption = true }: { slug: string; name: string; sizes: string; caption?: boolean }) {
  const image = work[slug][name];
  return (
    <figure className={`figure figure--${image.kind}`}>
      {image.kind === "video" ? (
        <LoopVideo src={image.src} poster={image.poster!} label={image.alt} width={image.width} height={image.height} />
      ) : (
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} />
      )}
      {caption && <figcaption>{image.alt}</figcaption>}
    </figure>
  );
}

// Pictures side by side in equal columns, so words set in the same columns start at each
// picture's left edge. Photographs and renders share one frame, cropped a little to match.
// Drawings and sketches are never cropped: each sits whole in a frame as tall as the tallest,
// up to a little taller than square, so one long sketch doesn't stretch the row.
function Grid({ slug, names, caption = true }: { slug: string; names: string[]; caption?: boolean }) {
  const items = names.map((name) => work[slug][name]);
  const whole = items.every((i) => i.kind === "drawing" || i.kind === "sketch");
  const ratios = items.map((i) => i.width / i.height);
  const ratio = whole ? Math.max(Math.min(...ratios), 0.85) : ratios.reduce((a, b) => a + b) / ratios.length;
  return (
    <div className="grid" data-whole={whole} style={{ "--count": names.length, "--ratio": ratio.toFixed(3), "--k": 1 } as CSSProperties}>
      {names.map((name, i) => (
        <div key={name} style={{ "--i": i } as CSSProperties}>
          <Figure slug={slug} name={name} sizes={`(max-width: 760px) 100vw, ${Math.round(100 / names.length)}vw`} caption={caption} />
        </div>
      ))}
    </div>
  );
}

// Paragraphs in the columns of the pictures above or below them. `k` is their place in a column
// (title, picture, words), so on a phone each column's pieces can come back together.
function Columns({ count, k = 2, children }: { count: number; k?: number; children: ReactNode[] }) {
  return (
    <div className={k === 0 ? "grid grid--words grid--lead" : "grid grid--words"} style={{ "--count": count, "--k": k } as CSSProperties}>
      {children.map((child, i) => (
        <div key={i} style={{ "--i": i } as CSSProperties}>
          {child}
        </div>
      ))}
    </div>
  );
}

function Words({ text }: { text: Text }) {
  return (
    <div className="words">
      {text.title && <h2 className="chapter__title">{text.title}</h2>}
      {text.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

// A technical drawing, centred, never wider than the page or taller than the screen.
function Drawing({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="drawing">
      <Figure slug={slug} name={name} sizes="(max-width: 760px) 100vw, 90vw" />
    </div>
  );
}

function Spread({ slug, chapter }: { slug: string; chapter: Chapter }) {
  switch (chapter.kind) {
    // A tall drawing sits beside the words, as in his portfolio; photographs run in a grid under them.
    case "story": {
      if (chapter.images.length === 1)
        return (
          <section className="chapter story" data-tall>
            <Figure slug={slug} name={chapter.images[0]} sizes="(max-width: 760px) 100vw, 40vw" />
            <div className="story__words">
              {chapter.texts.map((t) => (
                <Words key={t.title ?? t.body[0]} text={t} />
              ))}
            </div>
          </section>
        );
      return (
        <section className="chapter story">
          <Columns count={chapter.images.length} k={0}>
            {chapter.texts.map((t) => (
              <Words key={t.title ?? t.body[0]} text={t} />
            ))}
          </Columns>
          <Grid slug={slug} names={chapter.images} />
        </section>
      );
    }
    // Each column is a title, a picture and its words; the rows line up across the columns.
    case "columns": {
      const titled = chapter.columns.some((c) => c.title);
      const media = chapter.columns.flatMap((c) => c.media);
      return (
        <section className="chapter" data-pair>
          {chapter.title && <h2 className="chapter__title">{chapter.title}</h2>}
          {titled && (
            <Columns count={chapter.columns.length} k={0}>
              {chapter.columns.map((c, i) => (
                <h3 key={i} className="chapter__title">
                  {c.title}
                </h3>
              ))}
            </Columns>
          )}
          <Grid slug={slug} names={media} caption={false} />
          <Columns count={chapter.columns.length}>
            {chapter.columns.map((c, i) => (
              <div key={i} className="words">
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ))}
          </Columns>
        </section>
      );
    }
    case "layout":
      return (
        <section className="chapter">
          <h2 className="chapter__title">{chapter.title}</h2>
          <Columns count={3}>
            {chapter.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Columns>
          <Drawing slug={slug} name={chapter.drawing} />
        </section>
      );
    case "views":
      return (
        <section className="chapter" data-pair>
          {chapter.title && <h2 className="chapter__title">{chapter.title}</h2>}
          {chapter.images.length > 0 && <Grid slug={slug} names={chapter.images} />}
          <Columns count={Math.max(chapter.images.length, 2)}>
            {chapter.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Columns>
          {chapter.drawings?.map((name) => (
            <Drawing key={name} slug={slug} name={name} />
          ))}
        </section>
      );
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const sketch = sketches[slug];

  return (
    <>
      <article className="project">
        {/* The opening spread: the name, the site and the brief beside his first sketch. */}
        <header className="opening">
          <div className="opening__words">
            <h1 className="project__title">{project.title}</h1>
            <p className="project__subtitle">{project.subtitle}</p>
            {project.credit && <p className="project__credit">{project.credit}</p>}
            <div className="opening__site">
              <h2 className="chapter__title">{project.site.name}</h2>
              <p>{project.site.address}</p>
            </div>
            <dl className="facts">
              {project.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="opening__intro">
              {project.epigraph && <p className="project__epigraph">{project.epigraph}</p>}
              {project.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <img className="opening__sketch" src={sketch.src} alt={`${project.title}, first sketch`} />
        </header>

        {project.chapters.map((chapter, i) => (
          <Spread key={i} slug={slug} chapter={chapter} />
        ))}

        <Link href={`/work/${next.slug}`} className="next">
          <span>Next</span>
          <span className="next__title">{next.title}</span>
        </Link>
      </article>
      <Footer />
    </>
  );
}
