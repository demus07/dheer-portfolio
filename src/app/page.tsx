import Link from "next/link";
import { Fill } from "@/components/Fill";
import { Hero } from "@/components/Hero";
import { Poster } from "@/components/Poster";
import { notes, projects, site } from "@/content/site";

export default function Home() {
  const [feature, ...rest] = projects;

  return (
    <>
      <Hero />

      <section className="section intro">
        <p className="label">(Point of view)</p>
        <p className="intro__text rise">
          <Fill>{site.notices}</Fill>
        </p>
      </section>

      <section className="section" aria-labelledby="programme">
        <div className="section__head">
          <h2 className="label" id="programme">
            (Now showing)
          </h2>
          <Link className="label link" href="/work">
            Full index ({projects.length})
          </Link>
        </div>

        <div className="feature">
          <div className="rise">
            <Poster project={feature} />
          </div>
          <div className="feature__text">
            <h3 className="feature__title">{feature.title}</h3>
            <p className="lede">
              <Fill>{feature.logline}</Fill>
            </p>
            <dl className="credits credits--compact">
              {feature.credits.slice(0, 4).map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>
                    <Fill>{c.value}</Fill>
                  </dd>
                </div>
              ))}
            </dl>
            <Link className="label link" href={`/work/${feature.slug}`}>
              Enter the room
            </Link>
          </div>
        </div>

        <div className="programme">
          {rest.map((p) => (
            <div className="rise" key={p.slug}>
              <Poster project={p} />
            </div>
          ))}
          <Link href="/work" className="programme__more">
            <span className="label">(Index)</span>
            <span className="programme__arrow" aria-hidden>
              →
            </span>
            <span className="poster__title">All work</span>
          </Link>
        </div>
      </section>

      <section className="stand">
        <p className="label">(What I refuse to do)</p>
        <p className="stand__text">
          <Fill>{site.refuses}</Fill>
        </p>
        <p className="label">
          (I always start with) <Fill>{site.startsWith}</Fill>
        </p>
      </section>

      <section className="section" aria-labelledby="notes">
        <div className="section__head">
          <h2 className="label" id="notes">
            (Notes)
          </h2>
        </div>
        <ul className="notes">
          {notes.map((n, i) => (
            <li key={i} className="notes__row">
              <span className="label">{n.tag}</span>
              <p className="notes__question">
                <Fill>{n.question}</Fill>
              </p>
              <span className="label">
                <Fill>{n.date}</Fill>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
