import { prepareData } from "./Tools.js";
import { exec } from 'child_process';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs'

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
        console.log(response);
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
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function VerifyVideo(page, formData) {
    try {
      const response = await page.evaluate(async (formData) => {
        // Convert buffer data to Blob
        const image2res = await fetch("https://i.postimg.cc/8PRHYFph/image2.png");
        const image1res = await fetch("https://i.postimg.cc/T2HQm8kD/image1.png");
        const image1Blob = await image1res.blob();
        const image2Blob = await image2res.blob();
        console.log('Blob created for image1:', image1Blob);
        console.log('Blob created for image2:', image2Blob);
        const formDataWithBlobs = new FormData();
        formDataWithBlobs.append('Id', formData.Id);
        formDataWithBlobs.append('ApplicantPhotoId', formData.ApplicantPhotoId);
        formDataWithBlobs.append('__RequestVerificationToken', formData.__RequestVerificationToken);
        formDataWithBlobs.append('image1', image1Blob); // Append Blob directly
        formDataWithBlobs.append('image2', image2Blob); // Append Blob directly
        formDataWithBlobs.append('cameraLabel', "camera");
        formDataWithBlobs.append('isMobile', false);
        formDataWithBlobs.append('appointmentId', formData.appointmentId);
        const response = await fetch("https://morocco.blsportugal.com/MAR/blsappointment/SubmitLivenessDetection", {
            method: "POST",
            headers: {
              "accept": "*/*",
              "accept-language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3",
            //   "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryj4SRqaYcL4gLccPY",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Linux\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin"
            },
            body: formDataWithBlobs,
            mode: "cors",
            // referrer: "https://morocco.blsportugal.com/MAR/blsappointment/livenessdetection?appointmentId=a342d5d2-911d-48cb-8ef0-aca13d90656b&applicantPhotoId=f6da4d9d-3b20-47c3-83a1-be5cb7c1ba2f",
            referrerPolicy: "strict-origin-when-cross-origin"
        });
        return response.text();
      }, formData);
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  