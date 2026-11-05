// Stand-in for the bamboo seat's joinery. Swap the parts for his model when it exists.
import * as THREE from "three";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (n: number) => n * n * (3 - 2 * n);

type Part = {
  group: THREE.Group;
  home: THREE.Vector3;
  away: THREE.Vector3;
  lift: number;
  turn: number;
};

export function createJoint(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6b2, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  const joint = new THREE.Group();
  scene.add(joint);
  const bamboo = new THREE.MeshStandardMaterial({ color: 0xf56e0f, roughness: 0.55 });
  const node = new THREE.MeshStandardMaterial({ color: 0x151419, roughness: 0.6 });
  const slat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.8 });
  const parts: Part[] = [];

  for (let i = 0; i < 5; i++) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 6.4, 28), bamboo);
    pole.rotation.z = Math.PI / 2;
    group.add(pole);
    for (let n = -3; n <= 3; n++) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 28), node);
      ring.rotation.z = Math.PI / 2;
      ring.position.x = n;
      group.add(ring);
    }
    const home = new THREE.Vector3(0, 0, -2.4 + i * 1.2);
    joint.add(group);
    parts.push({
      group,
      home,
      away: new THREE.Vector3((i % 2 ? 1 : -1) * 2.3, (i - 2) * 0.5, (i - 2) * 0.35),
      lift: i % 2 ? 0.21 : -0.21,
      turn: 0,
    });
  }
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.14, 6.6), slat));
    const home = new THREE.Vector3(-2.2 + i * 2.2, 0, 0);
    joint.add(group);
    parts.push({
      group,
      home,
      away: new THREE.Vector3(0, i % 2 ? 2.5 : -2.5, (i % 2 ? -1 : 1) * 1.2),
      lift: 0,
      turn: i - 1,
    });
  }

  const target = new THREE.Vector3();

  return {
    draw(p: number) {
      const apart = ease(clamp(p / 0.3)) * (1 - ease(clamp((p - 0.52) / 0.28)));
      parts.forEach((part) => {
        part.group.position.lerpVectors(part.home, target.copy(part.home).add(part.away), apart);
        part.group.position.y += part.lift * (1 - apart);
        part.group.rotation.y = part.turn * apart * 0.4;
      });
      joint.rotation.set(0.58, -0.7 + p * 1.1, 0);
      const narrow = innerWidth <= 760;
      joint.position.set(narrow ? 0 : 2.6, narrow ? -1.5 : -0.2, 0);
      cam.position.set(0, 0, narrow ? 34 : 21);
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
    },
    resize(width: number, height: number) {
      renderer.setSize(width, height, false);
      cam.aspect = width / height;
      cam.updateProjectionMatrix();
    },
    dispose() {
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
