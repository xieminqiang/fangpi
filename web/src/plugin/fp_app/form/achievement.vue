<template>
  <div>
    <el-form
      ref="achievementForm"
      :model="form"
      :rules="rules"
      v-loading="loading"
      label-width="100px"
    >
      <el-form-item label="成就编码" prop="achievementCode">
        <el-input
          v-model="form.achievementCode"
          placeholder="请输入成就编码"
          clearable
        />
      </el-form-item>
      <el-form-item label="成就名称" prop="achievementName">
        <el-input
          v-model="form.achievementName"
          placeholder="请输入成就名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="成就描述" prop="achievementDesc">
        <el-input
          v-model="form.achievementDesc"
          type="textarea"
          :rows="3"
          placeholder="请输入成就描述"
          clearable
        />
      </el-form-item>
      <el-form-item label="成就图标" prop="achievementIcon">
        <div class="image-upload-container">
          <el-input
            v-model="form.achievementIcon"
            placeholder="请输入成就图标URL或点击上传"
            clearable
            style="margin-bottom: 10px;"
          />
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleIconSuccess"
            :before-upload="beforeImageUpload"
            accept="image/*"
          >
            <el-button type="primary" size="small">上传图标</el-button>
          </el-upload>
          <div v-if="form.achievementIcon" class="image-preview">
            <el-image
              :src="form.achievementIcon"
              :preview-src-list="[form.achievementIcon]"
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
      <el-form-item label="成就Emoji" prop="achievementEmoji">
        <el-input
          v-model="form.achievementEmoji"
          placeholder="请输入成就Emoji"
          clearable
        />
      </el-form-item>
      <el-form-item label="成就GIF" prop="achievementGif">
        <div class="image-upload-container">
          <el-input
            v-model="form.achievementGif"
            placeholder="请输入成就GIF URL或点击上传"
            clearable
            style="margin-bottom: 10px;"
          />
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleGifSuccess"
            :before-upload="beforeGifUpload"
            accept=".gif"
          >
            <el-button type="success" size="small">上传GIF</el-button>
          </el-upload>
          <div v-if="form.achievementGif" class="image-preview">
            <el-image
              :src="form.achievementGif"
              :preview-src-list="[form.achievementGif]"
              fit="cover"
              style="width: 100px; height: 100px; margin-top: 10px; border-radius: 4px;"
              :preview-teleported="true"
            >
              <template #error>
                <div class="form-image-error">
                  <el-icon><VideoPlay /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="解锁条件" prop="unlockCondition">
        <el-input
          v-model="form.unlockCondition"
          type="textarea"
          :rows="3"
          placeholder="请输入解锁条件JSON格式"
          clearable
        />
      </el-form-item>
      <el-form-item label="奖励经验值" prop="rewardExp">
        <el-input-number
          v-model="form.rewardExp"
          :min="0"
          placeholder="请输入奖励经验值"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="form.sortOrder"
          :min="0"
          placeholder="请输入排序号"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Picture, VideoPlay } from '@element-plus/icons-vue'

export default {
  name: 'AchievementForm',
  props: {
    form: {
      type: Object,
      default: () => ({
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
        achievementCode: [
          { required: true, message: '请输入成就编码', trigger: 'blur' },
          { min: 1, max: 50, message: '成就编码长度在1-50个字符', trigger: 'blur' }
        ],
        achievementName: [
          { required: true, message: '请输入成就名称', trigger: 'blur' },
          { min: 1, max: 100, message: '成就名称长度在1-100个字符', trigger: 'blur' }
        ],
        achievementDesc: [
          { max: 500, message: '成就描述长度不能超过500个字符', trigger: 'blur' }
        ],
        achievementIcon: [
          { max: 500, message: '成就图标URL长度不能超过500个字符', trigger: 'blur' }
        ],
        achievementEmoji: [
          { max: 10, message: '成就Emoji长度不能超过10个字符', trigger: 'blur' }
        ],
        achievementGif: [
          { max: 500, message: '成就GIF URL长度不能超过500个字符', trigger: 'blur' }
        ],
        rewardExp: [
          { required: true, message: '请输入奖励经验值', trigger: 'blur' },
          { type: 'number', min: 0, message: '奖励经验值不能小于0', trigger: 'blur' }
        ],
        sortOrder: [
          { required: true, message: '请输入排序号', trigger: 'blur' },
          { type: 'number', min: 0, message: '排序号不能小于0', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    validate() {
      return this.$refs.achievementForm.validate()
    },
    resetFields() {
      this.$refs.achievementForm.resetFields()
    },
    // 图标上传成功回调
    handleIconSuccess(response) {
      if (response.code === 0) {
        this.form.achievementIcon = response.data.file.url
        this.$message.success('图标上传成功')
      } else {
        this.$message.error('图标上传失败: ' + response.msg)
      }
    },
    // GIF上传成功回调
    handleGifSuccess(response) {
      if (response.code === 0) {
        this.form.achievementGif = response.data.file.url
        this.$message.success('GIF上传成功')
      } else {
        this.$message.error('GIF上传失败: ' + response.msg)
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
    },
    // GIF上传前验证
    beforeGifUpload(file) {
      const isGif = file.type === 'image/gif'
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isGif) {
        this.$message.error('只能上传GIF文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('GIF文件大小不能超过 5MB!')
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
