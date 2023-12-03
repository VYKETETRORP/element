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
          <el-input
            v-model="searchText"
            placeholder="Search..."
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
          :pagination-props="tablePagination"
          :filters="tableFilters"
          :total="tableTotal"
          class="table-auto-height"
          style="height: calc(100vh - 240px)"
          @query-change="getData"
        >
          <template
            v-for="title in tableTitles"
            :key="title.label"
          >
            <el-table-column
              :prop="title.prop"
              :label="title.label"
              sortable="custom"
            >
              <template #default="scope">
                <!-- <span :class="softRemoveClassName(scope.row.removed)"> -->
                <span
                  v-if="title.prop === 'name'"
                  class="ra-text-link"
                  @click="edit(scope.row)"
                >
                  {{ scope.row.name }}
                </span>
                <span
                  v-else-if="title.prop === 'tranDate'"
                  class="text-black"
                >
                  {{ $filters.date(scope.row.tranDate) }}
                </span>

                <span
                  v-else
                  class="text-black"
                >
                  {{ scope.row[title.prop] }}
                </span>
                <!-- </span> -->
                <span
                  v-if="scope.row.details && scope.row.details.length"
                  class="text-black"
                >
                  <ul
                    v-for="(item, index) in scope.row.details"
                    :key="index"
                  >
                    <span v-if="title.prop === 'operator'">
                      <li>
                        {{ item.baseName }} - {{ item.toName }} |
                        {{ $t('exchange.rate-details.Bid') }} : {{ item.bid }} -
                        {{ $t('exchange.rate-details.Ask') }} : {{ item.ask }}
                        <el-tooltip
                          content="Inactive"
                          placement="top"
                          :enterable="false"
                        >
                          <el-button
                            v-if="item.status == 'active'"
                            type="danger"
                            size="small"
                            class="ml-2"
                            plain
                            @click="updateStatus(item._id, item.status, index)"
                          >
                            <template #icon>
                              <i class="far fa-eye-slash" />
                            </template>
                          </el-button>
                        </el-tooltip>
                      </li>
                    </span>
                  </ul>
                </span>
              </template>
            </el-table-column>
          </template>
        </data-tables-server>
      </div>
    </el-card>
    <!--************************ Print Layout ************************-->
    <!-- print invoice -->
    <!-- <component
      :is="currentComponent"
      v-show="visiblePrinting"
      :id="printId"
      :template-id="templateId"
      :customer-id="customerId"
      :tran-date="tranDate"
      :paper-size="paperSize"
      :visable-printing="visiblePrinting"
      :visable-change="visibleChange"
      @print-disable="printDisable"
    /> -->
    <!--*********************************************************************-->
  </div>
</template>

<script>
import Notify from '/imports/client/lib/notify'
import VueElementLoading from 'vue-element-loading'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'

// Table Action
import { debounce } from 'lodash'
import DataTablesServer from '/imports/client/components/DataTablesServer.vue'

//  Methods
import { findExchangeRate, updateStatus } from '../api/exchange-rates/methods'
import { ElCard, ElRow, ElCol, ElButton, ElInput } from 'element-plus'
export default {
  name: 'ExchangeRate',
  components: {
    DataTablesServer,
    VueElementLoading,
    ElCard,
    ElRow,
    ElCol,
    ElButton,
    ElInput,
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

      // printWarehouseMiniOpt: '',
      // printWarehouseSimOpt: '',

      // customerId: '',
      // tranDate: '',
      // visibleChange: {},

      // Data table
      searchText: '',
      tableData: [],
      tableTotal: 0,
      tableQuery: null,
      tableFilters: [
        {
          prop: ['totalQty', 'tranType'],
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
        { label: `${this.$t('exchange.tableLabel.name')}`, prop: 'name' },
        { label: `${this.$t('exchange.tableLabel.date')}`, prop: 'tranDate' },
        {
          label: `${this.$t('exchange.Transaction.Operator')}`,
          prop: 'operator',
        },
      ]
      return opt
    },
  },

  watch: {
    searchText: debounce(function () {
      this.getData(this.tableQuery)
    }, 300),
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
    this.getTemplate()
    // this.getData(this.tableQuery)
    // this.getFixedHeight()
  },
  activated() {
    this.getData()
    this.getTemplate()
  },
  methods: {
    getData(query) {
      // this.loading = true
      // this.tableQuery = query
      const selector = {
        branchId: this.currentBranchId,
      }
      // let exp = new RegExp(escapeRegExp(this.searchText))
      // if (this.searchText && exp) {
      //   selector.$or = [
      //     { refNo: { $regex: exp, $options: 'i' } },
      //     { tranType: { $regex: exp, $options: 'i' } },
      //     { 'empDoc.name': { $regex: exp, $options: 'i' } },
      //     { 'warehouseDoc.name': { $regex: exp, $options: 'i' } },
      //     { totalQty: { $regex: exp, $options: 'i' } },
      //   ]
      // }

      if (this.searchText) {
        selector.$or = [
          { 'providerDoc.name': { $regex: this.searchText, $options: 'i' } },
          {
            'baseCurrencyDoc.name': { $regex: this.searchText, $options: 'i' },
          },

          // {
          //   'currencyDoc.operator': { $regex: this.searchText, $options: 'i' },
          // },
          // { rate: +this.searchText },
          // { name: { $regex: this.searchText, $options: 'i' } },
          // { 'details.name': { $regex: this.searchText, $options: 'i' } },
          // { 'details.operator': { $regex: this.searchText, $options: 'i' } },
          // { 'details.rate': +this.searchText },
        ]
      }

      findExchangeRate
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

    getTemplate() {
      const selector = {
        type: 'Warehouse Center Invoice',
      }
      // findOneTemplate
      //   .callPromise({ selector })
      //   .then((result) => {
      //     if (result && result.data) {
      //       if (result.data.printOpt && result.data.printOpt.length > 0) {
      //         this.printWarehouseMiniOpt =
      //           result.data.printOpt[0] === 'Print Mini'
      //             ? 'mini'
      //             : result.data.printOpt[1] === 'Print Mini'
      //             ? 'mini'
      //             : ''

      //         this.printWarehouseSimOpt =
      //           result.data.printOpt[0] === 'Print Simple'
      //             ? 'simple'
      //             : result.data.printOpt[1] === 'Print Simple'
      //             ? 'simple'
      //             : ''
      //       }
      //       this.templateId = result.data._id
      //       this.paperSize = result.data.size + '-' + result.data.orientation
      //       this.currentTemplate = result.data.templateName
      //       this.visibleChange = result.data
      //     }
      //   })
      //   .catch((error) => {
      //     console.log(error)

      //     Notify.error({ message: error })
      //   })
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
        name: 'ExchangeRateForm',
        params: {
          type: 'new',
        },
      })
    },
    //update status
    updateStatus(id, status, index) {
      console.log('id', id)
      console.log('status', status)
      console.log('index', index)
      const newStatus = status == 'active' ? 'inactive' : 'active'
      updateStatus
        .callPromise({ id, status: newStatus })
        .then((result) => {
          if (result) {
            //this.$store.dispatch('app/messageS', `Exchange Rate update`)
            // this.resetForm()
            this.getData()
          }
        })
        .catch((err) => {
          console.error('Error updating status:', err)

          //this.$store.dispatch('app/messageE', err)
        })
    },
    edit(row) {
      this.$router.push({
        name: 'ExchangeRateForm',
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

<style lang="scss">
.text-black {
  font-size: 12px;
  color: #000 !important;
}
</style>
