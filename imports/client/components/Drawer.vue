<template>
  <div>
    <el-drawer v-model="drawerVisible" v-bind="parentAttrs">
      <!-- Component -->
      <component
        :is="currentDrawer"
        v-bind="childProps"
        @save="handleFormSave"
        @cancel="handleDrawerClose"
      />
    </el-drawer>
  </div>
</template>
<script>
import _ from 'lodash'

// Component
import { ElDrawer } from 'element-plus'
export default {
  name: 'Drawer',

  components: {
    [ElDrawer.name]: ElDrawer,
  },

  data() {
    return {
      drawerVisible: false,
      currentDrawer: null,
      // Child props
      updateId: null,
      updateDoc: null,
      // Options
      parentAttrs: {},
      // Return promise
      resolve: null,
      reject: null,
    }
  },

  computed: {
    childProps() {
      let props = {
        isDrawer: true,
        updateId: this.updateId,
        updateDoc: this.updateDoc,
      }
      return props
    },
  },

  methods: {
    open({ component, updateId = null, updateDoc = null, attrs = null }) {
      // Open modal
      this.drawerVisible = true

      // Child props
      this.updateId = updateId
      this.updateDoc = updateDoc

      // Parent Options
      this.parentAttrs = attrs
      this.parentAttrs = _.defaults(this.parentAttrs, {
        title: 'Drawer',
        direction: 'rtl',
      })
      // this.width = width
      this.$nextTick(() => {
        this.currentDrawer = component
      })

      // Promise fuction
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },

    // Form save
    handleFormSave(result) {
      // Return resolve
      this.resolve(result)
      // Close Modal
      this.drawerVisible = false
      this.$nextTick(() => {
        this.currentDrawer = null
      })
    },

    // Model close
    handleDrawerClose() {
      // Return resolve
      this.resolve(false)
      // Close Modal
      this.drawerVisible = false
      this.$nextTick(() => {
        this.currentDrawer = null
      })
    },
  },
}
</script>
