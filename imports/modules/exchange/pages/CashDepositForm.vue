<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <span>
            <i :class="showId ? 'fas fa-edit' : 'fas fa-plus'" />
            {{ $t('exchange.customer-setting.CashDeposit') }}
          </span>
        </div>
      </template>
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="large"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.exchange-rate.TranDate')"
              prop="tranDate"
            >
              <el-date-picker
                v-model="form.tranDate"
                type="date"
                format="DD/MM/YYYY"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.Transaction.employee')"
              prop="employeeId"
            >
              <el-select
                v-model="form.employeeId"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in employeeOpts"
                  :key="item._id"
                  :label="item.name"
                  :value="item._id"
                  :disabled="isDisabled(item)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!--Sub Items List-->
        <el-tabs type="border-card">
          <el-tab-pane>
            <template #label>
              <i class="el-icon-date" />
              {{ $t('exchange.cash-deposit.Details') }}
            </template>
            <CashDepositDetails
              :items="depositDetailInit"
              :rows="1"
              :min-row="1"
              @item-change="changeRateDetail"
              @submit-form="submitRateDetailForm"
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
            :disabled="!$userIsInRole(['transaction-cash-deposit-insert'])"
            :tran-date="form.tranDate"
            type="primary"
            @click="submit('insert')"
          >
            <template #icon>
              <i class="fal fa-save fa-lg" />
            </template>
            {{ $t('app.btn.save') }}
          </submit-button>

          <submit-button
            v-if="showId && !activeRate"
            :disabled="!$userIsInRole(['transaction-cash-deposit-update'])"
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
          <submit-button
            v-if="showId && !activeRate"
            :disabled="!$userIsInRole(['transaction-cash-deposit-remove'])"
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
              <i class="fas fa-undo fa-lg" />
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
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'
import wrapperCurrentTime from '/imports/client/lib/wrap-current-time'

// Methods
import { findEmployees, fetchEmployees } from '../../../api/employees/methods'
import { findRateDeialLengths } from '../api/transaction/methods'
import {
  findCashDepositById,
  insertCashDeposit,
  updateCashDeposit,
  removeCashDepositById,
  fetchCashDeposit,
} from '../api/cash-deposit/methods'
import { findSettingById } from '../api/settings/methods'

// Components
import CashDepositDetails from '../components/CashDepositDatails.vue'
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElDatePicker,
  ElTabs,
  ElTabPane,
  ElCard,
} from 'element-plus'
export default {
  name: 'CashDepositForm',
  components: {
    ElForm,
    ElFormItem,
    ElButton,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
    ElDatePicker,
    ElTabs,
    ElTabPane,
    ElCard,
    CashDepositDetails,
  },
  mixins: [removeMixin],
  props: {
    formType: {
      type: String,
      default: 'New',
    },
  },
  data() {
    return {
      showId: this.$route.params.id,
      employeeOpts: [],
      depositDetailInit: [],
      depositDetails: [],
      DepositData: [],
      loading: false,
      validRateDetail: false,
      firstShowTranDate: moment().toDate(),
      form: {
        tranDate: moment().toDate(),
        employeeId: '',
        branchId: '',
        tranType: 'Deposit',
      },
      activeRate: null,
      rules: {
        employeeId: [
          {
            required: true,
            message: 'Employee is required',
            trigger: 'blur',
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
    showId: {
      immediate: true,
      handler: function (val) {
        if (val) {
          const type = this.$route.params.type
          if (type == 'update') {
            this.checkRateDetailInTransaction()
          }
        }
      },
      deep: true,
    },
    // Change branchId
    currentBranchId(val) {
      if (val) {
        // this.getDefaultSetting()
        this.getEmployee()
        this.getCashDepositData()
      }
    },
    // change form
    'form.tranDate'(val) {
      if (val) {
        this.getCashDepositData()
      }
    },
  },

  activated() {
    if (!this.showId) {
      // this.getDefaultSetting()
    }
    this.getEmployee()
    this.getCashDepositData()
  },
  created() {
    if (this.showId) {
      this.getDataUpdate()
      this.getCashDepositData()
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
            this.form.employeeId = result.employeeId
          }
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    isDisabled: function (doc) {
      const dis = this.DepositData.map((it) => it.employeeId).includes(doc._id)
      return dis
    },
    getCashDepositData() {
      const selector = {
        branchId: this.currentBranchId,
        tranType: 'Deposit',
        tranDate: {
          $gte: moment(this.form.tranDate).startOf('day').toDate(),
          $lte: moment(this.form.tranDate).endOf('day').toDate(),
        },
      }
      fetchCashDeposit
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.DepositData = result
            this.loading = false
          } else {
            this.DepositData = []
            this.loading = false
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
          Notify.error({ message: err })
        })
    },
    checkRateDetailInTransaction() {
      findRateDeialLengths.callPromise({ _id: this.showId }).then((result) => {
        this.activeRate = result.length
        // console.log(result.length)
        // console.log(result)
      })
    },
    submitRateDetailForm(valid) {
      this.validRateDetail = valid
    },
    changeRateDetail(result, opts) {
      const { total } = opts
      this.depositDetails = result

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
          //this.form.employeeId = result.selected
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          Notify.error({ message: err })
        })
    },
    cancel() {
      this.$store.dispatch('app/delView').then((res) => {
        this.$router.back()
      })
    },
    getDataUpdate() {
      this.loading = true
      findCashDepositById
        .callPromise({ _id: this.showId })
        .then((result) => {
          this.form = result.doc
          this.depositDetails = result.details
          this.firstShowTranDate = result.doc.tranDate
          // Details
          this.depositDetailInit = result.details
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
          if (this.depositDetails.length > 0) {
            // Check form type
            if (tranType == 'insert') {
              this.insert()
            } else {
              this.update()
            }
          } else {
            this.$store.dispatch('app/messageE', `Cash Deposit is empty`)
          }
        } else {
          return false
        }
      })
    },
    insert() {
      insertCashDeposit
        .callPromise({ doc: this.form, details: this.depositDetails })
        .then((result) => {
          if (result) {
            this.depositDetailInit = []
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
        .callPromise({ doc: this.form, details: this.depositDetails })
        .then((result) => {
          if (result) {
            this.cancel()
            this.loading = false
            this.$store.dispatch('app/messageS', `Cash Deposit update`)
            // this.resetForm()
            this.handleModalClose()
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
          item: 'Cash Deposit',
        })
        .then(() => {
          this.loading = true
          removeCashDepositById
            .callPromise({ _id: this.showId })
            .then((res) => {
              this.loading = false
              this.cancel()
              this.$store.dispatch('app/messageS', `Cash Deposit  deleted`)
            })
            .catch((err) => {
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },

    resetForm() {
      // this.getDefaultSetting()
      this.$refs['form'].resetFields()
      this.firstShowTranDate = ''
      this.getCashDepositData()
    },
    handleModalClose() {
      this.$emit('modal-close')
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
