package api

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/utils/upload"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var Upload = new(uploadApi)

type uploadApi struct{}

type UploadImageResponse struct {
	Url      string `json:"url"`      // 完整访问URL
	FilePath string `json:"filePath"` // 文件路径
}

// UploadImage 上传图片
// @Tags Upload
// @Summary 上传图片
// @Accept multipart/form-data
// @Produce application/json
// @Param file formData file true "上传的图片文件"
// @Success 200 {object} response.Response{data=UploadImageResponse,msg=string} "上传成功"
// @Router /fp_app/upload/image [post]
func (u *uploadApi) UploadImage(c *gin.Context) {
	// 获取上传文件
	file, err := c.FormFile("file")
	if err != nil {
		global.GVA_LOG.Error("接收文件失败!", zap.Error(err))
		response.FailWithMessage("接收文件失败: "+err.Error(), c)
		return
	}

	// 验证文件类型（可选）
	contentType := file.Header.Get("Content-Type")
	if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/jpg" && contentType != "image/gif" && contentType != "image/webp" {
		response.FailWithMessage("只支持上传 jpg、png、gif、webp 格式的图片", c)
		return
	}

	// 验证文件大小（可选，限制为5MB）
	if file.Size > 5*1024*1024 {
		response.FailWithMessage("图片大小不能超过5MB", c)
		return
	}

	// 使用系统配置的OSS上传文件（根据config.yaml中的oss-type自动选择）
	fileUrl, filePath, uploadErr := upload.NewOss().UploadFile(file)
	if uploadErr != nil {
		global.GVA_LOG.Error("上传文件失败!", zap.Error(uploadErr))
		response.FailWithMessage("上传文件失败: "+uploadErr.Error(), c)
		return
	}

	global.GVA_LOG.Info("图片上传成功", zap.String("filename", file.Filename), zap.String("url", fileUrl))

	// 返回成功响应
	response.OkWithDetailed(UploadImageResponse{
		Url:      fileUrl,
		FilePath: filePath,
	}, "上传成功", c)
}

// UploadImages 批量上传图片
// @Tags Upload
// @Summary 批量上传图片
// @Accept multipart/form-data
// @Produce application/json
// @Param files formData file true "上传的图片文件（可多个）"
// @Success 200 {object} response.Response{data=[]UploadImageResponse,msg=string} "上传成功"
// @Router /fp_app/upload/images [post]
func (u *uploadApi) UploadImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		global.GVA_LOG.Error("接收文件失败!", zap.Error(err))
		response.FailWithMessage("接收文件失败: "+err.Error(), c)
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		response.FailWithMessage("请选择要上传的文件", c)
		return
	}

	// 限制批量上传数量
	if len(files) > 9 {
		response.FailWithMessage("单次最多上传9张图片", c)
		return
	}

	var results []UploadImageResponse
	var failedFiles []string

	for _, file := range files {
		// 验证文件类型
		contentType := file.Header.Get("Content-Type")
		if contentType != "image/jpeg" && contentType != "image/png" && contentType != "image/jpg" && contentType != "image/gif" && contentType != "image/webp" {
			failedFiles = append(failedFiles, file.Filename+"(格式不支持)")
			continue
		}

		// 验证文件大小
		if file.Size > 5*1024*1024 {
			failedFiles = append(failedFiles, file.Filename+"(超过5MB)")
			continue
		}

		// 上传文件
		fileUrl, filePath, uploadErr := upload.NewOss().UploadFile(file)
		if uploadErr != nil {
			global.GVA_LOG.Error("上传文件失败!", zap.String("filename", file.Filename), zap.Error(uploadErr))
			failedFiles = append(failedFiles, file.Filename+"(上传失败)")
			continue
		}

		results = append(results, UploadImageResponse{
			Url:      fileUrl,
			FilePath: filePath,
		})
	}

	if len(results) == 0 {
		response.FailWithMessage("所有文件上传失败", c)
		return
	}

	msg := "上传成功"
	if len(failedFiles) > 0 {
		msg = "部分文件上传成功"
		global.GVA_LOG.Warn("部分文件上传失败", zap.Strings("failedFiles", failedFiles))
	}

	response.OkWithDetailed(gin.H{
		"list":         results,
		"successCount": len(results),
		"failedCount":  len(failedFiles),
		"failedFiles":  failedFiles,
	}, msg, c)
}
