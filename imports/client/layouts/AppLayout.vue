<template>
  <ElConfigProvider :size="elConfig.size">
    <template v-if="isUnknownRoute">
      <div style="width: 100vw; height: 100vh; overflow: hidden">
        <VueElementLoading
          :active="true"
          spinner="line-wave"
          size="55"
          background-color="rgba(255, 255, 255, 1)"
          color="#ff782c"
        />
      </div>
    </template>
    <template v-else>
      <component :is="currentLayout" />
    </template>

    <vue-progress-bar></vue-progress-bar>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Libs
import { useRoute } from "vue-router";

// Components
import VueElementLoading from "vue-element-loading";
import { ElConfigProvider } from "element-plus";

import layout from "/imports/layout";

// namespaces
type Layout = keyof typeof layout; // use key of object as type

const route = useRoute();

const elConfig: {
  size: "small" | "default" | "large";
} = {
  size: "default",
};

// Computed
const isUnknownRoute = computed(() => {
  return route.path === "/" && route.name === undefined;
});
const currentLayout = computed(() => {
  const meta = route.meta;
  const defaultLayoutName: Layout = "main";

  if (!meta) return layout[defaultLayoutName];

  let layoutName: Layout = (meta?.layout as Layout) || defaultLayoutName;
  return layout[layoutName];
});
</script>
