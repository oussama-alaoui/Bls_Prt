import { Parent } from "./Parent.js";
import { initScrptData, 
    getDate, 
    CalendarprepareData, 
    OnApplicationSubmit, 
    ApplicantprepareData,
} from "../Config/Tools.js";

import { requestOtp, 
    verifyOtp, 
    getSlot, 
    Calendareq, 
    Applicantreq,
    VerifyVideo,
    reqPr
} from "../Config/Api.js";

import { captchaProcess } from "../Config/CaptchaProcess.js";
import { getEmailContent } from "../Config/Otp.js";

export class Waiter extends Parent {
    constructor(object, page, browser, page2) {
        super(object, page, browser, page2);
    }

    async start() {
        // this.images = await analyzeMotion()
        // console.log("this.images: ", this.images);
        await this.Login();
        const slot = await this.VisaType();
        this.path = `https://morocco.blsportugal.com${slot.returnUrl}`;
        await this.Calendar();
        await this.Applicant();
        await this.VideoVerification();
        // return await this.getCmiLink();
    }

    async Calendar() {
        try{
            await this.page.goto(this.path);
            // return;
            const {id, captchadata, otpcode, url, scriptContent} = await initScrptData(this.page);
            await requestOtp(this.page, otpcode);
            this.id1 = await this.page.$eval('input[name="Id1"]', el => el.value);
            await new Promise(resolve => setTimeout(resolve, 10000));
            var res = await captchaProcess(this.page, this.browser, 'https://morocco.blsportugal.com'+captchadata, 'login', '/MAR/CaptchaPublic/SubmitCaptcha');
            this.otp = await getEmailContent(this.object.email, new Date());
            await verifyOtp(this.page, scriptContent, this.otp);
            await this.page.$eval('input[name="EmailVerified"]', el => el.value = true);
            const date = await getDate(this.page);
            var random = Math.floor(Math.random() * date.length);
            const slot = await getSlot(this.page, date[random], id);
            const data = await CalendarprepareData(this.page, res.captcha, date[random], slot[0], this.otp);
            const response = await Calendareq(this.page, data);
            if(response.success)
                this.appPath = 'https://morocco.blsportugal.com/MAR/BlsAppointment/vaf/'+url+'?appointmentId='+response.model.Id;
            else
                console.log('Failed to book appointment:', response);
            console.log(url);
            
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async Applicant(){
        try{
            await this.page.goto(this.appPath);
    
            var url = await this.page.evaluate(() => {
                const url = document.querySelector('form').action;
                return url;
            });
            this.requestVerificationToken = await this.page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
            var data = await ApplicantprepareData(this.page);
            var applications = await OnApplicationSubmit(this.page, this.object);
            data.ApplicantsDetailsList = JSON.stringify(applications);
            data.VisaType = '084cd40f-c448-475e-8873-6b5eff2e01bf'
            data.VisaSubTypeId = 'e70cc749-5b1e-457f-b664-f27a05082aaf'
            data.MissionId = '98a73e17-bf8f-41f2-933e-03e60b009327'
            const res = await Applicantreq(this.page, data, url);
            var scriptContent = await this.page.evaluate(() => {
                return Array.from(document.scripts).map(script => script.innerHTML);
            });
            url = scriptContent.join().split('vpf')[1].split('?')[0];
            this.pathvideo = `https://morocco.blsportugal.com/MAR/BlsAppointment/vpf${url}?appointmentId=${res.model.Id}`;
        }
        catch (error) {
            console.error('Error:', error);
        }
    }

    async VideoVerification(){
        try{
            await this.page.goto(this.pathvideo);
            const id2 = await this.page.$eval('input[name="Id"]', el => el.value);
            this.pathvideo = `https://morocco.blsportugal.com/MAR/blsappointment/livenessdetection?appointmentId=${id2}&applicantPhotoId=84f694a0-a209-4cf4-844e-341b362274a3`;
            console.log(this.pathvideo);
            var serviceId = await this.page.evaluate(() => {
                return document.querySelectorAll('.vac-check')[8].id.slice(4)
            })
            console.log("this.pathvideo: ", this.pathvideo);
            await this.page2.goto(this.pathvideo);

            
            const __RequestVerificationToken = await this.page2.$eval('input[name="__RequestVerificationToken"]', el => el.value);
            const ApplicantPhotoId = await this.page2.$eval('input[name="ApplicantPhotoId"]', el => el.value);

            var data = {
                Id: id2,
                ApplicantPhotoId: ApplicantPhotoId,
                __RequestVerificationToken: __RequestVerificationToken,
                appointmentId: id2,
            };
            var res = await VerifyVideo(this.page2, data);
            const script = await this.page.evaluate(() => {
                const script = Array.from(document.scripts).map(script => script.innerHTML)
                return script[0].split('Id1')[1].split(':')[1].split('"')[0].split('}')[0].replace('\'', '').replace('\'', '')
            });
            console.log("script: ", res);
            return {
                fullname: this.object.FirstName + ' ' + this.object.LastName,
                url: `https://morocco.blsportugal.com${res.requestURL}`
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
    
    async getCmiLink(){
        try{
            await this.page.goto(this.path);
            const cmiLink = await this.page.evaluate(() => {
                const data = {
                    clientid: document.querySelector('input[name="clientid"]').value,
                    amount: document.querySelector('input[name="amount"]').value,
                    okUrl: document.querySelector('input[name="okUrl"]').value,
                    failUrl: document.querySelector('input[name="failUrl"]').value,
                    TranType: document.querySelector('input[name="TranType"]').value,
                    callbackUrl: document.querySelector('input[name="callbackUrl"]').value,
                    currency: document.querySelector('input[name="currency"]').value,
                    storetype: document.querySelector('input[name="storetype"]').value, 
                    hashAlgorithm: document.querySelector('input[name="hashAlgorithm"]').value,
                    lang: document.querySelector('input[name="lang"]').value,
                    BillToName: document.querySelector('input[name="BillToName"]').value,
                    BillToCompany: document.querySelector('input[name="BillToCompany"]').value,
                    email: document.querySelector('input[name="email"]').value,
                    encoding: document.querySelector('input[name="encoding"]').value,
                    AutoRedirect: document.querySelector('input[name="AutoRedirect"]').value,
                    hash: document.querySelector('input[name="hash"]').value,
                    oid: document.querySelector('input[name="oid"]').value,
                    rnd: document.querySelector('input[name="rnd"]').value,
                }
                return {url: document.querySelector('form').action, data};
            });
            
            
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
}