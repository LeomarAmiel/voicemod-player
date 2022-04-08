let isPlaying = false;
let shouldResetWavesurfer = false;
var plyBtn = document.getElementById("nplayer_play");
var wavesurfer = WaveSurfer.create({
  container: ".waveform-share",
  height: 32,
  barRadius: 2,
  barHeight: 1.5,
  barWidth: 3,
  barGap: 4,
  responsive: true,
  interact: false,
  cursorColor: "transparent",
  progressColor: "#00fff6",
  scrollParent: false,
});
wavesurfer.load(
  "https://uceb3aa33f3fc9684005e35e7ad2.dl.dropboxusercontent.com/cd/0/inline/BjDNbm_cmVhriZdKw-UdEbap4-jmcQrRCTiYBXw67TuV-l1wfAdteRj7k3fwfu_FHKQxvzzn-jbhwnRzBZXVgrkz2oWd-dqXM1IYyGGLTickTrQQJIqry-SlsP1agkwhaHplELcl_Mg_JUr4GobYiaM3Gs6IjN7EbMs0SiczUND5Ww/file#"
);

function toggleIcon() {
  $(".pause_icon-nplayer").toggleClass("played");
  $(".play_icon-nplayer").toggleClass("paused");
}

$(".control_play-nplayer").on("click", function () {
  if (shouldResetWavesurfer && isPlaying) {
    wavesurfer.seekTo(0);
    shouldResetWavesurfer = false;
  }
  if (isPlaying) {
    wavesurfer.play();
  } else {
    wavesurfer.pause();
  }
  toggleIcon();
});
