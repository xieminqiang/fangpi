
<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="elSearchFormRef" :inline="true" :model="searchInfo" class="demo-form-inline" @keyup.enter="onSubmit">
      <el-form-item label="创建日期" prop="createdAtRange">
      <template #label>
        <span>
          创建日期
          <el-tooltip content="搜索范围是开始日期（包含）至结束日期（不包含）">
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </span>
      </template>
         <el-date-picker
                  v-model="searchInfo.createdAtRange"
                  class="w-[380px]"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                />
       </el-form-item>
      
            <el-form-item label="微信用户凭证" prop="openid">
  <el-input v-model="searchInfo.openid" placeholder="输入微信用户凭证" />
</el-form-item>
      
            <el-form-item label="用户昵称" prop="nickname">
  <el-input v-model="searchInfo.nickname" placeholder="输入用户昵称" />
</el-form-item>
           
            <el-form-item label="手机号" prop="phone">
  <el-input v-model="searchInfo.phone" placeholder="输入手机号" />
</el-form-item>
           
            <el-form-item label="等级" prop="level">
  <el-select v-model="searchInfo.level" clearable filterable placeholder="请选择等级" @clear="()=>{searchInfo.level=undefined}">
    <el-option label="1级" :value="1" />
    <el-option label="2级" :value="2" />
    <el-option label="3级" :value="3" />
    <el-option label="4级" :value="4" />
    <el-option label="5级" :value="5" />
    <el-option label="6级" :value="6" />
  </el-select>
</el-form-item>
           
        <template v-if="showAllQuery">
          <!-- 将需要控制显示状态的查询条件添加到此范围内 -->
        </template>

        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
          <el-button link type="primary" icon="arrow-down" @click="showAllQuery=true" v-if="!showAllQuery">展开</el-button>
          <el-button link type="primary" icon="arrow-up" @click="showAllQuery=false" v-else>收起</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
        <div class="gva-btn-list">
            <el-button  type="primary" icon="plus" @click="openDialog()">新增</el-button>
            <el-button  icon="delete" style="margin-left: 10px;" :disabled="!multipleSelection.length" @click="onDelete">删除</el-button>
            <el-button  type="success" icon="Picture" style="margin-left: 10px;" :disabled="!multipleSelection.length" @click="batchUpdateAvatar">批量修改头像</el-button>
            <el-button  type="warning" icon="Edit" style="margin-left: 10px;" :disabled="!multipleSelection.length" @click="batchUpdateNickname">批量修改昵称</el-button>
            <!-- <el-button  type="info" icon="Search" style="margin-left: 10px;" @click="validateFartCounts" :loading="validating">手动校验打屁次数</el-button> -->
            <!-- <el-button  type="warning" icon="Search" style="margin-left: 10px;" @click="showValidateSpecificDialog = true">手动校验指定用户</el-button> -->
        </div>
        <el-table
        ref="multipleTable"
        style="width: 100%"
        tooltip-effect="dark"
        :data="tableData"
        row-key="ID"
        @selection-change="handleSelectionChange"
        >
        <el-table-column type="selection" width="55" />
        
        <el-table-column sortable align="left" label="日期" prop="CreatedAt" width="180">
            <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        
            <el-table-column align="left" label="微信用户凭证" prop="openid" width="120" />

            <el-table-column align="left" label="用户昵称" prop="nickname" width="120" />

            <el-table-column align="left" label="用户类型" prop="userType" width="100">
              <template #default="scope">
                <el-tag v-if="(scope.row.userType || 1) === 2" type="danger" size="small">小红书</el-tag>
                <el-tag v-else type="success" size="small">微信</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="头像" prop="avatar" width="200">
    <template #default="scope">
      <el-image preview-teleported style="width: 100px; height: 100px" :src="getUrl(scope.row.avatar)" fit="cover"/>
    </template>
</el-table-column>
            <el-table-column align="left" label="手机号" prop="phone" width="120" />

            <el-table-column align="left" label="用户状态" prop="status" width="120">
    <template #default="scope">
    {{ filterDict(scope.row.status,wx_user_statusOptions) }}
    </template>
</el-table-column>
            <el-table-column align="left" label="性别" prop="gender" width="120">
    <template #default="scope">
    {{ filterDict(scope.row.gender,genderOptions) }}
    </template>
