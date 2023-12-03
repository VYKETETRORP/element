<template>
  <el-row :gutter="20">
    <template
      v-for="(it, index) in currencyOpts"
      :key="index"
    >
      <el-col
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="12"
      >
        <el-divider>{{ it.name }}</el-divider>
        <el-form>
          <el-table
            :data="filterData(it._id)"
            size="small"
            border
            stripe
          >
            <el-table-column
              label="#"
              type="index"
              align="center"
              width="50"
            >
              <template #default="scope">
                <span
                  style="
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                  "
                >
                  {{ scope.$index + 1 }}
                  <el-icon
                    class="remove-action"
                    @click="removeRowByIndex(scope.row)"
                  >
                    <circle-close />
                  </el-icon>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="Amount">
              <template #header>
                <span style="margin-right: 6px">Amount</span>
                <el-tooltip
                  content="តម្លៃធំជាង | Ex : ០ ធំជាងសូន្យ"
                  placement="top"
                  :enterable="false"
                >
                  <i class="fal fa-map-marker-question"></i>
                </el-tooltip>
              </template>
              <template #default="scope">
                <el-form-item
                  :key="`${index}${scope.$index}amount`"
                  style="margin: 0"
                >
                  <el-input-number
                    v-model="scope.row.amount"
                    style="width: 100%"
                    :min="0"
                    :controls="false"
                    @focus="$event.target.select()"
                  >
                  </el-input-number>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="Type">
              <template #default="scope">
                <el-form-item
                  :key="`${index}${scope.$index}rateType`"
                  style="margin: 0"
                >
                  <el-select
                    v-model="scope.row.rateType"
                    style="width: 100%"
                    placeholder="Select"
                  >
                    <el-option
                      v-for="item in rateOpts"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="Fee">
              <template #default="scope">
                <el-form-item
                  :key="`${index}${scope.$index}value`"
                  style="margin: 0"
                >
                  <el-input-number
                    v-model="scope.row.value"
                    style="width: 100%"
                    :min="0"
                    :controls="false"
                    @focus="$event.target.select()"
                  >
                  </el-input-number>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
        <el-button
          type="primary"
          size="small"
          style="margin-top: 10px"
          @click="addNew(it._id)"
        >
          + {{ it.name }}
        </el-button>
      </el-col>
    </template>
  </el-row>
</template>

<script
  lang="ts"
  setup
>
import { useStore } from '/imports/store'
import { computed, onMounted, ref, watch } from 'vue'
const props = defineProps<{
  details: any[]
}>()
const emits = defineEmits<{
  (e: 'details-change', value: any): void
}>()

const currencyOpts = computed(() => {
  return store.getters['exchange/currencies']
})

const store = useStore()

// data
const itemDetails = ref<any>([])
const rateOpts = [
  { label: 'Rate (%)', value: 'percentage' },
  { label: 'Amount', value: 'amount' },
]

watch(
  () => props.details,
  (items) => {
    if (items.length) itemDetails.value = items
  }
)
watch(
  () => itemDetails.value,
  (items) => {
    const result = []
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (it.value) {
        result.push({
          currencyId: it.currencyId,
          amount: it.amount,
          rateType: it.rateType,
          value: it.value,
        })
      }
    }
    // emit to parents
    emits('details-change', result)
  },
  {
    deep: true,
    immediate: true,
  }
)
const filterData = (currencyId: string) => {
  return itemDetails.value.filter((d: any) => d.currencyId == currencyId)
}
const addNew = (currencyId: string) => {
  itemDetails.value.push({
    currencyId,
    amount: 0,
    rateType: 'amount',
    value: 0,
  })
}
const removeRowByIndex = (item: any) => {
  const index = itemDetails.value.indexOf(item)
  if (index !== -1) {
    itemDetails.value.splice(index, 1)
  }
}

onMounted(() => {
  store.dispatch('exchange/getCurrencies')
})
</script>
<style
  lang="scss"
  scoped
>
.remove-action {
  color: #f56c6c;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: #f78989;
  }
}
</style>
