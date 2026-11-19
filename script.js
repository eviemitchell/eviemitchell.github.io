/* =============================================================
   EVIE MITCHELL — script.js
   The only JavaScript on the site, shared by every page. Each part
   only runs if the page has the pieces it needs.

   A. HOMEPAGE BUBBLE: as you scroll, updates the "I've designed for"
      bubble with each section's data-word (and data-prefix), marks
      that section "is-active" (the about photos use this), and plays
      the sparkle at the pen tip.
   B. CHARTS AND LINES: anything with class="reveal" gets "is-visible"
      when you scroll to it, which plays its animation (see project.css).
      Divider lines grow in from the left the same way.
   C. IMAGE VIEWER: click an image to see it full screen.
   D. CLICK BURSTS: a little hand-drawn sunburst wherever you click.
   E. VERSION CARD: fills the footer's "v4" card with live GitHub numbers.
   F. GIFS AND VIDEOS: click one (or press Enter) to pause or play it.

   To change the bubble words, edit data-word="..." in index.html.
   To tweak the bursts, change the numbers in BURST SETTINGS below.
   ============================================================= */

// Lets the CSS know JavaScript is running, so charts can start hidden and animate in.
document.documentElement.classList.add("js");

// True when you've scrolled all the way down.
function atBottom() {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
}


/* ---------- A. HOMEPAGE BUBBLE ---------- */

const bubble = document.querySelector(".bubble");
const bubbleSections = document.querySelectorAll("[data-word]");
const prefixText = document.querySelector(".bubble-prefix");
const wordText = document.querySelector(".bubble-word");
const sparkles = document.querySelectorAll(".pen-sparkle");

const DEFAULT_PREFIX = "I've designed for";
let currentSection = null;

// Replay the sparkle animation from the start.
function playSparkle() {
  sparkles.forEach(function (sparkle) {
    sparkle.classList.remove("is-sparkling");
    void sparkle.offsetWidth; // (makes the browser notice, so the animation restarts)
    sparkle.classList.add("is-sparkling");
  });
}

// Show one section as "active" and update the bubble to match it.
function activate(section) {
  if (section === currentSection) return;

  if (currentSection) currentSection.classList.remove("is-active");
  section.classList.add("is-active");
  currentSection = section;

  const word = section.dataset.word;

  // No word (the intro at the top): hide the bubble.
  if (!word) {
    bubble.classList.remove("is-visible");
    return;
  }

  bubble.classList.add("is-visible");

  // Fade the old word out, swap the text, fade the new word in.
  wordText.classList.add("is-swapping");
  setTimeout(function () {
    prefixText.textContent = section.dataset.prefix || DEFAULT_PREFIX;
    wordText.textContent = word;
    wordText.classList.remove("is-swapping");
  }, 150);

  playSparkle();
}

// Find the last section whose top has passed 45% of the way down the screen.
function checkBubble() {
  if (!bubble || bubbleSections.length === 0) return;
  const line = window.innerHeight * 0.45;
  let active = bubbleSections[0];
  bubbleSections.forEach(function (section) {
    if (section.getBoundingClientRect().top <= line) active = section;
  });
  // At the very bottom, always show the last section.
  if (atBottom()) active = bubbleSections[bubbleSections.length - 1];
  activate(active);
}


/* ---------- A (continued): CHECK AS YOU SCROLL ---------- */

// At most once per frame, so scrolling stays smooth.
let waiting = false;
function onScroll() {
  if (waiting) return;
  waiting = true;
  requestAnimationFrame(function () {
    checkBubble();
    waiting = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
checkBubble();


/* ---------- JUMP LINKS FROM OTHER PAGES ----------
   Links from other pages use ?go=me (not #me), so the browser doesn't jump
   early. Here we load every image first, so nothing above the section can
   push it down later, then jump. (Old #me links still work too.) */
function jumpWhenImagesLoaded() {
  const id = new URLSearchParams(location.search).get("go") || location.hash.slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;

  let jumped = false;
  function jump() {
    if (jumped) return;
    jumped = true;
    target.scrollIntoView({ behavior: "instant" });
  }

  // Ask every image to load now (lazy ones included), and wait for them.
  const images = Array.from(document.images);
  let remaining = 0;
  images.forEach(function (img) {
    img.loading = "eager";
    if (!img.complete) {
      remaining++;
      img.addEventListener("load", oneDone, { once: true });
      img.addEventListener("error", oneDone, { once: true });
    }
  });
  function oneDone() {
    remaining--;
    if (remaining === 0) jump();
  }
  if (remaining === 0) jump();

  // Never wait more than 4 seconds, in case an image is very slow.
  setTimeout(jump, 4000);
}
jumpWhenImagesLoaded();


/* ---------- B. PLAY CHARTS WHEN THEY SCROLL INTO VIEW ---------- */

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // play it once it's on screen, or right away if it's already above you
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add("is-visible");
        watcher.unobserve(entry.target); // play once
      }
    });
  }, { threshold: 0.35 });
  reveals.forEach(function (el) { watcher.observe(el); });
} else {
  reveals.forEach(function (el) { el.classList.add("is-visible"); });
}

