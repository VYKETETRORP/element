<template>
  <div>
    <!-- Form Filter -->
    <!-- <fieldset class="ra-fieldset">
      <legend>Filter</legend> -->
    <el-popover trigger="click" placement="bottom-start" width="850">
      <el-form ref="form" :model="form" label-width="70px">
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

            <el-form-item label="Type" prop="journalType">
              <el-select v-model="form.journalType" clearable multiple>
                <el-option
                  v-for="item in journalTypeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Currency" prop="currency">
              <el-select v-model="form.currency" clearable multiple>
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
            <el-form-item label="Ref no." prop="refNo">
              <el-input v-model="form.refNo" clearable />
            </el-form-item>

            <el-form-item label="Amount" prop="amount">
              <el-input v-model.number="form.amount" clearable />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="applyFilter"> Apply </el-button>
              <el-button type="default" @click="resetFilter"> Reset </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #reference>
        <el-button>
          <template #icon>
            <i class="fas fa-filter" />
          </template>
          Filter
        </el-button>
      </template>
    </el-popover>
    <!-- </fieldset> -->

    <!-- Data Table -->
    <data-tables-server
      v-loading="loading"
      :data="tableData"
      :total="tableTotal"
      :table-props="tableProps"
      @query-change="getTableData"
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
    </data-tables-server>
  </div>
</template>

<script>
import moment from 'moment'

import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapCurrentTime from '/imports/client/lib/wrap-current-time'

import { getLocationDataTable } from '../../api/journals/methods'

// Component
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElPopover,
  ElRow,
  ElCol,
} from 'element-plus'
export default {
  name: 'LocationDataTable',

  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElInput.name]: ElInput,
    [ElSelect.name]: ElSelect,
    [ElOption.name]: ElOption,
    [ElDatePicker.name]: ElDatePicker,
    [ElPopover.name]: ElPopover,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
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
      },

      // Table
      loading: false,
      tableData: [],
      tableTotal: 0,
      tableTitles: [
        { prop: 'tranDate', label: 'Date' },
        { prop: 'refNo', label: 'Ref NO.' },
        { prop: 'journalType', label: 'Type' },
        { prop: 'currency', label: 'Currency' },
        { prop: 'amount', label: 'Amount' },
        { prop: 'memo', label: 'Memo' },
      ],
      tableProps: {
        height: `calc(100vh - 429px)`,
      },
      tableQuery: null,
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
        let params = {
          tranDate: [],
          journalType: this.form.journalType,
          currency: this.form.currency,
          refNo: this.form.refNo,
          amount: this.form.amount,
          chartAccountId: this.exFilter.chartAccountId,
          branchId: this.exFilter.branchId,
          opts: query,
        }
        if (this.form.tranDate && this.form.tranDate.length)
          params.tranDate = [
            moment(wrapCurrentTime(this.form.tranDate[0]))
              .startOf('day')
              .toDate(),
            moment(wrapCurrentTime(this.form.tranDate[1]))
              .endOf('day')
              .toDate(),
          ]

        getLocationDataTable
          .callPromise(params)
          .then((res) => {
            this.tableData = res.data
            this.tableTotal = res.total
            this.loading = false
          })
          .catch((err) => {
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

<style lang="scss" scoped></style>
