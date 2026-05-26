export const FRAME_COUNT = 120;

export const frameSources = Array.from({ length: FRAME_COUNT }, (_, index) => {
  const frame = String(index).padStart(3, "0");
  return `/sequence/frame_${frame}_delay-0.066s.png`;
});
