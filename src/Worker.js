import { Parent } from "./Parent.js";

export class Worker extends Parent {
    constructor(object, page, browser) {
        super(object, page, browser);
    }

    async start() {
        console.log("start process for WOrker: ", this.object.id);
        await this.Login();
        const slot = await this.VisaType();
        // return slot;
    }
}