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
        :cell-style="tableCellStyle"
        :resizable="true"
        stripe
        border
        highlight-current-row
        style="width: 100%"
      >
        <!-- ASSET NAME -->
        <el-table-column
          prop="assetTypeId"
          :label="$t('app.fixed-asset-setting.reference')"
          min-width="160px"
        >
          <template #default="scope">
            <el-form-item
              :key="scope.$index + '.assetId'"
              :prop="'items.' + scope.$index + '.assetId'"
              class="form-item"
              style="margin: 0"
            >
              <span>{{ scope.row.assetName }}</span>
            </el-form-item>
          </template>
        </el-table-column>

        <!-- DEPRECIATION DATE -->
        <el-table-column
          prop="tranDate"
          :label="$t('app.fixed-asset-setting.depreciationDate')"
          width="165px"
        >
          <template #default="scope">
            <el-form-item
              :key="scope.$index + '.tranDate'"
              :prop="'items.' + scope.$index + '.tranDate'"
              class="form-item"
              style="margin: 0"
            >
              <span>{{ $filters.date(scope.row.tranDate) }}</span>
            </el-form-item>
          </template>
        </el-table-column>

        <!-- DEPRECIATION -->
        <el-table-column
          prop="depreciation"
          :label="$t('app.fixed-asset-setting.depreciation')"
          header-align="right"
          align="right"
        >
          <template #default="scope">
            <el-form-item
              :key="scope.$index + '.depreciation'"
              :prop="'items.' + scope.$index + '.depreciation'"
              class="form-item text-right"
              style="margin: 0"
            >
              <!-- <span>{{ $filters.number(scope.row.depreciation) }}</span> -->
              <span>{{
                $filters.number(scope.row.depreciation, currency)
              }}</span>
            </el-form-item>
          </template>
        </el-table-column>

        <!-- CUMULATIVE DEPRECIATION -->
        <el-table-column
          prop="cumulativeDepreciation"
          :label="$t('app.fixed-asset-setting.cumulativeDepreciation')"
          header-align="right"
          align="right"
        >
          <template #default="scope">
            <el-form-item
              :key="scope.$index + '.cumulativeDepreciation'"
              :prop="'items.' + scope.$index + '.cumulativeDepreciation'"
              class="form-item text-right"
              style="margin: 0"
            >
              <!-- <span>{{
                $filters.number(scope.row.cumulativeDepreciation)
              }}</span> -->
              <span>{{
                $filters.number(scope.row.cumulativeDepreciation, currency)
              }}</span>
            </el-form-item>
          </template>
        </el-table-column>

        <!-- DEPRECIATION VALUE -->
        <el-table-column
          prop="depreciationValue"
          :label="$t('app.fixed-asset-setting.depreciationValue')"
          header-align="right"
          align="right"
        >
          <template #default="scope">
            <el-form-item
              :key="scope.$index + '.depreciationValue'"
              :prop="'items.' + scope.$index + '.depreciationValue'"
              class="form-item text-right"
              style="margin: 0"
            >
              <!-- <span>{{ $filters.number(scope.row.depreciationValue) }}</span> -->
              <span>{{
                $filters.number(scope.row.depreciationValue, currency)
              }}</span>
            </el-form-item>
          </template>
        </el-table-column>
        <!-- STATUS -->
        <el-table-column
          prop="action"
          :label="$t('app.fixed-asset-setting.journalEntry')"
          header-align="center"
          align="right"
          width="140px"
        >
          <template #default="scope">
            <el-button
              v-if="visibleBtnSchedule(scope.row)"
              link
              style="padding: 0px"
              @click="_insertJournal(scope.row)"
            >
              <el-icon class="status-active"><circle-plus /></el-icon>
              <!-- <i class="el-icon-circle-plus status-active" /> -->
            </el-button>
            <el-button
              v-if="visibleRemoveSchedule(scope.row)"
              link
              style="padding: 0px"
              @click="_removeJournal(scope.row)"
            >
              <el-icon class="remove-icon"><delete /></el-icon>
              <!-- <i class="el-icon-delete-solid remove-icon" /> -->
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
// PACKAGES
import moment from 'moment'
import { Decimal } from 'decimal.js'
import round from '/imports/api/lib/round'
// METHODS
import {
  insertJournalDepreciation,
  removeJournalDepreciation,
} from '../../api/fixed-assets/depreciationMethods'
import { removeSaleFixedAsset } from '../../api/fixed-assets/saleOrDisposeMethods'
// Components
import {
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElButton,
  ElIcon,
} from 'element-plus'
import { toLower } from 'lodash'