</el-table-column>
            <el-table-column align="left" label="屁格等级" prop="level" width="100" />
            <el-table-column align="left" label="等级名称" prop="levelName" width="150" />
            <el-table-column align="left" label="累计次数" prop="totalFarts" width="100" />
            <el-table-column align="left" label="经验值" prop="experience" width="100" />
        <el-table-column align="left" label="操作" fixed="right" min-width="240">
            <template #default="scope">
            <el-button  type="primary" link class="table-button" @click="getDetails(scope.row)"><el-icon style="margin-right: 5px"><InfoFilled /></el-icon>查看</el-button>
            <el-button  type="primary" link icon="edit" class="table-button" @click="updateWxUserFunc(scope.row)">编辑</el-button>
            <el-button   type="primary" link icon="delete" @click="deleteRow(scope.row)">删除</el-button>
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
    <el-drawer destroy-on-close size="800" v-model="dialogFormVisible" :show-close="false" :before-close="closeDialog">
       <template #header>
              <div class="flex justify-between items-center">
                <span class="text-lg">{{type==='create'?'新增':'编辑'}}</span>
                <div>
                  <el-button :loading="btnLoading" type="primary" @click="enterDialog">确 定</el-button>
                  <el-button @click="closeDialog">取 消</el-button>
                </div>
              </div>
            </template>

          <el-form :model="formData" label-position="top" ref="elFormRef" :rules="rule" label-width="80px">
             <el-form-item label="微信用户凭证:" prop="openid">
    <el-input v-model="formData.openid" :clearable="true" placeholder="请输入微信用户凭证" />
</el-form-item>
             <el-form-item label="用户昵称:" prop="nickname">
    <el-input v-model="formData.nickname" :clearable="true" placeholder="请输入用户昵称" />
</el-form-item>
             <el-form-item label="头像:" prop="avatar">
    <div class="flex items-center gap-2">
      <SelectImage
       v-model="formData.avatar"
       file-type="image"
      />
      <el-button 
        type="primary" 
        size="small" 
        icon="refresh" 
        @click="autoMatchAvatar"
        :loading="avatarMatching"
        :disabled="!formData.nickname"
      >
        自动匹配
      </el-button>
    </div>
</el-form-item>
             <el-form-item label="手机号:" prop="phone">
    <el-input v-model="formData.phone" :clearable="true" placeholder="请输入手机号" />
</el-form-item>
             <el-form-item label="用户状态:" prop="status">
    <el-select v-model="formData.status" placeholder="请选择用户状态" style="width:100%" filterable :clearable="true">
        <el-option v-for="(item,key) in wx_user_statusOptions" :key="key" :label="item.label" :value="item.value" />
    </el-select>
</el-form-item>
             <el-form-item label="性别:" prop="gender">
    <el-select v-model="formData.gender" placeholder="请选择性别" style="width:100%" filterable :clearable="true">
        <el-option v-for="(item,key) in genderOptions" :key="key" :label="item.label" :value="item.value" />
    </el-select>
</el-form-item>
             <el-form-item label="屁格等级:" prop="level">
    <el-input-number v-model="formData.level" :min="1" :max="6" placeholder="屁格等级" disabled style="width:100%" />
</el-form-item>
             <el-form-item label="等级名称:" prop="levelName">
    <el-input v-model="formData.levelName" :clearable="true" placeholder="等级名称" disabled />
</el-form-item>
             <el-form-item label="累计放屁次数:" prop="totalFarts">
    <el-input-number v-model="formData.totalFarts" :min="0" placeholder="累计放屁次数" disabled style="width:100%" />
</el-form-item>
             <el-form-item label="经验值:" prop="experience">
    <el-input-number v-model="formData.experience" :min="0" placeholder="经验值" disabled style="width:100%" />
</el-form-item>
          </el-form>
    </el-drawer>

    <el-drawer destroy-on-close size="800" v-model="detailShow" :show-close="true" :before-close="closeDetailShow" title="查看">
            <el-descriptions :column="1" border>
                 <el-descriptions-item label="微信用户凭证">
    {{ detailFrom.openid }}
</el-descriptions-item>
                 <el-descriptions-item label="用户昵称">
    {{ detailFrom.nickname }}
</el-descriptions-item>
                 <el-descriptions-item label="头像">
    <el-image style="width: 50px; height: 50px" :preview-src-list="returnArrImg(detailFrom.avatar)" :src="getUrl(detailFrom.avatar)" fit="cover" />
</el-descriptions-item>
                 <el-descriptions-item label="手机号">
    {{ detailFrom.phone }}
</el-descriptions-item>
                 <el-descriptions-item label="用户状态">
    {{ detailFrom.status }}
</el-descriptions-item>
                 <el-descriptions-item label="性别">
    {{ detailFrom.gender }}
