<template>
  <div>
    <fieldset class="ra-fieldset">
      <legend>{{ formType }}</legend>
      <el-form
        ref="form"
        v-loading="loading"
        label-position="top"
        :model="form"
        :rules="rules"
        label-width="100px"
        :size="formSize"
      >
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.Name')"
              prop="name"
            >
              <el-input
                ref="name"
                v-model="form.name"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.symbol')"
              prop="symbol"
            >
              <el-select
                v-model="form.symbol"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in symbol"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="5">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.Operator')"
              prop="operator"
            >
              <el-select
                v-model="form.operator"
                style="width: 100%"
              >
                <el-option
                  v-for="item in operationOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.toSymbol')"
              prop="toSymbol"
            >
              <el-select
                v-model="form.toSymbol"
                style="width: 100%"
              >
                <el-option
                  v-for="item in symbol"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="6">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.Order')"
              prop="order"
            >
              <el-input-number
                v-model.number="form.order"
                :min="0"
                :controls="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.Base')"
              prop="base"
            >
              <el-checkbox
                v-model="form.base"
                class="element"
              ></el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span
        slot="footer"
        style="float: right"
      >
        <el-tooltip
          v-model="note"
          :hide-after="1"
          placement="left"
          effect="light"
          style="font-size: 14px; font-family: 'Battambang'"
        >
          <template #content>
            <span
              v-for="shortcut in notes"
              :key="shortcut.label"
            >
              <span v-html="shortcut.label"></span>
            </span>
          </template>
          <span>
            Format Note
            <i
              class="el-icon-question question"
              @click="note = !note"
            />
          </span>
        </el-tooltip>

        <submit-button
          v-if="formType === 'Edit'"
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['exchange-currency-update'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.update') }}
        </submit-button>
        <submit-button
          v-else
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['exchange-currency-insert'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-if="formType === 'Edit' && !activeCur"
          :tran-date="currentDate"
          :disabled="!$userIsInRole(['exchange-currency-remove'])"
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
import _ from 'lodash'
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
// Mixin
import dataTablesMixin from '/imports/client/mixins/data-tables'
import softRemoveMixin from '/imports/client/mixins/soft-remove'
import restoreMixin from '/imports/client/mixins/restore'
import removeMixin from '/imports/client/mixins/remove'
// Methods
import {
  fetchExchangeCurrency,
  findExchangeCurrencyById,
  insertExchangeCurrency,
  updateExchangeCurrency,
  removeExchangeCurrencyById,
} from '../api/exchange-currency/methods'
import { findCurrencyLengths } from '../api/exchange-rates/methods'
import escapeRegExp from '../../../api/lib/escapeRegExp'

// Components
import DataTables from '/imports/client/components/DataTables.vue'
import SubmitButton from '../../../client/components/SubmitButton.vue'
import {
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElTooltip,
} from 'element-plus'

export default {
  name: 'ExchangeCurrency',
  components: {
    DataTables,
    SubmitButton,
    ElRow,
    ElCol,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElSelect,
    ElOption,
    ElInputNumber,
    ElTooltip,
  },
  mixins: [dataTablesMixin, softRemoveMixin, restoreMixin, removeMixin],
  data() {
    const validateName = (rule, value, callback) => {
      if (value) {
        const _id = this.updateDoc && this.updateDoc._id
        findExchangeCurrencyById
          .callPromise({
            selector: {
              _id: {
                $ne: _id,
              },
              branchId: this.currentBranchId,
              // name: value,
              name: { $regex: new RegExp(escapeRegExp(value, '$', true), 'i') },
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
      tableData: [],
      formSize: 'large',
      symbol: [
        { label: '៛', value: '៛' },
        { label: '$', value: '$' },
        { label: '฿', value: '฿' },
      ],
      base: true,
      currentDate: moment().toDate(),
      tableTitles: [
        {
          prop: 'name',
          label: `${this.$t('exchange.customer-setting-exCurrency.Name')}`,
        },
        {
          prop: 'symbol',
          label: `${this.$t('exchange.customer-setting-exCurrency.symbol')}`,
        },
        // {
        //   prop: 'fromSymbol',
        //   label: `${this.$t(
        //     'exchange.customer-setting-exCurrency.fromSymbol'
        //   )}`,
        // },
        // {
        //   prop: 'operator',
        //   label: `${this.$t('exchange.customer-setting-exCurrency.Operator')}`,
        // },
        // {
        //   prop: 'toSymbol',
        //   label: `${this.$t('exchange.customer-setting-exCurrency.toSymbol')}`,
        // },

        {
          prop: 'order',
          label: `${this.$t('exchange.customer-setting-exCurrency.Order')}`,
        },
        {
          prop: 'base',
          label: `${this.$t('exchange.customer-setting-exCurrency.Base')}`,
        },
      ],
      tableFilters: [
        {
          prop: ['name'],
          value: '',
        },
      ],
      //form
      operationOpts: [
        { label: 'x', value: 'x' },
        { label: '/', value: '/' },
      ],
      // formatOpts: [
      //   { label: 'Format(2)', value: '2' }, //USD
      //   { label: 'Format(-2)', value: '-2' }, //Khr
      //   { label: 'Format(0)', value: '0' }, //Thb
      // ],
      notes: [
        { label: `1- Format(2) for khr->usd <br/>` },
        { label: `2- Format(2) for thb->usd <br/>` },
        { label: `3- Format(-2) for usd->khr <br/>` },
        { label: `4- Format(-2) for thb->khr <br/>` },
        { label: `5- Format(0) for usd->thb <br/>` },
        { label: `6- Format(0) for khr->thb <br/>` },
      ],
      note: false,
      form: {
        name: '',
        symbol: '',
        // operator: '',
        // fromSymbol: '',
        // toSymbol: '',
        order: 1,
        base: true,
      },
      activeCur: [],
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
        symbol: [
          {
            required: true,
            message: 'Symbol is required',
            trigger: 'blur',
          },
        ],
        // operator: [
        //   {
        //     required: true,
        //     message: 'Operator is required',
        //     trigger: 'blur',
        //   },
        // ],
        // fromSymbol: [
        //   {
        //     required: true,
        //     message: 'From Symbol is required',
        //     trigger: 'blur',
        //   },
        // ],
        // toSymbol: [
        //   {
        //     required: true,
        //     message: 'To Format is required',
        //     trigger: 'blur',
        //   },
        // ],
        order: [
          { required: true, message: 'Order is required', trigger: 'blur' },
        ],
        base: [{ required: false, trigger: 'blur' }],
      },
      // Modal
      currentModal: null,
      modalVisible: false,
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
          this.checkCurrencyInExRate()
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
    this.tableProps.height = `calc(100vh - 435px)`
  },
  mounted() {
    this.getData()
  },
  methods: {
    checkCurrencyInExRate() {
      const _id = _.pick(this.form, ['_id'])
      findCurrencyLengths.callPromise(_id).then((result) => {
        this.activeCur = result
      })
    },
    // Get data
    getData() {
      this.loading = true
      // Selector
      const selector = {
        branchId: this.currentBranchId,
      }
      fetchExchangeCurrency
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

    softRemoveClassName(removed) {
      return removed ? 'soft-remove' : ''
    },

    edit(row) {
      this.formType = 'Edit'
      this.updateDoc = row
    },
    submitFrom() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.form.branchId = this.currentBranchId
          // Check form type
          if (this.formType === 'New') {
            insertExchangeCurrency
              .callPromise(this.form)
              .then((result) => {
                if (result) {
                  this.loading = false
                  this.resetForm()
                  this.getData()
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
              'name',
              'symbol',
              // 'fromSymbol',
              // 'operator',
              // 'toSymbol',
              'base',
              'order',
              'branchId',
            ])
            updateExchangeCurrency
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

          removeExchangeCurrencyById
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
  },
}
</script>

<style
  lang="scss"
  scoped
>
.question {
  color: #e1b731;
  cursor: pointer;
  &:hover {
    color: #dbc479;
  }
}
.element {
  /* margin-top: 10px; */
  margin-left: 15px;
  width: 100%;
}
/* .base {
  margin-left: 10px;
} */
</style>
