<template>
  <div>
    <el-form
      ref="form"
      label-position="right"
      label-width="100px"
      :model="form"
      :rules="rules"
      :loading="loading"
      size="large"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="$t('exchange.customer.name')"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item :label="$t('exchange.customer.telephone')">
            <el-input v-model="form.telephone" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="$t('exchange.customer.address')">
            <el-input
              v-model="form.address"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 4 }"
              label="Address"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <submit-button
          v-if="showId"
          :disabled="!$userIsInRole(['customer-update'])"
          type="primary"
          size="small"
          @click="handleSave"
        >
          {{ $t('exchange.btn.update') }}
        </submit-button>
        <submit-button
          v-else
          :disabled="!$userIsInRole(['customer-insert'])"
          type="primary"
          size="small"
          @click="handleSave"
        >
          {{ $t('exchange.btn.save') }}
        </submit-button>
        <submit-button
          v-if="showId && activeCus == 0"
          :disabled="!$userIsInRole(['customer-remove'])"
          type="danger"
          size="small"
          @click="handleRemove"
        >
          {{ $t('exchange.btn.delete') }}
        </submit-button>
        <el-button
          size="small"
          @click="
            () => {
              $emit('save', 'cancel')
            }
          "
        >
          {{ $t('exchange.btn.cancel') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import Notify from '/imports/client/lib/notify'
import {
  findCustomerById,
  insertCustomer,
  updateCustomer,
  removeCustomerById,
} from '../api/customers/methods'
import { findCustomerLengths } from '../api/transaction/methods'
// Component
// import { Row, Col, Button, Form, FormItem, Input } from 'element-plus'
import SubmitButton from '../../../client/components/SubmitButton.vue'
export default {
  name: 'CustomerForm',
  components: {
    SubmitButton,
    // [Row.name]: Row,
    // [Col.name]: Col,
    // [Button.name]: Button,
    // [Form.name]: Form,
    // [FormItem.name]: FormItem,
    // [Input.name]: Input,
  },

  props: {
    showId: {
      type: String,
      default: () => {
        return ''
      },
    },
  },

  data() {
    return {
      form: {
        name: '',
        telephone: '',
        address: '',
      },
      activeCus: 0,
      loading: false,
      rules: {
        name: [{ required: true }],
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
      handler(val) {
        //For update
        if (val) {
          this.getData()
          this.checkCustomerInTransaction()
        }
      },
      immediate: true,
    },
    // activeCus: {
    //   handler(val) {
    //     //For update
    //     if (val) this.getData()
    //   },
    //   immediate: true,
    // },
  },
  // mounted() {
  //   this.checkCustomerInTransaction()
  // },
  methods: {
    checkCustomerInTransaction() {
      findCustomerLengths.callPromise({ _id: this.showId }).then((result) => {
        this.activeCus = result
      })
    },
    getData() {
      this.loading = true
      findCustomerById
        .callPromise({ _id: this.showId })
        .then((res) => {
          if (res) {
            this.form = res
          }
          this.loading = false
        })
        .catch((err) => {
          console.log(err)
          Notify.error({ message: err.reason || err })
        })
    },

    // Submit
    handleSave() {
      this.loading = true
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let methodName = insertCustomer
          if (this.showId) methodName = updateCustomer

          this.form.branchId = this.currentBranchId

          methodName
            .callPromise(this.form)
            .then((res) => {
              this.loading = false
              if (this.showId) {
                delete this.form._id
                this.$emit('save', 'remove')
              }
              this.form.res
              Notify.success({ message: 'Success' })
              this.resetForm()
            })
            .catch((err) => {
              this.loading = false
              console.log('err', err)
              Notify.error({ message: err.reason || err })
            })
        } else {
          this.loading = false
          console.log('false')
        }
      })
    },
    handleRemove() {
      removeCustomerById
        .callPromise({ _id: this.showId })
        .then((res) => {
          this.loading = false
          this.$emit('save', 'remove')
          Notify.success({ message: 'Success' })
          this.resetForm()
        })
        .catch((err) => {
          this.loading = false
          console.log('err', err)
          Notify.error({ message: err.reason || err })
        })
    },
    resetForm() {
      this.$refs['form'].resetFields()
    },
  },
}
</script>
