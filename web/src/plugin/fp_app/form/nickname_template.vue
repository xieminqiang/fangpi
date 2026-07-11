<template>
  <div>
    <div class="gva-form-box">
      <el-form :model="form" ref="elFormRef" label-position="right" :rules="rule" label-width="100px">
        <el-form-item label="昵称名称:" prop="name">
          <el-input v-model="form.name" :clearable="true" placeholder="请输入昵称名称" />
        </el-form-item>
        <el-form-item label="昵称图片:" prop="image">
          <div class="image-upload-section">
            <div class="upload-section">
              <div class="section-title">方式一：输入URL或上传图片</div>
              <div class="image-upload-container">
                <el-input
                  v-model="form.image"
                  placeholder="请输入图片URL或点击上传"
                  clearable
                  style="margin-bottom: 10px;"
                />
                <el-upload
                  class="image-uploader"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeUpload"
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
            </div>
            <el-divider>
              <el-text type="info">或</el-text>
            </el-divider>
            <div class="ai-generate-section">
              <div class="section-title">方式二：AI生成图片</div>
              <el-form-item label="" label-width="0">
                <el-input
                  v-model="generatePrompt"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入图片描述（prompt），例如：充满活力的特写编辑肖像，模特眼神犀利，头戴雕塑感帽子..."
                  style="margin-bottom: 10px;"
                />
                <div class="generate-controls">
                  <div class="size-inputs">
                    <span>尺寸：</span>
                    <el-input-number
                      v-model="imageWidth"
                      :min="1920"
                      :max="4096"
                      :step="50"
                      style="width: 120px; margin-right: 10px;"
                    />
                    <span>x</span>
                    <el-input-number
                      v-model="imageHeight"
                      :min="1920"
                      :max="4096"
                      :step="50"
                      style="width: 120px; margin-left: 10px;"
                    />
                    <el-button
                      type="text"
                      size="small"
                      @click="setSquareSize(1920)"
                      style="margin-left: 10px;"
                    >
                      1:1 (1920x1920)
                    </el-button>
                    <el-tooltip content="总像素必须至少 3686400，1:1 比例最小为 1920x1920" placement="top">
                      <el-icon style="margin-left: 5px; cursor: help;"><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <el-button
                    type="primary"
                    :loading="generating"
                    @click="generateImage"
                    style="margin-left: 10px;"
                  >
                    {{ generating ? '生成中...' : '生成图片' }}
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 图片预览和裁剪对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="预览并裁剪图片"
      width="1200px"
      :close-on-click-modal="false"
    >
      <div class="preview-crop-container">
        <div class="crop-section">
          <div class="crop-area">
            <VueCropper
              v-if="generatedImageUrl"
              ref="cropperRef"
              :img="generatedImageUrl"
              outputType="jpeg"
              :autoCrop="true"
              :autoCropWidth="cropWidth"
              :autoCropHeight="cropHeight"
              :fixedBox="true"
              :fixed="true"
              :fixedNumber="[1, 1]"
              :centerBox="true"
              :canMoveBox="true"
              :canMove="true"
              :canScale="true"
              :full="false"
              :maxImgSize="2000"
              :original="false"
              @realTime="handleRealTime"
            />
            <div v-else class="preview-placeholder">暂无图片</div>
          </div>
          <div class="crop-controls">
            <el-text type="info" style="margin-right: 10px;">固定裁剪尺寸：500x500</el-text>
            <el-button-group>
              <el-button size="small" @click="rotate(-90)">左旋转</el-button>
              <el-button size="small" @click="rotate(90)">右旋转</el-button>
              <el-button size="small" @click="changeScale(1)">放大</el-button>
              <el-button size="small" @click="changeScale(-1)">缩小</el-button>
            </el-button-group>
          </div>
        </div>
        <div class="preview-section">
          <div class="preview-title">裁剪预览 (500x500)</div>
          <div class="preview-box" style="width: 200px; height: 200px;">
            <div class="preview-inner">
              <img
                v-if="previews.url"
                :src="previews.url"
                :style="previews.img"
                alt=""
                class="preview-image"
              />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            @click="confirmAndUpload"
          >
            {{ uploading ? '上传中...' : '确认并上传到OSS' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { generateImage } from '@/plugin/fp_app/api/image_generate'
import { uploadFile } from '@/api/fileUploadAndDownload'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Picture } from '@element-plus/icons-vue'
import axios from 'axios'
import service from '@/utils/request'
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

export default {
  name: 'NicknameTemplateForm',
  components: {
    QuestionFilled,
    Picture,
    VueCropper
  },
  props: {
    form: {
      type: Object,
      default: () => ({
        ID: 0,
        name: '',
        image: ''
      })
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rule: {
        name: [
          {
            required: true,
            message: '请输入昵称名称',
            trigger: ['input', 'blur']
          }
        ]
      },
      generatePrompt: '',
      imageWidth: 1920,
      imageHeight: 1920,
      generating: false,
      generatedImageUrl: '',
      previewDialogVisible: false,
      uploading: false,
      enableCrop: true, // 固定启用裁剪
      cropWidth: 500, // 固定裁剪宽度
      cropHeight: 500, // 固定裁剪高度
      previews: {},
      uploadUrl: '/api/fileUploadAndDownload/upload',
      uploadHeaders: {
        'x-token': localStorage.getItem('token')
      }
    }
  },
  watch: {
    previewDialogVisible(newVal) {
      // 当对话框关闭时，清理 blob URL
      if (!newVal && this.generatedImageUrl && this.generatedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.generatedImageUrl)
        this.generatedImageUrl = ''
        this.previews = {}
      }
    }
  },
  methods: {
    async validate() {
      return new Promise((resolve) => {
        this.$refs.elFormRef.validate((valid) => {
          resolve(valid)
        })
      })
    },
    // 上传前验证
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    // 上传成功回调
    handleUploadSuccess(response) {
      if (response.code === 0) {
        this.form.image = response.data.file.url
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error('图片上传失败: ' + response.msg)
      }
    },
    // 设置正方形尺寸
    setSquareSize(size) {
      this.imageWidth = size
      this.imageHeight = size
    },
    // 生成图片
    async generateImage() {
      if (!this.generatePrompt.trim()) {
        ElMessage.warning('请输入图片描述')
        return
      }

      // 验证尺寸：总像素必须至少 3686400
      const totalPixels = this.imageWidth * this.imageHeight
      const minPixels = 3686400
      if (totalPixels < minPixels) {
        ElMessage.error(`图片尺寸不符合要求：总像素必须至少 ${minPixels.toLocaleString()} 像素（当前：${totalPixels.toLocaleString()}）。建议使用 2560x1440 或 1920x1920`)
        return
      }

      // 验证宽高比：必须在 [1/16, 16] 范围内
      const aspectRatio = this.imageWidth / this.imageHeight
      if (aspectRatio < 1/16 || aspectRatio > 16) {
        ElMessage.error(`宽高比不符合要求：必须在 1/16 到 16 之间（当前：${aspectRatio.toFixed(2)}）`)
        return
      }

      this.generating = true
      try {
        const size = `${this.imageWidth}x${this.imageHeight}`
        const res = await generateImage({
          prompt: this.generatePrompt,
          size: size
        })

        if (res.code === 0 && res.data && res.data.data && res.data.data.length > 0) {
          const imageData = res.data.data[0]
          
          // 处理 b64_json 格式的响应
          if (imageData.b64_json) {
            // 将 base64 字符串转换为 blob URL
            const base64Data = imageData.b64_json
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'image/jpeg' })
            this.generatedImageUrl = URL.createObjectURL(blob)
          } else if (imageData.url) {
            // 兼容 url 格式（如果 API 仍然返回 url）
            this.generatedImageUrl = imageData.url
          } else {
            throw new Error('API 返回的数据格式不正确')
          }
          
          this.previewDialogVisible = true
          // 重置裁剪预览
          this.previews = {}
          // 确保裁剪功能启用，固定为 500x500
          this.enableCrop = true
          this.cropWidth = 500
          this.cropHeight = 500
          ElMessage.success('图片生成成功！请预览后确认上传')
        } else {
          // 显示详细的错误信息
          const errorMsg = res.msg || '图片生成失败'
          ElMessage({
            type: 'error',
            message: errorMsg,
            duration: 5000,
            showClose: true
          })
          
          // 如果是模型未激活错误，在控制台输出详细信息
          if (errorMsg.includes('未激活') || errorMsg.includes('not activated')) {
            console.error('模型未激活错误详情:', res.error)
            console.warn('请前往火山引擎控制台激活模型服务：https://console.volcengine.com/ark')
          }
        }
      } catch (error) {
        console.error('生成图片错误:', error)
        ElMessage.error('图片生成失败: ' + (error.message || '未知错误'))
      } finally {
        this.generating = false
      }
    },
    // 处理裁剪开关（已废弃，裁剪固定为 500x500）
    handleCropToggle() {
      // 裁剪功能已固定启用，始终为 500x500
      this.enableCrop = true
      this.cropWidth = 500
      this.cropHeight = 500
      // 重新设置裁剪框
      if (this.$refs.cropperRef) {
        this.$nextTick(() => {
          this.$refs.cropperRef.goAutoCrop()
        })
      }
    },
    // 旋转图片
    rotate(degree) {
      if (!this.$refs.cropperRef) return
      if (degree === -90) {
        this.$refs.cropperRef.rotateLeft()
      } else {
        this.$refs.cropperRef.rotateRight()
      }
    },
    // 缩放图片
    changeScale(value) {
      if (!this.$refs.cropperRef) return
      this.$refs.cropperRef.changeScale(value)
    },
    // 实时预览
    handleRealTime(data) {
      this.previews = data
    },
    // 确认并上传到OSS
    async confirmAndUpload() {
      if (!this.generatedImageUrl) {
        ElMessage.warning('没有可上传的图片')
        return
      }

      this.uploading = true
      try {
        let imageBlob
        
        // 固定使用裁剪后的图片（500x500）
        if (this.$refs.cropperRef) {
          // 使用 getCropBlob 获取裁剪后的 blob，然后调整为 500x500
          await new Promise((resolve, reject) => {
            this.$refs.cropperRef.getCropBlob((blob) => {
              if (!blob) {
                reject(new Error('裁剪失败'))
                return
              }
              
              try {
                // 将 blob 转换为 Image 对象
                const img = new Image()
                const url = URL.createObjectURL(blob)
                
                img.onload = () => {
                  try {
                    // 创建新的 500x500 canvas
                    const canvas = document.createElement('canvas')
                    canvas.width = 500
                    canvas.height = 500
                    const ctx = canvas.getContext('2d')
                    
                    // 将图片绘制到 500x500 的 canvas 上
                    ctx.drawImage(img, 0, 0, 500, 500)
                    
                    // 清理临时 URL
                    URL.revokeObjectURL(url)
                    
                    // 转换为 blob
                    canvas.toBlob((resizedBlob) => {
                      if (resizedBlob) {
                        imageBlob = resizedBlob
                        resolve()
                      } else {
                        reject(new Error('图片转换失败'))
                      }
                    }, 'image/jpeg', 0.95)
                  } catch (error) {
                    URL.revokeObjectURL(url)
                    reject(new Error('图片处理失败: ' + error.message))
                  }
                }
                
                img.onerror = () => {
                  URL.revokeObjectURL(url)
                  reject(new Error('图片加载失败'))
                }
                
                img.src = url
              } catch (error) {
                reject(new Error('图片处理失败: ' + error.message))
              }
            })
          })
        } else {
          // 如果裁剪组件不可用，从URL下载原始图片
          imageBlob = await this.downloadImageAsBlob(this.generatedImageUrl)
        }
        
        // 创建FormData
        const formData = new FormData()
        const fileName = `nickname_template_${Date.now()}.jpg`
        formData.append('file', imageBlob, fileName)

        // 上传到OSS（axios 会自动设置 multipart/form-data）
        const uploadRes = await uploadFile(formData)
        
        if (uploadRes.code === 0 && uploadRes.data && uploadRes.data.file) {
          // 更新表单的image字段
          this.form.image = uploadRes.data.file.url
          // 通知父组件更新
          this.$emit('image-updated', uploadRes.data.file.url)
          
          ElMessage.success('图片上传成功！')
          this.previewDialogVisible = false
          
          // 清理 blob URL（如果是 blob URL）
          if (this.generatedImageUrl && this.generatedImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.generatedImageUrl)
          }
          this.generatedImageUrl = ''
          this.previews = {}
        } else {
          ElMessage.error(uploadRes.msg || '上传失败')
        }
      } catch (error) {
        console.error('上传图片错误:', error)
        ElMessage.error('上传失败: ' + (error.message || '未知错误'))
      } finally {
        this.uploading = false
      }
    },
    // 从URL下载图片并转换为Blob（通过后端代理解决CORS问题）
    async downloadImageAsBlob(imageUrl) {
      try {
        // 使用后端代理下载，避免CORS问题
        // service 会自动添加 VITE_BASE_API 前缀
        const response = await service({
          url: '/fp_app/upload/downloadProxy',
          method: 'get',
          params: {
            url: imageUrl
          },
          responseType: 'blob',
          timeout: 30000
        })
        return response.data
      } catch (error) {
        console.error('下载图片失败:', error)
        // 如果后端代理失败，尝试直接下载（可能会遇到CORS）
        try {
          const directResponse = await axios.get(imageUrl, {
            responseType: 'blob',
            timeout: 30000
          })
          return directResponse.data
        } catch (directError) {
          throw new Error('下载图片失败: ' + (error.response?.data?.msg || error.message || directError.message))
        }
      }
    }
  }
}
</script>

<style scoped>
.gva-form-box {
  padding: 20px;
}

.image-upload-section {
  width: 100%;
}

.upload-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
}

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

.ai-generate-section {
  margin-top: 10px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.generate-controls {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.size-inputs {
  display: flex;
  align-items: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.preview-placeholder {
  color: #909399;
  text-align: center;
  padding: 50px;
}

.preview-crop-container {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.crop-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crop-area {
  flex: 1;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  min-height: 400px;
}

.crop-controls {
  margin-top: 15px;
  display: flex;
  align-items: center;
}

.preview-section {
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-title {
  margin-bottom: 15px;
  font-weight: 500;
  color: #606266;
}

.preview-box {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-inner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.preview-image {
  position: absolute;
  max-width: none;
  image-rendering: pixelated;
}
</style>

