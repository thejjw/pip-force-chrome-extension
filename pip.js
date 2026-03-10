/*
 * PiP Force - pip.js
 * SPDX-License-Identifier: zlib-acknowledgement
 * Copyright (c) 2026 @thejjw
 */

(async () => {
  // Recursively collect shadow roots from the given element tree
  function findRoots(ele) {
    const shadowRoots = [ele, ...ele.querySelectorAll("*")]
      .filter((e) => !!e.shadowRoot)
      .flatMap((e) => [e.shadowRoot, ...findRoots(e.shadowRoot)]);
    return shadowRoots;
  }

  // Minimum area in square pixels to qualify as a real video (roughly 100x100)
  const MIN_VIDEO_AREA = 10000;

  // Find the largest video element that has started loading across all roots
  function findLargestPlayingVideo() {
    const roots = [...findRoots(document), document];
    const videos = roots.flatMap((root) =>
      Array.from(root.querySelectorAll("video")).filter(
        (video) => video.readyState !== 0
      )
    );

    // Sort by visual area (largest first), skip videos below minimum size
    return videos
      .map((video) => {
        const rect = video.getClientRects()[0] || { width: 0, height: 0 };
        return { video, area: rect.width * rect.height };
      })
      .filter(({ area }) => area >= MIN_VIDEO_AREA)
      .sort((a, b) => b.area - a.area)
      .map(({ video }) => video)[0];
  }

  // Force-enable PiP on a video element
  function forceEnablePiP(video) {
    video.disablePictureInPicture = false;
    video.removeAttribute("disablepictureinpicture");
  }

  // Attempt to find a new video and re-request PiP after the current one dies
  async function retryPiP(oldVideo, attempt = 1) {
    if (!window.__pipForceWatching) return;

    const delay = 1500;
    const maxAttempts = 3;

    await new Promise((r) => setTimeout(r, delay));

    if (!window.__pipForceWatching) return;

    const newVideo = findLargestPlayingVideo();
    if (newVideo && newVideo !== oldVideo) {
      try {
        forceEnablePiP(newVideo);
        await newVideo.requestPictureInPicture();
        console.log("[PiP Force] Auto-resumed PiP on new video.");
        chrome.runtime.sendMessage({ pipActive: true });
        watchVideo(newVideo);
      } catch (e) {
        console.error("[PiP Force] Auto-resume failed:", e.message);
        chrome.runtime.sendMessage({ pipActive: false });
        window.__pipForceWatching = false;
      }
    } else if (attempt < maxAttempts) {
      console.log(`[PiP Force] No new video yet, retrying (${attempt}/${maxAttempts})...`);
      retryPiP(oldVideo, attempt + 1);
    } else {
      console.error("[PiP Force] No new video found after retries.");
      chrome.runtime.sendMessage({ pipActive: false });
      window.__pipForceWatching = false;
    }
  }

  // Watch a PiP'd video for signs it has been replaced or ended
  function watchVideo(video) {
    const handler = () => {
      video.removeEventListener("emptied", handler);
      video.removeEventListener("ended", handler);
      console.log("[PiP Force] Video ended or emptied, looking for new video...");
      retryPiP(video);
    };

    video.addEventListener("emptied", handler, { once: true });
    video.addEventListener("ended", handler, { once: true });
  }

  // Enable PiP on the largest video (exit is handled by background.js)
  try {
    const video = findLargestPlayingVideo();
    if (!video) {
      console.error("[PiP Force] No video found on this page.");
      return false;
    }

    forceEnablePiP(video);
    await video.requestPictureInPicture();

    window.__pipForceWatching = true;
    watchVideo(video);

    return true;
  } catch (e) {
    console.error("[PiP Force]", e.message);
    return false;
  }
})();
