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
        :data="form.items"
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
              v-if="scope.$index === currentRowIndex"
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
                @change="rowChange(scope.row, 'Item')"
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
          :label="$t('app.account-setting-account-type.Memo')"
        >
          <template #default="scope">
            <el-form-item
              v-if="scope.$index === currentRowIndex"
              :key="scope.$index + '.memo'"
              :prop="'items.' + scope.$index + '.memo'"
              class="form-item"
              style="margin: 0"
            >
              <el-input
                :ref="$t('app.account-setting-account-type.Memo')"
                v-model="scope.row.memo"
                @focus="$event.target.select()"
              />
            </el-form-item>

            <span v-else>
              {{ scope.row.memo }}
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
              v-if="scope.$index === currentRowIndex"
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
                @blur="rowChange(scope.row, 'Amount')"
              />
              <!-- :data-inputmask="$filters.jsonStrWithoutBraces(numericMask)" -->
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
              v-if="scope.$index === currentRowIndex"
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
              v-if="scope.$index === currentRowIndex"
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
            <el-icon class="far fa-bars popover-icon" />
          </template>

          <template #default="scope">
            <el-icon
              v-if="visibleRemoveAction()"
              class="fal fa-minus-circle remove-action"
              @click="removeRowByIndex(scope.row)"
            />
            <el-icon
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

