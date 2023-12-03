<template>
  <div
    :style="isFullscreen ? [wrapperStyle] : []"
    :class="isFullscreen ? [fullscreenClass] : []"
    @click="shadeClick($event)"
  >
    <slot />
  </div>
</template>
<script>
import {
  supportFullScreen,
  fullScreenStatus,
  requestFullscreen,
  exitFullscreen,
  onFullScreenEvent,
  offFullScreenEvent,
} from '../lib/fullScreen'
export default {
  props: {
    background: {
      type: String,
      default: '#333',
    },
    fullscreenClass: {
      type: String,
      default: 'fullscreen',
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      supportFullScreen: false,
      isFullscreen: false,
    }
  },
  computed: {
    wrapperStyle() {
      return {
        background: this.background,
        'overflow-y': 'auto',
        width: '100%',
        height: '100%',
      }
    },
  },
  watch: {
    fullscreen(value) {
      if (value !== fullScreenStatus()) {
        value ? this.enter() : this.exit()
      }
    },
  },
  created() {
    this.supportFullScreen = supportFullScreen()
  },
  methods: {
    toggle(value) {
      if (value === undefined) {
        // If it is already in full screen state, exit
        if (fullScreenStatus()) {
          this.exit()
        } else {
          this.enter()
        }
      } else {
        value ? this.enter() : this.exit()
      }
    },
    enter() {
      if (!this.supportFullScreen) {
        return
      }
      onFullScreenEvent(this.fullScreenCallback)
      requestFullscreen(this.$el)
    },
    exit() {
      if (!this.supportFullScreen || !this.getState()) {
        return
      }
      exitFullscreen()
    },
    getState() {
      return fullScreenStatus()
    },

    shadeClick(e) {
      // Exist fullscreen
      if (e.target === this.$el) {
        this.exit()
      }
    },
    fullScreenCallback() {
      this.isFullscreen = fullScreenStatus()
      if (!this.isFullscreen) {
        // Unbind callback when exiting full screen
        offFullScreenEvent(this.fullScreenCallback)
      }
      this.$emit('change', this.isFullscreen)
      this.$emit('update:fullscreen', this.isFullscreen)
    },
  },
}
</script>
