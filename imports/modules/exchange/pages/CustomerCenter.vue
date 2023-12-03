<template>
  <CenterLayout
    ref="centerLayout"
    :width-left="290"
  >
    <!-- Header left  -->
    <template #content-header-left="props">
      <div
        :class="{ 'btn-collapse': true, 'is-active': props.isCollapse }"
        @click="$refs.centerLayout.triggerCollapse()"
      >
        <svg
          class="hamburger"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
        >
          <path
            d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
          />
        </svg>
      </div>

      <!-- Form Filter -->
      <transition name="translate-x">
        <el-form
          v-if="!props.isCollapse"
          ref="form"
          :model="form"
        >
          <el-input
            v-model="form.searchText"
            style="width: 82%"
            placeholder="Search...(name,telephone,address)"
            size="small"
          />
        </el-form>
      </transition>
    </template>

    <!-- Body content left -->
    <template #content-body-left="props">
      <transition name="fade-absolute">
        <div
          v-if="props.isCollapse"
          class="expand-div"
          @click="$refs.centerLayout.triggerCollpase()"
        >
          Please click here to show customer list
        </div>
      </transition>

      <!-- Table -->
      <transition name="fade-absolute">
        <data-tables-server
          v-if="!props.isCollapse"
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          :total="tableTotal"
          :table-props="{ ...tableProps, height: props.tableHeight }"
          :page-size="tablePageSize"
          :pagination-props="tablePagination"
          class="table-auto-height no-header"
          @query-change="fetchData"
          @row-click="handleRowClick"
        >
          <el-table-column prop="_id">
            <template #default="scope">
              <div style="cursor: pointer">
                {{ scope.row.name }}
              </div>
            </template>
          </el-table-column>
        </data-tables-server>
      </transition>
    </template>

    <!-- Header right -->
    <template #content-header-right>
      <el-button-group>
        <submit-button
          title="New"
          type="primary"
          @click="handleCustomer"
        >
          <template #icon>
            <i class="fas fa-plus" />
          </template>
          {{ $t('exchange.menu.Customer') }}
        </submit-button>
        <submit-button
          title="Setting"
          type="primary"
          @click="addNew('setting')"
        >
          <i class="fas fa-cog" />
        </submit-button>
      </el-button-group>

      <span class="content-grow">
        <el-button
          v-if="activeDoc"
          title="Edit"
          link
          @click="handleEditCustomer"
        >
          <i class="fas fa-pencil-alt" />
        </el-button>

        <span v-if="activeDoc">
          {{ $t('exchange.customer.name') }}:{{ activeDoc.name }},
          {{ $t('exchange.customer.telephone') }}:{{ activeDoc.telephone }}
        </span>
        <span v-else>
          {{ $t('app.account-setting-account-type.No Select') }}
        </span>
      </span>

      <div>
        <submit-button
          :disabled="!$userIsInRole(['transaction-exchange-insert'])"
          title="New"
          type="primary"
          @click="addNew('transaction')"
        >
          <template #icon>
            <i class="fas fa-plus" />
          </template>
          {{ $t('exchange.customer.transaction') }}
        </submit-button>
      </div>
      <span class="float-right-btn" />
    </template>

    <!-- Body content right -->
    <template #content-body-right="props">
      <!-- Data table -->
      <customer-tran-data-table
        :customer-filter="customerFilter"
        :table-height="props.tableHeight"
        @ref-click="handleTranClick"
        @print-invoice="handlePrint"
      />

      <exchange-invoice
        v-show="false"
        :id="currentId"
        :visible-printing="visiblePrinting"
        :paper-size="paperSize"
        @print-disable="printDisable"
      />

      <el-dialog
        v-model="dialogFormVisible"
        :close-on-click-modal="false"
        :show-close="true"
        :title="$t('exchange.menu.Customer')"
        @close="closeDialog(true)"
      >
        <CustomerForm
          :show-id="showId"
          @save="handleSave"
        />
      </el-dialog>
    </template>
  </CenterLayout>
</template>
<script>
import Notify from '/imports/client/lib/notify'
import { fetchCustomers } from '../api/customers/methods'
import { customerCenter } from '../api/transaction/methods'
// Component

