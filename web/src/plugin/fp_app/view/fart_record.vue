<template>
  <div>
    <div class="summary-cards">
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.totalCount || 0 }}</div>
        <div class="summary-label">累计记录</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.todayCount || 0 }}</div>
        <div class="summary-label">今日新增</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.loudCount || 0 }}</div>
        <div class="summary-label">响亮型</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.softCount || 0 }}</div>
        <div class="summary-label">轻柔型</div>
      </el-card>
      <el-card shadow="hover" class="summary-card">
        <div class="summary-value">{{ summary.silentCount || 0 }}</div>
        <div class="summary-label">无声型</div>
      </el-card>
    </div>

    <div class="gva-search-box">
      <el-form ref="elSearchFormRef" :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.number="searchInfo.userId" placeholder="输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="屁屁类型" prop="fartType">
          <el-select v-model="searchInfo.fartType" clearable placeholder="请选择">
            <el-option v-for="item in fartTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="气味等级" prop="smellLevel">
          <el-select v-model="searchInfo.smellLevel" clearable placeholder="请选择">
            <el-option v-for="item in smellLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="心情" prop="mood">
          <el-select v-model="searchInfo.mood" clearable placeholder="请选择">
            <el-option v-for="item in moodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间段" prop="timePeriod">
          <el-select v-model="searchInfo.timePeriod" clearable placeholder="请选择">
            <el-option v-for="item in timePeriodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="放屁日期" prop="fartDateRange">
          <el-date-picker
            v-model="searchInfo.fartDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注" prop="noteStatus">
          <el-select v-model="searchInfo.noteStatus" clearable placeholder="请选择">
            <el-option v-for="item in noteStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
        <el-table-column align="left" label="用户" min-width="140">
          <template #default="scope">
            <div>{{ scope.row.userNickname || '未命名' }}</div>
            <div class="sub-text">ID: {{ scope.row.userId }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="放屁日期" width="120">
          <template #default="scope">{{ formatFartDate(scope.row.fartDate) }}</template>
        </el-table-column>
        <el-table-column align="left" label="放屁时间" prop="fartTime" width="110">
          <template #default="scope">{{ formatFartTime(scope.row.fartTime) }}</template>
        </el-table-column>
        <el-table-column align="left" label="屁屁类型" width="100">
          <template #default="scope">
            <el-tag :type="fartTypeTag(scope.row.fartType)">{{ labelOf(fartTypeOptions, scope.row.fartType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="left" label="气味" width="90">
          <template #default="scope">{{ labelOf(smellLevelOptions, scope.row.smellLevel) }}</template>
        </el-table-column>
        <el-table-column align="left" label="心情" width="90">
          <template #default="scope">{{ labelOf(moodOptions, scope.row.mood) }}</template>
        </el-table-column>
        <el-table-column align="left" label="当量" width="90">
          <template #default="scope">{{ labelOf(volumeLevelOptions, scope.row.volumeLevel) || '-' }}</template>
        </el-table-column>
        <el-table-column align="left" label="时间段" width="90">
          <template #default="scope">{{ labelOf(timePeriodOptions, scope.row.timePeriod) }}</template>
        </el-table-column>
        <el-table-column align="left" label="备注" prop="note" min-width="160" show-overflow-tooltip />
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

    <el-drawer destroy-on-close size="520" v-model="detailVisible" title="放屁记录详情">
      <el-descriptions :column="1" border v-if="detailData">
        <el-descriptions-item label="记录ID">{{ detailData.ID }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.userNickname || '未命名' }}（ID: {{ detailData.userId }}）</el-descriptions-item>
        <el-descriptions-item label="放屁日期">{{ formatFartDate(detailData.fartDate) }}</el-descriptions-item>
        <el-descriptions-item label="放屁时间">{{ formatFartTime(detailData.fartTime) }}</el-descriptions-item>
        <el-descriptions-item label="屁屁类型">{{ labelOf(fartTypeOptions, detailData.fartType) }}</el-descriptions-item>
        <el-descriptions-item label="气味等级">{{ labelOf(smellLevelOptions, detailData.smellLevel) }}</el-descriptions-item>
        <el-descriptions-item label="心情">{{ labelOf(moodOptions, detailData.mood) }}</el-descriptions-item>
        <el-descriptions-item label="放屁当量">{{ labelOf(volumeLevelOptions, detailData.volumeLevel) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时间段">{{ labelOf(timePeriodOptions, detailData.timePeriod) }}</el-descriptions-item>
        <el-descriptions-item label="小时">{{ detailData.hourOfDay }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailData.note || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(detailData.CreatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script>
import {
  getFartRecordList,
  findFartRecord,
  deleteFartRecord,
  deleteFartRecordByIds
} from '@/plugin/fp_app/api/fart_record'
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
const timePeriodOptions = [
  { label: '凌晨', value: 'dawn' },
  { label: '上午', value: 'morning' },
  { label: '下午', value: 'afternoon' },
  { label: '晚上', value: 'evening' }
]

const noteStatusOptions = [
  { label: '有备注', value: 'with' },
  { label: '无备注', value: 'without' }
]

const getTodayDateString = () => {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getTodayDateRange = () => {
  const todayStr = getTodayDateString()
  return [todayStr, todayStr]
}

const getDefaultSearchInfo = () => ({
  fartDateRange: getTodayDateRange()
})

export default {
  name: 'FartRecord',
  data() {
    return {
      fartTypeOptions,
      smellLevelOptions,
      moodOptions,
      volumeLevelOptions,
      timePeriodOptions,
      noteStatusOptions,
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
      return item ? item.label : value || '-'
    },
    fartTypeTag(type) {
      if (type === 'loud') return 'danger'
      if (type === 'soft') return 'warning'
      return 'info'
    },
    formatFartDate(date) {
      if (!date) return '-'
      if (typeof date === 'string') return date.slice(0, 10)
      return date
    },
    formatFartTime(time) {
      if (!time) return '-'
      if (time.length > 8 && (time[10] === 'T' || time[10] === ' ')) {
        const part = time.includes('T') ? time.split('T')[1] : time.split(' ')[1]
        return part ? part.slice(0, 8) : time
      }
      return time.length > 8 ? time.slice(0, 8) : time
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString()
    },
    async getTableData() {
      this.loading = true
      try {
        const res = await getFartRecordList({
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
      const res = await findFartRecord({ id: row.ID })
      if (res.code === 0) {
        this.detailData = res.data
        this.detailVisible = true
      }
    },
    async deleteRow(row) {
      ElMessageBox.confirm('确定删除这条放屁记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deleteFartRecord(row)
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
      ElMessageBox.confirm('确定批量删除选中的放屁记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await deleteFartRecordByIds({
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
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
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
