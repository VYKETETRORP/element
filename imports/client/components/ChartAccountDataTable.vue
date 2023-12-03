<template>
  <el-card shadow="never" class="content-left-card">
    <template #header>
      <div class="header">
        <div
          :class="{ 'btn-collapse': true, 'is-active': isCollapse }"
          @click="isCollapse = !isCollapse"
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
          <el-form v-if="!isCollapse" ref="form" :model="form">
            <el-select
              v-model="form.accountType"
              placeholder="Account type"
              clearable
              style="width: 82%"
              @change="handleAccountTypeChange"
            >
              <el-option
                v-for="item in accountTypeOpts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="ra-mb-sm" />

            <el-input v-model="form.searchText" placeholder="Search..." />
          </el-form>
        </transition>
      </div>
    </template>

    <div class="body">
      <transition name="fade-absolute">
        <div
          v-if="isCollapse"
          class="expand-div"
          @click="isCollapse = !isCollapse"
        >
          Please click here to show chartaccount list
        </div>
      </transition>

      <!-- Table -->
      <transition name="fade-absolute">
        <template v-if="!isCollapse">
          <DataTablesServer
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            :total="tableTotal"
            :table-props="tableProps"
            :page-size="tablePageSize"
            :pagination-props="tablePagination"
            style="height: 100px; min-height: 100%"
            @query-change="getTableData"
            @row-click="handleRowClick"
          >
            <el-table-column prop="_id" label="Chart of Account">
              <template #default="scope">
                <span
                  :style="{ marginLeft: marginLeftStyle(scope.row) + 'px' }"
                >
                  {{ scope.row.code }} : {{ scope.row.name }}
                  {{ scope.row.status == 'Inactive' ? `(Inactive)` : `` }}
                </span>
              </template>
            </el-table-column>
          </DataTablesServer>
        </template>
      </transition>
    </div>
  </el-card>
</template>

<script>
import { Meteor } from 'meteor/meteor'
import _ from 'lodash'

import Notify from '/imports/client/lib/notify'

import { getChartAccountsDataTable } from '../../api/chart-accounts/methods'

//Component
import {
  ElCard,
  ElForm,
  ElInput,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElPagination,
} from 'element-plus'
import DataTablesServer from './DataTablesServer.vue'

export default {
  name: 'ChartAccountDataTable',
  components: {
    [ElCard.name]: ElCard,
    [ElForm.name]: ElForm,
    [ElInput.name]: ElInput,
    [ElSelect.name]: ElSelect,
    [ElOption.name]: ElOption,
    [ElTable.name]: ElTable,
    [ElTableColumn.name]: ElTableColumn,
    [ElPagination.name]: ElPagination,
    DataTablesServer,
  },

  props: {
    accountNature: {
      type: Array,
      default() {
        return []
      },
    },
  },

  data() {
    return {
      resizeWidth: '290px',
      isCollapse: false,
      attrs: {},
      device: 'mobile',

      // Form
      form: {
        accountType: '',
        searchText: '',
      },
      // Table
      loading: false,
      // tableData: [],
      tableTotal: 0,
      tableTitles: [
        { prop: 'code', label: 'Code' },
        { prop: 'name', label: 'Name' },
      ],
      tableProps: {
        height: `calc(100% - 33px)`,
        showHeader: false,
        highlightCurrentRow: true,
      },
      tablePageSize: 15,
      tablePagination: {
        small: true,
        pageSizes: [15],
        pagerCount: 5,
        layout: 'prev, pager, next,total',
      },
      tableQuery: null,
      activeRow: null,
    }
  },
  computed: {
    // Lookup
    accountTypeOpts() {
      return this.$store.state.app.lookup.accountTypes
    },
    // Get data
    tableData() {
      return this.$store.state.app.chartAccount.chartAccounts
    },
  },
  watch: {
    device(val) {
      if (val === 'mobile') {
        this.isCollapse = true
      } else {
        this.isCollapse = false
      }
    },
    isCollapse: {
      handler(val) {
        this.attrs = {
          display: 'block',
          float: 'right',
          width: this.resizeWidth,
        }
        if (val) {
          this.attrs.display = 'none'
          this.attrs.float = 'left'
          this.attrs.width = '65px'
        } else {
          this.attrs.display = 'block'
          this.attrs.float = 'right'
          this.attrs.width = this.resizeWidth
        }

        // Send parent style
        this.$emit('attrs-style', this.attrs)
      },
      deep: true,
      immediate: true,
    },

    'form.searchText': _.debounce(function (val) {
      this.getTableData(this.tableQuery)
    }, 300),
  },
  beforeMount() {
    window.addEventListener('resize', this.resizeHandler)
  },

  created() {
    this.resizeHandler()
    this.getAccountTypes()
  },
  methods: {
    resizeHandler() {
      if (!document.hidden) {
        const rect = document.body.getBoundingClientRect()
        if (rect.width < 1264) {
          this.device = 'mobile'
        } else {
          this.device = 'desktop'
        }
        // check width resize
        if (rect.width === 1016) {
          this.resizeWidth = '260px'
        } else if (rect.width === 1272) {
          this.resizeWidth = '260px'
        } else {
          this.resizeWidth = '290px'
        }
      }
    },

    // Get account type
    getAccountTypes() {
      let selector = {}
      if (this.accountNature.length)
        selector.nature = { $in: this.accountNature }
      this.$store.dispatch('app/lookup/getAccountType', selector)
    },
    // Get data
    getTableData(query) {
      if (query) {
        this.loading = true
        this.tableQuery = query

        // Selector
        let selector = {}
        if (this.form.accountType)
          selector.accountTypeId = this.form.accountType
        if (this.form.searchText) {
          selector.$or = [
            { code: { $regex: this.form.searchText, $options: 'i' } },
            { name: { $regex: this.form.searchText, $options: 'i' } },
          ]
        }
        // Filter data
        this.$store.dispatch('app/chartAccount/updateFilter', {
          selector,
          query,
          accountNature: this.accountNature,
        })
        // Get data
        this.$store
          .dispatch('app/chartAccount/getChartAccountsDataTable', {
            selector,
            query,
            accountNature: this.accountNature,
          })
          .then((res) => {
            // this.tableData = res.data
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
    marginLeftStyle(row) {
      let count = (row.ancestors && row.ancestors.length) || 0
      let value = count * 10
      return value
    },
    handleRowClick(row) {
      // Check current row
      if (row._id === (this.activeRow && this.activeRow._id)) {
        this.activeRow = null
        this.$refs.tableRef.$refs.elTable.setCurrentRow(null)
      } else {
        this.activeRow = row
      }

      this.$emit('row-click', this.activeRow)
    },
    handleAccountTypeChange(val) {
      this.getTableData(this.tableQuery)
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  min-height: 30px;
  overflow: hidden;

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
}

.body {
  position: relative;
  overflow: hidden;
  height: 100%;

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
}

.el-select .el-input {
  width: 100px;
}

.fade-absolute-enter-active,
.fade-absolute-leave-active {
  transition: opacity 0.3s;
}
.fade-absolute-enter,
.fade-absolute-leave-to {
  position: absolute !important;
  top: 0 !important;
  opacity: 0;
}

.translate-x-enter-active,
.translate-x-leave-active {
  transition: all 0.3s;
}
.translate-x-enter,
.translate-x-leave-to {
  transform: translateX(-50px);
  position: absolute !important;
}
</style>
