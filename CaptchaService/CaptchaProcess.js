import { SolveCaptcha } from "../CaptchaService/BaypassCaptcha.js";

async function submitCaptcha(page, images, captcha, id, path) {
    try {
      const requestVerificationToken = await page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
      const body = { SelectedImages: images.toString(), Id: id, __RequestVerificationToken: requestVerificationToken };
      if(captcha)
        body.Captcha = captcha;
      const submit = await page.evaluate(async (body, path) => {
        const res = await fetch("https://morocco.blsportugal.com"+path, {
          method: 'POST',
          headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.5",
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
          throw new Error(`Unexpected response status: ${res.status}`);
        }
        return await res.json();
      }, body, path);
      return submit;
    } catch (error) {
      console.error('Error:', error);
    }
}

export async function captchaProcess(page, browser, url, type, path) {
    try {
        const result = await SolveCaptcha(url, browser, type);
        const res = await submitCaptcha(page, result.result, result.captcha, result.id, path);
        if(res.success)
            return res;
        else
        {
            console.log("Captcha failed, retrying...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await captchaProcess(page, browser, url, type, path);
        }
    } catch (error) {
        console.log('Error in captchaProcess:', error);
    }
}
