<template>
  <div>
    <el-dialog
      :model-value="visible"
      :before-close="handleModalClose"
      title="Edit Post"
    >
      <el-form
        v-loading="loading"
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="Branch ID" prop="branchId">
              <el-select v-model="form.branchId" disabled>
                <el-option
                  v-for="item in allowedBranchOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Date" prop="postDate">
              <el-date-picker
                v-model="form.postDate"
                format="DD/MM/YYYY"
                type="date"
              />
            </el-form-item>

            <el-form-item label="Category" prop="categoryId">
              <el-select v-model="form.categoryId">
                <el-option
                  v-for="item in categoryOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Title" prop="title">
              <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="Body" prop="body">
              <el-input v-model="form.body" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Status" prop="status">
              <el-select v-model="form.status">
                <el-option
                  v-for="item in statusOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Memo" prop="memo">
              <el-input v-model="form.memo" type="teßxtarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <span>
          <el-button type="primary" @click="submitForm">Save</el-button>
          <el-button @click="handleModalClose">Cancel</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'

import Msg from '/imports/client/lib/message'
import Notify from '/imports/client/lib/notify'
import wrapCurrentTiem from '/imports/client/lib/wrap-current-time'

// Lookup
import { lookupCategory } from '../../api/lookups/category'
import Lookup from '../lib/lookup-value'

import { updatePost } from '../../api/posts/methods'

export default {
  name: 'DemoPostEdit',
  props: {
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
    return {
      loading: false,
      categoryOpts: [],
      statusOpts: Lookup.status,
      form: this.updateDoc,
      rules: {
        postDate: [{ required: true, message: 'Date is required' }],
        categoryId: [{ required: true, message: 'Category is required' }],
        title: [{ required: true, message: 'Title is required' }],
        body: [{ required: true, message: 'Body is required' }],
        status: [{ required: true, message: 'Status is required' }],
      },
    }
  },
  computed: {
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    allowedBranchOpts() {
      return this.$store.getters['app/allowedBranchOpts']
    },
  },
  mounted() {
    this.getCategoryOpts()
  },
  methods: {
    getCategoryOpts() {
      lookupCategory
        .callPromise({})
        .then((result) => {
          if (result) {
            this.categoryOpts = result
          }
        })
        .catch((error) => {
          Notify.error({ message: error })
        })
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true

          // Pick data
          const doc = _.pick(this.form, [
            '_id',
            'postDate',
            'categoryId',
            'title',
            'body',
            'status',
            'memo',
            'branchId',
          ])
          doc.postDate = wrapCurrentTiem(doc.postDate)

          updatePost
            .callPromise(doc)
            .then((result) => {
              if (result) {
                this.loading = false
                Msg.success()
                this.handleModalClose()
              }
            })
            .catch((error) => {
              this.loading = false
              Notify.error({ message: error })
            })
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.$refs['form'].resetFields()
    },
    handleCancel() {
      this.$router.push({ name: 'demo.post' })
    },
    handleModalClose() {
      this.$emit('modal-close')
    },
  },
}
</script>

<style lang="scss" scoped></style>
