<template>
  <el-input
    ref="inputRef"
    :model-value="displayValue"
    v-bind="$attrs"
    :formatter="formatter"
    :parser="handleParser"
    :input-style="`text-align: right; ${inputStyle}`"
    @input="handleInput"
    @change="handleInputChange"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<!-- <script lang="ts">
export default {
  name: 'InputNumberMask',
  inheritAttrs: false,
}
</script> -->

<script
  setup
  lang="ts"
>
import { ref, computed, watch, type PropType } from 'vue'
import { isString, isNumber, isNil, isUndefined } from 'lodash'
import { useStore } from '/imports/store'
import { ElInput, InputProps } from 'element-plus'

type Props = InputProps & {
  modelValue: number
  min: number
  max: number
  valueOnClear: 'min' | 'max' | number | null
  precision: number
  zeroPrecision: boolean
}

const props = defineProps({
  modelValue: Number,
  min: {
    type: Number,
    default: Number.NEGATIVE_INFINITY,
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY,
  },
  valueOnClear: {
    type: [String, Number, null] as PropType<Props['valueOnClear']>,
    validator: (val: Exclude<Props['valueOnClear'], undefined>) =>
      val === null || isNumber(val) || ['min', 'max'].includes(val),
    default: null,
  },
  precision: {
    type: Number,
    validator: (val: number) => val === Number.parseInt(`${val}`, 10),
  },
  inputStyle: {
    type: String,
  },
  zeroPrecision: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void
  (e: 'input', value: number | null | undefined): void
  (e: 'blur', value: FocusEvent): FocusEvent
  (e: 'focus', value: FocusEvent): FocusEvent
  (e: 'change', curr: number | undefined, prev: number | undefined): void
}>()

// State
const store = useStore()
const inputRef = ref()
const currentValue = ref<number | null | undefined>(0)
const userInput = ref<null | number | string>(null)

const numPrecision = computed(() => {
  const precision = isNumber(props.precision) ? props.precision : undefined
  //store.getters['app/companySetting'] || 2

  return precision && precision > 0 ? precision : undefined
})

const displayValue = computed(() => {
  if (userInput.value !== null) {
    return userInput.value
  }

  let currValue: number | string | undefined | null = currentValue.value
  if (isNil(currValue)) return ''
  if (isNumber(currValue)) {
    if (Number.isNaN(currValue)) return ''
    if (!isUndefined(numPrecision.value)) {
      currValue = currValue.toFixed(numPrecision.value)

      // true not show 123.00-> 123 , if false show 123.00
      if (props.zeroPrecision) {
        currValue = currValue.replace(/\.0+$/, '') || 0
      }
    }
  }
  return currValue
})
const toPrecision = (num: number, pre?: number) => {
  if (isUndefined(pre)) pre = numPrecision.value
  if (pre === 0) return Math.round(num)
  let snum = String(num)
  const pointPos = snum.indexOf('.')
  if (pointPos === -1) return num
  const nums = snum.replace('.', '').split('')
  const datum = nums[pointPos + (pre as number)]
  if (!datum) return num
  const length = snum.length
  if (snum.charAt(length - 1) === '5') {
    snum = `${snum.slice(0, Math.max(0, length - 1))}6`
  }
  return Number.parseFloat(Number(snum).toFixed(pre))
}
// const getPrecision = (value: number | null | undefined) => {
//   if (isNil(value)) return 0
//   const valueString = value.toString()
//   const dotPosition = valueString.indexOf('.')
//   let precision = 0
//   if (dotPosition !== -1) {
//     precision = valueString.length - dotPosition - 1
//   }
//   return precision
// }
const verifyValue = (
  value: number | string | null | undefined,
  update?: boolean
): number | null | undefined => {
  const { max, min, valueOnClear } = props

  if (max < min) {
    console.warn('Input Number', 'min should not be greater than max.')
  }

  let strValue = value
  if (typeof value == 'string') strValue = handleParser(value) || 0
  let newVal = Number(strValue)

  if (isNil(value) || Number.isNaN(newVal)) {
    return null
  }
  if (value === '') {
    if (valueOnClear === null) {
      return null
    }
    newVal = isString(valueOnClear) ? { min, max }[valueOnClear] : valueOnClear
  }

  if (!isUndefined(numPrecision.value)) {
    newVal = toPrecision(newVal, numPrecision.value)
  }

  if (newVal > max || newVal < min) {
    newVal = newVal > max ? max : min
    update && emit('update:modelValue', newVal)
  }

  return newVal
}

const setCurrentValue = (
  value: number | string | null | undefined,
  emitChange = true
) => {
  const oldVal = currentValue.value
  const newVal = verifyValue(value)
  if (!emitChange) {
    emit('update:modelValue', newVal!)
    return
  }
  if (oldVal === newVal) {
    return
  }

  userInput.value = null
  emit('update:modelValue', newVal!)
  emit('change', newVal!, oldVal!)
  currentValue.value = newVal
}
const handleInput = (value: string) => {
  userInput.value = value
  const newVal = value === '' ? null : Number(value)
  emit('input', newVal)
  setCurrentValue(newVal, false)
}
const handleInputChange = (value: string) => {
  const newVal = value !== '' ? Number(handleParser(value) || 0) : ''
  if ((isNumber(newVal) && !Number.isNaN(newVal)) || value === '') {
    setCurrentValue(newVal)
  }

  userInput.value = null
}
const handleParser = (value: string) => {
  // Split and rejoin, keeping only first (.)
  const splitStr = value.split('.')
  let parsedStr = splitStr[0]
  if (splitStr.length) {
    parsedStr = splitStr.splice(0, 2).join('.') + splitStr.join('')
  }

  // Remove all non-numeric characters
  // n.replace(/\.0+$/, "");

  return parsedStr.replace(/[^\d.]+/g, '')
}
const handleBlur = (event: MouseEvent | FocusEvent) => {
  emit('blur', event)
}
const handleFocus = (event: MouseEvent | FocusEvent) => {
  emit('focus', event)
}
const formatter = (value: string) => {
  return `${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
}

// Method
const select = () => {
  inputRef.value.select()
}
const focus = () => {
  inputRef.value.focus()
}

watch(
  () => props.modelValue,
  (value) => {
    const userInputValue = verifyValue(userInput.value)
    const newValue = verifyValue(value, true)
    if (
      !isNumber(userInputValue) &&
      (!userInputValue || userInputValue !== newValue)
    ) {
      currentValue.value = newValue
      userInput.value = null
    }
  },
  {
    immediate: true,
  }
)

// Expose
defineExpose({
  select,
  focus,
})
</script>
