import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { Blob } from 'buffer';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract frames from the video
function extractFrames(videoPath, callback) {
    const outputDir = path.join(__dirname, 'frames');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Define the frame extraction times in seconds
    const frameTimes = [1, 2]; // Adjust times as needed

    const framePromises = frameTimes.map((time, index) => {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(outputDir, `frame${index + 1}.png`);
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [time],
                    filename: `frame${index + 1}.png`,
                    folder: outputDir,
                    size: '484x848' // adjust size as needed
                })
                .on('end', () => resolve(outputPath))
                .on('error', reject);
        });
    });

    Promise.all(framePromises)
        .then(callback)
        .catch((error) => {
            console.error('Error extracting frames:', error);
        });
}

// Function to convert image to Blob
function imageToBlob(imagePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(imagePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(new Blob([data], { type: 'image/png' }));
            }
        });
    });
}

// Main function
async function main(videoPath) {
    extractFrames(videoPath, async (framePaths) => {
        try {
            const blobs = await Promise.all(framePaths.map(imageToBlob));
            console.log('Frames extracted and converted to blobs:');
            blobs.forEach((blob, index) => {
                console.log(`Frame ${index + 1} Blob:`, blob);
            });

            // Example: Send blobs to an API
            const response = await fetch('https://example.com/api/analyze-frames', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frame1: blobs[0], frame2: blobs[1] })
            });

            const result = await response.json();
            console.log('API response:', result);
        } catch (error) {
            console.error('Error processing frames:', error);
        }
    });
}

// Run the script with the video path as an argument
const videoPath = "/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/test.mp4";
if (videoPath) {
    main(videoPath);
} else {
    console.error('Please provide a video path as an argument.');
}