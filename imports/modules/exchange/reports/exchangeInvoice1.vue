<template>
  <div>
    <report-layout
      :com-used="`Invoice`"
      :paper-size="paperSize"
      :trigger="printTrigger"
      :css-text="`${printCss}`"
      :visible-print-invoice="visiblePrintInvoice"
      :show="{
        timestamp: false,
        signature: false,
        header: false,
        filter: false,
      }"
      @afterprint="afterprint"
    >
      <div class="header">
        <!-- padding-top: 14px -->
        <div
          class="logo"
          style="float: left; padding-left: 10px"
        >
          <img
            class="logo-img"
            src="/images/soun_sengleng.png"
          />
        </div>

        <div
          class="logo"
          style="float: right; padding-right: 10px"
        >
          <img
            class="logo-img"
            src="/images/soun_sengleng.png"
          />
        </div>
        <!-- kh-moul -->
        <div
          style="width: 47%; padding-left: 77px"
          class="company-name kh-moul"
        >
          {{ companyInfo && companyInfo.name }}
        </div>

        <div
          class="company-name kh-moul"
          style="text-transform: uppercase; margin-top: 2px"
        >
          {{
            fields.businessNameEn
              ? fields.businessNameEn
              : reportData.branchDoc && reportData.branchDoc.shortName
          }}
        </div>
        <p
          class="description kh-battambang"
          style="margin-top: 7px; padding-bottom: 4px"
        >
          {{ fields.description }}
        </p>
        <p class="description kh-battambang">
          {{ fields.descriptionEn }}
        </p>
        <p
          class="location-name kh-battambang"
          style="margin-top: 7px"
        >
          {{ reportData.branchDoc && reportData.branchDoc.address }}
        </p>
        <p class="tel-text kh-battambang">
          {{ reportData.branchDoc && reportData.branchDoc.telephone }}
        </p>
      </div>

      <div
        class="header-content kh-battambang"
        style="margin-top: -5px"
      >
        <div class="left-side">
          <p class="text left-size-text">
            វិក័យបត្រ:
            <span class="span-text">
              {{ reportData.refNo }}
            </span>
          </p>

          <p class="text">
            បុគ្គលិក:
            <span class="span-text">
              {{ reportData.employeeName }}
            </span>
          </p>
        </div>

        <div class="right-side">
          <p class="text left-size-text">
            កាលបរិច្ឆេទ:
            <span class="span-text">
              {{ $filters.date(reportData.tranDate) }}
            </span>
          </p>
          <p class="text left-size-text">
            ម៉ោង:
            <span class="span-text">
              {{ formateTime(reportData.tranDate) }}
            </span>
          </p>
        </div>
      </div>
      <!-- <div> -->
      <table
        class="kh-battambang"
        style="width: 100%"
      >
        <thead>
          <tr>
            <th class="text-left">បរិយាយ</th>
            <th
              class="text-right"
              style="min-width: 100px"
            >
              ចំនួន
            </th>
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
          <tr style="width: 100%">
            <td class="text-left">ចំនួនទឹកប្រាក់ត្រូវប្តូរ</td>
            <td class="text-right text-bold">
              {{
                $filters.exchangeBaseCurrency(
                  item.exchangeAmount,
                  item.fromSymbol
                )
              }}
              {{ item.fromSymbol }}
            </td>
          </tr>
          <tr style="width: 100%">
            <td>អត្រាប្តូរប្រាក់</td>
            <td class="text-right">
              {{ $filters.exchangeBaseCurrency(item.rate, item.rateFormat) }}
              {{ item.rateFormat }}
            </td>
          </tr>
          <tr>
            <td
              class="text-left"
              style="padding-bottom: 5px"
            >
              ចំនួនទឹកប្រាក់ទទួល
            </td>
            <td
              class="text-right text-bold"
              style="font-size: 16px"
            >
              {{
                $filters.exchangeBaseCurrency(item.received, item.fromSymbol)
              }}
              {{ item.fromSymbol }}
            </td>
          </tr>

          <tr style="width: 100%; border-top: 1px solid #000">
            <td
              class="text-left;"
              style="padding-top: 5px"
            >
              ចំនួនទឹកប្រាក់ប្តូរបាន
            </td>
            <td
              class="text-right text-bold"
              style="border: 1px solid #000; font-size: 16px"
            >
              <b>
                {{ $filters.exchangeBaseCurrency(item.amount, item.toSymbol) }}
                {{ item.toSymbol }}
              </b>
            </td>
          </tr>
          <tr style="width: 100%">
            <td class="text-left">ចំនួនទឹកប្រាក់អាប់</td>
            <td
              class="text-right"
              style="font-size: 16px"
            >
              <span v-if="item.return">
                {{
                  $filters.exchangeBaseCurrency(item.return, item.fromSymbol)
                }}
                {{ item.fromSymbol }}
              </span>
              <span v-else>0.00 {{ item.fromSymbol }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="footer kh-battambang">
        <p class="thank-text">សូមពិនិត្យអោយបានត្រឹមត្រូវមុននឹងចាកចេញ</p>
        <hr class="hr-bottom" />
        <p class="power-by-text">Powered by Rabbit Technology</p>
      </div>
    </report-layout>
  </div>
</template>

<script>
import useMethod from '/imports/client/composables/useMethod.ts'
//  Messages
import _ from 'lodash'
import Notify from '/imports/client/lib/notify'

// import formatNumber from '../lib/format-number'
import { mapState } from 'vuex'
import reportPrintStyle from '../styles/report-print'

import ReportLayout from '/imports/client/layouts/ReportLayout.vue'
import { getInvoice } from '../api/transaction/methods'
import moment from 'moment'

export default {
  name: 'ExchangeInvoice',
  components: { ReportLayout },
  props: {
    visiblePrintInvoice: {
      type: Boolean,
      default: true,
    },
    visiblePrinting: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: null,
    },
    paperSize: {
      type: String,
      default: 'mini',
    },
  },
  data() {
    return {
      loading: false,
      reportName: 'វិក័យបត្រ',

      fields: {
        businessNameEn: '',
        description: `លក់ទិញ ប្តូរប្រាក់បរទេស និងផ្ទេរប្រាក់`,
        descriptionEn: `Buying-Selling Exchange`,
      },
      reportData: {
        branchDoc: {
          shortName: 'Rabbit Technology Center',
          address:
            'ផ្ទះលេខ១០ ភូមិកម្មករ សង្កាត់ស្វាយប៉ោ ក្រុងបាត់ដំបង(បុរីពាណិជ្ជក្ម)',
          telephone: '098 878 678/097 679 976',
        },
        refNo: '0001',
        tranDate: new Date(),
        employeeName: 'Rabbit',
        details: [
          {
            fromSymbol: '៛',
            toSymbol: '$',
            rate: 4010,
            received: 100,
            exchangeAmount: 100,
            amount: 401000,
            return: 0,
            rateFormat: '៛',
          },
        ],
      },
      //  Print 'a4-p'
      // paperSize: 'mini',
      printCss: reportPrintStyle,
      printTrigger: false,
    }
  },
  computed: {
    ...mapState({
      companyInfo(state) {
        const company = state.app.company
        return company
      },
      decimalNumber(state) {
        const company = state.app.company
        return company && company.setting.decimalNumber
      },
    }),
    stateFields() {
      const exchange = this.$store.state.exchange.customTemplate
      return exchange.fields
    },
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },
  filters: {
    indentSpace: function (indent) {
      return indent > 0 ? _.repeat('&nbsp;', indent) : ''
    },
  },
  watch: {
    visiblePrinting: {
      handler(val) {
        if (val) {
          this.getCustomTemplate()
          this.getInvoiceData()
        }
      },
      immediate: true,
    },
    stateFields: {
      handler(value) {
        this.fields = { ...this.fields, ...value }
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    getCustomTemplate() {
      const { call } = useMethod('ex.findCustomTemplate')

      call({
        selector: {
          branchId: this.currentBranchId.value,
        },
      })
        .then((result) => {
          if (result) this.fields = { ...this.fields, ...result.fields }
        })
        .catch((error) => {
          console.log(error)
          // store.dispatch('app/messageE', error)
        })
    },
    /******************
     **  Fetch data  **
     ******************/
    getInvoiceData() {
      getInvoice
        .callPromise({ _id: this.id })
        .then((result) => {
          if (result) {
            this.reportData = result
            this.$nextTick(() => {
              this.printTrigger = true
            })
          }
        })
        .catch((err) => {
          Notify.error({ message: err })
        })
    },
    afterprint() {
      this.printTrigger = false
      this.$emit('print-disable')
    },
    formateTime(val) {
      return moment(val).format('LTS')
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
@import './imports/client/styles/report.scss';
@import './imports/modules/exchange/styles/invoice.scss';
/* .header {
  padding: 8px 5px 0px 5px;
  text-align: center;
  margin: 0;
  line-height: 20px;
  font-size: 20px;
}
.company-name {
  font-size: 20px;
  margin: 0;
  line-height: 1.6;
  padding-bottom: 10px;
} */

/* .header {
  padding: 8px 5px 0px 5px;
  text-align: center;
  margin: 0;
  line-height: 20px;
  font-size: 20px;

  .company-name {
    font-size: 20px;
    margin: 0;
    line-height: 1.6;
    padding-bottom: 10px;
  }
} */

.header-content {
  display: flex;
  flex-flow: row nowrap;
  margin: 8px 0px 4px 0px;
  border-top: 1px solid #bbb;
  .left-side {
    flex: 1 1 auto;
    padding: 2px 2px 0 2px;
    box-sizing: border-box;
    .text {
      font-size: 11px;
      text-align: left;
      margin: 0 0;
      word-wrap: break-word;
      display: block;
      font-weight: bold;
      line-height: 22px;
    }
  }

  .right-side {
    flex: 1 1 auto;
    padding: 2px 2px 0 2px;
    box-sizing: border-box;
    .text {
      font-size: 12px;
      text-align: right;
      margin: 0 0;
      word-wrap: break-word;
      display: block;
      font-weight: bold;
      line-height: 22px;
    }
  }
}

.logo {
  padding-top: 18px;
  .logo-img {
    width: 50px;
  }
}
.footer {
  margin-top: auto;
  .thank-text {
    // font-size: 14px;
    // line-height: 22px;
    // margin-top: 2px;
    margin: 0;
    margin-top: 16px;
    font-size: 11px;
    text-align: center;
    line-height: 11px;
    font-weight: normal;
  }
  .footer-address {
    font-size: 12px;
  }
  .power-by-text {
    // margin-bottom: 6px;
    // font-size: 10px;
    margin: 0;
    margin-top: 5px;
    text-align: center;
    margin-bottom: 5px;
    font-size: 8px;
  }
}
.description {
  text-transform: uppercase;
  margin: 0;
  line-height: 17px;
  font-size: 12px;
}
</style>
