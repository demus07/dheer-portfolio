import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { projects, sketches, work } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project?.title, description: project?.line };
}

function Figure({ slug, name, sizes, priority }: { slug: string; name: string; sizes: string; priority?: boolean }) {
  const image = work[slug][name];
  return (
    <figure className={`figure figure--${image.kind}`}>
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes} priority={priority} />
      <figcaption>{image.alt}</figcaption>
    </figure>
  );
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
        <header className="project__head">
          <h1 className="project__title">{project.title}</h1>
          <p className="about__line">{project.line}</p>
        </header>

        {project.hero ? (
          <div className="project__hero">
            <Figure slug={slug} name={project.hero} sizes="100vw" priority />
          </div>
        ) : (
          <div className="project__paper">
            <img className="project__sketch" src={sketch.src} alt={`${project.title}, first sketch`} />
          </div>
        )}

        <div className="project__text">
          <dl className="facts">
            {project.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="project__story">
            {project.epigraph && <p className="project__epigraph">{project.epigraph}</p>}
            {project.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        {project.gallery.length > 0 && (
          <div className="gallery">
            {project.gallery.map((block, i) =>
              "full" in block ? (
                <Figure key={i} slug={slug} name={block.full} sizes="100vw" />
              ) : (
                <div key={i} className="gallery__pair">
                  {block.pair.map((name) => (
                    <Figure key={name} slug={slug} name={name} sizes="(max-width: 760px) 100vw, 50vw" />
                  ))}
                </div>
              ),
            )}
          </div>
        )}

        <section className="paper">
          {project.hero && (
            <div className="paper__sketch">
              <img src={sketch.src} alt={`${project.title}, first sketch`} />
            </div>
          )}
          <div className="paper__drawings">
            {project.drawings.map((name) => (
              <Figure key={name} slug={slug} name={name} sizes="(max-width: 760px) 100vw, 80vw" />
            ))}
          </div>
        </section>

        {project.studies && (
          <section className="studies">
            <h2 className="studies__title">{project.studies.title}</h2>
            <div className="studies__grid" data-count={project.studies.images.length}>
              {project.studies.images.map((name) => (
                <Figure key={name} slug={slug} name={name} sizes="(max-width: 760px) 50vw, 25vw" />
              ))}
            </div>
          </section>
        )}

        <Link href={`/work/${next.slug}`} className="next">
          <span>Next</span>
          <span className="next__title">{next.title}</span>
        </Link>
      </article>
      <Footer />
    </>
  );
}
