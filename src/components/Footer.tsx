import { site } from "@/content/site";
import { Fill } from "./Fill";

export function Footer() {
  const hasEmail = !site.email.startsWith("[");

  return (
    <footer className="footer" id="contact">
      <p className="label">(Contact)</p>
      <p className="footer__status">
        <Fill>{site.currently}</Fill>
      </p>
      {hasEmail ? (
        <a className="footer__email" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      ) : (
        <p className="footer__email">
          <Fill>{site.email}</Fill>
        </p>
      )}
      <div className="footer__base label">
        <span>
          <Fill>{`© ${new Date().getFullYear()} ${site.fullName}`}</Fill>
        </span>
        <ul>
          {site.socials.map((s) => (
            <li key={s.label}>{s.url ? <a href={s.url}>{s.label}</a> : <span>{s.label}</span>}</li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
