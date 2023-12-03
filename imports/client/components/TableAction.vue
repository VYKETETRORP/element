<template>
     <div class="bar-action">
    <el-dropdown
      v-if="actions.length"
      trigger="click"
      @command="handleTableAction"
    >
      <span class="el-dropdown-link">
        <i class="fa fa-bars" />
      </span>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(action, index) in actions"
            :key="index"
            :command="{ action, row }"
          >
            {{ startCase(action) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { startCase } from 'lodash'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
export default {
  name: 'TableAction',

  components: {
    [ElDropdown.name]: ElDropdown,
    [ElDropdownMenu.name]: ElDropdownMenu,
    [ElDropdownItem.name]: ElDropdownItem,
  },

  props: {
    row: {
      type: Object,
      default: null,
    },
    actions: {
      type: Array,
      default() {
        return ['edit', 'softRemove', 'restore', 'remove']
      },
    },
  },
  methods: {
    handleTableAction(command) {
      this.$emit('action-click', command)
    },
    startCase(val) {
      return startCase(val)
    },
  },
}
</script>

<style lang="scss" scoped></style>
