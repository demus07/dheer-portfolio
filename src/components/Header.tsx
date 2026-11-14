import Link from "next/link";
import { site } from "@/content/site";
import { Clock } from "./Clock";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="header__name">
        {site.fullName}
      </Link>
      <span className="header__fact">{site.role}</span>
      <Clock />
      <nav className="header__nav" aria-label="Main">
        <Link href="/#work">Work</Link>
        {site.showAbout && <Link href="/#about">About</Link>}
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
