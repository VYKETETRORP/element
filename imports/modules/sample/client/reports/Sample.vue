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
      <el-form-item label="Department" prop="department">
        <el-select
          v-model="form.department"
          :placeholder="departmentLoading"
          clearable
          multiple
          style="width: 300px"
        >
          <el-option
            v-for="item in departmentOpts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
            <span class="title"> Department: </span> {{ departmentFilter
            }}<br />
            <span class="title"> Department: </span> {{ departmentFilter }}
          </el-col>
          <el-col class="colspan-8">
            <span class="title"> Filter: </span>...<br />
            <span class="title"> Filter: </span>...
          </el-col>
          <el-col class="colspan-8">
            <span class="title"> Filter: </span>...<br />
            <span class="title"> Filter: </span>...
          </el-col>
        </el-row>
      </template>

      <!--REPORT CONTENT-->
      <div v-loading="loading">
        <table class="table-content">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th class="text-right">Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(doc, index) in reportData" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ doc.code }}</td>
              <td>{{ doc.name }}</td>
              <td>{{ doc.department }}</td>
              <td class="text-right">
                {{ $filters.currency(doc.salary) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <template #footer>
        <el-row :gutter="10">
          <el-col class="colspan-8">
            <span class="title css-custom"> SUBTOTAL: </span>...<br />
            <span class="title css-custom"> SUBTOTAL: </span>...
          </el-col>
          <el-col class="colspan-8">
            <span class="title css-custom"> DISCOUNT: </span>...<br />
            <span class="title css-custom"> DISCOUNT: </span>...
          </el-col>
          <el-col class="colspan-8">
            <span class="title css-custom"> TOTAL: </span>...<br />
            <span class="title css-custom"> TOTAL: </span>...
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

// Report Layout
import ReportLayout from '/imports/client/layouts/ReportLayout.vue'

import { reportSample } from '../../api/reports/sample'

export default {
  name: 'DemoSampleReport',
  components: { ReportLayout },
  data() {
    return {
      // Form
      departmentLoading: '-- All --',
      departmentOpts: [],
      form: {
        department: [],
      },
      rules: {
        //                    departmentId: [
        //                        {required: true, message: 'Code is required'},
        //                    ],
      },

      // Report
      loading: false,
      paperSize: 'a4-p',
      reportName: 'Sample Report',
      reportData: [],
      exportCSV: {
        data: this.reportData,
        fields: [
          { label: 'Code', value: 'code' },
          { label: 'Name', value: 'name' },
          { label: 'Gender', value: 'gender' },
          { label: 'Department', value: 'department' },
          { label: 'Telephone', value: 'telephone' },
          { label: 'Salary', value: 'salary' },
        ],
        fileName: 'Sample',
      },
      // Add custom css style
      cssText: `
          .css-custom { color: red }
          .custom-kh { font-family: 'Moul' }
        `,
    }
  },
  computed: {
    reportDate() {
      return moment().format('DD-MM-YYYY')
    },
    departmentFilter() {
      let data = _.filter(this.departmentOpts, (o) => {
        return _.includes(this.form.department, o.value)
      })
      let list = _.map(data, 'label')

      return list
    },
  },
  mounted() {
    this.getDepartment()
  },
  methods: {
    getDepartment() {
      this.departmentLoading = 'Loading...'

      // Call meteor method
      this.departmentOpts = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Finance', value: 'Finance' },
        { label: 'IT', value: 'IT' },
      ]
      this.departmentLoading = 'Select All'
    },
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true

          // Selector
          let selector = this.form.department
          reportSample
            .callPromise({ selector: selector })
            .then((result) => {
              if (result) {
                this.reportData = result
                this.loading = false
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
  },
}
</script>

<style lang="scss" scoped>
// @import './imports/client/styles/report.scss';

.css-custom {
  color: red;
}
</style>
