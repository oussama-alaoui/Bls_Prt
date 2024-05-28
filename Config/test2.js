import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function main() {
    const imageUrl1 = 'https://i.postimg.cc/k52HG2d4/image1.png';
    const imageUrl2 = 'https://i.postimg.cc/XvtzCnVg/image2.png';

    try {
        // Fetch images
        const image1 = await loadImageFromUrl(imageUrl1);
        const image2 = await loadImageFromUrl(imageUrl2);

        // Process images
        const processedImage1 = await processImage(image1);
        const processedImage2 = await processImage(image2);
        console.log(processedImage1);
        console.log(processedImage2);
        // Save processed images to disk
        // await saveImageToFile(processedImage1, 'processed_image1.jpg');
        // await saveImageToFile(processedImage2, 'processed_image2.jpg');

        console.log('Images processed and saved successfully!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

async function loadImageFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${url}`);
    }
    const buffer = await response.buffer();
    return loadImage(buffer);
}

function processImage(image) {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Convert canvas content to a Buffer
    return canvas.toBuffer('image/jpeg');
}

async function saveImageToFile(buffer, filename) {
    await fs.promises.writeFile(filename, buffer);
}

main();