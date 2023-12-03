<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card shadow="never">
          <!-- Item Table -->
          <el-menu :default-active="defaultActive" class="menu-setting">
            <el-menu-item
              v-for="menu in menuItems"
              :key="menu.title"
              :index="menu.component"
              @click="handleSelect(menu)"
            >
              <i :class="`${menu.icon}`" />
              <span>{{ menu.title }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="19">
        <el-card shadow="never">
          <template #header>
            <div class="header">
              <span>{{ componentTitle }}</span>
            </div>
          </template>

          <!-- Dynamic Component -->
          <!-- <keep-alive> -->
          <component :is="defaultActive" />
          <!-- </keep-alive> -->
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from 'lodash'

// Component
import { ElRow, ElCol, ElCard, ElMenu, ElMenuItem } from 'element-plus'
import Category from './Category.vue'

export default {
  name: 'DemoSetting',
  components: {
    Category,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
    [ElCard.name]: ElCard,
    [ElMenu.name]: ElMenu,
    [ElMenuItem.name]: ElMenuItem,
  },
  data() {
    return {
      defaultActive: 'Category',
      componentTitle: 'Category',
      menuItems: [
        {
          title: 'Category',
          icon: 'fas fa-exchange-alt',
          component: 'Category',
        },
      ],
    }
  },
  created() {
    let activeCom = _.find(this.menuItems, {
      component: this.$route.params.active,
    })
    if (activeCom) {
      this.defaultActive = activeCom.component
      this.componentTitle = activeCom.title
    }
  },
  methods: {
    handleSelect(com) {
      this.componentTitle = com.title
      this.defaultActive = com.component
    },
  },
}
</script>

<style lang="scss" scoped>
.menu-setting {
  height: calc(100vh - 196px);
}
</style>
