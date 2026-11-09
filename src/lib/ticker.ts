// One animation frame for the whole site. The smooth scroll moves first, then everything that
// reads the scroll position, so every animation sees the same, freshly updated scroll each frame.

type Job = { fn: (time: number) => void; order: number };

const jobs: Job[] = [];
let running = false;

const loop = (time: number) => {
  for (const job of jobs.slice()) job.fn(time);
  if (jobs.length) requestAnimationFrame(loop);
  else running = false;
};

export function onFrame(fn: (time: number) => void, order = 0) {
  const job = { fn, order };
  jobs.push(job);
  jobs.sort((a, b) => a.order - b.order);
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
  return () => {
    const i = jobs.indexOf(job);
    if (i >= 0) jobs.splice(i, 1);
  };
}
