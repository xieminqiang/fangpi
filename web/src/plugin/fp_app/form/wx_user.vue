
<template>
  <div>
    <div class="gva-form-box">
      <el-form :model="formData" ref="elFormRef" label-position="right" :rules="rule" label-width="80px">
        <el-form-item label="微信用户凭证:" prop="openid">
          <el-input v-model="formData.openid" :clearable="true"  placeholder="请输入微信用户凭证" />
       </el-form-item>
        <el-form-item label="用户昵称:" prop="nickname">
          <el-input v-model="formData.nickname" :clearable="true"  placeholder="请输入用户昵称" />
       </el-form-item>
        <el-form-item label="头像:" prop="avatar">
          <SelectImage v-model="formData.avatar" file-type="image"/>
       </el-form-item>
        <el-form-item label="手机号:" prop="phone">
          <el-input v-model="formData.phone" :clearable="true"  placeholder="请输入手机号" />
       </el-form-item>
        <el-form-item label="用户状态:" prop="status">
           <el-select v-model="formData.status" placeholder="请选择用户状态" style="width:100%" :clearable="true" >
              <el-option v-for="(item,key) in wx_user_statusOptions" :key="key" :label="item.label" :value="item.value" />
           </el-select>
       </el-form-item>
        <el-form-item label="性别:" prop="gender">
           <el-select v-model="formData.gender" placeholder="请选择性别" style="width:100%" :clearable="true" >
              <el-option v-for="(item,key) in genderOptions" :key="key" :label="item.label" :value="item.value" />
           </el-select>
       </el-form-item>
        <el-form-item>
          <el-button :loading="btnLoading" type="primary" @click="save">保存</el-button>
          <el-button type="primary" @click="back">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {
  createWxUser,
  updateWxUser,
  findWxUser
} from '@/plugin/fp_app/api/wx_user'

defineOptions({
    name: 'WxUserForm'
})

// 自动获取字典
import { getDictFunc } from '@/utils/format'
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
// 图片选择组件
import SelectImage from '@/components/selectImage/selectImage.vue'


const route = useRoute()
const router = useRouter()

// 提交按钮loading
const btnLoading = ref(false)

const type = ref('')
const wx_user_statusOptions = ref([])
const genderOptions = ref([])
const formData = ref({
            openid: '',
            nickname: '',
            avatar: "",
            phone: '',
            status: '',
            gender: '',
        })
// 验证规则
const rule = reactive({
               openid : [{
                   required: true,
                   message: '',
                   trigger: ['input','blur'],
               }],
               phone : [{
                   required: true,
                   message: '',
                   trigger: ['input','blur'],
               }],
               status : [{
                   required: true,
                   message: '',
                   trigger: ['input','blur'],
               }],
})

const elFormRef = ref()

// 初始化方法
const init = async () => {
 // 建议通过url传参获取目标数据ID 调用 find方法进行查询数据操作 从而决定本页面是create还是update 以下为id作为url参数示例
    if (route.query.id) {
      const res = await findWxUser({ ID: route.query.id })
      if (res.code === 0) {
        formData.value = res.data
        type.value = 'update'
      }
    } else {
      type.value = 'create'
    }
    wx_user_statusOptions.value = await getDictFunc('wx_user_status')
    genderOptions.value = await getDictFunc('gender')
}

init()
// 保存按钮
const save = async() => {
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
           }
       })
}

// 返回按钮
const back = () => {
    router.go(-1)
}

</script>

<style>
</style>
