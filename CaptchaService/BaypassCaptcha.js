import pkg from 'canvas';
const { createCanvas, loadImage, canvas } = pkg;
import dotenv from 'dotenv';
dotenv.config();


var resultVision = [];


async function filterImages(page) {
   try {
       await page.waitForSelector('.col-4');


       const img = [];


       const divElements = await page.$$('.col-4');


       for (const divElement of divElements) {
           const displayValue = await divElement.evaluate(element => {
               return {zindex: getComputedStyle(element).getPropertyValue('z-index'), display: getComputedStyle(element).getPropertyValue('display')};
           });
           if (+displayValue.zindex > 2000 && displayValue.display !== "none") {
               const imgSrc = {
                   image: await divElement.$eval('img', img => img.src.split(',')[1]),
                   name: await divElement.evaluate(div => div.id)
               }
               img.push(imgSrc);
           }
       }
       return img;
   } catch (error) {
       console.error('Error:', error);
   }
}


async function getNumber(page) {
   try {
       let highestZIndexDiv = null;
       let highestZIndex = 1;


       const divElements = await page.$$('.box-label');


       for (const divElement of divElements) {
           const zIndexValue = await divElement.evaluate(element => {
               return parseInt(getComputedStyle(element).getPropertyValue('z-index'));
           });
           if (zIndexValue > highestZIndex) {
               highestZIndex = zIndexValue;
               highestZIndexDiv = divElement;
           }
       }
      
       if (highestZIndexDiv) {
           const textContent = await highestZIndexDiv.evaluate(element => element.textContent);
           return (textContent.trim().split(' ')[6])
       } else {
           console.log("No div with class 'box-label' found.");
       }
   } catch (error) {
       console.error('Error:', error);
   }
}


//  cntatinate images vertically and save the image to the disk
async function concatenateImagesVertically(images) {
   const canvas = createCanvas(180, 90 * images.length);
   const ctx = canvas.getContext('2d');
   let height = 0;


   for (const img of images) {
       const image = await loadImage(`data:image/jpeg;base64,${img.image}`);
       ctx.drawImage(image, 0, height);
       height += image.height;
   }
   return canvas.toDataURL('image/jpeg').split(',')[1]
}


async function solveCaptchaWithCloudVision(base64String) {
   var ocrRequestBody = {
       requests: [
           {
               image: {
                   content: base64String,
               },
               features: [
                   {
                       type: "TEXT_DETECTION",
                   },
               ],
           },
       ],
   };


   await fetch("https://content-vision.googleapis.com/v1/images:annotate?alt=json&key=AIzaSyC0FKuOzxye6eM00l9ToAPlEpwk-S67ZrM", {
       body: JSON.stringify(ocrRequestBody),
       method: "POST",
   }).then((response) => {
       if (!response.ok) {
           throw new Error("Network response was not ok", response);
       }
       return response.json();
   }).then((data) => {
       var results = data.responses[0].textAnnotations[0].description.split("\n")
       resultVision = results;
   }).catch((error) => {
       console.error('Error :', error);
   });
}

async function prepareResult(data, number){
   const result = [];
   resultVision.forEach((element, index) => {
       if (element == number) {
           result.push(data[index].name);
       }
   }
   )
   return result;
}

export async function SolveCaptcha(path, browser, type) {
   const page = await browser.newPage();
   await page.setRequestInterception(true);
   page.on('request', interceptedRequest => {
       if (['image', 'stylesheet', 'font', 'script'].indexOf(interceptedRequest.resourceType()) !== -1)
           interceptedRequest.abort();
       else
           interceptedRequest.continue();
   });
   await page.goto(path, { timeout: 100000});

   const number = await getNumber(page)
   const image = await filterImages(page)
   const base = await concatenateImagesVertically(image);
   await solveCaptchaWithCloudVision(base);
   const result = await prepareResult(image, number);
   var captcha = "";
   let id = "";
   if(type == "login"){
        captcha = await page.$eval('input[name="Captcha"]', el => el.value)
        id = await page.$eval('input[name="Id"]', el => el.value)
    }
    else
        id = await page.$eval('input[name="Id"]', el => el.value)
   return {page, result, captcha, id};
}
