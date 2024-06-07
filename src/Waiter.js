import { Parent } from "./Parent.js";
import { initScrptData, 
    getDate, 
    CalendarprepareData, 
    OnApplicationSubmit, 
    ApplicantprepareData,
} from "./Tools.js";

import { requestOtp, 
    verifyOtp, 
    getSlot, 
    Calendareq, 
    Applicantreq,
    VerifyVideo,
    reqPr,
    uploadImageToApi
} from "./Api.js";

import { captchaProcess } from "../CaptchaService/CaptchaProcess.js";
import { getEmailContent } from "./Otp.js";

export class Waiter extends Parent {
    constructor(object, page, browser, page2) {
        super(object, page, browser, page2);
    }

    async start() {
        await this.Login();
        const slot = await this.VisaType();
        this.path = `https://morocco.blsportugal.com${slot.returnUrl}`;
        await this.Calendar();
        // await this.Applicant();
        // const result = await this.VideoVerification();
        // return result;
    }

    async Calendar() {
        try{
            await this.page.goto(this.path);
            const {id, captchadata, otpcode, url, scriptContent} = await initScrptData(this.page);
            await requestOtp(this.page, otpcode);
            this.id1 = await this.page.$eval('input[name="Id1"]', el => el.value);
            const requestVerificationToken = await this.page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
            this.PhotId = await uploadImageToApi(this.page, this.object.applicantPhotoId, requestVerificationToken);
            await new Promise(resolve => setTimeout(resolve, 10000));
            var res = await captchaProcess(this.page, this.browser, 'https://morocco.blsportugal.com'+captchadata, 'login', '/MAR/CaptchaPublic/SubmitCaptcha');
            this.otp = await getEmailContent(this.object.email, new Date());
            await verifyOtp(this.page, scriptContent, this.otp);
            await this.page.$eval('input[name="EmailVerified"]', el => el.value = true);
            const date = await getDate(this.page);
            var random = Math.floor(Math.random() * date.length);
            const slot = await getSlot(this.page, date[random], id);
            const data = await CalendarprepareData(this.page, res.captcha, date[random], slot[0], this.otp, this.PhotId.fileId);
            // const response = await Calendareq(this.page, data);
            // if(response.success)
            //     this.appPath = 'https://morocco.blsportugal.com/MAR/BlsAppointment/vaf/'+url+'?appointmentId='+response.model.Id;
            // else
            //     console.log('Failed to book appointment:', response);
            console.log("finished calendar");
            
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
            this.pathvideo = `https://morocco.blsportugal.com/MAR/blsappointment/livenessdetection?appointmentId=${id2}&applicantPhotoId=${this.PhotId.fileId}`;
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
            var res = await VerifyVideo(this.page2, data, [this.object.image2, this.object.image1]);
            const script = await this.page.evaluate(() => {
                const script = Array.from(document.scripts).map(script => script.innerHTML)
                return script[0].split('Id1')[1].split(':')[1].split('"')[0].split('}')[0].replace('\'', '').replace('\'', '')
            });
            data = {
                Id1: script,
                ValueAddedServices: `${serviceId}_1`,
                Id: id2,
            }
            res = await reqPr(this.page, data, this.requestVerificationToken);
            if(res.success)
                return {
                    fullname: this.object.FirstName + ' ' + this.object.LastName,
                    url: `https://morocco.blsportugal.com${res.requestURL}`
                }
            else
                return {
                    fullname: this.object.FirstName + ' ' + this.object.LastName,
                    url: 'Failed to book appointment'
                }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
}