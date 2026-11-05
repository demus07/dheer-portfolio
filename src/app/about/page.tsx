import type { Metadata } from "next";
import { Fill } from "@/components/Fill";
import { Plate } from "@/components/Plate";
import { about, site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <section className="section section--top">
        <h1 className="statement statement--large">
          <Fill>{about.opening}</Fill>
        </h1>
      </section>

      <section className="section about">
        <Plate kind="elevation" label="[Portrait, 4:5. Natural light, doing something]" />
        <div className="about__story">
          <p className="label">(Dheer)</p>
          {about.story.map((p) => (
            <p className="body" key={p}>
              <Fill>{p}</Fill>
            </p>
          ))}
        </div>
      </section>

      <section className="section split">
        <p className="label">(Outside the studio)</p>
        <div className="about__outside">
          <p className="body">
            <Fill>{about.outside}</Fill>
          </p>
          <p className="body">
            <Fill>{about.object}</Fill>
          </p>
        </div>
      </section>

      <section className="section split">
        <p className="label">(In my head)</p>
        <div className="influences">
          {about.influences.map((group) => (
            <div key={group.label}>
              <h2 className="label">{group.label}</h2>
              <ul>
                {group.items.map((item, i) => (
                  <li key={i}>
                    <Fill>{item}</Fill>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section split">
        <p className="label">(Record)</p>
        <div>
          <dl className="credits">
            {about.record.flatMap((group) =>
              group.rows.map(([year, entry]) => (
                <div key={group.label}>
                  <dt>{group.label}</dt>
                  <dd>
                    <Fill>{year ? `${year}, ${entry}` : entry}</Fill>
                  </dd>
                </div>
              )),
            )}
          </dl>
          {site.cv ? (
            <a className="label link" href={site.cv}>
              Download CV
            </a>
          ) : (
            <p className="label">
              <Fill>[CV download goes here]</Fill>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
