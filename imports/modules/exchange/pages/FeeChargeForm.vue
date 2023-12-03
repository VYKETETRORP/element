<template>
  <el-dialog
    v-model="dialogVisible"
    title="Fee"
    width="90%"
  >
    <el-form
      ref="refForm"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
        >
          <el-form-item
            label="Date"
            prop="tranDate"
          >
            <el-date-picker
              v-model="form.tranDate"
              type="date"
              placeholder="Select date"
            />
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
        >
          <el-form-item
            label="Type"
            prop="tranType"
          >
            <el-radio-group v-model="form.tranType">
              <el-radio
                v-for="(it, key) of typeOpts"
                :key="key"
                :label="it.value"
                border
              >
                {{ it.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
        >
          <el-form-item
            label="Fee Type"
            prop="feeType"
          >
            <el-radio-group v-model="form.feeType">
              <el-radio
                v-for="(it, key) of feeTypeOpts"
                :key="key"
                :label="it.value"
                border
              >
                {{ it.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <component
        :is="currentComponent"
        :details="initDetails"
        style="margin-top: -20px"
        @details-change="handleDetailsChange"
      />
    </el-form>
    <template #footer>
      <span>
        <el-button
          type="primary"
          @click="submit"
        >
          Save
        </el-button>
        <el-button
          v-if="showId"
          type="danger"
          @click="remove"
        >
          Remove
        </el-button>
        <el-button @click="handleClosed">Cancel</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script
  lang="ts"
  setup
>
import useMethod from '/imports/client/composables/useMethod'
import { useStore } from '/imports/store'
import {
  markRaw,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  nextTick,
} from 'vue'

import {
  ElDialog,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElDatePicker,
  FormInstance,
  FormRules,
} from 'element-plus'
import moment from 'moment'

const store = useStore()

const props = defineProps<{
  visible: boolean
  showId: string
}>()

const dialogVisible = computed(() => {
  return props.visible
})

const initDetails = ref<any[]>([])
const itemDetails = ref<any[]>([])
// opts
const typeOpts = [
  { value: 'In', label: 'In' },
  { value: 'Out', label: 'Out' },
]
const feeTypeOpts = [
  { value: 'OwnFee', label: 'Own Fee' },
  { value: 'BrokerFee', label: 'Broker Fee' },
]

// Form
const currentComponent = ref<any>('')
const loading = ref<boolean>(false)
const refForm = ref<FormInstance>()
const form = ref<any>({
  tranDate: moment().toDate(),
  feeType: 'OwnFee',
  tranType: 'In',
})
const rules = ref<FormRules>({
  tranDate: [
    { required: true, message: 'date is required.', trigger: 'change' },
  ],
  tranType: [
    {
      required: true,
      message: 'Transaction Type is required.',
      trigger: 'change',
    },
  ],
  feeType: [
    { required: true, message: 'Fee Type is required.', trigger: 'change' },
  ],
})

const emit = defineEmits<{
  (e: 'closed', value: boolean): void
}>()

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const getData = () => {
  loading.value = true
  const { call } = useMethod('ex.getFeeChargeById', {})
  setTimeout(() => {
    call({ id: props.showId })
      .then((res: any) => {
        if (res) {
          form.value = res.data
          nextTick(() => {
            initDetails.value = res.details
          })
        }

        loading.value = false
      })
      .catch((err: any) => {
        loading.value = false
        store.dispatch('app/messageE', err.reason || err)
      })
  })
}

const handleDetailsChange = (items: any[]) => {
  itemDetails.value = items
}
const submit = async () => {
  if (!refForm.value) return false

  loading.value = true
  const valid = await refForm.value.validate()

  if (!itemDetails.value.length) {
    store.dispatch('app/messageW', `Check item details again.`)
    loading.value = false
    return false
  }

  if (valid) {
    let methodName = 'ex.insertFeeCharge'
    if (props.showId) methodName = 'ex.updateFeeCharge'
    const { call } = useMethod(methodName, '')
    form.value.branchId = currentBranchId.value
    call({ doc: form.value, details: itemDetails.value })
      .then((res) => {
        if (res) {
          store.dispatch('app/messageS', 'Success')
          handleClosed()
        }
        loading.value = false
      })
      .catch((err: any) => {
        loading.value = false
        store.dispatch('app/messageE', err.reason || err)
      })
  }
}

const remove = () => {
  loading.value = true
  store
    .dispatch('app/confirm', {
      messageType: 'Delete',
      item: 'record',
    })
    .then(() => {
      const { call } = useMethod('ex.removeFeeCharge', '')
      call({ id: props.showId })
        .then(() => {
          store.dispatch('app/messageS', 'Successfully removed')
          handleClosed()
          loading.value = false
        })
        .catch((err) => {
          store.dispatch('app/messageE', err.reason || err)
          loading.value = false
        })
    })
    .catch((err) => {
      store.dispatch('app/messageE', err.reason || err)
      loading.value = false
    })
}

const handleClosed = () => {
  emit('closed', false)
}

onMounted(() => {
  if (props.showId) getData()
  currentComponent.value = markRaw(
    defineAsyncComponent(() => import('../components/FeeChargeDetails.vue'))
  )
})

onUnmounted(() => {
  currentComponent.value = null
})
</script>
