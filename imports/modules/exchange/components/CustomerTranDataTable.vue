<template>
  <div class="journal-container">
    <!-- dialog -->
    <!-- status received note -->

    <el-form
      ref="form"
      :model="form"
      :inline="true"
    >
      <el-form-item>
        <el-popover
          v-model="visibleFilter"
          placement="bottom-start"
          width="300"
        >
          <el-select
            v-model="form.filterDate"
            placeholder="Select"
            @change="applyFilter"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <template #reference>
            <el-button size="default">
              <template #icon>
                <i class="fas fa-filter" />
              </template>

              {{ $t('exchange.customer.filter') }}
            </el-button>
          </template>
        </el-popover>
      </el-form-item>

      <el-form-item
        class="input-width"
        prop="tranType"
      >
        <el-select
          v-model="form.tranType"
          clearable
          multiple
          collapse-tags
          placeholder="Tran Type"
        >
          <el-option
            v-for="item in tranTypeOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="input-width">
        <el-select
          v-model="form.fieldName"
          clearable
          placeholder="Field name"
        >
          <el-option
            v-for="item in filterOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-input
          v-model="form.searchFilter"
          clearable
          placeholder="Search....."
          @focus="$event.target.select()"
          @keyup.enter.native="applyFilter"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="default"
          @click="applyFilter"
        >
          <template #icon>
            <i class="fas fa-search" />
          </template>
          {{ $t('exchange.customer.search') }}
        </el-button>
      </el-form-item>
    </el-form>

    <!--Table List-->
    <div class="table-wrapper">
      <!-- <vue-element-loading
        :active="loading"
        spinner="bar-fade-scale"
        color="#409eff"
        text="Rabbit Tech..."
      /> -->
      <data-tables-server
        :data="tableData"
        :total="tableTotal"
        :table-props="tableProps"
        :pagination-props="tablePagination"
        class="table-auto-height"
        @query-change="getTableData"
      >
        <el-table-column
          align="center"
          width="37"
        >
          <template #header>
            <i class="el-icon-menu popover-icon" />
          </template>
          <template #default="scope">
            <el-dropdown
              trigger="click"
              @command="tableActionClick"
            >
              <span class="el-dropdown-link">
                <i class="fa fa-bars" />
              </span>
              <!--v-if="scope.row.tranType === 'Exchange'"-->
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ row: scope.row }">
                    Print
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <!-- </span> -->
          </template>
        </el-table-column>
        <el-table-column
          v-for="title in tableTitles"
          :key="title.label"
          :prop="title.prop"
          :label="title.label"
          :align="title.align"
        >
          <template #default="scope">
            <div
              v-if="title.prop === 'refNo'"
              class="ra-text-link"
              @click="refClick(scope.row)"
            >
              {{ scope.row.refNo }}
            </div>
            <div
              v-else-if="title.prop === 'customerName'"
              style="color: #409eff"
              class="text-left"
            >
              {{ scope.row && scope.row.customerName }}
            </div>
            <span v-else-if="title.prop === 'tranDate'">
              {{ formatDate(scope.row.tranDate) }}
            </span>
            <div
              v-else-if="title.prop === 'received'"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.received,
                  scope.row.baseSymbol
                )
              }}
            </div>
            <div
              v-else-if="title.prop === 'exchangeAmount'"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.exchangeAmount,
                  scope.row.baseSymbol
                )
              }}
            </div>
            <div
              v-else-if="title.prop === 'amount'"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.amount,
                  scope.row.toSymbol
                )
              }}
            </div>
            <div
              v-else-if="title.prop === 'return'"
              class="text-right"
            >
              {{
                $filters.exchangeBaseCurrency(
                  scope.row.return,
                  scope.row.baseSymbol
                )
              }}
            </div>
            <span v-else-if="title.prop === 'tranType'">
              <el-tag
                style="background-color: #409eff !important; color: white"
              >
                <b>{{ scope.row.tranType }}</b>
              </el-tag>
            </span>
            <span v-else-if="title.prop === 'currency'">
              <el-tag
                type="warning"
                effect="dark"
              >
                <b>{{ scope.row.currency }}</b>
              </el-tag>
            </span>
            <span v-else>
              <el-tag
                type="warning"
                effect="dark"
              >
                <b>{{ scope.row[title.prop] }}</b>
              </el-tag>
            </span>
          </template>
        </el-table-column>
      </data-tables-server>
    </div>
  </div>
</template>

<script>
import Notify from '/imports/client/lib/notify'
import moment from 'moment'
import _ from 'lodash'
import { mapState } from 'vuex'
import escapeRegExp from '../../../api/lib/escapeRegExp'
import VueElementLoading from 'vue-element-loading'

