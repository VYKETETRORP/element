<template>
  <div>
    <!--FORM-->
    <el-form
      ref="form"
      :inline="true"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="Category" prop="categoryId">
        <el-select v-model="form.categoryId" clearable placeholder="All">
          <el-option
            v-for="item in categoryOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Report date" prop="reportDate">
        <el-date-picker
          v-model="form.reportDate"
          :shortcuts="pickerOpts"
          type="daterange"
          format="DD/MM/YYYY"
          start-placeholder="Start Date"
          end-placeholder="End Date"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">
          <template #icon>
            <i class="fa fa-search" />
          </template>
          Submit
        </el-button>
      </el-form-item>
    </el-form>

    <!--REPORT Layout-->
    <report-layout
      :paper-size="paperSize"
      :export-csv="exportCSV"
      :css-text="cssText"
    >
      <!--REPORT HEADER-->
      <template #header>
        <div class="report-name">
          {{ reportName }}
        </div>
        <div class="report-period">
          {{ reportDate }}
        </div>
      </template>

      <!--REPORT FILTER-->
      <template #filter>
        <el-row :gutter="10">
          <el-col class="colspan-8">
            <span class="title">Category:</span> {{ categoryFilter }}
          </el-col>
          <el-col class="colspan-8">
            <span class="title">Filter2:</span>
          </el-col>
          <el-col class="colspan-8">
            <span class="title">Filter3:</span>
          </el-col>
        </el-row>
      </template>

      <!--REPORT CONTENT-->
      <div v-loading="loading">
        <table class="table-content">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>ID</th>
              <th>Title</th>
              <th>Body</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(doc, index) in reportData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ $filters.date(doc.postDate) }}</td>
              <td>{{ doc._id }}</td>
              <td>{{ doc.title }}</td>
              <td>{{ doc.body }}</td>
              <td>{{ doc.categoryDoc.name }}</td>
              <td>{{ doc.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <template #footer>
        <el-row :gutter="10">
          <el-col class="colspan-8">
            <span class="title">SUBTOTAL:</span>
          </el-col>
          <el-col class="colspan-8">
            <span class="title">DISCOUNT:</span>
          </el-col>
          <el-col class="colspan-8">
            <span class="title">TOTAL:</span>
          </el-col>
        </el-row>
      </template>
    </report-layout>
  </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'

import Notify from '/imports/client/lib/notify'
import { dateRangePickerOpts } from '/imports/client/lib/date-picker-opts'
import wrapCurrentTime from '/imports/client/lib/wrap-current-time'

// Report Layout
import ReportLayout from '/imports/client/layouts/ReportLayout.vue'

import { lookupCategory } from '../../api/lookups/category'
import { reportPost } from '../../api/reports/post'

export default {
  name: 'DemoPostReport',
  components: { ReportLayout },
  data() {
    return {
      // Form
      categoryOpts: [],
      pickerOpts: dateRangePickerOpts,
      form: {
        categoryId: '',
        reportDate: [moment().toDate(), moment().toDate()],
      },
      rules: {
        reportDate: [{ required: true, message: 'Date is required' }],
      },

      // Report
      loading: false,
      paperSize: 'a4-p',
      reportName: 'Post Report',
      reportData: [],
      exportCSV: {
        data: this.reportData,
        fields: [
          { label: 'ID', value: '_id' },
          { label: 'Date', value: 'postDate' },
          { label: 'Title', value: 'title' },
          { label: 'Body', value: 'body' },
          { label: 'Category', value: 'categoryId' },
          { label: 'Status', value: 'status' },
        ],
        fileName: 'Post',
      },
      cssText: ``,
    }
  },
  computed: {
    reportDate() {
      const period = `${moment(this.form.reportDate[0]).format('DD/MM/YYYY')} 
                  To ${moment(this.form.reportDate[1]).format('DD/MM/YYYY')}
                `
      return period
    },
    categoryFilter() {
      let data = _.find(this.categoryOpts, { value: this.form.categoryId })
      return data && data.label
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

          // Pick doc
          this.form.reportDate = wrapCurrentTime(this.form.reportDate)

          reportPost
            .callPromise(this.form)
            .then((result) => {
              this.reportData = result
              this.loading = false
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
  },
}
</script>

<style lang="scss" scoped>
// @import './imports/client/styles/report.scss';
</style>
