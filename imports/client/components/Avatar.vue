<template>
  <div
    class="vue-avatar--wrapper"
    :style="[style, customStyle]"
    aria-hidden="true"
  >
    <img v-if="isImage" style="display: none" :src="src" @error="onImgError" />
    <span v-show="!isImage">{{ userInitial }}</span>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'

const getInitials = (username) => {
  let parts = username.split(/[ -]/)
  let initials = ''

  for (let i = 0; i < parts.length; i++) {
    initials += parts[i].charAt(0)
  }

  if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '')
  }

  initials = initials.substr(0, 3).toUpperCase()

  return initials
}

export default defineComponent({
  props: {
    username: {
      type: String,
    },
    initials: {
      type: String,
    },
    backgroundColor: {
      type: String,
    },
    color: {
      type: String,
    },
    customStyle: {
      type: Object,
    },
    inline: {
      type: Boolean,
    },
    size: {
      type: Number,
      default: 50,
    },
    src: {
      type: String,
    },
    rounded: {
      type: Boolean,
      default: true,
    },
    lighten: {
      type: Number,
      default: 80,
    },
    parser: {
      type: Function,
      default: getInitials,
      validator: (parser) => typeof parser('John', getInitials) === 'string',
    },
  },
  setup(props, { emit }) {
    const backgroundColors = [
      '#F44336',
      '#FF4081',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#2196F3',
      '#03A9F4',
      '#00BCD4',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      /* '#FFEB3B' , */ '#FFC107',
      '#FF9800',
      '#FF5722',
      '#795548',
      '#9E9E9E',
      '#607D8B',
    ]

    const imgError = ref(false)

    const onImgError = (evt) => {
      imgError.value = true
    }

    const randomBackgroundColor = (seed, colors) => {
      return colors[seed % colors.length]
    }

    const lightenColor = (hex, amt) => {
      // From https://css-tricks.com/snippets/javascript/lighten-darken-color/
      let usePound = false

      if (hex[0] === '#') {
        hex = hex.slice(1)
        usePound = true
      }

      let num = parseInt(hex, 16)
      let r = (num >> 16) + amt

      if (r > 255) r = 255
      else if (r < 0) r = 0

      let b = ((num >> 8) & 0x00ff) + amt

      if (b > 255) b = 255
      else if (b < 0) b = 0

      let g = (num & 0x0000ff) + amt

      if (g > 255) g = 255
      else if (g < 0) g = 0

      return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
    }

    // Computed
    const isImage = computed(() => {
      return !imgError.value && !!props.src
    })

    const userInitial = computed(() => {
      if (!isImage.value) {
        const initials =
          props.initials || props.parser(props.username, getInitials)
        return initials
      }
      return ''
    })

    const background = computed(() => {
      if (!isImage.value) {
        return (
          props.backgroundColor ||
          randomBackgroundColor(props.username.length, backgroundColors)
        )
      }
    })

    const fontColor = computed(() => {
      if (!isImage.value) {
        return props.color || lightenColor(background.value, props.lighten)
      }
    })

    const style = computed(() => {
      const style = {
        display: props.inline ? 'inline-flex' : 'flex',
        width: `${props.size}px`,
        height: `${props.size}px`,
        borderRadius: props.rounded ? '50%' : 0,
        lineHeight: `${props.size + Math.floor(props.size / 20)}px`,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        userSelect: 'none',
      }

      const imgBackgroundAndFontStyle = {
        background: `transparent url('${props.src}') no-repeat scroll 0% 0% / ${props.size}px ${props.size}px content-box border-box`,
      }

      const initialBackgroundAndFontStyle = {
        backgroundColor: background.value,
        font: `${Math.floor(props.size / 2.5)}px/${
          props.size
        }px Helvetica, Arial, sans-serif`,
        color: fontColor.value,
      }

      const backgroundAndFontStyle = isImage.value
        ? imgBackgroundAndFontStyle
        : initialBackgroundAndFontStyle

      Object.assign(style, backgroundAndFontStyle)

      return style
    })

    onMounted(() => {
      if (!isImage.value) {
        emit('avatar-initials', props.username, userInitial.value)
      }
    })

    return { isImage, style, userInitial, onImgError }
  },
})
</script>
