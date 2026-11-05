import { site } from "@/content/site";

export function Footer() {
  const hasEmail = !site.email.startsWith("[");

  return (
    <footer className="footer" id="contact">
      <h2 className="footer__title">Let’s talk</h2>
      <div className="footer__links">
        {hasEmail ? <a href={`mailto:${site.email}`}>{site.email}</a> : <p>{site.email}</p>}
        {site.socials.length > 0 && (
          <ul>
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.url}>{s.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
