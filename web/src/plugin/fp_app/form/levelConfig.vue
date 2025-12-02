<template>
  <div>
    <el-form
      ref="levelConfigForm"
      :model="form"
      :rules="rules"
      v-loading="loading"
      label-width="80px"
    >
      <el-form-item label="等级" prop="level">
        <el-input-number
          v-model="form.level"
          :min="1"
          :max="100"
          placeholder="请输入等级"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="等级名称" prop="levelName">
        <el-input
          v-model="form.levelName"
          placeholder="请输入等级名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="等级Emoji" prop="levelEmoji">
        <el-input
          v-model="form.levelEmoji"
          placeholder="请输入等级Emoji"
          clearable
        />
      </el-form-item>
      <el-form-item label="等级图片" prop="levelImage">
        <div class="image-upload-container">
          <el-input
            v-model="form.levelImage"
            placeholder="请输入等级图片URL或点击上传"
            clearable
            style="margin-bottom: 10px;"
          />
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            accept="image/*"
          >
            <el-button type="primary" size="small">上传图片</el-button>
          </el-upload>
          <div v-if="form.levelImage" class="image-preview">
            <el-image
              :src="form.levelImage"
              :preview-src-list="[form.levelImage]"
              fit="cover"
              style="width: 100px; height: 100px; margin-top: 10px; border-radius: 4px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="form-image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="所需经验值" prop="requiredExp">
        <el-input-number
          v-model="form.requiredExp"
          :min="0"
          placeholder="请输入所需经验值"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="所需放屁次数" prop="requiredFarts">
        <el-input-number
          v-model="form.requiredFarts"
          :min="0"
          placeholder="请输入所需放屁次数"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="所需打卡天数" prop="requiredDays">
        <el-input-number
          v-model="form.requiredDays"
          :min="0"
          placeholder="请输入所需打卡天数"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'LevelConfigForm',
  props: {
    form: {
      type: Object,
      default: () => ({
        level: 1,
        levelName: '',
        levelEmoji: '',
        levelImage: '',
        requiredExp: 0,
        requiredFarts: 0,
        requiredDays: 0
      })
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadUrl: '/api/fileUploadAndDownload/upload',
      uploadHeaders: {
        'x-token': localStorage.getItem('token')
      },
      rules: {
        level: [
          { required: true, message: '请输入等级', trigger: 'blur' },
          { type: 'number', min: 1, max: 100, message: '等级必须在1-100之间', trigger: 'blur' }
        ],
        levelName: [
          { required: true, message: '请输入等级名称', trigger: 'blur' },
          { min: 1, max: 50, message: '等级名称长度在1-50个字符', trigger: 'blur' }
        ],
        levelEmoji: [
          { max: 10, message: '等级Emoji长度不能超过10个字符', trigger: 'blur' }
        ],
        levelImage: [
          { max: 500, message: '等级图片URL长度不能超过500个字符', trigger: 'blur' }
        ],
        requiredExp: [
          { required: true, message: '请输入所需经验值', trigger: 'blur' },
          { type: 'number', min: 0, message: '所需经验值不能小于0', trigger: 'blur' }
        ],
        requiredFarts: [
          { required: true, message: '请输入所需放屁次数', trigger: 'blur' },
          { type: 'number', min: 0, message: '所需放屁次数不能小于0', trigger: 'blur' }
        ],
        requiredDays: [
          { required: true, message: '请输入所需打卡天数', trigger: 'blur' },
          { type: 'number', min: 0, message: '所需打卡天数不能小于0', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validate() {
      return this.$refs.levelConfigForm.validate()
    },
    resetFields() {
      this.$refs.levelConfigForm.resetFields()
    },
    // 图片上传成功回调
    handleImageSuccess(response) {
      if (response.code === 0) {
        this.form.levelImage = response.data.file.url
        this.$message.success('图片上传成功')
      } else {
        this.$message.error('图片上传失败: ' + response.msg)
      }
    },
    // 图片上传前验证
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    }
  }
}
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.image-uploader {
  display: inline-block;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px;
}

.form-image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #909399;
  font-size: 12px;
}

.form-image-error .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>
