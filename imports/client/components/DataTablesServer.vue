<template>
  <div class="sc-table">
    <div class="tool">
      <slot name="tool"></slot>
    </div>

    <el-table
      ref="elTable"
      v-loading="loading"
      :data="curTableData"
      v-bind="innerTableProps"
      style="width: 100%"
      @sort-change="handleSort"
      v-on="attrs.listeners"
    >
      <slot />

      <template #empty>
        <slot name="empty"></slot>
      </template>

      <template #append>
        <slot name="append"></slot>
      </template>

      <template v-if="actionColShow">
        <el-table-column
          :prop="actionColProp"
          v-bind="innerActionCol.props"
        >
          <template #default="scope">
            <div class="action-list">
              <span
                v-for="(button, index) in innerActionCol.buttons"
                :key="index"
              >
                <el-button
                  v-bind="{
                    type: button.type || 'text',
                    icon: button.icon,
                    ...button.props,
                  }"
                  @click="
                    clickActionButton(button, [
                      scope.row,
                      scope.$index,
                      scope.column,
                    ])
                  "
                >
                  {{ button.label }}
                </el-button>
              </span>
            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <div
      v-if="paginationShow"
      class="pagination-bar"
    >
      <div class="pagination-wrap">
        <el-pagination
          ref="elPagination"
          v-model:currentPage="innerCurrentPage"
          v-model:page-size="innerPageSize"
          :page-sizes="paginationProps.pageSizes"
          :layout="paginationProps.layout"
          :pager-count="paginationProps.pagerCount"
          :total="innerTotal"
          :small="paginationProps.small"
          @size-change="handleSizeChange"
          @prev-click="attrs.paginate['onPrevClick']"
          @next-click="attrs.paginate['onNextClick']"
          @current-change="attrs.paginate['onCurrentPageChange']"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { ref, toRefs, computed, watch, onBeforeMount } from 'vue'
// Composables
import { useDataTable } from '../composables/useDataTable'
// Components
import {
  ElTable,
  ElPagination,
  ElTableColumn,
  ElButton,
  PaginationProps,
} from 'element-plus'
// Types
import type {
  // Props as TableProps,
  // Emit as TableEmit,
  ActionCol,
  QueryInfo,
  TableSort,
} from '../types/data-table'
import type { TableProps } from 'element-plus/es/components/table/src/table/defaults'

// https://v3.vuejs.org/api/sfc-script-setup.html#typescript-only-features
// Currently complex types and type imports from other files are not supported. It is possible to support type imports in the future.
type Props<T = any> = {
  layout?: string
  data: T[]
  filters?: {
    prop: string[]
    value: string | number | Date | boolean
    filterFn?: (...params: any) => any
  }[]
  tableProps?: Partial<TableProps<T>>
  actionCol?: ActionCol<T>
  currentPage?: number
  pageSize?: number
  paginationProps?: Partial<PaginationProps>
  total?: number
  loading?: boolean
  sortMethod?: Record<string, any>
  filterProps?: string[]
}
type Emit = {
  (e: 'size-change', size: number): void
  (e: 'query-change', info: QueryInfo): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'update:currentPage', currentPage: number): void
  (e: 'next-click', currentPage: number): void
  (e: 'prev-click', currentPage: number): void
  (e: 'current-page-change', currentPage: number): void
  (e: 'filtered-data', value: any[]): void
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'table, pagination',
  filters: () => [],
  tableProps: () => {
    return {}
  },
  actionCol: undefined,
  currentPage: 1,
  pageSize: 20,
  paginationProps: () => {
    return {}
  },
  total: 0,
  loading: false,
  sortMethod: () => {
    return {}
  },
  filterProps: () => [],
})
const emit = defineEmits<Emit>()

const {
  innerCurrentPage,
  innerPageSize,
  sortData,
  actionColProp,
  attrs,
  innerTableProps,
  innerActionCol,
  paginationShow,
  actionColShow,
  clickActionButton,
} = useDataTable({ props, emit })

const { data, filters, total, tableProps } = toRefs(props)
const innerTotal = ref(total.value)

const curTableData = computed(() => {
  return data.value
})
const queryInfo = computed(() => {
  return {
    page: innerCurrentPage.value,
    pageSize: innerPageSize.value,
    sort: sortData.value || ({} as TableSort),
    filters: filters.value,
  } as QueryInfo
})

watch(total, (val) => {
  innerTotal.value = val
})

watch(
  filters,
  () => {
    queryChange('filter')
  },
  { deep: true }
)

watch(
  () => tableProps.value.defaultSort,
  (val) => {
    sortData.value = val
  },
  {
    immediate: true,
  }
)

watch(innerCurrentPage, () => {
  queryChange('page')
})

const queryChange = (type: QueryInfo['type']) => {
  const info = {
    ...queryInfo.value,
    type,
  }
  emit('query-change', info)
}

const handleSort = (obj: TableSort) => {
  const { prop, order } = obj
  // avoid event emit, if both prop and order are not change, special scenario 'multi-columns share the same prop'
  if (sortData.value?.prop !== prop || sortData.value?.order !== order) {
    sortData.value = {
      prop,
      order,
    }

    queryChange('sort')
  }
}

const handleSizeChange = (size: number) => {
  innerPageSize.value = size
  queryChange('size')
  emit('size-change', size)
}

onBeforeMount(() => {
  queryChange('init')
})
</script>

<style
  lang="scss"
  scoped
>
.sc-table {
  display: flex;
  flex-flow: column wrap;
  .el-table {
    flex: 1;
  }
  .pagination-bar {
    margin-top: 2px;
    .pagination-wrap {
      .el-pagination {
        justify-content: center;
        .btn-prev,
        .btn-next {
          padding: 0px !important;
        }
      }
    }
  }
  .action-list {
    text-align: center;
    & > span + span {
      margin-left: 10px;
    }
  }
}
</style>
