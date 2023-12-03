<template>
  <div
    id="loading-area"
    class="container"
  >
    <div
      id="print-area"
      class="invoice-container"
    >
      <div class="content-wrapper">
        <div style="page-break-before: always" />
        <div class="header">
          <div class="company-logo--none"></div>

          <h1 class="company-name preload-font">
            {{ reportData.branchDoc && reportData.branchDoc.name }}
          </h1>
          <p class="location-name">
            Address:
            {{ reportData.branchDoc && reportData.branchDoc.address }}
          </p>
          <p class="tel-text">
            Tel: {{ reportData.branchDoc && reportData.branchDoc.telephone }}
          </p>
        </div>

        <div class="header-content">
          <div class="left-side">
            <p class="text left-size-text">
              ល.រ:
              <span class="span-text">
                {{ reportData.refNo }}
              </span>
            </p>
            <p class="text left-size-text">
              កាលបរិច្ឆេទ:
              <span class="span-text">
                {{ $filters.dateTime(reportData.tranDate) }}
              </span>
            </p>
            <p
              v-if="reportData.memo"
              class="text"
            >
              បរិយាយ:
              <span class="span-text">
                {{ reportData.memo }}
              </span>
            </p>
          </div>

          <div class="right-side">
            <p class="text">
              អតិថិជន:
              <span class="span-text">
                {{ reportData.customer }}
              </span>
            </p>
            <p class="text">
              បុគ្គលិក:
              <span class="span-text">
                {{ reportData.employeeName }}
              </span>
            </p>
          </div>
        </div>

        <div class="table-wrapper">
          <table
            class="table-content"
            border="0"
          >
            <thead>
              <tr>
                <th class="text-left">បរិយាយ</th>
                <th class="text-right">ចំនួន</th>
              </tr>
            </thead>
            <tbody
              v-for="(item, index) in reportData.details"
              :key="index"
              :style="{
                'border-bottom':
                  index + 1 < reportData.details.length
                    ? '1px dashed #000'
                    : 'none',
              }"
            >
              <tr>
                <td class="text-left">ចំនួនទឹកប្រាក់ទទួល</td>
                <td class="text-right">
                  {{
                    $filters.exchangeBaseCurrency(
                      item.received,
                      item.fromSymbol
                    )
                  }}
                </td>
              </tr>
              <tr style="width: 100%">
                <td>អត្រាប្តូរប្រាក់</td>
                <td class="text-right">{{ item.rate }}{{ item.rateFormat }}</td>
              </tr>
              <tr style="width: 100%">
                <td class="text-left">ចំនួនទឹកប្រាក់ត្រូវប្តូរ</td>
                <td class="text-right">
                  {{
                    $filters.exchangeBaseCurrency(
                      item.exchangeAmount,
                      item.fromSymbol
                    )
                  }}
                </td>
              </tr>
              <tr style="width: 100%">
                <td class="text-left">ចំនួនទឹកប្រាក់ប្តូរបាន</td>
                <td class="text-right">
                  <b style="text-decoration: underline">{{
                    $filters.exchangeBaseCurrency(item.amount, item.toSymbol)
                  }}</b>
                </td>
              </tr>
              <tr style="width: 100%">
                <td class="text-left">ចំនួនទឹកប្រាក់អាប់</td>
                <td class="text-right">
                  {{
                    $filters.exchangeBaseCurrency(item.return, item.fromSymbol)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p class="thank-text">សូមអរគុណ</p>

          <hr class="hr-bottom" />
          <p class="power-by-text">Powered by Rabbit Technology</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
/****************
 **    Libs    **
 ****************/
import Notify from '/imports/client/lib/notify'
import Printd from 'printd'
/*******************
 **    Methods    **
 *******************/
import { getInvoice } from '../api/transaction/methods'
// Components
// Print style
import reportPrintStyle from '../styles/report-print'

export default {
  name: 'Invoice',
  //components: { SaleCancelAndCopy },
  props: {
    visablePrinting: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: null,
    },
    paperSize: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      printTrigger: false,
      printStyle: reportPrintStyle,
      reportData: {},
    }
  },
  computed: {},
  watch: {
    visablePrinting: {
      handler(val) {
        if (val) {
          this.getInvoiceData()
        }
      },
      immediate: true,
    },
    printTrigger(val) {
      if (val) this.printByWeb()
    },
  },
  mounted() {
    // Printd
    this.d = new Printd()
  },
  methods: {
    /******************
     **  Fetch data  **
     ******************/
    getInvoiceData() {
      // this.loading = true
      if (this.id) {
        getInvoice
          .callPromise({ _id: this.id })
          .then((result) => {
            if (result) {
              this.reportData = result
              this.$nextTick(() => {
                this.printTrigger = true
              })
            }
            // this.loading = false
          })
          .catch((err) => {
            // this.loading = false
            Notify.error({ message: err })
          })
      } else {
        this.firstShowForm = true
        this.reportData = this.printDoc
        this.$nextTick(() => {
          this.getWidthHeightTable()
        })
      }
    },
    // async handlePrint() {
    //   this.printByWeb()
    // },
    async printByWeb() {
      // Start loading
      const loadingInstance = this.$loading({
        target: '#loading-area',
      })

      const callback = ({ window, launchPrint }) => {
        setTimeout(() => launchPrint(window), 500)
      }
      // Start print
      this.d.print(
        document.getElementById('print-area'),
        [this.printStyle],
        [],
        callback
      )
      // After print event
      const { contentWindow } = this.d.getIFrame()
      contentWindow.addEventListener('afterprint', () => {
        // this.handleAfterPrint()
        this.printTrigger = false
        this.$emit('print-disable')
      })
      // Close loading
      loadingInstance.close()
    },
    /*******************
     **   Table row   **
     *******************/
    // Format money base on currency
    // formatMoney(money, currency) {
    //   if (!isNaN(money) && !currency) return
    //   // Check currency
    //   if (currency === 'KHR') return _.ceil(money, -2)
    //   else if (currency === 'USD') return _.round(money, 2)
    //   else if (currency === 'THB') return _.round(money, 2)
    // },
  },
}
</script>

<style
  lang="scss"
  scoped
>
@import './imports/modules/exchange/styles/invoice.scss';

.container {
  height: 100vh;
  max-height: 100vh;
  overflow: auto;

  // @media only screen and (max-width: 1025px) {
  //   height: calc(~'var(--vh, 1vh) * 100');
  // }
}
.main-footer {
  z-index: 1;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100vw;
  height: 45px;
  bottom: 0;
  border-top: 1px solid #dcdfe6;
  background: #fff;
  .el-button {
    margin-right: 16px;
    padding: 8px 18px;
    font-size: 14px;
    text-transform: uppercase;

    &:last-child {
      margin-right: 26px;
    }
  }
}

.hide-content {
  display: none;
}
</style>
