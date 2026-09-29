# Evie Mitchell portfolio: homepage

Three files and an images folder. No build step, no frameworks. Upload them to your GitHub Pages repo and it works.

- `index.html`: all the words and images. This is the file you'll edit most.
- `style.css`: colors, sizes, and layout. The SETTINGS block at the top controls colors, column width, and font.
- `oracleclinical.html` + `project.css`: the clinical case study, and the template for your other project pages.
- `script.js`: the scroll behavior (the bubble, pen sparkle, and photo pop-ins) and the little bursts that appear wherever you click. You shouldn't need to touch it.
- `images/`: your drawing plus placeholder images to replace.

## Common edits

**Change the words in the "I've designed for:" bubble.** In `index.html`, each project has `data-word="..."`. Change it there. The about section also has `data-prefix`, which changes the first line.

**Swap in your real images.** Put the files in `images/` and change the `src="..."` on each cover or photo to match the file name. Covers look best at 1120 × 660 (or the same shape). Update the `alt="..."` text too; it describes the image for screen readers.

**Add a project.** In `index.html`, copy one project block, from the `PROJECT` comment down to `END PROJECT`, and paste it where you want it. Edit the text, links, and image.

**Adjust the click bursts.** At the bottom of `script.js`, the BURST SETTINGS control how many lines each burst has, how wide the fan spreads, and how long the lines are.

**Change the purple, the sparkle color, or any color.** Edit the values at the top of `style.css` under SETTINGS.

## Placeholders to replace

- `images/cover-portal.png`, `cover-clinical.png`, `cover-procurement.png`, `cover-norfolk.png`
- `images/about-climbing.png`, `about-painting.png`, `about-cats.png`
- The Patient Portal link points to `oraclepp.html`. Swap in your App Store link if you'd rather send people there.

## Speed notes

- Cover and about images load only as you scroll near them.
- Export covers as `.webp` or compressed `.jpg` (under ~200 KB each) and they'll load fast.
- The font comes from Google Fonts. To make the page even faster, delete the three font lines in the `<head>` of `index.html`; it will fall back to your device's system font.

## Project pages

`oracleclinical.html` is the template for every case study. To make another one, copy it, rename it (like `oraclepp.html`), and swap the words and images. Everything project-specific is in the page itself:

- **"On this page" list:** each link's `href="#..."` must match a section's `id="..."`.
- **Images:** they live in a folder per project (like `clinical/`). Tapping an image opens it full size.
- **Impact numbers:** edit the text right in the HTML. To change a bar's length, edit `style="--after: 70%"`.
- **"as of [month year]":** fill this in under the impact chart.