export default {
  name: 'AssetScheduleTable',
  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElTable.name]: ElTable,
    [ElTableColumn.name]: ElTableColumn,
    [ElButton.name]: ElButton,
    [ElIcon.name]: ElIcon,
  },
  props: {
    doc: {
      type: Object,
      default: null,
    },
    items: {
      type: Array,
      default: function () {
        return []
      },
    },
    isRunning: {
      type: Boolean,
      default: false,
    },
    visibleInsert: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      form: {
        items: [],
      },
      rules: {},
    }
  },
  computed: {
    setting() {
      let setting = this.$store.state.app.company
      setting = (setting && setting.setting) || { decimalNumber: 2 }
      return setting
    },
    currency() {
      return toLower(this.doc.currency)
    },
  },
  watch: {
    isRunning(val) {
      if (val) {
        // CHECKING BEFORE PUSH DATA
        if (this.doc && this.doc.duration) {
          this._calculated(this.doc)
        } else {
          this.form.items = []
        }
      }
    },
    items: {
      handler(newVal) {
        if (newVal && newVal.length) {
          const items = []
          let duration = 0
          let num = this.doc.oneEntryEvery || 1
          while (num <= this.doc.duration) {
            duration += 1
            if (num == this.doc.duration) break
            num += this.doc.oneEntryEvery
            if (num > this.doc.duration) {
              num = this.doc.duration
            }
          }
          newVal.forEach((it, key) => {
            let assetName = ''
            if (this.doc.isProrataTemporis && this.doc.prorataTemporis) {
              if (key == 0) {
                assetName = `${this.doc.name} (Prorata Entry)`
              } else {
                assetName =
                  it.tranType == 'Asset_Sale'
                    ? `${this.doc.name} (Sale)`
                    : it.tranType == 'Asset_Dispose'
                    ? `${this.doc.name} (Write-Off)`
                    : `${this.doc.name} (${key}/${duration})`
              }
            } else {
              key = key + 1
              assetName =
                it.tranType == 'Asset_Sale'
                  ? `${this.doc.name} (Sale)`
                  : it.tranType == 'Asset_Dispose'
                  ? `${this.doc.name} (Write-Off)`
                  : `${this.doc.name} (${key}/${duration})`
            }
            items.push({
              _id: it._id,
              assetId: it.assetId ? it.assetId : this.doc._id,
              assetName: assetName,
              tranDate: it.tranDate,
              depreciation: it.depreciation,
              cumulativeDepreciation: it.cumulativeDepreciation,
              depreciationValue: it.depreciationValue,
              branchId: it.branchId,
              status: it.status,
              tranType: it.tranType,
              amount: it.amount,
              memo: it.memo ? it.memo : '',
              chartAccountId: it.chartAccountId ? it.chartAccountId : '',
            })
          })
          this.$nextTick(() => {
            this.form.items = items
          })
        } else {
          this.form.items = []
        }
      },
      immediate: true,
      // deep: true,
    },
    'form.items'(item) {
      if (item && item.length) {
        item.forEach((it, key) => {
          it._id = it && it._id ? it._id : it.assetId + '-' + key
        })
      }
    },
  },
  methods: {
    tableCellStyle({ row }) {
      if (
        row.tranType === 'Asset_Sale' ||
        row.tranType === 'Asset_Dispose' ||
        row.tranType === 'Asset_Transfer'
      ) {
        return { padding: '3px 0px', height: '40px', background: 'oldlace' }
      }
      if (row.tranType === 'Asset_Depreciation' && row.status === 'Closed') {
        return {
          padding: '3px 0px',
          height: '40px',
          background: 'rgb(240, 249, 235)',
        }
      }
      return { padding: '3px 0px', height: '40px' }
    },

    visibleBtnSchedule(row) {
      let res = false
      const currentDate = moment().toDate()
      const cond = moment(row.tranDate).isSameOrBefore(currentDate)
      if (
        row.status == 'Active' &&
        this.doc &&
        this.doc._id &&
        cond &&
        this.doc.status !== 'Sale' &&
        this.doc.status !== 'Write-Off' &&
        this.doc.status !== 'Transfer' &&
        this.$userIsInRole(['depreciation-fixed-asset-insert'])
      )
        res = true
      return res
    },
    visibleRemoveSchedule(row) {
      let res = false
      const cond = row.status == 'Closed' && this.doc && this.doc._id
      if (
        cond &&
        row.tranType == 'Asset_Depreciation' &&
        this.doc.status !== 'Sale' &&
        this.doc.status !== 'Write-Off' &&
        this.doc.status !== 'Transfer' &&
        this.$userIsInRole(['depreciation-fixed-asset-remove'])
      ) {
        res = true
      }
      if (
        cond &&
        row.tranType !== 'Asset_Depreciation' &&
        ((this.doc.status == 'Sale' &&
          this.$userIsInRole(['sale-fixed-asset-remove'])) ||
          (this.doc.status == 'Write-Off' &&
            this.$userIsInRole(['disposal-fixed-asset-remove'])))
      ) {
        res = true
      }
      return res
    },
    _calculated(row) {
      if (row.method == 'Straight Line') {
        this._straightLineMethod(row)
      } else {
        this._decliningMethod(row)
      }

      this.$nextTick(() => {
        this._emitToParent()
      })
    },
    // STRAIGHT LINE METHOD
    _straightLineMethod(row) {
      // FOR PUSH DATA
      this.form.items = []
      // GET DAY OF MONTH (រកចំនួនថ្ងៃសរុបក្នុងមួយខែៗ)
      const dayInMonths = moment(
        row.isProrataTemporis && row.prorataTemporis
          ? row.prorataTemporis
          : row.startDepreciating,
        'DD/MM/YYYY'
      ).daysInMonth()
      // GET DAY IN MONTH(START TO CURRENT OF MONTH) រកចំនួនថ្ងៃសរុបនៅក្នុងខែនីមួយៗ
      const days = moment(
        row.isProrataTemporis && row.prorataTemporis
          ? row.prorataTemporis
          : row.startDepreciating
      ).get('date')
      // CALCULATE DAY FOR DEPRECIATION (គណនារកថ្ងៃសរុបនៃការកាត់រំលស់)
      const numOfDays = dayInMonths - days + 1

      // CHECK FOR NEW DURATION
      let num = row.oneEntryEvery || 1
      let duration = 0
      while (num <= row.duration) {
        duration += 1
        if (num == row.duration) break
        num += row.oneEntryEvery
        if (num > row.duration) {
          num = row.duration
        }
      }

      // CALCULATE DEPRECIATION BY DURATION (10000/5) (គណនានៃការកាត់រំលស់ទៅតាមរយៈពេល)
      let depreciation = round(Decimal(row.bookValue).div(duration))
      // CALCULATE MONEY OF DAY PER MONTHS OR YEARS (គណនារកចំនួយទឹកប្រាក់សរុបក្នុងមួយថ្ងៃ សម្រាប់មួយខែៗ ឬមួយឆ្នាំៗ)
      const moneyPerDay =
        row.type == 'Months'
          ? round(Decimal(depreciation).div(dayInMonths))
          : round(Decimal(depreciation).div(365))
      // CALCULATE TOTAL MONEY OF MONTHS OR YEARS (គណនារកចំនួនទឹកប្រាក់សរុបនៃមួយខែៗ ឬមួយឆ្នាំៗ)
      const totalMoney =
        row.isProrataTemporis && row.prorataTemporis
          ? round(Decimal(moneyPerDay).mul(numOfDays))
          : Decimal(0)

      let balance = Decimal(row.bookValue)
      // CHECK FOR FIRST PRORATA TEMPORIS DATE
      if (row.isProrataTemporis && row.prorataTemporis) {
        balance = round(Decimal(row.bookValue).minus(totalMoney))

        this.form.items.push({
          // _id: this.doc._id + '-' + duration || '',
          assetId: this.doc._id || '',
          assetName: `${row.name} (Prorata Entry)`,
          tranDate: row.startDepreciating,
          depreciation: Decimal(totalMoney).toNumber(),
          cumulativeDepreciation: Decimal(totalMoney).toNumber(),
          depreciationValue: Decimal(balance).toNumber(),
          status: 'Active',
          branchId: row.branchId,
          tranType: 'Asset_Depreciation',
          amount: 0,
          memo: '',
          chartAccountId: '',
        })
      }
      //
      let cumulativeDepreciation = Decimal(0)

      let every = row.oneEntryEvery || 1
      let checkNum = 0
      let addDate = 0
      while (every <= row.duration) {
        checkNum += 1
        const cond = row.isProrataTemporis && row.prorataTemporis
        if (cond) {
          addDate = every
        } else if (!cond && every != 1) {
          addDate = every - 1
        }
        // ADD MONTH OR ADD END OF MONTH
        const checkMonth =
          checkNum == 1
            ? cond
              ? moment(row.startDepreciating)
                  .add(addDate, 'M')
                  .endOf('month')
                  .toDate()
              : moment(row.startDepreciating).add(addDate, 'M').toDate()
            : moment(row.startDepreciating)
                .add(addDate, 'M')
                .endOf('month')
                .toDate()
        // ADD END OF YEARS
        const checkYear =
          checkNum == 1
            ? moment(row.startDepreciating)
                .add(addDate, 'years')
                .endOf('years')
                .toDate()
            : moment(row.startDepreciating)
                .add(addDate, 'years')
                .endOf('years')
                .toDate()
        const startDepreciating = row.type == 'Months' ? checkMonth : checkYear
        if (every == row.duration) {
          depreciation = balance
        }

        cumulativeDepreciation =
          checkNum == 1
            ? round(
                Decimal(cumulativeDepreciation)
                  .plus(depreciation)
                  .plus(totalMoney)
              )
            : round(Decimal(cumulativeDepreciation).plus(depreciation))
        balance = round(Decimal(balance).minus(depreciation))

        this.form.items.push({
          assetId: this.doc._id || '',
          assetName: `${row.name} (${checkNum}/${duration})`,
          tranDate: startDepreciating,
          depreciation: Decimal(depreciation).toNumber(),
          cumulativeDepreciation: Decimal(cumulativeDepreciation).toNumber(),
          depreciationValue: Decimal(balance).toNumber(),
          status: 'Active',
          branchId: row.branchId,
          tranType: 'Asset_Depreciation',
          amount: 0,
          memo: '',
          chartAccountId: '',
        })
        if (every == row.duration) break
        every += row.oneEntryEvery
        if (every > row.duration) {
          every = row.duration
        }
      }
    },
    // DECLINING METHOD
    _decliningMethod(row) {
      this.form.items = []
      // GET DAY OF MONTH (រកចំនួនថ្ងៃសរុបក្នុងមួយខែៗ)
      const dayInMonths = moment(
        row.isProrataTemporis && row.prorataTemporis
          ? row.prorataTemporis
          : row.startDepreciating,
        'DD/MM/YYYY'
      ).daysInMonth()
      // GET DAY OF YEARS (រកចំនួនថ្ងៃសរុបក្នុងមួយឆ្នាំៗ)
      const dayInYears = moment(
        row.isProrataTemporis && row.prorataTemporis
          ? row.prorataTemporis
          : row.startDepreciating,
        'DD/MM/YYYY'
      ).dayOfYear()
      // GET DAY IN MONTH(START TO CURRENT OF MONTH) រកចំនួនថ្ងៃសរុបនៅក្នុងខែនីមួយៗ
      const days = moment(
        row.isProrataTemporis && row.prorataTemporis
          ? row.prorataTemporis
          : row.startDepreciating
      ).get('date')
      // CALCULATE DAY FOR DEPRECIATION (គណនារកថ្ងៃសរុបនៃការកាត់រំលស់)
      const numOfDays =
        row.type == 'Years' ? 365 - dayInYears + 1 : dayInMonths - days + 1

      // CHECK FOR NEW DURATION
      let num = row.oneEntryEvery || 1
      let duration = 0
      while (num <= row.duration) {
        duration += 1

        if (num == row.duration) break
        num += row.oneEntryEvery
        if (num > row.duration) {
          num = row.duration
        }
      }

      // CALCULATE DECLINING RATE
      const decliningRate = Decimal(100).div(row.duration).mul(2).div(100)
      // CALCULATE DEPRECIATION
      let depreciation = Decimal(row.originalValue).mul(decliningRate)

      // CALCULATE MONEY OF DAY PER MONTHS OR YEARS (គណនារកចំនួយទឹកប្រាក់សរុបក្នុងមួយថ្ងៃ សម្រាប់មួយខែៗ ឬមួយឆ្នាំៗ)
      const moneyPerDay =
        row.type == 'Months'
          ? Decimal(depreciation).div(dayInMonths)
          : Decimal(depreciation).div(365)
      // CALCULATE TOTAL MONEY OF MONTHS OR YEARS (គណនារកចំនួនទឹកប្រាក់សរុបនៃមួយខែៗ ឬមួយឆ្នាំៗ)
      const totalMoney =
        row.isProrataTemporis && row.prorataTemporis
          ? Decimal(moneyPerDay).mul(numOfDays)
          : Decimal(0)
      // FIRST BALANCE
      let balance = Decimal(row.originalValue)

      // CHECK FOR FIRST PRORATA TEMPORIS DATE
      if (row.isProrataTemporis && row.prorataTemporis) {
        balance = Decimal(row.originalValue).minus(totalMoney)
        this.form.items.push({
          assetId: this.doc._id || '',
          assetName: `${row.name} (Prorata Entry)`,
          tranDate: row.startDepreciating,
          depreciation: Decimal(totalMoney).toNumber(),
          cumulativeDepreciation: Decimal(totalMoney).toNumber(),
          depreciationValue: Decimal(balance).toNumber(),
          status: 'Active',
          branchId: row.branchId,
          tranType: 'Asset_Depreciation',
          amount: 0,
          memo: '',
          chartAccountId: '',
        })
      }

      let cumulativeDepreciation = Decimal(0)
      let balanceGreaterThenSalvage = Decimal(0)
      let lastIndex = 1
      let every = row.oneEntryEvery || 1
      let checkNum = 0
      let addDate = 0
      while (every <= row.duration) {
        checkNum += 1
        const cond = row.isProrataTemporis && row.prorataTemporis
        if (cond) {
          addDate = every
        } else if (!cond && every != 1) {
          addDate = every - 1
        }
        // ADD MONTH OR ADD END OF MONTH
        const checkMonth =
          checkNum == 1
            ? cond
              ? moment(row.startDepreciating)
                  .add(addDate, 'M')
                  .endOf('month')
                  .toDate()
              : moment(row.startDepreciating).add(addDate, 'M').toDate()
            : moment(row.startDepreciating)
                .add(addDate, 'M')
                .endOf('month')
                .toDate()
        // ADD END OF YEARS
        const checkYear =
          checkNum == 1
            ? moment(row.startDepreciating)
                .add(addDate, 'years')
                .endOf('years')
                .toDate()
            : moment(row.startDepreciating)
                .add(addDate, 'years')
                .endOf('years')
                .toDate()
        // DEPRECIATION DATE
        const startDepreciating = row.type == 'Months' ? checkMonth : checkYear
        // CALCULATE DEPRECIATION OF DURATION
        depreciation = Decimal(balance).mul(decliningRate)

        if (every == row.duration) {
          depreciation = balance
        }

        const tmpBalance = balance
        balance = Decimal(balance).minus(depreciation)

        if (balance > row.salvageValue) {
          balanceGreaterThenSalvage = balance
          lastIndex = checkNum
        }
        if (balance < row.salvageValue) {
          const index = duration - lastIndex
          const balanceAfterSuBSalvage = Decimal(
            balanceGreaterThenSalvage
          ).minus(row.salvageValue)
          depreciation = Decimal(balanceAfterSuBSalvage).div(index)
          balance = Decimal(tmpBalance).minus(depreciation)
        }

        cumulativeDepreciation =
          checkNum == 1
            ? Decimal(cumulativeDepreciation)
                .plus(depreciation)
                .plus(totalMoney)
            : Decimal(cumulativeDepreciation).plus(depreciation)

        this.form.items.push({
          assetId: this.doc._id || '',
          assetName: `${row.name} (${checkNum}/${duration})`,
          tranDate: startDepreciating,
          depreciation: Decimal(depreciation).toNumber(),
          cumulativeDepreciation: Decimal(cumulativeDepreciation).toNumber(),
          depreciationValue: Decimal(balance).toNumber(),
          status: 'Active',
          branchId: row.branchId,
          tranType: 'Asset_Depreciation',
          amount: 0,
          memo: '',
          chartAccountId: '',
        })

        if (every == row.duration) break
        every += row.oneEntryEvery
        if (every > row.duration) {
          every = row.duration
        }
      }
    },

    // HANDLE ROW CLICK
    _insertJournal(row) {
      if (row) {
        row.type = 'Insert'
        this.loading = true
        insertJournalDepreciation
          .callPromise({
            doc: row,
          })
          .then((result) => {
            if (result == false) {
              this.loading = false
              this.$store.dispatch(
                'app/messageS',
                `Please run schedule and save again before push to account`
              )
            } else {
              this.loading = false
              this.$store.dispatch('app/messageS', `Depreciation saved`)
              this.$nextTick(() => {
                this.$emit('reload-data')
              })
            }
          })
          .catch((err) => {
            console.log(err)
            this.loading = false
            this.$store.dispatch('app/messageE', err)
          })
      }
    },
    // REMOVE DATA FROM JOURNAL
    _removeJournal(row) {
      if (row) {
        let title = 'Depreciation'
        let method = removeJournalDepreciation
        if (row.tranType == 'Asset_Sale') {
          title = 'Sale Asset'
          method = removeSaleFixedAsset
        } else if (row.tranType == 'Asset_Dispose') {
          title = 'Write Off Asset'
          method = removeSaleFixedAsset
        }
        // else {
        //   title = 'Transfer Asset'
        //   method = removeSaleFixedAsset
        // }
        const type = 'Remove'
        this.loading = true
        const selector = {
          _id: row._id,
          assetName: row.assetName,
          assetId: row.assetId,
          tranDate: row.tranDate,
          depreciation: row.depreciation,
          tranType: row.tranType,
          type,
        }
        method
          .callPromise({ selector })
          .then((result) => {
            if (result) {
              this.loading = false
              this.$store.dispatch('app/messageS', `${title} removed`)
              this.$nextTick(() => {
                this.$emit('reload-data')
              })
            }
          })
          .catch((err) => {
            console.log(err)
            this.loading = false
            this.$store.dispatch('app/messageE', err)
          })
      }
    },

    _submit() {
      this.$refs['form'].validate((valid) => {
        this.$emit('submit-form', valid)
      })
    },

    _emitToParent() {
      this.$emit('item-change', this.form.items)
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.status-active {
  font-size: 20px;
  padding: 0px;
  margin: 0px;
  color: #409eff;
}
.status-active {
  font-size: 20px;
  padding: 0px;
  margin: 0px;
  color: #409eff;
  cursor: pointer;
  &:hover {
    color: #66b1ff;
  }
}

.remove-icon {
  font-size: 18px;
  padding: 0px;
  margin: 0px;
  color: #f56c6c;
}
.remove-action {
  font-size: 18px;
  padding: 0px;
  margin: 0px;
  color: #f56c6c;
  cursor: pointer;
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
.el-form-item__content {
  display: block !important;
}
</style>
