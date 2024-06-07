import { captchaProcess } from "../CaptchaService/CaptchaProcess.js";
import { checkSlot } from "./Api.js";
import moment from 'moment';

// Login Helper Functions
export async function GetDataLogin(page) {
const data = {}
console.log('Getting data for login:', moment().format('HH:mm:ss'));
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

export async function prepareData(page, ids, type = 'Ind', FamilyNo = 2) {
    const body = {};
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
                    body[name] = ids.locationId;
                    body.location = name
                }
                else if(name.includes("VisaType")){
                    body[name] = ids.visaTypeId;
                    body.type = name
                }
                else if(name.includes("VisaSubType")){
                    body[name] = ids.visaSubTypeId;
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
    if (type == 'Ind'){
        for (let i = 1; i <= 5; i++)
            body[`AppointmentFor${i}`] = "Individual";
        body.ResponseData.push({"Id":"AppointmentFor1", "Start":"2024-05-14T11:10:52.579Z", "End":"2024-05-14T11:10:53.579Z", "Total":1004});
    }
    else{
        for (let i = 1; i <= 5; i++)
            body[`AppointmentFor${i}`] = "Family";
        for (let i = 1; i <= 5; i++)
            body[`ApplicantsNo${i}`] = FamilyNo;
    }
    body.ResponseData = JSON.stringify(body.ResponseData);
    delete body.appointmentCategoryIdData;
    delete body.category;
    delete body.location;
    delete body.type;
    delete body.subType;
    return body;
}

export async function Slotprocess(page, browser, retry = 0, ids) {
    try {
        for (let i = 0; i < 40; i++) {
            var res = await captchaProcess(page, browser, 'https://morocco.blsportugal.com/MAR/NewCaptcha/GenerateCaptcha', 'verify', '/MAR/NewCaptcha/SubmitCaptcha');
            const url = await getUrl(page, res.cd);
            await page.goto(`https://morocco.blsportugal.com${url.returnUrl}`);
            const slot = await checkSlot(page, url.returnUrl, ids);
            if (slot.available == true) {
                console.log("Slot available");
                return slot;
            }
            console.log("Slot not available: ", i, "Retry in 30 seconds", "data: ", slot);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        return false;
    } catch (error) {
        console.log('Error in Slotprocess:', error);
        throw error; // Rethrow the error to stop further execution
    }
}

// Calendar Helper Functions
export async function getDate(page) {
    try {
        const date = await page.evaluate(async () => {
            var alloweDates = await availDates.ad.filter(x => x.SingleSlotAvailable === true);
            return alloweDates
        });
        return date;
    } catch (error) {
        console.error('Error:', error);
    }

}

async function getAllInput(page, body) {
    try {
        const data = await page.evaluate(async (body) => {
            const data = {};
            document.querySelectorAll('input').forEach((inputElement) => {
                if (inputElement.type === 'hidden') {
                    data[inputElement.name] = inputElement.value;
                }
            })
            return data;
        }, body);
        return data;
    }
    catch (error) {
        console.error('Error:', error);
    }
}

export async function CalendarprepareData(page, captchadata, date, slot, otp, photoId) {
    try {
        var data = await page.evaluate(async (date, slot) => {
            const data = {};
            var divElements = document.querySelectorAll('.col-md-3');
            divElements = Array.from(divElements).filter(function(element) {
                return window.getComputedStyle(element).display === 'block';
            });
            divElements.forEach((divElement) => {
                if (divElement.querySelector('input') === null) {
                    return;
                }
                const inputName = divElement.querySelector('input').name;
                data[inputName] = divElement.querySelector('input').value;
                if(inputName.includes('AppointmentDate'))
                    data[inputName] = date.DateText;
                else if(inputName.includes('AppointmentSlot'))
                    data[inputName] = slot.Name;
            });
            return data;
        }, date, slot);
        data = { ...data, ...await getAllInput(page, data) };
        data.CaptchaData = captchadata;
        data.ApplicantPhotoId = photoId;
        data.ApplicantsNo = 1;
        data.EmailVerificationCode = otp;
        data.ServerAppointmentDate = date.DateText;
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function initScrptData(page) {
    try {
        var id =''
        var captchadata = '';
        var otpcode = '';
        var url = '';
        var scriptContent = await page.evaluate(() => {
            return Array.from(document.scripts).map(script => script.innerHTML);
        });
        scriptContent.forEach(script => {
            if(script.includes("function OnAppointmentdateChange()"))
                id = script.split('OnAppointmentdateChange')[1].split('Id:')[2].split('\n')[0]
        })
        scriptContent.forEach(script => {
            if(script.includes("function VerifyAppointment"))
                captchadata = script.split('win.iframeOpenUrl = \'')[1].split('\';')[0]
        })
        scriptContent.forEach(script => {
            if(script.includes("function RequestCode"))
                otpcode = script.split('/MAR/blsappointment/savc')[1].split('",')[0]
        })
        scriptContent.forEach(script => {
        if(script.includes("onAjaxSuccess = function (res)"))
            url = script.split('vaf/')[1].split('?')[0]
        })
        return {id, captchadata, otpcode, url, scriptContent};
    }
    catch (error) {
        console.error('Error:', error);
    }
}

// Applicant Helper Functions
export async function OnApplicationSubmit(page, UserData) {
    const applicantsCount = await page.evaluate(() => {
        return applicantsCount;
    });

    const ApplicantsData = [];
    for (let j = 0; j < applicantsCount; j++) {
        ApplicantsData[j] = {};
        if (j > 0) {
            ApplicantsData[j]["Relationship"] = await page.$eval(`#Relationship_${j}`, input => input.value);
        }
        ApplicantsData[j]["ApplicantSerialNo"] = (j+1).toString();
        ApplicantsData[j]["FirstName"] = UserData.FirstName;
        ApplicantsData[j]["LastName"] = UserData.LastName;
        ApplicantsData[j]["ServerDateOfBirth"] = moment(UserData.DateOfBirth, 'YYYY-MM-DD').format('YYYY-MM-DD');
        ApplicantsData[j]["PlaceOfBirth"] = UserData.PlaceOfBirth;
        ApplicantsData[j]["NationalityId"] = UserData.NationalityId;
        ApplicantsData[j]["PassportType"] = UserData.PassportType;
        ApplicantsData[j]["PassportNo"] = UserData.PassportNo;
        ApplicantsData[j]["ServerPassportIssueDate"] = moment(UserData.IssueDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
        ApplicantsData[j]["ServerPassportExpiryDate"] = moment(UserData.ExpiryDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
        ApplicantsData[j]["IssuePlace"] = UserData.IssuePlace;
        ApplicantsData[j]["IssueCountryId"] = UserData.IssueCountryId;
        ApplicantsData[j]["ParentId"] = "acc4b680-d317-40b8-b07c-bd8d21f02038";
        ApplicantsData[j]["ApplicantId"] = await page.$eval(`#ApplicantId_${j}`, input => input.value);
        ApplicantsData[j]["Id"] = await page.$eval(`#ApplicantId_${j}`, input => input.value);
    }
    return ApplicantsData;
}

export async function ApplicantprepareData(page) {
    try {
        var data = await page.evaluate(async () => {
            const data = {};
            var divElements = document.querySelectorAll('.col-md-3');
            divElements = Array.from(divElements).filter(function(element) {
                return window.getComputedStyle(element).display === 'block';
            });
            divElements.forEach((divElement) => {
                if (divElement.querySelector('input') === null) {
                    return;
                }
                const inputName = divElement.querySelector('input').name;
                data[inputName] = "";
            });
            return data;
        });
        // data = await setValues(data);
        data = { ...data, ...await getAllInput(page, data) };
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
