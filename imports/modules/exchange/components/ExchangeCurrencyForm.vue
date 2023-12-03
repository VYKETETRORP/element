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
      >
        <el-row :gutter="24">
          <el-col :span="5">
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
          <el-col :span="5">
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
              :label="$t('exchange.customer-setting-exCurrency.Symbol')"
              prop="symbol"
            >
              <el-input
                v-model="form.symbol"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item
              :label="$t('exchange.customer-setting-exCurrency.Format')"
              prop="format"
            >
              <el-select
                v-model="form.format"
                style="width: 100%"
              >
                <el-option
                  v-for="item in formatOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
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
          <div
            v-for="shortcut in notes"
            :key="shortcut.label"
            slot="content"
          >
            <div>{{ shortcut.label }}</div>
          </div>
          <span>Format Note</span>
        </el-tooltip>
        <i
          class="el-icon-question question"
          @click="note = !note"
        />
        <submit-button
          v-if="formType === 'Edit'"
          :disabled="!$userIsInRole(['exchange-currency-update'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-else
          :disabled="!$userIsInRole(['exchange-currency-insert'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-if="formType === 'Edit' && activeCur == 0"
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
  </div>
</template>

<script>
import _ from 'lodash'
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'

// Methods
import {
  findExchangeCurrencyById,
  insertExchangeCurrency,
  updateExchangeCurrency,
  removeExchangeCurrencyById,
} from '../api/exchange-currency/methods'
import { findCurrencyLengths } from '../api/exchange-rates/methods'
import escapeRegExp from '../../../api/lib/escapeRegExp'
// // Components
// import {
//   Row,
//   Col,
//   Dialog,
//   Form,
//   FormItem,
//   Input,
//   Button,
//   Select,
//   Option,
//   InputNumber,
//   Tooltip,
// } from 'element-plus'
import SubmitButton from '../../../client/components/SubmitButton.vue'
export default {
  name: 'ExchangeCurrencyForm',
  components: {
    SubmitButton,
    // [Row.name]: Row,
    // [Col.name]: Col,
    // [Dialog.name]: Dialog,
    // [Form.name]: Form,
    // [FormItem.name]: FormItem,
    // [Input.name]: Input,
    // [Button.name]: Button,
    // [Select.name]: Select,
    // [Option.name]: Option,
    // [InputNumber.name]: InputNumber,
    // [Tooltip.name]: Tooltip,
  },
  mixins: [removeMixin],
  props: {
    formType: {
      type: String,
      default: 'New',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    updateDoc: {
      type: Object,
      default: null,
    },
  },
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
      operationOpts: [
        { label: 'x', value: 'x' },
        { label: '/', value: '/' },
      ],
      formatOpts: [
        { label: 'Format(2)', value: '2' }, //USD
        { label: 'Format(-2)', value: '-2' }, //Khr
        { label: 'Format(0)', value: '0' }, //Thb
      ],
      notes: [
        { label: '1- Format(2) for khr->usd`' },
        { label: '1- Format(2) for thb->usd`' },
        { label: '2- Format(-2) for usd->khr`' },
        { label: '2- Format(-2) for thb->khr`' },
        { label: '3- Format(0) for usd->thb`' },
        { label: '3- Format(0) for khr->thb`' },
      ],
      note: false,
      loading: false,
      form: {
        name: '',
        operator: '',
        symbol: '',
        format: '',
        order: 1,
      },
      activeCur: 0,
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
        operator: [
          {
            required: true,
            message: 'Operator is required',
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
        format: [
          {
            required: true,
            message: 'Format is required',
            trigger: 'blur',
          },
        ],
        order: [
          { required: true, message: 'Order is required', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },
  watch: {
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
  methods: {
    checkCurrencyInExRate() {
      const _id = _.pick(this.form, ['_id'])
      findCurrencyLengths.callPromise(_id).then((result) => {
        this.activeCur = result
      })
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
                  this.handleModalClose()
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
              'operator',
              'symbol',
              'format',
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
                  // this.resetForm()
                  this.handleModalClose()
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
              this.handleModalClose()
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
      this.$refs['form'].resetFields()
    },
    handleModalClose() {
      this.resetForm()
      this.$emit('form-change')
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
</style>
