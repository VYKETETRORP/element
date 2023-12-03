<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <el-form
          ref="form"
          v-loading="loading.form"
          :model="form"
          :rules="rules"
          label-position="top"
          label-width="100px"
          :size="formSize"
        >
          <el-row :gutter="10">
            <el-col
              :xs="12"
              :sm="6"
              :md="6"
              :lg="6"
              :xl="6"
            >
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
            </el-col>
            <el-col
              :xs="12"
              :sm="6"
              :md="6"
              :lg="6"
              :xl="6"
            >
              <el-form-item
                :label="$t('exchange.Transaction.tranType')"
                prop="tranTypeId"
              >
                <el-select
                  v-model="form.tranTypeId"
                  filterable
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
            </el-col>
            <el-col
              :xs="12"
              :sm="6"
              :md="6"
              :lg="6"
              :xl="6"
            >
              <el-form-item
                :label="$t('exchange.customer.name')"
                prop="customerId"
                class="selection-btn"
              >
                <el-select
                  v-model="form.customerId"
                  :loading="loadingCustomer"
                  :remote-method="remoteMethod"
                  style="width: 100%"
                  filterable
                  remote
                  @focus="focusMethod"
                >
                  <template slot="empty">
                    <el-button
                      style="width: 100%; margin: 0px auto"
                      link
                      size="small"
                      @click="handleCustomer"
                    >
                      + Add
                    </el-button>
                  </template>
                  <el-option
                    v-for="customer in customerOpts"
                    :key="customer.value"
                    :label="customer.label"
                    :value="customer.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col
              :xs="12"
              :sm="6"
              :md="6"
              :lg="6"
              :xl="6"
            >
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
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>

      <el-row
        :gutter="10"
        class="flex flex-col-reverse md:flex-row"
      >
        <el-col
          :xs="24"
          :sm="24"
          :md="13"
          :lg="13"
          :xl="13"
        >
          <TranDetails
            :items="detailInit"
            :rows="1"
            :min-row="1"
            :currency-balance="CashDeposit"
            :reload="isReloadTranDetails"
            @item-change="changeRateDetail"
          />
          <el-form
            ref="form"
            v-loading="loading.form"
            :model="form"
            :rules="rules"
            label-position="left"
            label-width="100px"
            :size="formSize"
          >
            <!-- Button -->
            <el-form-item
              class="ra-text-right"
              style="margin-top: 10px"
            >
              <SubmitDropdown
                v-if="!showId && $userIsInRole(['transaction-exchange-insert'])"
                :com-name="`Exchange`"
                :dropdowns="dropdownOpts"
                :tran-date="form.tranDate"
                type="primary"
                :size="formSize"
                @click="submitForm"
                @command="saveMore"
              />
              <SubmitDropdown
                v-if="showId && $userIsInRole(['transaction-exchange-update'])"
                :com-name="`Exchange`"
                :dropdowns="dropdownOpts"
                :tran-date="form.tranDate"
                type="primary"
                :size="formSize"
                @click="submitForm"
                @command="saveMore"
              />
              <submit-button
                v-if="showId && $userIsInRole(['transaction-exchange-remove'])"
                type="danger"
                title="Remove"
                @click="remove"
              >
                <template #icon>
                  <i class="fas fa-trash-alt fa-lg" />
                </template>
                {{ $t('app.btn.delete') }}
              </submit-button>
              <el-button
                title="Cancel"
                type="warning"
                @click="reset"
              >
                <template #icon>
                  <i class="far fa-undo fa-lg" />
                </template>
                {{ $t('exchange.btn.reset') }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <el-col
          class="transaction"
          :xs="24"
          :sm="24"
          :md="11"
          :lg="11"
          :xl="11"
        >
          <!-- table exchange rate  -->
          <el-table
            stripe
            border
            :resizable="true"
            highlight-current-row
            :data="rateDateOpts"
            header-cell-class-name="header-cell"
            cell-class-name="row-cell"
            style="margin-bottom: 10px; border-radius: 7px"
          >
            <el-table-column>
              <template #header>
                <div class="flex justify-center items-center">
                  <span
                    class="text-white font-bold text-lg m-auto leading-loose"
                  >
                    {{ $t('exchange.exchange-rate.ExchangeRate') }}
                  </span>
                  <el-tooltip
                    :content="$t('exchange.exchange-rate.new')"
                    :enterable="false"
                    placement="top"
                    effect="dark"
                  >
                    <el-button
                      color="#ffffff"
                      size="small"
                      @click="handleShowExchangeRate"
                    >
                      <!--showNewExhangeDialog = true-->
                      <template #icon>
                        <i class="fas fa-plus"></i>
                      </template>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
              <el-table-column
                :label="$t('exchange.rate-details.BaseCurrency')"
                prop="baseName"
              >
                <template #default="scope">
                  <span style="font-size: 16px">{{ scope.row.baseName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('exchange.rate-details.ToCurrency')"
                prop="toName"
              >
                <template #default="scope">
                  <span style="font-size: 16px">{{ scope.row.toName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('exchange.rate-details.Bid')"
                prop="bid"
              >
                <template #default="scope">
                  <span class="numberRateStyle">{{ scope.row.bid }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('exchange.rate-details.Ask')"
                prop="ask"
              >
                <template #default="scope">
                  <span class="numberRateStyle">{{ scope.row.ask }}</span>
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>

          <!-- table open cash  -->
          <el-table
            style="margin-bottom: 10px; border-radius: 7px"
            stripe
            border
            :resizable="true"
            highlight-current-row
            :data="CashDeposit"
            header-cell-class-name="header-cell"
            cell-class-name="row-cell"
          >
            <el-table-column
              :label="$t('exchange.rate-details.Currency')"
              prop="toName"
            >
              <template #default="scope">
                <span style="font-size: 16px">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('exchange.rate-details.Amount')"
              prop="bid"
            >
              <template #default="scope">
                <span
                  v-if="scope.row.amount === 0 || scope.row.amount === null"
                  style="font-size: 24px; font-weight: bold; float: right"
                >
                  0{{ scope.row.symbol }}
                </span>
                <span
                  v-else
                  style="font-size: 24px; font-weight: bold; float: right"
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

      <exchange-invoice
        v-show="false"
        :id="currentId"
        :visible-printing="visiblePrinting"
        :paper-size="paperSize"
        @print-disable="printDisable"
      />

      <!-- Dialog Customer -->
      <el-dialog
        v-model="dialogFormVisible"
        :close-on-click-modal="false"
        :title="$t('exchange.menu.Customer')"
      >
        <CustomerForm @save="handleSave" />
      </el-dialog>

      <!-- Dialog Exchange Rate  -->
      <el-dialog
        v-model="showNewExhangeDialog"
        width="80%"
        :close-on-click-modal="false"
        :title="$t('exchange.exchange-rate.new')"
        @close="reloadExchangeRate"
      >
        <ExchangeRateForm
          :show-new-exhange-dialog="showNewExhangeDialog"
          @reloadExchangeRate="reloadExchangeRate"
        />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import _, { cloneDeep } from 'lodash'
import wrapperCurrentTime from '/imports/client/lib/wrap-current-time'
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'

// Methods
import {
  fetchEmployees,
  findEmployees,
  findOneEmployees,
} from '../../../api/employees/methods'
import { lookupCustomer } from '../api/customers/methods'
import {
  lookupEmployee,
  lookupEmployeeMapping,
} from '../../../api/lookups/employee'
import {
  findTransactionById,
  findOneTransaction,
  insertTransaction,
  updateTransaction,
  removeTransactionById,
} from '../api/transaction/methods'
import { findSettingById } from '../api/settings/methods'
import { fetchExchangeRate } from '../api/exchange-rates/methods'
import { DepositCurrencyBalance } from '../api/cash-deposit/methods'

// Components
import ExchangeInvoice from '../reports/exchangeInvoice.vue'
// import TransactionDetail from '../components/TransactionDetails.vue'
import TranDetails from '../components/TranDetails.vue'

import ExchangeRateForm from '../components/ExchangeRateForm.vue'

import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElTable,
  ElCard,
  ElTooltip,
} from 'element-plus'

export default {
  name: 'Transaction',
  components: {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
    ElTable,
    ElCard,
    ElTooltip,
    // TransactionDetail,
    TranDetails,
    ExchangeInvoice,
    ExchangeRateForm,

    CustomerForm: () => import('../components/CustomerForm.vue'),
  },
  mixins: [removeMixin],
  props: {
    formType: {
      type: String,
      default: 'New',
    },
  },
  data() {
    const validateCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Code is required'))
      }
      const selector = {
        refNo: `${this.prefix}${value}`,
        branchId: this.currentBranchId,
      }

      if (this.showId) {
        selector._id = { $ne: this.showId }
      }

      findOneTransaction
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            callback(new Error('This code is existed'))
          } else {
            callback()
          }
        })
        .catch((error) => {
          Notify.error({ message: error })
        })
    }
    return {
      rolesExchange: [
        { role: `transaction-exchange-insert`, type: `insert` },
        { role: `transaction-exchange-update`, type: `update` },
      ],
      formSize: 'large',
      showId: this.$route.params.id,
      currentId: '', //63804b3e83bfc867e79bb7cf
      visiblePrinting: false,
      paperSize: 'mini',
      customerOpts: [],
      employeeOpts: [],
      detailInit: [],
      details: [],
      loading: {
        form: false,
        refNo: '',
      },
      firstShowTranDate: moment().toDate(),
      loadingCustomer: false,
      isReloadTranDetails: null,
      form: {
        refNo: '',
        tranTypeId: '',
        tranDate: moment().toDate(),
        customerId: '',
        employeeId: [],
        memo: '',
        branchId: '',
      },
      tranTypeOpts: [],
      rateDateOpts: [],
      CashDepositOpts: [],
      CashDeposit: [],
      dialogFormVisible: false,
      rules: {
        refNo: [
          {
            validator: validateCode,
            required: true,
            trigger: 'blur',
          },
        ],
        tranTypeId: [
          {
            required: true,
            message: 'Tran Type is required',
            trigger: 'blur',
          },
        ],
        customerId: [
          {
            required: true,
            message: 'Customer is required',
            trigger: 'blur',
          },
        ],
        employeeId: [
          {
            required: true,
            message: 'Employee is required',
            trigger: 'blur',
          },
        ],
        tranDate: [{ required: true, message: 'Date is required' }],
      },
      showNewExhangeDialog: false,
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    prefix() {
      const prefix = this.$store.state.exchange.prefix
      return prefix && prefix['prefix']
    },
    dropdownOpts() {
      const opts = [
        // {
        //   label: `${this.$t('exchange.btn.saveAndClose')}`,
        //   command: `close`,
        //   index: 0,
        // },
        {
          label: `${this.$t('exchange.btn.saveAndPrint')}`,
          command: 'print',
          // attrs: { divided: true },
          index: 1,
        },
        {
          label: `${this.$t('exchange.btn.saveAndNew')}`,
          command: `new`,
          index: 2,
        },
      ]
      return opts
    },
  },
  watch: {
    currentBranchId() {
      this.resetForm()
      this._getCustomerData()
      this.getExchangeRate()
      this.getDefaultSetting()
      this.getCashDeposit()
    },
    form(val) {
      if (val) {
        this.getCashDeposit()
      }
    },
    'form.employeeId'(val) {
      if (val) {
        this.getCashDeposit()
      }
    },
  },
  //mounted() {
  //  this.getExchangeRate()
  //},
  // actived() {},
  created() {
    this._getRefPrefix()
    //this.getEmployee()
    this._getCustomerData()
    this.getExchangeRate()
    this.getTranTypeOpts()
    this.lookupEmployee()
    // this._getRefPrefix()
    // console.log('Activated')
    if (this.currentBranchId) {
      this.getDefaultSetting()
    }
    if (this.showId) {
      this.getCashDeposit()
      this.getDataUpdate()
    }
    if (!this.showId) this._getNextRefNum()
    this.getCashDeposit()
  },
  methods: {
    getTranTypeOpts() {
      Meteor.call('ex.fetchTranTypes', {}, (err, res) => {
        if (err) {
          Notify.error({ message: err.reason || err })
        } else {
          this.tranTypeOpts = res
        }
      })
    },
    // get cash deposit match with date and employee
    getCashDeposit() {
      const selector = {
        employeeId: this.form.employeeId,
        fromEmployeeId: this.form.employeeId,
        branchId: this.currentBranchId,
        fromDate: moment(this.form.tranDate).startOf('day').toDate(),
        toDate: moment(this.form.tranDate).endOf('day').toDate(),
      }
      if (this.showId) {
        selector._id = this.showId
        // selector._id = { $ne: this.showId }
      }
      DepositCurrencyBalance.callPromise({ selector })
        .then((result) => {
          if (result) {
            // console.log(result)
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
    // Get data
    getExchangeRate() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
        status: 'active',
      }
      fetchExchangeRate
        .callPromise({ selector })
        .then((result) => {
          this.rateDateOpts = result
          //console.log(result, 'result')
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    // lookup employee
    lookupEmployee() {
      this.loading = true
      const selector = {
        branchId: this.currentBranchId,
        //userId: this.currentUserId,
      }
      lookupEmployee
        .callPromise({ selector })
        .then(async (result) => {
          this.employeeOpts = result
          if (this.employeeOpts[0].selected) {
            this.form.employeeId = this.employeeOpts[0].value
          }
          this.loading.form = false
        })
        .catch((error) => {
          console.log(error)
          this.loading.form = false
          this.$store.dispatch('app/messageE', error)
        })
    },
    // advance setting
    getDefaultSetting() {
      this.loading = true
      const selector = {
        branchId: this.currentBranchId,
      }
      findSettingById
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.form.customerId = result.customerId
            this.form.employeeId = result.employeeId
            this.form.tranTypeId = result.tranTypeId || ''

            this.loading.form = true
            if (this.showId) {
              //this.getEmployee()
              this.getDataUpdate()
            } else {
              this.lookupEmployee()
              this.loading.form = false
              this.getCashDeposit()
            }
            this.loading = false
          }
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    handleCustomer() {
      this.$nextTick(() => {
        this.dialogFormVisible = true
      })
    },
    handleSave(res) {
      if (res) {
        this.dialogFormVisible = false
      }
    },
    focusMethod(event) {
      const result = event.target.value.split('|')
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
          //if (type === 'update') {
          //  this.handleCustomerChange(query)
          //}
          this.loadingCustomer = false
        })
        .catch((err) => {
          this.customerOpts = []
          this.loadingCustomer = false
          Notify.error({ message: err })
        })
    },
    // Get prefix
    _getRefPrefix() {
      this.$store.dispatch(
        'exchange/prefix/getRefPrefix',
        'Exchange_Transaction'
      )
    },
    // Get Next Referenece Number
    _getNextRefNum() {
      this.loading.refNo = 'Loading....'
      this.$store
        .dispatch('app/getNextSeq', {
          id: `ex_transactionRefNo${this.currentBranchId}`,
          defaultVal: `${this.prefix}000001`,
        })
        .then(async (res) => {
          this.loading.refNo = ''
          // Break prefix
          this.form.refNo = await this.$store.dispatch(
            'exchange/prefix/refPrefix',
            {
              value: res,
              types: 'Exchange_Transaction',
            }
          )
          // this.form.refNo = res
        })
    },
    changeRateDetail(result, opts) {
      const { total } = opts
      this.details = result

      // this.accountDetails = result
    },
    // Get data

    cancel() {
      this.$store.dispatch('app/delView', this.$route).then((res) => {
        this.$router.push({ name: 'CustomerCenter' })
      })
    },
    reset() {
      this.details = []
      this.detailInit = []
    },
    //getEmployee() {
    //  this.loading.form = true
    //  const selector = {
    //    branchId: this.currentBranchId,
    //  }
    //  fetchEmployees
    //    .callPromise({ selector })
    //    .then(async (result) => {
    //      this.employeeOpts = result
    //      this.loading.form = false
    //    })
    //    .catch((error) => {
    //      console.log(error)
    //      this.loading.form = false
    //      this.$store.dispatch('app/messageE', error)
    //    })

    //  this.loading.form = false
    //},
    getDataUpdate() {
      this.loading.form = true
      findTransactionById
        .callPromise({ _id: this.showId })
        .then(async (result) => {
          // Journal
          result.doc.refNo = await this.$store.dispatch(
            'exchange/prefix/refPrefix',
            {
              value: result.doc.refNo,
              types: `Exchange_Transaction`,
            }
          )
          this.form = result.doc
          this.remoteMethod(result.doc.customerId)
          this.details = result.details
          this.firstShowTranDate = result.doc.tranDate
          // Details
          this.detailInit = result.details
          this.loading.form = false
        })
        .catch((error) => {
          this.$store.dispatch('app/messageE', error)
        })
        .finally(() => {
          this.loading.form = false
        })
    },
    saveMore(command) {
      this.submitForm(command)
    },
    submitForm(type) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.details.length > 0) {
            this.details.forEach((it) => {
              if (!it.received) {
                this.$store.dispatch('app/messageE', 'Received is empty')
              } else if (!it.exchangeAmount) {
                this.$store.dispatch('app/messageE', 'Exchange Amount is empty')
              } else if (!it.amount) {
                this.$store.dispatch('app/messageE', 'Amount is empty')
              } else {
                // Check
                if (this.form.employeeId) {
                  const de = this.details.find((it) => it.amount)
                  if (de) {
                    if (this.CashDeposit && this.CashDeposit != null) {
                      const open = this.CashDeposit.find(
                        (it) => it._id === de.toCurrencyId
                      )
                      if (open) {
                        if (open.amount < de.amount) {
                          this.$confirm(
                            `ទឹកប្រាក់ដែលលក់ចេញ ${de.amount}${open.symbol} ចំនួនច្រើនជាងទឹកប្រាក់ដែលនៅសល់ក្នុងដៃ`,
                            'Warning',
                            {
                              closeOnClickModal: false,
                              confirmButtonText: 'យល់ព្រម',
                              cancelButtonText: 'បោះបង់',
                              type: 'warning',
                            }
                          ).then(() => {
                            this.$message({
                              type: 'success',
                              message: 'completed',
                            })
                            // Check
                            this.form.tranDate = wrapperCurrentTime(
                              this.form.tranDate
                            )
                            if (this.showId) {
                              this.updateDate(type)
                            } else {
                              this.insertData(type)
                            }
                          })
                        } else {
                          // Check
                          this.form.tranDate = wrapperCurrentTime(
                            this.form.tranDate
                          )
                          if (this.showId) {
                            this.updateDate(type)
                          } else {
                            this.insertData(type)
                          }
                        }
                      }
                    }
                  }
                } else {
                  this.$store.dispatch('app/messageE', `Employee is empty`)
                }
              }
            })
          } else if (!this.form.customerId) {
            this.$store.dispatch('app/messageE', `Customer is empty`)
          } else if (!this.form.employeeId) {
            this.$store.dispatch('app/messageE', `Employee is empty`)
          } else {
            this.$store.dispatch(
              'app/messageE',
              `Exchange Transaction is empty`
            )
          }
        } else {
          return false
        }
      })
    },
    insertData(submitType) {
      this.loading.form = true
      this.form.branchId = this.currentBranchId
      // Check form type
      const doc = cloneDeep(this.form)
      doc.refNo = `${this.prefix}${doc.refNo}`
      insertTransaction
        .callPromise({ doc: doc, details: this.details })
        .then((result) => {
          if (result) {
            this.loading.form = false
            //getExchangeRate()
            Notify.success({ message: 'Success' })
            switch (submitType) {
              case 'close':
                this.cancel()
                //this.getExchangeRate()

                break
              case 'new':
                this.resetForm()
                break
              case 'print':
                // this.paperSize = this.paperSizeMini
                this.currentId = result
                this.visiblePrinting = true
                break
            }
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading.form = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    updateDate(submitType) {
      this.form.refNo = `${this.prefix}${this.form.refNo}`
      updateTransaction
        .callPromise({ doc: this.form, details: this.details })
        .then((result) => {
          if (result) {
            this.loading.from = false
            this.$store.dispatch('app/messageS', `Transaction update`)
            switch (submitType) {
              case 'close':
                this.cancel()
                break
              case 'new':
                this.resetForm()
                break
              case 'print':
                // this.paperSize = this.paperSizeMini
                // this.resetForm()
                this.currentId = result
                this.visiblePrinting = true
                break
            }
          }
        })
        .catch((err) => {
          this.loading.form = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    remove() {
      this.$store
        .dispatch('app/confirm', {
          messageType: 'Delete',
          item: 'Transaction',
        })
        .then(() => {
          this.loading.form = true
          removeTransactionById
            .callPromise({ _id: this.showId })
            .then((res) => {
              this.loading.form = false
              this.cancel()
              this.$store.dispatch('app/messageS', `Transaction deleted`)
            })
            .catch((err) => {
              this.loading.form = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },
    printDisable() {
      // this.$store.dispatch('app/delView', this.$route).then((res) => {
      // this.$router.back()
      // this.$router.push({
      //   name: 'Transaction',
      //   params: { type: 'new' },
      // })
      // })
      this.resetForm()
      this.$nextTick(() => {
        this.visiblePrinting = false
        this.currentId = ''
      })
    },

    resetForm() {
      if (this.showId) {
        this.showId = ''
        this.$store.dispatch('app/delView', this.$route).then((res) => {
          this.$router.push({
            name: 'Transaction',
            params: { type: 'new' },
          })
        })
      }
      this.$refs['form'].resetFields()
      this.firstShowTranDate = ''
      this.detailInit = []
      this.details = []
      this._getNextRefNum()
      this.getDefaultSetting()
      this.getCashDeposit()
    },
    handleShowExchangeRate() {
      this.showNewExhangeDialog = true
      this.isReloadTranDetails = false
    },
    reloadExchangeRate() {
      this._getRefPrefix()
      //this.getEmployee()
      this._getCustomerData()
      this.getExchangeRate()
      this.getTranTypeOpts()
      this.getExchangeRate()

      // console.log('Activated')
      if (this.currentBranchId) {
        this.getDefaultSetting()
      }
      if (this.showId) {
        this.getCashDeposit()
        this.getDataUpdate()
      }
      if (!this.showId) this._getNextRefNum()
      this.getCashDeposit()

      this.$nextTick(() => {
        this.isReloadTranDetails = true
        this.showNewExhangeDialog = false
      })
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
/* // for add new on form */
.selection-btn {
  .el-select {
    position: absolute;
  }
  .el-button {
    float: right;
    position: relative; // right: 0;
  }
}

.el-button--small {
  padding: 8px 15px;
}
.numberRateStyle {
  font-weight: bold;
  color: rgb(0, 119, 255) !important;
  font-size: 24px;
}
.text-style {
  font-size: 16px;
}
.table-row {
  background: rgb(161, 20, 20) !important;
}
</style>

<style>
.transaction > .el-table th > .cell {
  color: #ffffff !important;
}

.transaction > .el-table th {
  background-color: #2155cd !important;
}

/* .transaction >  */
.row-cell {
  color: #ffffff !important;
  background-color: rgb(224, 224, 224) !important;
}

/* exchange rate  */
.main-header {
  background-color: #2155cd;
  border-radius: 4px;
  padding: 4px 6px;
  min-height: 30px;
}
.main-title {
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
}
.btn-exchange__rate {
  float: right;
  min-height: 30px;
}
</style>
