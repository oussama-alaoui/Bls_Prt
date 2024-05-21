import { captchaProcess } from "./CaptchaProcess.js";
import { checkSlot } from "./Api.js";

// Login Helper Functions
export async function GetDataLogin(page) {
const data = {}

// get the id from the input field and store it in the data object
data.CaptchaId = await page.$eval('input[name="CaptchaId"]', el => el.value);
data.ScriptData = await page.$eval('input[name="ScriptData"]', el => el.value);
data.__RequestVerificationToken = await page.$eval('input[name="__RequestVerificationToken"]', el => el.value);


const divElements = await page.$$('.mb-3.position-relative');


for (const divElement of divElements) {
    const displayValue = await divElement.evaluate(element => {
        return getComputedStyle(element).getPropertyValue('display');
    });
        if (displayValue === "block"){
                if (await divElement.$('input[name*="UserId"]')) {
                    data.emailInput = await divElement.$eval('input', el => el.getAttribute('name'))
                } else if (await divElement.$('input[name*="Password"]')) {
                    data.passwordInput = await divElement.$eval('input', el => el.getAttribute('name'))
                }
        }
    }
return data;
}
 
export async function SubmitCaptcha(page, images, captcha, id, url) {
    try {
    const requestVerificationToken = await page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
    const body = { SelectedImages: images.toString(), Id: id, __RequestVerificationToken: requestVerificationToken };
    if(captcha)
        body.Captcha = captcha;
    const submit = await page.evaluate(async (body, url) => {
        const res = await fetch(url, {
        method: 'POST',
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: new URLSearchParams(body),
        });
        return await res.json();
    }, body, url);
    return submit;
    } catch (error) {
    console.error('Error in submitCaptcha:', error);
    }
}

// Visa Type Helper Functions
async function getUrl(page, cdn) {
    try {
        const requestVerificationToken = await page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
        const body = {__RequestVerificationToken: requestVerificationToken, CaptchaData: cdn};
        const submit = await page.evaluate(async (body) => {
            const res = await fetch('https://morocco.blsportugal.com/MAR/bls/vtv0001', {
                method: 'POST',
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.7",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "sec-ch-ua": "\"Brave\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "sec-gpc": "1",
                    "x-requested-with": "XMLHttpRequest"
                },
                body: new URLSearchParams(body),
            });
            return res.json()
        }, body);
        return submit;
    } catch (error) {
        console.error('Error in get Url:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
        getUrl(page, cdn);
    }
}

export async function prepareData(page, ids) {
    const body = {
        AppointmentFor5: "Individual",
        AppointmentFor1: "Individual",
        AppointmentFor3: "Individual",
        AppointmentFor4: "Individual",
        AppointmentFor2: "Individual",
    };
    body.ScriptData = await page.$eval('input[name="ScriptData"]', el => el.value);
    body.CaptchaData = await page.$eval('input[name="CaptchaData"]', el => el.value);
    body.__RequestVerificationToken = await page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
    body.Id = await page.$eval('input[name="Id"]', el => el.value);
    for (let i = 1; i <= 10; i++)
        body[`Id${i}`] = await page.$eval(`input[name="Id${i}"]`, el => el.value);
 
 
    const divElements = await page.$$('div.mb-3');
    for (const divElement of divElements) {
        const displayValue = await divElement.evaluate(element => {
            return getComputedStyle(element).getPropertyValue('display');
        });
        if (displayValue !== "none") {
            if (await divElement.$('input')) {
                const name = await divElement.$eval('input', el => el.getAttribute('name'));
                if(name.includes("Location")){
                    body[name] = "8d780684-1524-4bda-b138-7c71a8591944";
                    body.location = name
                }
                else if(name.includes("VisaType")){
                    body[name] = "084cd40f-c448-475e-8873-6b5eff2e01bf"
                    body.type = name
                }
                else if(name.includes("VisaSubType")){
                    body[name] = "e70cc749-5b1e-457f-b664-f27a05082aaf"
                    body.subType = name
                }
                else if(name.includes("AppointmentCategoryId")){
                    body[name] = "5c2e8e01-796d-4347-95ae-0c95a9177b26"
                    body.appointmentCategoryIdData = name
                }
            }
        }
    }
    body.ResponseData = [
        {"Id":`${body.appointmentCategoryIdData}`, "Start":`2024-05-14T11:10:44.108Z`, "End":`2024-05-14T11:10:45.112Z`, "Total":1004},
        {"Id":`${body.location}`, "Start":`2024-05-14T11:10:45.926Z`, "End":`2024-05-14T11:10:46.854Z`, "Total":928},
        {"Id":`${body.type}`, "Start":`2024-05-14T11:10:47.566Z`, "End":`2024-05-14T11:10:48.952Z`, "Total":1386},
        {"Id":`${body.subType}`, "Start":`2024-05-14T11:10:49.601Z`, "End":`2024-05-14T11:10:51.859Z`, "Total":2258},
    ]
    body.ResponseData = JSON.stringify(body.ResponseData);
    delete body.appointmentCategoryIdData;
    delete body.category;
    delete body.location;
    delete body.type;
    delete body.subType;
    return body;
}

export async function Slotprocess(page, browser, retry = 0, ids) {
    try{
        var res = await captchaProcess(page, browser, 'https://morocco.blsportugal.com/MAR/NewCaptcha/GenerateCaptcha', 'verify', '/MAR/NewCaptcha/SubmitCaptcha');
        const url = await getUrl(page, res.cd);
        await page.goto(`https://morocco.blsportugal.com${url.returnUrl}`);
        const slot = await checkSlot(page, url.returnUrl, ids);
        if(slot.available == true){
            console.log("Slot available")
            return slot;
        }
        else {
            console.log("Slot not available: ", retry, "Retry in 30 seconds", "data: ", slot)
            retry++;
            setTimeout(() => {
                Slotprocess(page, browser, retry, ids);
            }, 30000);
        }
    }
    catch (error) {
        console.log('Error in Slotprocess:', error);
        // Slotprocess(page, browser);
    }
}
