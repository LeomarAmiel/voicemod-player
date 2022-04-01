var Webflow = Webflow || [];
Webflow.push(function () {
  const API_URL = "https://staging-gateway-api.voicemod.net/v2/cloud";
  const X_KEY = "zqqztBHlkyIOAHMJgVaskJWrqO2ssXQo";
  const params = Object.fromEntries(
    new URLSearchParams(window.location.search)
  );
  let wavesurfer;
  const AUDIO_ID = "control_audio";

  async function fetchAudioFromParams() {
    hideIcons();
    const result = await fetch(`${API_URL}/audio/${params.id}`, {
      headers: {
        "x-api-key": X_KEY,
      },
    });

    const { url } = await result.json();
    setAudio(url, AUDIO_ID);
    setWaveformData(url);
  }

  function setAudio(url, id) {
    const audioEl = document.getElementById(id);
    if (audioEl) {
      audioEl.src = url;
      audioEl.id = id;
      audioEl.preload = "metadata";
      audioEl.volume = 1;
    }
  }

  function hideIcons() {
    const voiceIconToShow = params.voiceId;

    $(".icon_img").css({ display: "none" });
    $(`#${voiceIconToShow}`).css({ display: "flex" });
  }

  function destroyWavesurfer() {
    if (wavesurfer) {
      wavesurfer.destroy();
    }
    wavesurfer = null;
  }

  function setWaveformData(url) {
    destroyWavesurfer();
    wavesurfer = WaveSurfer.create({
      container: ".waveform-share",
      barWidth: 2,
      barHeight: 1,
      barMinHeight: 6,
      barGap: null,
      responsive: true,
      interact: false,
      progressColor: "#00fff6",
      cursorColor: "transparent",
      height: 24,
      barRadius: 0.5,
    });
    wavesurfer.load(url);
    wavesurfer.setVolume(0);
  }

  fetchAudioFromParams();
});
