<template>
  <div>
    <fieldset class="ra-fieldset">
      <legend>{{ formType }}</legend>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        :inline="true"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="Name" prop="name">
          <el-input ref="name" v-model="form.name" :autofocus="true" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">
            {{ formType }}
          </el-button>
          <el-button
            v-if="formType === 'Update'"
            type="danger"
            @click="_remove"
          >
            Remove
          </el-button>
          <el-button v-if="formType === 'Update'" @click="handleCancel">
            Cancel
          </el-button>
        </el-form-item>
      </el-form>
    </fieldset>
  </div>
</template>

<script>
// Messages
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'

// Mixin
import removeMixin from '/imports/client/mixins/remove'

// Methods
import {
  findOnePaymentMethod,
  insertPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
} from '../../api/payment-methods/methods'
// import { checkPaymentMethodUsed } from '/imports/modules/pos/api/lib/check-payment-method-used'

// Components
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

export default {
  name: 'PosPaymentMethodForm',
  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElInput.name]: ElInput,
    [ElButton.name]: ElButton,
  },
  mixins: [removeMixin],
  props: {
    formType: {
      type: String,
      default: 'New',
    },
    updateDoc: {
      type: Object,
      default: null,
    },
  },
  data() {
    // Check Exist Name
    const validateName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Name is requiered'))
      }
      let selector = {
        name: {
          $regex: new RegExp('^' + value.replace(/%/g, '.*') + '$', 'i'),
        },
      }

      if (this.form._id) {
        selector._id = { $ne: this.form._id }
      }

      findOnePaymentMethod
        .callPromise({ selector })
        .then((result) => {
          if (result) {
            callback(new Error('This name is existed'))
          } else {
            callback()
          }
        })
        .catch((error) => {
          Notify.error({ message: error })
        })
    }

    return {
      form: {
        name: '',
      },
      rules: {
        name: [{ validator: validateName, required: true, trigger: 'blur' }],
      },
    }
  },
  watch: {
    updateDoc(val) {
      if (val) {
        this.form = val
        this.focusForm('name')
      } else {
        this.form = {
          name: '',
        }
      }
    },
  },

  mounted() {
    this.focusForm('name')
  },
  methods: {
    focusForm(refName) {
      this.$refs[refName].$el.querySelector('input').focus()
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form._id) {
            this._updateData(this.form)
          } else {
            this._insertData(this.form)
          }
        } else {
          return false
        }
      })
    },

    // Insert Data
    _insertData(doc) {
      insertPaymentMethod
        .callPromise(doc)
        .then((result) => {
          if (result) {
            Msg.success()
            this.handleCancel()
          }
        })
        .catch((err) => {
          Notify.error({ message: err })
        })
    },

    // Update Data
    _updateData(doc) {
      updatePaymentMethod
        .callPromise(doc)
        .then((result) => {
          if (result) {
            Msg.success()
            this.handleCancel()
          }
        })
        .catch((err) => {
          Notify.error({ message: err })
        })
    },

    _remove() {
      // checkPaymentMethodUsed
      //   .callPromise({ selector: { paymentMethodId: this.updateDoc._id } })
      //   .then(result => {
      //     if (!result) {
      //       this.$_removeMixin({
      //         meteorMethod: removePaymentMethod,
      //         selector: { _id: this.updateDoc._id },
      //         successMethod: 'handleCancel',
      //         loading: 'loading',
      //         // title: row.name,
      //       })
      //     } else {
      //       Notify.warning({
      //         message: 'This record is used other transaction !',
      //       })
      //     }
      //   })
      //   .catch(error => {
      //     // console.log(error)
      //     Notify.error({ message: error })
      //   })
      this.$store
        .dispatch('app/confirm', {
          messageType: 'Delete',
          item: this.form.name,
        })
        .then(() => {
          this.loading = true

          removePaymentMethod
            .callPromise({ _id: this.updateDoc._id })
            .then((res) => {
              this.loading = false
              // this.handleModalClose()
              this.$store.dispatch(
                'app/messageS',
                `Payment Method ${this.form.name} deleted`
              )
              this.handleCancel()
            })
            .catch((err) => {
              console.log(err)
              this.loading = false
              this.$store.dispatch('app/messageE', err)
            })
        })
    },
    resetForm() {
      this.$refs['form'].resetFields()
    },
    handleCancel() {
      this.resetForm()
      this.focusForm('name')
      this.$emit('form-change')
    },
  },
}
</script>

<style scoped></style>
