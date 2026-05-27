export type SequenceKey = "default" | "konami";
export type SequenceFormat = "png" | "webp" | "avif";
export type PreloadPriority = "initial" | "idle" | "on-activation";

export type SequenceVariant = {
  path: string;
  extension: SequenceFormat;
  totalFrames: number;
  initialFramesToLoad: number;
  backgroundBatchSize: number;
  preloadPriority: PreloadPriority;
  concurrency: number;
  buildFilename: (index: number) => string;
};

export type SequenceConfig = SequenceVariant & {
  key: SequenceKey;
  label: string;
  mobile?: SequenceVariant;
};

export type RuntimeSequenceConfig = SequenceVariant & {
  key: SequenceKey;
  label: string;
  variant: "desktop" | "mobile";
};

export const sequenceConfigs: Record<SequenceKey, SequenceConfig> = {
  default: {
    key: "default",
    label: "portfolio sequence",
    path: "/sequence-webp",
    extension: "webp",
    totalFrames: 89,
    initialFramesToLoad: 48,
    backgroundBatchSize: 8,
    preloadPriority: "initial",
    concurrency: 4,
    buildFilename: (index: number) => `frame_${String(index).padStart(3, "0")}_delay-0.066s.webp`
    // Add a lighter mobile sequence later by providing:
    // mobile: { path: "/sequence-mobile", extension: "webp", ... }
  },
  konami: {
    key: "konami",
    label: "alternate layer",
    path: "/sequence-konami-webp",
    extension: "webp",
    totalFrames: 192,
    initialFramesToLoad: 48,
    backgroundBatchSize: 6,
    preloadPriority: "on-activation",
    concurrency: 3,
    buildFilename: (index: number) => `${String(index + 1).padStart(5, "0")}.webp`
    // Add a lighter mobile sequence later by providing:
    // mobile: { path: "/sequence-konami-mobile", extension: "webp", ... }
  }
};

export function getRuntimeSequenceConfig(
  key: SequenceKey,
  options: { preferMobile?: boolean } = {}
): RuntimeSequenceConfig {
  const config = sequenceConfigs[key];
  const variant = options.preferMobile && config.mobile ? config.mobile : config;

  return {
    ...variant,
    key: config.key,
    label: config.label,
    variant: options.preferMobile && config.mobile ? "mobile" : "desktop"
  };
}

export function getSequenceSource(config: RuntimeSequenceConfig | SequenceConfig, index: number) {
  return `${config.path}/${config.buildFilename(index)}`;
}

export function getSequenceSources(config: RuntimeSequenceConfig | SequenceConfig) {
  return Array.from({ length: config.totalFrames }, (_, index) => getSequenceSource(config, index));
}

export const frameSources = getSequenceSources(getRuntimeSequenceConfig("default"));
