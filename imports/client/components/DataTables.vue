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
          :total="totalCount"
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
import { ref, toRefs, computed, watch } from 'vue'
// Lib
import { isArray, isString } from 'lodash'
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
  Filter,
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

const { data, filters, filterProps, sortMethod } = toRefs(props)

/**
 * prop: string
 * el: the row in table
 * filter: the filter Object.
 *    {
 *      prop: string | array
 *      value: any
 *    }
 */
const checkContain = (value: any, filterValue: any) => {
  return value
    .toString()
    .toLowerCase()
    .includes(filterValue.toString().toLowerCase())
}
const stringPropFilterFn = (
  prop: string,
  el: Record<string, any>,
  filter: Filter
) => {
  const elVal = el[prop]
  if (elVal === undefined) {
    console.error(
      `prop ${prop} not exist in the row, please confirm wether the prop is right, this may cause unpredictable filter result`
    )
    return false
  } else if (elVal === null) {
    return false
  }

  return isArray(filter.value)
    ? filter.value.some((value) => checkContain(elVal, value))
    : checkContain(elVal, filter.value)
}
const defaultSortFn = (a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0)

const innerFilterProps = ref<string[]>([])
const _filterFnCache = ref<Record<string, (...params: any) => any>>({})
const _sortFnCache = ref<Record<string, (...params: any) => any>>({})

// Computed
const sortedData = computed(() => {
  if (sortData.value?.order) {
    const sortedData = data.value.slice()

    const { order, prop } = sortData.value
    const isDescending = order === 'descending'

    const _sortMethod = createSortFn(prop, isDescending)
    sortedData.sort(_sortMethod)

    return sortedData
  }

  return data.value
})

const tableData = computed(() => {
  let filteredData = sortedData.value.slice()
  filters.value.forEach((filter) => {
    const value = filter.value
    if (
      (isArray(value) && value.length === 0) ||
      value === undefined ||
      value === ''
    ) {
      return true
    }

    const filterFn = filter.filterFn || createFilterFn(filter.prop)

    filteredData = filteredData.filter((el) => {
      return filterFn(el, filter)
    })
  })

  emit('filtered-data', filteredData)
  return filteredData
})
const curTableData = computed(() => {
  if (paginationShow.value) {
    const from = innerPageSize.value * (innerCurrentPage.value - 1)
    const to = from + innerPageSize.value

    return tableData.value.slice(from, to)
  } else {
    return tableData.value
  }
})
const totalCount = computed(() => {
  return tableData.value.length
})

watch(filterProps, (val) => {
  setInnerFilterProps(val)
})
watch(sortMethod, () => {
  _sortFnCache.value = {}
})

const handleSort = (obj: TableSort) => {
  sortData.value = obj
}
const handleSizeChange = (size: number) => {
  innerPageSize.value = size
  emit('size-change', size)
}
// cache filter function
const createFilterFn = (prop: string | string[]) => {
  let key: string
  const props = prop || innerFilterProps.value
  if (isArray(props)) {
    key = props.join('')
  } else if (isString(prop)) {
    key = props
  } else {
    console.error('prop must be string or array')
    return () => false
  }

  const hit = _filterFnCache.value[key]
  if (hit) {
    return hit
  }

  /**
   * el: the row in table
   * filter: the filter Object.
   *    {
   *      prop: string | array
   *      value: any
   *    }
   */
  _filterFnCache.value[key] = function (el, filter) {
    return isArray(props)
      ? props.some((prop) => stringPropFilterFn(prop, el, filter))
      : stringPropFilterFn(props, el, filter)
  }

  return _filterFnCache.value[key]
}
const createSortFn = (prop: string, isDescending: boolean) => {
  const key = prop + isDescending

  const hit = _sortFnCache.value[key]
  if (hit) {
    return hit
  }

  _sortFnCache.value[key] = (a, b) =>
    (sortMethod.value[prop] || defaultSortFn)(a[prop], b[prop]) *
    (isDescending ? -1 : 1)
  return _sortFnCache.value[key]
}
const setInnerFilterProps = (val: string[]) => {
  innerFilterProps.value =
    val || Object.keys((data.value && data.value[0]) || {})
}

setInnerFilterProps(filterProps.value)
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
