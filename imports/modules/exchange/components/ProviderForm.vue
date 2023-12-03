<template>
  <div>
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
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span
        slot="footer"
        style="float: right"
      >
        <submit-button
          v-if="formType === 'Edit'"
          :disabled="!$userIsInRole(['provider-update'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-else
          :disabled="!$userIsInRole(['provider-insert'])"
          type="primary"
          @click="submitFrom"
        >
          <!-- Save -->
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-if="formType === 'Edit' && activePro == 0"
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
  </div>
</template>

<script>
import _ from 'lodash'
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'

// Methods
import {
  findProviderById,
  insertProvider,
  updateProvider,
  removeProviderById,
} from '../api/providers/methods'
import { findProviderLengths } from '../api/exchange-rates/methods'

// Components
// import { Dialog, Form, FormItem, Input, Button, Row, Col } from 'element-plus'
import SubmitButton from '../../../client/components/SubmitButton.vue'
export default {
  name: 'ProviderForm',
  components: {
    SubmitButton,
    // [Dialog.name]: Dialog,
    // [Form.name]: Form,
    // [FormItem.name]: FormItem,
    // [Input.name]: Input,
    // [Button.name]: Button,
    // [Row.name]: Row,
    // [Col.name]: Col,
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
      form: {
        name: '',
        memo: '',
      },
      activePro: 0,
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
          this.checkProviderInExRate()
        }
      },
      deep: true,
    },
  },
  methods: {
    checkProviderInExRate() {
      const _id = _.pick(this.form, ['_id'])
      findProviderLengths.callPromise(_id).then((result) => {
        this.activePro = result
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

          removeProviderById
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
      // this.$emit('modal-close')
      this.resetForm()
      this.$emit('form-change')
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
