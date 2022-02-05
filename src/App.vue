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
    sendPrinterData() {
          // Print an image followed by the text
      this.writeStrToCharacteristic('Halo Bagus')
      .then(result => {
        console.log('PRINT SUCCESS', result)
      })
      .catch(this.handleError);
    },
    sendTextData() {
      // Get the bytes for the text
      let encoder = new TextEncoder("utf-8");
      // Add line feed + carriage return chars to text
      let text = encoder.encode('Halo' + '\u000A\u000D');
      console.log('text',text)
      return this.printCharacteristic.writeValueWithoutResponse(text).then(() => {
        console.log('Write done.');
      });
    },
    writeStrToCharacteristic (str) {
      let buffer = new ArrayBuffer(str.length);
      let dataView = new DataView(buffer);
      for (var i = 0; i < str.length; i++) {
        dataView.setUint8( i, str.charAt(i).charCodeAt() );
      }
      console.log('accessing the device');
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
