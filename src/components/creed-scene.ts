// The dark half of the creed, drawn in WebGL, after Santal's philosophy section.
//
// A block of hollow shafts runs away from you along -z, and his words are written on the shafts'
// walls. The camera starts above the block looking straight down onto the horizontal walls, so
// the words read as a flat, layered field, with "Feeling before form." on the top one, exactly
// where the page drew it. Then, in one continuous move, it pulls back, rolls until the words stand
// almost upright, and pitches a quarter turn: the walls go edge-on and the words thin to streaks.
// It settles looking straight down the shafts and dives into the middle one. The Shararat film is
// that shaft's floor, and the dive ends with it filling the screen exactly as the walkthrough begins.
//
// Creed.tsx keeps its own copy of START and END, so three.js stays out of the main bundle.

import * as THREE from "three";
import { creed } from "@/content/site";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const span = (n: number, from: number, to: number) => clamp((n - from) / (to - from));
const ease = (n: number) => n * n * (3 - 2 * n);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Building it is spread over idle moments, a little at a time, so it never stalls the scroll.
const idle = () =>
  new Promise<void>((resolve) =>
    "requestIdleCallback" in window ? window.requestIdleCallback(() => resolve(), { timeout: 400 }) : setTimeout(resolve, 16),
  );

const FOV = 40;
const K = 5; // shafts either side of the middle one
const LAYERS = 3; // the phrase lies on this wall above the middle; it is the highest with words
const DEEP = 8; // words run on every wall below it, down to this many below the middle
const CELL = 0.46; // a shaft's mouth is this fraction of the screen, and has the screen's shape

const START = 300; // screen heights into the section where the scene takes over
const END = 1060; // where the film fills the screen

// Camera keys, in screen heights scrolled into the section. Angles in degrees; distance and fog in
// multiples of D0, the distance at which one world unit is one CSS pixel. The camera eases to a
// stop only at "flat" keys; it flows through the others.
type Key = {
  v: number;
  x: number;
  y: number;
  z: number;
  d: number;
  pitch: number;
  yaw: number;
  roll: number;
  near: number;
  far: number;
  flat?: boolean;
};

export type Phrase = { mask: HTMLElement; text: string; italic: boolean };

export type Scene = {
  update: (v: number) => void;
  dispose: () => void;
};

