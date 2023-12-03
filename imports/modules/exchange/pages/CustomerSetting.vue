<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card
          shadow="never"
          class="card-overflow"
        >
          <!-- Item Table -->
          <el-menu
            :default-active="activeCom"
            class="menu-setting"
          >
            <template
              v-for="menu in menuItems"
              :key="menu.title"
            >
              <el-menu-item
                v-if="menu.roles ? $userIsInRole(menu.roles) : true"
                :index="menu.component"
                @click="handleSelect(menu)"
              >
                <i :class="`${menu.icon}`" />
                <span>
                  {{ $t(`exchange.customer-setting.${menu.title}`) }}
                </span>
              </el-menu-item>
            </template>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="19">
        <el-card
          shadow="never"
          class="card-overflow"
        >
          <template #header>
            <div class="header">
              <span>
                <!-- <i
                v-if="comIcon"
                :class="comIcon"
              /> -->
                <!-- {{ comTitle }} -->

                {{ $t(`exchange.customer-setting.${comTitle}`) }}
              </span>
            </div>
          </template>
          <!-- Dynamic Component -->
          <!-- <keep-alive> -->
          <component
            :is="activeCom"
            v-bind="parentProp"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from 'lodash'
import Provider from './Provider.vue'
import ExchangeCurrency from './ExchangeCurrency.vue'
import AdvanceForm from './AdvanceForm.vue'
import CustomTemplate from './CustomTemplate.vue'
import TranType from './TransactionType.vue'
import FeeCharges from './FeeCharges.vue'
// Components
import { ElCard, ElMenu, ElMenuItem, ElRow, ElCol } from 'element-plus'

export default {
  name: 'CustomerSetting',
  components: {
    ElCard,
    ElMenu,
    ElMenuItem,
    ElRow,
    ElCol,
    Provider,
    ExchangeCurrency,
    AdvanceForm,
    CustomTemplate,
    TranType,
    FeeCharges,
  },
  data() {
    return {
      activeCom: 'Provider',
      comTitle: 'Provider',
      comIcon: 'fas fa-exchange-alt',
      menuItems: [
        {
          title: 'Provider',
          icon: 'fal fa-users',
          component: 'Provider',
          roles: ['provider-insert', 'provider-update', 'provider-remove'],
        },
        {
          title: 'ExchangeCurrency',
          icon: 'fal fa-money-bill-alt',
          component: 'ExchangeCurrency',
          roles: [
            'exchange-currency-insert',
            'exchange-currency-update',
            'exchange-currency-remove',
          ],
        },
        {
          title: 'Transaction Type',
          icon: 'fal fa-users',
          component: 'TranType',
          // roles: ['account-setting'],
        },
        {
          title: 'Fee Charge',
          icon: 'fal fa-money-bill-alt',
          component: 'FeeCharges',
          roles: [
            'fee-charge-insert',
            'fee-charge-update',
            'fee-charge-remove',
          ],
        },
        {
          title: 'Advance',
          icon: 'fal fa-sliders-h',

          component: 'AdvanceForm',
          // roles: ['account-setting'],
        },
        {
          title: 'Custom Template',
          icon: 'fal fa-object-group',
          component: 'CustomTemplate',
          // roles: ['account-setting'],
        },
      ],
      parentProp: {},
    }
  },
  created() {
    const activeCom = _.find(this.menuItems, {
      component: this.$route.params.active,
    })
    if (activeCom) {
      this.activeCom = activeCom.component
      this.comTitle = activeCom.title
      this.comIcon = activeCom.icon
    }
  },
  methods: {
    handleSelect(com) {
      // Check parent prop
      if (com.title === 'Import Data') {
        this.parentProp = {
          typeOpts: [
            { label: 'Account Type', value: 'AccountType' },
            { label: 'Chart of Account', value: 'ChartOfAccount' },
          ],
          defaultType: 'AccountType',
          sampleFile: 'Accounting_Import.xlsx',
        }
      } else if (com.title === 'Reset Data') {
        this.parentProp.resetType = 'Accounting'
      }
      if (com.title === 'Template') {
        this.parentProp = {
          visiblePrintInvoice: true,
        }
      }

      this.comTitle = com.title
      this.comIcon = com.icon
      this.activeCom = com.component
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
.card-overflow {
  overflow: auto;
  height: calc(100vh - 155px);
}

.menu-setting {
  border-right: 0;
  .el-menu-item {
    transition: none !important;
    border-radius: 10px;
    height: 42px;
    line-height: 42px;
    font-weight: 500;
    margin: 0 0 8px 0;
    padding: 0 12px !important;
    i {
      color: #7b7b7b;
      margin-right: 8px;
    }

    &.is-active {
      color: #fff;
      background-color: #1890ff;
      i {
        color: #fff;
      }
    }
  }
}
</style>
