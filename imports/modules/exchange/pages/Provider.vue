<template>
  <div>
    <!--Form-->
    <fieldset class="ra-fieldset">
      <legend>{{ formType }}</legend>

      <el-form
        ref="form"
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
            <el-form-item
              :label="$t('exchange.customer-setting-provider.Memo')"
              prop="memo"
            >
              <el-input
                v-model="form.memo"
                type="textarea"
                :size="formSize"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- button  -->
      <span
        slot="footer"
        style="float: right"
      >
        <submit-button
          v-if="formType === 'Edit'"
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['provider-update'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-else
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['provider-insert'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- remove -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-if="formType === 'Edit' && activePro == 0"
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['provider-remove'])"
          type="danger"
          @click="remove"
        >
          <!-- Delete -->
          {{ $t('exchange.btn.delete') }}
        </submit-button>
        <el-button @click="handleModalClose">
          <!-- Cancel -->
          {{ $t('exchange.btn.cancel') }}
        </el-button>
      </span>
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

<script>
import Notify from '/imports/client/lib/notify'
import moment from 'moment'
import _ from 'lodash'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'
// Methods
import {
  findProviderById,
  fetchProviders,
  insertProvider,
  updateProvider,
  removeProviderById,
} from '../api/providers/methods'
import { findProviderLengths } from '../api/exchange-rates/methods'

// Components
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElRow,
  ElCol,
} from 'element-plus'
import SubmitButton from '../../../client/components/SubmitButton.vue'
import DataTables from '/imports/client/components/DataTables.vue'

export default {
  name: 'Providers',
  components: {
    DataTables,
    SubmitButton,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElRow,
    ElCol,
  },
  mixins: [dataTablesMixin, softRemoveMixin, restoreMixin, removeMixin],
  data() {
    const validateName = (rule, value, callback) => {
      if (value) {
        const _id = this.updateDoc && this.updateDoc._id
        findProviderById
          .callPromise({
            selector: {
              _id: {
                $ne: _id,
              },
              branchId: this.currentBranchId,
              name: value,
            },
          })
          .then((result) => {
            if (result) {
              callback(new Error('Name exist'))
            } else {
              callback()
            }
          })
          .catch((err) => {
            this.$store.dispatch('app/messageE', err)
          })
      }
    }
    return {
      loading: false,
      formType: 'New',
      formSize: 'large',
      tableData: [],
      form: {
        name: '',
        memo: '',
      },
      activePro: 0,
      currentDate: moment().toDate(),
      rules: {
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
      },
      tableTitles: [
        {
          prop: 'name',
          label: `${this.$t('exchange.customer-setting-provider.Name')}`,
        },
        {
          prop: 'memo',
          label: `${this.$t('exchange.customer-setting-provider.Memo')}`,
        },
      ],
      tableFilters: [
        {
          prop: ['name'],
          value: '',
        },
      ],
      updateDoc: null,
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },
  watch: {
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getData()
      }
    },
    updateDoc: {
      immediate: true,
      handler: function (val) {
        if (this.formType == 'Edit') {
          this.form = val
          this.checkProviderInExRate()
        }
      },
      deep: true,
    },
  },
  created() {
    // Extend data tables props (Mixin)
    this.tableProps.defaultSort = {
      prop: 'order',
      order: 'ascending',
    }
    this.tableProps.height = `calc(100vh - 387px)`
  },
  mounted() {
    this.getData()
  },
  methods: {
    // Get data
    getData() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchProviders
        .callPromise({ selector })
        .then((result) => {
          this.tableData = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },

    checkProviderInExRate() {
      const _id = _.pick(this.form, ['_id'])
      findProviderLengths.callPromise(_id).then((result) => {
        this.activePro = result.length
      })
    },
    submitFrom() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.branchId = this.currentBranchId
          // Check form type
          if (this.formType === 'New') {
            insertProvider
              .callPromise(this.form)
              .then((result) => {
                if (result) {
                  this.getData()
                  this.loading = false
                  Notify.success({ message: 'Success' })
                  this.resetForm()
                }
              })
              .catch((err) => {
                this.loading = false
                this.$store.dispatch('app/messageE', err)
              })
          } else {
            this.form.branchId = this.currentBranchId
            // Pick data
            const doc = _.pick(this.form, ['_id', 'name', 'memo', 'branchId'])
            updateProvider
              .callPromise(doc)
              .then((result) => {
                if (result) {
                  this.loading = false
                  this.$store.dispatch(
                    'app/messageS',
                    `Provider  [${this.form.name}] saved`
                  )
                  this.resetForm()
                  this.getData()
                  // this.formType = 'New'
                }
              })
              .catch((err) => {
                this.loading = false
                this.$store.dispatch('app/messageE', err)
              })
          }
        } else {
          return false
        }
      })
    },
    remove() {
      this.$store
        .dispatch('app/confirm', {
          messageType: 'Delete',
          item: this.form.name,
        })
        .then(() => {
          this.loading = true
          removeProviderById
            .callPromise({ _id: this.updateDoc._id })
            .then((res) => {
              this.loading = false
              this.getData()
              this.resetForm()
              this.$store.dispatch(
                'app/messageS',
                `Provider ${this.form.name} deleted`
              )
            })
            .catch((err) => {
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },
    edit(row) {
      this.updateDoc = row
      this.formType = 'Edit'
    },
    resetForm() {
      delete this.form._id
      delete this.form.__v
      this.$refs['form'].resetFields()
      this.formType = 'New'
      this.updateDoc = null
    },
    handleModalClose() {
      this.resetForm()
      this.getData()
    },

    softRemoveClassName(removed) {
      return removed ? 'soft-remove' : ''
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
