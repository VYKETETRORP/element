<template>
  <div>
    <el-card shadow="never">
      <!--FORM-->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              :label="$t('app.account-report-field.Branch')"
              prop="branchId"
            >
              <el-select
                v-model="form.branchId"
                clearable
                multiple
                style="width: 100%"
              >
                <el-option
                  v-for="item in branchOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              :label="$t('exchange.Transaction.tranType')"
              prop="tranType"
            >
              <el-select
                v-model="form.tranType"
                filterable
                multiple
                placeholder="--- All ----"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in tranTypeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('exchange.customer.name')"
              prop="customerId"
            >
              <el-select
                v-model="form.customerId"
                :loading="loadingCustomer"
                :remote-method="remoteMethod"
                style="width: 100%"
                filterable
                remote
                placeholder="--- All ----"
                multiple
                @focus="focusMethod"
              >
                <el-option
                  v-for="customer in customerOpts"
                  :key="customer.value"
                  :label="customer.label"
                  :value="customer.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('exchange.admin-setting.Employee')"
              prop="employeeId"
            >
              <el-select
                v-model="form.employeeId"
                clearable
                multiple
                style="width: 100%"
                placeholder="-- All --"
              >
                <el-option
                  v-for="item in employeeOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              :label="$t('app.account-report-field.Date')"
              prop="reportDate"
            >
              <el-date-picker
                v-model="form.reportDate"
                style="width: 100%"
                :format="dateFormat"
                :picker-options="dateOpts"
                :clearable="false"
                type="daterange"
                start-placeholder="Start Date"
                end-placeholder="End Date"
              />
            </el-form-item>

            <el-form-item
              :label="$t('app.account-report-field.Currency')"
              prop="currency"
            >
              <el-select
                v-model="form.currencyId"
                clearable
                multiple
                style="width: 100%"
                placeholder="-- All --"
              >
                <el-option
                  v-for="item in currencyOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="submitForm"
              >
                <i class="fa fa-search" />
                {{ $t('app.account-report-field.Submit') }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <!--REPORT Layout-->
    <report-layout
      :exec-time="execTime"
      :report-title="$t('exchange.tranReport.transaction')"
      :paper-size="paperSize"
      :export-csv="exportCSV"
      :css-text="cssText"
    >
      <!--REPORT HEADER-->
      <template #header>
        <div class="report-name">Money Transfer Details</div>
        <div class="report-period">
          {{ $filters.date(form.reportDate[0]) }}
          {{ $t('app.account-report-field.To') }}
          {{ $filters.date(form.reportDate[1]) }}
        </div>
      </template>
      <!--REPORT FILTER-->
      <template #filter>
        <el-row :gutter="10">
          <el-col class="colspan-6">
            <span class="title">
              {{ $t('app.account-report-field.Branch') }}:
            </span>
            {{ branchFilter }}
          </el-col>
          <el-col class="colspan-6">
            <span class="title">
              {{ $t('app.account-report-field.Currency') }}:
            </span>
            {{ currencyFilter }}
          </el-col>
          <el-col class="colspan-6">
            <span class="title">
              {{ $t('exchange.tableLabel.customerName') }}:
            </span>
            {{ customerFilter }}
          </el-col>
          <el-col class="colspan-6">
            <span class="title">
              {{ $t('exchange.admin-setting.Employee') }}:
            </span>
            {{ employeeFilter }}
          </el-col>
        </el-row>
      </template>
      <!--REPORT CONTENT-->
      <div v-loading="loading">
        <table
          id="myTable"
          class="table-content"
        >
          <thead>
            <tr>
              <th>{{ $t('app.account-report-label.NO') }}</th>
              <th>
                {{ $t('app.account-report-label.Ref No') }}
              </th>
              <th>{{ $t('app.account-report-label.DATE') }}</th>
              <th>{{ $t('exchange.tableLabel.customerName') }}</th>
              <th>{{ $t('exchange.admin-setting.Employee') }}</th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.amount') }}
              </th>
              <th class="text-right">Fee</th>
              <th class="text-right">Total</th>
              <th class="text-right">Broker Fee</th>

              <th class="text-right">Balance Broker</th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.netIncome') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(doc, index) in reportData"
              :key="index"
            >
              <tr>
                <th>{{ index + 1 }}</th>
                <th colspan="10">{{ doc.groupName }}</th>
              </tr>
              <template
                v-for="(it, key) in doc.details"
                :key="`${key}${index}`"
              >
                <tr>
                  <th></th>
                  <th colspan="10">
                    <span v-html="indentSpace(1)" />
                    {{ it.currencyName }}
                  </th>
                </tr>

                <template
                  v-for="(el, i) in it.details"
                  :key="`${i}${key}${index}`"
                >
                  <tr>
                    <td></td>
                    <td>
                      <span>
                        <span v-html="indentSpace(2)" />{{ el.refNo }}
                      </span>
                    </td>
                    <td>{{ $filters.date(el.tranDate) }}</td>
                    <td>{{ el.customerName }}</td>
                    <td>{{ el.employeeName }}</td>
                    <td class="text-right">
                      {{ $filters.number(el.amount) }}
                    </td>
                    <td class="text-right">
                      {{ $filters.number(el.fee) }}
                    </td>
                    <td class="text-right">
                      {{ $filters.number(el.total) }}
                    </td>
                    <td class="text-right">
                      {{ $filters.number(el.brokerFee) }}
                    </td>
                    <td class="text-right">
                      {{ $filters.number(el.balanceBroker) }}
                    </td>
                    <td class="text-right">
                      {{ $filters.number(el.netIncome) }}
                    </td>
                  </tr>
                </template>
                <tr>
                  <th
                    class="text-right"
                    colspan="5"
                  >
                    Total
                  </th>
                  <th class="text-right">
                    {{ $filters.number(it.totalAmount) }}
                  </th>
                  <th class="text-right">{{ $filters.number(it.totalFee) }}</th>
                  <th class="text-right">{{ $filters.number(it.total) }}</th>
                  <th class="text-right">
                    {{ $filters.number(it.totalBrokerFee) }}
                  </th>
                  <th class="text-right">
                    {{ $filters.number(it.totalBalanceBroker) }}
                  </th>
                  <th class="text-right">
                    {{ $filters.number(it.totalNetIncome) }}
                  </th>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </report-layout>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MoneyTransferReport',
}
</script>
<script
  lang="ts"
  setup
