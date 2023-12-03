<template>
  <p
    ref="textBox"
    :contenteditable="true"
    :value="props.modelValue"
    :placeholder="placeholder"
    @input="inputText($event.target.innerText)"
    v-text="props.modelValue"
  ></p>
</template>

<script
  setup
  lang="ts"
>
/**
 * Reference:
 * https://stackoverflow.com/questions/66737918/how-to-use-v-model-on-component-in-vue-3-script-setup
 * https://blog.ninja-squad.com/2021/09/30/script-setup-syntax-in-vue-3/
 * https://vuejs.org/api/sfc-script-setup.html#typescript-only-features
 * */
interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Text here...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

const inputText = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style
  scoped
  lang="scss"
>
/* placeholder code */
[contentEditable='true']:empty:before {
  content: attr(placeholder);
  opacity: 0.7;
}
</style>
