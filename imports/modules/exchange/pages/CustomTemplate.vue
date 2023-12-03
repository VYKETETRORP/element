<script
  lang="ts"
  setup
>
import { computed, onMounted, ref } from 'vue'
import useMethod from '/imports/client/composables/useMethod.ts'
import { useStore } from '/imports/store'

import ExchangeInvoice from '../reports/exchangeInvoice.vue'
import CustomTemplateForm from './CustomTemplateForm.vue'

const store = useStore()

const visiblePrintInvoice = ref(true)
const dialogVisible = ref(false)

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const getCustomTemplate = () => {
  const { call } = useMethod('ex.findCustomTemplate', null)
  call({
    selector: {
      branchId: currentBranchId.value,
    },
  })
    .then((result: any) => {
      if (result) {
        store.dispatch('exchange/updateContents', result.contents)
        store.dispatch('exchange/updateHeaders', result.headers)
        store.dispatch('exchange/updateFooters', result.footers)
      }
    })
    .catch((error: any) => {
      console.log(error)
      store.dispatch('app/messageE', error)
    })
}

const showDialog = () => {
  dialogVisible.value = true
}
const closeDialog = (value: boolean) => {
  dialogVisible.value = value
}

onMounted(() => {
  getCustomTemplate()
})
</script>

<template>
  <div>
    <el-button
      type="primary"
      @click="showDialog"
    >
      <template #icon>
        <i class="fal fa-edit"></i>
      </template>
      Edit
    </el-button>
    <CustomTemplateForm
      :dialog-visible="dialogVisible"
      @closed="closeDialog"
    />

    <ExchangeInvoice :visible-print-invoice="visiblePrintInvoice" />
  </div>
</template>
<style></style>
