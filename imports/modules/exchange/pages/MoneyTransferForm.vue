<template>
  <el-dialog
    v-model="visibleDialog"
    title="Money Transfer"
    width="90%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClosed"
  >
    <el-form
      ref="refForm"
      v-loading="loading.form"
      :model="form"
      :rules="rules"
      label-position="top"
    >
      <el-row :gutter="20">
        <el-col :span="16">
          <el-row :gutter="20">
            <el-col
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="12"
            >
              <el-form-item
                label="Tran Date"
                prop="tranDate"
              >
                <el-date-picker
                  v-model="form.tranDate"
                  style="width: 100%"
                  :clearable="false"
                  type="date"
                  placeholder="Select date"
                />
              </el-form-item>

              <el-form-item
                label="Customer"
                prop="customerId"
              >
                <el-select
                  v-model="form.customerId"
                  placeholder="Select customer"
                  style="width: 100%"
                  clearable
                  filterable
                  :loading="loading.customer"
                  :remote-method="remoteMethod"
                  remote
                >
                  <el-option
                    v-for="item in customerOpts"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :xs="24"
              :sm="24"
              :md="12"
              :lg="12"
              :xl="12"
            >
              <el-form-item
                label="Transfer Date"
                prop="transferDate"
              >
                <el-date-picker
                  v-model="form.transferDate"
                  :clearable="false"
                  type="date"
                  style="width: 100%"
                  placeholder="Select date"
                />
              </el-form-item>
              <el-form-item
                label="Employee"
                prop="employeeId"
              >
                <el-select
                  v-model="form.employeeId"
                  placeholder="Select employee"
                  style="width: 100%"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in employeeOpts"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="Tran Type"
                prop="tranType"
              >
                <el-radio-group v-model="form.tranType">
                  <el-radio
                    v-for="(it, key) in tranTypeOpts"
                    :key="key"
                    border
                    :label="it.label"
                  >
                    {{ it.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Currencies"
                prop="currencyId"
              >
                <el-radio-group v-model="form.currencyId">
                  <el-radio-button
                    v-for="(it, key) in currencyOpts"
                    :key="key"
                    :label="it._id"
                  >
                    {{ it.name }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item
                label="Amount"
                prop="amount"
              >
                <el-input-number
                  v-model="form.amount"
                  size="large"
                  style="width: 100%"
                  label=""
                  :min="0"
                  :controls="false"
                  @change="handleAmountChange"
                  @focus="$event.target.select()"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Fee">
                <el-input-number
                  v-model="form.fee"
                  size="large"
                  style="width: 100%"
                  label=""
                  :min="0"
                  :controls="false"
                  @focus="$event.target.select()"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item
                :label="$t('exchange.tableLabel.refNo')"
                prop="refNo"
              >
                <el-input v-model="form.refNo">
                  <template #append>
                    <el-button @click="_getNextRefNum">
                      <template #icon>
                        <i class="fa fa-barcode" />
                      </template>
                    </el-button>
                  </template>
                  <template #prepend>
                    {{ prefix }}
                  </template>
                </el-input>
              </el-form-item>
              <fieldset class="ra-fieldset">
                <legend>Info</legend>
                <el-table
                  height="200"
                  :data="ownerDataInfo"
                >
                  <template #empty>
                    <el-empty
                      style="margin: 0px; line-height: 0px"
                      :image-size="50"
                    />
                  </template>
                  <el-table-column
                    v-for="(it, key) in columns"
                    :key="key"
                    :label="it.title"
                    :prop="it.prop"
                  >
                    <template #default="scope">
                      <span v-if="it.prop === 'fee'">
                        {{ $filters.number(scope.row.fee) }}
                      </span>
                      <span v-else>
                        {{ scope.row.label }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </fieldset>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span>
        <el-button
          v-if="
            $userIsInRole(['money-transfer-insert', 'money-transfer-update'])
          "
          type="primary"
          @click="submit()"
        >
          Save
        </el-button>
        <el-button
          v-if="!showId && $userIsInRole(['money-transfer-insert'])"
          type="primary"
          @click="submit(true)"
        >
          Save & New
        </el-button>
        <el-button
          v-if="showId && $userIsInRole(['money-transfer-remove'])"
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

import { lookupEmployeeMapping } from '../../../api/lookups/employee'
import { useStore } from '/imports/store'
import { clone } from 'lodash'
// import { useI18n } from 'vue-i18n'
import {
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElInputNumber,
  ElDatePicker,
  ElDialog,
  ElRadioGroup,
  ElRadio,
  ElSelect,
  FormInstance,
  FormRules,
} from 'element-plus'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import moment from 'moment'
import { pick, cloneDeep } from 'lodash'

const store = useStore()
// const { t } = useI18n()

type FormInput = {
  _id?: string
  refNo: string
  tranDate: Date
  transferDate: Date
  customerId: string
  employeeId: string
  tranType: 'In' | 'Out'
  currencyId: string
  amount: number
  fee: number
  brokerFee: number
  branchId: string
}

const props = defineProps<{
  visible: boolean
  showId: string
}>()

const emits = defineEmits<{
  (e: 'closed', value: boolean): void
}>()

const visibleDialog = computed(() => {
  return props.visible
})

const columns = [
  {
    title: 'Amount',
    prop: 'label',
  },
  {
    title: 'Fee',
    prop: 'fee',
  },
]
const ownerDataInfo = ref<any[]>([])
const brokerDataInfo = ref<any[]>([])

const tranTypeOpts = [
  {
    label: 'In',
    value: 'In',
  },
  {
    label: 'Out',
    value: 'Out',
  },
]
const customerOpts = ref<
  {
    label: string
    value: string
  }[]
>([])
const employeeOpts = ref<
  {
    label: string
    value: string
  }[]
>([])

const refForm = ref<FormInstance>()
const firstShow = ref<boolean>(false)
const loading = ref({
  form: false,
  customer: false,
  refNo: 'Loading...',
})
const form = ref<FormInput>({
  refNo: '001',
  tranDate: moment().toDate(),
  transferDate: moment().toDate(),
  customerId: '',
  employeeId: '',
  tranType: 'In',
  currencyId: '',
  amount: 0,
  fee: 0,
  brokerFee: 0,
  branchId: '',
})
const ownerFee = ref<any[]>([])
const brokerFee = ref<any[]>([])

const rules = ref<FormRules>({
  refNo: [
    {
      required: true,
      message: 'RefNo date is required.',
      trigger: 'change',
    },
  ],
  tranDate: [
    {
      required: true,
      message: 'Transaction date is required.',
      trigger: 'change',
    },
  ],
  transferDate: [
    {
      required: true,
      message: 'Transfer date is required.',
      trigger: 'change',
    },
  ],
  customerId: [
    { required: true, message: 'Customer is required.', trigger: 'change' },
  ],
  employeeId: [
    { required: true, message: 'Employee is required.', trigger: 'change' },
  ],
  tranType: [
    {
      required: true,
      message: 'Transaction type is required.',
      trigger: 'change',
    },
  ],
  currencyId: [
    { required: true, message: 'Currency is required.', trigger: 'change' },
  ],
  amount: [
    { required: true, message: 'Amount is required.', trigger: 'change' },
  ],
})

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const currencyOpts = computed(() => {
  let data = store.getters['exchange/currencies']
  // Sort A-Z
  data = data.sort((a: any, b: any) => a.order - b.order)
  return data
})

const prefix = computed(() => {
  const exchange = store.state?.exchange
  return exchange?.prefix?.prefix
})

// Get prefix
const _getRefPrefix = () => {
  store.dispatch('exchange/prefix/getRefPrefix', 'Money_Transfer')
}
// Get Next Referenece Number
const _getNextRefNum = () => {
  loading.value.refNo = 'Loading....'
  store
    .dispatch('app/getNextSeq', {
      id: `ex_moneyTransferRefNo${currentBranchId.value}`,
      defaultVal: `${prefix.value}000001`,
    })
    .then(async (res) => {
      loading.value.refNo = ''
      // Break prefix
      form.value.refNo = await store.dispatch('exchange/prefix/refPrefix', {
        value: res,
        types: 'Money_Transfer',
      })
    })
}
const getData = () => {
  loading.value.form = true
  const { call } = useMethod('ex.getMoneyTransferById', {})
  firstShow.value = true
  call({ id: props.showId })
    .then((res) => {
      form.value = res
      remoteMethod(res.customerId)
      setTimeout(() => {
        loading.value.form = false
        firstShow.value = false
      })
    })
    .catch((err: any) => {
      loading.value.form = false
      store.dispatch('app/messageE', err.reason || err)
    })
}

// lookup employee
const lookupEmployee = () => {
  const selector = {
    branchId: currentBranchId.value,
  }
  const { call } = useMethod('app.lookupEmployeeMapping', [])
  call({ selector })
    .then((result: any) => {
      employeeOpts.value = result
      const doc: any = employeeOpts.value[0]
      if (doc.selected) {
        form.value.employeeId = doc.value
      }
    })
    .catch((error: any) => {
      store.dispatch('app/messageE', error.reason || error)
    })
}

// advance setting
const getDefaultSetting = () => {
  const selector = {
    branchId: currentBranchId.value,
  }
  const { call } = useMethod('ex.findSettingById', [])
  call({ selector })
    .then((result) => {
      if (result) {
        form.value.customerId = result.customerId
        form.value.employeeId = result.employeeId
        form.value.currencyId = result.currencyId
        _getCustomerData(form.value.customerId)
      }
    })
    .catch((error: any) => {
      store.dispatch('app/messageE', error.reason || error)
    })
}

const getLastFeeCharge = () => {
  const selector = {
    tranType: form.value.tranType,
    branchId: currentBranchId.value,
  }
  const { call } = useMethod('ex.getLatestFeeCharge', {})
  call(selector)
    .then(({ ownFeeDetails = [], brokerFeeDetails = [] }) => {
      ownerFee.value = ownFeeDetails
      brokerFee.value = brokerFeeDetails

      nextTick(() => {
        showInfo()

        if (firstShow.value) return false
        // Recalculate
        handleAmountChange(form.value.amount)
      })
    })
    .catch((err: any) => {
      store.dispatch('app/messageE', err.reason || err)
    })
}

const remoteMethod = (query: string) => {
  _getCustomerData(query)
}
const _getCustomerData = (query: string) => {
  loading.value.customer = true
  const exp = new RegExp(query)
  const selector = {
    branchId: currentBranchId.value,
    $or: [
      { _id: query },
      { name: { $regex: exp, $options: 'i' } },
      { telephone: { $regex: exp, $options: 'i' } },
      { address: { $regex: exp, $options: 'i' } },
    ],
  }
  customerOpts.value = []
  const { call } = useMethod('ex.lookupCustomer', [])
  call({ selector })
    .then((result: any) => {
      customerOpts.value = result
      loading.value.customer = false
    })
    .catch((err: any) => {
      loading.value.customer = false
      store.dispatch('app/messageE', err.reason || err)
    })
}

const submit = (isNew = false) => {
  loading.value.form = true
  if (!refForm.value) return false
  refForm.value.validate((valid) => {
    if (!valid) return false

    const doc: FormInput = pick(cloneDeep(form.value), [
      'refNo',
      'tranDate',
      'transferDate',
      'customerId',
      'employeeId',
      'tranType',
      'currencyId',
      'amount',
      'fee',
      'brokerFee',
      'branchId',
    ])
    doc.branchId = currentBranchId.value
    doc.refNo = `${prefix.value}${doc.refNo}`

    let methodName = 'ex.insertMoneyTransfer'
    if (props.showId) {
      methodName = 'ex.updateMoneyTransfer'
      doc._id = props.showId
    }

    const { call } = useMethod(methodName, '')
    call({ doc })
      .then(() => {
        store.dispatch('app/messageS', 'Save successfully.')
        resetForm(isNew)

        loading.value.form = false
      })
      .catch((err: any) => {
        loading.value.form = false
        store.dispatch('app/messageE', err.reason || err)
      })
  })
}
const remove = () => {
  loading.value.form = true
  store
    .dispatch('app/confirm', {
      messageType: 'Delete',
      item: 'record',
    })
    .then(() => {
      const { call } = useMethod('ex.removeMoneyTransfer', '')
      call({ id: props.showId })
        .then(() => {
          store.dispatch('app/messageS', 'Successfully removed')
          handleClosed()
          loading.value.form = false
        })
        .catch((err) => {
          store.dispatch('app/messageE', err.reason || err)
          loading.value.form = false
        })
    })
    .catch((err) => {
      store.dispatch('app/messageE', err.reason || err)
      loading.value.form = false
    })
}
const resetForm = (isNew = false) => {
  if (isNew) {
    refForm?.value?.resetFields()
  } else {
    handleClosed()
  }
}

const handleClosed = () => {
  emits('closed', false)
}

const handleAmountChange = (amount: number) => {
  form.value.amount = amount || 0

  type listType = {
    prop: string
    data: any
  }

  const list: listType[] = [
    { prop: 'fee', data: ownerDataInfo.value },
    { prop: 'brokerFee', data: brokerDataInfo.value },
  ]
  list.forEach((it: listType) => {
    const docs = it.data.filter((d: any) => amount > d.amount)
    const { value = 0, rateType = 'amount' } = docs[docs.length - 1] || {}
    let fee = value
    if (rateType == 'percentage') {
      fee = (form.value.amount * value) / 100
    }
    const doc = { [it.prop]: fee }
    form.value = { ...form.value, ...doc }
  })
}

const showInfo = () => {
  const currencyId = form.value.currencyId
  const currencyDoc = currencyOpts.value.find((it: any) => it._id == currencyId)
  let data = ownerFee.value.filter((it) => it.currencyId == currencyId) || []
  data = data.sort((a, b) => a.amount - b.amount)
  let addAmount = 0.01
  if (currencyDoc?.symbol.trim() === '៛') {
    addAmount = 100
  }
  for (let i = 0; i < data.length; i++) {
    const it: any = data[i]
    const next = data[i + 1] || null
    let amount = clone(it.amount)
    if (i != 0) amount += addAmount
    let label = `${amount} upward`
    if (next) label = `${amount} - ${next.amount}`

    it.label = label
    it.fee = it.value
  }
  ownerDataInfo.value = data
  // Broker
  const brokerData = brokerFee.value.filter((it) => it.currencyId == currencyId)
  brokerDataInfo.value = brokerData.sort((a, b) => a.amount - b.amount)
}

// Watch
watch(
  () => form.value.tranType,
  () => {
    getLastFeeCharge()
  },
  {
    immediate: true,
  }
)

watch(
  () => currencyOpts.value,
  (items) => {
    if (items.length) {
      if (firstShow.value) return false

      form.value.currencyId = currencyOpts.value[0]._id
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

watch(
  () => form.value.currencyId,
  () => {
    showInfo()
    // Reset value
    if (firstShow.value) return false

    form.value.amount = 0
    form.value.fee = 0
    form.value.brokerFee = 0
  },
  {
    immediate: true,
  }
)

onMounted(() => {
  _getRefPrefix()
  store.dispatch('exchange/getCurrencies')
  lookupEmployee()
  if (!props.showId) {
    nextTick(() => {
      getDefaultSetting()
    })
    _getNextRefNum()
  }
  if (props.showId) {
    getData()
  }
})
</script>