>
import useMethod from '/imports/client/composables/useMethod'

import { repeat } from 'lodash'
import moment from 'moment'
import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'

// Report Layout
import ReportLayout from '/imports/client/layouts/ReportLayout.vue'

// Components
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElDatePicker,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElButton,
  FormInstance,
  FormRules,
} from 'element-plus'
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from '/imports/store'

const store = useStore()

const execTime = ref(0)
const dateOpts = dateRangePickerOpts
const dateFormat = 'DD/MM/YYYY'
const formRef = ref<FormInstance>()
const form = ref({
  reportDate: [moment().startOf('day').toDate(), moment().toDate()],
  branchId: [],
  currencyId: [],
  customerId: [],
  employeeId: [],
  tranType: [],
})
const tranTypeOpts = [
  { label: 'In', value: 'In' },
  { label: 'Out', value: 'Out' },
]
const currencyOpts = ref<any[]>([])
const customerOpts = ref<any[]>([])
const employeeOpts = ref<any[]>([])
const paperSize = ref('a4-l')
const reportData = ref<any[]>([])
const loading = ref(false)
const loadingCustomer = ref(false)
const exportCSV = ref({
  data: reportData.value,
  fields: [],
  fileName: 'Money Transfer Report',
})
const cssText = ref(``)
const rules = ref<FormRules>({
  reportDate: [{ required: true, message: 'Date is required' }],
  branchId: [{ required: true, message: 'Branch is required' }],
})

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})
const branchOpts = computed(() => {
  return store.getters['app/lookup/allowedBranches']
})
// Form filter
const branchFilter = computed(() => {
  const data = branchOpts.value.filter((it: any) => {
    return form.value.branchId.includes(it.value)
  })
  return data.map((it: any) => it.doc.shortName)
})
const customerFilter = computed(() => {
  const data = customerOpts.value.filter((it: any) =>
    form.value.customerId.includes(it.value)
  )
  let list: any = data.map((it: any) => it.label)
  if (list == '') {
    list = '[All]'
  }
  return list
})
const currencyFilter = computed(() => {
  const data = currencyOpts.value.filter((it: any) =>
    form.value.currencyId.includes(it._id)
  )
  let list: any = data.map((it: any) => it.name)
  if (list == '') {
    list = '[All]'
  }
  return list
})
const employeeFilter = computed(() => {
  const data = employeeOpts.value.filter((it: any) =>
    form.value.employeeId.includes(it._id)
  )
  let list: any = data.map((it: any) => it.name)
  if (list == '') {
    list = '[All]'
  }
  return list
})

