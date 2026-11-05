import Link from "next/link";
import { site } from "@/content/site";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="header__name">
        {site.name}
      </Link>
      <span className="header__fact">{site.role}</span>
      <span className="header__fact">{site.location}</span>
      <nav className="header__nav" aria-label="Main">
        <Link href="/#work">Work</Link>
        <Link href="/#about">About</Link>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
