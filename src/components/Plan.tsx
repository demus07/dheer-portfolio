// The hero floor plan. Rooms line up with the first six entries in `projects`.

export const rooms = [
  { points: "60,60 360,60 360,300 60,300", label: [76, 88] },
  { points: "360,60 620,60 620,240 360,240", label: [376, 138] },
  { points: "620,60 1000,60 1000,300 620,300", label: [636, 88] },
  { points: "60,300 300,300 300,500 60,500", label: [76, 328] },
  { points: "300,300 760,300 760,500 300,500", label: [316, 328] },
  { points: "1000,60 1140,60 1140,500 760,500 760,300 1000,300", label: [1016, 88] },
];

const walls = [
  // Outer, broken at the windows
  "M130 60H60V140M60 240V340M60 420V500H120M240 500H400M660 500H820M1060 500H1140V380M1140 180V60H920M700 60H550M430 60H290",
  // Inner
  "M360 60V170M360 210V245M360 285V300M60 300H470M510 300H1000",
  "M360 240H470M510 240H620M620 60V245M620 285V300",
  "M300 300V390M300 430V500M760 300V400M760 440V500M1000 60V170M1000 210V300",
];

const windows = [
  "M130 56H290M130 64H290M430 56H550M430 64H550M700 56H920M700 64H920",
  "M56 140V240M64 140V240M56 340V420M64 340V420",
  "M120 496H240M120 504H240M400 496H660M400 504H660M820 496H1060M820 504H1060",
  "M1136 180V380M1144 180V380",
];

const doors = [
  "M360 170H400A40 40 0 0 1 360 210",
  "M360 245H400A40 40 0 0 1 360 285",
  "M620 245H660A40 40 0 0 1 620 285",
  "M470 240V200A40 40 0 0 1 510 240",
  "M470 300V340A40 40 0 0 0 510 300",
  "M300 390H260A40 40 0 0 0 300 430",
  "M760 400H800A40 40 0 0 1 760 440",
  "M1000 170H1040A40 40 0 0 1 1000 210",
];

const treads = Array.from({ length: 11 }, (_, i) => 92 + i * 17);
const chairs = [430, 490, 550, 610];

export function PlanLines({ draw = false }: { draw?: boolean }) {
  return (
    <g className={draw ? "plan-lines plan-lines--draw" : "plan-lines"}>
      <g className="plan-grid">
        {[60, 360, 620, 1000, 1140].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 38V522`} />
            <circle cx={x} cy={24} r={12} />
            <text x={x} y={28} textAnchor="middle">
              {"ABCDE"[i]}
            </text>
          </g>
        ))}
        {[60, 300, 500].map((y, i) => (
          <g key={y}>
            <path d={`M38 ${y}H1160`} />
            <circle cx={24} cy={y} r={12} />
            <text x={24} y={y + 4} textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
      </g>

      <g className="plan-furniture">
        {/* Room 01 */}
        <rect x={100} y={96} width={200} height={58} rx={6} />
        <path d="M166 96V154M234 96V154" />
        <circle cx={204} cy={226} r={52} />
        <rect x={172} y={206} width={64} height={40} />
        {/* Room 02 */}
        <rect x={374} y={70} width={234} height={34} />
        <circle cx={420} cy={87} r={10} />
        <circle cx={560} cy={87} r={7} />
        <circle cx={582} cy={87} r={7} />
        <rect x={440} y={140} width={120} height={46} />
        {/* Room 03 */}
        <rect x={790} y={92} width={170} height={176} rx={4} />
        <rect x={804} y={102} width={66} height={40} rx={4} />
        <rect x={880} y={102} width={66} height={40} rx={4} />
        <path d="M790 170H960" />
        <rect x={680} y={252} width={96} height={38} />
        <path d="M680 252L776 290M776 252L680 290" />
        {/* Room 04: stair */}
        <rect x={92} y={350} width={170} height={70} />
        {treads.map((x) => (
          <path key={x} d={`M${x} 350V420`} />
        ))}
        <path d="M92 385H252M240 375L252 385L240 395" />
        {/* Room 05: table */}
        <rect x={410} y={370} width={240} height={64} rx={2} />
        {chairs.map((x) => (
          <g key={x}>
            <rect x={x} y={350} width={30} height={14} />
            <rect x={x} y={440} width={30} height={14} />
          </g>
        ))}
        {/* Room 06: court */}
        <circle cx={1070} cy={140} r={38} />
        <circle cx={1070} cy={140} r={24} />
        <circle cx={1074} cy={270} r={28} />
        <path d="M800 350H1120M800 390H1120M800 430H1120M800 470H1120M880 320V490M960 320V490M1040 320V490" />
      </g>

      <g className="plan-windows">
        {windows.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="plan-doors">
        {doors.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="plan-walls">
        {walls.map((d) => (
          <path key={d} d={d} pathLength={1} />
        ))}
      </g>
    </g>
  );
}
