import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

import { cloneDeep } from 'lodash'
import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
// props
const propsDef = {
  chartType: {
    type: String,
    required: true,
  },
  chartData: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    required: true,
  },
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 400,
  },
}

export default defineComponent({
  name: 'Chart',
  props: propsDef,
  setup(props) {
    let chartInstance = shallowRef(Chart)
    const canvasRef = ref(HTMLCanvasElement)

    // Render
    function renderChart() {
      chartInstance.value = new Chart(canvasRef.value, {
        type: props.chartType,
        data: props.chartData,
        options: props.options,
      })
    }
    // Watch chartData
    watch(
      () => props.chartData,
      () => {
        chartInstance?.value?.update()
      },
      { deep: true }
    )
    // Watch options
    watch(
      () => props.options,
      (newOpts) => {
        if (chartInstance.value && newOpts) {
          chartInstance.value.options = cloneDeep(newOpts)
          chartInstance.value.update()
        }
      },
      { deep: true }
    )

    onMounted(renderChart)

    onBeforeUnmount(() => {
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
    })

    return () =>
      h(
        'div',
        {
          style: {
            maxWidth: '100%',
            position: 'relative',
          },
        },
        [
          h('canvas', {
            style: {
              maxWidth: '100%',
              maxHeight: '100%',
            },
            id: 'chart',
            width: props.width,
            height: props.height,
            ref: canvasRef,
          }),
        ]
      )
  },
})
