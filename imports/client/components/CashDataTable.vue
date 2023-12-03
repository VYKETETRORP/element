<template>
  <div>
    <el-form ref="form" :model="form" :inline="true">
      <el-popover trigger="click" placement="bottom-start" width="300">
        <el-form-item :label="$t('app.account-setting-exchange.Date')">
          <el-select
            v-model="form.filterDate"
            placeholder="Select"
            @change="applyFilter"
            style="width: 100%"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <template #reference>
          <el-button class="filter">
            <template #icon>
              <i class="fas fa-filter" />
            </template>
            Filter
          </el-button>
        </template>
      </el-popover>

      <el-form-item class="input-width" prop="journalType">
        <el-select
          v-model="form.journalType"
          clearable
          multiple
          placeholder="Journal Type"
        >
          <el-option
            v-for="item in journalTypeOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="input-width">
        <el-select v-model="form.fieldName" clearable placeholder="Field name">
          <el-option
            v-for="item in filterOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="input-width">
        <el-input
          v-model="form.searchFilter"
          clearable
          placeholder="Search....."
          @focus="$event.target.select()"
          @keyup.enter="applyFilter"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="applyFilter">
          <template #icon>
            <i class="fas fa-search" />
          </template>
          {{ $t('app.btn.search') }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Form Filter -->
    <!-- <fieldset class="ra-fieldset">
      <legend>Filter</legend> -->
    <!-- <el-popover
      v-model="visibleFilter"
      placement="bottom-start"
      width="850"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="70px"

      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="Date">
              <el-date-picker
                v-model="form.tranDate"
                :format="pickerFormat"
                :shortcuts="pickerOpts"
                type="daterange"
                start-placeholder="Start Date"
                end-placeholder="End Date"
              />
            </el-form-item>

            <el-form-item
              label="Type"
              prop="journalType"
            >
              <el-select
                v-model="form.journalType"
                clearable
                multiple
              >
                <el-option
                  v-for="item in journalTypeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="Currency"
              prop="currency"
            >
              <el-select
                v-model="form.currency"
                clearable
                multiple
              >
                <el-option
                  v-for="item in currencyOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="Ref no."
              prop="refNo"
            >
              <el-input
                v-model="form.refNo"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="Amount"
              prop="amount"
            >
              <el-input
                v-model.number="form.amount"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                @click="applyFilter"
              >
                Apply
              </el-button>
              <el-button
                type="default"
                @click="resetFilter"
              >
                Reset
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #reference>
        <el-button
        >
          <template #icon>
            <i class="fas fa-filter"/>
          </template>
          Filter
        </el-button>
      </template>
    </el-popover> -->
    <!-- </fieldset> -->

    <!-- Data Table -->
    <DataTablesServer
      v-loading="loading"
      sortable="custom"
      :data="tableData"
      :total="tableTotal"
      :table-props="tableProps"
      @query-change="getTableData"
      class="acc-tran-fixed-height"
    >
      <el-table-column
        v-for="title in tableTitles"
        :key="title.label"
        :prop="title.prop"
        :label="title.label"
      >
        <template #default="scope">
          <span
            v-if="title.prop === 'tranDate'"
            class="ra-text-link"
            @click="refClick(scope.row)"
          >
            {{ $filters.date(scope.row.tranDate) }}
          </span>
          <span v-else-if="title.prop === 'amount'">
            {{ $filters.number(scope.row.amount) }}
          </span>
          <span v-else>
            {{ scope.row[title.prop] }}
          </span>
        </template>
      </el-table-column>
    </DataTablesServer>
  </div>
</template>

<script>
import { Meteor } from 'meteor/meteor'
import _ from 'lodash'
import moment from 'moment'
import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapCurrentTime from '/imports/client/lib/wrap-current-time'
import { getJournalsDataTable } from '../../api/journals/methods'

// Component
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElDatePicker,
  ElInput,
  ElSelect,
  ElOption,
  Table,
  TableColumn,
  Pagination,
  ElPopover,
  ElRow,
  ElCol,
} from 'element-plus'
import DataTablesServer from './DataTablesServer.vue'

