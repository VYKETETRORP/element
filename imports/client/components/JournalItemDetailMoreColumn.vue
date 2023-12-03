<template>
  <el-popover placement="bottom-end" trigger="click">
    <el-checkbox-group v-model="checkedColumns" @change="changeVal">
      <el-checkbox
        v-for="col in columnOpts"
        :key="col.value"
        :label="col.value"
        style="display: block"
      >
        {{ col.label }}
      </el-checkbox>
    </el-checkbox-group>

    <template #reference>
      <i class="el-icon-menu popover-icon" />
    </template>
  </el-popover>
</template>
<script>
import { ElPopover, ElCheckbox, ElCheckboxGroup } from 'element-plus'
export default {
  name: 'TableHeaderComponet',

  components: {
    [ElPopover.name]: ElPopover,
    [ElCheckbox.name]: ElCheckbox,
    [ElCheckboxGroup.name]: ElCheckboxGroup,
  },

  props: {
    columns: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      checkedColumns: this.columns,
      columnOpts: [
        { label: 'More field 1', value: '1' },
        { label: 'More field 2', value: '2' },
        // { label: 'Account', value: 'chartAccountId' },
        // { label: 'DR', value: 'dr' },
        // { label: 'CR', value: 'cr' },
        // { label: 'Memo', value: 'memo' },
        // { lable: 'Class', value: 'classId' },
      ],
    }
  },
  watch: {
    columns(val) {
      this.checkedColumns = val
    },
  },
  methods: {
    changeVal(val) {
      this.$emit('changeColumn', val)
    },
  },
}
</script>
<style lang="scss" scoped>
.popover-icon {
  font-size: 16px;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
.el-checkbox + .el-checkbox {
  margin-left: 0px !important;
}
</style>
