<template>
  <div>
    <el-row>
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
      <!-- <el-col
        :span="8"
        style="float-right"
      >
        <el-input
          v-model="searchText"
          placeholder="Search..."
        />
      </el-col> -->
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
        height="250"
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
              <span
                v-if="title.prop === 'tranDate'"
                class="ra-text-link"
                @click="edit(scope.row._id)"
              >
                {{ $filters.date(scope.row.tranDate) }}
              </span>
              <span v-else>
                {{ scope.row[title.prop] }}
              </span>
            </template>
          </el-table-column>
        </template>
      </data-tables-server>
    </div>

    <!-- Dialog -->
    <component
      :is="currentComponent"
      :visible="visible"
      :show-id="showId"
      @closed="handleClosed"
    />
  </div>
</template>

<script
  lang="ts"
  setup
>
import useMethod from '/imports/client/composables/useMethod'
import { useStore } from '/imports/store'
// import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import VueElementLoading from 'vue-element-loading'
// Table Action
import { debounce } from 'lodash'
// import escapeRegExp from '../../../api/lib/escapeRegExp'
import DataTablesServer from '/imports/client/components/DataTablesServer.vue'

import { ElRow, ElCol, ElButton } from 'element-plus'
import {
  ref,
  watch,
  computed,
  defineAsyncComponent,
  nextTick,
  shallowRef,
} from 'vue'

const store = useStore()
const { t } = useI18n()

const loading = ref(false)

const currentComponent = shallowRef<any>(null)
const visible = ref<boolean>(false)
const showId = ref<string>('')
const searchText = ref('')
const tableData = ref<any[]>([])
const tableTotal = ref<number>(0)
const tableQuery = ref(null)
const tableFilters = ref([
  {
    prop: ['totalQty', 'tranType'],
    value: '',
  },
])
const tableProps = ref({
  height: `calc(100vh - 240px)`,
})

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})
const tableTitles = computed(() => {
  const opt: any[] = [
    { label: `${t('exchange.tableLabel.date')}`, prop: 'tranDate' },
    { label: `Fee Type`, prop: 'feeType' },
    { label: `Tran Type`, prop: 'tranType' },
  ]
  return opt
})

watch(
  () => searchText.value,
  debounce(function () {
    getData(tableQuery.value)
  })
)
watch(
  () => currentBranchId,
  (val) => {
    if (val) {
      getData(tableQuery.value)
    }
  }
)

const getData = (query: any) => {
  loading.value = true
  tableQuery.value = query
  const selector: any = {
    branchId: currentBranchId.value,
  }

  const { call } = useMethod('ex.findFeeCharges', [])
  call({ selector })
    .then((result: any) => {
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
      console.log('error', err)
      loading.value = false
      store.dispatch('app/messageE', err.reason || err)
    })
}

// Action
const addNew = () => {
  currentComponent.value = defineAsyncComponent(
    () => import('./FeeChargeForm.vue')
  )

  nextTick(() => {
    visible.value = true
  })
}

const edit = (id: string) => {
  currentComponent.value = defineAsyncComponent(
    () => import('./FeeChargeForm.vue')
  )

  nextTick(() => {
    visible.value = true
    showId.value = id
  })
}

const handleClosed = () => {
  visible.value = false
  showId.value = ''
  nextTick(() => {
    currentComponent.value = null
    getData(tableQuery.value)
  })
}
</script>

<style lang="scss">
.text-black {
  font-size: 12px;
  color: #000 !important;
}
</style>
