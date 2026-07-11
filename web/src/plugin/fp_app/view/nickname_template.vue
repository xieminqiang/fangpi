<template>
  <div class="gva-table-box">
    <div class="gva-btn-list">
      <el-button
        type="primary"
        icon="plus"
        @click="openDialog"
      >新增昵称模板</el-button>
      <el-button
        type="danger"
        icon="delete"
        :disabled="!multipleSelection.length"
        @click="deleteNicknameTemplateByIds"
      >批量删除</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column align="left" label="ID" prop="ID" width="60" />
      <el-table-column align="left" label="昵称名称" prop="name" width="150" />
      <el-table-column align="left" label="昵称图片" prop="image" width="150">
        <template #default="scope">
          <div v-if="scope.row.image" class="image-container">
            <el-image
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
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
      <el-table-column align="left" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
      </el-table-column>
      <el-table-column align="left" label="操作" width="160">
        <template #default="scope">
          <el-button
            type="primary"
            link
            icon="edit"
            @click="updateNicknameTemplate(scope.row)"
          >变更</el-button>
          <el-button
            type="primary"
            link
            icon="delete"
            @click="deleteNicknameTemplate(scope.row)"
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
      title="昵称模板"
      width="1000px"
    >
      <NicknameTemplateForm
        ref="nicknameTemplateForm"
        :form="form"
        :loading="loading"
        @image-updated="handleImageUpdated"
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
  createNicknameTemplate,
  deleteNicknameTemplate,
  deleteNicknameTemplateByIds,
  updateNicknameTemplate,
  getNicknameTemplateList
} from '@/plugin/fp_app/api/nickname_template'
import NicknameTemplateForm from '@/plugin/fp_app/form/nickname_template.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'NicknameTemplate',
  components: {
    NicknameTemplateForm
  },
  data() {
    return {
      form: {
        ID: 0,
        name: '',
        image: ''
      },
      tableData: [],
      loading: false,
      dialogFormVisible: false,
      page: 1,
      pageSize: 10,
      total: 0,
      multipleSelection: []
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
        const table = await getNicknameTemplateList({
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
        name: '',
        image: ''
      }
    },
    // 弹窗确定
    async enterDialog() {
      const valid = await this.$refs.nicknameTemplateForm.validate()
      if (!valid) return

      this.loading = true
      let res
      if (this.form.ID === 0) {
        res = await createNicknameTemplate(this.form)
      } else {
        res = await updateNicknameTemplate(this.form)
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
    // 选择变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 删除
    async deleteNicknameTemplate(row) {
      ElMessageBox.confirm(
        '此操作将永久删除该昵称模板, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const res = await deleteNicknameTemplate({ ID: row.ID })
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '删除成功!'
          })
          this.getTableData()
        }
      })
    },
    // 批量删除
    async deleteNicknameTemplateByIds() {
      if (this.multipleSelection.length === 0) {
        ElMessage({
          type: 'warning',
          message: '请选择要删除的昵称模板'
        })
        return
      }
      ElMessageBox.confirm(
        `此操作将永久删除选中的 ${this.multipleSelection.length} 个昵称模板, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const ids = this.multipleSelection.map(item => item.ID)
        const res = await deleteNicknameTemplateByIds({ ids })
        if (res.code === 0) {
          ElMessage({
            type: 'success',
            message: '批量删除成功!'
          })
          this.multipleSelection = []
          this.getTableData()
        }
      })
    },
    // 更新
    updateNicknameTemplate(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogFormVisible = true
    },
    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    },
    // 处理图片更新
    handleImageUpdated(imageUrl) {
      this.form.image = imageUrl
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

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
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

