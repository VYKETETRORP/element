<template>
  <div>
    <Chart
      :chart-type="`line`"
      :chart-data="chartData"
      :options="options"
    />
  </div>
</template>

<script>
import moment from 'moment'
import Notify from '/imports/client/lib/notify'
import { accChart } from '../../api/reports/accChart'
import Chart from './Chart'

export default {
  name: 'AccChart',
  // extends: Line,
  components: {
    Chart,
  },
  props: {
    customFilter: {
      type: Object,
      default: function () {
        return {}
      },
    },
    accDate: {
      type: Object,
      default: function () {
        return {
          startTranDate: moment().subtract(30, 'days').startOf('day').toDate(),
        }
      },
    },
  },

  data() {
    return {
      loading: false,
      startOfMonth: moment().startOf('years').toDate(),
      endOfMonth: moment().endOf('year').toDate(),
      // chartData: {},
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Income',
            borderColor: '#05CBE1',
            pointBackgroundColor: '#05CBE1',
            pointBorderColor: '#05CBE1',
            borderWidth: 1,
            backgroundColor: [
              'rgba(0, 231, 255, 0.9)',
              'rgba(0, 231, 255, 0.25)',
              'rgba(0, 231, 255, 0)',
            ],
            fill: true,
            tension: 0.4,
            data: [],
          },
          {
            label: 'Expense',
            borderColor: '#FC2525',
            pointBackgroundColor: '#FC2525',
            pointBorderColor: '#FC2525',
            borderWidth: 1,
            backgroundColor: [
              'rgba(255, 0,0, 0.5)',
              'rgba(255, 0, 0, 0.25)',
              'rgba(255, 0, 0, 0)',
            ],
            fill: true,
            tension: 0.4,
            data: [],
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        // hover: {
        //   animationDuration: 0,
        // },

        animation: {
          duration: 2000,
        },
        plugins: {
          filler: {
            propagate: false,
            drawTime: 'beforeDraw',
          },
          tooltip: {
            legend: {
              position: 'top',
            },
            callbacks: {
              title: (tooltipItems) => {
                // use filters format
                const value = this.$filters.date(tooltipItems[0].label)
                return value
              },
              label: (tooltipItems) => {
                // // use filters format
                const label = tooltipItems.dataset.label
                const value = `${this.$filters.number(tooltipItems.parsed.y)}`
                return `${label} : ${this.baseCurrency}${value}`
              },
            },
          },
        },
        scales: {
          x: {
            // type: 'linear',
            ticks: {
              callback: (value, index) => {
                // use filters format
                return this.$filters.date(this.chartData.labels[value])
                // return value
              },
            },
          },
          y: {
            type: 'linear',
            position: 'left',
            id: 'y-axis-1',
            ticks: {
              // beginAtZero: true,
              callback: (value, index, values) => {
                // use filters format
                return this.$filters.number(value)
              },
            },
          },
        },
      },
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
    baseCurrency() {
      const company = this.$store.state.app && this.$store.state.app.company

      const opts = [
        { label: 'KHR', symbol: '៛' },
        { label: 'USD', symbol: '$' },
        { label: 'THB', symbol: '฿' },
      ]
      let symbol
      const currency =
        company && company.setting && company.setting.baseCurrency
      const baseCurr = opts.find((it) => it.label === currency)
      symbol = baseCurr?.symbol ?? '$'

      return symbol
    },
  },

  watch: {
    currentBranchId: {
      handler(val) {
        if (val) {
          this.getChart()
        }
      },
    },
    accDate: {
      handler(val) {
        if (val) {
          if (this.currentBranchId) this.getChart()
        }
      },
      immediate: true,
      // deep: true,
    },
  },
  activated() {
    // this.getChart()
  },
  methods: {
    getChart() {
      if (!this.currentBranchId) return

      const startTranDate = this.accDate.startTranDate
      const selector = {
        startOfMonth: this.startOfMonth,
        endOfMonth: this.endOfMonth,
        startTranDate,
        branchId: this.currentBranchId,
      }

      if (this.accDate & this.accDate.endTranDate) {
        selector.endTranDate = this.accDate.endTranDate
      }

      this.loading = true
      accChart
        .callPromise(selector)
        .then((result) => {
          if (result) {
            this.chartData.labels = result.tranDate
            this.chartData.datasets[0].data = result.income
            this.chartData.datasets[1].data = result.expense

            this.loading = false
          }
        })
        .catch((error) => {
          console.log('chart Acc', error)
          this.loading = false
          Notify.error({ message: error })
        })
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.chart-acc > .el-col,
.el-col-24 {
  padding-left: 5px !important;
  padding-right: 3px !important;
}
</style>