import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapperCurrentTime from '/imports/client/lib/wrap-current-time'
// component
import dataTablesMixin from '/imports/client/mixins/data-tables'
import DataTablesServer from '/imports/client/components/DataTablesServer.vue'
// lookup value

// Methods
import { customerCenter } from '../api/transaction/methods'
// import { findTemplate } from '../../api/templates/methods'
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
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from 'element-plus'
export default {
  name: 'CustomerTranDataTable',
  components: {
    // VueElementLoading,
    DataTablesServer,
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
    ElTag,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
  },
  mixins: [dataTablesMixin],
  props: {
    customerFilter: {
      type: Object,
      default: function () {
        return []
      },
    },
    tableHeight: {
      type: String,
    },
  },
  data() {
    return {
      // disable printing
      disablePrintOpts: false,
      printPOMiniOpt: '',
      printPOSimOpt: '',
      printPCMiniOpt: '',
      printPCSimOpt: '',

      // dialog

      visibleDelivery: false,
      loading: false,
      visibleFilter: false,
      // form
      pickerFormat: 'DD/MM/YYYY',
      pickerOpts: dateRangePickerOpts,
      tranTypeOpts: [{ label: 'Exchange', value: 'Exchange' }],
      filterOpts: [
        { label: 'Ref No', value: 'refNo' },
        { label: 'Tran Type', value: 'tranType' },
        { label: 'Customer', value: 'customerName' },
        { label: 'Tran Date', value: 'tranDate' },
        { label: 'Currency', value: 'currency' },
        { label: 'Received', value: 'received' },
        { label: 'Exchange Amount', value: 'exchangeAmount' },
        { label: 'Amount', value: 'amount' },
        { label: 'Return', value: 'return' },
      ],
      form: {
        date: '',
        refNo: '',
        amount: 0,
        tranType: [],
        filterDate: '365',
        searchFilter: '',
        fieldName: '',
      },

      // data table prop
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
    ...mapState({
      currentBranchId(state) {
        const branch = state.app.currentBranch
        return branch && branch._id
      },
    }),

    // Selector
    dataSelector() {
      let selector = {}

      if (!_.isEmpty(this.customerFilter)) {
        selector = _.clone(this.customerFilter)
        selector.tranDate = {
          $gte: moment().subtract(365, 'days').startOf('day').toDate(),
        }
      }
      // date filter
      if (this.form.date) {
        selector.tranDate = {
          $lte: moment(wrapperCurrentTime(this.form.date[1]))
            .endOf('day')
            .toDate(),
          $gte: moment(wrapperCurrentTime(this.form.date[0]))
            .startOf('day')
            .toDate(),
        }
      }

      // trantype filter
      if (!_.isEmpty(this.form.tranType)) {
        selector.tranType = { $in: this.form.tranType }
      }
      // // Refno
      // if (!_.isEmpty(this.form.refNo)) selector.refNo = this.form.refNo
      // // Ref Type
      // if (this.form.refType.length)
      //   selector.refType = { $in: this.form.refType }

      // // Status
      // if (this.form.status.length) selector.status = { $in: this.form.status }

      // // Amount
      // if (this.form.amount) selector.amount = this.form.amount

      // Ref no
      this.form.searchFilter = this.form.searchFilter.trim()
      const exp = this.form.searchFilter
        ? new RegExp(escapeRegExp(this.form.searchFilter))
        : ''
      if (exp) {
        if (!_.isEmpty(this.form.fieldName)) {
          if (!_.isEmpty(this.form.searchFilter)) {
            if (
              this.form.fieldName === 'received' ||
              this.form.fieldName === 'exchangeAmount' ||
              this.form.fieldName === 'amount' ||
              this.form.fieldName === 'return'
            ) {
              selector[`${this.form.fieldName}`] = +this.form.searchFilter
            } else {
              selector[`${this.form.fieldName}`] = {
                $regex: exp,
                $options: 'i',
              }
            }
          }
        } else {
          if (this.form.searchFilter) {
            selector.$or = [
              { refNo: { $regex: exp, $options: 'i' } },
              { tranType: { $regex: exp, $options: 'i' } },
              { customerName: { $regex: exp, $options: 'i' } },
              { currency: { $regex: exp, $options: 'i' } },
              { received: +this.form.searchFilter },
              { exchangeAmount: +this.form.searchFilter },
              { amount: +this.form.searchFilter },
              { return: +this.form.searchFilter },
            ]
          }
        }
      }

      //365 days detail
      if (this.form.filterDate == '356') {
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

    tableTitles() {
      const tableTitles = [
        {
          prop: 'tranDate',
          label: `${this.$t('exchange.tableLabel.date')}`,
          align: 'left',
        },
        {
          prop: 'refNo',
          label: `${this.$t('exchange.tableLabel.refNo')}`,
          align: 'left',
        },
        {
          prop: 'customerName',
          label: `${this.$t('exchange.tableLabel.customerName')}`,
          align: 'left',
        },
        {
          prop: 'tranType',
          label: `${this.$t('exchange.tableLabel.tranType')}`,
          align: 'left',
        },
        {
          prop: 'currency',
          label: `${this.$t('exchange.tableLabel.currency')}`,
          align: 'left',
        },
        {
          prop: 'received',
          label: `${this.$t('exchange.tableLabel.received')}`,
          align: 'right',
        },
        {
          prop: 'exchangeAmount',
          label: `${this.$t('exchange.tableLabel.exchangeAmount')}`,
          align: 'right',
        },
        {
          prop: 'amount',
          label: `${this.$t('exchange.tableLabel.amount')}`,
          align: 'right',
        },
        {
          prop: 'return',
          label: `${this.$t('exchange.tableLabel.return')}`,
          align: 'right',
        },
      ]
      return tableTitles
    },
  },
  watch: {
    customerFilter(val) {
      this.getTableData(this.tableQuery)
    },
  },
  mounted() {
    // this.getTemplate()
    this.getTableData()
  },

  methods: {
    formatDate(date) {
      return moment(date).format('YYYY/MM/DD HH:mm')
    },
    //  Get Template Print Invoice
    // getTemplate() {
    //   let selector = {
    //     $or: [{ type: 'Purchase Order' }, { type: 'Purchase' }],
    //   }
    //   findTemplate
    //     .callPromise({ selector })
    //     .then((result) => {
    //       result.forEach((o) => {
    //         // console.log(o.printOpt[1])
    //         if (o.printOpt && o.printOpt.length > 0) {
    //           if (o.type === 'Purchase Order' && o.printOpt) {
    //             this.printPOMiniOpt =
    //               o.printOpt[0] === 'Print Mini'
    //                 ? 'mini'
    //                 : o.printOpt[1] === 'Print Mini'
    //                 ? 'mini'
    //                 : ''

    //             this.printPOSimOpt =
    //               o.printOpt[0] === 'Print Simple'
    //                 ? 'simple'
    //                 : o.printOpt[1] === 'Print Simple'
    //                 ? 'simple'
    //                 : ''
    //           } else if (o.type === 'Purchase' && o.printOpt) {
    //             this.printPCMiniOpt =
    //               o.printOpt[0] === 'Print Mini'
    //                 ? 'mini'
    //                 : o.printOpt[1] === 'Print Mini'
    //                 ? 'mini'
    //                 : ''

    //             this.printPCSimOpt =
    //               o.printOpt[0] === 'Print Simple'
    //                 ? 'simple'
    //                 : o.printOpt[1] === 'Print Simple'
    //                 ? 'simple'
    //                 : ''
    //           }
    //         }
    //       })
    //     })
    //     .catch((error) => {
    //       console.log(error)

    //       Notify.error({ message: error })
    //     })
    // },
    // get all customers transaction
    getTableData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query
        customerCenter
          .callPromise({ selector: this.dataSelector, query })
          .then((result) => {
            if (result) {
              this.tableData = result.data
              this.tableTotal = result.total
              this.loading = false
            } else {
              this.tableData = []
              this.tableTotal = 0
              this.loading = false
            }
          })
          .catch((error) => {
            this.loading = false
            Notify.error({ message: error })
          })
      }
    },
    // printDisable() {
    //   this.visablePrinting = false
    //   this.savePrint = false
    // },

    // Apply Filter
    applyFilter() {
      this.visibleFilter = false
      this.getTableData(this.tableQuery)
    },
    resetFilter() {
      this.visibleFilter = false
      this.form = {
        date: '',
        refNo: '',
        amount: 0,
        tranType: [],
      }
      this.$nextTick(() => {
        this.getTableData(this.tableQuery)
      })
    },

    tableActionClick(command) {
      if (!command.action) {
        this.$emit('print-invoice', command.row)
      }
    },
    handleClose() {
      this.getTableData(this.tableQuery)
    },
    // click on refNo
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
.journal-container {
  width: 100%;
  flex: 1; // flex: 1 = height: fill remaining
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  padding-top: 12px;
  overflow: hidden;

  .table-wrapper {
    width: 100%;
    flex: 1;
    overflow: hidden;
  }
}

.el-icon-menu {
  font-size: 15px;
}
.input-width {
  width: 20%;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 10px !important;
}
</style>
