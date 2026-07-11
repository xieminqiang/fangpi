package api

import (
	"io"
	"net/http"

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

// DownloadImageProxy 代理下载图片（解决CORS问题）
// @Tags Upload
// @Summary 代理下载图片
// @Accept application/json
// @Produce image/*
// @Param url query string true "图片URL"
// @Success 200 {file} file "图片文件"
// @Router /fp_app/upload/downloadProxy [get]
func (u *uploadApi) DownloadImageProxy(c *gin.Context) {
	imageURL := c.Query("url")
	if imageURL == "" {
		response.FailWithMessage("图片URL不能为空", c)
		return
	}

	// 下载图片
	client := &http.Client{
		Timeout: 30 * 1000000000, // 30秒超时
	}
	resp, err := client.Get(imageURL)
	if err != nil {
		global.GVA_LOG.Error("下载图片失败", zap.Error(err))
		response.FailWithMessage("下载图片失败: "+err.Error(), c)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		global.GVA_LOG.Error("下载图片失败", zap.Int("status", resp.StatusCode))
		response.FailWithMessage("下载图片失败: HTTP状态码错误", c)
		return
	}

	// 获取Content-Type
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg" // 默认类型
	}

	// 读取图片数据
	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		global.GVA_LOG.Error("读取图片数据失败", zap.Error(err))
		response.FailWithMessage("读取图片数据失败: "+err.Error(), c)
		return
	}

	// 设置响应头
	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "inline")
	c.Data(http.StatusOK, contentType, imageData)
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

// UploadAudio 上传音频文件
// @Tags Upload
// @Summary 上传音频文件
// @Accept multipart/form-data
// @Produce application/json
// @Param file formData file true "上传的音频文件"
// @Success 200 {object} response.Response{data=UploadImageResponse,msg=string} "上传成功"
// @Router /fp_app/upload/audio [post]
func (u *uploadApi) UploadAudio(c *gin.Context) {
	// 获取上传文件
	file, err := c.FormFile("file")
	if err != nil {
		global.GVA_LOG.Error("接收文件失败!", zap.Error(err))
		response.FailWithMessage("接收文件失败: "+err.Error(), c)
		return
	}

	// 验证文件类型（支持常见音频格式）
	contentType := file.Header.Get("Content-Type")
	allowedTypes := []string{
		"audio/mpeg", "audio/mp3", "audio/mpeg3",
		"audio/wav", "audio/wave", "audio/x-wav",
		"audio/mp4", "audio/m4a",
		"audio/ogg", "audio/webm",
		"application/octet-stream", // 某些情况下可能返回这个
	}

	isAllowed := false
	for _, allowedType := range allowedTypes {
		if contentType == allowedType {
			isAllowed = true
			break
		}
	}

	// 也检查文件扩展名作为备用验证
	if !isAllowed {
		fileName := file.Filename
		allowedExtensions := []string{".mp3", ".wav", ".m4a", ".ogg", ".webm", ".aac"}
		for _, ext := range allowedExtensions {
			if len(fileName) > len(ext) && fileName[len(fileName)-len(ext):] == ext {
				isAllowed = true
				break
			}
		}
	}

	if !isAllowed {
		response.FailWithMessage("只支持上传 mp3、wav、m4a、ogg、webm、aac 格式的音频文件", c)
		return
	}

	// 验证文件大小（限制为10MB）
	if file.Size > 10*1024*1024 {
		response.FailWithMessage("音频文件大小不能超过10MB", c)
		return
	}

	// 使用系统配置的OSS上传文件
	fileUrl, filePath, uploadErr := upload.NewOss().UploadFile(file)
	if uploadErr != nil {
		global.GVA_LOG.Error("上传文件失败!", zap.Error(uploadErr))
		response.FailWithMessage("上传文件失败: "+uploadErr.Error(), c)
		return
	}

	global.GVA_LOG.Info("音频上传成功", zap.String("filename", file.Filename), zap.String("url", fileUrl))

	// 返回成功响应
	response.OkWithDetailed(UploadImageResponse{
		Url:      fileUrl,
		FilePath: filePath,
	}, "上传成功", c)
}
