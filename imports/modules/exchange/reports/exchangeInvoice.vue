<template>
  <div>
    <!-- visiblePrintInvoice -->
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
      <!-- Loop Header -->
      <div
        style="padding: 0px"
        class="header kh-battambang custom-template"
      >
        <el-button
          v-if="isEdit"
          class="new-content"
          size="small"
          type="primary"
          plain
          @click="addParentContent('headers')"
        >
          <template #icon>
            <el-icon><Plus /></el-icon>
          </template>
          Header
        </el-button>
        <draggable
          :list="headerFields"
          :disabled="!isEdit"
          item-key="tag"
          ghost-class="ghost-class"
          drag-class="drag-class"
          :animation="200"
          @start="drag = true"
          @end="drag = false"
        >
          <template #item="{ element: doc, index: key }">
            <component
              :is="doc.tag"
              :style="{ ...doc['styles'] }"
              :class="`${doc['className']} ${isEdit ? 'parent-tag' : ''}`"
            >
              <template
                v-for="(it, k) in doc['value']"
                :key="`${key}${k}`"
              >
                <span
                  v-if="it['label'] || it['prop'] || it['src']"
                  :style="{ ...it['styles'] }"
                  :class="`${it['className']} child-tag`"
                >
                  {{ it['label'] }}
                  <template v-if="it['prop']">
                    <span
                      v-if="!_isPropDateTime(it['prop'])"
                      :style="{ ...it['propStyles'] }"
                    >
                      {{ reportData[it['prop']] }}
                    </span>
                    <span
                      v-else
                      :style="{ ...it['propStyles'] }"
                    >
                      {{ formateDateTime(reportData[it['prop']], it['prop']) }}
                    </span>
                  </template>

                  <!-- Image -->
                  <template v-if="it['src']">
                    <img
                      class="logo-img"
                      :src="it['src']"
                    />
                  </template>
                </span>
              </template>
              <!-- Parent action -->
              <span
                v-if="isEdit"
                :class="{ 'parent-action': isEdit }"
              >
                <el-button
                  link
                  type="primary"
                  @click="handleUpdate({ parentIndex: key, type: 'headers' })"
                >
                  <template #icon>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="removeContent({ index: key, type: 'headers' })"
                >
                  <template #icon>
                    <el-icon><CircleCloseFilled /></el-icon>
                  </template>
                </el-button>
              </span>
            </component>
          </template>
        </draggable>
      </div>

      <!-- Content -->
      <div class="custom-template kh-battambang">
        <el-button
          v-if="isEdit"
          class="new-content"
          size="small"
          type="primary"
          plain
          @click="addParentContent('contents')"
        >
          <template #icon>
            <el-icon><Plus /></el-icon>
          </template>
          Content
        </el-button>

        <!-- Loop Content -->
        <draggable
          :list="contentFields"
          :disabled="!isEdit"
          item-key="tag"
          ghost-class="ghost-class"
          drag-class="drag-class"
          :animation="200"
          @start="drag = true"
          @end="drag = false"
        >
          <template #item="{ element: doc, index: key }">
            <component
              :is="doc.tag"
              :class="`${doc['className']} ${isEdit ? 'parent-tag' : ''}`"
              :style="{ ...doc['styles'] }"
            >
              <template
                v-for="(it, k) in doc['value']"
                :key="`${key}${k}`"
              >
                <span
                  :style="{ ...it['styles'] }"
                  :class="`${it['className']} child-tag`"
                >
                  {{ it['label'] }}
                </span>
                <span
                  v-if="!_isPropDateTime(it['prop']) && it['prop']"
                  :style="{ ...it['propStyles'] }"
                >
                  {{
                    $filters.exchangeBaseCurrency(
                      reportData.details[it['prop']]
                    )
                  }}

                  {{ showSymbol(it['prop'], reportData.details) }}
                </span>
              </template>

              <!-- parent -->
              <span
                v-if="isEdit"
                :class="{ 'parent-action': isEdit }"
              >
                <el-button
                  link
                  type="primary"
                  @click="handleUpdate({ parentIndex: key, type: 'contents' })"
                >
                  <template #icon>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="removeContent({ index: key, type: 'contents' })"
                >
                  <template #icon>
                    <el-icon><CircleCloseFilled /></el-icon>
                  </template>
                </el-button>
              </span>
            </component>
          </template>
        </draggable>
      </div>

      <div class="custom-template kh-battambang">
        <el-button
          v-if="isEdit"
          class="new-content"
          size="small"
          type="primary"
          plain
          @click="addParentContent('footers')"
        >
          <template #icon>
            <el-icon><Plus /></el-icon>
          </template>
          Footer
        </el-button>

        <!-- Loop Footer -->
        <draggable
          :list="footerFields"
          :disabled="!isEdit"
          item-key="tag"
          ghost-class="ghost-class"
          drag-class="drag-class"
          :animation="200"
          @start="drag = true"
          @end="drag = false"
        >
          <template #item="{ element: doc, index: key }">
            <component
              :is="doc.tag"
              :class="`${doc['className']} ${isEdit ? 'parent-tag' : ''}`"
              :style="{ ...doc['styles'] }"
            >
              <template
                v-for="(it, k) in doc['value']"
                :key="`${key}${k}`"
              >
                <span
                  :style="{ ...it['styles'] }"
                  :class="`${it['className']} child-tag`"
                >
                  {{ it['label'] }}

                  <span
                    v-if="!_isPropDateTime(it['prop'])"
                    :style="{ ...it['propStyles'] }"
                  >
                    {{ reportData[it['prop']] }}
                  </span>
                  <span
                    v-else
                    :style="{ ...it['propStyles'] }"
                  >
                    {{ formateDateTime(reportData[it['prop']], it['prop']) }}
                  </span>
                </span>
              </template>

              <!-- parent -->
              <span
                v-if="isEdit"
                :class="{ 'parent-action': isEdit }"
              >
                <el-button
                  link
                  type="primary"
                  @click="handleUpdate({ parentIndex: key, type: 'footers' })"
                >
                  <template #icon>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="removeContent({ index: key, type: 'footers' })"
                >
                  <template #icon>
                    <el-icon><CircleCloseFilled /></el-icon>
                  </template>
                </el-button>
              </span>
            </component>
          </template>
        </draggable>
      </div>
    </report-layout>
  </div>