export async function createScene(canvas: HTMLCanvasElement, pin: HTMLElement, phrase: Phrase[], still: boolean): Promise<Scene> {
  const vw = pin.clientWidth;
  const vh = pin.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const family = getComputedStyle(phrase[0].mask).fontFamily;
  const phraseSize = parseFloat(getComputedStyle(phrase[0].mask).fontSize);
  await Promise.all([document.fonts.load(`400 100px ${family}`), document.fonts.load(`italic 400 100px ${family}`)]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.setSize(vw, vh, false);
  const VOID = new THREE.Color("#151419");
  renderer.setClearColor(VOID, 1);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(VOID, 1, 2);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(FOV, vw / vh, 1, 60000);
  const D0 = vh / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  // The camera rolls a quarter turn on its way down and never rolls back, so the shafts are laid
  // out turned a quarter: at the end, screen right is -y and screen up is +x. A shaft is CX across
  // in x and CY in y, which is the screen's shape once you look down it.
  const CX = vh * CELL;
  const CY = vw * CELL;
  const L = vh * 3.2; // how deep the shafts run
  const yTop = (LAYERS + 0.5) * CY; // the highest wall with words: the phrase lies on it

  const target = new THREE.Vector3();
  const back = new THREE.Vector3();
  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  let last = -1;

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // The shafts, as hairlines: the mouths, the floors, and the edges running between them.
  const p: number[] = [];
  {
    const X = (K + 0.5) * CX;
    const Y = (K + 0.5) * CY;
    for (let i = -K - 0.5; i <= K + 0.5; i++) {
      for (const z of [0, -L]) {
        p.push(i * CX, -Y, z, i * CX, Y, z);
        p.push(-X, i * CY, z, X, i * CY, z);
      }
      for (let j = -K - 0.5; j <= K + 0.5; j++) p.push(i * CX, j * CY, 0, i * CX, j * CY, -L);
    }
  }
  const lineGeometry = keep(new THREE.BufferGeometry());
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  const lineMaterial = keep(new THREE.LineBasicMaterial({ color: 0xfbfbfb, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  // One texture per word, drawn large so it stays sharp up close.
  const textures = new Map<string, { texture: THREE.Texture; aspect: number }>();
  const wordTexture = (text: string, italic: boolean) => {
    const key = `${text}|${italic}`;
    const hit = textures.get(key);
    if (hit) return hit;
    const F = 160;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    const font = `${italic ? "italic " : ""}400 ${F}px ${family}`;
    const spacing = (x: CanvasRenderingContext2D) => {
      x.font = font;
      if ("letterSpacing" in x) x.letterSpacing = `${-0.03 * F}px`;
    };
    spacing(ctx);
    c.width = Math.ceil(ctx.measureText(text).width + F * 0.3);
    c.height = Math.ceil(F * 1.3);
    spacing(ctx);
    ctx.fillStyle = "#fbfbfb";
    ctx.textBaseline = "middle";
    ctx.fillText(text, F * 0.15, c.height / 2);
    const texture = keep(new THREE.CanvasTexture(c));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = aniso;
    const out = { texture, aspect: c.width / c.height };
    textures.set(key, out);
    return out;
  };

  // Words are drawn instanced, one batch per word and kind, each copy with its own brightness.
  type Group = "field" | "ahead" | "wall";
  type Batch = { text: string; italic: boolean; side: THREE.Side; group: Group; items: { m: THREE.Matrix4; b: number }[] };
  const batches = new Map<string, Batch>();
  const add = (group: Group, text: string, italic: boolean, size: number, at: THREE.Vector3, turn: THREE.Quaternion, b: number, side: THREE.Side) => {
    const key = `${group}|${text}|${italic}|${side}`;
    let batch = batches.get(key);
    if (!batch) batches.set(key, (batch = { text, italic, side, group, items: [] }));
    const { aspect } = wordTexture(text, italic);
    batch.items.push({ m: new THREE.Matrix4().compose(at, turn, new THREE.Vector3(size * 1.3 * aspect, size * 1.3, 1)), b });
  };

  const rand = seeded(11);
  const pick = (list: string[]) => list[Math.floor(rand() * list.length)];
  // Like Santal's field: a few words bright, most of them grey.
  const brightness = () => (rand() < 0.14 ? 0.85 + rand() * 0.15 : 0.18 + rand() * 0.34);

  // Lying on a horizontal wall, facing up, reading across, its top toward the far end of the shafts.
  const lying = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0)),
  );
  const spin = (deg: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(deg));

  // The field: words on the horizontal walls. You look down onto the top few at first.
  const big = Math.max(phraseSize * 0.5, Math.min(vw * 0.1, 60));
  // Spaced like Santal's: a handful of words to a row, with room between them.
  const rowStep = big * 2.9;
  const colStep = big * 6.8;
  // The words run well past the shafts on every side, so no corner of the screen goes bare
  // while the camera rolls.
  const X = Math.max((K + 0.5) * CX, vw * 4);
  for (let j = LAYERS; j >= -DEEP; j--) {
    const y = (j + 0.5) * CY;
    let row = 0;
    for (let z = -L - vh * 1.4 + rowStep * 0.5; z < vh * 2.6; z += rowStep, row++) {
      for (let x = -X + (row % 2) * colStep * 0.5; x < X; x += colStep) {
        const px = x + (rand() - 0.5) * colStep * 0.3;
        const pz = z + (rand() - 0.5) * rowStep * 0.25;
        // Leave room around the phrase on the top wall.
        if (j === LAYERS && Math.abs(px) < vw * 0.3 && Math.abs(pz + L / 2) < vh * 0.36) continue;
        // Words past the shafts' open ends fill the corners while the camera rolls, then clear away
        // before it looks straight down, so that view stays nearly empty, as on Santal.
        const group = pz > 0 ? "ahead" : "field";
        add(group, pick(creed.big), false, big, new THREE.Vector3(px, y, pz), lying, brightness(), THREE.DoubleSide);
        if (rand() < 0.25) {
          const turn = lying.clone().multiply(spin(rand() < 0.5 ? 72 : 14));
          const at = new THREE.Vector3(px + colStep * 0.3, y, pz + rowStep * 0.35);
          add(group, pick(creed.small), true, big * 0.42, at, turn, 0.15 + rand() * 0.3, THREE.DoubleSide);
        }
      }
    }
    await idle();
  }

  // Words on the upright walls, which only face you once you look down the shafts.
  const Yv = new THREE.Vector3(0, 1, 0);
  const Zv = new THREE.Vector3(0, 0, 1);
  // Read from the end of the dive: running across the screen (-y), standing toward the middle.
  const facing = [
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Yv.clone().negate(), Zv.clone().negate(), new THREE.Vector3(1, 0, 0))),
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Yv.clone().negate(), Zv, new THREE.Vector3(-1, 0, 0))),
  ];
  for (let i = -K; i <= K; i++) {
    for (const side of [0, 1]) {
      const count = i === 0 ? 3 : 1 + Math.floor(rand() * 2);
      for (let k = 0; k < count; k++) {
        const text = pick([...creed.big, ...creed.small]);
        const italic = creed.small.includes(text);
        const { aspect } = wordTexture(text, italic);
        const size = Math.min(Math.min(CX, CY) * 0.22, (CY * 0.8) / (1.3 * aspect));
        const depth = L * (0.12 + ((k + rand() * 0.8) / count) * 0.8);
        const x = i * CX + (side === 0 ? -CX / 2 + 0.5 : CX / 2 - 0.5);
        // Front side only: a shared wall's other face belongs to the next shaft.
        add("wall", text, italic, size, new THREE.Vector3(x, 0, -depth), facing[side], i === 0 ? 0.7 : 0.25 + rand() * 0.4, THREE.FrontSide);
      }
    }
  }

  const plane = keep(new THREE.PlaneGeometry(1, 1));
  const groups: Record<Group, THREE.MeshBasicMaterial[]> = { field: [], ahead: [], wall: [] };
  const color = new THREE.Color();
  for (const batch of batches.values()) {
    const { texture } = wordTexture(batch.text, batch.italic);
    const material = keep(new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false, side: batch.side }));
    const mesh = new THREE.InstancedMesh(plane, material, batch.items.length);
    batch.items.forEach((item, i) => {
      mesh.setMatrixAt(i, item.m);
      mesh.setColorAt(i, color.setScalar(item.b));
    });
    mesh.computeBoundingSphere();
    scene.add(mesh);
    groups[batch.group].push(material);
  }

  await idle();

  // The phrase, drawn to sit exactly where the page drew it: on the top wall, under the camera.
  const phraseMaterials: THREE.MeshBasicMaterial[] = [];
  {
    const pinBox = pin.getBoundingClientRect();
    for (const line of phrase) {
      const box = line.mask.getBoundingClientRect();
      const css = getComputedStyle(line.mask);
      const fs = parseFloat(css.fontSize);
      const padL = parseFloat(css.paddingLeft);
      const padT = parseFloat(css.paddingTop);
      const S = Math.min(dpr * 1.5, 3);
      const c = document.createElement("canvas");
      c.width = Math.ceil(box.width * S);
      c.height = Math.ceil(box.height * S);
      const ctx = c.getContext("2d")!;
      ctx.scale(S, S);
      ctx.font = `${line.italic ? "italic " : ""}400 ${fs}px ${family}`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${-0.035 * fs}px`;
      const m = ctx.measureText(line.text);
      const lh = 0.95 * fs;
      ctx.fillStyle = "#fbfbfb";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(line.text, padL, padT + (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent);
      const texture = keep(new THREE.CanvasTexture(c));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = aniso;
      const material = keep(new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      const mesh = new THREE.Mesh(plane, material);
      mesh.quaternion.copy(lying);
      mesh.scale.set(box.width, box.height, 1);
      const cx = box.left - pinBox.left + box.width / 2;
      const cy = box.top - pinBox.top + box.height / 2;
      // Screen right is +x and screen up is -z when looking straight down.
      mesh.position.set(cx - vw / 2, yTop + 1, -L / 2 - vh / 2 + cy);
      mesh.renderOrder = 2;
      scene.add(mesh);
      phraseMaterials.push(material);
    }
  }

  // The floor of the middle shaft: the walkthrough's first frame, cropped the way the walkthrough crops it.
  const film = document.createElement("canvas");
  film.width = Math.min(vw, 1600);
  film.height = Math.round((film.width * vh) / vw);
  const filmTexture = keep(new THREE.CanvasTexture(film));
  filmTexture.colorSpace = THREE.SRGBColorSpace;
  const floorMaterial = keep(new THREE.MeshBasicMaterial({ map: filmTexture, fog: false, transparent: true, opacity: 0 }));
  const floor = new THREE.Mesh(plane, floorMaterial);
  floor.scale.set(vw * CELL, vh * CELL, 1);
  floor.rotation.z = -Math.PI / 2;
  floor.position.set(0, 0, -L);
  scene.add(floor);
  const first = new Image();
  first.src = "/film/000.webp";
  first
    .decode()
    .then(() => {
      const ctx = film.getContext("2d")!;
      const scale = Math.max(film.width / first.naturalWidth, film.height / first.naturalHeight);
      const w = first.naturalWidth * scale;
      const h = first.naturalHeight * scale;
      ctx.drawImage(first, (film.width - w) / 2, (film.height - h) / 2, w, h);
      filmTexture.needsUpdate = true;
      last = -1;
    })
    .catch(() => {});

  // The path, after Santal's: one continuous move, no turning back. The first key is the page's own
  // view of the phrase; the last puts the floor exactly edge to edge with the screen.
  const above = (L + 2.3 * D0) / D0; // looking down the shafts from above their mouths
  // While it is over the block the camera stays well above the top wall, so no word looms up;
  // it only drops to the middle once it is out in front of the shafts' mouths.
  const gap = CY / D0; // the spacing of the walls, in D0
  const out = (pitch: number, z: number, y: number) => {
    // The distance and target height that put the camera at depth z, height y, for this pitch.
    const r = THREE.MathUtils.degToRad(-pitch);
    const d = (z + L) / Math.cos(r);
    return { d: d / D0, y: y - d * Math.sin(r) };
  };
  const tip = out(-28, D0 * 0.55, yTop + D0 * 0.35);
  const keys: Key[] = [
    { v: START, x: 0, y: yTop, z: -L / 2, d: 1, pitch: -90, yaw: 0, roll: 0, near: 0.97, far: 0.97 + gap * 1.5 },
    { v: 400, x: 0, y: yTop, z: -L / 2 - vh * 0.1, d: 1.75, pitch: -89, yaw: 0, roll: -10, near: 1.72, far: 1.72 + gap * 1.6 },
    { v: 500, x: vw * 0.05, y: yTop, z: -L * 0.56, d: 1.8, pitch: -80, yaw: 3, roll: -34, near: 1.9, far: 1.9 + gap * 3.2 },
    { v: 600, x: vw * 0.08, y: yTop - D0 * 0.3, z: -L * 0.74, d: 2.2, pitch: -60, yaw: 4, roll: -58, near: 2.4, far: 2.4 + gap * 6.5 },
    { v: 700, x: vw * 0.04, y: tip.y, z: -L, d: tip.d, pitch: -28, yaw: 2, roll: -76, near: 2.2, far: 2.2 + gap * 7.5 },
    { v: 800, x: 0, y: 0, z: -L, d: above, pitch: 0, yaw: 0, roll: -90, near: above - L / D0, far: above - L / D0 + 0.9 },
    { v: 880, x: 0, y: 0, z: -L, d: above * 0.82, pitch: 0, yaw: 0, roll: -90, near: above * 0.82 - L / D0, far: above * 0.82 - L / D0 + 1.1 },
    { v: END, x: 0, y: 0, z: -L, d: CELL, pitch: 0, yaw: 0, roll: -90, near: 0.05, far: 1.8, flat: true },
  ];


  // A smooth curve through the keys, with no stops between the first and the last.
  type Field = "x" | "y" | "z" | "pitch" | "yaw" | "roll" | "d" | "near" | "far";
  const fields: Field[] = ["x", "y", "z", "pitch", "yaw", "roll", "d", "near", "far"];
  const val = (k: Key, f: Field) => (f === "d" ? Math.log(k.d) : k[f]);
  const slope = (i: number, f: Field) => {
    if (i === 0 || i === keys.length - 1 || keys[i].flat) return 0;
    // Clamp each slope so the curve never overshoots a key and swings back.
    const a = (val(keys[i], f) - val(keys[i - 1], f)) / (keys[i].v - keys[i - 1].v);
    const b = (val(keys[i + 1], f) - val(keys[i], f)) / (keys[i + 1].v - keys[i].v);
    if (a * b <= 0) return 0;
    const s = (a + b) / 2;
    return Math.sign(s) * Math.min(Math.abs(s), 3 * Math.abs(a), 3 * Math.abs(b));
  };
  const pose = (v: number) => {
    const at = Math.max(keys[0].v, Math.min(keys[keys.length - 1].v, v));
    let i = 0;
    while (i < keys.length - 2 && at > keys[i + 1].v) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const len = b.v - a.v;
    const t = (at - a.v) / len;
    const t2 = t * t;
    const t3 = t2 * t;
    const out = {} as Record<Field, number>;
    for (const f of fields) {
      out[f] =
        (2 * t3 - 3 * t2 + 1) * val(a, f) +
        (t3 - 2 * t2 + t) * slope(i, f) * len +
        (-2 * t3 + 3 * t2) * val(b, f) +
        (t3 - t2) * slope(i + 1, f) * len;
    }
    // Distance moves on a log scale, so the pull-back and the dive keep an even pace.
    out.d = Math.exp(out.d);
    return out;
  };

  // Send every texture and shader to the GPU now, in small steps, rather than on the first frame shown.
  let n = 0;
  for (const d of disposables) {
    if (d instanceof THREE.Texture) {
      renderer.initTexture(d);
      if (++n % 4 === 0) await idle();
    }
  }
  await idle();
  renderer.compile(scene, camera);

  const update = (v: number) => {
    if (Math.abs(v - last) < 0.02) return;
    last = v;

    let k = pose(v);
    let fade = 1;
    if (still) {
      // No camera flight: the field stays put, and the film arrives through a dip to black.
      k = v < 900 ? { ...keys[0] } : { ...keys[keys.length - 1] };
      fade = 1 - span(v, 860, 900) * (1 - span(v, 900, 950));
    }

    euler.set(THREE.MathUtils.degToRad(k.pitch), THREE.MathUtils.degToRad(k.yaw), THREE.MathUtils.degToRad(k.roll));
    camera.quaternion.setFromEuler(euler);
    target.set(k.x, k.y, k.z);
    back.set(0, 0, 1).applyQuaternion(camera.quaternion).multiplyScalar(k.d * D0);
    camera.position.copy(target).add(back);
    fog.near = Math.max(1, k.near * D0);
    fog.far = Math.max(fog.near + 1, k.far * D0);

    const grow = ease(span(v, START, START + 90));
    for (const m of groups.field) m.opacity = grow * fade;
    for (const m of groups.ahead) m.opacity = grow * (1 - ease(span(v, 715, 765))) * fade;
    for (const m of groups.wall) m.opacity = ease(span(v, 620, 760)) * fade;
    // The phrase stays bright on "Feeling" while the rest of it settles into the field, then it
    // becomes just more of the field before the camera tips.
    const settle = 1 - ease(span(v, 470, 560)) * 0.6;
    phraseMaterials.forEach((m, i) => {
      m.opacity = fade * settle * (i === 0 ? 1 : mix(1, 0.45, grow));
    });
    lineMaterial.opacity = 0.17 * ease(span(v, START, START + 110)) * fade;
    // The floor shows once you look down the shafts, dark at first, and brightens as you fall.
    floorMaterial.opacity = ease(span(v, 780, 880)) * fade;
    floorMaterial.color.setScalar(mix(0.18, 1, ease(span(v, 880, END - 30))));

    renderer.render(scene, camera);
  };

  // Draw a few hidden frames while the canvas is still hidden, a handful of objects at a time,
  // so their buffers reach the GPU in small pieces and the first frame you see uploads nothing.
  const objects = scene.children.slice();
  objects.forEach((o) => (o.visible = false));
  for (let i = 0; i < objects.length; i += 3) {
    objects.slice(i, i + 3).forEach((o) => (o.visible = true));
    await idle();
    renderer.render(scene, camera);
  }
  objects.forEach((o) => (o.visible = true));
  await idle();
  update(START);
  last = -1;

  return {
    update,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
