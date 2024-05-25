import { exec } from 'child_process';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs'
// import { promisify } from 'util';
// const writeFileAsync = promisify(fs.writeFile);

// const file = '/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/video.mp4';
// const takeAtSecond = '0';
// const numberOfFrames = 0.5 * 60; // Number of frames to capture (0.5 minute) = 30 frames
// const delayBetweenFrames = 1; // Delay between each image capture in seconds

// function captureFrame(frameNumber, outputFilename) {
//   return new Promise((resolve, reject) => {
//     const command = `ffmpeg -ss ${takeAtSecond} -i ${file} -vf select='eq(n\\,${frameNumber})' -vframes 1 ${outputFilename} -y`;
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//         return;
//       }
//       if (stderr) {
//         console.error(stderr);
//       }
//       console.log(`Image ${outputFilename} captured successfully.`);
//       resolve();
//     });
//   });
// }

// async function captureImages() {
//   const images = [];
//   for (let i = 1; i <= numberOfFrames; i++) {
//     const outputFilename = `/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/images/image${i}.png`;
//     await captureFrame(i, outputFilename);
//     images.push(outputFilename);
//     if (i < numberOfFrames) {
//       await new Promise(resolve => setTimeout(resolve, delayBetweenFrames * 1000));
//     }
//   }
//   console.log('All images captured successfully.');
//   return images;
// }

// function motionDetection(imageData, template) {
//   let bestHitX = 0,
//       bestHitY = 0,
//       maxCorr = 0,
//       searchWidth = imageData.width / 4,
//       searchHeight = imageData.height / 4,
//       p = imageData.data;

//   for (var y = template.centerY - searchHeight; y <= template.centerY + searchHeight - template.height; y++) {
//     for (var x = template.centerX - searchWidth; x <= template.centerX + searchWidth - template.width; x++) {
//       let nominator = 0,
//           denominator = 0,
//           templateIndex = 0;

//       // Calculate the normalized cross-correlation coefficient for this position
//       for (var ty = 0; ty < template.height; ty++) {
//         // we use only the green plane here
//         let bufferIndex = x * 4 + 1 + (y + ty) * imageData.width * 4;
//         for (var tx = 0; tx < template.width; tx++) {
//           var imagepixel = p[bufferIndex];
//           nominator += template.buffer[templateIndex++] * imagepixel;
//           denominator += imagepixel * imagepixel;
//           // we use only the green plane here
//           bufferIndex += 4;
//         }
//       }

//       // The NCC coefficient is then (watch out for division-by-zero errors for pure black images):
//       let ncc = 0.0;
//       if (denominator > 0) {
//         ncc = nominator * nominator / denominator;
//       }
//       // Is it higher than what we had before?
//       if (ncc > maxCorr) {
//         maxCorr = ncc;
//         bestHitX = x;
//         bestHitY = y;
//       }
//     }
//   }
//   // now the most similar position of the template is (bestHitX, bestHitY). Calculate the difference from the origin:
//   let distX = bestHitX - template.xPos,
//       distY = bestHitY - template.yPos,
//       movementDiff = Math.sqrt(distX * distX + distY * distY);
//   // the maximum movement possible is a complete shift into one of the corners, i.e:
//   let maxDistX = searchWidth - template.width / 2,
//       maxDistY = searchHeight - template.height / 2,
//       maximumMovement = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);

//   // the percentage of the detected movement is therefore:
//   let movementPercentage = movementDiff / maximumMovement * 100;
//   if (movementPercentage > 100) {
//     movementPercentage = 100;
//   }
//   console.log('Calculated movement: ', movementPercentage);
//   return movementPercentage;
// }

// function createTemplate(imageData) {
//     // cut out the template:
//     // we use a small width, quarter-size image around the center as template
//     var template = {
//         centerX: imageData.width / 2,
//         centerY: imageData.height / 2,
//         width: imageData.width / 4,
//         height: imageData.height / 4 + imageData.height / 8
//     };
//     template.xPos = template.centerX - template.width / 2;
//     template.yPos = template.centerY - template.height / 2;
//     template.buffer = new Uint8ClampedArray(template.width * template.height);

