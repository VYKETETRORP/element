<template>
  <div>
    <!--Table List-->
    <el-form
      ref="form"
      v-loading.body="loading"
      :model="form"
    >
      <!-- v-click-outside="unsetCurrentRowIndex" -->
      <el-table
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
      >
        <!-- @header-click="handleHeaderClick" -->
        <!-- @cell-click="handleCellClick" -->
        <!-- No -->
        <el-table-column
          type="index"
          :label="$t('exchange.rate-details.No')"
          width="50px"
          align="center"
        />
        <!-- Currecy -->
        <el-table-column
          prop="currencyId"
          :label="$t('exchange.rate-details.Currency')"
          align="left"
        >
          <template #default="scope">
            <span
              id="LabelClick"
              class="text-left"
            >
              {{ scope.row.currencyName }}
            </span>
            <!-- v-if="scope.$index === currentRowIndex" -->
            <!-- <el-form-item
              :key="scope.$index + '.currencyId'"
              :prop="'items.' + scope.$index + '.Currency'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('exchange.rate-details.Currency')"
                v-model="scope.row.currencyId"
                :size="formSize"
                filterable
                automatic-dropdown
                clearable
                remote
                disabled
                placeholder="Exchange Currency"
                @change="handleCurrencyNameChange(scope.row)"
              >
                <el-option
                  v-for="doc in currencyOpts"
                  :key="doc._id"
                  :label="doc.name"
                  :value="doc._id"
                  :disabled="isDisabled(doc)"
                >
                  <span v-html="doc.name" />
                </el-option>
              </el-select>
            </el-form-item> -->

            <!-- <span
              v-else
              id="LabelClick"
              class="text-left"
            >
              {{ scope.row.currencyName }}
            </span> -->
          </template>
        </el-table-column>

        <!-- Amount  -->
        <el-table-column
          prop="Amount"
          :label="$t('exchange.rate-details.Amount')"
          align="center"
        >
          <template #default="scope">
            <!-- v-if="scope.$index === currentRowIndex" -->
            <el-form-item
              :prop="'items.' + scope.$index + '.Amount'"
              class="form-item"
              style="margin: 0"
            >
              <!-- <el-input-number
                :ref="$t('exchange.rate-details.Amount')"
                v-model.number="scope.row.amount"
                v-inputmask="numericMask"
                :size="formSize"
                :min="0"
                autofocus
                :controls="false"
                style="width: 100%"
                @focus="$event.target.select()"
              /> -->
              <InputNumberMask
                :ref="$t('exchange.rate-details.Amount')"
                v-model.number="scope.row.amount"
                :size="formSize"
                :min="0"
                autofocus
                :zero-precision="true"
                style="width: 100%"
                @focus="$event.target.select()"
              />
            </el-form-item>
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
  isNull,
  reject,
  split,
  times,
  unionBy,
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
  name: 'CashDepositDetail',
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
        return ['currencyId', 'amount']
      },
    },
    rows: {
      type: Number,
      default: 1,
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
    const validateAmount = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('Error'))
      } else {
        const splitVal = split(rule.field, '.')
        const crVal = this.form.items[splitVal[1].amount]

        if (value === 0 && crVal === 0) {
          callback(new Error('Error'))
        }
        callback()
      }
    }
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
        items: [],
      },
      rules: {
        currencyId: [
          {
            message: 'Currency is required',
            required: true,
            trigger: 'blur',
          },
        ],

        amount: [{ validator: validateAmount, trigger: 'blur' }],
      },
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
              // exchangeCurrencyId: it.exchangeCurrencyId,
              currencyName: it.currencyName,
              currencyId: it.currencyId,
              amount: it.amount,
            })
          })
          this.$nextTick(() => {
            this.form.items = unionBy(
              [...items, ...this.form.items],
              'currencyId'
            )
          })
        } else {
          this.form.items = []
          this.addEmptyRow()
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
          if (it.currencyId && it.amount) {
            delete it.currencyName
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
    currencyOpts: {
      handler(items) {
        this.addEmptyRow()
      },
      deep: true,
    },
  },
  created() {
    this.getCurrency()
  },
  methods: {
    // fetch currency
    isDisabled: function (doc) {
      return this.form.items.map((item) => item.currencyId).includes(doc._id)
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

    // // Visible new action
    // visibleNewAction(index) {
    //   return this.form.items.length - 1 === index
    // },

    // // Visible remove action
    // visibleRemoveAction() {
    //   return this.form.items.length >= this.minRow + 1
    // },

    // Add new row
    addEmptyRow() {
      const details = cloneDeep(this.currencyOpts)
      const tmp = []
      for (const it of details) {
        tmp.push({ currencyId: it._id, amount: 0, currencyName: it.name })
      }
      this.form.items = unionBy([...this.form.items, ...tmp], 'currencyId')
      // times(count, (time) => {
      //   const row = {
      //     currencyId: '',
      //     amount: 0,
      //     currencyName: '',
      //   }
      //   this.form.items.push(row)
      // })

      // this.emitToParent()
    },

    // addRow(row) {
    //   this.form.items.push(row)
    // },

    // // Remove row
    // removeRow(selector) {
    //   this.form.items = reject(this.form.items, selector)
    // },

    // // Remove row by index
    // removeRowByIndex(item) {
    //   let index = this.form.items.indexOf(item)
    //   if (index !== -1) {
    //     this.form.items.splice(index, 1)
    //   }
    // },

    // // Header Click
    // handleHeaderClick() {
    //   this.unsetCurrentRowIndex()
    // },

    // // Cell click
    // handleCellClick(row, column) {
    //   this.$nextTick(() => {
    //     let label = column.label
    //     if (
    //       label === `${this.$t('exchange.rate-details.Currency')}` ||
    //       label === `${this.$t('exchange.rate-details.Amount')}`
    //     ) {
    //       const newCurrentRowIndex = this.form.items.indexOf(row)
    //       if (newCurrentRowIndex !== this.currentRowIndex) {
    //         this.focusRow({
    //           focusOn: label,
    //           currentRowIndex: newCurrentRowIndex,
    //         })
    //       } else {
    //         this.focusOrSelectInput(label)
    //       }
    //     } else {
    //       this.unsetCurrentRowIndex()
    //     }
    //   })
    // },
    // //focus fieldName
    // focusRow(opts) {
    //   opts = opts || {}
    //   defaults(opts, { focusOn: null, currentRowIndex: null })
    //   // Check focusOn and set current row
    //   if (!isNull(opts.currentRowIndex))
    //     this.currentRowIndex = opts.currentRowIndex
    //   this.$nextTick(() => {
    //     if (opts.focusOn) this.focusOrSelectInput(opts.focusOn)
    //   })
    // },

    // // Outside Click
    // unsetCurrentRowIndex(e) {
    //   if (e && e.target && e.target.id !== 'LabelClick') {
    //     this.currentRowIndex = null
    //   }
    // },

    // handleCurrencyNameChange(row) {
    //   // Set  label
    //   this.$nextTick(() => {
    //     let { Currency } = this.$tm('exchange.rate-details')
    //     row.currencyName = this.$refs[Currency].selectedLabel
    //     // this.emitToParent()
    //   })
    // },

    // submit() {
    //   this.$refs['form'].validate((valid) => {
    //     this.$emit('submit-form', valid)
    //   })
    // },

    emitToParent() {
      this.$emit('item-change', this.itemResult, {
        total: this.itemTotal,
        error: this.itemError,
        errorIndex: this.itemErrorIndex,
      })
    },

    // // Focus & Select Input
    // focusOrSelectInput(ref) {
    //   let { Currency, Amount } = this.$tm('exchange.rate-details')
    //   if (ref === Currency || ref === Amount) {
    //     this.$refs[ref].focus()
    //   } else {
    //     this.$refs[ref].select()
    //   }
    // },

    tableRowStyle({ row, rowIndex }) {
      if (includes(this.itemErrorIndex, rowIndex)) {
        return { color: '#f56c6c' }
      }
      return ''
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
