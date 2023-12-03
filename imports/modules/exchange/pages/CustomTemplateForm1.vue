<script
  lang="ts"
  setup
>
import useMethod from '/imports/client/composables/useMethod.ts'
import { useStore } from '/imports/store'
import { computed, onMounted, ref, watch } from 'vue'
import ExchangeInvoice from '../reports/exchangeInvoice.vue'

const store = useStore()

// const props =
defineProps({
  dialogVisible: Boolean,
})

const emit = defineEmits<{
  (e: 'closed', value: boolean): void
}>()

const form = ref<{
  headers: any[]
  contents: any[]
  footers: any[]
}>({
  headers: [],
  contents: [],
  footers: [],
})

const currentIndex = ref(null)
const rules = ref()

const propHeaderOpts = ref<
  {
    label: string
    value: string
  }[]
>([
  { label: 'English business name', value: 'enBusinessName' },
  { label: 'Employee', value: 'employeeName' },
  { label: 'Address', value: 'address' },
  { label: 'Telephone', value: 'telephone' },
  { label: 'Email', value: 'email' },
  { label: 'Date', value: 'date' },
  { label: 'Date & time', value: 'dateTime' },
  { label: 'Time', value: 'time' },
])

const propFooterOpts = ref<
  {
    label: string
    value: string
  }[]
>([{ label: 'Tran Date', value: 'tranDate' }])
const styleInput = ref<
  {
    label: string
    prop: string
    placeholder: string
  }[]
>([
  {
    label: 'Font Size',
    prop: 'font-size',
    placeholder: 'Ex: 12px,10%,2.5em,...',
  },
  {
    label: 'Font Weight',
    prop: 'font-weight',
    placeholder: 'Ex: 400,700,...',
  },
  {
    label: 'Border',
    prop: 'border',
    placeholder: 'Ex: 1px solid black,...',
  },
  {
    label: 'Border Top',
    prop: 'border-top',
    placeholder: 'Ex: 1px solid black,...',
  },
  {
    label: 'Border Bottom',
    prop: 'border-bottom',
    placeholder: 'Ex: 1px solid black,...',
  },
  {
    label: 'Padding',
    prop: 'padding',
    placeholder: 'Ex: 5px 5px 5px 5px,...',
  },
  {
    label: 'Margin',
    prop: 'margin',
    placeholder: 'Ex: 5px 5px 5px 5px,...',
  },
])

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const getCustomTemplate = () => {
  const { call } = useMethod('ex.findCustomTemplate')
  call({
    selector: {
      branchId: currentBranchId.value,
    },
  })
    .then((result: any) => {
      form.value = { ...form.value, ...result }
    })
    .catch((error: any) => {
      console.log(error)
      store.dispatch('app/messageE', error)
    })
}

const submit = () => {
  const { call } = useMethod('ex.upSertCustomTemplate')

  call({
    ...form.value,
    branchId: currentBranchId.value,
  })
    .then(() => {
      // console.log('res', res)
      getCustomTemplate()
      // form.value = result
      store.dispatch('app/messageS', `Success`)
    })
    .catch((error: any) => {
      console.log(error)
      store.dispatch('app/messageE', error)
    })
}

const addNewFooterLabel = (param: string) => {
  const doc = {
    tag: 'p',
    label: 'New Label',
    value: [
      {
        label: 'New Value',
        className: '',
        styles: {},
        prop: '',
      },
    ],
    className: 'template-display',
    styles: { margin: '0px' },
  }

  form.value[param].push(doc) as any[]
}

const addFooterValue = ({ index, type }: { index: number; type: string }) => {
  form.value[type][index].value.push({
    label: 'New Value',
    styles: {},
    prop: '',
  })
}

const labelChange = ({
  e,
  index,
  type,
}: {
  e: any
  index: number
  type: string
}) => {
  const value = e.target.innerText
  form.value[type][index].label = value
}

const handleEdit = (index: any) => {
  currentIndex.value = index
}
const handleCloseEdit = () => (currentIndex.value = null)

const remove = ({
  index,
  childIndex,
  type,
}: {
  index: number
  childIndex?: number
  type: string
}) => {
  if (childIndex) form.value[type][index]['value'].splice(childIndex, 1)
  if (!childIndex) form.value[type].splice(index, 1)
}

