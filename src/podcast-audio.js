// Analyse the recording before the listening boost so visual sensitivity and
// playback loudness can be tuned independently. All processing stays local.
export function createPodcastSignal(context) {
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.4;

  const boost = context.createGain();
  boost.gain.value = 1.7;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -6;
  compressor.knee.value = 6;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.16;

  analyser.connect(boost);
  boost.connect(compressor);
  compressor.connect(context.destination);
  return { analyser, boost, compressor };
}
