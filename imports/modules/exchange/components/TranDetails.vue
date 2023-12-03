<template>
  <el-form
    ref="form"
    v-loading.body="loading"
    :model="form"
    label-width="200px"
    label-position="left"
    :size="formSize"
    class="details-form"
    :rules="rules"
    :hide-required-asterisk="true"
    :show-message="false"
  >
    <el-form-item
      :key="0 + '.exchangeId'"
      style="margin-top: 10px"
      :prop="'items.' + 0 + '.exchangeId'"
      :label="$t('exchange.transaction-details.exchange')"
      class="item-form-label"
    >
      <el-row>
        <el-col :span="22">
          <el-select
            :ref="$t('exchange.transaction-details.exchange')"
            v-model="form.items[0].exchangeId"
            :size="formSize"
            filterable
            remote
            style="width: 100%"
            @change="handleNameChange(form.items[0])"
          >
            <el-option
              v-for="(doc, index) in currencyRateOpts"
              :key="index"
              style="font-size: 18px; height: 38px; line-height: 38px"
              :label="doc.label"
              :value="doc.value"
              :disabled="isDisabled(doc)"
            >
              <span v-html="doc.label" />
            </el-option>
          </el-select>
        </el-col>
        <!-- <el-col :span="12"></el-col> -->
      </el-row>
    </el-form-item>
    <el-form-item
      :prop="'items.' + 0 + '.received'"
      :label="$t('exchange.transaction-details.received')"
      align="center"
      class="item-label"
      style="font-weight: bold; width: 100%"
    >
      <el-row :gutter="10">
        <el-col :span="22">
          <!-- <el-input-number
            :ref="$t('exchange.transaction-details.received')"
            v-model.number="form.items[0].received"
            v-inputmask="numericMask"
            :size="formSize"
            :min="0"
            :controls="false"
            style="width: 100%"
            class="number-value"
            autofocus
            @focus="$event.target.select()"
            @change.native="handleReceivedChange(form.items[0])"
          /> -->
          <InputNumberMask
            :ref="$t('exchange.transaction-details.received')"
            v-model.number="form.items[0].received"
            :size="formSize"
            :min="0"
            style="width: 100%"
            class="number-value"
            :zero-precision="true"
            autofocus
            @focus="$event.target.select()"
            @change.native="handleReceivedChange(form.items[0])"
          />
        </el-col>
        <el-col :span="2">
          <span style="font-size: 18px; color: #ffffff; font-weight: normal">
            {{ form.items[0].baseSymbol }}
          </span>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item
      :prop="'items.' + 0 + '.exchangeAmount'"
      :label="$t('exchange.transaction-details.exchangeAmount')"
      align="center"
      class="item-label"
      style="font-weight: bold"
    >
      <el-row>
        <el-col :span="22">
          <!-- <el-input-number
            :ref="$t('exchange.transaction-details.received')"
            v-model.number="form.items[0].exchangeAmount"
            v-inputmask="numericMask"
            :size="formSize"
            :min="0"
            :controls="false"
            style="width: 100%"
            class="number-value"
            autofocus
            @focus="$event.target.select()"
            @change.native="handleExchAmountChange(form.items[0])"
          /> -->
          <InputNumberMask
            :ref="$t('exchange.transaction-details.received')"
            v-model.number="form.items[0].exchangeAmount"
            :size="formSize"
            :min="0"
            style="width: 100%"
            class="number-value"
            :zero-precision="true"
            autofocus
            @focus="$event.target.select()"
            @change.native="handleExchAmountChange(form.items[0])"
          />
        </el-col>
        <el-col :span="2">
          <span style="font-size: 18px; color: #ffffff; font-weight: normal">
            {{ form.items[0].baseSymbol }}
          </span>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item
      :prop="'items.' + 0 + '.amount'"
      :label="$t('exchange.transaction-details.amount')"
      align="center"
      class="item-label"
      style="font-weight: bold"
    >
      <el-row>
        <el-col :span="22">
          <!-- <el-input-number
            :ref="$t('exchange.transaction-details.amount')"
            v-model.number="form.items[0].amount"
            v-inputmask="numericMask"
            :size="formSize"
            :min="0"
            :controls="false"
            autofocus
            style="width: 100%"
            class="number-value"
            @focus="$event.target.select()"
            @change.native="handleAmountChange(form.items[0])"
          /> -->
          <!--:precision="7"-->
          <InputNumberMask
            :ref="$t('exchange.transaction-details.amount')"
            v-model.number="form.items[0].amount"
            :size="formSize"
            :min="0"
            autofocus
            style="width: 100%"
            :zero-precision="true"
            class="number-value"
            @focus="$event.target.select()"
            @change.native="handleAmountChange(form.items[0])"
          />
        </el-col>
        <el-col :span="2">
          <span style="font-size: 18px; color: #ffffff; font-weight: normal">
            {{ form.items[0].toSymbol }}
          </span>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item
      :prop="'items.' + 0 + '.return'"
      :label="$t('exchange.transaction-details.return')"
      align="center"
      class="item-label"
      style="font-weight: bold"
    >
      <el-row>
        <el-col :span="22">
          <!-- <el-input-number
            :ref="$t('exchange.transaction-details.return')"
            v-model.number="form.items[0].return"
            v-inputmask="numericMask"
            :size="formSize"
            :min="0"
            :controls="false"
            autofocus
            style="width: 100%"
            class="number-return"
            :disabled="true"
          /> -->
          <InputNumberMask
            :ref="$t('exchange.transaction-details.return')"
            v-model.number="form.items[0].return"
            v-inputmask="numericMask"
            :size="formSize"
            :min="0"
            autofocus
            :zero-precision="true"
            style="width: 100%"
            class="number-return"
            :disabled="true"
          />
        </el-col>
        <el-col :span="2">
          <span style="font-size: 18px; color: #ffffff; font-weight: normal">
            {{ form.items[0].baseSymbol }}
          </span>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script>
