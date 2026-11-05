"use client";

import Link from "next/link";
import { useState } from "react";
import { projects } from "@/content/site";
import { Fill } from "./Fill";
import { Poster } from "./Poster";

const types = ["All", ...new Set(projects.map((p) => p.type))];

export function WorkIndex() {
  const [type, setType] = useState("All");
  const [preview, setPreview] = useState(projects[0]);
  const shown = projects.filter((p) => type === "All" || p.type === type);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by type">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className="filter"
            aria-pressed={t === type}
            onClick={() => setType(t)}
          >
            {t}
            <sup>{t === "All" ? projects.length : projects.filter((p) => p.type === t).length}</sup>
          </button>
        ))}
      </div>

      <div className="index">
        <ol className="index__list">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="index__row"
                onMouseEnter={() => setPreview(p)}
                onFocus={() => setPreview(p)}
              >
                <span className="label">({p.no})</span>
                <span className="index__title">{p.title}</span>
                <span className="label">{p.type}</span>
                <span className="label">
                  <Fill>{p.year}</Fill>
                </span>
                <span className="label index__status">{p.status}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="index__preview">
          <Poster project={preview} />
        </div>
      </div>
    </>
  );
}
