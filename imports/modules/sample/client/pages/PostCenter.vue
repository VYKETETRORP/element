<template>
  <div>
    <el-row :gutter="20">
      <!-- Item -->
      <el-col :span="6"> Item list </el-col>

      <!-- Detail -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="header">
              <span v-if="activeChartAccount">
                {{ activeChartAccount.code }} : {{ activeChartAccount.name }},
                Type: {{ activeChartAccount.accountTypeDoc.name }}, Status:
                {{ activeChartAccount.status }}
              </span>
              <span v-else>No item selected</span>

              <span class="float-right-btn">
                <el-button
                  v-if="activeChartAccount"
                  link
                  @click="showItem"
                >
                  <template #icon>
                    <i class="fas fa-pencil-alt" />
                  </template>
                </el-button>
                <el-button
                  link
                  @click="handleLinkBtnClick({ name: 'DemoPostForm' })"
                >
                  <template #icon>
                    <i class="fas fa-plus" />
                  </template>
                </el-button>
                <el-button
                  link
                  @click="handleLinkBtnClick({ name: 'DemoSetting' })"
                >
                  <template #icon>
                    <i class="fas fa-cog" />
                  </template>
                </el-button>
              </span>
            </div>
          </template>

          <el-row :gutter="50">
            <!-- Tool -->
            <el-col :span="10">
              <el-button
                size="default"
                type="primary"
                style="width: 100%"
                @click="handleLinkBtnClick({ name: 'JournalForm' })"
              >
                Make POST
              </el-button>
            </el-col>

            <!-- Info -->
            <el-col :span="14">
              <div class="info-box">
                <span class="info-box-icon bg-aqua">
                  <i class="fas fa-info-circle" />
                </span>
                <div class="info-box-content">
                  <span class="info-box-text">Coming Soon</span>
                  <span class="info-box-number">00<small>%</small></span>
                </div>
              </div>
            </el-col>
          </el-row>
          <div class="ra-mt-md" />

          <!-- Transaction -->
          Transactons
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Notify from '/imports/client/lib/notify'

export default {
  name: 'DemoPostCenter',
  components: {},
  data() {
    return {
      activeChartAccount: null,
    }
  },
  computed: {
    tranFilter() {
      let filter = {}
      if (this.activeChartAccount && this.activeChartAccount._id) {
        filter = {
          details: {
            $elemMatch: { chartAccountId: this.activeChartAccount._id },
          },
        }
      }
      return filter
    },
  },
  mounted() {},
  methods: {
    // Edit Item
    showItem() {
      if (this.activeChartAccount && this.activeChartAccount._id) {
        this.$router.push({
          name: 'ChartAccountForm',
          params: { showId: this.activeChartAccount._id },
        })
      } else {
        Notify.error({ message: 'Chart account do not selecte' })
      }
    },
    handleLinkBtnClick(route) {
      this.$router.push(route)
    },
    handleItemClick(val) {
      this.activeChartAccount = val
    },
    handleTranClick(val) {
      this.$router.push({
        name: 'DemoPostForm',
        params: { _id: val._id },
      })
    },
  },
}
</script>

<style
  lang="scss"
  scoped
></style>
