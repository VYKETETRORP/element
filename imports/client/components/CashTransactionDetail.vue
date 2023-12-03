<template>
  <div>
    <!--Table List-->

    <el-form
      ref="form"
      v-loading.body="loading"
      :model="form"
    >
      <!-- :row-style="tableRowStyle" -->
      <el-table
        v-click-outside="unsetCurrentRowIndex"
        :data="filterItems"
        :header-cell-style="{
          'text-transform': 'uppercase',
          padding: '8px 0px',
        }"
        :cell-style="{ padding: '3px 0px', height: '40px' }"
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
          :label="$t('app.account-report-label.NO')"
          width="50px"
        />

        <!-- Chart Account -->
        <el-table-column
          prop="chartAccountId"
          :label="$t('app.account-report-field.Account')"
          min-width="170px"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.chartAccountId'"
              :prop="'items.' + scope.$index + '.chartAccountId'"
              :rules="rules.chartAccountId"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('app.account-report-field.Account')"
                v-model="scope.row.chartAccountId"
                filterable
                remote
                placeholder="Search... (100)"
                :remote-method="getRemoteChartAccountOpts"
                :loading="loadingChartAccount"
                style="width: 100%"
                @change="rowChange(scope.row, 'ChartAccount')"
              >
                <el-option
                  v-for="doc in chartAccountOpts"
                  :key="doc.value"
                  :label="doc.label"
                  :value="doc.value"
                  :disabled="doc.isParent"
                >
                  <span v-html="doc.labelCustom" />
                </el-option>
              </el-select>
            </el-form-item>

            <span v-else>
              {{ scope.row.chartAccountLabel }}
            </span>
          </template>
        </el-table-column>
        <!-- Memo -->
        <el-table-column
          prop="memo"
          :label="$t('app.account-report-field.Memo')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.memo'"
              :prop="'items.' + scope.$index + '.memo'"
              class="form-item"
              style="margin: 0"
            >
              <el-input
                :ref="$t('app.account-report-field.Memo')"
                v-model="scope.row.memo"
                @focus="$event.target.select()"
              />
            </el-form-item>

            <span v-else>
              {{ scope.row.memo }}
            </span>
          </template>
        </el-table-column>

        <!-- Payment Method -->
        <el-table-column
          prop="paymentMethodId"
          :label="$t('app.account-report-field.PaymentMethod')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.paymentMethodId'"
              :prop="'items.' + scope.$index + '.paymentMethodId'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('app.account-report-field.PaymentMethod')"
                v-model="scope.row.paymentMethodId"
                filterable
                clearable
                @change="rowChange(scope.row, 'PaymentMethod')"
              >
                <el-option
                  v-for="doc in paymentMethodOpts"
                  :key="doc.value"
                  :label="doc.label"
                  :value="doc.value"
                />
              </el-select>
            </el-form-item>

            <span v-else>
              {{ scope.row.paymentMethodLabel }}
            </span>
          </template>
        </el-table-column>

        <!-- Amount -->
        <el-table-column
          prop="amount"
          :label="$t('app.account-report-field.Amount')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.amount'"
              :prop="'items.' + scope.$index + '.amount'"
              :rules="rules.amount"
              class="form-item"
              style="margin: 0"
            >
              <el-input-number
                :ref="$t('app.account-report-field.Amount')"
                v-model.number="scope.row.amount"
                v-inputmask="numericMask"
                :min="0"
                :controls="false"
                style="width: 100%"
                @focus="$event.target.select()"
              />
              <!-- @blur="rowChange(scope.row, 'Amount')" -->
            </el-form-item>

            <span v-else>
              {{ $filters.number(scope.row.amount) }}
            </span>
          </template>
        </el-table-column>

        <!-- Name -->
        <el-table-column
          prop="nameId"
          :label="$t('app.account-report-field.Name')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.nameId'"
              :prop="'items.' + scope.$index + '.nameId'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('app.account-report-field.Name')"
                v-model="scope.row.nameId"
                filterable
                clearable
                remote
                placeholder="Search... (100)"
                :remote-method="getRemoteNameOpts"
                @change="rowChange(scope.row, 'Name')"
              >
                <el-option
                  v-for="doc in nameOpts"
                  :key="doc.value"
                  :label="doc.label"
                  :value="doc.value"
                >
                  <span v-html="doc.labelCustom" />
                </el-option>
              </el-select>
            </el-form-item>

            <span v-else>
              {{ scope.row.nameLabel }}
            </span>
          </template>
        </el-table-column>

        <!-- Class -->
        <el-table-column
          prop="classId"
          :label="$t('app.account-report-field.Class')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.row.no === currentRowIndex"
              :key="scope.$index + '.classId'"
              :prop="'items.' + scope.$index + '.classId'"
              class="form-item"
              style="margin: 0"
            >
              <el-select
                :ref="$t('app.account-report-field.Class')"
                v-model="scope.row.classId"
                filterable
                clearable
                @change="rowChange(scope.row, 'Class')"
              >
                <el-option
                  v-for="doc in classOpts"
                  :key="doc.value"
                  :label="doc.label"
                  :value="doc.value"
                />
              </el-select>
            </el-form-item>

            <span v-else>
              {{ scope.row.classLabel }}
            </span>
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column
          header-align="center"
          align="left"
          width="61px"
        >
          <template #header>
            <i class="far fa-bars popover-icon" />
          </template>

          <template #default="scope">
            <i
              v-if="visibleRemoveAction()"
              class="fal fa-minus-circle remove-action"
              @click="removeRowByIndex(scope.row)"
            />
            <i
              v-if="visibleNewAction(scope.$index)"
              class="fal fa-plus-circle new-action"
              @click="addEmptyRow(1)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import vClickOutside from 'click-outside-vue3'

