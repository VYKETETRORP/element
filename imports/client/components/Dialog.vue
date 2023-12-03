<template>
  <el-dialog :model-value="dialogVisible" v-bind="parentAttrs">
    <component
      :is="currentDialog"
      v-bind="childProps"
      @save="handleFormSave"
      @cancel="handleDialogClose"
    />
  </el-dialog>
</template>
<script>
import _ from 'lodash'

// Component
import { ElDialog } from 'element-plus'
export default {
  name: 'Dialog1',

  components: {
    [ElDialog.name]: ElDialog,
  },

  data() {
    return {
      dialogVisible: false,
      currentDialog: null,
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
        isDialog: true,
        updateId: this.updateId,
        updateDoc: this.updateDoc,
      }
      return props
    },
  },

  methods: {
    open({ component, updateId = null, updateDoc = null, attrs = null }) {
      // Open modal
      this.dialogVisible = true

      // Child props
      this.updateId = updateId
      this.updateDoc = updateDoc

      // Parent Options
      this.parentAttrs = attrs
      this.parentAttrs = _.defaults(this.parentAttrs, {
        title: 'Dialog',
        fullscreen: true,
      })

      this.$nextTick(() => {
        this.currentDialog = component
      })
      // Promise fuction
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    handleFormSave(result) {
      // Return resolve
      this.resolve(result)
      // Close Modal
      this.dialogVisible = false
      this.$nextTick(() => {
        this.currentDialog = null
      })
    },
    handleDialogClose() {
      // Return resolve
      this.resolve(result)
      // Close Modal
      this.dialogVisible = false
      this.$nextTick(() => {
        this.currentDialog = null
      })
    },
  },
}
</script>
