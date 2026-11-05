// Marks [bracketed] placeholder copy so unfinished text is easy to spot.
export function Fill({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\[[^\]]+\])/).map((part, i) =>
        part.startsWith("[") ? (
          <span key={i} className="ph">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
