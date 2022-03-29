var Webflow = Webflow || [];
Webflow.push(function () {
  const API_URL = "https://staging-gateway-api.voicemod.net/v2/cloud";
  const X_KEY = "zqqztBHlkyIOAHMJgVaskJWrqO2ssXQo";
  const params = Object.fromEntries(
    new URLSearchParams(window.location.search)
  );
  const AUDIO_ID = "control_audio";

  async function fetchAudioFromParams() {
    const result = await fetch(`${API_URL}/audio/${params.id}`, {
      headers: {
        "x-api-key": X_KEY,
      },
    });

    const { url } = await result.json();
    setAudio(url, AUDIO_ID);
    hideIcons();
  }

  function setAudio(url, id) {
    const audioEl = document.getElementById(id);
    if (audioEl) {
      audioEl.src = url;
      audioEl = document.createElement("audio");
      audioEl.id = id;
      audioEl.src = url;
      audioEl.preload = "metadata";
      audioEl.volume = 1;
    }
  }

  function hideIcons() {
    const voiceIconToShow = params.voiceId;

    $(".icon_img").css({ display: "none" });
    $(`#${voiceIconToShow}`).css({ display: "inline-block" });
  }

  fetchAudioFromParams();
});
