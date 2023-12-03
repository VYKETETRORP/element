<script
  lang="ts"
  setup
>
// Collections
import FilesCollection from '/imports/api/files/files'

import useMethod from '/imports/client/composables/useMethod.ts'
import { useStore } from '/imports/store'
import { computed, ref, watch } from 'vue'
import ExchangeInvoice from '../reports/exchangeInvoice.vue'
import Draggable from 'vuedraggable'

const store = useStore()

// const props =
const props = defineProps({
  dialogVisible: Boolean,
})

const emit = defineEmits<{
  (e: 'closed', value: boolean): void
}>()

const customTemplateFields = computed(() => {
  const exchange: any = store.state?.exchange?.customTemplate

  return exchange as any
})

const form = ref<{
  _id?: string
  headers: any[]
  contents: any[]
  footers: any[]
}>({
  headers: [],
  contents: [],
  footers: [],
})

const parentIndex = ref(null)
const childIndex = ref(null)
const type = ref(null)
const isEdit = ref(true)
// Upload
const fileList = ref([])
const imageUrl = ref<any>({})

const borderOpts = ref([
  {
    label: '1px solid #8c8b8b',
    value: '1px solid #8c8b8b',
  },
  {
    label: '1px dashed #8c8b8b',
    value: '1px dashed #8c8b8b',
  },
  {
    label: '1px dotted #8c8b8b',
    value: '1px dotted #8c8b8b',
  },
])

const propHeaderOpts = ref<
  {
    label: string
    value: string
  }[]
>([
  { label: 'English business name', value: 'enBusinessName' },
  { label: 'Employee', value: 'employeeName' },
  { label: 'Customer', value: 'customer' },
  { label: 'RefNo', value: 'refNo' },
  { label: 'Address', value: 'address' },
  { label: 'Telephone', value: 'telephone' },
  { label: 'Email', value: 'email' },
  { label: 'Date', value: 'date' },
  { label: 'Date & time', value: 'dateTime' },
  { label: 'Time', value: 'time' },
])
const contentsOpts = ref<
  {
    label: string
    value: string
  }[]
>([
  {
    label: 'Exchange Amount',
    value: 'exchangeAmount',
  },
  {
    label: 'Rate',
    value: 'rate',
  },
  {
    label: 'Received',
    value: 'received',
  },
  {
    label: 'Amount',
    value: 'amount',
  },
  {
    label: 'Return',
    value: 'return',
  },
])

const styleInput = ref<
  {
    label: string
    prop: string
    tag?: string
    option?: string
    icon?: string
    divide?: boolean
    placeholder?: string
  }[]
>([
  {
    label: 'Width',
    prop: 'width',
    placeholder: 'Ex: 40px,70%,...',
  },
  // {
  //   label: 'Position',
  //   icon: 'fal fa-map-pin',
  //   prop: '2',
  //   divide: true,
  // },
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
  {
    label: 'Display',
    prop: 'display',
    tag: 'select',
    option: 'display',
    placeholder: 'Ex: flex,...',
  },
  {
    label: 'Flex direction',
    prop: 'flex-direction',
    tag: 'select',
    option: 'direction',
    placeholder: 'Ex: row,...',
  },
  {
    label: 'Justify content',
    prop: 'justify-content',
    tag: 'select',
    option: 'justifyContent',
    placeholder: 'Ex: space-between,...',
  },
])

