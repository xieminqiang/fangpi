
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
    <SelectImage
     v-model="formData.avatar"
     file-type="image"
    />
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

  </div>
</template>

<script setup>
import {
  createWxUser,
  deleteWxUser,
  deleteWxUserByIds,
  updateWxUser,
  findWxUser,
  getWxUserList
} from '@/plugin/fp_app/api/wx_user'
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
  createdAtRange: getTodayDateRange()
})

// 重置
const onReset = () => {
  searchInfo.value = {
    createdAtRange: getTodayDateRange()
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


</script>

<style>

</style>
