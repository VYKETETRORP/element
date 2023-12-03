<template>
  <div>
    <el-dialog
      :model-value="visibleDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
      :before-close="handleCancel"
      width="20%"
    >
      <!-- Dialog Title -->
      <template #header>
        <i :class="'fas fa-' + titleIcon" />
        {{ $t('app.End of Process Fixed Asset') }}
      </template>
      <fieldset class="ra-fieldset">
        <legend>{{ $t('app.btn.new') }}</legend>
        <el-form
          ref="form"
          v-loading="loading.form"
          :model="form"
          :rules="rules"
          label-width="120px"
          label-position="top"
        >
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item
                :label="$t('app.account-report-label.DATE')"
                prop="tranDate"
              >
                <el-date-picker
                  v-model="form.tranDate"
                  :clearable="false"
                  :disabled="false"
                  type="date"
                  format="DD/MM/YYYY"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </fieldset>
      <template
        #footer
        class="dialog-footer"
      >
        <submit-button
          v-if="!showId"
          :tran-date="form.tranDate"
          :first-show-tran-date="showTranDate"
          :disabled="!$userIsInRole('end-of-process-insert')"
          type="primary"
          @click="_submitForm"
        >
          {{ $t('app.btn.save') }}
        </submit-button>
        <submit-button
          v-if="showId"
          :tran-date="form.tranDate"
          :first-show-tran-date="showTranDate"
          :disabled="!$userIsInRole('end-of-process-remove')"
          type="danger"
          @click="_removeData"
        >
          {{ $t('app.btn.delete') }}
        </submit-button>
        <el-button @click="handleCancel">
          {{ $t('app.btn.cancel') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// LIBRARY
import Notify from '/imports/client/lib/notify'
import removeMixin from '/imports/client/mixins/remove'
// PACKAGES
import { pick } from 'lodash'
import moment from 'moment'
// METHODS
import {
  endOfProcessFixedAssetInsert,
  removeEndOfProcessFixedAsset,
} from '../../api/end-of-process-fixed-asset/methods'
import {
  ElForm,
  ElFormItem,
  ElDialog,
  ElButton,
  ElDatePicker,
  ElRow,
  ElCol,
  ElInput,
} from 'element-plus'
export default {
  name: 'AppEndOfProcessFixedAsset',
  components: {
    [ElForm.name]: ElForm,
    [ElFormItem.name]: ElFormItem,
    [ElDialog.name]: ElDialog,
    [ElButton.name]: ElButton,
    [ElDatePicker.name]: ElDatePicker,
    [ElRow.name]: ElRow,
    [ElCol.name]: ElCol,
    [ElInput.name]: ElInput,
  },
  mixins: [removeMixin],

  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    formType: {
      type: String,
      default: 'New',
    },
    showId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      loading: {
        form: false,
        employee: 'Select',
        pump: 'Select',
      },
      fullScreenLoading: false,
      // OPTIONS
      employeeOpts: [],
      pumpOpts: [],

      showTranDate: null,

      form: {
        tranDate: moment().toDate(),
        branchId: '',
      },
      rules: {
        tranDate: [{ required: true, message: 'Tran date is required' }],
      },
    }
  },

  computed: {
    currentBranchId() {
      const branch = this.$store.state.app.currentBranch
      return branch && branch._id
    },
    // Dialog
    visibleDialog: {
      get() {
        return this.visible
      },
      set(val) {
        this.syncVisible(val)
      },
    },
    // Title
    titleIcon() {
      return this.showId ? 'pencil-alt' : 'plus'
    },
    numericMask() {
      let mask = this.$store.state.app.numericMask
      // mask.min = 0
      // mask.digits = 7
      return mask
    },
  },

  watch: {
    visible: {
      handler(val) {
        if (val) {
          if (this.showId) {
            //this.getDataUpdate()
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {},

  methods: {
    _submitForm() {
      this.$store
        .dispatch('app/confirm', {
          type: 'warning',
          title: 'Confirm',
          message: 'Do you want to end of process fixed asset 👌!',
        })
        .then(() => {
          this.runEndOfProcessFixedAsset()
        })
        .catch((err) => {
          console.log('err=>', err)
        })
    },
    runEndOfProcessFixedAsset() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.fullScreenLoading = true
          this.form.tranDate = moment(this.form.tranDate).endOf('day').toDate()
          let doc = {
            branchId: this.currentBranchId,
            tranDate: this.form.tranDate,
          }
          endOfProcessFixedAssetInsert
            .callPromise({ doc })
            .then((res) => {
              if (res) {
                this.fullScreenLoading = false
                this.$store
                  .dispatch('app/confirm', {
                    type: 'success',
                    title: 'Confirm',
                    message: `End of process is done! `,
                    showClose: false,
                    showCancelButton: false,
                  })
                  .then(() => {
                    this.fullScreenLoading = false
                    this.handleCancel()
                  })
              }
              // this.resetForm()
            })
            .catch((err) => {
              this.$store.dispatch('app/messageE', err)
              this.fullScreenLoading = false
              console.log(err)
            })
        }
      })
    },
    _removeData() {
      this.$_removeMixin({
        meteorMethod: removeEndOfProcessFixedAsset,
        selector: { _id: this.showId },
        successMethod: 'handleCancel',
        loading: 'loading.form',
        // title: this.form.title,
      })
    },
    // Dialog
    syncVisible(val) {
      this.$emit('update:visible', val)
    },

    handleCancel() {
      this.resetForm()
      this.$emit('after-action')
      this.visibleDialog = false
    },
    afterAction(action, result) {
      // To close
      if (action === 'update' || action === 'remove') this.handleCancel()
      this.$emit('after-action', { action, result })
    },
    resetForm() {
      this.$refs['form'].resetFields()
      this.showTranDate = null
    },
  },
}
</script>

<style
  lang="scss"
  scoped
>
/* @import '../styles/main.scss'; */
</style>
