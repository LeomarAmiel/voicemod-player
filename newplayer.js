var plyBtn = document.getElementById("control");
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

plyBtn.onclick = function () {
  wavesurfer.playPause();
};
