<template>
  <div>
    <!--Table List-->
    <el-form
      ref="form"
      v-loading.body="loading"
      :model="form"
    >
      <el-table
        :data="form.items"
        :header-cell-style="{
          'text-transform': 'uppercase',
          padding: '8px 0px',
        }"
        :size="formSize"
        :cell-style="{ padding: '3px 0px', height: '40px' }"
        :cell-class-name="tableRowClassName"
        stripe
        border
        :resizable="true"
        highlight-current-row
        style="width: 100%"
      >
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
          </template>
        </el-table-column>

        <!-- Amount  -->
        <el-table-column
          prop="Amount"
          :label="$t('exchange.rate-details.Amount')"
          align="center"
        >
          <template #default="scope">
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

import { includes, cloneDeep, split, unionBy } from 'lodash'
import InputNumberMask from '/imports/client/components/InputNumberMask.vue'

// // Component
// import {
//   Form,
//   FormItem,
//   Select,
//   Option,
//   Input,
//   InputNumber,
//   Button,
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
    // [Button.name]: Button,
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
    openCash: {
      type: Array,
      default: function () {
        return []
      },
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
      validDoc: [],
      showId: this.$route.params.id,
      // Emit
      itemResult: [],
      itemError: [],
      itemErrorIndex: [],
      form: {
        items: this.items,
      },
      CashDeposit: [],
      rules: {
        currencyId: [
          {
            message: 'Currency is required',
            required: true,
            trigger: 'blur',
          },
        ],

        amount: [
          {
            validator: validateAmount,
            trigger: 'blur',
          },
        ],
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
              currencyId: it.currencyId,
              currencyName: it.currencyName,
              amount: it.amount,
            })
          })
          this.$nextTick(() => {
            // this.emitToParent()
            // this.form.items = items
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
        const details = cloneDeep(val)
        this.validateEmitToParent(details)
      },
      // immediate: true,
      deep: true,
    },
    // openCash
    openCash: {
      handler() {
        const details = cloneDeep(this.form.items)
        this.validateEmitToParent(details)
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
      handler() {
        this.addEmptyRow()
      },
      deep: true,
    },
  },
  created() {
    this.getCurrency()
  },
  methods: {
    validateEmitToParent(details) {
      const itemsTmp = []
      const itemsErrorTmp = []
      this.itemErrorIndex = []
      details.forEach((it, index) => {
        if (it.currencyId && it.amount) {
          const doc = this.openCash.find((op) => op._id === it.currencyId)
          if (doc) {
            if (it.amount > doc.amount) {
              this.itemErrorIndex.push(index)
            } else {
              itemsTmp.push({
                currencyId: it.currencyId,
                amount: it.amount,
              })
            }
          }
        }
      })
      this.itemResult = itemsTmp
      this.itemError = itemsErrorTmp
      this.$nextTick(() => {
        this.emitToParent()
      })
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
    // Add new row
    addEmptyRow() {
      const details = cloneDeep(this.currencyOpts)
      const tmp = []
      for (const it of details) {
        tmp.push({ currencyId: it._id, amount: 0, currencyName: it.name })
      }

      this.form.items = unionBy([...this.form.items, ...tmp], 'currencyId')
    },
    emitToParent() {
      this.$emit('item-change', this.itemResult, {
        total: this.itemTotal,
        error: this.itemError,
        errorIndex: this.itemErrorIndex,
      })
    },
    tableRowClassName({ row, rowIndex }) {
      if (includes(this.itemErrorIndex, rowIndex)) {
        return 'valid-row'
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
<style lang="scss">
.valid-row {
  .cell {
    color: #f56c6c !important;
    text-decoration: line-through;
  }
}
</style>
