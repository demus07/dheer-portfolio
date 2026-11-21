import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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

// Pictures in a row at one height, each as wide as its proportions ask, so nothing is cropped.
function Row({ slug, names }: { slug: string; names: string[] }) {
  return (
    <div className="row">
      {names.map((name) => {
        const { width, height } = work[slug][name];
        return (
          <div key={name} style={{ flexGrow: width / height }}>
            <Figure slug={slug} name={name} sizes={`(max-width: 760px) 100vw, ${Math.round(100 / names.length)}vw`} />
          </div>
        );
      })}
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

function Spread({ slug, chapter }: { slug: string; chapter: Chapter }) {
  switch (chapter.kind) {
    // A tall drawing sits beside the words, as in his portfolio; photographs run in a row under them.
    case "story": {
      const tall = chapter.images.length === 1;
      return (
        <section className="chapter story" data-tall={tall}>
          {tall && <Figure slug={slug} name={chapter.images[0]} sizes="(max-width: 760px) 100vw, 40vw" />}
          <div className="story__words" data-count={chapter.texts.length}>
            {chapter.texts.map((t) => (
              <Words key={t.title ?? t.body[0]} text={t} />
            ))}
          </div>
          {!tall && <Row slug={slug} names={chapter.images} />}
        </section>
      );
    }
    case "columns":
      return (
        <section className="chapter">
          {chapter.title && <h2 className="chapter__title">{chapter.title}</h2>}
          <div className="columns" data-count={chapter.columns.length}>
            {chapter.columns.map((c, i) => (
              <div key={i} className="columns__item">
                {c.title && <h3 className="chapter__title">{c.title}</h3>}
                {c.media.map((name) => (
                  <Figure key={name} slug={slug} name={name} sizes={`(max-width: 760px) 100vw, ${Math.round(100 / chapter.columns.length)}vw`} caption={false} />
                ))}
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    case "layout":
      return (
        <section className="chapter layout">
          <Figure slug={slug} name={chapter.drawing} sizes="(max-width: 760px) 100vw, 66vw" />
          <Words text={{ title: chapter.title, body: chapter.body }} />
        </section>
      );
    case "views":
      return (
        <section className="chapter views">
          {chapter.images.length > 0 && <Row slug={slug} names={chapter.images} />}
          <div className="views__words">
            {chapter.title && <h2 className="chapter__title">{chapter.title}</h2>}
            {chapter.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {chapter.drawings?.map((name) => (
            <Figure key={name} slug={slug} name={name} sizes="(max-width: 760px) 100vw, 90vw" />
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
