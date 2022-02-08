<template>
  <div class="flex flex-center">
    <div >
      <div class="text-center q-mt-md">
        <button color="primary" class="full-width" @click="print()">Print</button>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import thermalPrinter from './helper/mixins/thermalPrinter';
import chromePrint from './helper/mixins/chromePrint';

export default {
  name: 'PageIndex',
  mixins: [
    thermalPrinter,
    chromePrint
  ]
}
</script>
