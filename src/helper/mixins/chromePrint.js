let chromePrint = {
    data() {
        return {
            msg: `
            Nama Toko                               Toko Levi
            195220106105248412    06 Januari 2022 - 10:54 WIB
            `,
            printCharacteristic: null,
            // isMobile: this.$q.platform.is.mobile
        }
    },
    computed: {
        userAgentType(){
            const matchType = [
                /Android/i,
                /webOS/i,
                /iPhone/i,
                /iPad/i,
                /iPod/i,
                /BlackBerry/i,
                /Windows Phone/i
            ]

            return matchType.some((matchItem) => {
                return navigator.userAgent.match(matchItem)
            })
        },
    },
    methods: {
        async print () {
          navigator.bluetooth
            .requestDevice(
              {
                filters: [
                  {
                    services: ['000018f0-0000-1000-8000-00805f9b34fb'],
                    connectable: true
                  }
                ],
                keepRepeatedDevices: true
              },
              {
                optionalServices: ['00002af1-0000-1000-8000-00805f9b34fb']
              },
            )
            .then(device => {
              // if (device.gatt.connected) {
              //   device.gatt.disconnect()
              // }
              
              return this.connect(device)
            })
            .catch(this.handleError)
        },
        connect (device) {
          const self = this
          device.addEventListener('gattserverdisconnected', this.onDisconnected)
          return device.gatt
            .connect()
            .then(server =>
              server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
            )
            .then(service =>
              service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
            )
            .then(characteristic => {
              self.printCharacteristic = characteristic
              self.sendTextData(device)
            })
            .catch(error => {
              this.handleError(error, device)
            })
        },
        handleError (error, device) {
          console.error('handleError => error', error)
    
          if (device != null) {
            // device.gatt.disconnect()
          }
          let erro = JSON.stringify({
            code: error.code,
            message: error.message,
            name: error.name
          })
    
          console.log('handleError => erro', erro)
          if (error.code !== 8) {
            alert(erro)
          }
        },
        getBytes (text) {
          let br = '\u000A\u000D'
          text = text === undefined ? br : text
          let replaced = this.$replace(text)
          let bytes = new TextEncoder('utf-8').encode(replaced + br)
          
          return bytes
        },
        addText (arrayText) {
          let text = this.msg
          
          arrayText.push(text)
    
          if (this.userAgentType) {
            while (text.length >= 20) {
              let text2 = text.substring(20)
              arrayText.push(text2)
              text = text2
            }
          }
        },
        sendTextData (device) {
          let arrayText = []
    
          this.addText(arrayText)
          this.loop(0, arrayText, device)
        },
        loop (i, arrayText, device) {
          let arrayBytes = this.getBytes(arrayText[i])
    
          this.write(device, arrayBytes, () => {
            i++
            if (i < arrayText.length) {
              
              this.loop(i, arrayText, device)
            
            } else {
              
              let arrayBytes = this.getBytes()
              
              this.write(device, arrayBytes, () => {
                // device.gatt.disconnect()
                console.log('connected')
              })
            
            }
          })
        },
        write (device, array, callback) {
          this.printCharacteristic
            .writeValue(array)
            .then(() => {
              console.log('Printed Array: ' + array.length)
              setTimeout(() => {
                if (callback) {
                  callback()
                }
              }, 250)
            })
            .catch(error => {
              this.handleError(error, device)
            })
        }
      }
}

export default chromePrint;