<template>
  <el-button
    v-if="!buttonDisabled"
    v-bind="$attrs"
    :disabled="buttonDisabled"
    @click="handleClick"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>

    <template v-if="$slots.loading" #loading>
      <slot name="loading" />
    </template>

    <slot />
  </el-button>
</template>
<script lang="ts">
export default {
  name: "SubmitButton",
};
</script>
<script lang="ts" setup>
import { computed, nextTick } from "vue";
import moment from "moment";
import { isArray, isString } from "lodash";
import { useStore } from "/imports/store";
import { ElButton } from "element-plus";
import app from "/imports/app";

type RoleInput = {
  type: "Insert" | "Update";
  role: string;
};

const props = withDefaults(
  defineProps<{
    tranDate?: Date;
    firstShowTranDate?: Date;
    disabled?: boolean;
    disabledNotInRoles?: string | RoleInput[];
  }>(),
  {
    tranDate: moment().toDate(),
    firstShowTranDate: undefined,
    // disabledNotInRoles: '',
  }
);

const emit = defineEmits<{
  (e: "click", value: any): void;
}>();

const store = useStore();
const { $userIsInRole } = app.config.globalProperties;

const currentBranchId = computed(() => {
  return store.getters["app/currentBranchId"];
});

const closingDate = computed(() => {
  const date = store.state.app.closingDate.date;
  return date;
});
const newTranDate = computed(() => {
  if (props.firstShowTranDate) {
    const closeDate = moment(closingDate.value).format("YYYY-MM-DD");
    const firstShowTranDate = moment(props.firstShowTranDate).format(
      "YYYY-MM-DD"
    );

    const tranDate = moment(props.tranDate).format("YYYY-MM-DD");
    let newTranDate = firstShowTranDate;
    if (
      moment(closeDate).isBefore(firstShowTranDate) &&
      moment(tranDate).isBefore(firstShowTranDate)
    ) {
      newTranDate = tranDate;
    }

    return moment(newTranDate).toDate();
  }
  return props.tranDate;
});

// Check closing date with tran date
const checkClosingDate = computed(() => {
  const closeDate = moment(closingDate.value).format("YYYY-MM-DD");
  const tranDate = moment(newTranDate.value).format("YYYY-MM-DD");

  return moment(closeDate).isBefore(tranDate);
});

const buttonDisabled = computed(() => {
  // reload when current user update (info from server)
  store.state.app.currentUser;

  let res = false;
  if (isArray(props.disabledNotInRoles)) {
    res = props.disabledNotInRoles.some((it: RoleInput) => {
      if (props.firstShowTranDate && it.type == "Update") {
        return !$userIsInRole(it.role);
      } else if (it.type == "Insert") {
        return !$userIsInRole(it.role);
      }
    });
  } else if (isString(props.disabledNotInRoles)) {
    res = !$userIsInRole(props.disabledNotInRoles);
  }
  return props.disabled || res;
});

const handleClick = (evt: any) => {
  // Get closing date
  if (currentBranchId.value) {
    store.dispatch("app/updateClosingDate", currentBranchId.value);
  }

  nextTick(() => {
    // Check tranDate with closing date
    if (checkClosingDate.value) {
      emit("click", evt);
      return true;
    }
    // Confirm
    // មិនអាចធ្វើប្រតិបត្តិការតូចជាងថ្ងៃបិទបញ្ជីបានទេ
    store
      .dispatch("app/confirm", {
        type: "warning",
        title: "Confirm closing date",
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
      });
  });
};
</script>

<style></style>
