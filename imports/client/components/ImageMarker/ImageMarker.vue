<template>
  <div class="page_content">
    <div
      v-show="!visiblePrinting"
      class="toolbar"
    >
      <div class="toolbar_left">
        <!-- <div
          id="add_pos_marker"
          class="toolbar_btn btn_color"
          @click="addLeftMarker"
        >
          {{ labelLeft }}
        </div>
         <div
          id="add_neg_marker"
          class="toolbar_btn btn_color"
          @click="addRightMarker"
        >
          {{ labelRight }}
        </div> -->
        <ElButton
          type="primary"
          @click="addLeftMarker"
        >
          {{ labelLeft }}
        </ElButton>
        <ElButton
          type="primary"
          @click="addRightMarker"
        >
          {{ labelRight }}
        </ElButton>
      </div>
    </div>

    <!-- Body -->
    <div class="image-marker-container">
      <!-- Left -->
      <div
        class="image-marker-container__box image-marker-container__box--left"
      >
        <div
          ref="leftTextBox"
          class="image-marker-container__box__content"
        >
          <template
            v-for="(pos, i) in list.filter((it) => it.col == 1)"
            :key="i"
          >
            <!--  :ref="`textBox${pos.no}`"
            ខុសពេល remove
            :ref="(el) => {textBoxs[pos.no] = el}"
            -->
            <div
              :id="`textBox${pos.no}`"
              class="image-marker__text-box green ui-draggable ui-draggable-handle"
              style="visibility: visible; position: relative"
            >
              <TextBox
                ref="textBox"
                v-model="pos.content"
                class="image-marker__text-box__content"
                :style="{ 'font-size': visiblePrinting ? '20px' : '14px' }"
                :placeholder="placeholder"
                @focus="setFocus"
              />

              <i
                class="fal fa-times image-marker__text-box__close-btn"
                @click="removeComment(pos)"
              ></i>
            </div>
          </template>
        </div>
      </div>

      <!-- Right -->
      <div
        class="image-marker-container__box image-marker-container__box--right"
      >
        <div
          ref="rightTextBox"
          class="image-marker-container__box__content"
        >
          <template
            v-for="(neg, i) in list.filter((it) => it.col == 2)"
            :key="i"
          >
            <!--
              ខុសពេល remove
            :ref="(el) => {textBoxs[neg.no] = el}"
            -->
            <div
              :id="`textBox${neg.no}`"
              class="image-marker__text-box yellow ui-draggable ui-draggable-handle"
              style="visibility: visible; position: relative"
            >
              <TextBox
                ref="textBox"
                v-model="neg.content"
                class="image-marker__text-box__content"
                :style="{ 'font-size': visiblePrinting ? '20px' : '14px' }"
                :placeholder="placeholder"
                @focus="setFocus"
              />
              <i
                class="fal fa-times image-marker__text-box__close-btn"
                @click="removeComment(neg)"
              ></i>
            </div>
          </template>
        </div>
      </div>

      <!-- Image -->
      <div
        ref="dragArea"
        class="image-marker-container__box image-marker-container__box--image"
      >
        <img
          class="image-marker-container__img"
          :src="imgSrc"
        />
        <div
          class="image-marker-container__box image-marker-container__box--drag"
        >
          <template
            v-for="(it, index) of list"
            :key="index"
          >
            <!-- :ref="`line${it.no}`"
            :ref="(el) => {lines[it.no] = el}"
            -->
            <div
              :id="`line${it.no}`"
              :class="`image-marker__line ${it.col == 1 ? 'green' : 'yellow'}`"
            ></div>
            <!-- :ref="`dot${it.no}`"
            ខុសពេល remove
            :ref="(el) => {dots[it.no] = el}"
            -->
            <div
              :id="`dot${it.no}`"
              :class="`image-marker__dot ${
                it.col == 1 ? 'green' : 'yellow'
              } ui-draggable ui-draggable-handle`"
              @mousedown="(e) => dragMouseDown(e, it)"
            ></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
/**
 * Component name in script setup
 * https://github.com/vuejs/rfcs/discussions/273
 */
import $ from 'jquery'

import { computed, nextTick, ref, watch } from 'vue'
import TextBox from './TextBox.vue'
import { ElButton } from 'element-plus'

interface marker {
  no: number
  content: string
  col: number
  pos?: {
    x: number
    y: number
  }
}

const props = withDefaults(
  defineProps<{
    imgSrc?: string
    modelValue: Array<marker>
    placeholder?: string
    labelLeft?: string
    labelRight?: string
    visiblePrinting?: boolean
  }>(),
  {
    imgSrc: '',
    placeholder: 'Comment here...',
    labelLeft: 'Add Left',
    labelRight: 'Add Right',
    visiblePrinting: false,
  }
)

const leftTextBox = ref<HTMLDivElement>()
const rightTextBox = ref<HTMLDivElement>()
const dragArea = ref<HTMLDivElement>()
const dragoffset = ref<{
  x: number
  y: number
}>({ x: 0, y: 0 })

/***
   * អត់ត្រូវពេលដែរ remove
    const textBoxs = ref<Array<HTMLDivElement>>([])
    const dots = ref<Array<HTMLDivElement>>([])
    const lines = ref<Array<HTMLDivElement>>([])
*/

const list = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: Array<marker>): void
}>()

watch(
  list,
  (details) => {
    nextTick(() => {
      if (details.length) {
        for (const it of details) {
          addCommentMarker(it)
        }
      }
    })
  },
  {
    immediate: true,
    // deep: true, // ពេលដែល move dot ទាក់ៗ
  }
)

const addLeftMarker = () => {
  const no = maxNo()
  const marker = {
    no,
    content: '',
    col: 1,
  }

  list.value.push(marker)

  nextTick(() => {
    addCommentMarker(marker)
  })
}
const addRightMarker = () => {
  const no = maxNo()
  const marker = {
    no,
    content: '',
    col: 2,
  }

  list.value.push(marker)

  nextTick(() => {
    addCommentMarker(marker)
  })
}

const maxNo = () => {
  const ls = list.value.map((it) => it['no'])
  if (!ls?.length) return 1

  const res = Math.max(...ls) || 0

  return res + 1
}

const removeComment = (marker: marker) => {
  const no = marker.no
  const index = list.value.findIndex((it) => it['no'] == no)

  list.value.splice(index, 1)

  // after remove
  nextTick(() => {
    if (list.value.length) {
      for (const it of list.value) {
        addCommentMarker(it)
      }
    }
  })
}
// Input
const setFocus = (e) => {
  window.getSelection()?.selectAllChildren(e.target)
}

const dragMouseDown = (e: MouseEvent, marker: marker) => {
  // event
  e.preventDefault()
  // const el = dots.value[marker.no]
  const el: any = document.querySelector(`#dot${marker.no}`)
  if (!el) return false

  const scrollLR: number = document.documentElement.scrollLeft
    ? document.documentElement.scrollLeft || 0
    : dragArea.value?.scrollLeft || 0
  const scrollLT: number = document.documentElement.scrollTop
    ? document.documentElement.scrollTop || 0
    : dragArea.value?.scrollTop || 0

  const pageX = e.pageX || e.clientX + scrollLR
  const pageY = e.pageY || e.clientY + scrollLT

  dragoffset.value.x = pageX - el.offsetLeft
  dragoffset.value.y = pageY - el.offsetTop

  // get the mouse cursor position at startup:
  document.onmousemove = (e) => elementDrag(e, marker)
  document.onmouseup = closeDragElement
}

