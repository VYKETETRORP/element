<template>
  <div>
    <!--Table List-->
    <el-form
      ref="form"
      v-loading.body="loading"
      :model="form"
    >
      <el-table
        v-click-outside="unsetCurrentRowIndex"
        :data="form.items"
        :header-cell-style="{
          'text-transform': 'uppercase',
          padding: '8px 0px',
        }"
        :cell-style="{ padding: '3px 0px', height: '40px' }"
        :size="formSize"
        :row-style="tableRowStyle"
        stripe
        border
        :resizable="true"
        highlight-current-row
        style="width: 100%"
        @header-click="handleHeaderClick"
        @cell-click="handleCellClick"
      >
        <!-- No -->
        <el-table-column
          type="index"
          :label="$t('exchange.transaction-details.no')"
          width="50px"
        />

        <!-- Currecy -->
        <el-table-column
          prop="exchangeId"
          :label="$t('exchange.transaction-details.exchange')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :key="scope.$index + '.exchangeId'"
              :prop="'items.' + scope.$index + '.exchangeId'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('exchange.transaction-details.exchange')"
                v-model="scope.row.exchangeId"
                :size="formSize"
                filterable
                automatic-dropdown
                clearable
                remote
                placeholder="Exchange Currency"
                @change="handleNameChange(scope.row)"
              >
                <el-option
                  v-for="(doc, index) in currencyRateOpts"
                  :key="index"
                  :label="doc.label"
                  :value="doc.value"
                  :disabled="isDisabled(doc)"
                >
                  <span v-html="doc.label" />
                </el-option>
              </el-select>
            </el-form-item>
            <span
              v-else
              id="LabelClick"
            >
              {{ scope.row.currencyName }}
            </span>
          </template>
        </el-table-column>
        <!-- Receive -->
        <el-table-column
          prop="received"
          :label="$t('exchange.transaction-details.received')"
          align="center"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :prop="'items.' + scope.$index + '.received'"
              class="form-item"
              style="margin: 0"
            >
              <!-- v-inputmask="numericMask" -->
              <el-input-number
                :ref="$t('exchange.transaction-details.received')"
                v-model.number="scope.row.received"
                :size="formSize"
                :min="0"
                :controls="false"
                style="width: 100%"
                autofocus
                @focus="$event.target.select()"
                @change.native="handleReceivedChange(scope.row)"
              />
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.received,
                  scope.row.baseSymbol
                )
              }}
            </span>
          </template>
        </el-table-column>
        <!-- Exchange Amount -->
        <el-table-column
          prop="exchangeAmount"
          :label="$t('exchange.transaction-details.exchangeAmount')"
          align="center"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :prop="'items.' + scope.$index + '.exchangeAmount'"
              class="form-item"
              style="margin: 0"
            >
              <!-- v-inputmask="numericMask" -->
              <el-input-number
                :ref="$t('exchange.transaction-details.exchangeAmount')"
                v-model.number="scope.row.exchangeAmount"
                :size="formSize"
                :min="0"
                :max="scope.row.received"
                :controls="false"
                autofocus
                style="width: 100%"
                @focus="$event.target.select()"
                @change.native="handleExchAmountChange(scope.row)"
              />
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.exchangeAmount,
                  scope.row.baseSymbol
                )
              }}
            </span>
          </template>
        </el-table-column>
        <!-- Amount -->
        <el-table-column
          prop="amount"
          :label="$t('exchange.transaction-details.amount')"
          align="center"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :prop="'items.' + scope.$index + '.amount'"
              class="form-item"
              style="margin: 0"
            >
              <!-- v-inputmask="numericMask" -->
              <el-input-number
                :ref="$t('exchange.transaction-details.amount')"
                v-model.number="scope.row.amount"
                :size="formSize"
                :min="0"
                :controls="false"
                autofocus
                style="width: 100%"
                @focus="$event.target.select()"
                @change.native="handleAmountChange(scope.row)"
              />
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.amount,
                  scope.row.toSymbol
                )
              }}
            </span>
          </template>
        </el-table-column>
        <!-- Return -->
        <el-table-column
          prop="return"
          :label="$t('exchange.transaction-details.return')"
          align="center"
        >
          <template #default="scope">
            <div class="text-right">
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.return,
                  scope.row.baseSymbol
                )
              }}
            </div>
          </template>
        </el-table-column>
        <!-- Action -->
        <el-table-column
          header-align="center"
          align="left"
          width="61px"
          class="action"
        >
          <template #header>
            <i class="el-icon-menu popover-icon" />
          </template>

          <template #default="scope">
            <i
              v-if="visibleRemoveAction()"
              class="el-icon-remove remove-action"
              @click="removeRowByIndex(scope.row)"
            />
            <i
              v-if="visibleNewAction(scope.$index)"
              class="el-icon-circle-plus new-action"
              @click="addEmptyRow(1)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import Vue from 'vue'
