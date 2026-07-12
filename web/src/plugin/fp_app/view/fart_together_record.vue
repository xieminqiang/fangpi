<template>
  <div>
    <div class="summary-cards">
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.totalCount || 0 }}</div>
        <div class="summary-label">累计邀请</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.todayCount || 0 }}</div>
        <div class="summary-label">今日新增</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.pendingCount || 0 }}</div>
        <div class="summary-label">待加入</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.completedCount || 0 }}</div>
        <div class="summary-label">已完成</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.maleInvites || 0 }}</div>
        <div class="summary-label">含男性参与</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.femaleInvites || 0 }}</div>
        <div class="summary-label">含女性参与</div>
      </el-card>
    </div>

    <div class="gva-search-box">
      <el-form ref="elSearchFormRef" :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="邀请人ID" prop="inviterId">
          <el-input v-model.number="searchInfo.inviterId" placeholder="输入邀请人ID" clearable />
        </el-form-item>
        <el-form-item label="被邀请人ID" prop="inviteeId">
          <el-input v-model.number="searchInfo.inviteeId" placeholder="输入被邀请人ID" clearable />
        </el-form-item>
        <el-form-item label="邀请状态" prop="status">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择状态" @clear="() => { searchInfo.status = undefined }">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createdAtRange">
          <el-date-picker
            v-model="searchInfo.createdAtRange"
            class="w-[380px]"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button icon="delete" :disabled="!multipleSelection.length" @click="onDelete">批量删除</el-button>
      </div>
      <el-table
        ref="multipleTable"
        style="width: 100%"
        tooltip-effect="dark"
        :data="tableData"
        row-key="ID"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column align="left" label="ID" prop="ID" width="70" />
        <el-table-column align="left" label="邀请人" min-width="150">
          <template #default="scope">
            <div>{{ scope.row.inviterNickname || '未命名' }}</div>
            <div class="sub-text">ID: {{ scope.row.inviterId }} · {{ sexLabel(scope.row.inviterSex) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="被邀请人" min-width="150">
          <template #default="scope">
            <div>{{ scope.row.inviteeNickname || (scope.row.inviteeId ? '未命名' : '待加入') }}</div>
            <div class="sub-text">ID: {{ scope.row.inviteeId || '-' }} · {{ sexLabel(scope.row.inviteeSex) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="邀请人记录" min-width="180">
          <template #default="scope">
            <div>{{ recordInfoText(scope.row.inviterRecordInfo) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="被邀请人记录" min-width="180">
          <template #default="scope">
            <div>{{ recordInfoText(scope.row.inviteeRecordInfo) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="statusTag(scope.row).type">{{ statusTag(scope.row).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="创建时间" width="170">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        <el-table-column align="left" label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="getDetails(scope.row)">查看</el-button>
            <el-button type="primary" link icon="delete" @click="deleteRow(scope.row)">删除</el-button>
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
    </div>

    <el-drawer destroy-on-close size="640" v-model="detailVisible" title="邀请放屁详情">
      <template v-if="detailData">
        <el-descriptions title="基础信息" :column="2" border>
          <el-descriptions-item label="记录ID">{{ detailData.ID }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(detailData.CreatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="邀请人">{{ detailData.inviterNickname || '未命名' }}</el-descriptions-item>
          <el-descriptions-item label="邀请人性别">{{ sexLabel(detailData.inviterSex) }}</el-descriptions-item>
          <el-descriptions-item label="被邀请人">{{ detailData.inviteeNickname || '待加入' }}</el-descriptions-item>
          <el-descriptions-item label="被邀请人性别">{{ sexLabel(detailData.inviteeSex) }}</el-descriptions-item>
        </el-descriptions>

        <div class="compare-panel">
          <el-card shadow="never" class="compare-card">
            <template #header>邀请人放屁信息</template>
            <p>类型：{{ labelOf(fartTypeOptions, detailData.inviterRecordInfo?.fartType) }}</p>
            <p>气味：{{ labelOf(smellLevelOptions, detailData.inviterRecordInfo?.smellLevel) }}</p>
            <p>心情：{{ labelOf(moodOptions, detailData.inviterRecordInfo?.mood) }}</p>
            <p>当量：{{ labelOf(volumeLevelOptions, detailData.inviterRecordInfo?.volumeLevel) || '-' }}</p>
          </el-card>
          <el-card shadow="never" class="compare-card">
            <template #header>被邀请人放屁信息</template>
            <p>类型：{{ labelOf(fartTypeOptions, detailData.inviteeRecordInfo?.fartType) || '待填写' }}</p>
            <p>气味：{{ labelOf(smellLevelOptions, detailData.inviteeRecordInfo?.smellLevel) || '待填写' }}</p>
            <p>心情：{{ labelOf(moodOptions, detailData.inviteeRecordInfo?.mood) || '待填写' }}</p>
            <p>当量：{{ labelOf(volumeLevelOptions, detailData.inviteeRecordInfo?.volumeLevel) || '-' }}</p>
          </el-card>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import {
  getFartTogetherRecordList,
  findFartTogetherRecord,
  deleteFartTogetherRecord,
  deleteFartTogetherRecordByIds
} from '@/plugin/fp_app/api/fart_together_record'
import { ElMessage, ElMessageBox } from 'element-plus'

const fartTypeOptions = [
  { label: '响亮型', value: 'loud' },
  { label: '轻柔型', value: 'soft' },
  { label: '无声型', value: 'silent' }
]
const smellLevelOptions = [
  { label: '清香', value: 1 },
  { label: '一般', value: 2 },
  { label: '浓烈', value: 3 }
]
const moodOptions = [
  { label: '开心', value: 'happy' },
  { label: '一般', value: 'normal' },
  { label: '尴尬', value: 'embarrassed' }
]
const volumeLevelOptions = [
  { label: '大当量', value: 'large' },
  { label: '中当量', value: 'medium' },
  { label: '小当量', value: 'small' },
  { label: '微单量', value: 'micro' }
]

const statusOptions = [
  { label: '待加入', value: 'pending' },
  { label: '已完成', value: 'completed' }
]

const getTodayDateTimeRange = () => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
  return [start, end]
}

const getDefaultSearchInfo = () => ({
  createdAtRange: getTodayDateTimeRange()
})

export default {
  name: 'FartTogetherRecord',
  data() {
    return {
      fartTypeOptions,
      smellLevelOptions,
      moodOptions,
      volumeLevelOptions,
      statusOptions,
      searchInfo: getDefaultSearchInfo(),
      tableData: [],
      multipleSelection: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      summary: {},
      detailVisible: false,
      detailData: null
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    labelOf(options, value) {
      const item = options.find((opt) => opt.value === value)
      return item ? item.label : value || ''
    },
    sexLabel(sex) {
      if (sex === 1) return '男'
      if (sex === 2) return '女'
      return '未设置'
    },
    recordInfoText(info) {
      if (!info || !info.fartType) return '待填写'
      return `${this.labelOf(fartTypeOptions, info.fartType)} / ${this.labelOf(smellLevelOptions, info.smellLevel)} / ${this.labelOf(moodOptions, info.mood)}`
    },
    isCompleted(row) {
      return row.inviteeId > 0 && row.inviteeRecordInfo && row.inviteeRecordInfo.fartType
    },
    statusTag(row) {
      if (this.isCompleted(row)) {
        return { label: '已完成', type: 'success' }
      }
      return { label: '待加入', type: 'warning' }
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    },
    async getTableData() {
      this.loading = true
      try {
        const res = await getFartTogetherRecordList({
          page: this.page,
          pageSize: this.pageSize,
          ...this.searchInfo
        })
        if (res.code === 0) {
          this.tableData = res.data.list || []
          this.total = res.data.total || 0
          this.summary = res.data.summary || {}
        }
      } finally {
        this.loading = false
      }
    },
    onSubmit() {
      this.page = 1
      this.getTableData()
    },
    onReset() {
      this.searchInfo = getDefaultSearchInfo()
      this.page = 1
      this.getTableData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getTableData()
    },
    async getDetails(row) {
      const res = await findFartTogetherRecord({ id: row.ID })
      if (res.code === 0) {
        this.detailData = res.data
        this.detailVisible = true
      }
    },
    async deleteRow(row) {
      ElMessageBox.confirm('确定删除这条邀请放屁记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deleteFartTogetherRecord(row)
        if (res.code === 0) {
          ElMessage.success('删除成功')
          if (this.tableData.length === 1 && this.page > 1) {
            this.page--
          }
          this.getTableData()
        }
      })
    },
    async onDelete() {
      ElMessageBox.confirm('确定批量删除选中的邀请放屁记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deleteFartTogetherRecordByIds({
          ids: this.multipleSelection.map((item) => item.ID)
        })
        if (res.code === 0) {
          ElMessage.success('删除成功')
          this.getTableData()
        }
      })
    }
  }
}
</script>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.summary-card {
  text-align: center;
}
.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}
.summary-label {
  margin-top: 6px;
  color: #909399;
  font-size: 13px;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.compare-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.compare-card p {
  margin: 8px 0;
}
@media (max-width: 900px) {
  .summary-cards,
  .compare-panel {
    grid-template-columns: 1fr;
  }
}
</style>
