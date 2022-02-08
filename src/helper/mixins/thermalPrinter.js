import printer from 'vue-printer'

let data = {
    data() {
        return {
          printer_off: true
        };
    },
    components: {
        printer
    },
    methods: {
        async handlePrinterThermal() {
        }
    }
}

export default data