import vClickOutside from 'click-outside-vue3'
Vue.use(vClickOutside)
import Notify from '/imports/client/lib/notify'
import round from '/imports/api/lib/round'
import { Decimal } from 'decimal.js'
// methods
import { fetchExchangeRateOperator } from '../api/exchange-rates/methods'
import {
  includes,
  cloneDeep,
  defaults,
  find,
  isNull,
  reject,
  split,
  times,
} from 'lodash'
import TransactionFormVue from '../pages/TransactionForm.vue'

// // Component
// import {
//   Form,
//   FormItem,
//   Select,
//   Option,
//   Input,
//   InputNumber,
// } from 'element-plus'
export default {
  name: 'TransactionDetail',
  // components: {
  //   [Form.name]: Form,
  //   [FormItem.name]: FormItem,
  //   [Select.name]: Select,
  //   [Option.name]: Option,
  //   [Input.name]: Input,
  //   [InputNumber.name]: InputNumber,
  // },
  props: {
    items: {
      type: Array,
      default: function () {
        return []
      },
    },
    columns: {
      type: Array,
      default: function () {
        return ['exchangeRateDetailId', 'received']
      },
    },
    rows: {
      type: Number,
      default: 2,
    },
    minRow: {
      type: Number,
      default: 0,
    },
    totalDifference: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      removeAction: false,
      currencyRateOpts: [],
      checkedMoreColumns: this.columns,
      formSize: 'large',
      inactiveIds: [],
      // Emit
      itemResult: [],
      itemError: [],
      itemErrorIndex: [],

      form: {
        items: this.items,
      },

      //currencyName: '',
      rules: {},
      currentRowIndex: null,
      currentRowIndexActive: false,
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    setting() {
      let setting = this.$store.state.app.company
      setting = (setting && setting.setting) || { decimalNumber: 2 }
      return setting
    },

    numericMask() {
      const mask = this.$store.state.app.numericMask
      mask.allowMinus = false
      return mask
    },
  },
  watch: {
    // Init items
    items: {
      handler(newVal) {
        // Check exist default value
        if (newVal.length) {
          const items = []
          newVal.forEach((it) => {
            // Items
            items.push({
              exchangeRateDetailId: it.exchangeRateDetailId,
              currencyName: `${it.currencyName} - (${it.rate})`,
              received: it.received,
              exchangeAmount: it.exchangeAmount,
              amount: it.amount,
              return: it.return,
              baseSymbol: it.baseSymbol,
              toSymbol: it.toSymbol,
              type: it.type,
              baseCurrencyId: it.baseCurrencyId,
              toCurrencyId: it.toCurrencyId,
            })
          })
          this.$nextTick(() => {
            // this.emitToParent()
            this.form.items = items
          })
        } else {
          this.form.items = []
          this.addEmptyRow(this.rows)
        }
      },
      immediate: true,
      deep: true,
    },
    // Form items
    'form.items': {
      handler(val) {
        const itemsTmp = []
        const itemsErrorTmp = []
        this.itemErrorIndex = []
        cloneDeep(val).forEach((it, index) => {
          if (it.exchangeRateDetailId && it.received) {
            // delete it.currencyName
            // delete it.return
            // delete it.rate
            // delete it.baseSymbol
            // delete it.toSymbol

            itemsTmp.push({
              exchangeRateDetailId: it.exchangeRateDetailId,
              received: it.received,
              exchangeAmount: it.exchangeAmount,
              amount: it.amount,
              type: it.type,
              baseCurrencyId: it.baseCurrencyId,
              toCurrencyId: it.toCurrencyId,
            })
          } else {
            this.itemErrorIndex.push(index)
            itemsErrorTmp.push(it)
          }
        })
        this.itemResult = itemsTmp
        this.itemError = itemsErrorTmp
        this.$nextTick(() => {
          this.emitToParent()
        })
      },
      // immediate: true,
      deep: true,
    },
    // change Branch
    currentBranchId() {
      this.getExchangeRateOperator()
    },
  },
  activated() {
    this.getExchangeRateOperator()
  },
  methods: {
    // fetch currency
    isDisabled: function (doc) {
      return this.form.items.map((item) => item.exchangeId).includes(doc.value)
    },
    getExchangeRateOperator() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchExchangeRateOperator
        .callPromise({ selector })
        .then((result) => {
          this.currencyRateOpts = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },

    // Visible new action
    visibleNewAction(index) {
      return this.form.items.length - 1 === index
    },

    // Visible remove action
    visibleRemoveAction() {
      return this.form.items.length >= this.minRow
      // return this.form.items.length >= this.minRow + 1
    },

    // Add new row
    addEmptyRow(count) {
      times(count, (time) => {
        const row = {
          exchangeId: '',
          exchangeRateDetailId: '',
          received: 0,
          exchangeAmount: 0,
          amount: 0,
          return: 0,
          currencyName: '',
          baseSymbol: '',
          toSymbol: '',
          type: '',
          baseCurrencyId: '',
          toCurrencyId: '',
        }
        this.form.items.push(row)
      })

      // this.emitToParent()
    },

    addRow(row) {
      this.form.items.push(row)
    },

    // Remove row
    removeRow(selector) {
      this.form.items = reject(this.form.items, selector)
    },

    // Remove row by index
    removeRowByIndex(item) {
      const index = this.form.items.indexOf(item)
      if (index !== -1) {
        this.form.items.splice(index, 1)
      }
    },

    // Header Click
    handleHeaderClick() {
      this.unsetCurrentRowIndex()
    },

    // Cell click
    handleCellClick(row, column) {
      this.$nextTick(() => {
        const label = column.label
        if (
          label === `${this.$t('exchange.transaction-details.exchange')}` ||
          label === `${this.$t('exchange.transaction-details.received')}` ||
          label ===
            `${this.$t('exchange.transaction-details.exchangeAmount')}` ||
          label === `${this.$t('exchange.transaction-details.amount')}`
        ) {
          const newCurrentRowIndex = this.form.items.indexOf(row)
          if (newCurrentRowIndex !== this.currentRowIndex) {
            this.focusRow({
              focusOn: label,
              currentRowIndex: newCurrentRowIndex,
            })
          } else {
            this.focusOrSelectInput(label)
          }
        } else {
          this.unsetCurrentRowIndex()
        }
      })
    },
    //focus fieldName
    focusRow(opts) {
      opts = opts || {}
      defaults(opts, { focusOn: null, currentRowIndex: null })
      // Check focusOn and set current row
      if (!isNull(opts.currentRowIndex))
        this.currentRowIndex = opts.currentRowIndex
      this.$nextTick(() => {
        if (opts.focusOn) this.focusOrSelectInput(opts.focusOn)
      })
    },
    // Focus & Select Input
    focusOrSelectInput(ref) {
      // if (ref === 'Account' || ref === 'Name' || ref === 'Class') {
      const { exchange, received, exchangeAmount, amount } = this.$tm(
        'exchange.transaction-details'
      )
      if (
        ref === exchange ||
        ref === received ||
        ref === exchangeAmount ||
        ref === amount
      ) {
        this.$refs[ref].focus()
      } else {
        this.$refs[ref].select()
      }
    },

    // Outside Click
    unsetCurrentRowIndex(e) {
      if (e && e.target && e.target.id !== 'LabelClick') {
        this.currentRowIndex = null
      }
    },

    // handleChartAccountChange(row) {
    //   this.$nextTick(() => {
    //     // Set account label
    //     let { Account } = this.$tm('exchange.transaction-details')
    //     row.chartAccountLabel = this.$refs[Account].selectedLabel

    //     // Check has empty row
    //     this.$nextTick(() => {
    //       let emptyRow = find(this.form.items, { exchangeRateDetailId: '' })
    //       if (!emptyRow) {
    //         this.addEmptyRow(1)
    //       } else {
    //         // this.emitToParent()
    //       }
    //     })
    //   })
    // },

    handleReceivedChange(row) {
      if (row.exchangeAmount > row.received) {
        row.exchangeAmount = row.received
        this.handleExchAmountChange(row)
        row.return = row.received - row.exchangeAmount
      } else if (row.received > 0) {
        if (row.amount <= 0) {
          row.exchangeAmount = row.received
          this.handleExchAmountChange(row)
        } else if (row.amount > 0) {
          row.return = row.received - row.exchangeAmount
          // row.exchangeAmount = row.received
          // this.handleExchAmountChange(row)
        }
      }
    },
    handleExchAmountChange(row) {
      if (row.exchangeAmount > 0) {
        const getOpt = this.currencyRateOpts.find(
          (x) => x.value === row.exchangeId
        )
        row.amount =
          getOpt && getOpt.operator === '*' && getOpt.type === 'bid'
            ? round(
                Decimal.mul(
                  row.exchangeAmount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber(),
                3
              )
            : round(
                Decimal.div(
                  row.exchangeAmount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber(),
                3
              )
        row.amount = Math.floor(row.amount * 100) / 100
        row.return = round(
          Decimal.sub(row.received, row.exchangeAmount).toNumber(),
          7
        )
        if (!row.received) row.received = row.exchangeAmount
        if (row.exchangeAmount > row.received) row.exchangeAmount = row.received
      }
    },
    handleAmountChange(row) {
      if (row.exchangeId) {
        const getOpt = this.currencyRateOpts.find(
          (x) => x.value === row.exchangeId
        )
        const rowEx =
          getOpt && getOpt.operator === '*' && getOpt.type === 'bid'
            ? round(
                Decimal.div(
                  row.amount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber(),
                3
              )
            : round(
                Decimal.mul(
                  row.amount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber(),
                3
              )
        if (rowEx > row.received) {
          row.exchangeAmount = round(rowEx, 2)
          row.received = round(rowEx, 2)
        } else {
          row.exchangeAmount = round(rowEx, 2)
        }
        if (row.received <= 0) row.received = row.exchangeAmount
        row.return = round(
          Decimal.sub(row.received, row.exchangeAmount).toNumber(),
          7
        )
        // if (!row.received) row.received = row.exchangeAmount
        // if (row.exchangeAmount > row.received) row.exchangeAmount = row.received
      }
    },
    handleCurrencyChange(row) {
      if (row.exchangeRateDetailId != 0) row.exchangeRateDetailId = 0
    },
    handleNameChange(row) {
      // Set account label
      const getOpt = this.currencyRateOpts.find(
        (x) => x.value === row.exchangeId
      )
      row.exchangeRateDetailId = getOpt.exchangeRateDetailId
      row.baseCurrencyId = getOpt && getOpt.baseCurrencyId
      row.toCurrencyId = getOpt && getOpt.toCurrencyId
      row.currencyName = getOpt && getOpt.label
      row.type = getOpt && getOpt.type
      row.baseSymbol = getOpt && getOpt.baseSymbol
      row.toSymbol = getOpt && getOpt.toSymbol
      this.$nextTick(() => {
        const { exchange } = this.$tm('exchange.transaction-details')
        row.currencyName = this.$refs[exchange].selectedLabel
      })
      if (row.exchangeId) this.handleReceivedChange(row)
      if (row.amount) this.handleAmountChange(row)
    },

    submit() {
      this.$refs['form'].validate((valid) => {
        this.$emit('submit-form', valid)
      })
    },

    emitToParent() {
      this.$emit('item-change', this.itemResult, {
        total: this.itemTotal,
        error: this.itemError,
        errorIndex: this.itemErrorIndex,
      })
    },

    tableRowStyle({ row, rowIndex }) {
      if (includes(this.itemErrorIndex, rowIndex)) {
        return { color: '#f56c6c' }
      }
      return ''
    },

    _round(val) {
      return round(val, this.setting.decimalNumber)
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.new-icon {
  color: #409eff;
}
.new-action {
  color: #409eff;
  cursor: pointer;
  font-size: large;
  &:hover {
    color: #66b1ff;
  }
}

.remove-icon {
  color: #f56c6c;
}
.remove-action {
  color: #f56c6c;
  cursor: pointer;
  font-size: large;
  &:hover {
    color: #f78989;
  }
}

.form-item {
  margin-bottom: 0px;
}
.el-select {
  width: 100%;
}

.popover-icon {
  font-size: 16px;
}
</style>