const elementDrag = (e: MouseEvent, marker: marker) => {
  // Limit draggable area
  const { offsetX, offsetY } = limitDraggable(e, marker)

  marker.pos = {
    x: offsetX,
    y: offsetY,
  }

  //
  addCommentMarker(marker)
}

const addCommentMarker = (marker: marker) => {
  const index = marker.no

  /***
   * អត់ត្រូវពេលដែរ remove
  // const textBox = textBoxs.value[index]
  // const dot = dots.value[index]
  // const line = lines.value[index]
    */
  const textBox: any = document.querySelector(`#textBox${index}`)
  const dot: any = document.querySelector(`#dot${index}`)
  const line: any = document.querySelector(`#line${index}`)
  if (!textBox || !dot || !line) return false

  const $textBox: any = $(textBox)
  const $dot: any = $(dot)
  const $line = $(line)

  const onDrag = () => {
    // set the element's new position:
    const textBoxOffset =
      $textBox.parent()[0] == leftTextBox.value
        ? $textBox.parent().width() - 4
        : 4

    let x1 = $textBox.offset().left + textBoxOffset
    let y1 = $textBox.offset().top + $textBox.height() / 2
    const x2 = $dot.offset().left + $dot.width() / 2
    const y2 = $dot.offset().top + $dot.height() / 2

    const hypotenuse = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI)
    const transform = `rotate(${angle}deg)`

    if (angle >= 90 && angle < 180) {
      y1 = y1 - (y1 - y2)
    }
    if (angle > 0 && angle < 90) {
      x1 = x1 - (x1 - x2)
      y1 = y1 - (y1 - y2)
    }
    if (angle <= 0 && angle > -90) {
      x1 = x1 - (x1 - x2)
    }

    $line
      .queue(function () {
        $(this).offset({ top: y1, left: x1 })
        $(this).dequeue()
      })
      .queue(function () {
        $(this).width(hypotenuse)
        $(this).dequeue()
      })
    // .queue(function () {
    //   $(this).rotate(angle)
    //   $(this).dequeue()
    // })
    $line.css({ transform: transform })
  }

  mountTo($textBox, $dot, onDrag, marker)
}

