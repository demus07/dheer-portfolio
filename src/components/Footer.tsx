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
        <a
          className="footer__social"
          href={site.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${site.fullName} on LinkedIn`}
        >
          <FaLinkedinIn aria-hidden="true" />
        </a>
        <a
          className="footer__social"
          href={site.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${site.fullName} on Instagram`}
        >
          <FaInstagram aria-hidden="true" />
        </a>
      </div>
      <div className="footer__base">
        <span>
          crafted with <span className="footer__heart">♥</span> by{" "}
          <a className="footer__credit" href="https://www.alro.one" target="_blank" rel="noreferrer">
            alro
          </a>
        </span>
        <BackToTop />
        <span>
          {site.role}, {site.location}
        </span>
      </div>
    </footer>
  );
}
