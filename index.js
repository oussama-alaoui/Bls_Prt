import puppeteer from "puppeteer";
import ProxyChain from "proxy-chain";
import { LocationIds, VisaSubTypeIds } from "./Config/DataIds.js";

// import Class
import { Worker } from "./Classes/Worker.js";
import { Waiter } from "./Classes/Waiter.js";

// import Data worker and waiter
import { waiters } from "./waiters.js";
import { Workers } from "./workers.js";

async function initBowser(index = 0){
    console.log('Initiating browser:', index);
    const proxyUrl = `http://rotating.proxyempire.io:${9059+index}`;
    const newProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--auto-open-devtools-for-tabs',
            `--proxy-server=${newProxyUrl}`
        ]
    });

    const page = await browser.newPage();
    const page2 = await browser.newPage();
    await page.authenticate({
        username: '8ABBJGFziUOUDIJQ',
        password: 'wifi;ma;;;'
    });
    await page2.authenticate({
        username: '8ABBJGFziUOUDIJQ',
        password: 'wifi;ma;;;'
    });
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (['stylesheet', 'font', 'script', 'image'].indexOf(interceptedRequest.resourceType()) !== -1)
            interceptedRequest.abort();
        else {
            interceptedRequest.continue();
        }
    });
    await page2.setRequestInterception(true);
    page2.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (['stylesheet', 'font', 'script', 'image', 'video'].indexOf(interceptedRequest.resourceType()) !== -1)
            interceptedRequest.abort();
        else {
            interceptedRequest.continue();
        }
    });
    return {page, browser, page2};
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

async function runWaiter(waiters, ids, index){
    try {
        console.log('Waiter started:', waiters.id);
        const { page, browser, page2 } = await initBowser(index+200);
        const waiter = new Waiter({ ...waiters, ...ids }, page, browser, page2);
        const result = await waiter.start();
        console.log('Waiter task completed for id:', waiters.id, result);
    } catch (error) {
        console.log('Error in runWaiter:', error);
    }
}

async function runWorker(worker, ids, index){
    try {
        const { page, browser } = await initBowser(index+Math.floor(Math.random()*200));
        const newWorker = new Worker({ ...worker[index], ...ids }, page, browser);
        const result = await newWorker.start();
        if(!result)
            return await runWorker(worker, ids, index+1);
        console.log('Worker find slot successfully');
    } catch (error) {
        console.log('Error in runWorker:', error);
    }
}

async function start() {
    if (process.argv.length < 5)
        throw new Error('Insufficient command line arguments. Please provide city, visaType, and visaSubType.');
    const city = process.argv[2];
    const visaType = process.argv[3];
    const visaSubType = process.argv[4];
    const ids = await getIds(city, visaType, visaSubType);
    const waitersFiltre = waiters.filter(x => x.center.toLowerCase().includes(city.toLowerCase()) && x.visaSubType.toLowerCase().includes(visaSubType.toLowerCase()));
    try {
        // await runWorker(Workers, ids, 0);
        waitersFiltre.forEach(async (waiter, index) => {
            await runWaiter(waiter, ids, index);
        });
    } catch (error) {
        console.log('Error in start:', error);
    }
}


start();