import type { ReactNode } from "react";
import type { DrawingKind } from "@/content/site";

// Line drawings that stand in for real images. All sit on a 4:5 sheet.

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function Plan() {
  return (
    <>
      <path strokeWidth={3} d="M60 90H340V250M340 300V410H190M130 410H60V90" />
      <path d="M336 250V300M344 250V300" />
      <path d="M130 410V350A60 60 0 0 1 190 410" />
      <rect x={90} y={120} width={120} height={150} rx={3} />
      <rect x={100} y={130} width={46} height={30} rx={3} />
      <rect x={154} y={130} width={46} height={30} rx={3} />
      <path d="M90 190H210" />
      <rect x={216} y={120} width={30} height={30} />
      <rect x={270} y={94} width={66} height={130} />
      <path d="M270 94L336 224M336 94L270 224" />
      <circle className="accent" cx={245} cy={335} r={44} />
      <circle className="accent" cx={245} cy={335} r={3} />
      <path d="M60 450H340M60 444V456M190 444V456M340 444V456" />
      <path d="M30 90V410M24 90H36M24 250H36M24 410H36" />
    </>
  );
}

function Section() {
  return (
    <>
      <path strokeWidth={3} d="M20 400H380" />
      {range(36).map((i) => (
        <path key={i} d={`M${24 + i * 10} 400l-10 12`} />
      ))}
      <path strokeWidth={2.5} d="M70 400V170L200 80L330 170V190M330 250V400" />
      <path strokeWidth={2} d="M70 280H150M250 280H330" />
      <path d="M70 288H150M250 288H330" />
      <path d={`M150 400${range(8).map(() => "v-15h15").join("")}`} />
      <g className="accent" strokeDasharray="4 5">
        {[120, 170, 220, 270].map((x, i) => (
          <path key={x} d={`M372 70L${x} ${i < 2 ? 400 : 280}`} />
        ))}
      </g>
      <circle className="accent" cx={372} cy={70} r={9} />
      <circle cx={110} cy={342} r={7} />
      <path d="M110 349V378M110 378L102 400M110 378L118 400M99 360H121" />
      <circle cx={290} cy={224} r={7} />
      <path d="M290 231V260M290 260L282 280M290 260L298 280M279 242H301" />
    </>
  );
}

function Elevation() {
  return (
    <>
      <rect strokeWidth={2.5} x={48} y={58} width={304} height={384} />
      {range(3).map((col) =>
        range(4).map((row) => {
          const x = 70 + col * 90;
          const y = 76 + row * 90;
          return (
            <path
              key={`${col}${row}`}
              className={col === 1 && row === 2 ? "accent" : undefined}
              d={`M${x} ${y + 76}V${y + 35}A35 35 0 0 1 ${x + 70} ${y + 35}V${y + 76}Z`}
            />
          );
        }),
      )}
      <path strokeWidth={3} d="M20 442H380" />
      <path d="M48 470H352M48 464V476M352 464V476" />
    </>
  );
}

const iso = (x: number, y: number, z = 0) =>
  `${(200 + (x - y) * 15).toFixed(1)} ${(240 + (x + y) * 7.5 - z * 15).toFixed(1)}`;

function Box({
  x,
  y,
  w,
  d,
  h,
  z = 0,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z?: number;
  accent?: boolean;
}) {
  const top = `M${iso(x, y, z + h)}L${iso(x + w, y, z + h)}L${iso(x + w, y + d, z + h)}L${iso(x, y + d, z + h)}Z`;
  const left = `M${iso(x, y + d, z + h)}L${iso(x, y + d, z)}L${iso(x + w, y + d, z)}L${iso(x + w, y + d, z + h)}`;
  const right = `M${iso(x + w, y, z + h)}L${iso(x + w, y, z)}L${iso(x + w, y + d, z)}`;
  return (
    <path
      className={accent ? "accent" : undefined}
      fill="var(--tone-bg)"
      d={`${top}${left}${right}`}
    />
  );
}

