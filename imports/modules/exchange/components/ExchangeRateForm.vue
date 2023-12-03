<template>
  <el-card shadow="never">
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="large"
    >
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item
            :label="$t('exchange.exchange-rate.TranDate')"
            prop="tranDate"
          >
            <el-date-picker
              v-model="form.tranDate"
              type="datetime"
              format="DD/MM/YYYY hh:mm:ss"
              style="width: 100%"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="$t('exchange.exchange-rate.Provider')"
            prop="providerId"
          >
            <el-select
              v-model="form.providerId"
              filterable
              style="width: 100%"
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

      <!--Sub Items List-->
      <el-tabs type="border-card">
        <el-tab-pane>
          <template #label>
            <i class="el-icon-date" />
            {{ $t('exchange.exchange-rate.Details') }}
          </template>
          <RateDetail
            :items="rateDetailInit"
            :rows="3"
            :min-row="2"
            @item-change="changeRateDetail"
            @submit-form="submitRateDetailForm"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- Button -->
      <el-form-item
        class="ra-text-right"
        style="margin-top: 10px"
      >
        <submit-button
          v-if="!showId"
          :disabled="!$userIsInRole(['exchange-rate-insert'])"
          :tran-date="form.tranDate"
          type="primary"
          @click="submit('insert')"
        >
          <template #icon>
            <i class="fal fa-save fa-lg" />
          </template>
          {{ $t('app.btn.save') }}
        </submit-button>

        <submit-button
          v-if="showId && !activeRate"
          :disabled="!$userIsInRole(['exchange-rate-update'])"
          :tran-date="form.tranDate"
          :first-show-tran-date="firstShowTranDate"
          type="primary"
          @click="submit('update')"
        >
          <template #icon>
            <i class="fal fa-save fa-lg" />
          </template>
          {{ $t('app.btn.save') }}
        </submit-button>
        <submit-button
          v-if="showId && !activeRate"
          :disabled="!$userIsInRole(['exchange-rate-remove'])"
          type="danger"
          title="Remove"
          @click="remove"
        >
          <template #icon>
            <i class="fas fa-trash-alt fa-lg" />
          </template>
          {{ $t('app.btn.delete') }}
        </submit-button>
        <el-button
          type="default"
          title="Cancle"
          @click="cancel()"
        >
          <template #icon>
            <i class="fal fa-undo fa-lg" />
          </template>
          {{ $t('app.btn.cancel') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'
import wrapperCurrentTime from '/imports/client/lib/wrap-current-time'

// Methods
import { fetchProviders } from '../api/providers/methods'
import { findRateDeialLengths } from '../api/transaction/methods'
import {
  findExchangeRateById,
  insertExchangeRate,
  updateExchangeRate,
  removeExchangeRateById,
} from '../api/exchange-rates/methods'
import { findSettingById } from '../api/settings/methods'

// Components
import RateDetail from './RateDetails.vue'
import {
  ElForm,
  ElFormItem,
  ElButton,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElDatePicker,
  ElTabs,
  ElTabPane,
  ElCard,
} from 'element-plus'
export default {
  name: 'ExchangeRateForm',
  components: {
    ElForm,
    ElFormItem,
    ElButton,
    ElSelect,
    ElOption,
    ElRow,
    ElCol,
    ElDatePicker,
    ElTabs,
    ElTabPane,
    ElCard,
    RateDetail,
  },
  mixins: [removeMixin],
  props: {
    formType: {
      type: String,
      default: 'New',
    },
    showNewExhangeDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // const _id = this.updateDoc && this.updateDoc._id
    // const validateName = (rule, value, callback) => {
    //   if (value) {
    //     findExchangeRateById
    //       .callPromise({
    //         selector: {
    //           _id: {
    //             $ne: _id,
    //           },
    //           name: value,
    //         },
    //       })
    //       .then((result) => {
    //         if (result) {
    //           callback(new Error('Name exist'))
    //         } else {
    //           callback()
    //         }
    //       })
    //       .catch((err) => {
    //         this.$store.dispatch('app/messageE', err)
    //       })
    //   }
    // }
    return {
      showId: this.$route.params.id,
      providerOpts: [],
      rateDetailInit: [],
      rateDetails: [],
      loading: false,
      validRateDetail: false,
      firstShowTranDate: moment().toDate(),
      form: {
        tranDate: moment().toDate(),
        providerId: '',
        branchId: '',
      },
      activeRate: null,
      rules: {
        providerId: [
          {
            required: true,
            message: 'Provider is required',
            trigger: 'blur',
          },
        ],
        tranDate: [{ required: true, message: 'Date is required' }],
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },
  watch: {
    showId: {
      immediate: true,
      handler: function (val) {
        const type = this.$route.params.type
        if (type == 'update') {
          this.checkRateDetailInTransaction()
        }
      },
      deep: true,
    },
    // watch dialog if close or not
    showNewExhangeDialog: {
      handler(val) {
        if (val === false) {
          this.resetForm()
          this.rateDetailInit = []
        }
      },
    },
    // Change branchId
    currentBranchId(val) {
      if (val) {
        this.getProvider()
        this.getDefaultSetting()
      }
    },
  },
  // activated() {
  //   if (this.currentBranchId && !this.showId) {
  //     this.getDefaultSetting()
  //   }

  //   this.getProvider()
  // },
  created() {
    if (this.showId) {
      this.getDataUpdate()
    }
    if (this.currentBranchId && !this.showId) {
      this.getDefaultSetting()
    }

    this.getProvider()
  },
  methods: {
    getDefaultSetting() {
      this.loading = true
      const selector = {
        branchId: this.currentBranchId,
      }
      findSettingById
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            this.form.providerId = result.providerId
          }
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    checkRateDetailInTransaction() {
      findRateDeialLengths.callPromise({ _id: this.showId }).then((result) => {
        this.activeRate = result.length
        // console.log(result.length)
        // console.log(result)
      })
    },
    submitRateDetailForm(valid) {
      this.validRateDetail = valid
    },
    changeRateDetail(result, opts) {
      const { total } = opts
      this.rateDetails = result

      // this.accountDetails = result
    },
    // Get data
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
          // console.log(result)
          this.loading = false
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    cancel() {
      this.$emit('reloadExchangeRate')
    },
    getDataUpdate() {
      this.loading = true
      findExchangeRateById
        .callPromise({ _id: this.showId })
        .then((result) => {
          // Journal
          this.form = result.doc
          this.rateDetails = result.details
          this.firstShowTranDate = result.doc.tranDate
          // Details
          this.rateDetailInit = result.details
        })
        .catch((error) => {
          this.$store.dispatch('app/messageE', error)
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit(tranType) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = false

          this.form.branchId = this.currentBranchId
          this.form.tranDate = wrapperCurrentTime(this.form.tranDate)
          if (this.rateDetails.length > 0) {
            // Check form type
            if (tranType == 'insert') {
              this.insertData()
            } else {
              this.updateData()
            }
            this.cancel()
          } else {
            this.$store.dispatch('app/messageE', `Exchange Rate is empty`)
          }
        } else {
          return false
        }
      })
    },
    insertData() {
      insertExchangeRate
        .callPromise({ doc: this.form, details: this.rateDetails })
        .then((result) => {
          if (result) {
            this.rateDetailInit = []
            this.loading = false
            Notify.success({ message: 'Success' })
            this.resetForm()
          }
        })
        .catch((err) => {
          this.loading = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    updateData() {
      updateExchangeRate
        .callPromise({ doc: this.form, details: this.rateDetails })
        .then((result) => {
          if (result) {
            this.cancel()
            this.loading = false
            this.$store.dispatch('app/messageS', `Exchange Rate update`)
            // this.resetForm()
            this.handleModalClose()
          }
        })
        .catch((err) => {
          this.loading = false
          this.$store.dispatch('app/messageE', err)
        })
    },
    remove() {
      this.$store
        .dispatch('app/confirm', {
          messageType: 'Delete',
          item: 'Exchange Rate',
        })
        .then(() => {
          this.loading = true
          removeExchangeRateById
            .callPromise({ _id: this.showId })
            .then((res) => {
              this.loading = false
              this.cancel()
              this.$store.dispatch(
                'app/messageS',
                `Exchange Rate ${this.form.name} deleted`
              )
            })
            .catch((err) => {
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },

    resetForm() {
      this.$refs['form'].resetFields()
      this.firstShowTranDate = ''
      this.getDefaultSetting()
    },
    handleModalClose() {
      this.$emit('modal-close')
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
