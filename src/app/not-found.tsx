import Link from "next/link";

export default function NotFound() {
  return (
    <section className="missing">
      <h1 className="headline">The lamp found nothing here.</h1>
      <Link className="talk" href="/">
        Back to the room <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
