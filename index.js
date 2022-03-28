var Webflow = Webflow || [];
Webflow.push(function () {
  const lottie = Webflow.require("lottie").lottie;
  const REQUEST_KEY = "voicemod_mic_request";
  const animations = lottie.getRegisteredAnimations();
  const API_URL = "https://staging-gateway-api.voicemod.net/v2/cloud";
  const X_KEY = "zqqztBHlkyIOAHMJgVaskJWrqO2ssXQo";
  const MOD_AUDIO = "control_upload_audio_transformed";
  const ORIG_AUDIO = "control_upload_audio_original";
  const MAX_GET_RETRIES = 10;

  let state = "ready";
  let isTransformed = true;
  let chunks = [];
  let mediaRecorder = null;
  let recordInterval = 0;
  let recordIntervalId = null;
  let fetchInterval = null;
  let retryCount = 0;
  let wavesurfer;
  const convertedFiles = {
    baby: "",
    "magic-chords": "",
    cave: "",
    "radio-demon": "",
    "man-to-woman": "",
    deep: "",
    original: "",
  };

  const fetchIds = {
    baby: "",
    "magic-chords": "",
    cave: "",
    "radio-demon": "",
    "man-to-woman": "",
    deep: "",
    original: "",
  };

  const convertVoiceIds = [
    "baby",
    "magic-chords",
    "cave",
    "radio-demon",
    "man-to-woman",
    "deep",
  ];

  function getFileUrlOnActiveType() {
    const voiceId =
      $(".audio-snippet_btn__wrapper").attr("data-voiceid") || "baby";
    if (!!convertedFiles.original) {
      return convertedFiles[voiceId];
    }
    return null;
  }

  function toggleIcon() {
    state = "ready_to_play";
    $(".pause_icon").removeClass("played");
    $(".play_icon").addClass("paused");
  }

  function resetPlay() {
    const transformedEl = document.getElementById(MOD_AUDIO);
    const originalEl = document.getElementById(ORIG_AUDIO);
    if (transformedEl || originalEl) {
      transformedEl.currentTime = 0;
      transformedEl.pause();
      originalEl.pause();
      originalEl.currentTime = 0;
      wavesurfer.stop();
    }
  }

  function setFilesOnCorrectType() {
    setTimeout(() => {
      const voiceId =
        $(".audio-snippet_btn__wrapper").attr("data-voiceid") || "baby";
      const transformedUrl = convertedFiles[voiceId];

      if (transformedUrl) {
        setAudio(transformedUrl, MOD_AUDIO);
        resetPlay();
      }
      toggleIcon();
    }, 50);
  }

  function handlePlay() {
    const transformedEl = document.getElementById(MOD_AUDIO);
    const originalEl = document.getElementById(ORIG_AUDIO);

    if (isTransformed) {
      transformedEl.play();
      originalEl.pause();
    } else {
      originalEl.play();
      transformedEl.pause();
    }
  }

  $("#checkbox-2").on("click", function () {
    if (!$(".voicemod_checkbox").hasClass("control_disable")) {
      $(".toggle-text").toggleClass("toggle-off");
      $(".toggle-text-off").toggleClass("toggle-off");
      isTransformed = !isTransformed;
      if (!isTransformed) {
        disableButtons(false);
      } else {
        showReadyToPlayUI();
      }
      toggleIcon();
      resetPlay();
    }
  });

  function createUrlBasedOnFile(file) {
    const blob = window.URL || window.webkitURL;
    return blob.createObjectURL(file);
  }

  async function submitAudioData(formData) {
    const originalFile = formData.get("audioFile");
    const formDataWithNewVoiceIds = convertVoiceIds.map((voiceId) => {
      const data = new FormData();
      data.append("audioFile", originalFile);
      data.append("voice", voiceId);
      return data;
    });

    try {
      const URL = `${API_URL}/audio`;
      const results = await Promise.all(
        formDataWithNewVoiceIds.map((body) =>
          fetch(URL, {
            method: "POST",
            headers: {
              "x-api-key": X_KEY,
            },
            body,
          })
        )
      );

      if (results.some((res) => res.status !== 202)) {
        throw new Error("Fetch was not successful!");
      }

      let i = 0;
      for (const result of results) {
        const { id } = await result.json();
        fetchIds[convertVoiceIds[i]] = id;
        i += 1;
      }

      const originalFileUrl = createUrlBasedOnFile(originalFile);
      convertedFiles.original = originalFileUrl;

      return true;
    } catch (e) {
      return false;
    }
  }

  function closeModal() {
    [
      // to keep
      ".upload-fail-wrapper",
      ".record-request-wrapper",
      ".mic-detection-wrapper",
      ".convert-failed-wrapper",
    ].forEach((modal) => {
      $(modal).css({ display: "none" });
    });
  }

  $(".record_new_audio_button").on("click", () => {
    closeModal();
    startRecordProcess();
  });

  $(".play-voicemod").on("click", closeModal);

  $(".modal_close").on("click", closeModal);

  function secondsToMinutes(time) {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  }

  function setAudio(url, id) {
    let audioEl = document.getElementById(id);
    if (audioEl) {
      audioEl.src = url;
    } else {
      audioEl = document.createElement("audio");
      audioEl.id = id;
      audioEl.src = url;
      audioEl.preload = "metadata";
      audioEl.volume = 1;
      document.body.appendChild(audioEl);
      audioEl.onloadedmetadata = function () {
        $(".control_audio-time").text(secondsToMinutes(this.duration));
      };

      audioEl.onended = function () {
        toggleIcon();
      };
    }
  }

  function stopRecord() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  $(`.control_play`).on("click", function () {
    const transformedAudioElement = document.getElementById(MOD_AUDIO);
    const originalAudioElement = document.getElementById(ORIG_AUDIO);

    if (
      transformedAudioElement &&
      originalAudioElement &&
      !$(".control_play").hasClass("control_disable")
    ) {
      state = state === "playing" ? "paused" : "playing";
      if (state === "playing") {
        handlePlay(originalAudioElement, transformedAudioElement);
        if (wavesurfer) {
          wavesurfer.play();
        }
      } else {
        transformedAudioElement.pause();
        originalAudioElement.pause();
        if (wavesurfer) {
          wavesurfer.pause();
        }
      }

      $(".pause_icon").toggleClass("played");
      $(".play_icon").toggleClass("paused");
    }
  });

  function showLoadingUI() {
    state = "loading";
    $(".record_icon").addClass("stop_record");
    $(".loading_record").addClass("stop_record");
    $(".converting_state").addClass("stop_record");
    $(".record_icon").removeClass("start_record");
    $(".countdown_record").removeClass("start_record");
  }

  function showReadyToPlayUI() {
    state = "ready_to_play";
    $(".record_icon").removeClass("stop_record");
    $(".loading_record").removeClass("stop_record");
    $(".converting_state").removeClass("stop_record");

    $(".control_share").removeClass("control_disable");
    $(".control_play").removeClass("control_disable");
    $(".toggle-text").removeClass("control_disable");
    $(".checkbox").removeClass("control_disable");
    $(".audio-snippet_btn").removeClass("control_disable");
    $("#checkbox-2").removeAttr("disabled");
  }

  function disableButtons(disablePlay = true, disableWavesurfer) {
    $(".record_icon").removeClass("start_record");
    $(".control_share").addClass("control_disable");
    $(".audio-snippet_btn").addClass("control_disable");
    if (wavesurfer && disableWavesurfer) {
      wavesurfer.destroy();
    }
    if (disablePlay) {
      $(".toggle-text").addClass("control_disable");
      $(".control_play").addClass("control_disable");
    }
  }

  function setMicrophoneLocalStorage() {
    localStorage.setItem(REQUEST_KEY, "true");
  }

  async function validateMicrophoneAccess() {
    // if has navigator.permissions, validate, else, trust localStorage
    if (navigator?.permissions) {
      const micQuery = await navigator?.permissions.query({
        name: "microphone",
      });
      if (micQuery.state === "granted") {
        setMicrophoneLocalStorage();
      } else if (micQuery.state === "prompt") {
        localStorage.removeItem(REQUEST_KEY);
      }
    }
  }

  async function startRecordProcess() {
    if (navigator.mediaDevices) {
      await validateMicrophoneAccess();
      try {
        const hasRequestedPermission = localStorage.getItem(REQUEST_KEY);
        if (["ready", "ready_to_play", "playing", "paused"].includes(state)) {
          if (!hasRequestedPermission) {
            $(".record-request-wrapper").css({ display: "flex" });
          }
          const userMedia = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          mediaRecorder = new OpusMediaRecorder(
            userMedia,
            { mimeType: "audio/wav" },
            {
              OggOpusEncoderWasmPath:
                "https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm",
              WebMOpusEncoderWasmPath:
                "https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm",
            }
          );

          recordInterval = 0;
          $(".record-request-wrapper").css({ display: "none" });
          $(".mic-detection-wrapper").css({ display: "none" });
          if (mediaRecorder) {
            mediaRecorder.onstart = function () {
              state = "recording";
              $("#checkbox-2").attr("disabled", "true");
              disableButtons(true, true);
              $(".record_icon").addClass("start_record");
              $(".countdown_record").addClass("start_record");
              animations[0].play();
              recordIntervalId = setInterval(() => {
                recordInterval += 1;
                if (recordInterval > 10) {
                  stopRecord();
                }
              }, 1000);
            };

            mediaRecorder.onstop = function () {
              showLoadingUI();
              userMedia.getTracks().forEach((track) => track.stop());
              animations[0].stop();
              clearInterval(recordIntervalId);
              initializeUpload();
            };

            mediaRecorder.ondataavailable = function (e) {
              chunks.push(e.data);
            };
            if (hasRequestedPermission) {
              mediaRecorder.start();
            } else {
              userMedia.getTracks().forEach((track) => track.stop());
            }
          }
        } else if (state === "recording") {
          mediaRecorder.stop();
        }
      } catch (e) {
        $(".record-request-wrapper").css({ display: "none" });
        $(".mic-detection-wrapper").css({ display: "flex" });
        localStorage.removeItem(REQUEST_KEY);
      }
    }
  }

  $(".control_record").on("click", startRecordProcess);

  function clearFetchInterval() {
    clearInterval(fetchInterval);
    fetchInterval = null;
    retryCount = 0;
  }

  async function initializeUpload() {
    // has recorded
    if (mediaRecorder && recordInterval > 0) {
      stopRecord();
      setTimeout(async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const file = new File([blob], `recoring-for-voicemod.wav`, {
          type: "audio/wav",
        });
        const formData = new FormData();
        formData.append("audioFile", file);
        const success = await submitAudioData(formData);

        if (!success) {
          $(".upload-fail-wrapper").css({ display: "flex" });
        }

        fetchInterval = setInterval(async () => {
          if (retryCount > 10) {
            clearFetchInterval();
          }
          const results = await Promise.all(
            convertVoiceIds.map((voiceKey) =>
              fetch(`${API_URL}/audio/${fetchIds[voiceKey]}`, {
                headers: {
                  "x-api-key": X_KEY,
                },
              })
            )
          );

          if (results.some((res) => [400, 500].includes(res.status))) {
            clearFetchInterval();
            throw new Error("Fetch was not successful!");
          }
          retryCount += 1;
          if (results.every((res) => res.status === 200)) {
            let i = 0;
            for (const result of results) {
              const { url } = await result.json();
              convertedFiles[convertVoiceIds[i]] = url;
              i += 1;
            }
            showReadyToPlayUI();

            const recentActiveFile = getFileUrlOnActiveType();
            setAudio(convertedFiles.original, ORIG_AUDIO);
            setAudio(recentActiveFile, MOD_AUDIO);
            if (wavesurfer) {
              wavesurfer.destroy();
            }
            wavesurfer = WaveSurfer.create({
              container: ".wf_wrap",
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
            wavesurfer.load(convertedFiles.original);
            wavesurfer.setVolume(0);
            chunks = [];
            clearFetchInterval();
          }
        }, 5000);
      }, 50);
    }
  }

  function voiceClick() {
    setFilesOnCorrectType();
    toggleIcon();
  }

  $(".overlay--baby").on("click", voiceClick);

  $(".overlay--magic-chords").on("click", voiceClick);

  $(".overlay--cave").on("click", voiceClick);

  $(".overlay--radio-demon").on("click", voiceClick);

  $(".overlay--man-to-woman").on("click", voiceClick);

  $(".overlay--deep").on("click", voiceClick);
  $("#checkbox-2").attr("disabled", "true");
});
