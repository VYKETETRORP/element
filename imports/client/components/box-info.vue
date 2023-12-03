<template>
  <div v-loading="loading">
    <el-row
      :gutter="20"
      class="box-acc"
    >
      <el-col :span="12">
        <div class="fix-account">
          <div class="acc-info-card">
            <ul class="list-group list-group-flush">
              <li
                :id="visible"
                class="list-group-item"
              >
                <div
                  class="widget-heading"
                  style="text-align: center; font-weight: bold"
                >
                  {{ $t('app.box info.Performance') }}
                </div>
              </li>
              <li
                :id="visible"
                class="list-group-item"
              >
                <div class="left-indicator bg-info" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Income') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-info">
                      <!-- {{
                        reportReEx &&
                        reportReEx[0] &&
                        $filters.currency(reportReEx[0].total)
                      }} -->
                      <!-- {{ reportReEx && $filters.currency(reportReEx.Revenue) }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportReEx?.Revenue || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>

              <li
                :id="visible"
                class="list-group-item"
              >
                <div class="left-indicator bg-warning" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Expenses') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-warning">
                      <!-- {{
                        reportReEx &&
                        reportReEx[3] &&
                        $filters.currency(reportReEx[3].total )
                      }} -->
                      <!-- {{ reportReEx && $filters.currency(reportReEx.Expense) }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportReEx?.Expense || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>

              <li
                :id="visible"
                class="list-group-item"
              >
                <div class="left-indicator bg-success" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Net Income') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-success">
                      <!-- {{
                        reportReEx &&
                        reportReEx[4] &&
                        $filters.currency(reportReEx[4].total )
                      }} -->
                      <!-- {{
                        reportReEx && $filters.currency(reportReEx.NetIncome)
                      }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportReEx?.NetIncome || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>
              <!-- <li v-if="visible" class="list-group-item">
                <div class="left-indicator bg-mango" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Receivables') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-mango">
                      {{
                        reportData &&
                        reportData[0] &&
                        reportData[0].data &&
                        reportData[0].data[1] &&
                        $filters.currency(reportData[0].data[1].total )
                      }}
                    </div>
                  </div>
                </div>
              </li> -->
            </ul>
          </div>
        </div>

        <!-- <span v-if="visible">
          <div style="height:10px;" />
          <div class="fix-account-ar-ap">
            <div class="mi-card-visual bg-green">
              <div class="avatar">
                <template #icon>
                  <i class="fa fa-fas fa-users" />
                </template>
              </div>
              <div class="mi-visual-content">
                <div class="mi-visual-title">
                  <b>
                    {{$t('app.box info.Receivables')}}
                  </b>
                </div>
                <b>{{ reportData[0] && $filters.currency(reportData[0].data[1].total ) }}</b>
              </div>
            </div>
          </div>
        </span> -->
      </el-col>

      <el-col :span="12">
        <div
          :id="visible"
          class="fix-account"
        >
          <div class="acc-info-card">
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <div
                  class="widget-heading"
                  style="text-align: center; font-weight: bold"
                >
                  {{ $t('app.box info.Position') }}
                </div>
              </li>
              <li class="list-group-item">
                <div class="left-indicator bg-info" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Asset') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-info">
                      <!-- {{
                        reportData &&
                        reportData[0] &&
                        $filters.currency(reportData[0].total )
                      }} -->
                      <!-- {{ reportData && $filters.currency(reportData.Asset) }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportData?.Asset || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="left-indicator bg-warning" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Equities') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-warning">
                      <!-- {{
                        reportData &&
                        reportData[2] &&
                        $filters.currency(reportData[2].total )
                      }} -->
                      <!-- {{ reportData && $filters.currency(reportData.Equity) }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportData?.Equity || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>
              <li class="list-group-item">
                <div class="left-indicator bg-success" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Liabilities') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-success">
                      <!-- {{
                        reportData &&
                        reportData[1] &&
                        $filters.currency(reportData[1].total )
                      }} -->
                      <!-- {{
                        reportData && $filters.currency(reportData.Liability)
                      }} -->
                      <count-to
                        :start-val="0"
                        :end-val="reportData?.Liability || 0"
                        :duration="800"
                        :suffix="` ${baseCurrency}`"
                        :decimals="setting.decimalNumber"
                      />
                    </div>
                  </div>
                </div>
              </li>
              <!-- <li v-if="visible" class="list-group-item">
                <div class="left-indicator bg-mango" />
                <div class="widget-content-wrapper">
                  <div class="widget-content-left">
                    <div class="widget-heading">
                      {{ $t('app.box info.Payables') }}
                    </div>
                  </div>
                  <div class="widget-content-right">
                    <div class="badge badge-pill badge-mango">
                      {{
                        reportData &&
                        reportData[1] &&
                        reportData[1].data[0] &&
                        $filters.currency(reportData[1].data[0].total )
                      }}
                    </div>
                  </div>
                </div>
              </li> -->
            </ul>
          </div>
        </div>
        <!-- <span v-if="visible">
          <div style="height:10px;" />
          <div class="fix-account-ar-ap">
            <div class="mi-card-visual bg-indigo">
              <div class="avatar">
                <template #icon>
                  <i class="fa fa-fas fa-truck" />
                </template>
              </div>
              <div class="mi-visual-content">
                <div class="mi-visual-title">
                  <b>
                    {{$t('app.box info.Payables')}}
                  </b>
                </div>
                <b>{{ reportData[1] && $filters.currency(reportData[1].data[0].total ) }}</b>
              </div>
            </div>
          </div>
        </span> -->
      </el-col>
    </el-row>
  </div>
</template>
<script>
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
// import accBalInfo from '../../api/reports/accBalInfo'
import accBalInfo from '../../api/reports/accBalInfo'

// Methods
import {
  // accProfitLossInfo,
  accProfitLossInfo2,
} from '../../api/reports/accProfitLossInfo'

// Component
import { CountTo } from 'vue3-count-to'
import { ElRow, ElCol } from 'element-plus'

export default {
  name: 'BoxInfo',
  components: {
    CountTo,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
  },

  props: {
    customFilter: {
      type: Object,
      default: function () {
        return {}
      },
    },
    visible: {
      type: Boolean,
      default: true,
    },
    disappear: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      reportDate: moment().endOf('day').toDate(),
      reportData: [],
      reportReEx: [],
    }
  },
  computed: {
    // currentBranchId() {
    //   const branch = this.$store.state.app.currentBranch
    //   return branch && branch._id
    // },
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
    setting() {
      let setting = this.$store.state.app.company
      setting = (setting && setting.setting) || { decimalNumber: 2 }
      return setting
    },
    baseCurrency() {
      const company = this.$store.state.app && this.$store.state.app.company

      const opts = [
        { label: 'KHR', symbol: '៛' },
        { label: 'USD', symbol: '$' },
        { label: 'THB', symbol: '฿' },
      ]
      let symbol = ''
      const currency =
        company && company.setting && company.setting.baseCurrency
      const baseCurr = opts.find((it) => it.label === currency)
      symbol = baseCurr?.symbol ?? '$'

      return symbol
    },
    // currentBranchId() {
    //   const branch = this.$store.state.app.currentBranch
    //   return branch && branch._id
    // },
    fiscalDate() {
      return this.$store.getters['app/fiscalDate'](this.reportDate)
    },
  },

  watch: {
    currentBranchId: {
      handler(val) {
        if (val) {
          this.getBalInfo()
          this.getProAndLosInfo()
        }
      },
      // immediate: true,
    },
  },
  // created() {
  //   this.getBalInfo()
  //   this.getProAndLosInfo()
  // },
  activated() {
    this.getBalInfo()
    this.getProAndLosInfo()
  },
  created() {},
  methods: {
    getProAndLosInfo() {
      if (!this.currentBranchId) return

      const selector = {
        reportDate: [moment().startOf('month').toDate(), this.reportDate],
        branchId: [this.currentBranchId],
      }
      this.loading = true
      // accProfitLossInfo
      accProfitLossInfo2
        .callPromise(selector)
        .then((result) => {
          if (result) {
            this.reportReEx = result
            this.loading = false
          }
        })
        .catch((error) => {
          this.loading = false
          Notify.error({ message: error })
        })
    },
    getBalInfo() {
      const selector = {
        reportDate: this.reportDate,
        branchId: [this.currentBranchId],
        fiscalDate: this.fiscalDate,
      }

      // if (this.currency) {
      //   selector.currency = this.baseCurrency
      // }
      this.loading = true
      // accBalInfo
      accBalInfo
        .callPromise(selector)
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

      // // accBalInfo
      // selector.showRow = 'Active'
      // accBalInfo
      //   .callPromise(selector)
      //   .then((result) => {
      //     if (result) {
      //       console.log(result)
      //       // this.reportData = result
      //       this.loading = false
      //     }
      //   })
      //   .catch((error) => {
      //     console.log(error)
      //     this.loading = false
      //     Notify.error({ message: error })
      //   })
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.widget-heading {
  font-size: 13px !important;
}
@media only screen and (max-width: 1024px) {
  /* // .el-col el-col-12 > .acc-info-card {
  //   padding: 10px 5px 5px 5px !important;
  // } */
  .box-acc > .el-col,
  .el-col-12 {
    padding: 3px 3px 3px 5px !important;
  }
  .fix-account .widget-content-left .widget-heading {
    padding-left: 6px !important;
  }
  .fix-account {
    .acc-info-heading {
      font-weight: 700;
    }
  }
}
@media only screen and (max-width: 1920px) {
  .fix-account {
    .acc-info-card {
      line-height: 2.001 !important;
    }
  }
}
@media only screen and (max-width: 1366px) {
  .widget-heading {
    font-size: 13px !important;
  }
  .fix-account {
    .acc-info-card {
      line-height: 2.04 !important;
    }
  }
}
@media only screen and (max-width: 1280px) {
  .fix-account {
    .list-group-item {
      padding: 6px 0 !important;
    }
    .acc-info-card {
      line-height: 2.03 !important;
    }
  }
}
@media only screen and (max-width: 1024px) {
  .space-height {
    margin-top: 2px !important;
  }
  .box-acc > .el-col,
  .el-col-12 {
    padding: 0px 3px 0px 5px !important;
  }
  .fix-account {
    .list-group-item {
      padding: 7.2px 0 !important;
    }
    .acc-info-card {
      line-height: 1.9 !important;
    }
  }
}
/* @media only screen and (max-width: 1366px) {
  .widget-heading {
    font-size: 13px !important;
  }
} */
.fix-account {
  .acc-info-heading {
    font-weight: 700;
  }
  .acc-info-card {
    background-color: #eeeeee;
    border-radius: 5px;
    padding: 4px 10px 3px 10px;
    /* // -webkit-box-shadow: 0 0.46875rem 2.1875rem rgba(4, 9, 20, 0.03),
    //   0 0.9375rem 1.40625rem rgba(4, 9, 20, 0.03),
    //   0 0.25rem 0.53125rem rgba(4, 9, 20, 0.05),
    //   0 0.125rem 0.1875rem rgba(4, 9, 20, 0.03);
    // box-shadow: 0 0.46875rem 2.1875rem rgba(4, 9, 20, 0.03),
    //   0 0.9375rem 1.40625rem rgba(4, 9, 20, 0.03),
    //   0 0.25rem 0.53125rem rgba(4, 9, 20, 0.05),
    //   0 0.125rem 0.1875rem rgba(4, 9, 20, 0.03); */
    border-width: 0;
    line-height: 2;
  }
  .list-group {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding-left: 0;
    margin-bottom: 0;
  }
  .list-group-flush:first-child .list-group-item:first-child {
    border-top: 0;
    margin-top: -19px;
  }
  .list-group-item:last-child {
    border-bottom: 0;
  }

  .list-group-item {
    position: relative;
    display: block;
    /* padding: 0.25rem 0;
    padding: 0.5rem 0; */
    padding: 7px 0;
    margin-bottom: -1px;
    /* background-color: #fff; */
    border-bottom: 1px solid rgba(26, 54, 126, 0.125);
  }

  .left-indicator {
    position: absolute;
    width: 4px;
    height: 60%;
    border-radius: 0.3rem;
    left: 0;
    top: 20%;
    opacity: 0.6;
    -webkit-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }
  /*
  .bg-warning {
    background-color: #ff9800 !important;
  }
  .bg-info {
    background-color: #3f51b5 !important;
  }
  .bg-success {
    background-color: #4caf50 !important;
  }
  .bg-blue {
    background-color: #16aaff !important;
  }
  .bg-mango {
    background-color: #9c27b0 !important;
  } */

  .p-0 {
    padding: 0 !important;
  }
  .widget-content-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    position: relative;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
  .widget-content-left .widget-heading {
    opacity: 0.8;
    font-weight: 700;
    padding-left: 15px;
    font-size: 12px;
  }
  .widget-content-right.widget-content-actions {
    visibility: hidden;
    opacity: 0;
    -webkit-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }

  .widget-content-right {
    margin-left: auto;
  }
  .badge {
    font-weight: 700;
    text-transform: uppercase;
    padding: 0px 10px;
    min-width: 19px;
    font-size: 13px;
  }

  .badge-success {
    color: #fff;
    /* background-color: #4caf50; */
    background: linear-gradient(36deg, #4caf50, #75d048);
  }
  .badge-warning {
    color: #fff;
    /* background-color: #ff9800 !important; */
    background: linear-gradient(36deg, #ff9800, #fbb52b);
  }
  .badge-info {
    color: #fff;
    /* background-color: #3f51b5 !important; */
    background: linear-gradient(36deg, #1a73e8, #5db1ff);
  }
  .badge-pill {
    border-radius: 5px;
  }
  .badge-mango {
    color: #fff;
    /* background-color: #9c27b0 !important; */
    background: linear-gradient(36deg, #f5222d, #f97a81);
  }
}
</style>