import _, { defaults, isNull } from 'lodash'

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
  ElIcon,
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
    [ElIcon.name]: ElIcon,
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
        return ['chartAccountId', 'memo', 'amount', 'nameId', 'classId']
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
    accountType: {
      type: String,
      // default: 'Re',
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
      checkedMoreColumns: this.columns,
      inactiveIds: [],
      // Emit
      itemResult: [],
      itemTotal: { total: 0 },
      // itemError: [],
      // itemErrorIndex: [],

      form: {
        items: this.items,
      },
      rules: {
        chartAccountId: [{ required: true }],
        amount: [{ validator: validateAmount, trigger: 'blur' }],
      },
      currentRowIndex: null,
      currentRowIndexActive: false,
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

    // Lookkup
    chartAccountOpts() {
      const opts = this.$store.state.app.lookup.chartAccounts
      return opts
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
            let chartAccountLabel =
              it.chartAccountDoc.code + ' : ' + it.chartAccountDoc.name
            // Check inactive
            if (it.chartAccountDoc['status'] == 'Inactive') {
              this.inactiveIds.push(it['chartAccountId'])
              chartAccountLabel = `${it.chartAccountDoc.code}  : ${it.chartAccountDoc.name} (Inactive)`
            }

            // Items
            items.push({
              chartAccountId: it.chartAccountId,
              chartAccountLabel,
              amount: it.amount,
              memo: it.memo,
              classId: it.classId,
              classLabel: it.classDoc && it.classDoc.name,
              nameId: it.nameId,
              nameLabel: it.nameDoc && it.nameDoc.name,
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
        let total = 0
        const itemsTmp = []
        // let itemsErrorTmp = []
        // this.itemErrorIndex = []
        _.cloneDeep(val).forEach((it, index) => {
          if (it.chartAccountId && it.amount) {
            it.amount = it.amount || 0
            total = this._round(total + it.amount)
            delete it.chartAccountLabel
            delete it.nameLabel
            delete it.classLabel

            itemsTmp.push(it)
          }
          // else {
          //   this.itemErrorIndex.push(index)
          //   itemsErrorTmp.push(it)
          // }
        })

        this.itemTotal.total = total
        this.itemResult = itemsTmp
        // this.itemError = itemsErrorTmp

        this.$nextTick(() => {
          this.emitToParent()
        })
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    this.getClassOpts()
  },
  methods: {
    getChartAccounts() {
      this.$store.dispatch('app/lookup/getChartAccount', { status: 'Active' })
    },
    getRemoteChartAccountOpts(query, opts) {
      query = query || ''
      opts = opts || {}
      defaults(opts, { focusOn: null, currentRowIndex: null })

      this.loadingChartAccount = true
      query = query.split(':')[0].trim()
      // console.log('Remote chart account opts: ', query, opts)
      let chartAccSelector = { status: 'Active' }

      const exp = new RegExp(query)
      if (exp) {
        chartAccSelector.$or = [
          { code: { $regex: exp, $options: 'i' } },
          { name: { $regex: exp, $options: 'i' } },
        ]
      }
      const accTypeSelector = {}
      if (this.accountType) {
        accTypeSelector['nature'] = this.accountType
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
        .dispatch('app/lookup/getRemoteChartAccount', {
          chartAccSelector,
          accTypeSelector,
        })
        .then((res) => {
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
      return this.form.items.length - 1 === index
    },

    // Visible remove action
    visibleRemoveAction() {
      return this.form.items.length >= this.minRow + 1
    },

    // Add new row
    addEmptyRow(count) {
      _.times(count, (time) => {
        const row = {
          chartAccountId: '',
          chartAccountLabel: '',
          amount: 0,
          memo: '',
          nameId: '',
          nameLabel: '',
          classId: '',
          classLabel: '',
        }

        this.form.items.push(row)
      })

      // this.emitToParent()
    },

    addRow(row) {
      this.form.items.push(row)
      // this.$nextTick(() => {
      //   this.emitToParent()
      // })
    },

    // Remove row
    removeRow(selector) {
      this.form.items = _.reject(this.form.items, selector)
      // this.$nextTick(() => {
      //   this.emitToParent()
      // })
    },

    // Remove row by index
    removeRowByIndex(item) {
      const index = this.form.items.indexOf(item)
      if (index !== -1) {
        this.form.items.splice(index, 1)
        // this.$nextTick(() => {
        //   this.emitToParent()
        // })
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
          label === `${this.$t('app.account-report-field.Account')}` ||
          label === `${this.$t('app.account-setting-account-type.Memo')}` ||
          label === `${this.$t('app.account-report-field.Amount')}` ||
          label === `${this.$t('app.account-report-field.Name')}` ||
          label === `${this.$t('app.account-report-field.Class')}`
        ) {
          const newCurrentRowIndex = this.form.items.indexOf(row)

          if (newCurrentRowIndex !== this.currentRowIndex) {
            if (label === `${this.$t('app.account-report-field.Account')}`) {
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
      this.$nextTick(() => {
        // Set account label
        const Account = this.$t('app.account-report-field.Account')
        const Name = this.$t('app.account-report-field.Name')
        const Class = this.$t('app.account-report-field.Class')

        row.chartAccountLabel = this.$refs[Account].selectedLabel

        // Check has empty row
        if (type == 'Item') {
          this.$nextTick(() => {
            const emptyRow = _.find(this.form.items, { chartAccountId: '' })
            if (!emptyRow) {
              this.addEmptyRow(1)
            } else {
              this.emitToParent()
            }
          })
        } else if (type == 'Name') {
          row.nameLabel = this.$refs[Name].selectedLabel
        } else if (type == 'Class') {
          row.classLabel = this.$refs[Class].selectedLabel
        }
        this.emitToParent()
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
        // error: this.itemError,
        // errorIndex: this.itemErrorIndex,
      })
    },

    // Focus & Select Input
    focusOrSelectInput(ref) {
      const fields = {
        Account: this.$t('app.account-report-field.Account'),
        Name: this.$t('app.account-report-field.Name'),
        Class: this.$t('app.account-report-field.Class'),
      }
      this.$refs[ref].focus()
      // if (
      //   ref == fields['Account'] ||
      //   ref == fields['Name'] ||
      //   ref == fields['Class']
      // ) {
      //   this.$refs[ref].focus()
      // } else {
      //   this.$refs[ref].input.select()
      // }
    },

    // tableRowStyle({ row, rowIndex }) {
    //   if (_.includes(this.itemErrorIndex, rowIndex)) {
    //     return { color: '#f56c6c' }
    //   }
    //   return ''
    // },

    _round(val) {
      return _.round(val, this.setting.decimalNumber)
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
