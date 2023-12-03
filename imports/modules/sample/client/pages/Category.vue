<template>
  <div>
    <!--Form-->
    <category-form
      :form-type="formType"
      :update-doc="updateDoc"
      @form-change="handleFormChange"
    />

    <!--Data Table-->
    <data-tables
      v-loading="loading"
      :data="tableData"
      :table-props="tableProps"
    >
      <el-table-column
        v-for="title in tableTitles"
        :key="title.label"
        :prop="title.prop"
        :label="title.label"
        sortable="custom"
      >
        <template #default="scope">
          <span>
            {{ scope.row[title.prop] }}
          </span>
        </template>
      </el-table-column>

      <!-- Table Action -->
      <el-table-column label="Actions" align="center" fixed="right" width="65">
        <template #default="scope">
          <TableAction
            :actions="actionsList(scope.row)"
            :row="scope.row"
            @action-click="tableActionClick"
          />
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script>
// Message
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import removeMixin from '/imports/client/mixins/remove'
// Table Action
import TableAction from '/imports/client/components/TableAction.vue'
// Method
import { findCategories, removeCategory } from '../../api/categories/methods'
// Component
import { ElTableColumn } from 'element-plus'
import CategoryForm from './CategoryForm.vue'
import DataTables from '/imports/client/components/DataTables.vue'
export default {
  name: 'DemoCategory',
  components: {
    DataTables,
    [ElTableColumn.name]: ElTableColumn,
    TableAction,
    CategoryForm,
  },
  mixins: [dataTablesMixin, removeMixin],
  data() {
    return {
      loading: false,
      formType: 'New',
      updateDoc: null,
      tableData: [],
      tableTitles: [
        { label: 'Ref No', prop: 'refNo' },
        { label: 'Name', prop: 'name' },
        { label: 'Memo', prop: 'memo' },
      ],
    }
  },
  created() {
    // Extend data tables props (Mixin)
    this.tableProps.defaultSort = {
      prop: 'refNo',
      order: 'ascending',
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      findCategories
        .callPromise({})
        .then((result) => {
          this.tableData = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },

    // Table Action
    actionsList(row) {
      let actions = ['edit']
      actions.push('remove')

      return actions
    },
    tableActionClick(command) {
      this[command.action](command.row)
    },
    edit(row) {
      this.formType = 'Update'
      this.updateDoc = row
    },
    remove(row) {
      this.$_removeMixin({
        meteorMethod: removeCategory,
        selector: { _id: row._id },
        successMethod: 'getData',
        loading: 'loading',
        title: row.title,
      })
    },
    handleFormChange() {
      this.formType = 'New'
      this.updateDoc = null
      this.getData()
    },
  },
}
</script>

<style lang="scss" scoped>
// // @import '~imports/client/styles/main.scss';
</style>
