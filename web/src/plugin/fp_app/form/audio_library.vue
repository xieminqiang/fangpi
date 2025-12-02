<template>
  <div>
    <el-form
      ref="audioLibraryForm"
      :model="form"
      :rules="rules"
      v-loading="loading"
      label-width="100px"
    >
      <el-form-item label="音频名字" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入音频名字（可选）"
          clearable
        />
      </el-form-item>
      <el-form-item label="音频URL" prop="url">
        <div class="audio-upload-container">
          <el-input
            v-model="form.url"
            placeholder="请输入音频URL或点击上传（可选）"
            clearable
            style="margin-bottom: 10px;"
          />
          <el-upload
            class="audio-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAudioSuccess"
            :before-upload="beforeAudioUpload"
            accept="audio/*"
          >
            <el-button type="primary" size="small">上传音频</el-button>
          </el-upload>
          <div v-if="form.url" class="audio-preview">
            <audio
              :src="form.url"
              controls
              style="width: 100%; margin-top: 10px;"
            >
              您的浏览器不支持音频播放
            </audio>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="分类名称" prop="class_name">
        <el-select
          v-model="form.class_name"
          placeholder="请选择分类（可选）"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="className in classNames"
            :key="className"
            :label="className"
            :value="className"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="音频标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请输入或选择音频标签（可选，可多个）"
          style="width: 100%"
        >
          <el-option
            v-for="tag in commonTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        <div v-if="form.tags && form.tags.length > 0" class="tags-preview">
          <el-tag
            v-for="(tag, index) in form.tags"
            :key="index"
            closable
            @close="removeTag(index)"
            style="margin-top: 8px; margin-right: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="音频图片" prop="image">
        <div class="image-upload-container">
          <el-input
            v-model="form.image"
            placeholder="请输入音频图片URL或点击上传（可选）"
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
          <div v-if="form.image" class="image-preview">
            <el-image
              :src="form.image"
              :preview-src-list="[form.image]"
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
      <el-form-item label="音频描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入音频描述（可选）"
          clearable
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'AudioLibraryForm',
  props: {
    form: {
      type: Object,
      default: () => ({
        name: '',
        url: '',
        tags: [],
        image: '',
        description: '',
        class_name: ''
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
      commonTags: ['搞笑', '经典', '日常', '特殊', '长音', '短音', '响亮', '轻柔'],
      classNames: ['声学类屁', '体感类屁', '化学类屁', '饮食类屁', '传奇神话类屁'],
      rules: {
        name: [
          { max: 100, message: '音频名字长度不能超过100个字符', trigger: 'blur' }
        ],
        url: [
          { max: 500, message: '音频URL长度不能超过500个字符', trigger: 'blur' }
        ],
        image: [
          { max: 500, message: '音频图片URL长度不能超过500个字符', trigger: 'blur' }
        ],
        description: [
          { max: 1000, message: '音频描述长度不能超过1000个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validate() {
      return this.$refs.audioLibraryForm.validate()
    },
    resetFields() {
      this.$refs.audioLibraryForm.resetFields()
    },
    // 音频上传成功回调
    handleAudioSuccess(response) {
      if (response.code === 0) {
        this.form.url = response.data.file.url
        this.$message.success('音频上传成功')
      } else {
        this.$message.error('音频上传失败: ' + response.msg)
      }
    },
    // 音频上传前验证
    beforeAudioUpload(file) {
      const isAudio = file.type.startsWith('audio/')
      const isLt50M = file.size / 1024 / 1024 < 50

      if (!isAudio) {
        this.$message.error('只能上传音频文件!')
        return false
      }
      if (!isLt50M) {
        this.$message.error('音频文件大小不能超过 50MB!')
        return false
      }
      return true
    },
    // 图片上传成功回调
    handleImageSuccess(response) {
      if (response.code === 0) {
        this.form.image = response.data.file.url
        this.$message.success('图片上传成功')
      } else {
        this.$message.error('图片上传失败: ' + response.msg)
      }
    },
    // 图片上传前验证
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      return true
    },
    // 移除标签
    removeTag(index) {
      this.form.tags.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.audio-upload-container,
.image-upload-container {
  width: 100%;
}

.audio-uploader,
.image-uploader {
  display: inline-block;
}

.audio-preview {
  margin-top: 10px;
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

.tags-preview {
  margin-top: 8px;
}
</style>

