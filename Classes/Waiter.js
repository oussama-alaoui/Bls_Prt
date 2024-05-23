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
    VerifyVideo
} from "../Config/Api.js";

import { analyzeMotion } from "../Config/video.js";

import { captchaProcess } from "../Config/CaptchaProcess.js";
import { getEmailContent } from "../Config/Otp.js";

export class Waiter extends Parent {
    constructor(object, page, browser) {
        super(object, page, browser);
    }

    async start() {
        this.images = await analyzeMotion()
        await this.Login();
        const slot = await this.VisaType();
        this.path = `https://morocco.blsportugal.com${slot.returnUrl}`;
        await this.Calendar();
        await this.Applicant();
        await this.VideoVerification();
    }

    async Calendar() {
        try{
            await this.page.goto(this.path);
            const {id, captchadata, otpcode, url, scriptContent} = await initScrptData(this.page);
            await requestOtp(this.page, otpcode);
            await new Promise(resolve => setTimeout(resolve, 10000));
            var res = await captchaProcess(this.page, this.browser, 'https://morocco.blsportugal.com'+captchadata, 'login', '/MAR/CaptchaPublic/SubmitCaptcha');
            this.otp = await getEmailContent(this.object.email, new Date());
            console.log("this.otp: ", this.otp);
            await verifyOtp(this.page, scriptContent, this.otp);
            await this.page.$eval('input[name="EmailVerified"]', el => el.value = true);
            const date = await getDate(this.page);
            const slot = await getSlot(this.page, date[0], id);
            const data = await CalendarprepareData(this.page, res.captcha, date[0], slot[0], this.otp);
            const response = await Calendareq(this.page, data);
            if(response.success)
                this.appPath = 'https://morocco.blsportugal.com/MAR/BlsAppointment/vaf/'+url+'?appointmentId='+response.model.Id;
            else
                console.log('Failed to book appointment:', response);
            console.log(url);
            
        } catch (error) {
            console.error('Error:', error);
            this.Calendar();
        }
    }

    async Applicant(){
        try{
            await this.page.goto(this.appPath);
    
            var url = await this.page.evaluate(() => {
                const url = document.querySelector('form').action;
                return url;
            });
            console.log(url);
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
            this.path = `https://morocco.blsportugal.com/MAR/BlsAppointment/vpf${url}?appointmentId=${res.model.Id}`;
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
//     "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryh8qtAzlPz4Slt86N",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin"
//   }
    async VideoVerification(){
        try{
            var id, img;
            await this.page.goto(this.path);
            const id2 = await this.page.$eval('input[name="Id"]', el => el.value);
            this.path = `https://morocco.blsportugal.com/MAR/blsappointment/livenessdetection?appointmentId=${id2}&applicantPhotoId=74a44fc0-57d1-4f11-b797-6b445fd02f06`;
            console.log(this.path);
            await this.page.goto(this.path);
            const ApplicantPhotoId = await this.page.$eval('input[name="ApplicantPhotoId"]', el => el.value);
            const __RequestVerificationToken = await this.page.$eval('input[name="__RequestVerificationToken"]', el => el.value);
            var img1, img2;
            const firstImageReader = new FileReader();
            firstImageReader.readAsArrayBuffer(images.firstImageBlob);
            firstImageReader.onload = () => {
                img1 = firstImageReader.result;
            };
            const secondImageReader = new FileReader();
            secondImageReader.readAsArrayBuffer(images.secondImageBlob);
            secondImageReader.onload = () => {
                img2 = secondImageReader.result;
            };
            const data = {
                Id: id2,
                ApplicantPhotoId: ApplicantPhotoId,
                __RequestVerificationToken: __RequestVerificationToken,
                image1: img1, // Include Base64-encoded image data
                image2: img2, // Include Base64-encoded image data
                cameraLabel: "camera",
                isMobile: false,
                appointmentId: id2,
            };

            const res = await VerifyVideo(this.page, data);
            console.log(res);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
}