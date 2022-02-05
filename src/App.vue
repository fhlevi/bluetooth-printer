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

        return this.connect(device)
      })
      .catch(error => { console.error(error); });
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
    getBytes (text) {
      console.log('text', text)
      let br = '\u000A\u000D'
      text = text === undefined ? br : text
      let replaced = this.$languages.replace(text)
      console.log('replaced', replaced)
      let bytes = new TextEncoder('utf-8').encode(replaced + br)
      console.log('bytes', bytes)
      return bytes
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
    },
    writeStrToCharacteristic (str) {
      let buffer = new ArrayBuffer(str.length);
      let dataView = new DataView(buffer);

      for (var i = 0; i <str.length; i++) {
        dataView.setUint8( i, str.charAt(i).charCodeAt() );
      }

      return this.printCharacteristic.writeValue(buffer);
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