</el-descriptions-item>
                 <el-descriptions-item label="屁格等级">
    {{ detailFrom.level }}
</el-descriptions-item>
                 <el-descriptions-item label="等级名称">
    {{ detailFrom.levelName }}
</el-descriptions-item>
                 <el-descriptions-item label="累计放屁次数">
    {{ detailFrom.totalFarts }}
</el-descriptions-item>
                 <el-descriptions-item label="经验值">
    {{ detailFrom.experience }}
</el-descriptions-item>
            </el-descriptions>
        </el-drawer>

    <!-- 校验结果对话框 -->
    <el-dialog
      v-model="validateDialogVisible"
      title="打屁次数校验结果"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="validateResults.length === 0" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; color: #67c23a;">✓</div>
        <p style="margin-top: 20px; color: #67c23a; font-size: 16px;">所有用户的打屁次数和经验值都正确！</p>
      </div>
      <el-table
        v-else
        :data="validateResults"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="userID" label="用户ID" width="100" />
        <el-table-column prop="nickname" label="用户昵称" width="150" />
        <el-table-column prop="openid" label="OpenID" width="200" show-overflow-tooltip />
        <el-table-column prop="totalFarts" label="用户表总数" width="120" align="center" />
        <el-table-column prop="actualCount" label="实际统计数" width="120" align="center" />
        <el-table-column prop="difference" label="次数差值" width="120" align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.difference > 0 ? '#f56c6c' : scope.row.difference < 0 ? '#67c23a' : '' }">
              {{ scope.row.difference > 0 ? '+' : '' }}{{ scope.row.difference }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="experience" label="用户表经验值" width="130" align="center" />
        <el-table-column prop="actualExperience" label="实际经验值" width="130" align="center" />
        <el-table-column prop="achievementExp" label="成就经验值" width="120" align="center" />
        <el-table-column prop="experienceDiff" label="经验值差值" width="120" align="center">
          <template #default="scope">
            <span :style="{ color: scope.row.experienceDiff > 0 ? '#f56c6c' : scope.row.experienceDiff < 0 ? '#67c23a' : '' }">
              {{ scope.row.experienceDiff > 0 ? '+' : '' }}{{ scope.row.experienceDiff }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click="fixUserFartCount(scope.row)"
              :loading="fixingUserIds.includes(scope.row.userID)"
            >
              修复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div style="text-align: right;">
          <el-button @click="validateDialogVisible = false">关闭</el-button>
          <el-button
            v-if="validateResults.length > 0"
            type="primary"
            @click="batchFixFartCounts"
            :loading="batchFixing"
          >
            批量修复所有
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 手动校验指定用户对话框 -->
    <el-dialog
      v-model="showValidateSpecificDialog"
      title="手动校验指定用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="validateSpecificForm" label-width="120px">
        <el-form-item label="用户ID列表" required>
          <el-input
            v-model="validateSpecificForm.userIDs"
            type="textarea"
            :rows="4"
            placeholder="请输入用户ID，多个ID用逗号分隔，例如：156,634,725"
          />
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            提示：输入用户ID，用逗号分隔，例如：156,634,725
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: right;">
          <el-button @click="showValidateSpecificDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="validateSpecificUsers"
            :loading="validatingSpecific"
          >
            开始校验
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {
  createWxUser,
  deleteWxUser,
  deleteWxUserByIds,
  updateWxUser,
  findWxUser,
  getWxUserList,
  validateFartCounts as validateFartCountsAPI,
  validateExperience as validateExperienceAPI,
  validateSpecificUsers as validateSpecificUsersAPI
} from '@/plugin/fp_app/api/wx_user'
import { getNicknameTemplateList } from '@/plugin/fp_app/api/nickname_template'
import { getUrl } from '@/utils/image'
// 图片选择组件
import SelectImage from '@/components/selectImage/selectImage.vue'

// 全量引入格式化工具 请按需保留
import { getDictFunc, formatDate, formatBoolean, filterDict ,filterDataSource, returnArrImg, onDownloadFile } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive } from 'vue'




defineOptions({
    name: 'WxUser'
})

// 提交按钮loading
const btnLoading = ref(false)
// 头像匹配loading
const avatarMatching = ref(false)
// 校验loading
const validating = ref(false)
// 批量修复loading
const batchFixing = ref(false)
// 正在修复的用户ID列表
const fixingUserIds = ref([])
// 校验结果对话框显示状态
const validateDialogVisible = ref(false)
// 校验结果列表
const validateResults = ref([])
// 手动校验指定用户对话框显示状态
const showValidateSpecificDialog = ref(false)
// 手动校验指定用户loading
const validatingSpecific = ref(false)
// 手动校验指定用户表单
const validateSpecificForm = ref({
  userIDs: ''
})

// 控制更多查询条件显示/隐藏状态
const showAllQuery = ref(false)

// 自动化生成的字典（可能为空）以及字段
const wx_user_statusOptions = ref([])
const genderOptions = ref([])
const formData = ref({
            openid: '',
            nickname: '',
            avatar: "",
            phone: '',
            status: '',
            gender: '',
            level: 1,
            levelName: '新手屁民',
            totalFarts: 0,
            experience: 0,
        })



// 验证规则
const rule = reactive({
               openid : [{
                   required: true,
                   message: '',
                   trigger: ['input','blur'],
               },
               {
                   whitespace: true,
                   message: '不能只输入空格',
                   trigger: ['input', 'blur'],
              }
              ],
               phone : [{
                   whitespace: true,
                   message: '不能只输入空格',
                   trigger: ['input', 'blur'],
              }
              ],
               status : [{
                   required: true,
                   message: '',
                   trigger: ['input','blur'],
               },
               {
                   whitespace: true,
                   message: '不能只输入空格',
                   trigger: ['input', 'blur'],
              }
              ],
})

const elFormRef = ref()
const elSearchFormRef = ref()

// =========== 表格控制部分 ===========
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 获取今天的开始和结束时间
const getTodayDateRange = () => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
  return [start, end]
}

