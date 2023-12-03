<template>
  <div class="table-toolbar">
    <el-row>
      <el-col :span="colSpan.action">
        <!-- Action -->
        <slot name="action">
          <el-button type="primary" icon="plus" @click="$emit('new')">
            {{ $t('app.btn.new') }}
          </el-button>
        </slot>
      </el-col>
      <el-col :span="colSpan.filter" :offset="colSpanOffset" class="text-right">
        <!-- Filter -->
        <slot name="filter">
          <el-input v-model="filter" />
        </slot>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElButton, ElInput, ElRow, ElCol } from 'element-plus'
export default {
  name: 'TableToolbar',
  components: {
    [ElButton.name]: ElButton,
    [ElInput.name]: ElInput,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [{ value: '' }],
    },
    colSpan: {
      type: Object,
      default: () => ({ action: 16, filter: 4 }),
    },
  },
  data() {
    return {
      filter: this.modelValue[0]['value'],
      colSpanOffset: 24 - (this.colSpan.action + this.colSpan.filter),
    }
  },
  watch: {
    filter(val) {
      this.modelValue[0]['value'] = val
      this.$emit('update:modelValue', this.modelValue)
    },
  },
}
</script>

<style lang="scss" scoped></style>
