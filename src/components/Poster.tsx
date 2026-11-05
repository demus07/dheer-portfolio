import Link from "next/link";
import type { Project } from "@/content/site";
import { Drawing } from "./Drawing";
import { Fill } from "./Fill";

export function Poster({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className={`poster tone-${project.tone}`}>
      <div className="poster__art">
        <Drawing kind={project.drawing} />
      </div>
      <div className="poster__top label">
        <span>({project.no})</span>
        <span>{project.status}</span>
      </div>
      <div className="poster__foot">
        <h3 className="poster__title">{project.title}</h3>
        <p className="label">
          <Fill>{project.logline}</Fill>
        </p>
      </div>
    </Link>
  );
}
