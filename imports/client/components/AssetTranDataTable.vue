<template>
  <div class="table-container">
    <el-form
      ref="form"
      :model="form"
      :inline="true"
    >
      <el-popover
        v-model:visible="visibleFilter"
        placement="bottom-start"
        width="300"
      >
        <el-form-item :label="$t('app.fixed-asset-setting.date')">
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
          <el-button class="filter">
            <template #icon> <i class="fas fa-filter" /> </template>

            {{ $t('app.fixed-asset-setting.filter') }}
          </el-button>
        </template>
      </el-popover>

      <el-form-item class="input-width">
        <el-select
          v-model="form.fieldName"
          clearable
          :placeholder="$t('app.fixed-asset-setting.filterName') + '...'"
        >
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
          :placeholder="$t('app.fixed-asset-setting.search') + '...'"
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
        class="table-auto-height"
        :data="tableData"
        :total="tableTotal"
        :table-props="tableProps"
        :pagination-props="tablePagination"
        @query-change="onQueryChange"
      >
        <el-table-column
          v-for="title in tableTitles"
          :key="title.label"
          :prop="title.prop"
          :label="title.label"
          :header-align="
            title.prop === 'originalValue' ||
            title.prop === 'salvageValue' ||
            title.prop === 'bookValue'
              ? 'right'
              : 'left'
          "
          :align="
            title.prop === 'originalValue' ||
            title.prop === 'salvageValue' ||
            title.prop === 'bookValue'
              ? 'right'
              : 'left'
          "
        >
          <template #default="scope">
            <span v-if="title.prop === 'tranDate'">
              {{ $filters.date(scope.row.tranDate) }}
            </span>
            <span
              v-else-if="title.prop == 'refNo'"
              class="ra-text-link"
              @click="refClick(scope.row)"
            >
              {{ scope.row.refNo }}
            </span>
            <span
              v-else-if="
                title.prop === 'originalValue' ||
                title.prop === 'salvageValue' ||
                title.prop === 'bookValue'
              "
            >
              <!-- {{ $filters.number(scope.row[title.prop]) }} -->
              {{
                $filters.number(
                  scope.row[title.prop],
                  currency(scope.row.currency)
                )
              }}
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
import { clone, isEmpty, toLower } from 'lodash'
import moment from 'moment'

import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapCurrentTime from '/imports/client/lib/wrap-current-time'
import { getAssetDataTable } from '../../api/fixed-assets/methods'

// Components
import VueElementLoading from 'vue-element-loading'
import DataTablesServer from '../components/DataTablesServer.vue'
import {
  ElForm,
  ElFormItem,
  ElPopover,
  ElTableColumn,
  ElSelect,
  ElOption,
  ElButton,
  ElInput,
} from 'element-plus'

export default {
  name: 'AssetTranDataTable',
  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElPopover.name]: ElPopover,
    [ElTableColumn.name]: ElTableColumn,
    [ElSelect.name]: ElSelect,
    [ElOption.name]: ElOption,
    [ElButton.name]: ElButton,
    [ElInput.name]: ElInput,
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
  },
  data() {
    return {
      // Form
      pickerFormat: 'DD/MM/YYYY',
      pickerOpts: dateRangePickerOpts,
      visibleFilter: false,
      form: {
        // isDate: false,
        // tranDate: [moment().toDate(), moment().toDate()],
        filterDate: '365',
        fieldName: '',
        searchFilter: '',
      },

      // Table
      loading: false,
      tableData: [],
      tableTotal: 0,

      tableProps: {
        height: `calc(100% - 40px)`,
        border: true,
        stripe: true,
      },
      tablePagination: {
        pageSizes: [20, 50, 100],
        pagerCount: 5,
        layout: 'prev, pager, next,jumper,sizes,total',
      },
      tableQuery: null,
      filterOpts: [
        { label: 'Ref No', value: 'refNo' },
        { label: 'Asset Name', value: 'name' },
        { label: 'Asset Type', value: 'type' },
        { label: 'Asset Method', value: 'method' },
        { label: 'Original Value', value: 'originalValue' },
        { label: 'Salvage Value', value: 'salvageValue' },
        { label: 'Book Value', value: 'bookValue' },
        { label: 'Status', value: 'status' },
        { label: 'Currency', value: 'currency' },
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
          label: `${this.$t('app.fixed-asset-setting.tranDate')}`,
        },
        {
          prop: 'refNo',
          label: `${this.$t('app.fixed-asset-setting.refNo')}`,
        },
        {
          prop: 'name',
          label: `${this.$t('app.fixed-asset-setting.name')}`,
        },

        {
          prop: 'method',
          label: `${this.$t('app.fixed-asset-setting.method')}`,
        },
        // {
        //   prop: 'tranType',
        //   label: `${this.$t('app.fixed-asset-setting.tranType')}`,
        // },
        {
          prop: 'status',
          label: `${this.$t('app.fixed-asset-setting.status')}`,
        },
        {
          prop: 'currency',
          label: `${this.$t('app.fixed-asset-setting.currency')}`,
        },
        {
          prop: 'originalValue',
          label: `${this.$t('app.fixed-asset-setting.originalValue')}`,
        },
        {
          prop: 'salvageValue',
          label: `${this.$t('app.fixed-asset-setting.salvageValue')}`,
        },
        {
          prop: 'bookValue',
          label: `${this.$t('app.fixed-asset-setting.bookValue')}`,
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
        selector.assetTypeId = this.exFilter.assetTypeId
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

      // FILTER FIELD NAME
      if (!isEmpty(this.form.fieldName))
        selector.fieldName = this.form.fieldName

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
      //Last year
      if (this.form.filterDate == 'all') {
        selector.tranDate = {
          $lte: moment().endOf('day').toDate(),
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
    currency(currency) {
      return toLower(currency)
    },
    getTypeOpts() {
      this.$store.dispatch('app/lookup/getJournalType', { selector: {} })
    },

    // Get data
    getTableData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query
        const { searchFilter: searchFilter = '', filterDate } = this.form
        const {
          tranDate: { $gte: dateF = '', $lte: dateT = '' },
          assetTypeId,
          fieldName,
        } = this.dataSelector
        const tranDate = []
        if (dateF) tranDate.push(dateF)
        if (dateT) tranDate.push(dateT)
        getAssetDataTable
          .callPromise({
            branchId: this.currentBranchId,
            assetTypeId,
            filterDate,
            acquisitionDate: tranDate,
            fieldName,
            searchFilter,
            opts: query,
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
    onQueryChange(query) {
      // Vue element loading will crash without $nextTick
      this.$nextTick(() => {
        this.getTableData(query)
      })
    },
    applyFilter() {
      this.visibleFilter = false
      this.getTableData(this.tableQuery)
    },
    resetFilter() {
      this.visibleFilter = false
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

<style
  lang="scss"
  scoped
>
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
