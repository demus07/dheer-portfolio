import { site } from "@/content/site";
import { BackToTop } from "./BackToTop";

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <h2 className="footer__title">Let’s talk</h2>
      <div className="footer__links">
        <a href={`mailto:${site.email}`}>{site.email}</a>
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
      <div className="footer__base">
        <span>{site.fullName}</span>
        <BackToTop />
        <span>
          {site.role}, {site.location}
        </span>
      </div>
    </footer>
  );
}
