<template>
  <div>
    <el-card shadow="never">
      <el-row class="mb-2">
        <el-col :span="16">
          <el-button
            type="primary"
            @click="addNew"
          >
            <template #icon>
              <i class="fas fa-plus" />
            </template>
            {{ $t('app.btn.new') }}
          </el-button>
        </el-col>
        <el-col
          :span="8"
          style="float-right"
        >
          <el-date-picker
            v-model="currentDate"
            type="date"
            format="DD/MM/YYYY"
            style="width: 100%"
          />
        </el-col>
      </el-row>

      <!--Table Data-->
      <div class="my-container">
        <vue-element-loading
          :active="loading"
          spinner="bar-fade-scale"
          color="#409eff"
          text="Rabbit Tech"
        />
        <!-- v-loading="loading" -->
        <data-tables-server
          :data="tableData"
          :table-props="tableProps"
          :filters="tableFilters"
          :total="tableTotal"
          style="height: calc(100vh - 240px)"
          :pagination-props="tablePagination"
          class="table-auto-height"
          @query-change="getData"
        >
          <el-table-column
            align="center"
            width="50"
          >
            <template #header>
              <i class="el-icon-menu popover-icon" />
            </template>
            <template #default="scope">
              {{ scope.$index + 1 }}
              <!-- </span> -->
            </template>
          </el-table-column>
          <el-table-column
            v-for="title in tableTitles"
            :key="title.label"
            :prop="title.prop"
            :label="title.label"
            align="center"
          >
            <template #default="scope">
              <span
                v-if="title.prop === 'name'"
                class="ra-text-link"
                @click="edit(scope.row)"
              >
                {{ scope.row.name }}
              </span>
              <span v-else-if="title.prop === 'tranDate'">
                {{ $filters.date(scope.row.tranDate) }}
              </span>
              <span v-else-if="title.prop === 'tranType'">
                <el-tag
                  style="background-color: #409eff !important; color: white"
                >
                  <b>{{ scope.row.tranType }}</b>
                </el-tag>
              </span>
              <span v-else-if="title.prop === 'currencyName'">
                <el-tag
                  type="warning"
                  effect="dark"
                >
                  <b>{{ scope.row.currencyName }}</b>
                </el-tag>
              </span>
              <div
                v-else-if="title.prop === 'amount'"
                class="text-right"
              >
                <b>{{ scope.row.amount }}</b
                >{{ scope.row.symbol }}
              </div>
              <span v-else>{{ scope.row[title.prop] }}</span>
              <!-- <span v-if="scope.row.details && scope.row.details.length">
                <ul
                  v-for="(item, index) in scope.row.details"
                  :key="index"
                >

                  <span v-if="title.prop === 'operator'">
                    <li>
                      {{ item.currencyName }}
                      | {{ $t('exchange.rate-details.Amount') }} :
                      <b>{{ item.amount }}{{ item.symbol }}</b>
                    </li>
                  </span>

                </ul>
              </span> -->
            </template>
          </el-table-column>
        </data-tables-server>
      </div>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
import VueElementLoading from 'vue-element-loading'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'
import DataTablesServer from '/imports/client/components/DataTablesServer.vue'

