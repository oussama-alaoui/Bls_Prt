import puppeteer from "puppeteer";
import ProxyChain from "proxy-chain";
import { LocationIds, VisaSubTypeIds } from "./Config/DataIds.js";

// import Class
import { Worker } from "./Classes/Worker.js";
import { Waiter } from "./Classes/Waiter.js";
var UserData =     
{
    id: 1,
    email: "bls_prt_wrk_00009@schngn.33mail.com",
    counter: 9,
    password: "120345",
    FirstName: "Badr",
    LastName: "Firadi",
    DateOfBirth: "2004-01-03",
    IssueDate: "2024-05-16",
    ExpiryDate: "2029-11-21",
    PlaceOfBirth: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
    IssuePlace: "Tanger",
    PassportNo: "OF4647778",
    NationalityId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
    PassportType: "0a152f62-b7b2-49ad-893e-b41b15e2bef3",
    IssueCountryId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72"
};

async function initBowser(){
    const proxyUrl = 'http://rotating.proxyempire.io:9059';
    const newProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--auto-open-devtools-for-tabs',
            `--proxy-server=${newProxyUrl}`
        ]
    });

    const page = await browser.newPage();
    await page.authenticate({
        username: '8ABBJGFziUOUDIJQ',
        password: 'wifi;ma;;;'
    });
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (['image', 'stylesheet', 'font', 'script'].indexOf(interceptedRequest.resourceType()) !== -1)
            interceptedRequest.abort();
        else {
            interceptedRequest.continue();
        }
    });
    return {page, browser};
}

async function getIds(city, visaType, visaSubType){
    try{
        const location = LocationIds.find(x => x.Code === city);
        if(!location) throw new Error('City not found');
        const visaTypeId = location.VisaTypeIds.find(x => x.code === visaType);
        if(!visaTypeId) throw new Error('Visa Type not found');
        const visaSubTypeId = VisaSubTypeIds.find(x => x.Name === visaSubType);
        if(!visaSubTypeId) throw new Error('Visa Sub Type not found');
        return {
            locationId: location.Id,
            visaTypeId: visaTypeId.id,
            visaSubTypeId: visaSubTypeId.Id
        };
    }
    catch(error){
        console.log('Error in getIds:', error);
    }
}

async function start() {
    const city = process.argv[2];
    const visaType = process.argv[3];
    const visaSubType = process.argv[4];
    const ids = await getIds(city, visaType, visaSubType);
    try {
        if (process.argv.length < 5) {
            throw new Error('Insufficient command line arguments. Please provide city, visaType, and visaSubType.');
        }
        // const { page, browser } = await initBowser();
        // const worker = new Worker({ ...UserData, ...ids }, page, browser);
        // await worker.start();
    } catch (error) {
        console.log('Error in start:', error);
    }finally {
        try {
            // Create a new waiter
            const { page, browser } = await initBowser();
            const waiter = new Waiter({ ...UserData, ...ids }, page, browser);
            await waiter.start();
        } catch (error) {
            console.log('Error in finally block:', error);
        }
    }
}

start();
