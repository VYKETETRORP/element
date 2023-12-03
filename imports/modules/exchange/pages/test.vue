<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>
            <i :class="formType == 'Edit' ? 'fas fa-edit' : 'fas fa-plus'" />
            {{ $t('exchange.customer-setting.CashDeposit') }}
          </span>
        </div>
      </template>
      <!--Form-->
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-width="150px"
        label-position="left"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.exchange-rate.TranDate')"
              prop="tranDate"
            >
              <el-date-picker
                v-model="form.tranDate"
                :size="fontSize"
                type="datetime"
                format="DD/MM/YYYY hh:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item
              :label="$t('exchange.Transaction.employee')"
              prop="employeeId"
            >
              <el-select
                v-model="form.employeeId"
                filterable
                style="width: 100%"
                :size="fontSize"
              >
                <el-option
                  v-for="item in employeeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.rate-details.Currency')"
              prop="exchangeCurrencyId"
            >
              <el-select
                v-model="form.exchangeCurrencyId"
                :size="fontSize"
                filterable
                style="width: 100%"
                automatic-dropdown
                clearable
              >
                <el-option
                  v-for="doc in currencyOpts"
                  :key="doc._id"
                  :label="doc.name"
                  :value="doc._id"
                >
                  <!-- :disabled="isDisabled(doc)" -->
                  <span v-html="doc.name" />
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('exchange.transaction-details.amount')"
              prop="amount"
            >
              <el-input-number
                v-model.number="form.amount"
                v-inputmask="numericMask"
                :size="fontSize"
                style="width: 100%; text-algin: center"
                :min="0"
                autofocus
                :controls="false"
                @focus="$event.target.select()"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- button  -->
        <el-form-item
          type="action"
          style="float: right"
        >
          <submit-button
            v-if="formType === 'Edit'"
            :disabled="!$userIsInRole(['provider-update'])"
            type="primary"
            @click="submitFrom"
          >
            <template #icon>
              <i class="fal fa-edit fa-lg" />
            </template>
            <!-- Save -->
            {{ $t('exchange.btn.update') }}
          </submit-button>
          <submit-button
            v-else
            :disabled="!$userIsInRole(['provider-insert'])"
            type="primary"
            @click="submitFrom"
          >
            <template #icon>
              <i class="fal fa-save fa-lg" />
            </template>
            <!-- remove -->
            {{ $t('exchange.btn.save') }}
          </submit-button>
          <submit-button
            v-if="formType === 'Edit' && activePro == 0"
            :disabled="!$userIsInRole(['provider-remove'])"
            type="danger"
            @click="remove"
          >
            <template #icon>
              <i class="fas fa-trash-alt fa-lg" />
            </template>
            <!-- Delete -->
            {{ $t('exchange.btn.delete') }}
          </submit-button>
          <el-button @click="handleModalClose">
            <template #icon>
              <i class="fas fa-undo fa-lg" />
            </template>
            <!-- Cancel -->
            {{ $t('exchange.btn.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
      <!-- Datatable -->
      <data-tables
        v-loading="loading"
        :data="tableData"
        :table-props="tableProps"
        :filters="tableFilters"
        class="table-auto-height"
      >
        <el-table-column
          v-for="title in tableTitles"
          :key="title.label"
          :prop="title.prop"
          :label="title.label"
          sortable="custom"
        >
          <template #default="scope">
            <div
              v-if="title.prop === 'employee'"
              class="ra-text-link"
              @click="edit(scope.row)"
            >
              {{ scope.row.employee }}
            </div>
            <div v-else-if="title.prop === 'tranDate'">
              {{ $filters.date(scope.row.tranDate) }}
            </div>
            <div
              v-else-if="title.prop === 'currency'"
              style="float: center"
            >
              {{ scope.row.currencyName }}
            </div>
            <div v-else-if="title.prop === 'tranType'">
              <el-tag
                style="background-color: #409eff !important; color: white"
              >
                <b>{{ scope.row.tranType }}</b>
              </el-tag>
            </div>
            <div
              v-else-if="title.prop === 'amount'"
              class="text-right"
            >
              {{ scope.row.amount }}{{ scope.row.symbol }}
            </div>
            <div v-else>
              {{ scope.row[title.prop] }}
            </div>
          </template>
        </el-table-column>
      </data-tables>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
import _ from 'lodash'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'

// Methods
// import { findSettingById } from '../api/settings/methods'
import { fetchExchangeCurrency } from '../api/exchange-currency/methods'
import {
  fetchCashDeposit,
  insertCashDeposit,
  updateCashDeposit,
  removeCashDepositById,
} from '../api/cash-deposit/methods'
import { findProviderLengths } from '../api/exchange-rates/methods'
import { lookupEmployee } from '../../../api/lookups/employee'

// Components
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElRow,
  ElCol,
  ElDatePicker,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElCard,
  ElTag,
} from 'element-plus'
import { split } from 'lodash'

import SubmitButton from '../../../client/components/SubmitButton.vue'
import DataTables from '/imports/client/components/DataTables.vue'

export default {
  name: 'CashDeposit',
  components: {
    DataTables,
    SubmitButton,
    ElForm,
    ElFormItem,
    ElButton,
    ElRow,
    ElCol,
    ElDatePicker,
    ElSelect,
    ElOption,
    ElInputNumber,
    ElCard,
    ElTag,
  },
  mixins: [dataTablesMixin, softRemoveMixin, restoreMixin, removeMixin],
  data() {
    // Validate
    const validateAmount = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('Amount greater than 0'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      formType: 'New',
      fontSize: 'large',
      tableData: [],
      form: {
        tranDate: moment().toDate(),
        employeeId: '',
        exchangeCurrencyId: '',
        tranType: 'Deposit',
        amount: null,
        branchId: this.currentBranchId,
      },
      employeeOpts: [],
      currencyOpts: [],
      activePro: 0,
      rules: {
        tranDate: [{ required: true, message: 'Date is required' }],
        employeeId: [
          {
            required: true,
            message: 'Employee is required',
            trigger: 'blur',
          },
        ],
        exchangeCurrencyId: [
          {
            required: true,
            message: 'Currency is required',
            trigger: 'blur',
          },
        ],
        amount: [
          { validator: validateAmount, required: true, trigger: 'blur' },
        ],
      },
      tableFilters: [
        {
          prop: ['tranDate'],
          value: '',
        },
        {
          prop: ['employee'],
          value: '',
        },
      ],
      updateDoc: null,
    }
  },
  computed: {
    tableTitles() {
      const tableTitles = [
        {
          prop: 'tranDate',
          label: `${this.$t('exchange.exchange-rate.TranDate')}`,
        },
        {
          prop: 'employee',
          label: `${this.$t('exchange.Transaction.employee')}`,
        },
        {
          prop: 'currency',
          label: `${this.$t('exchange.rate-details.Currency')}`,
        },
        {
          prop: 'tranType',
          label: `${this.$t('exchange.tableLabel.tranType')}`,
        },
        {
          prop: 'amount',
          label: `${this.$t('exchange.transaction-details.amount')}`,
        },
      ]
      return tableTitles
    },
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    numericMask() {
      const mask = this.$store.state.app.numericMask
      mask.allowMinus = false
      return mask
    },
    // numericMask() {
    //   let mask = this.$store.state.app.numericMask
    //   mask.allowMinus = false
    //   mask.digits = 12
    //   return mask
    // },
  },
  watch: {
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getData()
        this.getEmployee()
        // this.getDefaultSetting()
      }
    },
    updateDoc: {
      immediate: true,
      handler: function (val) {
        if (this.formType == 'Edit') {
          this.form = val
          this.checkProviderInExRate()
        }
      },
      deep: true,
    },
  },
  activated() {
    if (this.currentBranchId) {
      // this.getDefaultSetting()
    }
    this.getData()
    this.getEmployee()
    this.getCurrency()
  },
  created() {
    // Extend data tables props (Mixin)
    this.tableProps.defaultSort = {
      prop: 'order',
      order: 'ascending',
    }
    this.tableProps.height = `calc(100vh - 410px)`
  },
  mounted() {
    // this.getData()
    // this.getEmployee()
    // this.getCurrency()
  },
  methods: {
    // isDisabled: function (doc) {
    //   let data = this.tableData
    //     .map((item) => item.exchangeCurrencyId)
    //     .includes(doc._id)
    //   return data
    // },

    // getDefaultSetting() {
    //   this.loading = true
    //   let selector = {
    //     branchId: this.currentBranchId,
    //   }
    //   findSettingById
    //     .callPromise({ selector })
    //     .then((result) => {
    //       if (result) {
    //         this.form.employeeId = result.employeeId
    //       }
    //       this.loading = false
    //     })
    //     .catch((error) => {
    //       this.loading = false
    //       Notify.error({ message: error })
    //     })
    // },
    getEmployee() {
      this.loading.form = true
      const selector = {
        branchId: this.currentBranchId,
      }
      lookupEmployee
        .callPromise({ selector })
        .then(async (result) => {
          this.employeeOpts = result
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
          this.loading = false
          this.$store.dispatch('app/messageE', error)
        })

      this.loading.form = false
    },
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
    // Get data
    getData() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchCashDeposit
        .callPromise({ selector })
        .then((result) => {
          this.tableData = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },

    checkProviderInExRate() {
      const _id = _.pick(this.form, ['_id'])
      findProviderLengths.callPromise(_id).then((result) => {
        this.activePro = result
      })
    },
    submitFrom() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.branchId = this.currentBranchId
          // Check form type
          if (this.formType === 'New') {
            this.insert()
          } else {
            this.update()
          }
        } else {
          return false
        }
      })
    },
    insert() {
      insertCashDeposit
        .callPromise(this.form)
        .then((result) => {
          if (result) {
            this.getData()
            this.loading = false
            Notify.success({ message: 'Success' })
            this.resetForm()
          }
        })
        .catch((err) => {
          this.loading = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    update() {
      this.form.branchId = this.currentBranchId
      // Pick data
      const doc = _.pick(this.form, [
        '_id',
        'tranDate',
        'exchangeCurrencyId',
        'employeeId',
        'amount',
        'tranType',
        'branchId',
      ])
      updateCashDeposit
        .callPromise(doc)
        .then((result) => {
          if (result) {
            this.loading = false
            this.$store.dispatch('app/messageS', `Cash Deposit saved`)
            this.resetForm()
            this.getData()
            // this.formType = 'New'
          }
        })
        .catch((err) => {
          this.loading = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    remove() {
      this.$store
        .dispatch('app/confirm', {
          messageType: 'Delete',
          item: this.form.currency,
        })
        .then(() => {
          this.loading = true
          removeCashDepositById
            .callPromise({ _id: this.updateDoc._id })
            .then((res) => {
              this.loading = false
              this.getData()
              this.resetForm()
              this.$store.dispatch('app/messageS', `Cash Deposit deleted`)
            })
            .catch((err) => {
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },
    edit(row) {
      this.updateDoc = row
      this.formType = 'Edit'
    },
    resetForm() {
      delete this.form._id
      delete this.form.__v
      delete this.form.employee
      delete this.form.currencyName
      delete this.form.symbol
      this.$refs['form'].resetFields()
      this.formType = 'New'
      this.updateDoc = null
      // this.getDefaultSetting()
    },
    handleModalClose() {
      this.resetForm()
      this.getData()
    },

    softRemoveClassName(removed) {
      return removed ? 'soft-remove' : ''
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