// Divider lines (and the lines above "up next" and the footer) grow in from
// the left once they're a little way onto the screen. Add class="grow-line"
// to anything else with a line you want to animate the same way.
const GROW_LINES = ".section-divider, .more-work, .site-footer, .grow-line";
const lines = document.querySelectorAll(GROW_LINES);
if ("IntersectionObserver" in window) {
  const lineWatcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add("is-visible");
        lineWatcher.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  lines.forEach(function (el) { lineWatcher.observe(el); });
} else {
  lines.forEach(function (el) { el.classList.add("is-visible"); });
}


/* ---------- C. IMAGE VIEWER ----------
   Click a project screenshot or an about photo to see it big.
   Close with the × button, the Esc key, or a click on the dark background.
   Click the image itself to zoom to full size (and again to fit the screen).
   To change which images open, edit ZOOMABLE. */
const ZOOMABLE = ".shot a, .photo img, .pic img";

const viewer = document.createElement("dialog");
viewer.className = "viewer";
viewer.setAttribute("aria-label", "Image viewer");
viewer.innerHTML =
  '<div class="viewer-stage"><div class="viewer-frame">' +
    '<img class="viewer-image" alt="">' +
    // the × is drawn as two lines, so it's perfectly centered in its circle
    '<button class="viewer-close" type="button" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7 L17 17 M17 7 L7 17"/></svg>' +
    '</button>' +
  '</div></div>' +
  '<p class="viewer-caption"></p>';
document.body.appendChild(viewer);
const viewerImage = viewer.querySelector(".viewer-image");
const viewerCaption = viewer.querySelector(".viewer-caption");

function openViewer(src, alt, caption) {
  viewerImage.src = src;
  viewerImage.alt = alt || "";
  viewerCaption.textContent = caption || "";
  viewerCaption.hidden = !caption;
  viewer.classList.remove("is-zoomed");
  viewer.showModal();
}

viewer.querySelector(".viewer-close").addEventListener("click", function () {
  viewer.close();
});
viewer.addEventListener("click", function (event) {
  if (event.target === viewerImage) {
    viewer.classList.toggle("is-zoomed");   // click the image: zoom in or out
  } else if (!event.target.closest(".viewer-close")) {
    viewer.close();                          // click anywhere else: close
  }
});
viewer.addEventListener("close", function () {
  viewerImage.removeAttribute("src");
});

document.querySelectorAll(ZOOMABLE).forEach(function (el) {
  const img = el.tagName === "IMG" ? el : el.querySelector("img");
  if (!img) return;
  const figure = el.closest("figure");
  const figcaption = figure ? figure.querySelector("figcaption") : null;
  const caption = figcaption ? figcaption.textContent.trim() : "";

  function open(event) {
    event.preventDefault();
    // project images link to their full-size file; about photos use their own src
    const src = el.tagName === "A" ? el.getAttribute("href") : (img.currentSrc || img.src);
    openViewer(src, img.alt, caption);
  }
  el.addEventListener("click", open);

  // about photos aren't links, so make them work with the keyboard too
  if (el.tagName === "IMG") {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View larger: " + (img.alt || caption));
    el.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") open(event);
    });
  }
});


/* ---------- D. CLICK BURSTS (every page) ---------- */

// BURST SETTINGS
const BURST_LINES = 5;          // how many lines in each burst
const BURST_SPREAD = 150;       // how wide the fan is, in degrees (360 = all the way around)
const BURST_WOBBLE = 12;        // random tilt added to each line, in degrees
const BURST_START = [10, 15];   // gap between the click and the lines (min, max)
const BURST_LENGTH = [11, 22];  // line length (min, max)

