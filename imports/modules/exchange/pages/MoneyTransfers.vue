<template>
  <div>
    <el-card shadow="never">
      <el-row class="mb-2">
        <el-col :span="16">
          <el-button
            v-if="$userIsInRole(['money-transfer-insert'])"
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
            v-model="form.searchFilter"
            clearable
            placeholder="Ref No, amount,fee"
            @focus="$event.target.select()"
          />
        </el-col>
      </el-row>

      <!--Table Data-->
      <div class="my-container">
        <!-- <vue-element-loading
          :active="loading"
          spinner="bar-fade-scale"
          color="#409eff"
          text="Rabbit Tech"
        /> -->
        <data-tables-server
          v-loading="loading"
          :data="tableData"
          :table-props="tableProps"
          :filters="tableFilters"
          :total="tableTotal"
          :page-size="tablePageSize"
          :pagination-props="tablePagination"
          style="height: calc(100vh - 240px)"
          class="table-auto-height"
          @query-change="getData"
        >
          <template #empty>
            <el-empty :image-size="100" />
          </template>
          <el-table-column
            align="center"
            width="50"
          >
            <template #header>
              <!-- <i class="fas fa-bars"></i> -->
              #
            </template>
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="title in tableTitles"
            :key="title.label"
            :prop="title.prop"
            :label="title.label"
          >
            <template #default="scope">
              <span
                v-if="title.prop === 'refNo'"
                class="ra-text-link"
                @click="edit(scope.row._id)"
              >
                {{ scope.row.refNo }}
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

              <span v-else>{{ scope.row[title.prop] }}</span>
            </template>
          </el-table-column>
        </data-tables-server>
      </div>
    </el-card>

    <component
      :is="currentComponent"
      :visible="visible"
      :show-id="showId"
      @closed="handleClosedDialog"
    />
  </div>
</template>

<script
  lang="ts"
  setup
>
import useMethod from '/imports/client/composables/useMethod'

import { useStore } from '/imports/store'
import { useI18n } from 'vue-i18n'

import DataTablesServer from '/imports/client/components/DataTablesServer.vue'
import { debounce } from 'lodash'
//  Methods
import { ElCard, ElRow, ElCol, ElButton, ElInput, ElTag } from 'element-plus'
import {
  computed,
  onActivated,
  ref,
  watch,
  markRaw,
  defineAsyncComponent,
  nextTick,
} from 'vue'

const store = useStore()
const { t } = useI18n()

const loading = ref(false)

const currentComponent = ref<any>(null)
const visible = ref<boolean>(false)
const showId = ref<string>('')
// Data table
const form = ref({
  searchFilter: '',
})
const tableData = ref<any[]>([])
const tableTotal = ref(0)
const tablePageSize = ref(15)
const tablePagination = ref({
  pageSizes: [20, 50, 100],
  pagerCount: 5,
  layout: 'prev, pager, next,jumper,sizes,total',
})

const tableQuery = ref(null)
const tableFilters = ref([
  {
    prop: ['name', 'fromName'],
    value: '',
  },
])
const tableProps = ref({
  border: true,
  stripe: true,
})

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const tableTitles = computed(() => {
  const opt = [
    { label: `Ref No`, prop: 'refNo' },
    { label: `${t('exchange.tableLabel.date')}`, prop: 'tranDate' },
    {
      label: `Customer`,
      prop: 'customerName',
    },
    {
      label: `Employee`,
      prop: 'employeeName',
    },
    {
      label: `${t('exchange.tableLabel.tranType')}`,
      prop: 'tranType',
    },

    {
      label: `${t('exchange.tableLabel.currency')}`,
      prop: 'currencyName',
    },
    {
      label: `${t('exchange.tableLabel.total')}`,
      prop: 'amount',
    },
    {
      label: `Fee`,
      prop: 'fee',
    },
  ]
  return opt
})

watch(
  () => form.value.searchFilter,
  debounce(function () {
    getData(tableQuery.value)
  }, 300)
)
// Change branchId
watch(
  () => currentBranchId.value,
  (val: any) => {
    if (val) {
      getData(tableQuery.value)
    }
  }
)

onActivated(() => {
  getData(tableQuery.value)
})

const getData = (query: any) => {
  loading.value = true
  tableQuery.value = query
  const selector: any = {
    branchId: currentBranchId.value,
  }

  if (form.value.searchFilter) {
    const value = form.value.searchFilter
    selector.$or = [
      { refNo: { $regex: value, $options: 'i' } },
      { amount: { $regex: value, $options: 'i' } },
      { fee: { $regex: value, $options: 'i' } },
    ]
  }
  const { call } = useMethod('ex.findMoneyTransfer', [])
  call({ selector, query })
    .then((result) => {
      if (result) {
        tableData.value = result
        tableTotal.value = result.length
        loading.value = false
      } else {
        tableData.value = []
        tableTotal.value = 0
        loading.value = false
      }
    })
    .catch((err: any) => {
      console.log(err)
      loading.value = false
      store.dispatch('app/messageE', err.reason || err)
    })
}

// Action
const addNew = () => {
  currentComponent.value = markRaw(
    defineAsyncComponent(() => import('./MoneyTransferForm.vue'))
  )
  nextTick(() => {
    visible.value = true
  })
}

const edit = (id: string) => {
  visible.value = true
  showId.value = id
  nextTick(() => {
    currentComponent.value = markRaw(
      defineAsyncComponent(() => import('./MoneyTransferForm.vue'))
    )
  })
}

const handleClosedDialog = () => {
  visible.value = false
  showId.value = ''
  nextTick(() => {
    currentComponent.value = null
    getData(tableQuery.value)
  })
}
</script>

<style scoped></style>
