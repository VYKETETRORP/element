<template>
  <div>DEMO</div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import BarcodeScanner from '/imports/client/lib/barcode-scanner'

const onScanBarcode = (barcode: string) => {
  console.log('barcode :', barcode)
}

const barcodeScanner = BarcodeScanner(onScanBarcode) // for more config option add second parameter

onUnmounted(() => {
  barcodeScanner.destroy()
})
</script>
