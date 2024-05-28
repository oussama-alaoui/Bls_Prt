import puppeteer from "puppeteer";
import { createCanvas, loadImage } from 'canvas';

async function urlToBlob(url) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'Anonymous';
    img.src = url;

    await new Promise((resolve, reject) => {
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Unable to create blob from image.'));
                }
            });
        };

        img.onerror = function(error) {
            reject(error);
        };
    });

    return canvas.toBlob;
}
(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--auto-open-devtools-for-tabs',
            // `--proxy-server=${newProxyUrl}`
        ]
    });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto('https://account.bioid.com/Account/Login');
    await page.waitForSelector('#Email');

    // Perform the login
    await page.type('#Email', 'oussamaalaouu@gmail.com');
    await page.type('#Password', 'Mimo7979@@');
    await page.click('.btn');

    await page.goto('https://playground.bioid.com/LivenessDetection');

    // call to api inside the browser
    await page.waitForSelector('#capture');
    const res = await page.evaluate(async () => {
        const res = await fetch('https://playground.bioid.com/LivenessDetection/EmptyResult', {
            method: 'GET',
        });
    });

    // call to api outside the browser post submit
    try {
        const res = await page.evaluate(async () => {
            async function urlToBlob(url) {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = url;
    
                return new Promise((resolve, reject) => {
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Unable to create blob from image.'));
                            }
                        });
                    };
                    img.onerror = function(error) {
                        reject(error);
                    };
                });
            }
    
            // Use the urlToBlob function to convert image URLs to blobs
            const image2res = await urlToBlob("https://i.postimg.cc/wv351nrH/image222.png");
            const image1res = await urlToBlob("https://i.postimg.cc/HLY9gr4r/image111.png");
    
            // Log the created blobs
            console.log('Blob created for image1:', image1res);
            console.log('Blob created for image2:', image2res);
    
            // Fetch the __RequestVerificationToken from the page
            const __RequestVerificationToken = document.querySelector('input[name="__RequestVerificationToken"]').value;
    
            // Prepare the form data with the blobs
            const data = new FormData();
            data.append('image1', image1res, 'image1.png');
            data.append('image2', image2res, 'image2.png');
            data.append('__RequestVerificationToken', __RequestVerificationToken);
            data.append('isMobile', false);
    
            // Send a POST request to the API with the form data
            const response = await fetch('https://playground.bioid.com/LivenessDetection', {
                method: 'POST',
                body: data
            });
    
            // Return the API response
            return await response.text();
        });
    } catch (error) {
        console.error('Error:', error);
    }
    
    // Close the browser
    // await browser.close();
})();