const fontStyleInputOpts = ref([
  {
    label: 'Font style',
    prop: 'font-family',
    tag: 'select',
    option: 'fontFamily',
    placeholder: 'Moul,Battambang,...',
    details: [
      {
        label: 'Font Size',
        prop: 'font-size',
        tag: 'select',
        class: 'opt-line-height',
        icon: 'fas fa-text-size',
        option: 20,
        placeholder: 'Font size',
      },
      {
        label: 'Font Size',
        prop: 'font-weight',
        tag: 'checkbox',
        icon: 'fas fa-bold',
        trueLabel: 'bold',
        falseLabel: 'normal',
        placeholder: 'Ex: space-between,...',
      },
      {
        label: 'Font Size',
        prop: 'font-style',
        tag: 'checkbox',
        icon: 'fas fa-italic',
        trueLabel: 'italic',
        falseLabel: '',
        placeholder: '',
      },
      {
        label: 'Font Size',
        prop: 'text-decoration',
        tag: 'checkbox',
        icon: 'fas fa-underline',
        trueLabel: 'underline',
        falseLabel: '',
        placeholder: '',
      },
      {
        label: 'Line Height',
        prop: 'line-height',
        tag: 'select',
        icon: 'fas fa-line-height',
        option: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
        class: 'opt-line-height',
        placeholder: '',
      },
    ],
  },
])

const borderInputOpts = ref([
  {
    label: 'Border',
    prop: 'border',
    icon: 'fas fa-border-outer',
    tag: 'select',
    option: 'border',
    placeholder: 'Ex: 1px solid black,...',
  },
  {
    label: 'Border Top',
    prop: 'border-top',
    tag: 'select',
    icon: 'fas fa-border-top',
    option: 'border',
    placeholder: 'Ex: 1px solid black,...',
  },
  {
    label: 'Border Bottom',
    prop: 'border-bottom',
    tag: 'select',
    icon: 'fas fa-border-bottom',
    option: 'border',
    placeholder: 'Ex: 1px solid black,...',
  },
])

const fontFamilyOpts = ref([
  {
    label: 'kh moul',
    value: `'Roboto','Moul' !important`,
  },
  {
    label: 'kh battambang',
    value: `'Roboto','Battambang' !important`,
  },
  {
    label: 'kh fasthand',
    value: `'Roboto','Fasthand' !important`,
  },
  {
    label: 'kh bokor',
    value: `'Roboto','Bokor' !important`,
  },
])

const displayOpts = ref([
  {
    label: 'flex',
    value: 'flex',
  },
])
const directionOpts = ref([
  {
    label: 'row',
    value: 'row',
  },
  {
    label: 'row reverse',
    value: 'row-reverse',
  },
  {
    label: 'column',
    value: 'column',
  },
  {
    label: 'column reverse',
    value: 'column-reverse',
  },
])
const justifyContentOpts = ref([
  {
    label: 'flex start',
    value: 'flex-start',
  },
  {
    label: 'flex end',
    value: 'flex-end',
  },
  {
    label: 'center',
    value: 'center',
  },
  {
    label: 'space between',
    value: 'space-between',
  },
  {
    label: 'space-around',
    value: 'space-around',
  },
  {
    label: 'space evenly',
    value: 'space-evenly',
  },
  {
    label: 'start',
    value: 'start',
  },
  {
    label: 'end',
    value: 'end',
  },
  {
    label: 'left',
    value: 'left',
  },
  {
    label: 'right',
    value: 'right',
  },
])

const opts = ref<{
  headers: any
  footers: any
  contents: any
  display: any
  direction: any
  justifyContent: any
  fontFamily: any
  border: any
}>({
  headers: propHeaderOpts,
  footers: propHeaderOpts,
  contents: contentsOpts,
  display: displayOpts,
  direction: directionOpts,
  justifyContent: justifyContentOpts,
  fontFamily: fontFamilyOpts,
  border: borderOpts,
})

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const getCustomTemplate = () => {
  const { call } = useMethod('ex.findCustomTemplate', null)
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
  const { call } = useMethod('ex.upSertCustomTemplate', null)
  const headers: any[] = []
  const { footers, contents } = form.value

  form.value.headers.forEach((header) => {
    const list: any[] = []
    header['value'].forEach((it: any) => {
      const { src, ...doc } = it
      list.push(doc)
    })
    header['value'] = list
    headers.push(header)
  })

  const param: any = {
    headers,
    footers,
    contents,
    branchId: currentBranchId.value,
  }
  if (form.value?._id) {
    param._id = form.value._id
  }
  call(param)
    .then(() => {
      getCustomTemplate()
      // form.value = result
      store.dispatch('app/messageS', `Success`)
    })
    .catch((error: any) => {
      console.log(error)
      store.dispatch('app/messageE', error)
    })
}
const handleCloseEdit = () => {
  store.dispatch('exchange/updateCurrentIndex', {
    parentIndex: null,
    childIndex: null,
    type: null,
  })
}

