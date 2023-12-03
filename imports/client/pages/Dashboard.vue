<template>
  <el-card shadow="never" class="dashboard">
    <h3 class="title">Welcome to Rabbit Tech!</h3>
    <!-- <template> -->
    <!-- <ve-histogram
          :data="chartData"
          :settings="chartSettings"
          :tooltip-visible="false"
          :legend-visible="false"
        /> -->
    <BoxInfo v-if="$userIsInRole(['account-info'])" :visible="true" />

    <div
      v-if="$userIsInRole(['chart-acc'])"
      class="box box-success"
      style="margin-top: 10px; padding-top: 4px"
    >
      <div class="box-header with-border">
        <h3 class="box-title">
          {{ $t("app.account-setting-account-type.daily income") }}
        </h3>
        <div class="box-tools pull-right">
          <button type="button" class="btn-box-tool" data-widget="collapse">
            <i class="fa fa-wrench" />
          </button>
        </div>
      </div>

      <div class="box-body">
        <div class="row">
          <div class="col-md-9 col-sm-8">
            <div class="pad">
              <AccChart />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </template> -->
  </el-card>
</template>

<script>
import { ElCard } from "element-plus";
import AccChart from "../components/AccChart";
import BoxInfo from "../components/box-info";

export default {
  name: "Dashboard",
  components: {
    [ElCard.name]: ElCard,
    AccChart,
    BoxInfo,
  },

  data() {
    return {
      // chartData: {
      //   Books: 24,
      //   Magazine: 30,
      //   Newspapers: 10,
      // },
    };
  },
};
</script>

<style lang="scss" scoped>
@import "./imports/client/styles/main.scss";

.company-heading {
  font-weight: 700;
  clear: both;
  width: 100%;
  font-size: 20px;
  color: #ff9800;
  font-family: Moul !important;
  height: 25px;
}
.box.box-success {
  // border-top-color: #1890ff;
  border-top-color: #3f51b5;
}
.box {
  position: relative;
  border-radius: 3px;
  background: #ffffff;
  border-top: 3px solid #d2d6de;
  margin-bottom: 20px;
  width: 100%;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}
.box-header.with-border {
  border-bottom: 1px solid #f4f4f4;
}
.box-header {
  color: #444;
  display: block;
  padding: 4px;
  position: relative;
}
.box-header:before,
.box-body:before,
.box-footer:before,
.box-header:after,
.box-body:after,
.box-footer:after {
  content: " ";
  display: table;
}
.box-header > .fa,
.box-header > .glyphicon,
.box-header > .ion,
.box-header .box-title {
  display: inline-block;
  font-size: 16px;
  margin: 0;
  line-height: 1;
}
.box-header > .box-tools {
  position: absolute;
  right: 10px;
  top: 2px;
}
.pull-right {
  float: right;
}

.pull-right {
  float: right !important;
}
.box-header:after,
.box-body:after,
.box-footer:after {
  clear: both;
}
.box-header:before,
.box-body:before,
.box-footer:before,
.box-header:after,
.box-body:after,
.box-footer:after {
  content: " ";
  display: table;
}
.no-padding {
  padding: 0 !important;
}
.box-body {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 10px;
}
.btn {
  border-radius: 3px;
  -webkit-box-shadow: none;
  box-shadow: none;
  border: 1px solid transparent;
}
.btn-box-tool {
  padding: 5px;
  font-size: 12px;
  background: transparent;
  color: #97a0b3;
}
.dashboard-height {
  height: 771px;
  // height: calc(100vh - 155px);
  // overflow: scroll;
}
@media only screen and (max-width: 1600px) {
  .dashboard-height {
    height: 758px;
  }
}
@media only screen and (max-width: 1440px) {
  .dashboard-height {
    height: 660px;
  }
}
@media only screen and (max-width: 1366px) {
  .dashboard-height {
    height: 668px;
  }
}
@media only screen and (max-width: 1280px) {
  .dashboard-height {
    height: 758px;
  }
}
@media only screen and (max-width: 1024px) {
  .dashboard-height {
    height: 672px;
  }
}
</style>