const searchInfo = ref({
  createdAtRange: getTodayDateRange(),
  openid: ''
})

// 重置
const onReset = () => {
  searchInfo.value = {
    createdAtRange: getTodayDateRange(),
    openid: ''
  }
  getTableData()
}

// 搜索
const onSubmit = () => {
  elSearchFormRef.value?.validate(async(valid) => {
    if (!valid) return
    page.value = 1
    getTableData()
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 修改页面容量
const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 查询
const getTableData = async() => {
  const table = await getWxUserList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (table.code === 0) {
    tableData.value = table.data.list
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}

getTableData()

// ============== 表格控制部分结束 ===============

// 获取需要的字典 可能为空 按需保留
const setOptions = async () =>{
    wx_user_statusOptions.value = await getDictFunc('wx_user_status')
    genderOptions.value = await getDictFunc('gender')
}




// 多选数据
const multipleSelection = ref([])
// 多选
const handleSelectionChange = (val) => {
    multipleSelection.value = val
}

// 删除行
const deleteRow = (row) => {
    ElMessageBox.confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
            deleteWxUserFunc(row)
        })
    }

// 多选删除
const onDelete = async() => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async() => {
      const IDs = []
      if (multipleSelection.value.length === 0) {
        ElMessage({
          type: 'warning',
          message: '请选择要删除的数据'
        })
        return
      }
      multipleSelection.value &&
        multipleSelection.value.map(item => {
          IDs.push(item.ID)
        })
      const res = await deleteWxUserByIds({ IDs })
      if (res.code === 0) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        if (tableData.value.length === IDs.length && page.value > 1) {
          page.value--
        }
        getTableData()
      }
      })
    }

// 行为控制标记（弹窗内部需要增还是改）
const type = ref('')

// 更新行
const updateWxUserFunc = async(row) => {
    const res = await findWxUser({ ID: row.ID })
    type.value = 'update'
    if (res.code === 0) {
        formData.value = res.data
        dialogFormVisible.value = true
    }
}


// 删除行
const deleteWxUserFunc = async (row) => {
    const res = await deleteWxUser({ ID: row.ID })
    if (res.code === 0) {
        ElMessage({
                type: 'success',
                message: '删除成功'
            })
            if (tableData.value.length === 1 && page.value > 1) {
            page.value--
        }
        getTableData()
    }
}

// 弹窗控制标记
const dialogFormVisible = ref(false)

// 打开弹窗
const openDialog = () => {
    type.value = 'create'
    dialogFormVisible.value = true
}

// 关闭弹窗
const closeDialog = () => {
    dialogFormVisible.value = false
    formData.value = {
        openid: '',
        nickname: '',
        avatar: "",
        phone: '',
        status: '',
        gender: '',
        }
}
// 弹窗确定
const enterDialog = async () => {
     btnLoading.value = true
     elFormRef.value?.validate( async (valid) => {
             if (!valid) return btnLoading.value = false
              let res
              switch (type.value) {
                case 'create':
                  res = await createWxUser(formData.value)
                  break
                case 'update':
                  res = await updateWxUser(formData.value)
                  break
                default:
                  res = await createWxUser(formData.value)
                  break
              }
              btnLoading.value = false
              if (res.code === 0) {
                ElMessage({
                  type: 'success',
                  message: '创建/更改成功'
                })
                closeDialog()
                getTableData()
              }
      })
}

