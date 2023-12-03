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
          :label="$t('exchange.rate-details.No')"
          width="70px"
          align="center"
        />
        <!--Base Currecy -->
        <el-table-column
          prop="baseExchangeCurrencyId"
          :label="$t('exchange.rate-details.BaseCurrency')"
          align="left"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :key="scope.$index + '.baseExchangeCurrencyId'"
              :prop="'items.' + scope.$index + '.BaseCurrency'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('exchange.rate-details.BaseCurrency')"
                v-model="scope.row.baseExchangeCurrencyId"
                :size="formSize"
                filterable
                automatic-dropdown
                default-first-option
                clearable
                remote
                placeholder="Base Exchange Currency"
                @change="handleBaseNameChange(scope.row)"
              >
                <el-option
                  v-for="doc in filteredCurrencyOpts"
                  :key="doc._id"
                  :label="doc.name"
                  :value="doc._id"
                  :disabled="doc._id === scope.row.toExchangeCurrencyId"
                >
                  <span v-html="doc.name" />
                </el-option>
              </el-select>
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-left"
            >
              {{ scope.row.baseName }}
            </span>
          </template>
        </el-table-column>

        <!--To Currecy -->
        <el-table-column
          prop="toExchangeCurrencyId"
          :label="$t('exchange.rate-details.ToCurrency')"
          align="left"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :key="scope.$index + '.toExchangeCurrencyId'"
              :prop="'items.' + scope.$index + '.ToCurrency'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('exchange.rate-details.ToCurrency')"
                v-model="scope.row.toExchangeCurrencyId"
                :size="formSize"
                filterable
                automatic-dropdown
                clearable
                remote
                placeholder="To Exchange Currency"
                @change="handleToNameChange(scope.row)"
              >
                <el-option
                  v-for="doc in currencyOpts"
                  :key="doc._id"
                  :label="doc.name"
                  :value="doc._id"
                  :disabled="doc._id === scope.row.baseExchangeCurrencyId"
                >
                  <span v-html="doc.name" />
                </el-option>
              </el-select>
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-left"
            >
              {{ scope.row.toName }}
            </span>
          </template>
        </el-table-column>

        <!-- bid  -->
        <el-table-column
          prop="Bid"
          :label="$t('exchange.rate-details.Bid')"
          align="center"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :prop="'items.' + scope.$index + '.Bid'"
              class="form-item"
              style="margin: 0"
            >
              <!-- <el-input-number
                :ref="$t('exchange.rate-details.Bid')"
                v-model.number="scope.row.bid"
                v-inputmask="numericMask"
                :size="formSize"
                :min="0"
                autofocus
                :controls="false"
                style="width: 100%"
                @focus="$event.target.select()"
              /> -->
              <InputNumberMask
                :ref="$t('exchange.rate-details.Bid')"
                v-model.number="scope.row.bid"
                :size="formSize"
                :min="0"
                autofocus
                :zero-precision="true"
                style="width: 100%"
                @focus="$event.target.select()"
              />
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-right"
            >
              {{ $filters.numberDigit(scope.row.bid) }}
            </span>
          </template>
        </el-table-column>
        <!-- ask  -->
        <el-table-column
          prop="Ask"
          :label="$t('exchange.rate-details.Ask')"
          align="center"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :prop="'items.' + scope.$index + '.Ask'"
              class="form-item"
              style="margin: 0"
            >
              <!-- <el-input-number
                :ref="$t('exchange.rate-details.Ask')"
                v-model.number="scope.row.ask"
                v-inputmask="numericMask"
                :size="formSize"
                :min="scope.row.bid"
                autofocus
                :controls="false"
                style="width: 100%"
                @focus="$event.target.select()"
              /> -->
              <InputNumberMask
                :ref="$t('exchange.rate-details.Ask')"
                v-model.number="scope.row.ask"
                :size="formSize"
                :min="scope.row.bid"
                autofocus
                style="width: 100%"
                :zero-precision="true"
                @focus="$event.target.select()"
              />
            </el-form-item>

            <span
              v-else
              id="LabelClick"
              class="text-right"
            >
              {{ $filters.numberDigit(scope.row.ask) }}
            </span>
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