//     let counter = 0;
//     let p = imageData.data;
//     for (var y = template.yPos; y < template.yPos + template.height; y++) {
//         // we use only the green plane here
//         let bufferIndex = (y * imageData.width * 4) + template.xPos * 4 + 1;
//         for (var x = template.xPos; x < template.xPos + template.width; x++) {
//             let templatepixel = p[bufferIndex];
//             template.buffer[counter++] = templatepixel;
//             // we use only the green plane here
//             bufferIndex += 4;
//         }
//     }
//     return template;
// }

// export async function analyzeMotion(isMobile) {
//     const images = await captureImages();

//     if (images.length < 2) {
//         return;
//     }

//     // Load the first image to use as a template
//     const [firstImagePath, ...remainingImages] = images;
//     const [firstImage] = await Promise.all([loadImage(firstImagePath)]);

//     const canvas1 = createCanvas(firstImage.width, firstImage.height);
//     const ctx1 = canvas1.getContext('2d');
//     ctx1.drawImage(firstImage, 0, 0);
//     const imageData1 = ctx1.getImageData(0, 0, firstImage.width, firstImage.height);

//     // Create template from the first image
//     const template = createTemplate(imageData1);

//     // Start comparing the first image with subsequent images
//     for (let i = 0; i < remainingImages.length; i++) {
//         const imagePath = remainingImages[i];
//         const image = await loadImage(imagePath);

//         const canvas = createCanvas(image.width, image.height);
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(image, 0, 0);
//         const imageData = ctx.getImageData(0, 0, image.width, image.height);

//         // Calculate movement percentage between the template and the current image
//         const movementPercentage = motionDetection(imageData, template)

//         // If the movement percentage is greater than 20, print the images and movement percentage
//         if (movementPercentage > 20) {
//             console.log(`Movement percentage above 20 found between image1 and image${i + 2}.`);
//             console.log('Image 1:', firstImagePath);
//             console.log(`Image ${i + 2}:`, imagePath);

//             // Convert images to blobs
//             const firstImageBlob = await imageToBlob(firstImage);
//             const secondImageBlob = await imageToBlob(image);

//             // Delete all images
//             // for (const image of images) {
//             //     await promisify(fs.unlink)(image);
//             // }

//             return { firstImageBlob, secondImageBlob };
//         }
//     }
// }

// async function imageToBlob(image) {
//     console.log('Converting image to blob...', image);
//     const canvas = createCanvas(image.width, );
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(image, 0, 0);

//     return new Promise((resolve, reject) => {
//         canvas.toDataURL('image/png', { quality: 1.0, mimeType: 'image/png' }, (err, dataUrl) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 const base64Data = dataUrl.split(',')[1];
//                 resolve(Buffer.from(base64Data, 'base64'));
//             }
//         });
//     });
// }


// const imagePath = '/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/images/image1.png';
// imageToBlob(imagePath)
//   .then(blob => {
//     console.log('Blob created:', blob);
//     // You can now use the blob as needed
//   })
//   .catch(err => {
//     console.error('Error:', err);
//   });

function bufferToBlob(buffer, type) {
  return new Blob([buffer], { type });
}

export async function imageToBlob(imagePath) {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    const buffer = canvas.toBuffer('image/png');
    if (buffer) {
      resolve(bufferToBlob(buffer, 'image/png'));
    } else {
      reject(new Error('Blob creation failed'));
    }
  });
}

// const imagePath1 = "/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/images/image1.png";
// const imagePath2 = "/home/wst-4r/Desktop/oussama_alaoui/bls/Bls/Bls_Prt/Bls_Prt/assets/images/image2.png";

// let img1, img2;

// imageToBlob(imagePath1)
//   .then(blob => {
//     console.log('Blob created for image1:', blob);
//     return imageToBlob(imagePath2);
//   })
//   .then(blob => {
//     console.log('Blob created for image2:', blob);
//   })
//   .catch(err => {
//     console.error('Error:', err);
//   });