<template>
  <div>
    <!--Form-->
    <fieldset class="ra-fieldset">
      <legend>{{ form._id ? 'Edit' : 'New' }}</legend>

      <el-form
        ref="refForm"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item
              :label="$t('exchange.customer-setting-provider.Name')"
              prop="name"
            >
              <el-input
                ref="name"
                v-model="form.name"
                :size="formSize"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-button
              type="primary"
              @click="submitFrom"
            >
              {{ $t('exchange.btn.save') }}
            </el-button>
            <el-button
              v-if="form._id"
              type="danger"
              @click="remove"
            >
              {{ $t('exchange.btn.delete') }}
            </el-button>
            <el-button @click="handleModalClose">
              {{ $t('exchange.btn.cancel') }}
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </fieldset>
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
          <span
            v-if="title.prop === 'name'"
            class="ra-text-link"
            @click="edit(scope.row)"
          >
            {{ scope.row.name }}
          </span>
          <span v-else>
            {{ scope.row[title.prop] }}
          </span>
        </template>
      </el-table-column>
    </data-tables>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { Meteor } from 'meteor/meteor'
import Notify from '/imports/client/lib/notify'
import { useStore } from '/imports/store'
// Methods
import { checkTranTypeExist } from '/imports/modules/exchange/api/transaction-types/methods'
// Components
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElRow,
  ElCol,
} from 'element-plus'
import DataTables from '/imports/client/components/DataTables.vue'
import { onMounted, ref } from 'vue'

const store = useStore()
const validateName = (rule: any, value: any, callback: any) => {
  if (value) {
    const selector: any = {
      name: value,
    }
    if (form.value._id)
      selector._id = {
        $ne: form.value._id,
      }
    checkTranTypeExist
      .callPromise({
        selector,
      })
      .then((result: any) => {
        if (result) {
          callback(new Error('Name exist'))
        } else {
          callback()
        }
      })
      .catch((err: any) => {
        store.dispatch('app/messageE', err)
      })
  }
}
const refForm = ref()
const loading = ref(false)
const formSize = ref('large')
const tableData = ref([])
const form = ref<any>({
  name: '',
})
const rules = ref({
  name: [
    {
      required: true,
      message: 'Name is required',
      // trigger: 'blur',
    },
    {
      validator: validateName,
      trigger: 'blur',
    },
  ],
})
const tableTitles = ref([
  {
    prop: 'name',
    label: `Name`,
  },
])
const tableFilters = ref([
  {
    prop: ['name'],
    value: '',
  },
])
const tableProps = ref({ height: `calc(100vh - 387px)` })

// const currentBranchId = computed(()=>{
//     return store.getters['app/currentBranchId']
// })

// Get data
const getData = () => {
  loading.value = true
  // Selector

  Meteor.call('ex.fetchTranTypes', {}, (err: any, res: any) => {
    if (err) {
      Notify.error({ message: err.reason || err })
    } else {
      tableData.value = res
    }
    loading.value = false
  })
}

const submitFrom = () => {
  loading.value = true
  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      loading.value = false
      return false
    }

    let methodName = 'ex.insertTranType'
    if (form.value._id) methodName = 'ex.updateTranType'
    const doc: any = { name: form.value.name }
    if (form.value._id) doc._id = form.value._id
    Meteor.call(methodName, { doc }, (err: any, res: any) => {
      if (err) {
        store.dispatch('app/messageE', err.reason || err)
      } else {
        store.dispatch('app/messageS', 'Success.')
        resetForm()
        getData()
      }

      loading.value = false
    })
  })
}
const remove = () => {
  store
    .dispatch('app/confirm', {
      messageType: 'Delete',
      item: form.value.name,
    })
    .then(() => {
      loading.value = true
      Meteor.call(
        'ex.removeTranTypeById',
        { id: form.value._id },
        (err: any, res: any) => {
          if (err) {
            store.dispatch('app/messageE', err.reason || err)
          } else {
            store.dispatch('app/messageS', `${form.value.name} deleted`)
            handleModalClose()
          }

          loading.value = false
        }
      )
    })
}
const edit = (row: any) => {
  form.value = { ...row }
}
const resetForm = () => {
  form.value = { name: '' }
}
const handleModalClose = () => {
  resetForm()
  getData()
}

onMounted(() => {
  getData()
})
</script>

<style
  lang="scss"
  scoped
></style>