const SVG = "http://www.w3.org/2000/svg";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

document.addEventListener("click", function (event) {
  // Skip for "reduce motion" settings and for keyboard presses (no pointer position).
  if (reduceMotion.matches || event.detail === 0) return;
  if (event.target.closest(".viewer")) return;   // no bursts inside the image viewer

  const burst = document.createElementNS(SVG, "svg");
  burst.setAttribute("class", "burst");
  burst.setAttribute("viewBox", "-60 -60 120 120");
  burst.setAttribute("aria-hidden", "true");
  burst.style.left = event.pageX + "px";
  burst.style.top = event.pageY + "px";

  const group = document.createElementNS(SVG, "g");
  group.setAttribute("filter", "url(#pencil)");

  // The fan points up, tilted a little differently every time.
  const center = -90 + randomBetween(-20, 20);
  const first = center - BURST_SPREAD / 2;
  const step = BURST_LINES > 1 ? BURST_SPREAD / (BURST_LINES - 1) : 0;

  for (let i = 0; i < BURST_LINES; i++) {
    const angle = (first + step * i + randomBetween(-BURST_WOBBLE, BURST_WOBBLE)) * Math.PI / 180;
    const start = randomBetween(BURST_START[0], BURST_START[1]);
    const end = start + randomBetween(BURST_LENGTH[0], BURST_LENGTH[1]);

    const line = document.createElementNS(SVG, "path");
    line.setAttribute("pathLength", "1");
    line.setAttribute("d",
      "M" + (Math.cos(angle) * start).toFixed(1) + " " + (Math.sin(angle) * start).toFixed(1) +
      " L" + (Math.cos(angle) * end).toFixed(1) + " " + (Math.sin(angle) * end).toFixed(1));
    line.style.animationDelay = (i * 0.04) + "s, " + (0.6 + i * 0.04) + "s";
    group.appendChild(line);
  }

  burst.appendChild(group);
  document.body.appendChild(burst);

  // Clean up once it has faded out.
  setTimeout(function () { burst.remove(); }, 1400);
});


/* ---------- E. VERSION CARD (every page) ----------
   Asks GitHub for the site's commit count and last update, then puts them
   in the footer's "v4" card. The numbers already in the HTML stay put if
   GitHub can't be reached. Saved for the visit, so it only asks once. */
const REPO = "eviemitchell/eviemitchell.github.io";
const commitsText = document.querySelector("[data-commits]");
const updatedText = document.querySelector("[data-updated]");

function showVersion(info) {
  commitsText.textContent = info.commits;
  updatedText.textContent = info.updated;
}

// "2026-09-30T18:29:41Z" → "09/30/2026"
function formatDate(iso) {
  const d = new Date(iso);
  return String(d.getMonth() + 1).padStart(2, "0") + "/" +
    String(d.getDate()).padStart(2, "0") + "/" + d.getFullYear();
}

if (commitsText && updatedText) {
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem("version-info")); } catch (e) {}

  if (saved) {
    showVersion(saved);
  } else {
    // Ask for one commit per page: the number of the last page is the total.
    fetch("https://api.github.com/repos/" + REPO + "/commits?per_page=1")
      .then(function (response) {
        if (!response.ok) throw new Error("GitHub said " + response.status);
        const last = (response.headers.get("link") || "").match(/[?&]page=(\d+)>; rel="last"/);
        return response.json().then(function (commits) {
          return {
            commits: last ? last[1] : commits.length,
            updated: formatDate(commits[0].commit.committer.date)
          };
        });
      })
      .then(function (info) {
        showVersion(info);
        try { sessionStorage.setItem("version-info", JSON.stringify(info)); } catch (e) {}
      })
      .catch(function () {});   // keep the numbers already in the HTML
  }
}


/* ---------- F. GIFS AND VIDEOS (anything in <figure class="motion">) ----------
   They loop on their own. Click one (or tab to it and press Enter) to pause it
   right where it is, and again to play. With "reduce motion" on, they start paused.

   Browsers can't pause a GIF, so we play it ourselves: the browser's image
   decoder hands us one frame at a time, and we draw each onto a <canvas> for
   as long as the GIF says. Pausing just stops on the frame that's showing.
   (Browsers without the decoder get a fallback that freezes on the first frame.) */
