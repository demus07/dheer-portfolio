import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <section className="missing">
        <h1 className="work__title">Nothing in this room.</h1>
        <Link className="talk" href="/">
          Back to the work <span aria-hidden>→</span>
        </Link>
      </section>
      <Footer />
    </>
  );
}