export default {
  name: 'JournalDataTable',
  components: {
    [ElButton.name]: ElButton,
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElDatePicker.name]: ElDatePicker,
    [ElInput.name]: ElInput,
    [ElSelect.name]: ElSelect,
    [ElOption.name]: ElOption,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Pagination.name]: Pagination,
    [ElPopover.name]: ElPopover,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
    DataTablesServer,
  },
  props: {
    exFilter: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      // Form
      pickerFormat: 'DD/MM/YYYY',
      pickerOpts: dateRangePickerOpts,
      form: {
        tranDate: [],
        journalType: [],
        currency: [],
        refNo: '',
        amount: 0,
        filterDate: '365',
        searchFilter: '',
        fieldName: '',
      },

      // Table
      loading: false,
      tableData: [],
      tableTotal: 0,
      tableTitles: [
        {
          prop: 'tranDate',
          label: `${this.$t('app.account-setting-account-type.Date')}`,
        },
        {
          prop: 'refNo',
          label: `${this.$t('app.account-setting-account-type.Ref No')}`,
        },
        {
          prop: 'journalType',
          label: `${this.$t('app.account-setting-account-type.Type')}`,
        },
        {
          prop: 'currency',
          label: `${this.$t('app.account-setting-account-type.Currency')}`,
        },
        {
          prop: 'amount',
          label: `${this.$t('app.account-setting-account-type.Amount')}`,
        },
        {
          prop: 'memo',
          label: `${this.$t('app.account-setting-account-type.Memo')}`,
        },
      ],
      tableProps: {
        height: `calc(100vh - 432px)`,
        border: true,
        stripe: true,
      },
      tableQuery: null,
      filterOpts: [
        { label: 'Ref No', value: 'refNo' },
        // { label: 'Ref Type', value: 'refType' },
        { label: 'Currency', value: 'currency' },
        { label: 'Amount', value: 'amount' },
        { label: 'Memo', value: 'memo' },
      ],

      options: [
        {
          value: '365',
          label: 'Last 365 Days',
        },
        {
          value: 'today',
          label: 'Today',
        },
        {
          value: 'yesterday',
          label: 'Yesterday',
        },
        {
          value: 'currentWeek',
          label: 'This week',
        },
        {
          value: 'currentMonth',
          label: 'This Month',
        },
        {
          value: 'currentQuarter',
          label: 'This Quarter',
        },
        {
          value: 'currentYear',
          label: 'This Year',
        },
        {
          value: 'lastWeek',
          label: 'Last Week',
        },
        {
          value: 'lastMonth',
          label: 'Last Month',
        },
        {
          value: 'lastQuarter',
          label: 'Last Quarter',
        },
        {
          value: 'lastYear',
          label: 'Last Year',
        },
        {
          value: 'all',
          label: 'All Dates',
        },
      ],
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    journalTypeOpts() {
      return this.$store.state.app.lookup.journalType
    },
    currencyOpts() {
      return this.$store.state.app.lookup.currency
    },
    // Selector
    dataSelector() {
      let selector = {}
      if (!_.isEmpty(this.exFilter)) {
        selector = _.clone(this.exFilter)
        selector.tranDate = {
          $gte: moment().subtract(365, 'days').startOf('day').toDate(),
        }
      }
      // date filter
      if (this.form.date) {
        selector.tranDate = {
          $gte: moment(wrapCurrentTime(this.form.date[0]))
            .startOf('day')
            .toDate(),
          $lte: moment(wrapCurrentTime(this.form.date[1]))
            .endOf('day')
            .toDate(),
        }
      }

      // // Refno
      // if (!_.isEmpty(this.form.refNo)) selector.refNo = this.form.refNo

      // // trantype filter
      // if (!_.isEmpty(this.form.tranType)) {
      //   selector.tranType = { $in: this.form.tranType }
      // }
      // // Ref Type
      // if (this.form.refType.length)
      //   selector.refType = { $in: this.form.refType }

      // // Status
      // if (this.form.status.length) selector.status = { $in: this.form.status }

      // // Amount
      // if (this.form.amount) selector.amount = this.form.amount
      //365 days detail
      if (this.form.filterDate == '365') {
        selector.tranDate = {
          $gte: moment().subtract(365, 'days').startOf('day').toDate(),
        }
      }
      //today
      if (this.form.filterDate == 'today') {
        selector.tranDate = {
          $gte: moment().startOf('day').toDate(),
          $lte: moment().endOf('day').toDate(),
        }
      }
      //yesterday
      if (this.form.filterDate == 'yesterday') {
        selector.tranDate = {
          $gte: moment().subtract(1, 'days').startOf('day').toDate(),
          $lte: moment().subtract(1, 'days').endOf('day').toDate(),
        }
      }
      //this week
      if (this.form.filterDate == 'currentWeek') {
        selector.tranDate = {
          $gte: moment().startOf('week').toDate(),
          $lte: moment().endOf('week').toDate(),
        }
      }
      //this month
      if (this.form.filterDate == 'currentMonth') {
        selector.tranDate = {
          $gte: moment().startOf('month').toDate(),
          $lte: moment().endOf('month').toDate(),
        }
      }
      //this quarter
      if (this.form.filterDate == 'currentQuarter') {
        selector.tranDate = {
          $gte: moment().startOf('quarter').toDate(),
          $lte: moment().endOf('quarter').toDate(),
        }
      }
      //this year
      if (this.form.filterDate == 'currentYear') {
        selector.tranDate = {
          $gte: moment().startOf('year').toDate(),
          $lte: moment().endOf('year').toDate(),
        }
      }
      //Last week
      if (this.form.filterDate == 'lastWeek') {
        selector.tranDate = {
          $gte: moment().subtract(1, 'weeks').startOf('week').toDate(),
          $lte: moment().subtract(1, 'weeks').endOf('week').toDate(),
        }
      }
      //Last month
      if (this.form.filterDate == 'lastMonth') {
        selector.tranDate = {
          $gte: moment().subtract(1, 'months').startOf('months').toDate(),
          $lte: moment().subtract(1, 'months').endOf('months').toDate(),
        }
      }
      //last quarter
      if (this.form.filterDate == 'lastQuarter') {
        selector.tranDate = {
          $gte: moment().subtract(1, 'weeks').startOf('quarter').toDate(),
          $lte: moment().subtract(1, 'weeks').endOf('quarter').toDate(),
        }
      }
      //Last year
      if (this.form.filterDate == 'lastYear') {
        selector.tranDate = {
          $gte: moment().subtract(1, 'year').startOf('year').toDate(),
          $lte: moment().subtract(1, 'year').endOf('year').toDate(),
        }
      }
      return selector
    },
  },
  watch: {
    exFilter(val) {
      this.getTableData(this.tableQuery)
    },
  },
  mounted() {
    this.getTypeOpts()
  },

  methods: {
    getTypeOpts() {
      this.$store.dispatch('app/lookup/getJournalType', { selector: {} })
    },

    // Get data
    getTableData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query
        // Pick params
        // let params = {
        //   tranDate: [],
        //   journalType: this.form.journalType,
        //   currency: this.form.currency,
        //   refNo: this.form.refNo,
        //   amount: this.form.amount,
        //   chartAccountId: this.exFilter.chartAccountId,
        //   branchId: this.exFilter.branchId,
        //   opts: query,
        // }
        let {
          journalType: journalType = [],
          fieldName: fieldName = '',
          searchFilter: searchFilter = '',
          // tranDate: tranDate = [],
          // opts: query,
        } = this.form
        let {
          tranDate: { $gte: dateF = '', $lte: dateT = '' },
        } = this.dataSelector
        // if (this.form.tranDate && this.form.tranDate.length) {
        //   params.tranDate = [
        //     moment(wrapCurrentTime(this.form.tranDate[0]))
        //       .startOf('day')
        //       .toDate(),
        //     moment(wrapCurrentTime(this.form.tranDate[1]))
        //       .endOf('day')
        //       .toDate(),
        //   ]
        // }
        let tranDate = []
        if (dateF) tranDate.push(dateF)
        if (dateT) tranDate.push(dateT)
        getJournalsDataTable
          .callPromise({
            branchId: this.exFilter.branchId,
            chartAccountId: this.exFilter.chartAccountId,
            tranDate,
            journalType,
            opts: query,
            fieldName,
            searchFilter,
          })
          .then((res) => {
            this.tableData = res.data
            this.tableTotal = res.total
            this.loading = false
          })
          .catch((err) => {
            console.log(err)
            this.loading = false
            this.$store.dispatch('app/messageE', err.reason)
          })
      }
    },
    applyFilter() {
      this.getTableData(this.tableQuery)
    },
    resetFilter() {
      this.form = {
        tranDate: [],
        journalType: [],
        currency: [],
        refNo: '',
        amount: 0,
        filterDate: '365',
      }
      this.$nextTick(() => {
        this.getTableData(this.tableQuery)
      })
    },
    refClick(row) {
      this.$emit('ref-click', row)
    },
  },
}
</script>

<style lang="scss" scoped>
.el-icon-menu {
  font-size: 15px;
}
.input-width {
  width: 16% !important;
}
.filter {
  float: left;
  margin-right: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px !important;
}
</style>
