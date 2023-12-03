<template>
  <div>
    <!--Modal Form-->
    <component
      :is="currentModal"
      :update-doc="updateDoc"
      :visible="modalVisible"
      @modal-close="handleModalClose"
    />

    <!-- Toolbar -->
    <TableToolbar v-model="tableFilters" @new="addNew" />

    <!-- Datatable -->
    <data-tables
      v-loading="loading"
      :data="tableData"
      :table-props="tableProps"
      :filters="tableFilters"
    >
      <el-table-column
        v-for="title in tableTitles"
        :key="title.label"
        :prop="title.prop"
        :label="title.label"
        sortable="custom"
      >
        <template #default="scope">
          <span :class="softRemoveClassName(scope.row.removed)">
            <span v-if="title.prop === 'postDate'">
              {{ $filters.date(scope.row.postDate) }}
            </span>
            <span v-else>
              {{ scope.row[title.prop] }}
            </span>
          </span>
        </template>
      </el-table-column>

      <!-- Table Action -->
      <el-table-column label="Actions" align="center" fixed="right" width="65">
        <template #default="scope">
          <el-dropdown trigger="click" @command="tableActionClick">
            <span class="el-dropdown-link">
              <i class="fa fa-bars" />
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'edit', row: scope.row }">
                  Edit
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'remove', row: scope.row }"
                >
                  Remove
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script>
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'

// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'

// Table Action
import TableToolbar from '/imports/client/components/TableToolbar.vue'
import TableAction from '/imports/client/components/TableAction.vue'

import { findPosts, removePost } from '../../api/posts/methods'

import PostNew from './PostNew.vue'
import PostEdit from './PostEdit.vue'

export default {
  name: 'DemoPost',
  components: { TableToolbar, TableAction, PostNew, PostEdit },
  mixins: [dataTablesMixin, softRemoveMixin, restoreMixin, removeMixin],
  data() {
    return {
      loading: false,
      tableData: [],
      tableTitles: [
        { prop: 'postDate', label: 'Date' },
        { prop: 'title', label: 'Title' },
        { prop: 'body', label: 'Body' },
        { prop: 'memo', label: 'Memo' },
        { prop: 'categoryIds', label: 'Category' },
        { prop: 'status', label: 'Status' },
      ],
      tableFilters: [
        {
          prop: ['title', 'categoryIds', 'status'],
          value: '',
        },
      ],
      // Modal
      currentModal: null,
      modalVisible: false,
      updateDoc: null,
    }
  },
  created() {
    // Extend data tables props (Mixin)
    this.tableProps.defaultSort = {
      prop: 'postDate',
      order: 'descending',
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true

      findPosts
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

    // Toble Formatter
    softRemoveClassName(removed) {
      return removed ? 'soft-remove' : ''
    },

    // Table Action
    addNew() {
      this.currentModal = PostNew
      this.$nextTick(() => {
        this.modalVisible = true
      })
    },
    tableActionClick(command) {
      this[command.action](command.row)
    },
    edit(row) {
      this.updateDoc = row
      this.currentModal = PostEdit
      this.$nextTick(() => {
        this.modalVisible = true
      })
    },
    remove(row) {
      this.$_removeMixin({
        meteorMethod: removePost,
        selector: { _id: row._id },
        successMethod: 'getData',
        successParams: this.tableInitialQuery,
        loading: 'loading',
        title: row.title,
      })
    },
    handleModalClose() {
      this.modalVisible = false
      this.$nextTick(() => {
        this.currentModal = null
        this.getData(this.tableInitialQuery)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
// // @import '~imports/client/styles/main.scss';
</style>
