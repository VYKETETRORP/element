<template>
  <transition :name="'drawer-move-' + placement" @after-leave="afterLeave">
    <div
      v-show="visible"
      class="el-drawer__wrapper"
      @click.self="handleWrapperClick"
    >
      <div
        ref="drawer"
        class="el-drawer"
        :class="[
          {
            'el-drawer--center': center,
            'el-drawer__placementleft': placement === 'left',
            'el-drawer__placementright': placement === 'right',
          },
          customClass,
        ]"
        :style="style"
      >
        <div class="el-drawer__header">
          <slot name="title">
            <span class="el-drawer__title">
              {{ title }}
            </span>
          </slot>
          <button
            v-if="showClose"
            type="button"
            class="el-drawer__headerbtn"
            aria-label="Close"
            @click="handleClose"
          >
            <i class="el-drawer__close el-icon el-icon-close" />
          </button>
        </div>
        <div v-if="rendered" class="el-drawer__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="el-drawer__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from 'element-plus/src/utils/popup'
import Migrating from 'element-plusus/src/mixins/migrating'
import emitter from 'element-plusus/src/mixins/emitter'
export default {
  name: 'ElDrawer',
  mixins: [Popup, emitter, Migrating],
  props: {
    title: {
      type: String,
      default: '',
    },
    modal: {
      type: Boolean,
      default: true,
    },
    modalAppendToBody: {
      type: Boolean,
      default: true,
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '25%',
    },
    placement: {
      type: String,
      default: 'right',
      validator(value) {
        return ['left', 'right'].indexOf(value) !== -1
      },
    },
    customClass: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '15vh',
    },
    beforeClose: Function,
    center: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      closed: false,
    }
  },
  computed: {
    style() {
      let style = {}
      style.width = this.width
      return style
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.closed = false
        this.$emit('open')
        this.$el.addEventListener('scroll', this.updatePopper)
        this.$nextTick(() => {
          this.$refs.drawer.scrollTop = 0
        })
        if (this.appendToBody) {
          document.body.appendChild(this.$el)
        }
      } else {
        this.$el.removeEventListener('scroll', this.updatePopper)
        if (!this.closed) this.$emit('close')
      }
    },
  },
  mounted() {
    if (this.visible) {
      this.rendered = true
      this.open()
      if (this.appendToBody) {
        document.body.appendChild(this.$el)
      }
    }
  },
  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    getMigratingConfig() {
      return {
        props: {
          size: 'size is removed.',
        },
      }
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return
      this.handleClose()
    },
    handleClose() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide)
      } else {
        this.hide()
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false)
        this.$emit('close')
        this.closed = true
      }
    },
    updatePopper() {
      this.broadcast('ElSelectDropdown', 'updatePopper')
      this.broadcast('ElDropdownMenu', 'updatePopper')
    },
    afterLeave() {
      this.$emit('closed')
    },
  },
}
</script>
