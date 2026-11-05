import Link from "next/link";
import { projects, site } from "@/content/site";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="header__name">
        {site.name}
      </Link>
      <nav className="header__nav label" aria-label="Main">
        <Link href="/work">
          Index <sup>{projects.length}</sup>
        </Link>
        <Link href="/about">About</Link>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