</template>

<script>
import useMethod from '/imports/client/composables/useMethod.ts'
//  Messages
import _, { isArray } from 'lodash'
import Notify from '/imports/client/lib/notify'

// import formatNumber from '../lib/format-number'
import { mapState } from 'vuex'
import reportPrintStyle from '../styles/report-print'

import ReportLayout from '/imports/client/layouts/ReportLayout.vue'
import { getInvoice } from '../api/transaction/methods'
import moment from 'moment'
import Draggable from 'vuedraggable'
export default {
  name: 'ExchangeInvoice',
  components: { ReportLayout, Draggable },
  props: {
    visiblePrintInvoice: {
      type: Boolean,
      default: false,
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
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      reportName: 'វិក័យបត្រ',

      reportData: {
        branchDoc: {
          shortName: 'Rabbit Technology Center',
          address:
            'ផ្ទះលេខ១០ ភូមិកម្មករ សង្កាត់ស្វាយប៉ោ ក្រុងបាត់ដំបង(បុរីពាណិជ្ជក្ម)',
          telephone: '098 878 678/097 679 976',
        },
        enBusinessName: 'Rabbit Technology Center',
        address:
          'ផ្ទះលេខ១០ ភូមិកម្មករ សង្កាត់ស្វាយប៉ោ ក្រុងបាត់ដំបង(បុរីពាណិជ្ជក្ម)',
        telephone: '098 878 678/097 679 976',
        email: 'test@gmail.com',
        refNo: '0001',
        tranDate: new Date(),
        employeeName: 'Rabbit',
        customer: 'General',
        details: {
          fromSymbol: '៛',
          toSymbol: '$',
          rate: 4010,
          received: 100,
          exchangeAmount: 100,
          amount: 401000,
          return: 0,
          rateFormat: '៛',
        },
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
    headerFields() {
      const exchange = this.$store.state.exchange.customTemplate
      return exchange.headers
    },
    contentFields() {
      const exchange = this.$store.state.exchange.customTemplate
      return exchange.contents
    },
    footerFields() {
      const exchange = this.$store.state.exchange.customTemplate
      return exchange.footers
    },
    currentIndexFields() {
      const exchange = this.$store.state.exchange.customTemplate
      return exchange
    },
    currentBranchId() {
      return this.$store.getters['app/currentBranchId']
    },
  },

  watch: {
    visiblePrinting: {
      handler(val) {
        if (val) {
          this.getCustomTemplate()
          // this.$nextTick(() => {
          //   this.getInvoiceData()
          // })
        }
      },
      immediate: true,
    },
  },

  methods: {
    _isPropDateTime(value) {
      const props = ['date', 'dateTime', 'time']
      return props.includes(value)
    },
    showSymbol(prop, item) {
      const list = {
        return: 'fromSymbol',
        amount: 'toSymbol',
        received: 'fromSymbol',
        rate: 'rateFormat',
        exchangeAmount: 'fromSymbol',
      }

      if (prop == 'return' && !item[prop]) {
        return `0.00 ${item[list[prop]]}`
      }

      return item[list[prop]]
      // return -> fromSymbol,amount-> toSymbol ,received->fromSymbol,  rate-> rateFormat,exchangeAmount-> fromSymbol
    },
    addParentContent(type) {
      this.$store.dispatch('exchange/addNewParentContent', { type })
    },
    addChildContent(index, type) {
      this.$store.dispatch('exchange/addNewChildContent', { index, type })
    },
    handleUpdate({ parentIndex = null, childIndex = null, type = null }) {
      this.$store.dispatch('exchange/updateCurrentIndex', {
        parentIndex,
        childIndex,
        type,
      })
    },
    removeContent({ index, childIndex = null, type }) {
      const {
        parentIndex: parentIndex = null,
        childIndex: currChildIndex = null,
        type: currType = null,
      } = this.currentIndexFields

      if (
        (index == parentIndex && type == currType) ||
        childIndex == currChildIndex
      ) {
        this.$store.dispatch('exchange/updateCurrentIndex', {
          parentIndex: null,
          childIndex: null,
          type: null,
        })
      }
      //
      this.$store.dispatch('exchange/removeContent', {
        index,
        childIndex,
        type,
      })
    },
    getCustomTemplate() {
      const { call } = useMethod('ex.findCustomTemplate')

      call({
        selector: {
          branchId: this.currentBranchId.value,
        },
      })
        .then((result) => {
          // update state
          if (result) {
            this.$store.dispatch(
              'exchange/updateHeaders',
              result?.headers || []
            )
            this.$store.dispatch(
              'exchange/updateContents',
              result?.contents || []
            )
            this.$store.dispatch(
              'exchange/updateFooters',
              result?.footers || []
            )
          }
          // get data
          this.getInvoiceData()
        })
        .catch((error) => {
          console.log(error)
          // this.$store.dispatch('app/messageE', error)
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
    formateDateTime(val, prop) {
      let formatType = 'DD/MM/YYYY hh:mm:ss A'
      if (prop == 'date') {
        formatType = 'DD/MM/YYYY'
      } else if (prop == 'time') {
        formatType = 'LTS'
      }
      return moment(this.reportData.tranDate).format(formatType)
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
.location-name {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
}
.header-content {
  display: flex;
  flex-flow: row nowrap;
  border-bottom: 1px solid #bbb;
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
    /* .text {
      font-size: 12px;
      text-align: right;
      margin: 0 0;
      word-wrap: break-word;
      display: block;
      font-weight: bold;
      line-height: 22px;
    } */
  }
}

.logo {
  padding-top: 18px;
  .logo-img {
    width: 50px;
  }
}

table,
th,
td {
  margin: 0px;
  padding: 2px;
}

.footer {
  margin-top: auto;
  .thank-text {
    margin: 0;
    margin-top: 8px;
    font-size: 11px;
    text-align: center;
    /* line-height: 1.5; */
    font-weight: normal;
  }
  .footer-address {
    font-size: 12px;
  }
  .tran-date {
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    margin: 5px 0px 5px 0px;
  }

  .display-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.5;
  }

  .feed-back {
    border: 1px solid #000;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin: 5px 0px 5px 0px;
    line-height: 1.8;
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

/* Custom template */
.custom-template {
  margin: 0px;
  position: relative;
  .template-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.5;
  }

  .new-content {
    position: absolute;
    right: -100px;
    padding: 0px 5px;
  }
  /* Parent */
  .parent-tag {
    position: relative;

    .parent-action {
      position: absolute;
      right: -25px;
      display: flex;
      flex-direction: column;
      align-items: baseline;
      visibility: hidden;
      opacity: 0;
      transition: visibility 0s, opacity 0.5s linear;
    }

    /* Child */
    /* .child-tag {
      position: relative;

      .child-action {
        position: absolute;
        left: -55px;
        top: 0;
        display: flex;
        flex-direction: row-reverse;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s, opacity 0.5s linear;
      }
    } */
  }

  .parent-tag:hover .parent-action {
    visibility: visible;
    opacity: 1;
  }
  .parent-tag:hover {
    background: #f0f0f0;
    cursor: move;
  }

  /* .child-tag:hover .child-action {
    visibility: hidden;
    opacity: 1;
  } */
}
.description {
  text-transform: uppercase;
  margin: 0;
  line-height: 17px;
  font-size: 12px;
}

/* Draggable */
.ghost-class {
  opacity: 0.5;
  background: transparent;
}
</style>