import Notify from '/imports/client/lib/notify'

// methods
import { fetchExchangeCurrency } from '../api/exchange-currency/methods'

import {
  round,
  includes,
  cloneDeep,
  defaults,
  find,
  isNull,
  reject,
  split,
  times,
} from 'lodash'
import InputNumberMask from '/imports/client/components/InputNumberMask.vue'

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
  name: 'ExchangeRateDetail',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  components: {
    InputNumberMask,
    // [Form.name]: Form,
    // [FormItem.name]: FormItem,
    // [Select.name]: Select,
    // [Option.name]: Option,
    // [Input.name]: Input,
    // [InputNumber.name]: InputNumber,
  },
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
        return ['baseExchangeCurrencyId', 'toExchangeCurrencyId', 'bid', 'ask']
      },
    },
    rows: {
      type: Number,
      default: 3,
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
    // Validate
    const validateBid = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('Error'))
      } else {
        const splitVal = split(rule.field, '.')
        const crVal = this.form.items[splitVal[1].bid]

        if (value === 0 && crVal === 0) {
          callback(new Error('Error'))
        }
        callback()
      }
    }
    const validateAsk = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('Error'))
      } else {
        const splitVal = split(rule.field, '.')
        const crVal = this.form.items[splitVal[1].ask]

        if (value === 0 && crVal === 0) {
          callback(new Error('Error'))
        }
        callback()
      }
    }
    // const validateExist = (rule, value, callback) => {
    //   if (!value) {
    //     return callback(new Error('Name is requiered'))
    //   } else if (value) {
    //     let valueArr = this.form.items.map((item) => {
    //       return item.exchangeCurrencyId
    //     })
    //     let isDuplicate = valueArr.some(function (item, idx) {
    //       return valueArr.indexOf(item) != idx
    //     })
    //     if (isDuplicate == true) {
    //       return callback(new Error('Name is exist'))
    //     } else {
    //       return callback()
    //     }
    //   } else {
    //     return callback()
    //   }
    // }

    return {
      loading: false,
      removeAction: false,
      currencyOpts: [],
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
      rules: {
        // exchangeCurrencyId: [
        //   { validator: validateExist, required: true, trigger: 'blur' },
        // ],
        //exchangeCurrencyId: [{ validator: validateExist, trigger: 'blur' }],
        baseExchangeCurrencyId: [
          {
            message: 'Base Currency is required',
            required: true,
            trigger: 'blur',
          },
        ],
        toExchangeCurrencyId: [
          {
            message: 'To Currency is required',
            required: true,
            trigger: 'blur',
          },
        ],
        bid: [{ validator: validateBid, trigger: 'blur' }],
        ask: [{ validator: validateAsk, trigger: 'blur' }],
      },
      currentRowIndex: null,
      currentRowIndexActive: false,
    }
  },
  computed: {
    filteredCurrencyOpts() {
      return this.currencyOpts.filter((currency) => currency.base === true)
    },
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
      mask.digits = 6
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
              baseExchangeCurrencyId: it.baseExchangeCurrencyId,
              toExchangeCurrencyId: it.toExchangeCurrencyId,
              // baseExchangeCurrencyId: round(it.baseExchangeCurrencyId, 6),
              // toExchangeCurrencyId: round(it.toExchangeCurrencyId, 6),

              baseName: it.baseName,
              toName: it.toName,
              // rate: it.rate,
              bid: it.bid,
              ask: it.ask,
              status: it.status,
            })
          })
          this.$nextTick(() => {
            // this.emitToParent()
            this.form.items = items
            // this.form.baseExchangeCurrencyId = it.baseExchangeCurrencyId
            //console.log('items', items)
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
          if (
            it.baseExchangeCurrencyId &&
            it.toExchangeCurrencyId &&
            it.bid &&
            it.ask
          ) {
            delete it.baseName
            delete it.toName
            itemsTmp.push(it)
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
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getCurrency()
      }
    },
  },
  created() {
    this.getCurrency()
  },
  methods: {
    // fetch currency
    isDisabled: function (doc) {
      return this.form.items
        .map((item) => item.exchangeCurrencyId)
        .includes(doc._id)
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
    // Visible new action
    visibleNewAction(index) {
      return this.form.items.length - 1 === index
    },

    // Visible remove action
    visibleRemoveAction() {
      return this.form.items.length >= this.minRow + 1
    },

    // Add new row
    addEmptyRow(count) {
      times(count, (time) => {
        const row = {
          // exchangeCurrencyId: '',
          baseExchangeCurrencyId: '',
          toExchangeCurrencyId: '',
          // rate: 0,
          bid: 0,
          ask: 0,
          baseName: '',
          toName: '',
          status: 'active',
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
          // label === `${this.$t('exchange.rate-details.Currency')}` ||
          label === `${this.$t('exchange.rate-details.BaseCurrency')}` ||
          label === `${this.$t('exchange.rate-details.ToCurrency')}` ||
          label === `${this.$t('exchange.rate-details.Bid')}` ||
          label === `${this.$t('exchange.rate-details.Ask')}`
          // label === `${this.$t('exchange.rate-details.Rate')}`
        ) {
          const newCurrentRowIndex = this.form.items.indexOf(row)

          if (newCurrentRowIndex !== this.currentRowIndex) {
            this.focusRow({
              focusOn: label,
              currentRowIndex: newCurrentRowIndex,
            })
          } else {
            // this.focusOrSelectInput(label)
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

    // Outside Click
    unsetCurrentRowIndex(e) {
      if (e && e.target && e.target.id !== 'LabelClick') {
        this.currentRowIndex = null
      }
    },

    handleChartAccountChange(row) {
      this.$nextTick(() => {
        // Set account label
        const { Account } = this.$tm('exchange.rate-details')
        row.chartAccountLabel = this.$refs[Account].selectedLabel

        // Check has empty row
        this.$nextTick(() => {
          const emptyRow = find(this.form.items, { exchangeCurrencyId: '' })
          if (!emptyRow) {
            this.addEmptyRow(1)
          } else {
            // this.emitToParent()
          }
        })
      })
    },

    // handleRateChange(row) {
    //   if (row.rate != 0) row.rate = 0
    // },

    handleCurrencyChange(row) {
      if (row.baseExchangeCurrencyId != 0) row.baseExchangeCurrencyId = 0
      if (row.toExchangeCurrencyId != 0) row.toExchangeCurrencyId = 0
    },

    // handleNameChange(row) {
    //   row = row || []
    //   this.currencyOpts.forEach((it) => {
    //     if (row == it._id) {
    //       this.currencyName = it.name
    //       console.log('name', this.currencyName)
    //     }
    //   })
    // },
    handleBaseNameChange(row) {
      // Set account label
      this.$nextTick(() => {
        const { BaseCurrency } = this.$tm('exchange.rate-details')
        // console.log(Currency)
        row.baseName = this.$refs[BaseCurrency].selectedLabel
        // this.emitToParent()
      })
    },
    handleToNameChange(row) {
      // Set account label
      this.$nextTick(() => {
        const { ToCurrency } = this.$tm('exchange.rate-details')
        // console.log(Currency)
        row.toName = this.$refs[ToCurrency].selectedLabel
        // this.emitToParent()
      })
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

    // Focus & Select Input
    focusOrSelectInput(ref) {
      // if (ref === 'Account' || ref === 'Name' || ref === 'Class') {
      const { BaseCurrency, ToCurrency, Bid, Ask } = this.$tm(
        'exchange.rate-details'
      )
      if (
        ref === BaseCurrency ||
        ref === ToCurrency ||
        ref === Bid ||
        ref === Ask
      ) {
        this.$refs[ref]?.focus()
      } else {
        this.$refs[ref]?.select()
      }
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
