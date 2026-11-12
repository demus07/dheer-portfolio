import { FaInstagram, FaLinkedinIn, FaRegEnvelope } from "react-icons/fa6";

import { site } from "@/content/site";
import { BackToTop } from "./BackToTop";

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <h2 className="footer__title">Let’s talk</h2>
      <div className="footer__links" aria-label="Contact and social profiles">
        <a className="footer__social" href={`mailto:${site.email}`} aria-label={`Email ${site.fullName}`}>
          <FaRegEnvelope aria-hidden="true" />
        </a>
        <span className="footer__social" role="img" aria-label="LinkedIn link coming soon">
          <FaLinkedinIn aria-hidden="true" />
        </span>
        <span className="footer__social" role="img" aria-label="Instagram link coming soon">
          <FaInstagram aria-hidden="true" />
        </span>
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