// Table Action
import { debounce } from 'lodash'
// import escapeRegExp from '../../../api/lib/escapeRegExp'
//  Methods
import { fetchCashDeposit } from '../api/cash-deposit/methods'
// import {
//   Card,
//   Row,
//   Col,
//   ButtonGroup,
//   Button,
//   Form,
//   Input,
//   Select,
//   Option,
//   Tag,
//   Dialog,
//   DatePicker,
// } from 'element-plus'
export default {
  name: 'ExchangeRate',
  components: {
    DataTablesServer,
    VueElementLoading,
    // [Card.name]: Card,
    // [Row.name]: Row,
    // [Col.name]: Col,
    // [ButtonGroup.name]: ButtonGroup,
    // [Button.name]: Button,
    // [Form.name]: Form,
    // [Input.name]: Input,
    // [Select.name]: Select,
    // [Option.name]: Option,
    // [Dialog.name]: Dialog,
    // [Tag.name]: Tag,
    // [DatePicker.name]: DatePicker,
  },
  mixins: [dataTablesMixin, softRemoveMixin, restoreMixin, removeMixin],
  data() {
    return {
      loading: false,
      formType: 'pos.btn.new',
      modalVisible: false,

      //  print
      printId: '',
      paperSize: 'a5-p',
      templateId: '',
      visiblePrinting: false,
      // currentComponent: null,
      currentTemplate: null,
      currentDate: moment().toDate(),
      // Data table
      tableData: [],
      tableTotal: 0,
      tableQuery: null,
      tableFilters: [
        {
          prop: ['currencyName', 'name'],
          value: '',
        },
      ],
      tableProps: {
        border: true,
        stripe: true,
      },
      tablePagination: {
        small: false,
        pageSizes: [20, 50, 100],
        pagerCount: 5,
        layout: 'prev, pager, next,jumper,sizes,total',
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    tableTitles() {
      const opt = [
        { label: `${this.$t('exchange.tableLabel.date')}`, prop: 'tranDate' },
        { label: `${this.$t('exchange.tableLabel.name')}`, prop: 'name' },
        {
          label: `${this.$t('exchange.tableLabel.tranType')}`,
          prop: 'tranType',
        },
        {
          label: `${this.$t('exchange.tableLabel.currency')}`,
          prop: 'currencyName',
        },
        {
          label: `${this.$t('exchange.tableLabel.total')}`,
          prop: 'amount',
        },
      ]
      return opt
    },
  },

  watch: {
    currentDate(val) {
      if (val) {
        this.getData()
      }
    },
    // searchText: debounce(function () {
    //   this.getData(this.tableQuery)
    // }, 300),
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getData()
      }
    },
  },
  created() {
    // Extend data tables props (Mixin)
    this.tableProps.defaultSort = {
      prop: 'name',
      order: 'ascending',
    }
  },
  activated() {
    this.getData()
  },
  methods: {
    getData() {
      const selector = {
        branchId: this.currentBranchId,
        tranType: 'Deposit',
        tranDate: {
          $gte: moment(this.currentDate).startOf('day').toDate(),
          $lte: moment(this.currentDate).endOf('day').toDate(),
        },
      }
      fetchCashDeposit
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.tableData = result
            this.tableTotal = result.length
            this.loading = false
          } else {
            this.tableData = []
            this.tableTotal = 0
            this.loading = false
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
          Notify.error({ message: err })
        })
    },
    // Toble Formatter
    softRemoveClassName(removed) {
      return removed ? 'soft-remove' : ''
    },

    // Table Action
    actionsList(row) {
      const actions = ['edit']
      if (row.removed) {
        // actions.push('restore')
        // actions.push('remove')
      } else {
        actions.push('remove')
        // actions.push('softRemove')
      }

      return actions
    },
    // tableActionClick(command) {
    //   this.printId = command.row._id
    //   if (this.currentTemplate && this.printWarehouseSimOpt) {
    //     this.currentComponent = this.currentTemplate
    //   } else {
    //     this.currentComponent = WarehouseCenterInvoice
    //   }
    //   this.visiblePrinting = true
    // },

    // Action
    addNew() {
      this.$router.push({
        name: 'CashDepositForm',
        params: {
          type: 'new',
        },
      })
    },

    edit(row) {
      this.$router.push({
        name: 'CashDepositForm',
        params: {
          type: 'update',
          id: row._id,
        },
      })
    },
    // Close printing
    // printDisable() {
    //   this.printId = ''
    //   this.paperSize = ''
    //   this.visiblePrinting = false
    //   this.currentComponent = null
    // },

    handleModalAfterActive(opts) {
      this.formType = 'pos.btn.new'
      this.getData()
    },
  },
}
</script>

<style scoped></style>
