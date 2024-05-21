import puppeteer from "puppeteer";
import ProxyChain from "proxy-chain";
import { LocationIds, VisaSubTypeIds } from "./Config/DataIds.js";
import { calculateRequestSize, calculateResponseSize } from 'puppeteer-bandwidth-calculator';

// import Class
import { Worker } from "./Classes/Worker.js";
var UserData =     
{
    id:1,
    email: 'zalaoui772@gmail.com',
    password: '382163',
    FirstName: 'OUSSAMA',
    LastName: 'CHRIFI',
    DateOfBirth: '2001-09-28',
    IssueDate: '2024-05-01',
    ExpiryDate: '2030-05-01',
    PlaceOfBirth: 'fez',
    IssuePlace: 'fes',
    PassportNo: 'AB1234567',
    NationalityId: '5e44cd63-68f0-41f2-b708-0eb3bf9f4a72',
    PassportType: '0a152f62-b7b2-49ad-893e-b41b15e2bef3',
    IssueCountryId: '5e44cd63-68f0-41f2-b708-0eb3bf9f4a72',
};

async function initBowser(){
    let totalBytes = 0;
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
        const requestBytes = calculateRequestSize(interceptedRequest);
        totalBytes += requestBytes;
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (['image', 'stylesheet', 'font', 'script'].indexOf(interceptedRequest.resourceType()) !== -1)
            interceptedRequest.abort();
        else {
            interceptedRequest.continue();
        }
    });
    page.on('response', response => {
        const responseBytes = calculateResponseSize(response);
        totalBytes += responseBytes;
    });
    console.log('Total bytes:', totalBytes);
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

async function start(){
    try{
        const { city, visaType, visaSubType } = {city: process.argv[2], visaType: process.argv[3], visaSubType: process.argv[4]};
        const {page, browser} = await initBowser();
        const ids = await getIds(city, visaType, visaSubType);
        
        // Start Worker Process 
        const worker = new Worker({...UserData, ...ids}, page, browser);
        const work_res = await worker.start();

        // Start Waiter Process
        console.log('Waiter Process');
    }
    catch(error){
        console.log('Error in start:', error);
    }
}
start();