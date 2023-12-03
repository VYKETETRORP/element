<template>
  <div>
    <el-form
      ref="form"
      v-loading="loading"
      label-position="top"
      :model="form"
      :rules="rules"
      label-width="100px"
      :size="formSize"
    >
      <el-row :gutter="10">
        <el-col
          :sm="12"
          :md="8"
          :lg="8"
        >
          <el-form-item
            :label="$t('exchange.default.customer')"
            prop="defaultCustomerId"
          >
            <el-select
              v-model="form.customerId"
              :loading="loadingCustomer"
              :remote-method="remoteMethod"
              style="width: 100%"
              filterable
              remote
              clearable
              @focus="focusMethod"
            >
              <el-option
                v-for="customer in customerOpts"
                :key="customer.value"
                :label="customer.label"
                :value="customer.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :sm="12"
          :md="8"
          :lg="8"
        >
          <el-form-item
            :label="$t('exchange.default.employee')"
            prop="defaultEmployeeId"
          >
            <el-select
              v-model="form.employeeId"
              filterable
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in employeeOpts"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :sm="12"
          :md="8"
          :lg="8"
        >
          <el-form-item
            :label="$t('exchange.default.provider')"
            prop="defaultProviderId"
          >
            <el-select
              v-model="form.providerId"
              filterable
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in providerOpts"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col
          :sm="12"
          :md="8"
          :lg="8"
        >
          <el-form-item
            label="Default Tran Type"
            prop="tranTypeId"
          >
            <el-select
              v-model="form.tranTypeId"
              filterable
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in tranTypeOpts"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          :sm="12"
          :md="8"
          :lg="8"
        >
          <el-form-item
            label="Default Currency"
            prop="currencyId"
          >
            <el-select
              v-model="form.currencyId"
              filterable
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="item in currencyOpts"
                :key="item._id"
                :label="item.name"
                :value="item._id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- Button -->
      <el-form-item
        class="ra-text-right"
        style="margin-top: 10px"
      >
        <!-- Update -->
        <submit-button
          v-if="formType === 'Edit'"
          :tran-date="currentDate"
          type="primary"
          @click="submitFrom"
        >
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <!-- Save -->
        <submit-button
          v-else
          :tran-date="currentDate"
          type="primary"
          @click="submitFrom"
        >
          {{ $t('exchange.btn.save') }}
        </submit-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Notify from '/imports/client/lib/notify'
import moment from 'moment'
import _ from 'lodash'
// Methods
import { lookupCustomer } from '../api/customers/methods'
import { findEmployees } from '../../../api/employees/methods'
import { fetchProviders } from '../api/providers/methods'
import {
  insertSetting,
  updateSetting,
  findSettingById,
} from '../api/settings/methods'

// Components
import {
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
} from 'element-plus'
import SubmitButton from '../../../client/components/SubmitButton.vue'

export default {
  name: 'Advance',
  components: {
    SubmitButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
  },
  data() {
    return {
      currentDate: moment().toDate(),
      loading: false,
      loadingCustomer: false,
      formType: 'New',
      formSize: 'large',
      form: {
        customerId: '',
        employeeId: '',
        providerId: '',
        branchId: '',
        tranTypeId: '',
        currencyId: '',
      },
      customerOpts: [],
      employeeOpts: [],
      providerOpts: [],
      tranTypeOpts: [],
      rules: {},
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    currencyOpts() {
      let data = this.$store.getters['exchange/currencies']
      // Sort A-Z
      data = data.sort((a, b) => a.order - b.order)
      return data
    },
  },
  watch: {
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getEmployee()
        this._getCustomerData()
        this.getProvider()
        this.getDefaultSetting()
        store.dispatch('exchange/getCurrencies')
      }
    },
  },
  created() {
    this.getDefaultSetting()

    this.getEmployee()
    this._getCustomerData()
    this.getProvider()
    this.getTranTypeOpts()
    this.$store.dispatch('exchange/getCurrencies')
  },

  methods: {
    getTranTypeOpts() {
      Meteor.call('ex.fetchTranTypes', {}, (err, res) => {
        if (err) {
          Notify.error({ message: err.reason || err })
        } else {
          this.tranTypeOpts = res
        }
      })
    },
    getDefaultSetting() {
      this.loading = true
      const selector = {
        branchId: this.currentBranchId,
      }
      findSettingById
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.form = { ...this.form, ...result }
            this.formType = 'Edit'
          } else {
            this.resetForm()
          }

          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    focusMethod(event) {
      const result = event.target.value.split('|')
      this.remoteMethod(result[0].trim())
    },
    remoteMethod(query, type) {
      this._getCustomerData(query, type)
    },
    _getCustomerData(query, type) {
      this.loadingCustomer = true
      const exp = new RegExp(query)
      const selector = {
        branchId: this.currentBranchId,
        $or: [
          { _id: query },
          { name: { $regex: exp, $options: 'i' } },
          { refNo: { $regex: exp, $options: 'i' } },
          { telephone: { $regex: exp, $options: 'i' } },
          { locationName: { $regex: exp, $options: 'i' } },
        ],
      }
      lookupCustomer
        .callPromise({ selector })
        .then((result) => {
          this.customerOpts = result
          // if (type === 'update') {
          //   this.handleCustomerChange(query)
          // }
          this.loadingCustomer = false
        })
        .catch((err) => {
          this.customerOpts = []
          this.loadingCustomer = false
          Notify.error({ message: err })
        })
    },
    getEmployee() {
      this.loading = true
      const selector = {}
      if (this.currentBranchId) selector.branchId = this.currentBranchId
      findEmployees
        .callPromise({ selector })
        .then(async (result) => {
          this.employeeOpts = result.data
          if (!this.form.employeeId) this.form.employeeId = result.selected

          this.loading = false
        })
        .catch((error) => {
          console.log(error)
          this.loading = false
          this.$store.dispatch('app/messageE', error)
        })

      this.loading = false
    },
    getProvider() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchProviders
        .callPromise({ selector })
        .then((result) => {
          this.providerOpts = result
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
      this.loading = false
    },
    submitFrom() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.branchId = this.currentBranchId
          // Check form type
          if (this.formType === 'New') {
            insertSetting
              .callPromise(this.form)
              .then((result) => {
                if (result) {
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
            const doc = _.pick(this.form, [
              '_id',
              'customerId',
              'employeeId',
              'providerId',
              'tranTypeId',
              'currencyId',
              'branchId',
            ])
            updateSetting
              .callPromise(doc)
              .then((result) => {
                if (result) {
                  this.loading = false
                  this.$store.dispatch('app/messageS', `Setting saved`)
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
    resetForm() {
      this.form.customerId = ''
      this.form.employeeId = ''
      this.form.providerId = ''
      this.formType = 'New'
      delete this.form._id
      delete this.form.__v
    },
  },
}
</script>

<style></style>
