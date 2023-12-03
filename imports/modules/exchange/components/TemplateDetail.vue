<script
  lang="ts"
  setup
>
import { useStore } from '/imports/store'
import { computed, onMounted, ref, watch } from 'vue'
const store = useStore()

const props = defineProps({
  items: {
    type: Array,
    // default:()=> return []
  },
  styleInput: {
    type: Array,
    // default:()=> return []
  },
})

const form = ref<any[]>([])

watch(
  () => props.items,
  (value) => {
    form.value = value as any[]
  },
  {
    immediate: true,
    deep: true,
  }
)

const currentIndex = ref(null)

const addFooterValue = (index: number) => {
  form.value[index].value.push({
    label: 'New Value',
    styles: {},
    prop: '',
  })
}

const labelChange = (e: any, index: number) => {
  const value = e.target.innerText
  form.value[index].label = value
}

const handleEdit = (index: any) => {
  currentIndex.value = index
}
const handleCloseEdit = () => (currentIndex.value = null)

const remove = (index: number, childIndex?: number) => {
  if (childIndex) form.value[index]['value'].splice(childIndex, 1)
  if (!childIndex) form.value.splice(index, 1)
}
</script>

<template>
  <div>
    <template
      v-for="(item, key) in form"
      :key="key"
    >
      <div class="footer-card">
        <span style="display: inline-flex">
          <p
            contenteditable
            @input="(e) => labelChange(e, key)"
          >
            {{ item.label }}
          </p>

          <el-button
            v-if="item.tag == 'p'"
            type="primary"
            link
            @click="addFooterValue(key)"
          >
            <template #icon>
              <el-icon><CirclePlusFilled /></el-icon>
            </template>
          </el-button>

          <el-popover
            v-if="item.tag == 'p'"
            :visible="currentIndex == `${key}`"
            placement="top"
            :width="260"
          >
            <div class="property">
              <table style="width: 100%">
                <tr
                  v-for="(it, prop) in styleInput"
                  :key="prop"
                >
                  <td>{{ prop }}</td>
                  <td>
                    <el-input
                      v-model="form[key]['styles'][it]"
                      :placeholder="`${prop}`"
                      size="small"
                      clearable
                      class="element"
                    >
                    </el-input>
                  </td>
                </tr>
              </table>
            </div>
            <!-- Action -->
            <div style="text-align: right; margin: 0">
              <el-button
                size="small"
                text
                @click="handleCloseEdit"
              >
                Close
              </el-button>
            </div>
            <template #reference>
              <el-button
                v-if="item.tag == 'p'"
                link
                type="primary"
                @click="handleEdit(`${key}`)"
              >
                <template #icon>
                  <el-icon><EditPen /></el-icon>
                </template>
              </el-button>
            </template>
          </el-popover>

          <el-button
            link
            type="danger"
            style="margin-left: 7px"
            @click="remove(key)"
          >
            <template #icon>
              <el-icon><CircleCloseFilled /></el-icon>
            </template>
          </el-button>
        </span>
        <el-row
          v-for="(it, index) in item.value"
          :key="`${key}${index}`"
          :gutter="5"
        >
          <el-col
            :xs="21"
            :sm="21"
            :md="21"
            :lg="21"
            :xl="21"
          >
            <el-input
              v-model="form[key]['value'][index]['label']"
              style="margin-bottom: 5px"
              autosize
              type="textarea"
            >
            </el-input>
          </el-col>
          <el-col
            :xs="3"
            :sm="3"
            :md="3"
            :lg="3"
            :xl="3"
          >
            <el-popover
              :visible="currentIndex == `${key}${index}`"
              placement="top"
              :width="260"
            >
              <div class="property">
                <table style="width: 100%">
                  <tr
                    v-for="(it, prop) in styleInput"
                    :key="prop"
                  >
                    <td>{{ prop }}</td>
                    <td>
                      <el-input
                        v-model="form[key]['value'][index]['styles'][it]"
                        :placeholder="`${prop}`"
                        size="small"
                        clearable
                        class="element"
                      >
                      </el-input>
                    </td>
                  </tr>
                  <!-- <tr>
                    <td>Prop</td>
                    <td>
                      <el-select
                        v-model="form[key]['value'][index]['prop']"
                        style="width: 100%"
                        placeholder="prop"
                        clearable
                        filterable
                        size="small"
                      >
                        <el-option
                          v-for="item in propHeaderOpts"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </td>
                  </tr> -->
                </table>
              </div>
              <!-- Action -->
              <div style="text-align: right; margin: 0">
                <el-button
                  size="small"
                  text
                  @click="handleCloseEdit"
                >
                  Close
                </el-button>
              </div>
              <template #reference>
                <el-button
                  link
                  type="primary"
                  @click="handleEdit(`${key}${index}`)"
                >
                  <template #icon>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-button>
              </template>
            </el-popover>
            <!-- Remove -->

            <el-button
              link
              type="danger"
              style="margin-left: 7px"
              @click="remove(key, index)"
            >
              <template #icon>
                <el-icon><CircleCloseFilled /></el-icon>
              </template>
            </el-button>
          </el-col>
        </el-row>

        <!-- hr -->
        <el-row
          v-if="item.tag == 'hr'"
          :gutter="5"
        >
          <el-col :span="21">
            <component :is="item.tag" />
          </el-col>
          <el-col :span="3">
            <el-button
              link
              type="danger"
              style="margin-left: 7px"
              @click="remove(key)"
            >
              <template #icon>
                <el-icon><CircleCloseFilled /></el-icon>
              </template>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </template>
  </div>
</template>

<style
  scoped
  lang="scss"
></style>