// Upload logo
const handleFileChange = (file: any, fileList: any, _childIndex: number) => {
  fileList.value = [file]
  makeImageUrl(file.raw, _childIndex)
  uploadFile(file.raw, _childIndex)
}
const handleFileRemove = (file: any, fileList: any, _childIndex: number) => {
  const imageId =
    form.value[type.value][parentIndex.value]['value'][_childIndex][
      'imageId'
    ] || null
  if (imageId) {
    FilesCollection.remove({ _id: imageId })
    fileList.value = []
    makeImageUrl(null, _childIndex)
  }
}
const getImageUrl = (_childIndex: number) => {
  return imageUrl.value[_childIndex] || ''
}
const makeImageUrl = (file: any, _childIndex: number) => {
  imageUrl.value[_childIndex] = file ? URL.createObjectURL(file) : ''

  form.value[type.value][parentIndex.value]['value'][_childIndex]['src'] =
    imageUrl.value[_childIndex]
  form.value[type.value][parentIndex.value]['value'][_childIndex]['className'] =
    'logo'
}

const uploadFile = (file: any, _childIndex: number) => {
  if (file) {
    const fileName = file.name
    FilesCollection.insert({
      file: file,
      fileName,
      chunkSize: 'dynamic',
      onUploaded(err: any, res: any) {
        if (err) {
          store.dispatch('app/messageE', err)
        }
        if (res) {
          form.value[type.value][parentIndex.value]['value'][_childIndex][
            'imageId'
          ] = res._id
        }
      },
    })
  } else {
    store.dispatch('app/messageE', 'File upload is required')
  }
}

const changedBorder = ({ value, prop }: { value: any; prop: string }) => {
  if (!value[prop]) delete value[prop]
}

const addChildContent = (index: number, type: string) => {
  store.dispatch('exchange/addNewChildContent', { index, type })
}

const removeChildContent = ({
  index,
  childIndex,
  type,
}: {
  index: number
  childIndex?: number
  type: string
}) => {
  store.dispatch('exchange/removeContent', {
    index,
    childIndex,
    type,
  })
}

const checkedButton = (value: any, prop: string) => {
  value[prop] = value[prop] || ''
  if (prop == 'font-weight' && (value[prop] == 'normal' || value[prop] == '')) {
    value[prop] = 'normal'

    return false
  }

  return !value
}

const closeDialog = () => {
  emit('closed', false)
}

// Footers
watch(
  () => props.dialogVisible,
  (val) => {
    handleCloseEdit()
    isEdit.value = val
    imageUrl.value = {}
    if (val) getCustomTemplate()
  },
  { immediate: true }
)