import round from '/imports/api/lib/round'
import {
  cloneDeep,
  defaults,
  find,
  includes,
  isNull,
  maxBy,
  reject,
  times,
} from 'lodash'

// Component
import {
  ElTable,
  ElTableColumn,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElInput,
  ElInputNumber,
} from 'element-plus'
export default {
  name: 'RevenueExpenseItemDetail',
  directives: {
    clickOutside: vClickOutside.directive,
  },
  components: {
    [ElTable.name]: ElTable,
    [ElTableColumn.name]: ElTableColumn,
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElSelect.name]: ElSelect,
    [ElOption.name]: ElOption,
    [ElInput.name]: ElInput,
    [ElInputNumber.name]: ElInputNumber,
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
        return [
          'chartAccountId',
          'memo',
          'paymentMethodId',
          'amount',
          'nameId',
          'classId',
        ]
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
    tabActive: {
      type: String,
      default: null,
    },
  },
  data() {
    // Validate
    const validateAmount = (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('Error'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      loadingChartAccount: false,
      loadingJournalName: false,
      removeAction: false,
      classOpts: [],
      paymentMethodOpts: [],
      checkedMoreColumns: this.columns,
      inactiveIds: [],
      // Emit
      itemResult: [],
      itemTotal: { totalFrom: 0, totalTo: 0 },

      itemError: [],
      itemErrorIndex: [],

      form: {
        items: this.items,
      },
      rules: {
        chartAccountId: [{ required: true }],
        amount: [{ validator: validateAmount, trigger: 'blur' }],
      },
      currentRowIndex: null,
    }
  },
  computed: {
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

    // Lookup
    chartAccountOpts() {
      const opts = this.$store.state.app.lookup.chartAccounts
      return opts
    },
    filterItems() {
      return this.form.items.filter((it, index) => {
        return it['type'] == this.tabActive || it.chartAccountId === ''
      })
    },
    nameOpts() {
      const opts = this.$store.state.app.lookup.journalName
      return opts
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
              no: it.no,
              type: it.type,
              chartAccountId: it.chartAccountId,
              // chartAccountLabel,
              chartAccountLabel: it.chartAccountLabel,
              amount: it.amount,
              memo: it.memo,
              classId: it.classId,
              classLabel: it.classLabel,
              nameId: it.nameId,
              nameLabel: it.nameLabel,
              paymentMethodId: it.paymentMethodId,
              paymentMethodLabel: it.paymentMethodLabel,
            })
          })

          this.$nextTick(() => {
            this.form.items = items
          })
        } else {
          this.form.items = []
          this.addEmptyRow(this.rows)
        }
      },
      immediate: true,
      // deep: true,
    },
    // Form items
    'form.items': {
      handler(val) {
        this.itemResult = []
        let totalFrom = 0,
          totalTo = 0
        cloneDeep(val).forEach((it) => {
          if (it.chartAccountId && it.amount) {
            it.amount = round(it.amount, 7) || 0
            if (it['type'] == 'To' && it['amount']) {
              totalTo += it.amount
            }
            if (it['type'] == 'From' && it['amount']) {
              totalFrom += it.amount

              it.amount = -it.amount
            }
            const row = {
              chartAccountId: it.chartAccountId,
              amount: it.amount,
              memo: it.memo,
              classId: it.classId,
              nameId: it.nameId,
              paymentMethodId: it.paymentMethodId,
            }
            this.itemResult.push(row)
          }
        })
        this.itemTotal = {
          totalFrom: totalFrom,
          totalTo: totalTo,
        }

        this.$nextTick(() => {
          this.emitToParent()
        })
      },
      // immediate: true,
      deep: true,
    },
  },
  created() {
    this.getClassOpts()
    this.getPaymentMethodOpts()
  },
  methods: {
    getChartAccounts() {
      this.$store.dispatch('app/lookup/getChartAccount', { status: 'Active' })
    },
    getRemoteChartAccountOpts(query, opts) {
      opts = opts || {}
      defaults(opts, { focusOn: null, currentRowIndex: null })

      this.loadingChartAccount = true
      query = query.split(':')[0].trim()
      let chartAccSelector = { status: 'Active' }

      const exp = new RegExp(query)
      if (exp) {
        chartAccSelector.$or = [
          { code: { $regex: exp, $options: 'i' } },
          { name: { $regex: exp, $options: 'i' } },
        ]
      }

      // Inactive
      if (this.inactiveIds.length) {
        chartAccSelector = {
          $and: [
            { $or: [{ status: 'Active' }, { _id: { $in: this.inactiveIds } }] },
            {
              $or: [
                { code: { $regex: exp, $options: 'i' } },
                { name: { $regex: exp, $options: 'i' } },
              ],
            },
          ],
        }
      }

      this.$store
        .dispatch('app/lookup/getRemoteChartAccount', { chartAccSelector })
        .then((_) => {
          this.loadingChartAccount = false
          // Check focusOn and set current row
          if (!isNull(opts.currentRowIndex))
            this.currentRowIndex = opts.currentRowIndex
          this.$nextTick(() => {
            if (opts.focusOn) this.focusOrSelectInput(opts.focusOn)
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },
    getRemoteNameOpts(query, opts) {
      query = query || ''
      opts = opts || {}
      defaults(opts, { focusOn: null, currentRowIndex: null })

      this.loadingJournalName = true
      query = query.split(':')[0].trim()
      // console.log('Remote chart account opts: ', query, opts)
      let selector = {}

      const exp = new RegExp(query)
      if (exp) {
        selector = { name: { $regex: exp, $options: 'i' } }
      }

      this.$store
        .dispatch('app/lookup/getRemoteJournalName', selector)
        .then((_) => {
          this.loadingJournalName = false
          // Check focusOn and set current row
          if (!isNull(opts.currentRowIndex))
            this.currentRowIndex = opts.currentRowIndex
          this.$nextTick(() => {
            if (opts.focusOn) this.focusOrSelectInput(opts.focusOn)
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },

    getPaymentMethodOpts() {
      this.$store
        .dispatch('app/lookup/getPaymentMethod', { selector: {} })
        .then((res) => {
          this.paymentMethodOpts = res
        })
    },
    getClassOpts() {
      this.$store
        .dispatch('app/lookup/getJournalClass', {
          selector: {
            status: 'Active',
          },
        })
        .then((res) => {
          this.classOpts = res
        })
    },

    // Visible new action
    visibleNewAction(index) {
      return this.filterItems.length - 1 === index
    },

    // Visible remove action
    visibleRemoveAction() {
      return this.filterItems.length >= this.minRow + 1
    },

    // Add new row
    addEmptyRow(count) {
      times(count, (time) => {
        const currentNo = maxBy(this.form.items, 'no')
        const no = currentNo ? currentNo.no + 1 : 0

        const row = {
          no,
          chartAccountId: '',
          chartAccountLabel: '',
          amount: 0,
          memo: '',
          nameId: '',
          nameLabel: '',
          classId: '',
          classLabel: '',
          paymentMethodId: '',
          paymentMethodLabel: '',
        }
        this.form.items.push(row)
      })
    },

    addRow(row) {
      const currentNo = maxBy(this.form.items, 'no')
      row.no = currentNo ? currentNo.no + 1 : 0

      this.$nextTick(() => {
        this.form.items.push(row)
      })
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

        const Account = this.$t('app.account-report-field.Account')
        const Amount = this.$t('app.account-report-field.Amount')
        const Memo = this.$t('app.account-report-field.Memo')
        const PaymentMethod = this.$t('app.account-report-field.PaymentMethod')
        const Name = this.$t('app.account-report-field.Name')
        const Class = this.$t('app.account-report-field.Class')

        const list = [Account, Amount, Memo, PaymentMethod, Name, Class]
        if (includes(list, label)) {
          const newCurrentRowIndex = row.no

          if (newCurrentRowIndex !== this.currentRowIndex) {
            if (label === Account) {
              this.getRemoteChartAccountOpts(row.chartAccountLabel, {
                focusOn: label,
                currentRowIndex: newCurrentRowIndex,
              })
            } else {
              this.getRemoteNameOpts(row.nameLabel, {
                focusOn: label,
                currentRowIndex: newCurrentRowIndex,
              })
            }
          } else {
            this.focusOrSelectInput(label)
          }
        } else {
          this.unsetCurrentRowIndex()
        }
      })
    },

    // Outside Click
    unsetCurrentRowIndex() {
      this.currentRowIndex = null
    },
    rowChange(row, type) {
      if (type != 'Update') row.type = this.tabActive

      this.$nextTick(() => {
        // Set account label
        const Account = this.$t('app.account-report-field.Account')
        const Name = this.$t('app.account-report-field.Name')
        const Class = this.$t('app.account-report-field.Class')
        const PaymentMethod = this.$t('app.account-report-field.PaymentMethod')

        // Check has empty row
        this.$nextTick(() => {
          if (type == 'ChartAccount' || type == 'Update') {
            row.chartAccountLabel = this.$refs[Account].selectedLabel
            const emptyRow = find(this.form.items, { chartAccountId: '' })
            if (!emptyRow) {
              this.addEmptyRow(1)
            }
          } else if (type == 'Name' || type == 'Update') {
            row.nameLabel = this.$refs[Name].selectedLabel
          } else if (type == 'Class' || type == 'Update') {
            row.classLabel = this.$refs[Class].selectedLabel
          } else if (type == 'PaymentMethod' || type == 'Update') {
            row.paymentMethodLabel = this.$refs[PaymentMethod].selectedLabel
          }
        })
      })
    },
    emitToParent() {
      this.$emit('item-change', this.itemResult, {
        total: this.itemTotal,
      })
    },
    // Focus & Select Input
    focusOrSelectInput(ref) {
      const fields = {
        Account: this.$t('app.account-report-field.Account'),
        Name: this.$t('app.account-report-field.Name'),
        Class: this.$t('app.account-report-field.Class'),
        PaymentMethod: this.$t('app.account-report-field.PaymentMethod'),
      }
      this.$refs[ref].focus()
      // if (
      //   ref == fields['Account'] ||
      //   ref == fields['Name'] ||
      //   ref == fields['Class'] ||
      //   ref == fields['PaymentMethod']
      // ) {
      //   this.$refs[ref].focus()
      // } else {
      //   // this.$refs[ref].input.select()
      // }
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
  font-size: 16px;
  padding-left: 3px;
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
  font-size: 16px;
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
