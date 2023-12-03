<template>
  <div>
    <fieldset class="ra-fieldset">
      <legend>{{ formType }}</legend>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        :inline="true"
        label-width="100px"
      >
        <el-form-item label="Ref no." prop="refNo">
          <el-input v-model="form.refNo" :placeholder="refNoLoading">
            <template #append>
              <el-button @click="getNextRefNo">
                <template #icon>
                  <i class="fa fa-barcode" />
                </template>
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input ref="name" v-model="form.name" :autofocus="true" />
        </el-form-item>

        <el-form-item label="Memo" prop="memo">
          <el-input ref="memo" v-model="form.memo" :autofocus="true" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">
            {{ formType }}
          </el-button>
          <el-button v-if="formType === 'Update'" @click="handleCancel">
            Cancel
          </el-button>
        </el-form-item>
      </el-form>
    </fieldset>
    <!-- </el-dialog> -->
  </div>
</template>

<script>
// Message
import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
//  Method
import { validateCategoryExist } from '../../api/validations/category'
import { insertCategory, updateCategory } from '../../api/categories/methods'
// Components
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'

export default {
  name: 'DemoCategoryForm',
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
  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElInput.name]: ElInput,
    [ElButton.name]: ElButton,
  },
  data() {
    // Ref no.
    const validateRefNo = (rule, value, callback) => {
      let selector = { refNo: value }
      // Check update form
      if (this.formType === 'Update') {
        selector._id = { $ne: this.updateDoc._id }
      }

      if (value) {
        validateCategoryExist
          .callPromise({ selector })
          .then((result) => {
            if (result) {
              callback(new Error('Ref no. is exist'))
            } else {
              callback()
            }
          })
          .catch((error) => {
            Notify.error({ message: error })
          })
      }
    }

    // Name
    const validateName = (rule, value, callback) => {
      let selector = { name: value }
      // Check update form
      if (this.formType === 'Update') {
        selector._id = { $ne: this.updateDoc._id }
      }

      if (value) {
        validateCategoryExist
          .callPromise({ selector })
          .then((result) => {
            if (result) {
              callback(new Error('Name exist'))
            } else {
              callback()
            }
          })
          .catch((error) => {
            Notify.error({ message: error })
          })
      }
    }

    return {
      refNoLoading: 'eg. 1',
      form: {
        refNo: '',
        name: '',
        memo: '',
      },
      rules: {
        refNo: [
          // Please disable this rules to use `getNextRefServer`
          { required: true, message: 'Ref no. is required' },
          { validator: validateRefNo, trigger: 'blur' },
        ],
        name: [
          { required: true, trigger: 'blur' },
          { validator: validateName, trigger: 'blur' },
        ],
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
          memo: '',
        }
      }
    },
  },
  mounted() {
    this.focusForm('name')
  },
  methods: {
    getNextRefNo() {},
    focusForm(refName) {
      this.$refs[refName].$el.querySelector('input').focus()
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // Pick doc
          let doc = {
            refNo: this.form.refNo,
            name: this.form.name,
            memo: this.form.memo,
          }

          if (this.formType === 'New') {
            insertCategory
              .callPromise(doc)
              .then((result) => {
                if (result) {
                  this.loading = false
                  Msg.success()
                  this.handleCancel()
                }
              })
              .catch((error) => {
                Notify.error({ message: error })
              })
          } else {
            doc._id = this.form._id
            updateCategory
              .callPromise(doc)
              .then((result) => {
                if (result) {
                  this.loading = false
                  Msg.success()
                  this.handleCancel()
                }
              })
              .catch((error) => {
                Notify.error({ message: error })
              })
          }
        } else {
          return false
        }
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

<style lang="scss" scoped>
// // @import '~imports/client/styles/main.scss';
</style>
