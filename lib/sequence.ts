export type SequenceKey = "default" | "konami";

export type SequenceConfig = {
  key: SequenceKey;
  label: string;
  totalFrames: number;
  buildSrc: (index: number) => string;
};

export const sequenceConfigs = {
  default: {
    key: "default",
    label: "portfolio sequence",
    totalFrames: 89,
    buildSrc: (index: number) => {
      const frame = String(index).padStart(3, "0");
      return `/sequence/frame_${frame}_delay-0.066s.png`;
    }
  },
  konami: {
    key: "konami",
    label: "alternate layer",
    totalFrames: 192,
    buildSrc: (index: number) => {
      const frame = String(index + 1).padStart(5, "0");
      return `/sequence-konami/${frame}.png`;
    }
  }
} satisfies Record<SequenceKey, SequenceConfig>;

export function getSequenceSources(config: SequenceConfig) {
  return Array.from({ length: config.totalFrames }, (_, index) => config.buildSrc(index));
}

export const frameSources = getSequenceSources(sequenceConfigs.default);