watch(
  customTemplateFields,
  (value: any) => {
    form.value.headers = value?.headers as any[]
    form.value.contents = value?.contents as any[]
    form.value.footers = value?.footers as any[]

    parentIndex.value = value.parentIndex
    childIndex.value = value.childIndex
    type.value = value.type

    imageUrl.value = {}
    if (parentIndex.value != null) {
      const loopLength =
        form.value[type.value][parentIndex.value]['value'].length
      for (let i = 0; i < loopLength; i++) {
        const it = form.value[type.value][parentIndex.value]['value'][i]
        if (it.src) {
          imageUrl.value[i] = it.src
        }
      }
    }
  },
  { deep: true, immediate: true }
)
watch(
  () => form.value,
  (value) => {
    store.dispatch('exchange/updateContents', value.contents)
    store.dispatch('exchange/updateHeaders', value.headers)
    store.dispatch('exchange/updateFooters', value.footers)
  },
  { deep: true, immediate: true }
)
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

    <el-card
      shadow="always"
      style="'margin-top':-10px "
    >
      <template #header>
        <div class="card-header">
          <span>Design</span>
          <el-button
            type="primary"
            @click="submit"
          >
            <template #icon>
              <i class="fal fa-save"></i>
            </template>
            Save
          </el-button>
        </div>
      </template>

      <el-row :gutter="10">
        <el-col :span="10">
          <el-card
            class="box-card"
            :style="{ 'margin-top': '10px' }"
          >
            <el-button
              v-if="type != null && parentIndex != null && childIndex == null"
              type="danger"
              size="small"
              style="float: right; margin-top: -5px"
              @click="handleCloseEdit"
            >
              <template #icon>
                <i class="fal fa-times fa-lg"></i>
              </template>
              Close
            </el-button>
            <!-- Main style -->
            <el-collapse
              v-if="type != null && parentIndex != null && childIndex == null"
              accordion
              style="margin-top: 25px"
            >
              <el-collapse-item>
                <template #title>
                  <el-divider>
                    <i class="fal fa-pencil-ruler"></i> Main Style
                  </el-divider>
                </template>
                <!-- content -->
                <div>
                  <!-- Border  -->
                  <span>Border</span>
                  <span>
                    <el-row :gutter="5">
                      <el-col
                        v-for="(it, _key) in borderInputOpts"
                        :key="_key"
                        :xs="24"
                        :sm="24"
                        :md="24"
                        :lg="8"
                      >
                        <el-select
                          v-model="form[type][parentIndex]['styles'][it.prop]"
                          style="width: 100%"
                          :placeholder="it.placeholder"
                          clearable
                          filterable
                          class="border-select-opt"
                          @change="
                            changedBorder({
                              value: form[type][parentIndex]['styles'],
                              prop: it.prop,
                            })
                          "
                        >
                          <template #prefix>
                            <i :class="`${it['icon']} icon`"></i>
                            <hr
                              v-if="form[type][parentIndex]['styles'][it.prop]"
                              :style="`border-top:${
                                form[type][parentIndex]['styles'][it.prop]
                              };min-width:50px`"
                            />
                          </template>
                          <el-option
                            v-for="item in opts[it['option']]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          >
                            <hr
                              v-if="it['option'] == 'border'"
                              :style="`border-top:${item.label}`"
                            />
                          </el-option>
                        </el-select>
                      </el-col>
                    </el-row>
                  </span>
                  <!-- End border -->

                  <el-row :gutter="10">
                    <template
                      v-for="(it, _key) in styleInput"
                      :key="_key"
                    >
                      <el-col
                        :span="12"
                        :offset="0"
                      >
                        <span>
                          {{ it['label'] }}
                        </span>
                        <span>
                          <el-input
                            v-if="!it['tag']"
                            v-model="
                              form[type][parentIndex]['styles'][it['prop']]
                            "
                            :placeholder="`${it['placeholder']}`"
                            clearable
                            class="element"
                          >
                          </el-input>
                          <el-select
                            v-else
                            v-model="
                              form[type][parentIndex]['styles'][it['prop']]
                            "
                            style="width: 100%"
                            :placeholder="it.placeholder"
                            clearable
                            filterable
                            :class="`${
                              it['option'] == 'border'
                                ? 'border-select-opt'
                                : ''
                            }`"
                          >
                            <template
                              v-if="it['option'] == 'border'"
                              #prefix
                            >
                              <i :class="`${it['icon']} icon`"></i>
                              <hr
                                v-if="
                                  form[type][parentIndex]['styles'][it['prop']]
                                "
                                :style="`border-top:${
                                  form[type][parentIndex]['styles'][it['prop']]
                                };width:70px`"
                              />
                            </template>
                            <el-option
                              v-for="item in opts[it['option']]"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            >
                              <hr
                                v-if="it['option'] == 'border'"
                                :style="`border-top:${item.label}`"
                              />
                            </el-option>
                          </el-select>
                        </span>
                      </el-col>
                    </template>
                  </el-row>
                </div>
              </el-collapse-item>
            </el-collapse>

            <!-- Child -->
            <template v-if="type != null && parentIndex != null">
              <div class="child-header">
                <span class="label">
                  <i class="fal fa-pencil"></i>
                  Content
                </span>
                <el-button
                  type="primary"
                  size="small"
                  @click="addChildContent(parentIndex, type)"
                >
                  <template #icon>
                    <i class="far fa-plus"></i>
                  </template>
                  Content
                </el-button>
              </div>

              <!-- Details -->
              <draggable
                :list="form[type][parentIndex]['value']"
                item-key="tag"
                ghost-class="ghost-class"
                drag-class="drag-class"
                :animation="200"
                @start="drag = true"
                @end="drag = false"
              >
                <template #item="{ index: _childIndex }">
                  <el-card
                    shadow="always"
                    class="child-details"
                  >
                    <table style="width: 100%">
                      <!-- Content -->
                      <tr>
                        <td
                          style="
                            width: 100px;
                            text-align: right;
                            padding-right: 10px;
                          "
                        >
                          Content
                        </td>
                        <td>
                          <el-input
                            v-model="
                              form[type][parentIndex]['value'][_childIndex][
                                'label'
                              ]
                            "
                            :placeholder="`Content`"
                            clearable
                            :rows="2"
                            type="textarea"
                            class="element"
                          >
                          </el-input>
                        </td>
                      </tr>

                      <tr>
                        <td colspan="2">
                          <el-collapse accordion>
                            <!-- class="collapse" -->
                            <el-collapse-item
                              title="Style"
                              name="style"
                            >
                              <template #title> More </template>
                              <div>
                                <!-- Show Image only header -->
                                <template v-if="type === 'headers'">
                                  <span> Image </span>
                                  <span>
                                    <div class="image-box">
                                      <el-upload
                                        :file-list="fileList"
                                        :on-change="
                                          (uploadFile, uploadFiles) =>
                                            handleFileChange(
                                              uploadFile,
                                              uploadFiles,
                                              _childIndex
                                            )
                                        "
                                        :auto-upload="false"
                                        action=""
                                        accept="image/*"
                                        class="image-uploader"
                                      >
                                        <template
                                          v-if="getImageUrl(_childIndex)"
                                        >
                                          <img
                                            :src="getImageUrl(_childIndex)"
                                            class="image-uploader-preview"
                                          />
                                          <el-button
                                            type="danger"
                                            class="btn-delete"
                                            link
                                            @click="
                                              (uploadFile, uploadFiles) =>
                                                handleFileRemove(
                                                  uploadFile,
                                                  uploadFiles,
                                                  _childIndex
                                                )
                                            "
                                          >
                                            <template #icon>
                                              <el-icon>
                                                <CircleCloseFilled />
                                              </el-icon>
                                            </template>
                                          </el-button>
                                        </template>

                                        <i
                                          v-else
                                          class="far fa-plus image-uploader-icon"
                                        ></i>
                                      </el-upload>
                                    </div>
                                  </span>
                                </template>

                                <!-- property -->
                                <span> Property </span>
                                <span>
                                  <el-select
                                    v-model="
                                      form[type][parentIndex]['value'][
                                        _childIndex
                                      ]['prop']
                                    "
                                    style="width: 100%"
                                    placeholder="prop"
                                    clearable
                                    filterable
                                  >
                                    <el-option
                                      v-for="item in opts[type]"
                                      :key="item.value"
                                      :label="item.label"
                                      :value="item.value"
                                    >
                                    </el-option>
                                  </el-select>

                                  <el-divider>
                                    <i class="fas fa-text-size"></i>
                                  </el-divider>

                                  <el-row
                                    :gutter="10"
                                    style="margin-top: 5px"
                                  >
                                    <el-col :span="244">
                                      <template
                                        v-for="(it, _k) in fontStyleInputOpts[0]
                                          .details"
                                        :key="_k"
                                      >
                                        <el-select
                                          v-if="it.tag == 'select'"
                                          v-model="
                                            form[type][parentIndex]['value'][
                                              _childIndex
                                            ]['propStyles'][it['prop']]
                                          "
                                          filterable
                                          allow-create
                                          default-first-option
                                          :reserve-keyword="false"
                                          clearable
                                          placeholder="Font size"
                                          :class="
                                            it['class'] ? it['class'] : ''
                                          "
                                          style="margin-right: 4px"
                                        >
                                          <template #prefix>
                                            <i :class="it.icon"></i>
                                          </template>
                                          <el-option
                                            v-for="item in it.option"
                                            :key="item"
                                            :label="`${item}${
                                              it.prop == 'font-size' ? 'px' : ''
                                            }`"
                                            :value="`${item}${
                                              it.prop == 'font-size' ? 'px' : ''
                                            }`"
                                          />
                                        </el-select>

                                        <el-checkbox-button
                                          v-if="it.tag == 'checkbox'"
                                          v-model="
                                            form[type][parentIndex]['value'][
                                              _childIndex
                                            ]['propStyles'][it['prop']]
                                          "
                                          :checked="
                                            checkedButton(
                                              form[type][parentIndex]['value'][
                                                _childIndex
                                              ]['propStyles'],
                                              it.prop
                                            )
                                          "
                                          :true-label="it.trueLabel"
                                          :false-label="it.falseLabel"
                                          class="check-button-default"
                                        >
                                          <i :class="it.icon"></i>
                                        </el-checkbox-button>
                                      </template>
                                    </el-col>
                                  </el-row>
                                </span>
                                <!-- End property -->

                                <el-divider>
                                  <i class="fal fa-pencil-ruler"></i> Style
                                </el-divider>

                                <!-- Font  -->
                                <template
                                  v-for="(it, _key) in fontStyleInputOpts"
                                  :key="_key"
                                >
                                  <span>
                                    {{ it['label'] }}
                                  </span>
                                  <span>
                                    <el-row :gutter="5">
                                      <el-col :span="8">
                                        <el-select
                                          v-model="
                                            form[type][parentIndex]['value'][
                                              _childIndex
                                            ]['styles'][it['prop']]
                                          "
                                          filterable
                                          allow-create
                                          default-first-option
                                          :reserve-keyword="false"
                                          clearable
                                          style="width: 100%"
                                          :placeholder="`${it['placeholder']}`"
                                        >
                                          <el-option
                                            v-for="item in fontFamilyOpts"
                                            :key="item.value"
                                            :label="`${item.label}`"
                                            :value="`${item.value}`"
                                          />
                                        </el-select>
                                      </el-col>
                                      <el-col :span="16">
                                        <template
                                          v-for="(el, _index) in it.details"
                                          :key="`${_key}${_index}subFont`"
                                        >
                                          <el-select
                                            v-if="el.tag == 'select'"
                                            v-model="
                                              form[type][parentIndex]['value'][
                                                _childIndex
                                              ]['styles'][el.prop]
                                            "
                                            filterable
                                            allow-create
                                            default-first-option
                                            :reserve-keyword="false"
                                            clearable
                                            style="margin-right: 4px"
                                            placeholder="Font size"
                                            :class="
                                              el['class'] ? el['class'] : ''
                                            "
                                          >
                                            <template #prefix>
                                              <i :class="el.icon"></i>
                                            </template>
                                            <el-option
                                              v-for="item in el.option"
                                              :key="item"
                                              :label="`${item}${
                                                el.prop == 'font-size'
                                                  ? 'px'
                                                  : ''
                                              }`"
                                              :value="`${item}${
                                                el.prop == 'font-size'
                                                  ? 'px'
                                                  : ''
                                              }`"
                                            />
                                          </el-select>

                                          <el-checkbox-button
                                            v-if="el.tag == 'checkbox'"
                                            v-model="
                                              form[type][parentIndex]['value'][
                                                _childIndex
                                              ]['styles'][el.prop]
                                            "
                                            :checked="
                                              checkedButton(
                                                form[type][parentIndex][
                                                  'value'
                                                ][_childIndex]['styles'],
                                                el.prop
                                              )
                                            "
                                            :true-label="el.trueLabel"
                                            :false-label="el.falseLabel"
                                            class="check-button-default"
                                          >
                                            <i :class="el.icon"></i>
                                          </el-checkbox-button>
                                        </template>
                                      </el-col>
                                    </el-row>
                                  </span>
                                </template>
                                <!-- End Font -->

                                <!-- Border -->
                                <span> Border </span>
                                <span>
                                  <el-row :gutter="5">
                                    <el-col
                                      v-for="(it, _key) in borderInputOpts"
                                      :key="_key"
                                      :xs="24"
                                      :sm="24"
                                      :md="24"
                                      :lg="8"
                                    >
                                      <el-select
                                        v-model="
                                          form[type][parentIndex]['value'][
                                            _childIndex
                                          ]['styles'][it.prop]
                                        "
                                        style="width: 100%"
                                        placeholder="prop"
                                        clearable
                                        filterable
                                        class="border-select-opt"
                                      >
                                        <template #prefix>
                                          <i :class="`${it['icon']} icon`"></i>
                                          <hr
                                            v-if="
                                              form[type][parentIndex]['value'][
                                                _childIndex
                                              ]['styles'][it.prop]
                                            "
                                            :style="`border-top:${
                                              form[type][parentIndex]['value'][
                                                _childIndex
                                              ]['styles'][it.prop]
                                            };min-width:50px`"
                                          />
                                        </template>
                                        <el-option
                                          v-for="item in opts[it['option']]"
                                          :key="item.value"
                                          :label="item.label"
                                          :value="item.value"
                                        >
                                          <hr
                                            v-if="it['option'] == 'border'"
                                            :style="`border-top:${item.label}`"
                                          />
                                        </el-option>
                                      </el-select>
                                    </el-col>
                                  </el-row>
                                </span>
                                <!-- End Border -->

                                <!-- Other -->
                                <el-row :gutter="10">
                                  <template
                                    v-for="(it, _key) in styleInput"
                                    :key="_key"
                                  >
                                    <el-col :span="12">
                                      <span
                                        style="
                                          width: 100px;
                                          text-align: right;
                                          padding-right: 10px;
                                        "
                                      >
                                        {{ it['label'] }}
                                      </span>
                                      <span>
                                        <el-input
                                          v-if="!it['tag']"
                                          v-model="
                                            form[type][parentIndex]['value'][
                                              _childIndex
                                            ]['styles'][it['prop']]
                                          "
                                          :placeholder="`${it['placeholder']}`"
                                          clearable
                                          class="element"
                                        >
                                        </el-input>
                                        <el-select
                                          v-else
                                          v-model="
                                            form[type][parentIndex]['value'][
                                              _childIndex
                                            ]['styles'][it['prop']]
                                          "
                                          style="width: 100%"
                                          :placeholder="`${it['placeholder']}`"
                                          clearable
                                          filterable
                                          allow-create
                                          :class="`${
                                            it['option'] == 'border'
                                              ? 'border-select-opt'
                                              : ''
                                          }`"
                                        >
                                          <template
                                            v-if="it['option'] == 'border'"
                                            #prefix
                                          >
                                            <i :class="`${it['icon']} icon`" />
                                            <hr
                                              v-if="
                                                form[type][parentIndex][
                                                  'value'
                                                ][_childIndex]['styles'][
                                                  it['prop']
                                                ]
                                              "
                                              :style="`border-top:${
                                                form[type][parentIndex][
                                                  'value'
                                                ][_childIndex]['styles'][
                                                  it['prop']
                                                ]
                                              };width:70px`"
                                            />
                                          </template>
                                          <el-option
                                            v-for="item in opts[it['option']]"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                          >
                                            <hr
                                              v-if="it['option'] == 'border'"
                                              :style="`border-top:${item.label}`"
                                            />
                                          </el-option>
                                        </el-select>
                                      </span>
                                    </el-col>
                                  </template>
                                </el-row>
                                <!-- End other -->
                              </div>
                            </el-collapse-item>
                          </el-collapse>
                        </td>
                      </tr>
                    </table>
                    <!-- class="button-remove" -->
                    <el-button
                      type="danger"
                      size="small"
                      @click="
                        removeChildContent({
                          index: parentIndex,
                          childIndex: _childIndex,
                          type,
                        })
                      "
                    >
                      <template #icon>
                        <i class="fal fa-trash-alt"></i>
                      </template>
                      Remove
                    </el-button>
                  </el-card>
                </template>
              </draggable>
            </template>
          </el-card>
        </el-col>
        <el-col :span="14">
          <ExchangeInvoice
            :visible-print-invoice="true"
            :is-edit="isEdit"
          />
        </el-col>
      </el-row>
    </el-card>
  </el-dialog>
</template>

<style
  lang="scss"
  scoped
>
table > tr > td {
  padding: 3px 0px 3px 0px;
}

.list-title {
  display: inline-block;
  font-size: 14px;
  color: #393a3d;

  .content-panel {
    width: 100% !important;
    padding: 10px 5px 10px 5px;
    line-height: 20px;
    /* border-bottom: 1px solid #f3f3f3; */
    margin-right: 2.5%;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* dialog */
.dialog-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box-card {
  height: calc(100vh - 170px);
  overflow: auto;
}
.el-divider {
  margin: 15px 0px 15px 0px;
}
/* File upload */
.image-uploader {
  :deep(.el-upload) {
    position: relative;
    overflow: unset;
    .btn-delete {
      position: absolute;
      top: -10px;
      right: -30px;
      font-size: 20px;
    }
  }
  :deep(.el-upload-list) {
    display: none;
  }
}

.child-header {
  padding: 10px;
  background: #f7f7f7;
  margin: 10px 0px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .label {
    font-size: 18px;
    font-weight: 400;
  }
}
.child-details {
  cursor: move;
  margin-bottom: 10px;
  position: relative;
  :deep(.button-remove) {
    position: absolute;
    right: 0;
  }
}
.border-select-opt {
  :deep(input) {
    visibility: hidden;
    width: 0px;
  }
  :nth-child(1) {
    color: #303133;
    .icon {
      margin-right: 5px;
      font-size: 18px;
    }
  }
}

.check-button-small {
  margin-right: 5px;
  :deep(span) {
    border: 1px solid #dcdfe6;
    border-radius: 5px !important;
    /* padding: 5px; */
    font-size: 12px;
  }
  :first-child {
    margin-left: 5px;
  }
}

.check-button-default {
  margin-right: 5px;
  :deep(span) {
    border: 1px solid #dcdfe6;
    border-radius: 5px !important;
    /* padding: 7px; */
    /* font-size: 14px; */
  }
}

.opt-line-height {
  :deep(input) {
    visibility: hidden;
    width: 0px;
  }
  :nth-child(1) {
    color: #303133;
    margin: 0px 1px 0px 0px;
  }
}
/* Draggable */
.ghost-class {
  opacity: 0.5;
  background: transparent;
}
</style>
