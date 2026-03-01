import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const pngToIco = require('png-to-ico');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const logoSvgPath = path.join(publicDir, 'logo.svg');

const readText = (p) => fs.readFileSync(p, 'utf8');
const writeFile = (p, buf) => fs.writeFileSync(p, buf);

const renderSvgToPng = (svg, size) => {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: size
    }
  });
  return resvg.render().asPng();
};

const main = async () => {
  if (!fs.existsSync(logoSvgPath)) {
    throw new Error(`logo.svg introuvable: ${logoSvgPath}`);
  }

  const svg = readText(logoSvgPath);

  // 1) Logo PNG (qualité) pour le PDF et usage général
  const logoPng = renderSvgToPng(svg, 512);
  writeFile(path.join(publicDir, 'logo.png'), logoPng);

  // 2) Favicon PNG (pratique pour tests / fallback)
  const faviconPng = renderSvgToPng(svg, 32);
  writeFile(path.join(publicDir, 'favicon.png'), faviconPng);

  // 3) Favicon ICO multi-tailles
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = sizes.map((s) => renderSvgToPng(svg, s));
  const ico = await pngToIco(buffers);
  writeFile(path.join(publicDir, 'favicon.ico'), ico);

  process.stdout.write(
    `OK: logo.png + favicon.png + favicon.ico générés dans ${publicDir}\n`
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
