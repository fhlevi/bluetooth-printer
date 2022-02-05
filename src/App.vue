<template>
  <div id="app">
    <button @click="connectBluetooth">Haloooo</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return {
      printCharacteristic : null,
      zpl : "Hallo Bagus"
    }
  },
  methods: {
    connectBluetooth(){
      navigator.bluetooth.requestDevice({
        filters: [{
                services: ['000018f0-0000-1000-8000-00805f9b34fb']
              }]
      })
      .then(device => {

        if (device.gatt.connected) {
            device.gatt.disconnect()
          }
          
        return device.gatt.connect();
      })
      .then(server => server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"))
      .then(service => service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"))
      .then(characteristic => {
        console.log('Characteristic', characteristic);
        // Cache the characteristic
        this.printCharacteristic = characteristic;
        // this.sendTextData()

        // comment code di bawah ini jika ingin menggunakan this.sendTextData
        var maxChunk = 300;
        var j = 0;

        if ( this.zpl.length > maxChunk ) {
          for ( var i = 0; i < this.zpl.length; i += maxChunk ) {
            var subStr;
            if ( i + maxChunk <= this.zpl.length ) {
              subStr = this.zpl.substring(i, i + maxChunk);

            } else {
              subStr = this.zpl.substring(i, this.zpl.length);
            }

            setTimeout(this.writeStrToCharacteristic, 250 * j, subStr);
            j++;
          }
        } else {
          this.writeStrToCharacteristic(this.zpl);
        }


      })
      .catch(error => { console.error(error); });
    },
    handleError (error, device) {
      console.error('handleError => error', error)
      if (device != null) {
        device.gatt.disconnect()
      }
      let erro = JSON.stringify({
        code: error.code,
        message: error.message,
        name: error.name
      })

      console.log('handleError => erro', erro)
      if (error.code !== 8) {
        alert('Could not connect with the printer. Try it again')
      }
    },
    addText (arrayText) {
      let text = this.zpl
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
      console.log('sendTextData => arrayText', arrayText)
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
            device.gatt.disconnect()
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
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
