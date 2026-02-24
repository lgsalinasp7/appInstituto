import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

const imagesToConvert = [
  'kaledsoft-logo.png',
  'kaledsoft-logo-transparent.png',
  'kaledsoft-logoPpal.png',
  'tenants1.png',
  'tenants2.png',
  'wilcard.png'
];

async function convertToWebP() {
  console.log('🔄 Convirtiendo imágenes a WebP...\n');

  for (const imageName of imagesToConvert) {
    const inputPath = join(publicDir, imageName);
    const outputPath = join(publicDir, imageName.replace('.png', '.webp'));

    if (!existsSync(inputPath)) {
      console.log(`⚠️  ${imageName} no encontrada, saltando...`);
      continue;
    }

    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`✅ ${imageName} → ${imageName.replace('.png', '.webp')}`);
    } catch (error) {
      console.error(`❌ Error convirtiendo ${imageName}:`, error.message);
    }
  }

  console.log('\n✨ Conversión completada!');
}

convertToWebP();
