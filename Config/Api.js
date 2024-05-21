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
           return await Login_V2(page, browser, UserData);
       }
       return login;
    } catch (error) {
        console.error('Error:', error);
    }
}

export async function checkSlot(page, url) {
    const body = await prepareData(page);
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