const detailFrom = ref({})

// 查看详情控制标记
const detailShow = ref(false)


// 打开详情弹窗
const openDetailShow = () => {
  detailShow.value = true
}


// 打开详情
const getDetails = async (row) => {
  // 打开弹窗
  const res = await findWxUser({ ID: row.ID })
  if (res.code === 0) {
    detailFrom.value = res.data
    openDetailShow()
  }
}


// 关闭详情弹窗
const closeDetailShow = () => {
  detailShow.value = false
  detailFrom.value = {}
}

// 批量修改头像
const batchUpdateAvatar = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage({
      type: 'warning',
      message: '请选择要修改头像的用户'
    })
    return
  }

  // 默认头像URL
  const defaultAvatarUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png'

  ElMessageBox.confirm(
    `确定要为选中的 ${multipleSelection.value.length} 个用户批量修改头像吗？\n（仅修改头像为默认头像的用户）`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    btnLoading.value = true
    try {
      // 获取昵称模板列表，pageSize设为200
      const templateRes = await getNicknameTemplateList({
        page: 1,
        pageSize: 200
      })

      if (templateRes.code !== 0) {
        ElMessage({
          type: 'error',
          message: '获取昵称模板失败: ' + templateRes.msg
        })
        btnLoading.value = false
        return
      }

      const templates = templateRes.data.list || []
      // 创建昵称名称到图片的映射
      const nameToImageMap = {}
      templates.forEach(template => {
        if (template.name) {
          nameToImageMap[template.name] = template.image
        }
      })

      let successCount = 0
      let failCount = 0
      let skipCount = 0
      const failMessages = []

      // 遍历选中的用户，批量更新头像
      for (const user of multipleSelection.value) {
        try {
          // 检查用户头像是否为默认头像，只有默认头像才修改
          const userAvatar = user.avatar || ''
          if (userAvatar !== defaultAvatarUrl) {
            skipCount++
            continue
          }

          // 去掉昵称后四位
          const nickname = user.nickname || ''
          let nicknamePrefix = nickname
          if (nickname.length > 4) {
            nicknamePrefix = nickname.substring(0, nickname.length - 4)
          }

          // 查找匹配的模板图片
          const matchedImage = nameToImageMap[nicknamePrefix]

          if (!matchedImage) {
            failCount++
            failMessages.push(`${user.nickname}: 未找到匹配的昵称模板`)
            continue
          }

          // 更新用户头像
          const updateData = {
            ...user,
            avatar: matchedImage
          }

          const res = await updateWxUser(updateData)
          if (res.code === 0) {
            successCount++
          } else {
            failCount++
            failMessages.push(`${user.nickname}: ${res.msg || '更新失败'}`)
          }
        } catch (error) {
          failCount++
          failMessages.push(`${user.nickname}: ${error.message || '更新失败'}`)
        }
      }

      // 显示结果
      let resultMessage = ''
      if (successCount > 0) {
        resultMessage = `成功更新 ${successCount} 个用户的头像`
        if (skipCount > 0) {
          resultMessage += `，跳过 ${skipCount} 个非默认头像用户`
        }
        if (failCount > 0) {
          resultMessage += `，失败 ${failCount} 个`
        }
        ElMessage({
          type: 'success',
          message: resultMessage,
          duration: 5000
        })
      } else {
        if (skipCount > 0) {
          ElMessage({
            type: 'info',
            message: `已跳过 ${skipCount} 个非默认头像用户${failCount > 0 ? `，失败 ${failCount} 个` : ''}`,
            duration: 5000
          })
        }
      }

      if (failCount > 0 && failMessages.length > 0) {
        console.error('批量更新头像失败详情:', failMessages)
        if (successCount === 0) {
          ElMessage({
            type: 'warning',
            message: `更新失败，共 ${failCount} 个用户`,
            duration: 5000
          })
        }
      }

      // 刷新表格数据
      getTableData()
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '批量修改头像失败: ' + error.message
      })
    } finally {
      btnLoading.value = false
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 批量修改昵称
const batchUpdateNickname = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage({
      type: 'warning',
      message: '请选择要修改昵称的用户'
    })
    return
  }

  // 筛选出昵称为"新手屁屁"的用户
  const targetUsers = multipleSelection.value.filter(user => user.nickname === '新手屁屁')

  if (targetUsers.length === 0) {
    ElMessage({
      type: 'warning',
      message: '选中的用户中没有昵称为"新手屁屁"的用户'
    })
    return
  }

  ElMessageBox.confirm(
    `确定要为选中的 ${targetUsers.length} 个昵称为"新手屁屁"的用户批量修改昵称和头像吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    btnLoading.value = true
    try {
      // 获取昵称模板列表，pageSize设为200
      const templateRes = await getNicknameTemplateList({
        page: 1,
        pageSize: 200
      })

      if (templateRes.code !== 0) {
        ElMessage({
          type: 'error',
          message: '获取昵称模板失败: ' + templateRes.msg
        })
        btnLoading.value = false
        return
      }

      const templates = templateRes.data.list || []
      if (templates.length === 0) {
        ElMessage({
          type: 'warning',
          message: '昵称模板列表为空，无法进行批量修改'
        })
        btnLoading.value = false
        return
      }

      // 过滤出有效的模板（有名称和图片的）
      const validTemplates = templates.filter(t => t.name && t.image)
      if (validTemplates.length === 0) {
        ElMessage({
          type: 'warning',
          message: '没有有效的昵称模板（需要同时有名称和图片）'
        })
        btnLoading.value = false
        return
      }

      // 实现均匀随机分配：创建模板池，每个模板使用次数尽可能相等
      // 打乱模板列表以实现随机
      const shuffledTemplates = [...validTemplates].sort(() => Math.random() - 0.5)
      
      // 创建模板池，确保均匀分配
      const templatePool = []
      const timesPerTemplate = Math.ceil(targetUsers.length / shuffledTemplates.length)
      for (let i = 0; i < timesPerTemplate; i++) {
        // 每次循环都打乱顺序，增加随机性
        const shuffled = [...shuffledTemplates].sort(() => Math.random() - 0.5)
        templatePool.push(...shuffled)
      }
      // 只取需要的数量
      const finalTemplatePool = templatePool.slice(0, targetUsers.length)

      // 均匀分配：使用模板池
      let successCount = 0
      let failCount = 0
      const failMessages = []

      for (let i = 0; i < targetUsers.length; i++) {
        const user = targetUsers[i]
        try {
          // 从模板池中获取模板
          const selectedTemplate = finalTemplatePool[i]

          // 生成新的昵称：模板名称 + 随机后缀（4位字符）
          const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
          const newNickname = selectedTemplate.name + '_' + randomSuffix

          // 更新用户昵称和头像
          const updateData = {
            ...user,
            nickname: newNickname,
            avatar: selectedTemplate.image
          }

          const res = await updateWxUser(updateData)
          if (res.code === 0) {
            successCount++
          } else {
            failCount++
            failMessages.push(`${user.nickname}: ${res.msg || '更新失败'}`)
          }
        } catch (error) {
          failCount++
          failMessages.push(`${user.nickname}: ${error.message || '更新失败'}`)
        }
      }

      // 显示结果
      let resultMessage = ''
      if (successCount > 0) {
        resultMessage = `成功更新 ${successCount} 个用户的昵称和头像`
        if (failCount > 0) {
          resultMessage += `，失败 ${failCount} 个`
        }
        ElMessage({
          type: 'success',
          message: resultMessage,
          duration: 5000
        })
      } else {
        ElMessage({
          type: 'error',
          message: `更新失败，共 ${failCount} 个用户`,
          duration: 5000
        })
      }

      if (failCount > 0 && failMessages.length > 0) {
        console.error('批量更新昵称失败详情:', failMessages)
      }

      // 刷新表格数据
      getTableData()
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '批量修改昵称失败: ' + error.message
      })
    } finally {
      btnLoading.value = false
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 自动匹配头像（编辑表单中使用）
const autoMatchAvatar = async () => {
  if (!formData.value.nickname) {
    ElMessage({
      type: 'warning',
      message: '请先输入用户昵称'
    })
    return
  }

  avatarMatching.value = true
  try {
    // 获取昵称模板列表，pageSize设为200
    const templateRes = await getNicknameTemplateList({
      page: 1,
      pageSize: 200
    })

    if (templateRes.code !== 0) {
      ElMessage({
        type: 'error',
        message: '获取昵称模板失败: ' + templateRes.msg
      })
      return
    }

    const templates = templateRes.data.list || []
    // 创建昵称名称到图片的映射
    const nameToImageMap = {}
    templates.forEach(template => {
      if (template.name) {
        nameToImageMap[template.name] = template.image
      }
    })

    // 去掉昵称后四位
    const nickname = formData.value.nickname || ''
    let nicknamePrefix = nickname
    if (nickname.length > 4) {
      nicknamePrefix = nickname.substring(0, nickname.length - 4)
    }

    // 查找匹配的模板图片
    const matchedImage = nameToImageMap[nicknamePrefix]

    if (!matchedImage) {
      ElMessage({
        type: 'warning',
        message: `未找到匹配的昵称模板（昵称前缀：${nicknamePrefix}）`
      })
      return
    }

    // 自动填充头像
    formData.value.avatar = matchedImage
    ElMessage({
      type: 'success',
      message: '头像已自动匹配'
    })
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '自动匹配头像失败: ' + error.message
    })
  } finally {
    avatarMatching.value = false
  }
}

// 手动校验打屁次数（分两步：先校验打屁次数，再校验经验值）
const validateFartCounts = async () => {
  validating.value = true
  try {
    // 第一步：快速校验打屁次数
    const res = await validateFartCountsAPI()
    if (res.code !== 0) {
      ElMessage({
        type: 'error',
        message: res.msg || '校验失败'
      })
      return
    }

    const fartCountResults = res.data || []
    
    if (fartCountResults.length === 0) {
      validateResults.value = []
      validateDialogVisible.value = true
      ElMessage({
        type: 'success',
        message: '所有用户的打屁次数都正确！'
      })
      return
    }

    // 第二步：对打屁次数不对的用户，校验经验值
    const userIDs = fartCountResults.map(r => r.userID)
    const expRes = await validateExperienceAPI(userIDs)
    
    if (expRes.code !== 0) {
      ElMessage({
        type: 'warning',
        message: '打屁次数校验完成，但经验值校验失败: ' + (expRes.msg || '未知错误')
      })
      // 即使经验值校验失败，也显示打屁次数的结果
      validateResults.value = fartCountResults
      validateDialogVisible.value = true
      return
    }

    // 合并打屁次数和经验值的结果
    const expResults = expRes.data || {}
    validateResults.value = fartCountResults.map(result => {
      const expData = expResults[result.userID]
      if (expData) {
        return {
          ...result,
          experience: expData.experience,
          actualExperience: expData.actualExperience,
          experienceDiff: expData.experienceDiff,
          achievementExp: expData.achievementExp
        }
      }
      return result
    })

    validateDialogVisible.value = true
    
    // 统计经验值不对的用户数量
    const expErrorCount = validateResults.value.filter(r => r.experienceDiff !== 0).length
    
    if (expErrorCount > 0) {
      ElMessage({
        type: 'warning',
        message: `发现 ${fartCountResults.length} 个用户的打屁次数不正确，其中 ${expErrorCount} 个用户的经验值也不正确`,
        duration: 5000
      })
    } else {
      ElMessage({
        type: 'warning',
        message: `发现 ${fartCountResults.length} 个用户的打屁次数不正确`,
        duration: 5000
      })
    }
  } catch (error) {
    console.error('校验失败:', error)
    ElMessage({
      type: 'error',
      message: '校验失败: ' + (error.message || '未知错误')
    })
  } finally {
    validating.value = false
  }
}

// 修复单个用户的打屁次数
const fixUserFartCount = async (row) => {
  if (fixingUserIds.value.includes(row.userID)) {
    return
  }
  
  fixingUserIds.value.push(row.userID)
  try {
    // 获取用户信息
    const userRes = await findWxUser({ ID: row.userID })
    if (userRes.code !== 0) {
      ElMessage({
        type: 'error',
        message: '获取用户信息失败'
      })
      return
    }
    
    const user = userRes.data
    // 更新用户的 total_farts 和 experience
    // actualExperience 已经包含了打屁次数 + 成就经验值，应该直接使用
    // 如果 actualExperience 未定义，则计算：打屁次数 + 成就经验值
    let finalExperience = row.actualExperience
    if (finalExperience === undefined || finalExperience === null) {
      // 如果经验值未校验，则使用打屁次数 + 成就经验值
      finalExperience = row.actualCount + (row.achievementExp || 0)
    }
    const updateData = {
      ...user,
      totalFarts: row.actualCount,
      experience: finalExperience // 使用包含成就经验值的总经验值
    }
    
    const res = await updateWxUser(updateData)
    if (res.code === 0) {
      ElMessage({
        type: 'success',
        message: `用户 ${row.nickname} 的打屁次数和经验值已修复`
      })
      // 从结果列表中移除已修复的用户
      validateResults.value = validateResults.value.filter(r => r.userID !== row.userID)
      // 刷新表格数据
      getTableData()
    } else {
      ElMessage({
        type: 'error',
        message: res.msg || '修复失败'
      })
    }
  } catch (error) {
    console.error('修复用户打屁次数失败:', error)
    ElMessage({
      type: 'error',
      message: '修复失败: ' + (error.message || '未知错误')
    })
  } finally {
    fixingUserIds.value = fixingUserIds.value.filter(id => id !== row.userID)
  }
}

// 批量修复所有用户的打屁次数
const batchFixFartCounts = async () => {
  if (validateResults.value.length === 0) {
    return
  }
  
  ElMessageBox.confirm(
    `确定要修复所有 ${validateResults.value.length} 个用户的打屁次数和经验值吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    batchFixing.value = true
    let successCount = 0
    let failCount = 0
    
    for (const row of validateResults.value) {
      try {
        // 获取用户信息
        const userRes = await findWxUser({ ID: row.userID })
        if (userRes.code !== 0) {
          failCount++
          continue
        }
        
        const user = userRes.data
        // 更新用户的 total_farts 和 experience
        // actualExperience 已经包含了打屁次数 + 成就经验值，应该直接使用
        // 如果 actualExperience 未定义，则计算：打屁次数 + 成就经验值
        let finalExperience = row.actualExperience
        if (finalExperience === undefined || finalExperience === null) {
          // 如果经验值未校验，则使用打屁次数 + 成就经验值
          finalExperience = row.actualCount + (row.achievementExp || 0)
        }
        const updateData = {
          ...user,
          totalFarts: row.actualCount,
          experience: finalExperience // 使用包含成就经验值的总经验值
        }
        
        const res = await updateWxUser(updateData)
        if (res.code === 0) {
          successCount++
        } else {
          failCount++
        }
      } catch (error) {
        console.error(`修复用户 ${row.userID} 失败:`, error)
        failCount++
      }
    }
    
    batchFixing.value = false
    
    if (successCount > 0) {
      ElMessage({
        type: 'success',
        message: `成功修复 ${successCount} 个用户${failCount > 0 ? `，失败 ${failCount} 个` : ''}`,
        duration: 5000
      })
      // 清空结果列表
      validateResults.value = []
      // 刷新表格数据
      getTableData()
    } else {
      ElMessage({
        type: 'error',
        message: `修复失败，共 ${failCount} 个用户`,
        duration: 5000
      })
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 手动校验指定用户
const validateSpecificUsers = async () => {
  const userIDsStr = validateSpecificForm.value.userIDs.trim()
  if (!userIDsStr) {
    ElMessage({
      type: 'warning',
      message: '请输入用户ID列表'
    })
    return
  }

  // 解析用户ID列表（支持逗号、空格、换行分隔）
  const userIDs = userIDsStr
    .split(/[,\s\n]+/)
    .map(id => id.trim())
    .filter(id => id)
    .map(id => parseInt(id))
    .filter(id => !isNaN(id) && id > 0)

  if (userIDs.length === 0) {
    ElMessage({
      type: 'warning',
      message: '请输入有效的用户ID（数字）'
    })
    return
  }

  validatingSpecific.value = true
  try {
    const res = await validateSpecificUsersAPI(userIDs)
    if (res.code === 0) {
      const results = res.data || []
      if (results.length === 0) {
        ElMessage({
          type: 'warning',
          message: '未找到指定的用户'
        })
        return
      }

      // 显示校验结果
      validateResults.value = results
      validateDialogVisible.value = true
      showValidateSpecificDialog.value = false

      // 统计不对的用户数量
      const errorCount = results.filter(r => r.difference !== 0 || r.experienceDiff !== 0).length
      if (errorCount > 0) {
        ElMessage({
          type: 'warning',
          message: `校验完成，发现 ${errorCount} 个用户的数据不正确`,
          duration: 5000
        })
      } else {
        ElMessage({
          type: 'success',
          message: '所有用户的数据都正确！'
        })
      }
    } else {
      ElMessage({
        type: 'error',
        message: res.msg || '校验失败'
      })
    }
  } catch (error) {
    console.error('校验指定用户失败:', error)
    ElMessage({
      type: 'error',
      message: '校验失败: ' + (error.message || '未知错误')
    })
  } finally {
    validatingSpecific.value = false
  }
}


</script>

<style>

</style>
