import 
    {
        SubmitCaptcha,
        GetDataLogin,
        Slotprocess
    } from "./Tools.js";
import { SolveCaptcha } from "../CaptchaService/BaypassCaptcha.js";
import { login_request } from "./Api.js";

export class Parent {
    constructor(object, page, browser, page2) {
        this.object = object;
        this.page = page;
        this.browser = browser;
        this.page2 = page2;
    }

    Login = async () => {
        try {
            await this.page.goto('https://morocco.blsportugal.com/MAR/account/login');
            const data = await GetDataLogin(this.page);

            var captchaId = ''
            const scriptContent = await this.page.evaluate(() => {
                return Array.from(document.scripts).map(script => script.innerHTML);
            });
            scriptContent.forEach(script => {
                if (script.includes("/MAR/CaptchaPublic/GenerateCaptcha"))
                    script.split('\n').forEach(line => {
                        if (line.includes("/MAR/CaptchaPublic/GenerateCaptcha"))
                            captchaId = line.split('data=')[1]
                    })
            })
            var result = await SolveCaptcha(`https://morocco.blsportugal.com/MAR/CaptchaPublic/GenerateCaptcha?data=${captchaId.slice(0, -2)}`, this.browser, 'login');
            var res = await SubmitCaptcha(this.page, result.result, result.captcha, result.id, "https://morocco.blsportugal.com/MAR/CaptchaPublic/SubmitCaptcha");
            if (res.success === false)
                return await this.Login(this.page, this.browser, this.object);
            await login_request(this.page, data, res.captcha, this.object);
            // await getEmailContent(this.object.email, "url", this.page);
            console.log("Login success for user: ", this.object.id);
        }
        catch (error) {
            console.error('Error:', error);
            this.Login(this.page, this.browser, this.object);
        }
    }

    VisaType = async () => {
        try {
            await this.page.goto('https://morocco.blsportugal.com/MAR/bls/vtv0001');
            const slot = await Slotprocess(this.page, this.browser, 0, this.object);
            return slot;
        }
        catch (error) {
            console.log('Error in VisaType:', error);
            this.VisaType(this.page, this.browser);
        }
    }
}
