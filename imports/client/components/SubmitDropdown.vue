<template>
  <el-dropdown
    v-if="!dropdownDisabled"
    v-bind="$attrs"
    split-button
    class="submit-dropdown"
    @click="handleClick(dropdownDefault)"
    @command="handleCommand"
    @visible-change="handleVisibleChange"
  >
    {{ dropdownDefault['label'] }}

    <template #dropdown>
      <el-dropdown-menu v-if="!dropdownDisabled">
        <template
          v-for="(it, index) in dropdownOpts"
          :key="index"
        >
          <el-dropdown-item
            v-if="it['visible'] == undefined ? true : it['visible']"
            :key="index"
            :command="it"
            v-bind="it['attrs']"
          >
            {{ it['label'] }}
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
// Odl version
export default {
  name: 'SubmitDropdown',
}
</script>

<script
  lang="ts"
  setup
>
import { computed, watch, ref, nextTick } from 'vue'
import moment from 'moment'
import { cloneDeep, isArray, isString, remove, sortBy } from 'lodash'
import { useStore } from '/imports/store'
import app from '/imports/app'
// Component
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

type RoleInput = {
  type: 'Insert' | 'Update'
  role: string
}
// Field: [{ label: 'Save & Close', command: 'close',attrs:{$attrs},checkClosingDate:false,visible:false,index:0 }]
type DropDownInput = {
  label: string
  command: string
  attrs?: any
  checkClosingDate?: boolean
  visible?: boolean
  index?: number
}

const store = useStore()
const { $userIsInRole } = app.config.globalProperties

const props = withDefaults(
  defineProps<{
    comName: string
    dropdowns: DropDownInput[]
    sortBy?: string
    tranDate?: Date
    firstShowTranDate?: Date
    disabled?: boolean
    disabledNotInRoles?: string | RoleInput[]
  }>(),
  {
    sortBy: '',
    disabled: false,
    tranDate: undefined,
    firstShowTranDate: undefined,
  }
)
const emits = defineEmits<{
  (e: 'click', value: any): void
  (e: 'command', value: any): void
  (e: 'visible-change', value: any): void
}>()

const dropdownDefault = ref<any>(null)

const currentBranchId = computed(() => {
  return store.getters['app/currentBranchId']
})

const dropdownOpts = computed(() => {
  const dropdowns = cloneDeep(props.dropdowns)
  remove(dropdowns, (it) => {
    return it['command'] === dropdownDefault.value['command']
  })
  return sortBy(dropdowns, [props.sortBy])
})

const dropdown = computed(() => {
  const dropdowns = cloneDeep(props.dropdowns)
  if (!(dropdowns && dropdowns.length)) return []

  const clicked = store.state.app.submitDropdown.lastClickedOpts
  if (!(clicked && clicked[props.comName])) return dropdowns[0]
  return clicked[props.comName]
})

const closingDate = computed(() => {
  const date = store.state.app.closingDate.date
  return date
})

const newTranDate = computed(() => {
  if (props.firstShowTranDate) {
    const closeDate = moment(closingDate.value).format('YYYY-MM-DD')
    const firstShowTranDate = moment(props.firstShowTranDate).format(
      'YYYY-MM-DD'
    )

    const tranDate = moment(props.tranDate).format('YYYY-MM-DD')
    let newTranDate = firstShowTranDate
    if (
      moment(closeDate).isBefore(firstShowTranDate) &&
      moment(tranDate).isBefore(firstShowTranDate)
    ) {
      newTranDate = tranDate
    }

    return moment(newTranDate).toDate()
  }
  return props.tranDate
})

// Check closing date with tran date
const checkedClosingDate = computed(() => {
  const closeDate = moment(closingDate.value).format('YYYY-MM-DD')
  const tranDate = moment(newTranDate.value).format('YYYY-MM-DD')
  return moment(closeDate).isBefore(tranDate)
})

const dropdownDisabled = computed(() => {
  // reload when current user update (info from server)
  store.state.app.currentUser

  let res = false
  if (isArray(props.disabledNotInRoles)) {
    res = props.disabledNotInRoles.some((it: RoleInput) => {
      // Array Object [{...},{....}]
      if (props.firstShowTranDate && it.type == 'Update') {
        return !$userIsInRole(it.role)
      } else if (it.type == 'Insert') {
        return !$userIsInRole(it.role)
      }
    })
  } else if (isString(props.disabledNotInRoles)) {
    res = !$userIsInRole(props.disabledNotInRoles)
  }

  return props.disabled || res ? true : false
})

watch(
  () => dropdown.value,
  (val) => {
    if (val) dropdownDefault.value = val
  },
  {
    immediate: true,
    deep: true,
  }
)

const _confirm = (emit: any, value: any, checkClosingDate = true) => {
  // don't check closing date
  if (!checkClosingDate) {
    emits(emit, value)
    return true
  }

  // Get closing date
  if (currentBranchId.value) {
    store.dispatch('app/updateClosingDate', currentBranchId.value)
  }
  nextTick(() => {
    // Check tranDate with closing date
    if (checkedClosingDate.value) {
      emits(emit, value)
      return true
    }

    // Confirm
    // មិនអាចធ្វើប្រតិបត្តិការតូចជាងថ្ងៃបិទបញ្ជីបានទេ
    store
      .dispatch('app/confirm', {
        type: 'warning',
        title: 'Confirm closing date',
        customClass: `msgBox`,
        message: `ថ្ងៃប្រតិបត្តិការ ${app.config.globalProperties.$filters.date(
          newTranDate.value
        )} មិនអាចតូចជាងឬស្មើថ្ងៃបិទបញ្ជី ${app.config.globalProperties.$filters.date(
          closingDate.value
        )}`,
        // showCancelButton: false,
        // roundButton: true,
      })
      // .then(() => {})
      .catch(() => {
        // this.$store.dispatch('app/messageW', 'Canceled')
      })
  })
}

const handleClick = (cmd: any) => {
  // Disabled click
  if (dropdownDisabled.value) return

  _confirm('click', cmd['command'], cmd['checkClosingDate'])
}

const handleVisibleChange = (val: any) => {
  // Disabled click
  if (dropdownDisabled.value) return

  emits('visible-change', val)
}

const handleCommand = (cmd: any) => {
  // Disabled click
  if (dropdownDisabled.value) return

  dropdownDefault.value = cmd
  // update dropdown clicked
  store.dispatch('app/submitDropdown/updateLastClickedOpts', {
    value: cmd,
    componentName: props.comName,
  })

  // Emit to parent
  _confirm('command', cmd['command'], cmd['checkClosingDate'])
}
</script>

<style scoped>
.el-dropdown-menu {
  z-index: 9999 !important;
}
.disabledDropdown > .el-button-group > .el-button {
  cursor: not-allowed;
  background-color: #8cc8ff;
  border-color: #8cc8ff;
}
.disabledDropdown.el-dropdown-menu {
  display: none;
}

@media only screen and (max-width: 1280px) {
  .wrapper-button .el-button--mini,
  .wrapper-button .el-button--small {
    font-size: 12px !important;
    border-radius: 3px !important;
    /* margin-bottom: 3px !important;
    margin-top: 0px !important; */
  }
  .el-button-group > .el-button {
    margin-right: -3px !important;
  }
}
@media only screen and (max-width: 1024px) {
  .el-button-group > .el-button {
    margin-right: -3px !important;
  }
}
</style>
