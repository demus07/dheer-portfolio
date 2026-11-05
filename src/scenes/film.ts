// Stand-in for Dheer's Shararat render: a study model the camera walks through.
// Replace with the scrubbed video once the fly-through exists.
import * as THREE from "three";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const g = canvas.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,226,196,1)");
  r.addColorStop(0.18, "rgba(245,110,15,.75)");
  r.addColorStop(0.5, "rgba(245,110,15,.14)");
  r.addColorStop(1, "rgba(245,110,15,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export function createFilm(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x24222b);
  scene.fog = new THREE.Fog(0x24222b, 30, 80);
  const cam = new THREE.PerspectiveCamera(58, 1, 0.05, 120);

  const glow = glowTexture();
  const glowSprite = (size: number) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    );
    sprite.scale.setScalar(size);
    return sprite;
  };

  const mat = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...o });
  const plaster = mat(0xbdb9b3);
  const floorStone = mat(0x2a2a2d);
  const dark = mat(0x1a191d);
  const wood = mat(0x3a2b22, { roughness: 0.7 });
  const wall = mat(0x1d1c1f);
  const cloth = [mat(0xd8d4cc), mat(0x878787), mat(0xf56e0f), mat(0x262626)];
  const ember = new THREE.MeshBasicMaterial({ color: 0xf56e0f });
  const warm = new THREE.MeshBasicMaterial({ color: 0xffd9b0 });

  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    parent: THREE.Object3D = scene,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const round = (geometry: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geometry, m);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };

  // Street
  box(60, 0.2, 40, 0, -0.1, 18, mat(0x19181c));

  // Facade, broken by a door and two shop windows
  const H = 3.8;
  box(1.6, H, 0.4, -6.2, H / 2, 0, plaster);
  box(1.6, H, 0.4, 6.2, H / 2, 0, plaster);
  box(0.5, H, 0.4, -1.45, H / 2, 0, plaster);
  box(0.5, H, 0.4, 1.45, H / 2, 0, plaster);
  box(14, 0.5, 0.42, 0, 3.55, 0, plaster);
  box(3, 0.7, 0.42, -3.65, 0.35, 0, plaster);
  box(3, 0.7, 0.42, 3.65, 0.35, 0, plaster);
  box(14, 3.6, 0.4, 0, 5.6, 0, plaster);
  [-3.6, 3.6].forEach((x) => {
    box(2.2, 2.2, 0.1, x, 5.4, 0.2, dark);
    box(0.08, 2.2, 0.14, x, 5.4, 0.22, plaster);
  });
  box(14.4, 0.14, 0.7, 0, 3.86, 0.3, plaster);
  box(14.4, 0.2, 0.5, 0, 7.5, 0.15, plaster);

  // Shop
  box(14, 0.1, 8, 0, 0, -4, floorStone);
  box(14, 0.1, 8, 0, 3.8, -4, plaster);
  box(0.2, 3.8, 8, -7, 1.9, -4, plaster);
  box(0.2, 3.8, 8, 7, 1.9, -4, plaster);
  box(5.8, 3.8, 0.3, -4.1, 1.9, -8, plaster);
  box(5.8, 3.8, 0.3, 4.1, 1.9, -8, plaster);
  box(2.4, 1.4, 0.3, 0, 3.1, -8, plaster);
  [[-3.8, -3], [3.8, -3], [-3.8, -6], [3.8, -6]].forEach(([x, z]) => {
    box(2.6, 0.8, 1.4, x, 0.4, z, plaster);
    for (let i = 0; i < 7; i++) {
      box(0.5, 0.09, 0.8, x - 0.8 + (i % 3) * 0.8, 0.86 + Math.floor(i / 3) * 0.1, z, cloth[i % 4]);
    }
  });

  // Hidden door: two shelf leaves that swing open, with light behind the seam
  const leaves = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 1.2, 0, -7.9);
    scene.add(pivot);
    box(1.2, 2.4, 0.16, -side * 0.6, 1.2, 0, wood, pivot);
    for (let y = 0; y < 5; y++) {
      box(1.12, 0.03, 0.24, -side * 0.6, 0.3 + y * 0.48, 0.1, plaster, pivot);
      for (let k = 0; k < 3; k++) {
        box(0.28, 0.2 + ((y + k) % 3) * 0.04, 0.2, -side * (0.25 + k * 0.34), 0.42 + y * 0.48, 0.1, cloth[(y + k) % 4], pivot);
      }
    }
    return pivot;
  });
  const seam = box(0.02, 2.4, 0.02, 0, 1.2, -7.98, warm);

  // Passage
  box(0.2, 2.6, 3.4, -1.3, 1.3, -9.8, dark);
  box(0.2, 2.6, 3.4, 1.3, 1.3, -9.8, dark);
  box(2.8, 0.2, 3.4, 0, 2.7, -9.8, dark);
  box(2.8, 0.1, 3.4, 0, 0, -9.8, floorStone);

  // Bar hall, two storeys
  const HALL = 7.4;
  box(14, 0.1, 20, 0, 0, -21.5, floorStone);
  box(14, 0.2, 20, 0, HALL, -21.5, dark);
  box(0.3, HALL, 20, -7, HALL / 2, -21.5, wall);
  box(0.3, HALL, 20, 7, HALL / 2, -21.5, wall);
  box(5.7, HALL, 0.3, -4.15, HALL / 2, -11.5, wall);
  box(5.7, HALL, 0.3, 4.15, HALL / 2, -11.5, wall);
  box(2.6, HALL - 2.7, 0.3, 0, 2.7 + (HALL - 2.7) / 2, -11.5, wall);
  box(14, HALL, 0.3, 0, HALL / 2, -31.5, mat(0x151419));

  // Bar counter, back shelf and bottles
  box(1.1, 1.1, 13, -4.6, 0.55, -21, wood);
  box(1.5, 0.08, 13.4, -4.6, 1.14, -21, dark);
  for (let i = 0; i < 4; i++) {
    box(0.5, 0.05, 15, -6.65, 1.1 + i * 0.62, -21, dark);
    box(0.02, 0.03, 15, -6.42, 1.08 + i * 0.62, -21, ember);
  }
  const BOTTLES = 220;
  const bottles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.07, 0.09, 0.42, 8),
    new THREE.MeshStandardMaterial({ roughness: 0.45 }),
    BOTTLES,
  );
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  const bottleColours = [0x8a3a0c, 0x4a4a4c, 0x8c8780, 0x5e2706];
  for (let i = 0; i < BOTTLES; i++) {
    dummy.position.set(-6.68 + ((i * 7) % 3) * 0.08, 1.34 + (i % 4) * 0.62, -28 + (Math.floor(i / 4) * 14) / 55);
    dummy.updateMatrix();
    bottles.setMatrixAt(i, dummy.matrix);
    bottles.setColorAt(i, tint.set(bottleColours[(i * 5 + (i >> 2)) % 4]));
  }
  scene.add(bottles);

  const stoolTop = new THREE.CylinderGeometry(0.22, 0.22, 0.07, 18);
  const stoolLeg = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
  for (let i = 0; i < 10; i++) {
    round(stoolTop, dark, -3.5, 0.78, -15.6 - i * 1.25);
    round(stoolLeg, dark, -3.5, 0.38, -15.6 - i * 1.25);
  }

  // Tables
  const tableTop = new THREE.CylinderGeometry(0.62, 0.62, 0.05, 28);
  const tableLeg = new THREE.CylinderGeometry(0.05, 0.14, 0.74, 10);
  const candle = new THREE.SphereGeometry(0.05, 10, 10);
  for (let i = 0; i < 5; i++) {
    const z = -14.5 - i * 3.1;
    const x = 3.2 + (i % 2) * 1.1;
    round(tableTop, plaster, x, 0.74, z);
    round(tableLeg, dark, x, 0.37, z);
    round(candle, warm, x, 0.82, z);
    const g = glowSprite(0.9);
    g.position.set(x, 0.86, z);
    scene.add(g);
  }

  // Stage and the wall of records
  box(9, 0.32, 3, 0, 0.16, -29.8, dark);
  const RECORDS = 54;
  const records = new THREE.InstancedMesh(new THREE.CircleGeometry(0.46, 40), mat(0x2a292c, { roughness: 0.35 }), RECORDS);
  const labels = new THREE.InstancedMesh(new THREE.CircleGeometry(0.15, 24), mat(0x8a3a0c), RECORDS);
  for (let i = 0; i < RECORDS; i++) {
    dummy.position.set(-5.2 + (i % 9) * 1.3, 1.4 + Math.floor(i / 9) * 1.04, -31.3);
    dummy.updateMatrix();
    records.setMatrixAt(i, dummy.matrix);
    dummy.position.z = -31.28;
    dummy.updateMatrix();
    labels.setMatrixAt(i, dummy.matrix);
  }
  scene.add(records, labels);

  // Gallery on the upper floor
  box(4, 0.25, 19, 5, 3.7, -21.5, plaster);
  for (let i = 0; i < 16; i++) box(0.04, 1, 0.04, 3.02, 4.3, -13 - i * 1.15, dark);
  box(0.06, 0.06, 18, 3.02, 4.82, -21.5, dark);
  for (let i = 0; i < 5; i++) {
    box(0.06, 1.6, 1.6, 6.82, 5.2, -14.5 - i * 3.3, plaster);
    box(0.02, 0.05, 0.3, 6.6, 6.2, -14.5 - i * 3.3, warm);
  }

  // Pendants
  const bulb = new THREE.SphereGeometry(0.09, 14, 14);
  [-1.6, 1.6].forEach((x) => {
    for (let i = 0; i < 4; i++) {
      const z = -15 - i * 3.4;
      const y = 3.6;
      box(0.012, HALL - y, 0.012, x, (HALL + y) / 2, z, dark);
      round(bulb, warm, x, y, z);
      const g = glowSprite(1.1);
      g.position.set(x, y, z);
      scene.add(g);
    }
  });

  // The last lamp: his drum again, hanging in the bar
  const LAMP = new THREE.Vector3(0, 4.9, -26);
  const shade = new THREE.Group();
  shade.position.copy(LAMP);
  scene.add(shade);
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const slat = box(0.2, 1.05, 0.03, Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05, i % 3 ? ember : plaster, shade);
    slat.rotation.y = -a + Math.PI / 2 + 0.16;
  }
  box(0.015, HALL - LAMP.y, 0.015, 0, (HALL - LAMP.y) / 2, 0, dark, shade);
  const lampGlow = glowSprite(5);
  lampGlow.position.copy(LAMP);
  scene.add(lampGlow);

  // Light
  scene.add(new THREE.HemisphereLight(0x8a93a8, 0x241d18, 0.2));
  const addLight = (c: number, i: number, d: number, x: number, y: number, z: number) => {
    const light = new THREE.PointLight(c, i, d, 1.7);
    light.position.set(x, y, z);
    scene.add(light);
  };
  addLight(0xfff0dc, 11, 16, 0, 3.2, -2.5);
  addLight(0xfff0dc, 7, 10, 0, 3.2, -6);
  addLight(0xf56e0f, 7, 8, 0, 2.2, -10);
  addLight(0xf56e0f, 16, 15, -5.4, 2.4, -21);
  addLight(0xff9a4d, 34, 20, 0, 4.6, -26);
  addLight(0xffb070, 7, 12, 4.5, 2.4, -18);
  addLight(0xffd9b0, 7, 10, 5.4, 6.4, -21);
  const street = new THREE.SpotLight(0xdfe6f5, 90, 44, 0.8, 0.7, 1.4);
  street.position.set(-7, 11, 13);
  street.target.position.set(0, 3, 0);
  scene.add(street, street.target);

  const curve = (points: number[][]) =>
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "centripetal");
  const path = curve([
    [0, 1.75, 25], [0, 1.7, 11], [0, 1.65, 1], [0, 1.6, -4.5], [0, 1.6, -7.2], [0, 1.6, -9.8],
    [-0.4, 1.7, -13], [-1.2, 1.8, -17], [-0.8, 2.3, -20.5], [0, 3.4, -22.4], [0, 4.5, -23.7],
  ]);
  const look = curve([
    [0, 3.2, 0], [0, 2.4, -3], [0, 1.8, -8], [0, 1.6, -9], [0, 1.6, -14], [0, 1.7, -20],
    [-3.5, 1.7, -22], [-3.2, 2, -27], [0, 3.4, -31], [0, 4.7, -27], [0, 4.9, -26],
  ]);
  const target = new THREE.Vector3();

  return {
    draw(t: number) {
      path.getPoint(t, cam.position);
      cam.lookAt(look.getPoint(t, target));
      const swing = ease(clamp((t - 0.33) / 0.11));
      leaves[0].rotation.y = swing * 1.75;
      leaves[1].rotation.y = -swing * 1.75;
      seam.visible = swing < 0.02;
      shade.rotation.y = t * 1.6;
      renderer.render(scene, cam);
    },
    resize(width: number, height: number) {
      renderer.setSize(width, height, false);
      cam.aspect = width / height;
      cam.fov = cam.aspect < 1 ? 74 : 58;
      cam.updateProjectionMatrix();
    },
    dispose() {
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
