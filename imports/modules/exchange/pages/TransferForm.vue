<template>
  <div>
    <el-card shadow="never">
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        :rules="rules"
        size="large"
        label-width="150px"
        label-position="left"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.transfer.fromEmployee')"
              prop="fromEmployeeId"
            >
              <el-select
                v-model="form.fromEmployeeId"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in employeeOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('exchange.transfer.toEmployee')"
              prop="employeeId"
            >
              <el-select
                v-model="form.employeeId"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in employeeOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                  :disabled="item._id === form.fromEmployeeId"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('exchange.exchange-rate.TranDate')"
              prop="tranDate"
            >
              <el-date-picker
                v-model="form.tranDate"
                type="date"
                format="DD/MM/YYYY"
                :clearable="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- table open cash -->
            <el-table
              style="margin-bottom: 10px; border-radius: 7px"
              stripe
              border
              :resizable="true"
              highlight-current-row
              :data="CashDeposit"
              header-cell-class-name="header-table"
              cell-class-name="row-table"
            >
              <el-table-column
                :label="$t('exchange.rate-details.Currency')"
                prop="toName"
              >
                <template #default="scope">
                  <span style="font-size: 16px; color: #000 !important">{{
                    scope.row.name
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('exchange.rate-details.Amount')"
                prop="bid"
              >
                <template #default="scope">
                  <span
                    v-if="scope.row.amount === 0 || scope.row.amount === null"
                    style="
                      font-size: 24px;
                      font-weight: bold;
                      float: right;
                      color: #000 !important;
                    "
                  >
                    0{{ scope.row.symbol }}
                  </span>
                  <span
                    v-else
                    style="
                      font-size: 24px;
                      font-weight: bold;
                      float: right;
                      color: #000 !important;
                    "
                  >
                    {{
                      $filters.exchangeBaseCurrency(
                        scope.row.amount,
                        scope.row.symbol
                      )
                    }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>

        <!--Sub Items List-->
        <el-tabs type="border-card">
          <el-tab-pane>
            <template #label>
              <i class="el-icon-date" />
              {{ $t('exchange.transfer.Details') }}
            </template>
            <TransferDetails
              :items="transferDetailInit"
              :rows="1"
              :min-row="1"
              :open-cash="CashDeposit"
              @item-change="handlerItemDetailCheng"
            />
          </el-tab-pane>
        </el-tabs>

        <!-- Button -->
        <el-form-item
          class="ra-text-right"
          style="margin-top: 10px"
        >
          <submit-button
            v-if="!showId"
            :disabled="!$userIsInRole(['transaction-transfer-insert'])"
            :tran-date="form.tranDate"
            type="primary"
            @click="submit('insert')"
          >
            <template #icon>
              <i class="fal fa-save fa-lg" />
            </template>
            {{ $t('app.btn.save') }}
          </submit-button>
          <!-- update  -->
          <submit-button
            v-if="showId"
            :disabled="!$userIsInRole(['transaction-transfer-update'])"
            :tran-date="form.tranDate"
            :first-show-tran-date="firstShowTranDate"
            type="primary"
            @click="submit('update')"
          >
            <template #icon>
              <i class="fal fa-save fa-lg" />
            </template>
            {{ $t('app.btn.save') }}
          </submit-button>
          <!-- delete -->
          <submit-button
            v-if="showId"
            :disabled="!$userIsInRole(['transaction-transfer-remove'])"
            type="danger"
            title="Remove"
            @click="remove"
          >
            <template #icon>
              <i class="fal fa-trash-alt fa-lg" />
            </template>
            {{ $t('app.btn.delete') }}
          </submit-button>
          <el-button
            type="default"
            title="Cancle"
            @click="cancel"
          >
            <template #icon>
              <i class="fal fa-undo fa-lg" />
            </template>
            {{ $t('app.btn.cancel') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'
import wrapperCurrentTime from '/imports/client/lib/wrap-current-time'

// Methods
import { findEmployees, fetchEmployees } from '../../../api/employees/methods'
// import { findRateDeialLengths } from '../api/transaction/methods'
import {
  findCashDepositById,
  insertCashDeposit,
  updateCashDeposit,
  removeCashDepositById,
  // fetchCashDepositEmp,
  DepositCurrencyBalance,
} from '../api/cash-deposit/methods'

import { findSettingById } from '../api/settings/methods'

// Components
import TransferDetails from '../components/TransferDetails.vue'
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElDatePicker,
  ElTable,
  ElTabs,
  ElTabPane,
  ElCard,
} from 'element-plus'
export default {
  name: 'TransferForm',
  components: {
    ElForm,
    ElFormItem,
    ElButton,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
    ElDatePicker,
    ElTable,
    ElTabs,
    ElTabPane,
    ElCard,

    TransferDetails,
  },
  mixins: [removeMixin],

  data() {
    return {
      showId: this.$route.params.id,
      employeeOpts: [],
      CashDeposit: [],
      transferDetailInit: [],
      transferDetails: [],
      loading: false,
      itemError: [],
      firstShowForm: false,
      firstShowTranDate: moment().toDate(),
      form: {
        tranDate: moment().toDate(),
        employeeId: '',
        fromEmployeeId: '',
        branchId: this.currentBranchId,
        tranType: 'Transfer',
      },
      rules: {
        employeeId: [
          {
            required: true,
            message: 'Employee is required',
            trigger: 'change',
          },
        ],
        fromEmployeeId: [
          {
            required: true,
            message: 'Employee is required',
            trigger: 'change',
          },
        ],
        tranDate: [{ required: true, message: 'Date is required' }],
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },
  watch: {
    // Change branchId
    currentBranchId() {
      this.getEmployee()

      this.getCashDeposit()
      this.resetForm()
    },
    'form.fromEmployeeId'(val) {
      if (val) {
        this.getCashDeposit()
        if (!this.firstShowForm) this.form.employeeId = ''
      }
    },
    'form.tranDate'(val) {
      if (val) {
        this.getCashDeposit()
      }
    },
  },
  activated() {
    this.getEmployee()
    this.getCashDeposit()
  },
  created() {
    if (this.showId) {
      this.getDataUpdate()
    }
  },
  methods: {
    getDefaultSetting() {
      this.loading = true
      const selector = {
        branchId: this.currentBranchId,
      }
      findSettingById
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.form.fromEmployeeId = result.employeeId
          }
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    handlerItemDetailCheng(result, opts) {
      const { errorIndex } = opts
      this.transferDetails = result
      this.itemError = errorIndex
      // this.accountDetails = result
    },
    // Get Employee
    getEmployee() {
      this.loading = true
      const selector = {}
      if (this.currentBranchId) selector.branchId = this.currentBranchId

      fetchEmployees
        .callPromise({ selector })
        .then((result) => {
          this.employeeOpts = result
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          Notify.error({ message: err })
        })
    },

    getCashDeposit() {
      const selector = {
        employeeId: this.form.fromEmployeeId,
        fromEmployeeId: this.form.fromEmployeeId,
        branchId: this.currentBranchId,
        fromDate: moment(this.form.tranDate).startOf('day').toDate(),
        toDate: moment(this.form.tranDate).endOf('day').toDate(),
      }

      DepositCurrencyBalance.callPromise({ selector, cashId: this.showId })
        .then((result) => {
          if (result) {
            this.CashDeposit = result
            this.loading = false
          } else {
            this.CashDeposit = []
            this.tableTotal = 0
            this.loading = false
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
          Notify.error({ message: err })
        })
    },

    getDataUpdate() {
      this.firstShowForm = true
      this.loading = true
      findCashDepositById
        .callPromise({ _id: this.showId })
        .then((result) => {
          this.form = result.doc
          this.transferDetails = result.details
          this.firstShowTranDate = result.doc.tranDate
          // Details
          this.transferDetailInit = result.details

          this.$nextTick(() => {
            this.firstShowForm = false
          })
        })
        .catch((error) => {
          this.$store.dispatch('app/messageE', error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit(tranType) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = false
          this.form.branchId = this.currentBranchId
          this.form.tranDate = wrapperCurrentTime(this.form.tranDate)
          if (this.itemError.length > 0) {
            this.$store.dispatch(
              'app/messageE',
              `Please insert the amount correctly!`
            )
            this.loading = false
            return false
          }
          if (this.transferDetails.length > 0) {
            // Check form type
            if (tranType == 'insert') {
              this.insert()
            } else {
              this.update()
            }
          } else {
            this.$store.dispatch('app/messageE', `Details is empty!`)
          }
        } else {
          return false
        }
      })
    },
    insert() {
      insertCashDeposit
        .callPromise({ doc: this.form, details: this.transferDetails })
        .then((result) => {
          if (result) {
            this.transferDetailInit = []
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
      updateCashDeposit
        .callPromise({ doc: this.form, details: this.transferDetails })
        .then((result) => {
          if (result) {
            this.loading = false
            this.$store.dispatch('app/messageS', `Transfer update`)
            this.cancel()
            // this.resetForm()
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
          item: 'Transfer',
        })
        .then(() => {
          this.loading = true
          removeCashDepositById
            .callPromise({ _id: this.showId })
            .then((res) => {
              this.loading = false
              this.cancel()
              this.$store.dispatch('app/messageS', `Transfer  deleted`)
            })
            .catch((err) => {
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },
    cancel() {
      this.$store.dispatch('app/delView').then((res) => {
        this.$router.back()
      })
    },

    resetForm() {
      // this.getDefaultSetting()
      this.$refs['form'].resetFields()
      this.firstShowTranDate = ''
      this.getCashDeposit()
      // this.getCashDepositEmp()
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.question {
  color: #e1b731;
}
</style>
<style>
.header-table {
  color: #fff !important;
  background-color: rgb(190, 190, 190) !important;
}

.row-table {
  color: #313133;
  background-color: rgb(224, 224, 224) !important;
}
</style>