const indentSpace = (indent: number) => {
  return indent > 0 ? repeat('&nbsp;', indent * 4) : ''
}
const focusMethod = (event: any) => {
  const result = event.target.value.split(':')
  remoteMethod(result[0].trim())
}
const remoteMethod = (query?: string) => {
  _getCustomerData(query)
}
const _getCustomerData = (query?: string) => {
  query = query || ''
  const exp = new RegExp(query)
  const selector = {
    branchId: currentBranchId.value,
    $or: [
      { _id: query },
      { name: { $regex: exp, $options: 'i' } },
      { telephone: { $regex: exp, $options: 'i' } },
      { locationName: { $regex: exp, $options: 'i' } },
    ],
  }
  const { call } = useMethod('ex.lookupCustomer', [])
  call({ selector })
    .then((result: any) => {
      customerOpts.value = result
      loadingCustomer.value = false
    })
    .catch((err: any) => {
      customerOpts.value = []
      loadingCustomer.value = false
      store.dispatch('app/messageE', err)
    })
}
// Get Currency
const getCurrency = () => {
  loading.value = true
  // Selector
  const selector = {
    branchId: currentBranchId.value,
  }
  const { call } = useMethod('ex.fetchExchangeCurrency', [])
  call({ selector })
    .then((result: any) => {
      currencyOpts.value = result
      loading.value = false
    })
    .catch((error) => {
      loading.value = false
      store.dispatch('app/messageE', error.reason || error)
    })
}

//get Employee
const getEmployee = () => {
  loading.value = true
  const selector: any = {}
  if (currentBranchId.value) selector.branchId = currentBranchId.value
  const { call } = useMethod('app.findEmployees', [])
  call({ selector })
    .then((result: any) => {
      employeeOpts.value = result.data
      form.value.employeeId = result.selected

      loading.value = false
    })
    .catch((error) => {
      loading.value = false
      store.dispatch('app/messageE', error)
    })
}

const submitForm = () => {
  if (!formRef.value) return false

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      // Pick doc
      form.value.reportDate = [
        moment(form.value.reportDate[0]).startOf('day').toDate(),
        moment(form.value.reportDate[1]).endOf('day').toDate(),
      ]
      const { call } = useMethod('ex.reportMoneyTransferDetails', [])
      call(form.value)
        .then((result) => {
          reportData.value = result
          loading.value = false
        })
        .catch((error: any) => {
          loading.value = false
          store.dispatch('app/messageE', error.reason || error)
        })
    } else {
      return false
    }
  })
}

watch(
  () => form.value.branchId,
  () => {
    _getCustomerData()
  }
)
// Change branchId
watch(
  () => currentBranchId.value,
  (val) => {
    if (val) {
      getCurrency()
      getEmployee()
      _getCustomerData()
      form.value.currencyId = []
      form.value.customerId = []
      reportData.value = []
    }
  }
)

onMounted(() => {
  form.value.branchId = [currentBranchId.value]
  getCurrency()
  _getCustomerData()
  getEmployee()
})
</script>

<style
  lang="scss"
  scoped
>
@import './imports/client/styles/report.scss';
</style>
