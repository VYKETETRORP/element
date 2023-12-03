<template>
  <div>
    <el-card shadow="never">
      <!--FORM-->
      <el-form
        ref="form"
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
            <!-- <el-form-item
              :label="$t('exchange.tableLabel.customerName')"
              prop="journalType"
            >
              <el-select
                v-model="form.customerId"
                clearable
                automatic-dropdown
                multiple
                filterable
                remote
                :remote-method="getRemoteCustomerOpts"
                :loading="loadingCustomer"
                placeholder="Search Customer... (50)"
                style="width: 100%"
              >
                <el-option
                  v-for="item in customerOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item> -->
            <el-form-item
              :label="$t('exchange.Transaction.tranType')"
              prop="tranTypeId"
            >
              <el-select
                v-model="form.tranTypeId"
                filterable
                multiple
                placeholder="--- All ----"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in tranTypeOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
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
        <div class="report-name">
          <!-- {{ reportName }} -->
          {{ $t('exchange.tranReport.transaction') }}
        </div>
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
              <th>{{ $t('app.account-report-label.TYPE') }}</th>
              <th>{{ $t('exchange.customer-setting.ExchangeCurrency') }}</th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.received') }}
              </th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.exchangeAmount') }}
              </th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.exchangeRate') }}
              </th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.amount') }}
              </th>
              <th class="text-right">
                {{ $t('exchange.tableLabel.return') }}
              </th>
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
                <td>{{ index + 1 }}</td>
                <td>
                  <span
                    v-if="currentBranchId == doc.branchId"
                    class="ra-text-link"
                    @click="refClick(doc)"
                  >
                    {{ doc.refNo }}
                  </span>
                  <span v-else>
                    {{ doc.refNo }}
                  </span>
                </td>
                <td>{{ formatDate(doc.tranDate) }}</td>
                <td>{{ doc.name }}</td>
                <td>{{ doc.employeeName }}</td>
                <td>{{ doc.tranType }}</td>
                <td>{{ doc.currency }}</td>
                <!--<td class="text-right">
                  {{
                    $filters.exchangeBaseCurrency(doc.received, doc.baseSymbol)
                  }}
                </td>-->
                <td class="text-right">
                  {{ doc.received.toLocaleString() }} {{ doc.baseSymbol }}
                </td>
                <td class="text-right">
                  {{ doc.exchangeAmount.toLocaleString() }} {{ doc.baseSymbol }}
                </td>
                <td class="text-right">
                  {{ doc.rate.toLocaleString() }} {{ doc.rateFormat }}
                </td>
                <td class="text-right">
                  {{ doc.amount.toLocaleString() }} {{ doc.toSymbol }}
                </td>
                <td class="text-right">
                  {{ doc.return.toLocaleString() }} {{ doc.baseSymbol }}
                </td>
                <td class="text-right">
                  <!--{{ doc.netIncome }} {{ doc.baseSymbol }}-->
                  {{ (doc.netIncome ? doc.netIncome : 0).toLocaleString() }}
                  {{ doc.baseSymbol }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </report-layout>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'

// Report Layout
import ReportLayout from '/imports/client/layouts/ReportLayout.vue'

// Methods
import { fetchExchangeCurrency } from '../api/exchange-currency/methods'
import { lookupCustomer } from '../api/customers/methods'
import { findEmployees } from '../../../api/employees/methods'

import { reportTrasaction } from '../api/reports/exchange-transaction'
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
} from 'element-plus'
export default {
  name: 'TransactionReport',
  components: {
    ElCard,
    ElForm,
    ElFormItem,
    ElDatePicker,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
    ElButton,
    ReportLayout,
  },
  data() {
    return {
      execTime: 0,
      dateOpts: dateRangePickerOpts,
      dateFormat: 'DD/MM/YYYY',
      form: {
        reportDate: [moment().startOf('day').toDate(), moment().toDate()],
        branchId: [],
        currencyId: [],
        customerId: [],
        employeeId: [],
        tranTypeId: [],
      },
      tranTypeOpts: [],
      currencyOpts: [],
      customerOpts: [],
      employeeOpts: [],
      paperSize: 'a4-l',
      reportData: [],
      reportTotal: 0,
      loading: false,
      loadingCustomer: false,
      exportCSV: {
        data: this.reportData,
        fields: [],
        fileName: 'Transaction Report',
      },
      cssText: ``,
      grandTotal: 0,
      rules: {
        reportDate: [{ required: true, message: 'Date is required' }],
        branchId: [{ required: true, message: 'Branch is required' }],
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    branchOpts() {
      return this.$store.getters['app/lookup/allowedBranches']
    },
    // Form filter
    branchFilter() {
      const data = _.filter(this.branchOpts, (o) => {
        return _.includes(this.form.branchId, o.value)
      })
      return _.map(data, 'doc.shortName')
    },
    customerFilter() {
      const data = _.filter(this.customerOpts, (o) => {
        return _.includes(this.form.customerId, o.value)
      })
      let list = _.map(data, 'label')
      if (list == '') {
        list = '[All]'
      }
      return list
    },
    currencyFilter() {
      const data = _.filter(this.currencyOpts, (o) => {
        return _.includes(this.form.currencyId, o._id)
      })
      let list = _.map(data, 'name')
      if (list == '') {
        list = '[All]'
      }
      return list
    },
    employeeFilter() {
      const data = _.filter(this.employeeOpts, (o) => {
        return _.includes(this.form.employeeId, o._id)
      })
      let list = _.map(data, 'name')
      if (list == '') {
        list = '[All]'
      }
      return list
    },
  },
  watch: {
    'form.branchId'() {
      this._getCustomerData()
    },
    // Change branchId
    currentBranchId(val) {
      if (val) {
        // if (this.form.branchId) {
        //   this.form.branchId = [val]
        // }
        this.getCurrency()
        this.getEmployee()
        this._getCustomerData()
        this.form.currencyId = []
        this.form.customerId = []
        this.reportData = []
      }
    },
  },
  activated() {
    this.form.branchId = [this.currentBranchId]
    this.getCurrency()
    this._getCustomerData()
    this.getEmployee()
    this.getTranTypeOpts()
  },
  methods: {
    //format date
    formatDate(date) {
      return moment(date).format('YYYY/MM/DD HH:mm')
    },
    getTranTypeOpts() {
      Meteor.call('ex.fetchTranTypes', {}, (err, res) => {
        if (err) {
          Notify.error({ message: err.reason || err })
        } else {
          this.tranTypeOpts = res
        }
      })
    },
    focusMethod(event) {
      const result = event.target.value.split(':')
      this.remoteMethod(result[0].trim())
    },
    remoteMethod(query, type) {
      this._getCustomerData(query, type)
    },
    _getCustomerData(query, type) {
      const exp = new RegExp(query)
      const selector = {
        branchId: this.currentBranchId,
        $or: [
          { _id: query },
          { name: { $regex: exp, $options: 'i' } },
          { refNo: { $regex: exp, $options: 'i' } },
          { telephone: { $regex: exp, $options: 'i' } },
          { locationName: { $regex: exp, $options: 'i' } },
        ],
      }
      lookupCustomer
        .callPromise({ selector })
        .then((result) => {
          this.customerOpts = result
          // if (type === 'update') {
          //   this.handleCustomerChange(query)
          // }
          this.loadingCustomer = false
        })
        .catch((err) => {
          this.customerOpts = []
          this.loadingCustomer = false
          Notify.error({ message: err })
        })
    },
    // Get Currency
    getCurrency() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchExchangeCurrency
        .callPromise({ selector })
        .then((result) => {
          this.currencyOpts = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    //get Employee
    getEmployee() {
      this.loading.form = true
      const selector = {}
      if (this.currentBranchId) selector.branchId = this.currentBranchId
      findEmployees
        .callPromise({ selector })
        .then(async (result) => {
          this.employeeOpts = result.data
          this.form.employeeId = result.selected

          this.loading.form = false
        })
        .catch((error) => {
          this.loading.form = false
          this.$store.dispatch('app/messageE', error)
        })

      this.loading.form = false
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true

          // Pick doc

          // Pick doc
          this.form.reportDate = [
            moment(this.form.reportDate[0]).startOf('day').toDate(),
            moment(this.form.reportDate[1]).endOf('day').toDate(),
          ]
          reportTrasaction
            .callPromise(this.form)
            .then((result) => {
              this.reportData = result
              this.loading = false
            })
            .catch((error) => {
              this.loading = false
              Notify.error({ message: error })
            })
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs['form'].resetFields()
    },
    refClick(row) {
      if (row.tranType === 'Exchange') {
        this.$router.push({
          name: 'Transaction',
          params: { type: 'edit', tranType: row.tranType, id: row._id },
        })
      }
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
@import './imports/client/styles/report.scss';
</style>