function Axon() {
  return (
    <>
      {range(11).map((i) => (
        <path key={i} d={`M${iso(i, 0)}L${iso(i, 10)}M${iso(0, i)}L${iso(10, i)}`} />
      ))}
      <path
        strokeWidth={2.5}
        d={`M${iso(0, 10)}L${iso(0, 10, 11)}L${iso(0, 0, 11)}L${iso(10, 0, 11)}L${iso(10, 0)}M${iso(0, 0)}L${iso(0, 0, 11)}`}
      />
      <path d={`M${iso(0, 3, 3)}L${iso(0, 3, 9)}L${iso(0, 7, 9)}L${iso(0, 7, 3)}ZM${iso(0, 5, 3)}L${iso(0, 5, 9)}`} />
      <path d={`M${iso(3, 0, 0)}L${iso(3, 0, 7)}L${iso(6, 0, 7)}L${iso(6, 0, 0)}`} />
      <Box x={1} y={1} w={8} d={2} h={1} />
      <Box x={2} y={5} w={4} d={3} h={1.4} accent />
      <Box x={7} y={6} w={2} d={2} h={3} />
    </>
  );
}

function Spiral() {
  const cx = 200;
  const cy = 250;
  const rail = range(130).map((i) => {
    const a = (i / 130) * Math.PI * 3.5 - Math.PI / 2;
    const r = 52 + (i / 130) * 104;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  });
  return (
    <>
      <circle strokeWidth={2.5} cx={cx} cy={cy} r={164} />
      <circle cx={cx} cy={cy} r={34} />
      <circle cx={cx} cy={cy} r={6} />
      {range(28).map((i) => {
        const a = (i / 28) * Math.PI * 2;
        const [c, s] = [Math.cos(a), Math.sin(a)];
        return (
          <path
            key={i}
            d={`M${(cx + c * 34).toFixed(1)} ${(cy + s * 34).toFixed(1)}L${(cx + c * 164).toFixed(1)} ${(cy + s * 164).toFixed(1)}`}
          />
        );
      })}
      <path className="accent" strokeWidth={1.5} d={rail.join("")} />
    </>
  );
}

// Nested svgs clip their contents, which keeps each hatch inside its tile.
function Tile({ col, row, children }: { col: number; row: number; children: ReactNode }) {
  const x = 56 + col * 150;
  const y = 60 + row * 130;
  return (
    <>
      <svg x={x} y={y} width={138} height={118} viewBox="0 0 138 118">
        {children}
      </svg>
      <rect x={x} y={y} width={138} height={118} />
    </>
  );
}

function Board() {
  return (
    <>
      <Tile col={0} row={0}>
        {range(20).map((i) => (
          <path key={i} d={`M${i * 12 - 60} 118L${i * 12 + 40} 0`} />
        ))}
      </Tile>
      <Tile col={1} row={0}>
        {range(8).map((i) =>
          range(9).map((j) => <circle key={`${i}${j}`} cx={8 + j * 15} cy={8 + i * 15} r={1.6} />),
        )}
      </Tile>
      <Tile col={0} row={1}>
        {range(8).map((i) => (
          <path key={i} d={`M0 ${i * 16 + 6}c30 -10 60 10 138 0`} />
        ))}
      </Tile>
      <Tile col={1} row={1}>
        <path className="accent" d="M0 30H138M0 60H138M0 90H138M46 0V30M92 30V60M46 60V90M92 90V118" />
      </Tile>
      <Tile col={0} row={2}>
        {range(8).map((i) =>
          range(6).map((j) => (
            <path key={`${i}${j}`} d={`M${j * 24} ${i * 18}l12 9l12 -9`} />
          )),
        )}
      </Tile>
      <Tile col={1} row={2}>
        {range(5).map((i) => (
          <circle key={i} cx={69} cy={59} r={14 + i * 18} />
        ))}
      </Tile>
    </>
  );
}

const drawings = {
  plan: Plan,
  section: Section,
  elevation: Elevation,
  axon: Axon,
  spiral: Spiral,
  board: Board,
};

export function Drawing({ kind }: { kind: DrawingKind }) {
  const Art = drawings[kind];
  return (
    <svg
      className="drawing"
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden
    >
      <Art />
    </svg>
  );
}
