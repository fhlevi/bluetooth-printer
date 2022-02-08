import { Model } from 'escpos-buffer'

let data = {
    methods: {
        async handlePrinterThermal() {
            const model = new Model('MP-4200 TH')
            console.log("🚀 ~ file: thermalPrinter.js ~ line 7 ~ handlePrinterThermal ~ model", model)
        }
    }
}

export default data