<template>
  <div class="gva-table-box">
    <div class="gva-btn-list">
      <el-button
        type="primary"
        icon="plus"
        @click="openDialog"
      >新增音频</el-button>
      <div class="switch-container">
        <span class="switch-label">显示"屁的全家族大全"入口</span>
        <el-switch
          v-model="showFartEncyclopediaEntry"
          @change="handleSwitchChange"
          :loading="switchLoading"
        />
      </div>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column align="left" label="ID" prop="ID" width="60" />
      <el-table-column align="left" label="音频名字" prop="name" width="150" />
      <el-table-column align="left" label="音频URL" prop="url" width="200" show-overflow-tooltip>
        <template #default="scope">
          <el-link v-if="scope.row.url" :href="scope.row.url" target="_blank" type="primary">
            {{ scope.row.url }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="分类名称" prop="class_name" width="150">
        <template #default="scope">
          <el-tag v-if="scope.row.class_name" type="success">
            {{ scope.row.class_name }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="音频标签" prop="tags" width="200">
        <template #default="scope">
          <el-tag
            v-for="(tag, index) in scope.row.tags"
            :key="index"
            style="margin-right: 4px; margin-bottom: 4px;"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!scope.row.tags || scope.row.tags.length === 0">-</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="音频图片" prop="image" width="200">
        <template #default="scope">
          <div v-if="scope.row.image" class="image-container">
            <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              class="audio-image"
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
      <el-table-column align="left" label="音频描述" prop="description" width="250" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.description">{{ scope.row.description }}</span>
          <span v-else>-</span>
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
            @click="updateAudioLibrary(scope.row)"
          >变更</el-button>
          <el-button
            type="primary"
            link
            icon="delete"
            @click="deleteAudioLibrary(scope.row)"
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
      title="音频库"
      width="700px"
    >
      <AudioLibraryForm
        ref="audioLibraryForm"
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
  createAudioLibrary,
  deleteAudioLibrary,
  updateAudioLibrary,
  getAudioLibraryList
} from '@/plugin/fp_app/api/audio_library'
import {
  getShowFartEncyclopediaEntry,
  setShowFartEncyclopediaEntry
} from '@/plugin/fp_app/api/app_config'
import AudioLibraryForm from '@/plugin/fp_app/form/audio_library.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'AudioLibrary',
  components: {
    AudioLibraryForm
  },
  data() {
    return {
      form: {
        ID: 0,
        name: '',
        url: '',
        tags: [],
        image: '',
        description: '',
        class_name: ''
      },
      tableData: [],
      loading: false,
      dialogFormVisible: false,
      page: 1,
      pageSize: 10,
      total: 0,
      showFartEncyclopediaEntry: true,
      switchLoading: false
    }
  },
  async created() {
    this.getTableData()
    this.loadConfig()
  },
  methods: {
    // 初始化
    async getTableData() {
      this.loading = true
      try {
        const table = await getAudioLibraryList({
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
        name: '',
        url: '',
        tags: [],
        image: '',
        description: '',
        class_name: ''
      }
    },
    // 弹窗确定
    async enterDialog() {
      const valid = await this.$refs.audioLibraryForm.validate()
      if (!valid) return

      this.loading = true
      let res
      if (this.form.ID === 0) {
        res = await createAudioLibrary(this.form)
      } else {
        res = await updateAudioLibrary(this.form)
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
    async deleteAudioLibrary(row) {
      ElMessageBox.confirm(
        '此操作将永久删除该音频, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const res = await deleteAudioLibrary({ ID: row.ID })
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
    updateAudioLibrary(row) {
      this.form = JSON.parse(JSON.stringify(row))
      // 确保tags是数组
      if (this.form.tags && typeof this.form.tags === 'string') {
        try {
          this.form.tags = JSON.parse(this.form.tags)
        } catch (e) {
          this.form.tags = []
        }
      }
      if (!Array.isArray(this.form.tags)) {
        this.form.tags = []
      }
      this.dialogFormVisible = true
    },
    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    },
    // 加载配置
    async loadConfig() {
      try {
        const res = await getShowFartEncyclopediaEntry()
        if (res.code === 0) {
          this.showFartEncyclopediaEntry = res.data
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    },
    // 处理开关变化
    async handleSwitchChange(value) {
      this.switchLoading = true
      try {
        const res = await setShowFartEncyclopediaEntry(value)
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '设置成功'
          })
        } else {
          // 如果失败，恢复原值
          this.showFartEncyclopediaEntry = !value
          ElMessage({
            type: 'error',
            message: res.msg || '设置失败'
          })
        }
      } catch (error) {
        // 如果失败，恢复原值
        this.showFartEncyclopediaEntry = !value
        ElMessage({
          type: 'error',
          message: '设置失败: ' + error.message
        })
      } finally {
        this.switchLoading = false
      }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  font-size: 14px;
  color: #606266;
}

.gva-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.audio-image {
  width: 156px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 156px;
  height: 60px;
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

