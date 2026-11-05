import { Stage } from "@/components/Stage";
import { about, site } from "@/content/site";

export default function Home() {
  return (
    <>
      <Stage />

      <section className="about" id="about">
        <div className="about__head">
          <h2 className="headline">{about.headline}</h2>
          <p className="about__line">{about.line}</p>
        </div>
        {site.portrait && <img className="about__portrait" src={site.portrait} alt={site.name} />}
        <div className="about__story">
          {about.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="stance">
        <h2 className="headline">{about.stance}</h2>
        <p className="about__line">{about.stanceLine}</p>
      </section>

      <section className="notes">
        <p>{about.process}</p>
        <p>{about.influences}</p>
        <p>{about.films}</p>
      </section>
    </>
  );
}
