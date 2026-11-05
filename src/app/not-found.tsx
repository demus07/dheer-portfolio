import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section section--top missing">
      <p className="label">(404)</p>
      <h1 className="statement statement--large">This room isn&apos;t on the plan.</h1>
      <Link className="label link" href="/">
        Back to the plan
      </Link>
    </section>
  );
}
