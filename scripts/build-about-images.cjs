/** Responsive About images. Source photographs remain unchanged. */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
    const destination = path.join(root, 'images/about');
    await fs.mkdir(destination, { recursive: true });
    for (const [name, source, widths] of [
        ['georgia-fowler', 'images/portfolio/000019820034lbwb.jpg', [360, 540, 720, 960, 1200, 1440]],
        ['selected-work', 'images/thumbnails/whereiwanttobe2.jpg', [540, 960, 1440, 2048]]
    ]) {
        for (const width of widths) {
            const image = sharp(path.join(root, source)).rotate().resize({ width, withoutEnlargement: true }).toColourspace('srgb');
            const results = await Promise.all([
                image.clone().avif({ quality: 60, effort: 5 }).toFile(path.join(destination, `${name}-${width}.avif`)),
                image.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(destination, `${name}-${width}.webp`))
            ]);
            console.log(`${name} ${width}: AVIF ${Math.round(results[0].size / 1024)} KB; WebP ${Math.round(results[1].size / 1024)} KB`);
        }
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