document.querySelectorAll(".motion").forEach(function (figure) {
  const media = figure.querySelector("video, img");
  if (!media) return;

  // wrap it, so the play button can sit on top
  const frame = document.createElement("div");
  frame.className = "motion-frame";
  frame.tabIndex = 0;
  frame.setAttribute("role", "button");
  media.before(frame);
  frame.appendChild(media);

  const label = media.alt || media.getAttribute("aria-label") || "animation";
  const player = media.tagName === "VIDEO" ? videoPlayer(media) : gifPlayer(media, label);

  function update() {
    frame.classList.toggle("is-paused", player.isPaused());
    frame.setAttribute("aria-label", (player.isPaused() ? "Play: " : "Pause: ") + label);
  }
  function toggle() {
    if (player.isPaused()) player.play(); else player.pause();
    update();
  }

  player.onChange = update;
  frame.addEventListener("click", toggle);
  frame.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  });

  if (reduceMotion.matches) player.pause();   // "reduce motion": start paused
  update();
});

// A video already knows how to pause.
function videoPlayer(video) {
  const player = {
    isPaused: function () { return video.paused; },
    play: function () { video.play().catch(function () {}); },
    pause: function () { video.removeAttribute("autoplay"); video.pause(); },
    onChange: null
  };
  video.addEventListener("play", function () { if (player.onChange) player.onChange(); });
  video.addEventListener("pause", function () { if (player.onChange) player.onChange(); });
  return player;
}

// A GIF, played frame by frame so it can pause on the current frame.
function gifPlayer(img, label) {
  const canvas = document.createElement("canvas");
  canvas.hidden = true;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", label);
  img.after(canvas);
  const context = canvas.getContext("2d");

  let decoder = null;
  let frameCount = 0;
  let index = 0;        // the next frame to show
  let paused = false;
  let timer = null;
  let run = 0;          // bumps on every play/pause, so an old loop knows to stop

  // Show one frame, then wait as long as the GIF says before the next.
  function step(thisRun) {
    decoder.decode({ frameIndex: index }).then(function (result) {
      if (thisRun !== run) { result.image.close(); return; }
      context.drawImage(result.image, 0, 0);
      // browsers treat tiny GIF delays as 0.1s, so we do too
      const ms = (result.image.duration || 0) / 1000;
      result.image.close();
      index = (index + 1) % frameCount;
      if (!paused) timer = setTimeout(function () { step(thisRun); }, ms < 20 ? 100 : ms);
    }).catch(function () {});
  }

  // Load the GIF into the decoder, then swap the <img> for the canvas.
  function start() {
    fetch(img.currentSrc || img.src)
      .then(function (response) { return response.arrayBuffer(); })
      .then(function (data) {
        decoder = new ImageDecoder({ data: data, type: "image/gif" });
        return Promise.all([decoder.tracks.ready, decoder.completed]);   // the frame list, and all the data
      })
      .then(function () {
        frameCount = decoder.tracks.selectedTrack.frameCount;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        img.hidden = true;
        canvas.hidden = false;
        run++;
        step(run);   // draws the first frame, and keeps going unless paused
      })
      .catch(useFallback);
  }

  // No decoder (or it failed): freeze by snapshotting the <img> instead.
  // Browsers only let us copy a GIF's first frame, so it rewinds to the start.
  let fallback = false;
  function useFallback() {
    fallback = true;
    decoder = null;
    canvas.hidden = !paused;
    img.hidden = paused;
    if (paused) snapshot();
  }
  function snapshot() {
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener("load", function () { if (paused) snapshot(); }, { once: true });
      return;
    }
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    context.drawImage(img, 0, 0);
  }

  if ("ImageDecoder" in window) {
    if (img.complete) start(); else img.addEventListener("load", start, { once: true });
  } else {
    useFallback();
  }

  return {
    isPaused: function () { return paused; },
    pause: function () {
      paused = true;
      run++;
      clearTimeout(timer);
      if (fallback) {
        snapshot();
        img.hidden = true;
        canvas.hidden = false;
      }
    },
    play: function () {
      paused = false;
      run++;
      if (fallback) {
        img.hidden = false;
        canvas.hidden = true;
      } else if (decoder && frameCount) {
        step(run);
      }
    },
    onChange: null
  };
}
