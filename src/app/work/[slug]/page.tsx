import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project?.title, description: project?.line };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="project">
      <header className="project__head">
        <h1 className="project__title">{project.title}</h1>
        <p className="about__line">{project.line}</p>
      </header>

      <div className="plates">
        {project.plates.slice(0, 2).map((src) => (
          <img key={src} src={src} alt="" />
        ))}
      </div>

      <div className="project__text">
        <dl className="facts">
          {project.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        {project.story.length > 0 && (
          <div className="project__story">
            {project.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
      </div>

      <div className="plates plates--three">
        {project.plates.slice(2, 5).map((src) => (
          <img key={src} src={src} alt="" />
        ))}
      </div>

      <Link href={`/work/${next.slug}`} className="next">
        <span>Next</span>
        <span className="next__title">{next.title}</span>
      </Link>
    </article>
  );
}
