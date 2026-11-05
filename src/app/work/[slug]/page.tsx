import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Drawing } from "@/components/Drawing";
import { Fill } from "@/components/Fill";
import { Plate } from "@/components/Plate";
import { projects } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: projects.find((p) => p.slug === slug)?.title };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article>
      <header className={`title-card tone-${project.tone}`}>
        <div className="title-card__art">
          <Drawing kind={project.drawing} />
        </div>
        <div className="title-card__top label">
          <span>({project.no})</span>
          <span>{project.status}</span>
        </div>
        <div className="title-card__foot">
          <h1 className="title-card__title">{project.title}</h1>
          <p className="lede">
            <Fill>{project.logline}</Fill>
          </p>
        </div>
      </header>

      <section className="section split">
        <p className="label">(Credits)</p>
        <dl className="credits">
          {project.credits.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>
                <Fill>{c.value}</Fill>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section split">
        <p className="label">(Brief)</p>
        <p className="body rise">
          <Fill>{project.brief}</Fill>
        </p>
      </section>

      <section className="section">
        <Plate kind="axon" ratio="16 / 9" label="[Hero render, 16:9, 2400px wide or larger]" />
      </section>

      <section className="section split">
        <p className="label">(The idea)</p>
        <p className="statement rise">
          <Fill>{project.idea}</Fill>
        </p>
      </section>

      <section className="sheet">
        <p className="label">(Drawing set)</p>
        <div className="sheet__grid">
          <Plate kind="plan" tone="snow" ratio="4 / 5" label="[Plan, 1:50]" />
          <Plate kind="section" tone="snow" ratio="4 / 5" label="[Section, 1:50]" />
          <Plate kind="elevation" tone="snow" ratio="4 / 5" label="[Elevation or joinery detail]" />
        </div>
      </section>

      <section className="section split">
        <p className="label">(Materials)</p>
        <ul className="swatches">
          {project.materials.map((m, i) => (
            <li key={i}>
              <span className={`swatch swatch--${i}`} />
              <span className="label">
                <Fill>{m}</Fill>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section pair">
        <Plate kind="board" label="[Process: sketches, models, the messy part]" />
        <Plate kind="spiral" label="[Detail shot or physical model]" />
      </section>

      <section className="section split">
        <p className="label">(What went wrong)</p>
        <p className="body rise">
          <Fill>{project.wrong}</Fill>
        </p>
      </section>

      <Link href={`/work/${next.slug}`} className="next">
        <span className="label">(Next room)</span>
        <span className="next__title">{next.title}</span>
      </Link>
    </article>
  );
}