import Vue from 'vue'
import vClickOutside from 'click-outside-vue3'

import Notify from '/imports/client/lib/notify'
import round from '/imports/api/lib/round'
import { Decimal } from 'decimal.js'
import { ceil, floor } from 'lodash'

// methods
import { fetchExchangeRateOperator } from '../api/exchange-rates/methods'
import { includes, cloneDeep, times } from 'lodash'

// Component
import TransactionFormVue from '../pages/TransactionForm.vue'
import InputNumberMask from '/imports/client/components/InputNumberMask.vue'

import {
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInputNumber,
} from 'element-plus'
export default {
  name: 'TransactionDetail',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  components: {
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElInputNumber,
    InputNumberMask,
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
    reload: {
      type: Boolean,
      default: false,
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
      rules: {
        'items.0.received': [
          {
            required: true,
            message: 'Received is required',
            trigger: ['blur', 'change'],
          },
        ],
        'items.0.exchangeAmount': [
          {
            required: true,
            message: 'Exchange Amount is required',
            trigger: ['blur', 'change'],
          },
        ],
        'items.0.amount': [
          {
            required: true,
            message: 'Amount is required',
            trigger: ['blur', 'change'],
          },
        ],
      },
      currentRowIndex: null,
      currentRowIndexActive: false,
    }
  },
  computed: {
    //currencyRateOpts() {
    //  return this.currencyRateOpts.filter((status) => status.status == 'active')
    //},
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
  //onMounted(fetchExchangeRateOperator),
  watch: {
    reload: {
      handler(value) {
        if (value) {
          this.getExchangeRateOperator()
        }
      },
    },
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
              exchangeId: it.exchangeId,
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
          if (it.exchangeId) {
            itemsTmp.push({
              exchangeRateDetailId: it.exchangeRateDetailId,
              received: it.received,
              exchangeAmount: it.exchangeAmount,
              amount: it.amount,
              type: it.type,
              return: it.return,
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
  created() {
    this.getExchangeRateOperator()
  },
  methods: {
    // button exchange rate
    passValue(value) {
      this.form.items[0].exchangeId = value
      this.handleNameChange(this.form.items[0])
    },
    // fetch currency
    isDisabled: function (doc) {
      return this.form.items.map((item) => item.exchangeId).includes(doc.value)
    },
    getExchangeRateOperator() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
        status: 'active',
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
    },
    handleReturn(row) {
      const {
        rate = 0,
        operator = '/',
        type = 'ask',
      } = this.currencyRateOpts.find((x) => x.value === row.exchangeId) || {}
      if (row.toSymbol && row.toSymbol == '$') {
        let x = Decimal.div(row.exchangeAmount, rate).toNumber()
        if (operator === '*' && type === 'bid') {
          x = Decimal.mul(row.exchangeAmount, rate).toNumber()
        }

        const int_part = Math.trunc(x)
        const float_part = parseFloat((x - int_part).toFixed(4))
        const payBack = parseFloat((rate * float_part).toFixed(4))
        // let payBack = getOpt.rate * float_part
        row.return = round(
          Decimal.sub(row.received, row.exchangeAmount).toNumber(),
          7
        )
        if (row.baseSymbol === '៛') {
          row.return = (row.return + payBack, -2)
        }
        // else {
        //   // row.return = floor(row.return + payBack)
        // }
      } else {
        row.return = round(
          Decimal.sub(row.received, row.exchangeAmount).toNumber(),
          7
        )
        // if (row?.baseSymbol == '$' && getOpt) {
        //   let digit = 0
        //   if (row.toSymbol == '៛') {
        //     digit = -2
        //   }
        //   this.$nextTick(() => {
        //     const { rate } = getOpt
        //     let amount = row.received
        //     if (row.received > row.exchangeAmount) amount = row.exchangeAmount
        //     row.amount = floor(Decimal(amount).mul(rate).toNumber(), digit)
        //   })
        // }
      }
    },
    handleReceivedChange(row) {
      if (row.received && !row.amount) {
        row.exchangeAmount = row.received
        this.handleExchAmountChange(row)
        this.handleReturn(row)
      } else if (row.received > row.exchangeAmount) {
        this.handleReturn(row)
      } else if (row.received < row.exchangeAmount) {
        row.exchangeAmount = row.received
        this.handleExchAmountChange(row)
        this.handleReturn(row)
      } else if (!row.exchangeAmount) {
        row.exchangeAmount = row.received
        this.handleExchAmountChange(row)
        this.handleReturn(row)
      } else if (row.received > 0) {
        if (row.amount <= 0) {
          row.exchangeAmount = row.received
          this.handleExchAmountChange(row)
        } else if (row.amount > 0) {
          this.handleReturn(row)
          // row.exchangeAmount = row.received
          // this.handleExchAmountChange(row)
        }
      }
    },
    handleExchAmountChange(row) {
      if (row.exchangeAmount > row.received) {
        row.received = row.exchangeAmount
        this.handleReturn(row)
      }
      if (row.exchangeAmount > 0) {
        const getOpt = this.currencyRateOpts.find(
          (x) => x.value === row.exchangeId
        )
        row.amount =
          getOpt && getOpt.operator === '*' && getOpt.type === 'bid'
            ? Decimal.mul(
                row.exchangeAmount,
                (getOpt && getOpt.rate) || 0
              ).toNumber()
            : Decimal.div(
                row.exchangeAmount,
                (getOpt && getOpt.rate) || 0
              ).toNumber()

        row.amount = this.parseFloat(row.amount)
        //if (row.toSymbol === '$') {
        //

        //  //row.amount = floor(row.amount, -2)
        //  //row.amount = row.amount.toFixed(3)
        //} else {
        //  row.amount = Math.floor(row.amount)
        //}
        if (row.toSymbol && row.toSymbol == '$') {
          const x =
            getOpt && getOpt.operator === '*' && getOpt.type === 'bid'
              ? Decimal.mul(
                  row.exchangeAmount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber()
              : Decimal.div(
                  row.exchangeAmount,
                  (getOpt && getOpt.rate) || 0
                ).toNumber()

          const int_part = Math.trunc(x)
          const float_part = parseFloat((x - int_part).toFixed(4))
          const payBack = parseFloat((getOpt.rate * float_part).toFixed(4))
          // let payBack = getOpt.rate * float_part
          row.return = round(
            Decimal.sub(row.received, row.exchangeAmount).toNumber(),
            7
          ) // if (row.baseSymbol === '៛') {
          //   row.return = floor(row.return + payBack, -2)
          // } else {
          //   row.return = floor(row.return + payBack)
          // }
        } else {
          row.return = round(
            Decimal.sub(row.received, row.exchangeAmount).toNumber(),
            7
          )
        }
        if (!row.received) row.received = row.exchangeAmount
        if (row.exchangeAmount > row.received) row.exchangeAmount = row.received
      }
    },
    parseFloat(str) {
      const pre = this.$store.getters['app/setting'] || 2
      const precision = pre.decimalNumber
      str = str.toString()
      const decimalIndex = str.indexOf('.')
      if (decimalIndex !== -1) {
        str = str.slice(0, decimalIndex + precision + 1)
      }
      return Number(str)
    },

    handleAmountChange(row) {
      if (row.exchangeId) {
        const getOpt = this.currencyRateOpts.find(
          (x) => x.value === row.exchangeId
        )
        const rowEx =
          getOpt && getOpt.operator === '*' && getOpt.type === 'bid'
            ? Decimal.div(row.amount, (getOpt && getOpt.rate) || 0).toNumber()
            : Decimal.mul(row.amount, (getOpt && getOpt.rate) || 0).toNumber()

        if (row.amount && rowEx) {
          if (row.baseSymbol === '៛') {
            row.exchangeAmount = round(rowEx, -2)
            row.received = round(rowEx, -2)
            this.handleReturn(row)
          } else {
            row.exchangeAmount = round(rowEx)
            row.received = round(rowEx)
            this.handleReturn(row)
          }
        }
        if (rowEx > row.received) {
          if (row.baseSymbol === '៛') {
            row.exchangeAmount = round(rowEx, -2)
            row.received = round(rowEx, -2)
            this.handleReturn(row)
          } else {
            row.exchangeAmount = round(rowEx)
            row.received = round(rowEx)
            this.handleReturn(row)
          }
        } else {
          if (row.baseSymbol === '៛') {
            row.exchangeAmount = round(rowEx, -2)
            this.handleReturn(row)
          } else {
            row.exchangeAmount = round(rowEx)
            this.handleReturn(row)
          }
        }

        if (row.received <= 0) {
          row.received = row.exchangeAmount
          this.handleReturn(row)
        }
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
      if (row.exchangeId) {
        if (row.exchangeAmount != null) {
          this.handleReceivedChange(row)
        }
      }
      if (row.amount && row.exchangeId) {
        this.handleAmountChange(row)
      }

      if (row.exchangeAmount || row.received || row.amount) {
        row.exchangeAmount = 0
        row.received = 0
        row.return = 0
        row.amount = 0
      }
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
  },
}
//onMounted(() => {
//  getExchangeRateOperator()
//})
</script>

<style
  lang="scss"
  scoped
>
.details-form {
  background-color: #2155cd;
  padding: 34px;
  color: #000 !important;
  border-radius: 7px;
}
.form-item {
  margin-bottom: 0px;
}
.el-select {
  width: 100%;
}
</style>
<style>
.number-value .el-input__inner {
  font-size: 26px;
  text-align: left;
}
.number-return .el-input__inner {
  color: #797979 !important;
  font-size: 26px;
  text-align: left;
}
.item-form-label .el-form-item__label {
  color: #ffffff !important;
  font-size: 28px;
}
.item-label .el-form-item__label {
  color: #ffffff !important;
  font-size: 16px;
}
</style>
