import type { Metadata } from "next";
import { WorkIndex } from "@/components/WorkIndex";

export const metadata: Metadata = { title: "Index" };

export default function Work() {
  return (
    <section className="section section--top">
      <h1 className="page-title">Index</h1>
      <WorkIndex />
    </section>
  );
}
