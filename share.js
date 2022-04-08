var Webflow = Webflow || [];
Webflow.push(function () {
  const API_URL = "https://staging-gateway-api.voicemod.net/v2/cloud";
  const X_KEY = "zqqztBHlkyIOAHMJgVaskJWrqO2ssXQo";
  const params = Object.fromEntries(
    new URLSearchParams(window.location.search)
  );
  let wavesurfer;
  let isPlaying = false;
  let shouldResetWavesurfer = false;
  const AUDIO_ID = "control_audio";

  async function fetchAudioFromParams() {
    hideIcons();
    const result = await fetch(`${API_URL}/audio/${params.id}`, {
      headers: {
        "x-api-key": X_KEY,
      },
    });

    const { url } = await result.json();
    setWaveformData(url);
    setAudio(url);
  }

  function toggleIcon() {
    $(".pause_icon-share").toggleClass("played");
    $(".play_icon-share").toggleClass("paused");
  }

  function secondsToMinutes(time) {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  }

  function setAudio(url) {
    const audioEl = document.getElementById(AUDIO_ID);
    if (audioEl) {
      audioEl.src = url;
      audioEl.preload = "metadata";
      audioEl.volume = 1;

      audioEl.onloadedmetadata = function () {
        $(".control_play-share").removeClass("control_disable");
        $(".duration-share").text(secondsToMinutes(this.duration));
      };

      audioEl.onended = function () {
        isPlaying = false;
        toggleIcon();
        wavesurfer.pause();
        audioEl.currentTime = 0;
        shouldResetWavesurfer = true;
      };
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
      height: 48,
      barRadius: 2,
      barHeight: 1.5,
      barWidth: 2,
      barGap: 4,
      responsive: true,
      interact: false,
      cursorColor: "transparent",
      progressColor: "#00fff6",
      scrollParent: false,
    });
    wavesurfer.load(url);
    wavesurfer.setVolume(0);
  }

  $(".control_play-share").on("click", function () {
    if (!$(".control_play-share").hasClass("control_disable")) {
      const audioEl = document.getElementById(AUDIO_ID);
      isPlaying = !isPlaying;
      if (shouldResetWavesurfer && isPlaying) {
        wavesurfer.seekTo(0);
        shouldResetWavesurfer = false;
      }
      if (isPlaying) {
        audioEl.play();
        wavesurfer.play();
      } else {
        audioEl.pause();
        wavesurfer.pause();
      }
      toggleIcon();
    }
  });

  fetchAudioFromParams();
});
