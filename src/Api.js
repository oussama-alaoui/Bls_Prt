import { prepareData } from "./Tools.js";

export async function login_request(page, data, captcha, UserData) {
    try {
        const body = {
             CaptchaId: data.CaptchaId,
             ScriptData: data.ScriptData,
             [data.emailInput]: UserData.email,
             [data.passwordInput]: UserData.password,
             __RequestVerificationToken: data.__RequestVerificationToken,
             CaptchaData: captcha
         }
        const login = await page.evaluate(async (body) => {
            const res = await fetch('https://morocco.blsportugal.com/MAR/account/loginsubmit', {
                method: 'POST',
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "max-age=0",
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(body),
            });
            return res.json();
        }, body);
       if(login.success === false){
           console.log("Login failed, retrying");
       }
       return login;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function checkSlot(page, url, ids) {
    const body = await prepareData(page, ids);
    const res = await page.evaluate(async (body, url) => {
        try {
            const res = await fetch(`https://morocco.blsportugal.com${url}`, {
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
            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Response is not JSON");
            }
            return res.json();
        } catch (error) {
            return { error: error.message };
        }
    }, body, url);
    return res;
}

export async function requestOtp(page, otpcode) {
    try {
        await page.evaluate(async (otpcode) => {
            const response = await fetch('https://morocco.blsportugal.com/MAR/blsappointment/savc'+otpcode, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });
            return response;
        }, otpcode);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function verifyOtp(page, scriptContent, otp) {
    try {
        var value = '';
        var id = await page.$eval('input[name="Id"]', el => el.value);
        scriptContent.forEach(script => {
            if(script.includes("function VerifyEmailCode")){
                value = script.split('Value: \'')
                value = value[value.length-1].split('\',')[0]
            }
        })
        const res = await page.evaluate(async (otp, value, id) => {
            const response = await fetch('https://morocco.blsportugal.com/MAR/blsappointment/VerifyEmailForAppointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "requestverificationtoken": document.querySelector('input[name="__RequestVerificationToken"]').value
                },
                body: new URLSearchParams({ Code: otp, Value: value, Id: id })
            });
            return response;
        }, otp, value, id);
        console.log(res);
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function Calendareq(page, data) {
    try {
        const url = await page.evaluate(() => {
            return document.querySelector('form').action;
        }
        );
        const response = await page.evaluate(async (data, url) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(data)
            });
            return response.json();
        }, data, url);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function getSlot(page, date, id) {
    try {
        const body = {
            LocationId: await page.$eval('input[name="LocationId"]', el => el.value),
            AppointmentCategoryId: await page.$eval('input[name="AppointmentCategoryId"]', el => el.value),
            AppointmentDate: date.DateText,
            ApplicantsNo: "1",
            VisaType: await page.$eval('input[name="VisaType"]', el => el.value),
            VisaSubType: await page.$eval('input[name="VisaSubTypeId"]', el => el.value),
            MissionId: await page.$eval('input[name="MissionId"]', el => el.value),
            DataSource: "WEB_BLS",
            CaptchaData2: await page.$eval('input[name="CaptchaData2"]', el => el.value),
            Id: id.replace(/['"]+/g, ''),
        };

        const RequestVerificationToken = await page.evaluate(() => {
            return document.querySelector('input[name="__RequestVerificationToken"]').value;
        });

        const response = await page.evaluate(async (body, cookieValue) => {
            const res = await fetch(`https://morocco.blsportugal.com/MAR/blsappointment/gasd4443`, {
                method: 'POST',
                headers: {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.5",
                    "requestverificationtoken": cookieValue,
                },
                body: new URLSearchParams(body),
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch. Status: ${res.status}`);
            }

            return res.json();
        }, body, RequestVerificationToken);
        const slots = response.filter(slot => slot.Count >= 1);
        return slots;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function Applicantreq(page, data, path) {
    try {
        const response = await page.evaluate(async (data, path) => {
            const response = await fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(data)
            });
            return response.json();
        }, data, path);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function VerifyVideo(page, formData, imageUrls) {
    try {
        const response = await page.evaluate(async (formData, imageUrls) => {
            async function fetchImageAsBlob(url) {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                    return await response.blob();
                } catch (error) {
                    throw new Error(`Failed to fetch image from URL: ${url} with error: ${error.message}`);
                }
            }

            try {
                const image1res = await fetchImageAsBlob(imageUrls[1]);
                const image2res = await fetchImageAsBlob(imageUrls[0]);

                const formDataWithBlobs = new FormData();
                formDataWithBlobs.append('Id', formData.Id);
                formDataWithBlobs.append('ApplicantPhotoId', formData.ApplicantPhotoId);
                formDataWithBlobs.append('__RequestVerificationToken', formData.__RequestVerificationToken);
                formDataWithBlobs.append('image1', image1res, 'image1.png');
                formDataWithBlobs.append('image2', image2res, 'image2.png');
                formDataWithBlobs.append('PhotoId', '');
                formDataWithBlobs.append('cameraLabel', "camera");
                formDataWithBlobs.append('isMobile', false);
                formDataWithBlobs.append('appointmentId', formData.appointmentId);

                const response = await fetch("https://morocco.blsportugal.com/MAR/blsappointment/SubmitLivenessDetection", {
                    method: "POST",
                    body: formDataWithBlobs,
                });

                return response.text();
            } catch (error) {
                console.error('Failed to create blobs and submit form:', error);
                throw error;
            }
        }, formData, imageUrls);
        return response;
    } catch (error) {
        console.error('Error in VerifyVideo:', error);
    }
}

export async function reqPr(page, data, requestVerificationToken) {
    try {
        const response = await page.evaluate(async (data, requestVerificationToken) => {
            const body = new FormData();
            body.append('Id1', data.Id1);
            body.append('ValueAddedServices', data.ValueAddedServices);
            body.append('Id', data.Id);
            const response = await fetch('https://morocco.blsportugal.com/MAR/payment/pr', {
                method: 'POST',
                headers: {
                    'Requestverificationtoken': requestVerificationToken,
                },
                body: body,
            });
            return response.json();
        }, data, requestVerificationToken);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function uploadImageToApi(page, imageUrl, requestVerificationToken) {
    try{
        const apiResponse = await page.evaluate(async ({ requestVerificationToken, imageUrl }) => {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.blob();
            const formData = new FormData();
            formData.append('file', imageBuffer, 'image.png');

            const response = await fetch("https://morocco.blsportugal.com/MAR/query/UploadProfileImage", {
                method: 'POST',
                body: formData,
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.7',
                    'requestverificationtoken': requestVerificationToken,
                    'x-requested-with': 'XMLHttpRequest'
                },
            });
        return response.json();
        }, { requestVerificationToken, imageUrl });
    
        return apiResponse;
    }
    catch(error){
        console.error('Error:', error);
    }
  }
  