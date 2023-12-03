<template>
  <!-- :value="displayValue" v-model="model" v-on="listeners"-->
  <el-input-number
    ref="input"
    :value="displayValue"
    v-bind="$attrs"
    @blur="handleBlur"
    @focus="handleFocus"
    @input="handleInput"
    @change="handleInputChange"
  />
</template>

<script>
import _ from 'lodash'

import { ElInputNumber } from 'element-plus'

export default {
  name: '[ElInputNumber',

  emits: ['input', 'blur', 'focus', 'change'],

  components: {
    [ElInputNumber]: ElInputNumber,
  },
  inheritAttrs: false,

  props: {
    value: {},
  },

  data() {
    return {
      currentValue: 0,
      userInput: null,
    }
  },

  computed: {
    displayValue() {
      if (this.userInput !== null) {
        return this.userInput
      }
      let currentValue = this.currentValue
      if (typeof currentValue === 'number') {
        if (this.getPrecision(currentValue) >= 7) {
          currentValue = _.round(currentValue, 7)
        }
      }
      return currentValue
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(value) {
        let newVal = value === undefined ? value : Number(value)
        if (newVal !== undefined) {
          if (isNaN(newVal)) {
            return
          }
        }

        if (this.getPrecision(newVal) >= 7) {
          newVal = _.round(newVal, 7)
        }

        this.currentValue = newVal
        this.userInput = null
        this.$emit('input', newVal)
      },
    },
  },

  methods: {
    getPrecision(num) {
      let numAsStr = _.toString(num)
      numAsStr = numAsStr.replace(/0+$/g, '')

      let strArr = numAsStr.split('.')

      return strArr.length >= 2 ? strArr[1].length : 0
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    setCurrentValue(newVal) {
      const oldVal = this.currentValue
      if (typeof newVal === 'number' && this.getPrecision(newVal) >= 7) {
        newVal = _.round(newVal, 7)
      }

      if (oldVal === newVal) return
      this.userInput = null
      this.$emit('input', newVal)
      this.$emit('change', newVal, oldVal)
      this.currentValue = newVal
    },
    handleInput(value) {
      this.userInput = value
    },
    handleInputChange(value) {
      let newVal = value === undefined ? undefined : Number(value)

      if (!isNaN(newVal) || value === undefined) {
        this.setCurrentValue(newVal)
      }

      this.userInput = null
    },

    // Method
    select() {
      this.$refs.input.select()
    },
    focus() {
      this.$refs.input.focus()
    },
  },
}
</script>

<style></style>
