<template>
  <div id="app">
    <button @click="connectBluetooth">Haloooo</button>
    <hello-world></hello-world>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    'hello-world': () => import('./components/HelloWorld.vue')
  },
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

        return this.connect(device);
      })
      .catch(error => { 
        this.handleError(error) 
      });
    },
    connect (device) {
      const self = this
      return device.gatt
        .connect()
        .then(server =>
          server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
        )
        .then(service =>
          service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')
        )
        .then(characteristic => {
          console.log('characteristic', characteristic)
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