const mountTo = (
  $textBox: any,
  $dot: any,
  onDrag: () => void,
  marker: marker
) => {
  // limit content in box
  const dom = marker.col == 1 ? leftTextBox.value : rightTextBox.value
  const $target: any = $(dom as HTMLDivElement)
  if ($target.height() > $target.parent().height()) {
    removeComment(marker)
    return false
  }

  if (!marker.pos) {
    const divDragArea: JQuery<HTMLDivElement> = $(
      dragArea.value as HTMLDivElement
    )
    marker.pos = {
      x:
        $textBox.parent()[0] == leftTextBox.value
          ? 0
          : divDragArea?.width() || 0 - 20, //- 20
      y:
        $textBox.offset().top -
        $textBox.parent().offset().top +
        $textBox.height() / 2 -
        8, // -10
    }
  }

  $dot.css({ top: `${marker.pos.y}px`, left: `${marker.pos.x}px` })

  onDrag()
  onDrag()
}
const limitDraggable = (e: MouseEvent, marker: marker) => {
  // const dot = dots.value[marker.no]
  const dot: any = document.querySelector(`#dot${marker.no}`)

  // limit draggable area
  const scrollLeft: number = document.documentElement.scrollLeft
    ? document.documentElement.scrollLeft || 0
    : dragArea.value?.scrollLeft || 0
  const scrollTop: number = document.documentElement.scrollTop
    ? document.documentElement.scrollTop || 0
    : dragArea.value?.scrollTop || 0

  const pageX = e.pageX || e.clientX + scrollLeft
  const pageY = e.pageY || e.clientY + scrollTop
  // left/right constraint
  let offsetX = 0,
    offsetY = 0

  const clientWidth: number = dragArea.value?.clientWidth || 0
  if (pageX - dragoffset.value.x < 0) {
    offsetX = 0
  } else if (pageX - dragoffset.value.x + dot.clientWidth > clientWidth) {
    offsetX = clientWidth - dot.clientWidth
  } else {
    offsetX = pageX - dragoffset.value.x
  }

  // top/bottom constraint
  const height: number = dragArea.value?.clientHeight || 0
  if (pageY - dragoffset.value.y < 0) {
    offsetY = 0
  } else if (pageY - dragoffset.value.y + dot.clientWidth > height) {
    offsetY = height - dot.clientWidth
  } else {
    offsetY = e.pageY - dragoffset.value.y
  }

  return { offsetX, offsetY }
}
const closeDragElement = () => {
  document.onmouseup = null
  document.onmousemove = null
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style
  scoped
  lang="scss"
>
$green: var(--el-color-success);
$yellow: var(--el-color-warning);

.image-marker-container {
  width: 100%;
  height: 500px;
  overflow: hidden;
  position: relative;
}

.image-marker-container__box {
  position: absolute;
  border: 1px solid #ddd;
  border-radius: 6px;
  top: 1px;
  bottom: 1px;
}

.image-marker-container__box__content {
  position: relative;
}

.image-marker-container__box--left {
  left: 0;
  width: 30%;
}

.image-marker-container__box--right {
  right: 0;
  width: 30%;
}

.image-marker-container__box--image {
  left: 31%;
  right: 31%;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAQUlEQVQYV2NkIABWrVr1H6SEEZ86mKKwsDBGnAqRFeE0EV0RVoXYFGEoxKUIRSE+RXCFhBSBFRKjCK4QFE6EwhMA6fIqBUB9cUAAAAAASUVORK5CYII=);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-marker-container__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.image-marker-container__box--drag {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border: none;
}

.image-marker__text-box {
  margin-bottom: 10px;
}

.image-marker__text-box__close-btn {
  position: absolute;
  right: 2%;
  top: 35%;
  cursor: pointer;
  display: none;
}

.image-marker__text-box:hover .image-marker__text-box__close-btn {
  display: block;
  color: #f5222d;
}

.image-marker-container__box--left .image-marker__text-box {
  border-width: 6px;
  border-style: solid;
  border-top: 0;
  border-left: 0;
  border-bottom: 0;
}

.image-marker-container__box--right .image-marker__text-box {
  border-width: 6px;
  border-style: solid;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
}

.image-marker__text-box__content {
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #444;
  padding: 10px;
  margin: 0;
  line-height: 18px;
  text-align: center;
}

.image-marker__dot {
  width: 16px;
  height: 16px;
  /* opacity: 0.5; */
  cursor: move;
  border-radius: 50%;
  position: absolute;
}

.image-marker__line {
  height: 2px;
  opacity: 0.5;
  position: absolute;
}

/* === */
.page_content {
  max-width: 1300px;
  margin: 0px auto;
  position: relative;
  overflow: auto;
}

.toolbar {
  min-height: 32px;
  margin: 9px 0 9px 10px;
  line-height: 32px;
  font-size: 16px;
  overflow: auto;
}

.toolbar_left {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*.toolbar_btn {
  float: left;
  padding: 0 10px;
  line-height: 30px;
  margin-right: 10px;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  background-repeat: no-repeat;
}

.btn_color {
  background-color: var(--el-color-primary);
  margin: 1px 10px 0 0;
  height: 30px;
} */

.yellow {
  background-color: rgba(255, 145, 0, 0.15);
  /* border-color: #ff9100; */
  border-color: $yellow;
}

.green {
  background-color: rgba(125, 189, 59, 0.15);
  /* border-color: #7dbd3b; */
  border-color: $green;
}

.image-marker__dot.yellow,
.image-marker__line.yellow {
  /* background-color: #ff9100; */
  background-color: $yellow;
}

.image-marker__dot.green,
.image-marker__line.green {
  /* background-color: #7dbd3b; */
  background-color: $green;
}

/* placeholder code */
[contentEditable='true']:empty:before {
  content: attr(placeholder);
  opacity: 0.7;
}
</style>
