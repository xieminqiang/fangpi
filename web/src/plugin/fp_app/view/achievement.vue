<template>
  <div class="gva-table-box">
    <div class="gva-btn-list">
      <el-button
        type="primary"
        icon="plus"
        @click="openDialog"
      >新增成就配置</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      @sort-change="sortChange"
      v-loading="loading"
    >
      <el-table-column align="left" label="ID" prop="ID" width="60" />
      <el-table-column align="left" label="成就编码" prop="achievementCode" width="120" />
      <el-table-column align="left" label="成就名称" prop="achievementName" width="150" />
      <el-table-column align="left" label="成就描述" prop="achievementDesc" width="200" show-overflow-tooltip />
      <el-table-column align="left" label="成就图标" prop="achievementIcon" width="100">
        <template #default="scope">
          <div v-if="scope.row.achievementIcon" class="achievement-icon-container">
            <el-image
              :src="scope.row.achievementIcon"
              :preview-src-list="[scope.row.achievementIcon]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <span v-else class="no-image">-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="成就Emoji" prop="achievementEmoji" width="100">
        <template #default="scope">
          <span v-if="scope.row.achievementEmoji">{{ scope.row.achievementEmoji }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="成就GIF" prop="achievementGif" width="100">
        <template #default="scope">
          <div v-if="scope.row.achievementGif" class="achievement-gif-container">
            <el-image
              :src="scope.row.achievementGif"
              :preview-src-list="[scope.row.achievementGif]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <span v-else class="no-image">-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="奖励经验值" prop="rewardExp" width="120" />
      <el-table-column align="left" label="排序" prop="sortOrder" width="80" />
      <el-table-column align="left" label="状态" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="left" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
      </el-table-column>
      <el-table-column align="left" label="操作" width="160">
        <template #default="scope">
          <el-button
            type="primary"
            link
            icon="edit"
            @click="updateAchievement(scope.row)"
          >变更</el-button>
          <el-button
            type="primary"
            link
            icon="delete"
            @click="deleteAchievement(scope.row)"
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
      title="成就配置"
      width="600px"
    >
      <AchievementForm
        ref="achievementForm"
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
  createAchievement,
  deleteAchievement,
  updateAchievement,
  getAchievementList
} from '@/plugin/fp_app/api/achievement'
import AchievementForm from '@/plugin/fp_app/form/achievement.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, VideoPlay } from '@element-plus/icons-vue'

export default {
  name: 'Achievement',
  components: {
    AchievementForm
  },
  data() {
    return {
      form: {
        ID: 0,
        achievementCode: '',
        achievementName: '',
        achievementDesc: '',
        achievementIcon: '',
        achievementEmoji: '',
        achievementGif: '',
        unlockCondition: '',
        rewardExp: 0,
        sortOrder: 0,
        status: 1
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
      try {
        const table = await getAchievementList({
          page: this.page,
          pageSize: this.pageSize
        })
        console.log('API Response:', table)
        if (table.code === 0) {
          this.tableData = table.data.list || []
          this.total = table.data.total || 0
          this.page = table.data.page || 1
          this.pageSize = table.data.pageSize || 10
          console.log('Data loaded:', this.tableData.length, 'items')
        } else {
          console.error('API Error:', table.msg)
          this.$message.error('获取数据失败: ' + table.msg)
        }
      } catch (error) {
        console.error('Request Error:', error)
        this.$message.error('请求失败: ' + error.message)
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
        achievementCode: '',
        achievementName: '',
        achievementDesc: '',
        achievementIcon: '',
        achievementEmoji: '',
        achievementGif: '',
        unlockCondition: '',
        rewardExp: 0,
        sortOrder: 0,
        status: 1
      }
    },
    // 弹窗确定
    async enterDialog() {
      const valid = await this.$refs.achievementForm.validate()
      if (!valid) return

      this.loading = true
      let res
      if (this.form.ID === 0) {
        res = await createAchievement(this.form)
      } else {
        res = await updateAchievement(this.form)
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
    async deleteAchievement(row) {
      ElMessageBox.confirm(
        '此操作将永久删除该成就配置, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const res = await deleteAchievement({ ID: row.ID })
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
    updateAchievement(row) {
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

.achievement-icon-container,
.achievement-gif-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #909399;
  font-size: 16px;
}

.no-image {
  color: #c0c4cc;
  font-style: italic;
}
</style>
