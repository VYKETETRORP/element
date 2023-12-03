<template>
  <div class="table-container">
    <el-form
      ref="form"
      :model="form"
      :inline="true"
      class="form-search-center"
    >
      <el-popover
        trigger="click"
        placement="bottom-start"
        width="300"
      >
        <el-form-item :label="$t('app.account-setting-exchange.Date')">
          <el-select
            v-model="form.filterDate"
            placeholder="Select"
            style="width: 100%"
            @change="applyFilter"
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
          <el-button class="btn-filter">
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
          collapse-tags
          collapse-tags-tooltip
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
        <el-button
          type="primary"
          @click="applyFilter"
        >
          <template #icon>
            <i class="fas fa-search" />
          </template>
          {{ $t('app.btn.search') }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Data Table -->
    <div class="table-wrapper">
      <vue-element-loading
        :active="loading"
        spinner="bar-fade-scale"
        color="#409eff"
        text="Rabbit Tech"
      />
      <DataTablesServer
        sortable="custom"
        :data="tableData"
        :total="tableTotal"
        :table-props="tableProps"
        :pagination-props="tablePagination"
        class="table-auto-height"
        @query-change="onQueryChange"
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
            <span v-else-if="title.prop === 'dr'">
              {{ $filters.number(scope.row.dr) }}
            </span>
            <span v-else-if="title.prop === 'cr'">
              {{ $filters.number(scope.row.cr) }}
            </span>
            <span v-else>
              {{ scope.row[title.prop] }}
            </span>
          </template>
        </el-table-column>
      </DataTablesServer>
    </div>
  </div>
</template>

<script>
import { clone, isEmpty } from 'lodash'
import moment from 'moment'

// Libs
import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapCurrentTime from '/imports/client/lib/wrap-current-time'

// Methods
import { getJournalsDataTable } from '../../api/journals/methods'

// Components
import VueElementLoading from 'vue-element-loading'
import DataTablesServer from '../components/DataTablesServer.vue'

import {
  ElButton,
  ElForm,
  ElFormItem,
  ElDatePicker,
  ElInput,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElPopover,
  ElRow,
  ElCol,
} from 'element-plus'

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
    [ElTable.name]: ElTable,
    [ElTableColumn.name]: ElTableColumn,
    [ElPagination.name]: ElPagination,
    [ElPopover.name]: ElPopover,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
    DataTablesServer,
    VueElementLoading,
  },
  props: {
    exFilter: {
      type: Object,
      default() {
        return {}
      },
    },
    accountNature: {
      type: Array,
      default() {
        return []
      },
    },
    tableHeight: {
      type: String,
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

      tableProps: {
        border: true,
        stripe: true,
        height: this.tableHeight,
      },
      tablePagination: {
        pageSizes: [20, 50, 100],
        pagerCount: 5,
        layout: 'prev, pager, next,jumper,sizes,total',
      },
      tableQuery: null,
      filterOpts: [
        { label: 'Ref No', value: 'refNo' },
        // { label: 'Ref Type', value: 'refType' },
        { label: 'Currency', value: 'currency' },
        { label: 'Dr', value: 'dr' },
        { label: 'Cr', value: 'cr' },
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
    tableTitles() {
      tableTitles = [
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
          prop: 'memo',
          label: `${this.$t('app.account-setting-account-type.Memo')}`,
        },
        {
          prop: 'dr',
          label: `${this.$t('app.account-setting-account-type.Debit')}`,
        },
        {
          prop: 'cr',
          label: `${this.$t('app.account-setting-account-type.Credit')}`,
        },
      ]
      return tableTitles
    },
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
      if (!isEmpty(this.exFilter)) {
        selector = clone(this.exFilter)
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
      // 365 days detail
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
    exFilter() {
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
        const {
          journalType: journalType = [],
          fieldName: fieldName = '',
          searchFilter: searchFilter = '',
          // tranDate: tranDate = [],
          // opts: query,
        } = this.form
        const {
          tranDate: { $gte: dateF = '', $lte: dateT = '' },
        } = this.dataSelector
        const tranDate = []
        if (dateF) tranDate.push(dateF)
        if (dateT) tranDate.push(dateT)
        getJournalsDataTable
          .callPromise({
            branchId: this.currentBranchId,
            chartAccountId: this.exFilter.chartAccountId,
            accountNature: this.accountNature,
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
      this.$router.push(row.route)
    },
    onQueryChange(query) {
      // Vue element loading will crash without $nextTick
      this.$nextTick(() => {
        this.getTableData(query)
      })
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.input-width {
  width: 16% !important;
}
.btn-filter {
  float: left;
  margin-right: 10px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px !important;
}
</style>
