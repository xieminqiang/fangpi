<template>
  <div class="gva-table-box">
    <div class="gva-btn-list">
      <el-button
        type="primary"
        icon="plus"
        @click="openDialog"
      >新增等级配置</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      @sort-change="sortChange"
      v-loading="loading"
    >
      <el-table-column align="left" label="ID" prop="ID" width="60" />
      <el-table-column align="left" label="等级" prop="level" width="80" />
      <el-table-column align="left" label="等级名称" prop="levelName" width="120" />
      <el-table-column align="left" label="等级Emoji" prop="levelEmoji" width="100">
        <template #default="scope">
          <span v-if="scope.row.levelEmoji">{{ scope.row.levelEmoji }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="等级图片" prop="levelImage" width="120">
        <template #default="scope">
          <div v-if="scope.row.levelImage" class="level-image-container">
            <el-image
              :src="scope.row.levelImage"
              :preview-src-list="[scope.row.levelImage]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
          <span v-else class="no-image">-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="所需经验值" prop="requiredExp" width="120" />
      <el-table-column align="left" label="所需放屁次数" prop="requiredFarts" width="140" />
      <el-table-column align="left" label="所需打卡天数" prop="requiredDays" width="140" />
      <el-table-column align="left" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
      </el-table-column>
      <el-table-column align="left" label="操作" width="160">
        <template #default="scope">
          <el-button
            type="primary"
            link
            icon="edit"
            @click="updateLevelConfig(scope.row)"
          >变更</el-button>
          <el-button
            type="primary"
            link
            icon="delete"
            @click="deleteLevelConfig(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="gva-pagination">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 30, 50, 100]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
    <el-dialog
      v-model="dialogFormVisible"
      :before-close="closeDialog"
      title="等级配置"
      width="500px"
    >
      <LevelConfigForm
        ref="levelConfigForm"
        :form="form"
        :loading="loading"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取 消</el-button>
          <el-button
            type="primary"
            @click="enterDialog"
            :loading="loading"
          >确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  createLevelConfig,
  deleteLevelConfig,
  updateLevelConfig,
  getLevelConfigList
} from '@/plugin/fp_app/api/levelConfig'
import LevelConfigForm from '@/plugin/fp_app/form/levelConfig.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'LevelConfig',
  components: {
    LevelConfigForm
  },
  data() {
    return {
      form: {
        ID: 0,
        level: 1,
        levelName: '',
        levelEmoji: '',
        levelImage: '',
        requiredExp: 0,
        requiredFarts: 0,
        requiredDays: 0
      },
      tableData: [],
      loading: false,
      dialogFormVisible: false,
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  async created() {
    this.getTableData()
  },
  methods: {
    // 初始化
    async getTableData() {
      this.loading = true
      const table = await getLevelConfigList({
        page: this.page,
        pageSize: this.pageSize
      })
      if (table.code === 0) {
        this.tableData = table.data.list
        this.total = table.data.total
        this.page = table.data.page
        this.pageSize = table.data.pageSize
      }
      this.loading = false
    },
    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getTableData()
    },
    // 排序
    sortChange({ prop, order }) {
      if (prop) {
        this.orderBy = prop
        this.order = order === 'ascending' ? 'asc' : 'desc'
        this.getTableData()
      }
    },
    // 弹窗相关
    openDialog() {
      this.resetForm()
      this.dialogFormVisible = true
    },
    closeDialog() {
      this.dialogFormVisible = false
      this.resetForm()
    },
    resetForm() {
      this.form = {
        ID: 0,
        level: 1,
        levelName: '',
        levelEmoji: '',
        levelImage: '',
        requiredExp: 0,
        requiredFarts: 0,
        requiredDays: 0
      }
    },
    // 弹窗确定
    async enterDialog() {
      const valid = await this.$refs.levelConfigForm.validate()
      if (!valid) return

      this.loading = true
      let res
      if (this.form.ID === 0) {
        res = await createLevelConfig(this.form)
      } else {
        res = await updateLevelConfig(this.form)
      }
      if (res.code === 0) {
        ElMessage({
          type: 'success',
          message: this.form.ID === 0 ? '创建成功' : '更新成功'
        })
        this.closeDialog()
        this.getTableData()
      }
      this.loading = false
    },
    // 删除
    async deleteLevelConfig(row) {
      ElMessageBox.confirm(
        '此操作将永久删除该等级配置, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const res = await deleteLevelConfig({ ID: row.ID })
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '删除成功!'
          })
          this.getTableData()
        }
      })
    },
    // 更新
    updateLevelConfig(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogFormVisible = true
    },
    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    }
  }
}
</script>

<style scoped>
.gva-table-box {
  padding: 20px;
}

.gva-btn-list {
  margin-bottom: 20px;
}

.gva-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.level-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.no-image {
  color: #c0c4cc;
  font-style: italic;
}
</style>