const closeDialog = () => {
  emit('closed', false)
}

// Footers
const customTemplateFields = computed(() => {
  const exchange: any = store.state?.exchange?.customTemplate
  // console.log('store.state', store.state)
  return exchange as any[]
})
watch(
  customTemplateFields,
  (value: any[]) => {
    form.value.headers = value?.headers as any[]
    form.value.contents = value?.contents as any[]
    form.value.footers = value?.footers as any[]
  },
  { deep: true, immediate: true }
)
watch(
  () => form.value,
  (value) => {
    // console.log('value', value)
    store.dispatch('exchange/updateContents', value.contents)
    store.dispatch('exchange/updateHeaders', value.headers)
    store.dispatch('exchange/updateFooters', value.footers)
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  getCustomTemplate()
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    fullscreen
    @close="closeDialog"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="dialog-header">
        <span
          :id="titleId"
          :class="titleClass"
        >
          Custom Template
        </span>
        <el-button
          type="danger"
          size="small"
          @click="close"
        >
          <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
          Close
        </el-button>
      </div>
    </template>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card
          shadow="always"
          :style="{ 'margin-top': '10px' }"
        >
          <template #header>
            <div class="card-header">
              <span>Design</span>
              <el-button
                type="primary"
                @click="submit"
              >
                Submit
              </el-button>
            </div>
          </template>
          <!-- card body -->
          <el-row :gutter="10">
            <el-col :span="10">
              <el-form
                :model="form"
                :rules="rules"
                :label-position="`top`"
              >
                <el-collapse accordion>
                  <el-collapse-item
                    title="Header"
                    name="1"
                  >
                    <!-- content -->
                    <el-form-item
                      label="Header"
                      class="body-card"
                    >
                      <template #label>
                        <div class="footer-header">
                          <!-- Header -->

                          <el-button
                            type="primary"
                            size="small"
                            @click="addNewFooterLabel('headers')"
                          >
                            <template #icon>
                              <ElIcon><CirclePlusFilled /></ElIcon>
                            </template>
                            Label
                          </el-button>
                        </div>
                      </template>

                      <template
                        v-for="(item, key) in form.headers"
                        :key="key"
                      >
                        <div class="footer-card">
                          <span class="content-option">
                            <!-- class="content-option" -->
                            <!-- style="display: inline-flex" -->
                            <!-- contenteditable
                              @input="
                                (e) =>
                                  labelChange({
                                    e,
                                    index: key,
                                    type: 'headers',
                                  })
                              " -->
                            <span
                              style="border: 1px dashed #8c8b8b; padding: 5px"
                            >
                              {{ item.label || ' ' }}
                            </span>

                            <el-button
                              type="primary"
                              link
                              class="action"
                              @click="
                                addFooterValue({ index: key, type: 'headers' })
                              "
                            >
                              <template #icon>
                                <el-icon><CirclePlusFilled /></el-icon>
                              </template>
                            </el-button>

                            <!-- <el-popover
                              :visible="currentIndex == `${key}header`"
                              placement="right"
                              :width="300"
                            >
                              <div class="property">
                                <table style="width: 100%">
                                  <tr
                                    v-for="(it, _key) in styleInput"
                                    :key="_key"
                                  >
                                    <td style="width: 100px">
                                      {{ it['label'] }}
                                    </td>
                                    <td>
                                      <el-input
                                        v-model="
                                          form.headers[key]['styles'][
                                            it['prop']
                                          ]
                                        "
                                        :placeholder="`${it['placeholder']}`"
                                        size="small"
                                        clearable
                                        class="element"
                                      >
                                      </el-input>
                                    </td>
                                  </tr>
                                </table>
                              </div>

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
                                  @click="handleEdit(`${key}header`)"
                                >
                                  <template #icon>
                                    <el-icon><EditPen /></el-icon>
                                  </template>
                                </el-button>
                              </template>
                            </el-popover> -->

                            <el-button
                              link
                              type="danger"
                              style="margin-left: 7px"
                              class="footer-button-remove"
                              @click="remove({ index: key, type: 'headers' })"
                            >
                              <template #icon>
                                <el-icon><CircleCloseFilled /></el-icon>
                              </template>
                            </el-button>
                          </span>
                          <!-- <el-row
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
                            > -->
                          <template
                            v-for="(it, index) in item.value"
                            :key="`${key}${index}`"
                          >
                            <span class="content-option">
                              <span class="content">
                                {{
                                  form.headers[key]['value'][index]['label'] ||
                                  ' '
                                }}
                              </span>
                              <el-button
                                link
                                type="primary"
                                class="action"
                                @click="handleEdit(`${key}${index}header`)"
                              >
                                <template #icon>
                                  <el-icon><EditPen /></el-icon>
                                </template>
                              </el-button>
                              <el-button
                                link
                                type="danger"
                                class="action"
                                style="margin-left: 7px"
                                @click="
                                  remove({
                                    index: key,
                                    childIndex: index,
                                    type: 'headers',
                                  })
                                "
                              >
                                <template #icon>
                                  <el-icon><CircleCloseFilled /></el-icon>
                                </template>
                              </el-button>
                            </span>
                          </template>
                          <!-- </el-col> -->

                          <!-- <el-popover
                                :visible="
                                  currentIndex == `${key}${index}header`
                                "
                                placement="right"
                                :width="300"
                              >
                                <div class="property">
                                  <table style="width: 100%">
                                    <tr
                                      v-for="(it, _key) in styleInput"
                                      :key="_key"
                                    >
                                      <td style="width: 100px">
                                        {{ it['label'] }}
                                      </td>
                                      <td>
                                        <el-input
                                          v-model="
                                            form.headers[key]['value'][index][
                                              'styles'
                                            ][it['prop']]
                                          "
                                          :placeholder="`${it['placeholder']}`"
                                          size="small"
                                          clearable
                                          class="element"
                                        >
                                        </el-input>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="width: 100px">Prop</td>
                                      <td>
                                        <el-select
                                          v-model="
                                            form.headers[key]['value'][index][
                                              'prop'
                                            ]
                                          "
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
                                    </tr>
                                  </table>
                                </div>
                                Action
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
                                    @click="handleEdit(`${key}${index}header`)"
                                  >
                                    <template #icon>
                                      <el-icon><EditPen /></el-icon>
                                    </template>
                                  </el-button>
                                </template>
                              </el-popover> -->
                          <!-- Remove -->

                          <!-- <el-button
                                link
                                type="danger"
                                style="margin-left: 7px"
                                @click="
                                  remove({
                                    index: key,
                                    childIndex: index,
                                    type: 'headers',
                                  })
                                "
                              >
                                <template #icon>
                                  <el-icon><CircleCloseFilled /></el-icon>
                                </template>
                              </el-button> -->

                          <!-- </el-row> -->
                        </div>
                      </template>
                    </el-form-item>
                  </el-collapse-item>

                  <!-- Footers -->
                  <el-collapse-item
                    title="Footer"
                    name="2"
                  >
                    <el-form-item
                      label="Footers"
                      class="body-card"
                    >
                      <template #label>
                        <div class="footer-header">
                          <!-- Footer -->

                          <el-button
                            type="primary"
                            size="small"
                            @click="addNewFooterLabel('footers')"
                          >
                            <template #icon>
                              <ElIcon><CirclePlusFilled /></ElIcon>
                            </template>
                            Label
                          </el-button>
                        </div>
                      </template>
                      <template
                        v-for="(item, key) in form.footers"
                        :key="key"
                      >
                        <div class="footer-card">
                          <span style="display: inline-flex">
                            <p
                              contenteditable
                              @input="
                                (e) =>
                                  labelChange({
                                    e,
                                    index: key,
                                    type: 'footers',
                                  })
                              "
                            >
                              {{ item.label }}
                            </p>

                            <el-button
                              type="primary"
                              link
                              @click="
                                addFooterValue({ index: key, type: 'footers' })
                              "
                            >
                              <template #icon>
                                <el-icon><CirclePlusFilled /></el-icon>
                              </template>
                            </el-button>

                            <el-popover
                              :visible="currentIndex == `${key}footer`"
                              placement="right"
                              :width="300"
                            >
                              <div class="property">
                                <table style="width: 100%">
                                  <tr
                                    v-for="(it, _key) in styleInput"
                                    :key="_key"
                                  >
                                    <td style="width: 100px">
                                      {{ it['label'] }}
                                    </td>
                                    <td>
                                      <el-input
                                        v-model="
                                          form.footers[key]['styles'][
                                            it['prop']
                                          ]
                                        "
                                        :placeholder="`${it['placeholder']}`"
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
                                  link
                                  type="primary"
                                  @click="handleEdit(`${key}footer`)"
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
                              class="footer-button-remove"
                              @click="remove({ index: key, type: 'footers' })"
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
                                v-model="
                                  form.footers[key]['value'][index]['label']
                                "
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
                                :visible="
                                  currentIndex == `${key}${index}footer`
                                "
                                placement="right"
                                :width="300"
                              >
                                <div class="property">
                                  <table style="width: 100%">
                                    <tr
                                      v-for="(it, _key) in styleInput"
                                      :key="_key"
                                    >
                                      <td style="width: 100px">
                                        {{ it['label'] }}
                                      </td>
                                      <td>
                                        <el-input
                                          v-model="
                                            form.footers[key]['value'][index][
                                              'styles'
                                            ][it['prop']]
                                          "
                                          :placeholder="`${it['placeholder']}`"
                                          size="small"
                                          clearable
                                          class="element"
                                        >
                                        </el-input>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Prop</td>
                                      <td>
                                        <el-select
                                          v-model="
                                            form.footers[key]['value'][index][
                                              'prop'
                                            ]
                                          "
                                          style="width: 100%"
                                          placeholder="prop"
                                          clearable
                                          filterable
                                          size="small"
                                        >
                                          <el-option
                                            v-for="item in propFooterOpts"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                          >
                                          </el-option>
                                        </el-select>
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
                                    link
                                    type="primary"
                                    @click="handleEdit(`${key}${index}footer`)"
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
                                @click="
                                  remove({
                                    index: key,
                                    childIndex: index,
                                    type: 'footers',
                                  })
                                "
                              >
                                <template #icon>
                                  <el-icon><CircleCloseFilled /></el-icon>
                                </template>
                              </el-button>
                            </el-col>
                          </el-row>
                        </div>
                      </template>
                    </el-form-item>
                  </el-collapse-item>
                </el-collapse>
              </el-form>
            </el-col>
            <el-col :span="14">
              <h1>Right</h1>
              <table
                v-if="customTemplateFields?.type"
                style="width: 100%"
              >
                <tr
                  v-for="(it, _key) in styleInput"
                  :key="_key"
                >
                  <td style="width: 100px">
                    {{ it['label'] }}
                  </td>
                  <td>
                    <el-input
                      v-model="
                        form[customTemplateFields?.type][
                          customTemplateFields?.parentIndex
                        ]['styles'][it['prop']]
                      "
                      :placeholder="`${it['placeholder']}`"
                      size="small"
                      clearable
                      class="element"
                    >
                    </el-input>
                  </td>
                </tr>
              </table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <ExchangeInvoice
          :visible-print-invoice="true"
          :is-edit="true"
        />
      </el-col>
    </el-row>
  </el-dialog>
</template>

<style
  lang="scss"
  scoped
>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.body-card {
  padding: 0px 5px;

  .footer-card {
    background: #f0f0f0;
    font-size: 12px;
    border-radius: 5px;
    padding: 5px;
    margin: 10px 0px 10px 0px;
    position: relative;
    display: flex;
    flex-direction: column;
    /* box-shadow: 0 20px 25px -5px rgb(0 0 0 / 10%),
    0 10px 10px -5px rgb(0 0 0 / 4%); */
    .footer-button-remove {
      position: absolute;
      right: -7px;
      top: -11%;
      visibility: hidden;
      transition: 0.3s;
      /* display: none; */
    }
  }
  .footer-card:hover .footer-button-remove {
    visibility: visible;
    transition: 0.3s;
    /* display: block; */
  }

  .footer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .property {
    margin-bottom: 10px;
    .element {
      margin-bottom: 10px;
    }
  }
}

.content-option {
  margin-left: 5px;
  .content {
    border: 1px dashed #8c8b8b;
    padding: 5px;
  }

  .action {
    visibility: hidden;
  }
}
.content-option:hover .action {
  visibility: visible;
}

[contenteditable] {
  /* padding-right: 10px;
  margin: 0px;
  outline: 0px solid transparent; */
  padding: 0px 5px;
  margin: 0px 0px 2px 5px;
  outline: 0px solid transparent;
  border: 0.2px dashed;
}

/* dialog */
.dialog-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