import ExchangeInvoice from '../reports/exchangeInvoice.vue'
import DataTablesServer from '/imports/client/components/DataTablesServer.vue'
import { defineAsyncComponent } from 'vue'
import CustomerTranDataTable from '../components/CustomerTranDataTable.vue'
import {
  ElButtonGroup,
  ElButton,
  ElForm,
  ElInput,
  ElDialog,
} from 'element-plus'
import { debounce } from 'lodash'
import SubmitButton from '../../../client/components/SubmitButton.vue'
import CenterLayout from '/imports/client/layouts/CenterLayout'
export default {
  name: 'AdminSetting',
  components: {
    DataTablesServer,
    ElButtonGroup,
    ElButton,
    ElForm,
    ElInput,
    ElDialog,
    CustomerTranDataTable,
    CenterLayout,
    CustomerForm: defineAsyncComponent(() =>
      import('../components/CustomerForm.vue')
    ),
    SubmitButton,
    ExchangeInvoice,
  },

  data() {
    return {
      // Form
      form: {
        searchText: '',
      },
      //---print---
      currentId: null,
      currentComponent: null,
      visiblePrinting: false,
      // visibleChange: {},
      paperSize: 'mini',
      // Table
      activeCustomer: {},
      tableQuery: null,
      loading: false,
      tableData: [],
      tableTotal: 1,
      tableTitles: [
        // { prop: 'code', label: 'Code' },
        { prop: 'name', label: 'Name' },
      ],
      tableProps: {
        showHeader: false,
        highlightCurrentRow: true,
      },
      tablePageSize: 15,
      tablePagination: {
        pageSizes: [15],
        layout: 'prev, total, next',
      },
      activeDoc: null,

      // Dialog customer
      showId: '',
      dialogFormVisible: false,
    }
  },

  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    tranFilter() {
      const filter = {}
      if (this.activeDoc && this.activeDoc._id) {
        filter._id = this.activeDoc._id
      }
      return filter
    },
    customerFilter() {
      let filter = {}
      if (this.activeDoc && this.activeDoc._id) {
        filter = {
          customerId: this.activeDoc._id,
        }
      }
      filter.branchId = this.currentBranchId
      return filter
    },
  },

  watch: {
    'form.searchText': debounce(function () {
      this.fetchData(this.tableQuery)
    }, 300),

    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.fetchData(this.tableQuery)
      }
    },
  },

  methods: {
    closeDialog(val) {
      if (val) {
        this.fetchData(this.tableQuery)
      }
    },
    //  Print Invoice
    handlePrint(row) {
      this.currentId = row.id
      this.visiblePrinting = true
    },
    printDisable() {
      this.visiblePrinting = false
      if (!this.visiblePrinting) {
        this.currentId = null
        // this.currentComponent = null
      }
    },

    handleTranClick(val) {
      if (val.tranTypeId) {
        const id = val.id
        this.$router.push({
          name: 'Transaction',
          params: { type: 'edit', id: id },
        })
      }
    },

    // Get data
    fetchData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query
        const { page, pageSize } = query

        // Selector
        const selector = {
          branchId: this.currentBranchId,
        }

        if (this.form.searchText) {
          selector.$or = [
            { name: { $regex: this.form.searchText, $options: 'i' } },
            { telephone: { $regex: this.form.searchText, $options: 'i' } },
            { address: { $regex: this.form.searchText, $options: 'i' } },
          ]
        }

        fetchCustomers
          .callPromise({ selector, page, pageSize })
          .then((res) => {
            this.tableData = res.data
            this.tableTotal = res.total
            this.loading = false
          })
          .catch((err) => {
            console.log(err)
            this.loading = false
            Notify.error({ message: err.reason })
          })
      }
    },
    getTableData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query
        customerCenter
          .callPromise()
          .then((res) => {
            this.tableData = res.data
            this.tableTotal = res.total
            this.loading = false
          })
          .catch((err) => {
            console.log(err)
            this.loading = false
            Notify.error({ message: err.reason })
          })
      }
    },
    handleCustomer() {
      this.showId = ''
      this.$nextTick(() => {
        this.dialogFormVisible = true
      })
    },
    handleEditCustomer() {
      const { _id: id = '' } = this.activeDoc || {}
      if (id) this.showId = id
      this.$nextTick(() => {
        this.dialogFormVisible = true
      })
    },
    handleSave(res) {
      if (res) {
        this.dialogFormVisible = false
        this.showId = ''
        this.$nextTick(() => {
          if (res === 'remove') {
            this.activeDoc = null
          }
          this.fetchData(this.tableQuery)
        })
      }
    },

    handleRowClick(row) {
      if (row._id === (this.activeDoc && this.activeDoc._id)) {
        this.activeDoc = null
        this.$refs.tableRef.$refs.elTable.setCurrentRow(null)
      } else {
        this.activeDoc = row
      }
    },
    // customerClick(val) {
    //   this.activeCustomer = val || {}
    // },
    addNew(type) {
      if (type == 'transaction') {
        this.$router.push({
          name: 'Transaction',
          params: {
            type: 'new',
          },
        })
      } else if (type == 'setting') {
        this.$router.push({
          name: 'Setting',
          params: {
            type: 'new',
          },
        })
      }
    },
  },
}
</script>
<style
  lang="scss"
  scoped
>
.btn-collapse {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  .hamburger {
    display: inline-block;
    vertical-align: middle;
    width: 26px;
    height: 28px;
  }

  &.is-active {
    right: 8px;
    transition: right 0.3s;
    .hamburger {
      transform: rotate(180deg);
    }
  }
}

.expand-div {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  writing-mode: vertical-lr;
  text-align: center;
  cursor: pointer;
}
</style>
