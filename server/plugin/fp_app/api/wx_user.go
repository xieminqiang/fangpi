package api

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	wxUserResponse "github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/response"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/plugin"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/service"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/utils"
	sysUtils "github.com/flipped-aurora/gin-vue-admin/server/utils"
	utilsRequset "github.com/flipped-aurora/gin-vue-admin/server/utils/request"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

var WxUser = new(wxuser)

type wxuser struct{}

// WxRegister 微信注册
// @Tags WxUser
// @Summary 微信注册
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body wxLoginRequest true "微信注册"
// @Success 200 {object} response.Response{msg=string} "注册成功"
// @Router /wxuser/wxregister [post]
func (a *wxuser) WxRegister(c *gin.Context) {
	var wxRegisterRequest request.WxRegisterRequest
	err := c.ShouldBindJSON(&wxRegisterRequest)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	appID := plugin.Config.AppID         // 微信小程序的 AppID
	appSecret := plugin.Config.AppSecret // 微信小程序的 AppSecret
	url := fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code", appID, appSecret, wxRegisterRequest.Code)
	resp, err := utilsRequset.HttpRequest(url, "GET", nil, nil, nil)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		global.GVA_LOG.Error("读取响应体失败", zap.Error(err))
		return
	}
	var wxSessionResponse wxUserResponse.WxSessionResponse
	if err := json.Unmarshal(body, &wxSessionResponse); err != nil {
		global.GVA_LOG.Error("解析响应体失败", zap.Error(err))
		return
	}
	if wxSessionResponse.ErrCode != 0 {
		response.FailWithMessage(wxSessionResponse.ErrMsg, c)
		return
	}
	phoneNumberData, err := DecryptPhoneNumber(wxRegisterRequest.EncryptedData, wxRegisterRequest.IV, wxSessionResponse.SessionKey)
	if err != nil {
		global.GVA_LOG.Error("解密手机号失败", zap.Error(err))
		response.FailWithMessage("解密手机号失败:"+err.Error(), c)
		return
	}
	wxUser := &model.WxUser{
		Openid:   &wxSessionResponse.OpenID,
		Phone:    &phoneNumberData.PurePhoneNumber,
		Nickname: &wxRegisterRequest.Nickname,
		Avatar:   wxRegisterRequest.Avatar,
	}
	wxUserRegister, err := service.Service.WxUser.WxRegister(wxUser)
	if err != nil {
		response.FailWithMessage("用户注册失败:"+err.Error(), c)
		return
	}
	a.TokenNext(c, wxSessionResponse.SessionKey, *wxUserRegister)
}

// WxLogin 微信登录
// @Tags WxUser
// @Summary 微信登录
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body wxLoginRequest true "微信登录"
// @Success 200 {object} response.Response{msg=string} "登录成功"
// @Router /wxuser/wxlogin [post]
func (a *wxuser) WxLogin(c *gin.Context) {
	var wxLoginRequest request.WxLoginRequest
	err := c.ShouldBindJSON(&wxLoginRequest)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	appID := plugin.Config.AppID         // 微信小程序的 AppID
	appSecret := plugin.Config.AppSecret // 微信小程序的 AppSecret
	url := fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code", appID, appSecret, wxLoginRequest.Code)
	resp, err := utilsRequset.HttpRequest(url, "GET", nil, nil, nil)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		global.GVA_LOG.Error("读取响应体失败", zap.Error(err))
		return
	}
	var wxSessionResponse wxUserResponse.WxSessionResponse
	unmarshalErr := json.Unmarshal(body, &wxSessionResponse)
	if unmarshalErr != nil {
		global.GVA_LOG.Error("解析响应体失败", zap.Error(unmarshalErr))
		return
	}
	if wxSessionResponse.ErrCode != 0 {
		response.FailWithMessage(wxSessionResponse.ErrMsg, c)
		return
	}

	wechatMallUser := model.WxUser{
		Openid: &wxSessionResponse.OpenID,
	}
	wxUserLogin, err := service.Service.WxUser.WxLogin(&wechatMallUser)
	if err != nil {
		global.GVA_LOG.Error("用户登录失败", zap.Error(err))
		response.FailWithMessage("登录失败:"+err.Error(), c)
		return
	}
	a.TokenNext(c, wxSessionResponse.SessionKey, *wxUserLogin)
}

// WxQuickLogin 微信快速登录（自动注册）
// @Tags WxUser
// @Summary 微信快速登录（不需要手机号，自动注册）
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.WxLoginRequest true "微信快速登录"
// @Success 200 {object} response.Response{data=wxUserResponse.WxUserResponse,msg=string} "登录成功"
// @Router /wxuser/wxQuickLogin [post]
func (a *wxuser) WxQuickLogin(c *gin.Context) {
	var wxLoginRequest request.WxLoginRequest
	err := c.ShouldBindJSON(&wxLoginRequest)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	// 获取微信小程序配置
	appID := plugin.Config.AppID
	appSecret := plugin.Config.AppSecret

	// 调用微信接口获取 openid
	url := fmt.Sprintf("https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
		appID, appSecret, wxLoginRequest.Code)

	resp, err := utilsRequset.HttpRequest(url, "GET", nil, nil, nil)
	if err != nil {
		global.GVA_LOG.Error("调用微信接口失败", zap.Error(err))
		response.FailWithMessage("获取微信信息失败:"+err.Error(), c)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		global.GVA_LOG.Error("读取响应体失败", zap.Error(err))
		response.FailWithMessage("读取微信响应失败", c)
		return
	}

	var wxSessionResponse wxUserResponse.WxSessionResponse
	if err := json.Unmarshal(body, &wxSessionResponse); err != nil {
		global.GVA_LOG.Error("解析响应体失败", zap.Error(err))
		response.FailWithMessage("解析微信响应失败", c)
		return
	}

	// 检查微信接口返回的错误
	if wxSessionResponse.ErrCode != 0 {
		global.GVA_LOG.Error("微信接口返回错误", zap.Int("errcode", wxSessionResponse.ErrCode), zap.String("errmsg", wxSessionResponse.ErrMsg))
		response.FailWithMessage("微信登录失败:"+wxSessionResponse.ErrMsg, c)
		return
	}

	// 创建用户对象
	wxUser := model.WxUser{
		Openid: &wxSessionResponse.OpenID,
	}

	// 调用快速登录服务（自动注册）
	wxUserLogin, err := service.Service.WxUser.WxQuickLogin(&wxUser)
	if err != nil {
		global.GVA_LOG.Error("快速登录失败", zap.Error(err))
		response.FailWithMessage("登录失败:"+err.Error(), c)
		return
	}

	// 生成 token 并返回
	a.TokenNext(c, wxSessionResponse.SessionKey, *wxUserLogin)
}

// OpenidLogin 通过 OpenID 登录
// @Tags WxUser
// @Summary 通过 OpenID 登录（快速登录）
// @Accept application/json
// @Produce application/json
// @Param data body request.OpenidLoginRequest true "OpenID 登录"
// @Success 200 {object} response.Response{data=wxUserResponse.WxUserResponse,msg=string} "登录成功"
// @Router /wxuser/openidLogin [post]
func (a *wxuser) OpenidLogin(c *gin.Context) {
	var openidLoginRequest request.OpenidLoginRequest
	err := c.ShouldBindJSON(&openidLoginRequest)
	if err != nil {
		response.FailWithMessage("参数错误:"+err.Error(), c)
		return
	}

	// 验证 openid 是否为空
	if openidLoginRequest.Openid == "" {
		response.FailWithMessage("openid 不能为空", c)
		return
	}

	global.GVA_LOG.Info("OpenID 登录请求", zap.String("openid", openidLoginRequest.Openid))

	// 调用 OpenID 登录服务
	wxUserLogin, err := service.Service.WxUser.OpenidLogin(openidLoginRequest.Openid)
	if err != nil {
		global.GVA_LOG.Error("OpenID 登录失败", zap.Error(err))
		response.FailWithMessage("登录失败:"+err.Error(), c)
		return
	}

	// 生成 token 并返回
	// 注意：OpenID 登录不需要 session_key，传空字符串即可
	a.TokenNext(c, "", *wxUserLogin)
}

// DecryptPhoneNumber 解密手机号
func DecryptPhoneNumber(encryptedData, iv, sessionKey string) (*model.PhoneNumberData, error) {
	decodedEncryptedData, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return nil, err
	}
	decodedSessionKey, err := base64.StdEncoding.DecodeString(sessionKey)
	if err != nil {
		return nil, err
	}
	decodedIv, err := base64.StdEncoding.DecodeString(iv)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(decodedSessionKey)
	if err != nil {
		return nil, err
	}
	if len(decodedEncryptedData) < aes.BlockSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	cbc := cipher.NewCBCDecrypter(block, decodedIv)
	decrypted := make([]byte, len(decodedEncryptedData))
	cbc.CryptBlocks(decrypted, decodedEncryptedData)

	decrypted = Pkcs7Unpad(decrypted)

	var phoneNumberData model.PhoneNumberData
	if err := json.Unmarshal(decrypted, &phoneNumberData); err != nil {
		return nil, err
	}
	return &phoneNumberData, nil
}

func Pkcs7Unpad(data []byte) []byte {
	length := len(data)
	if length == 0 {
		return nil
	}
	unpadding := int(data[length-1])
	if unpadding > length {
		return nil
	}
	return data[:(length - unpadding)]
}

func (a *wxuser) TokenNext(c *gin.Context, wxSessionKey string, wxUser model.WxUser) {
	token, claims, err := utils.LoginToken(&wxUser)
	if err != nil {
		global.GVA_LOG.Error("获取token失败!", zap.Error(err))
		response.FailWithMessage("获取token失败", c)
		return
	}
	sysUtils.SetToken(c, token, int(claims.RegisteredClaims.ExpiresAt.Unix()-time.Now().Unix()))

	response.OkWithDetailed(wxUserResponse.WxUserResponse{
		User:      wxUser,
		Token:     token,
		ExpiresAt: claims.RegisteredClaims.ExpiresAt.Unix() * 1000,
	}, "登录成功", c)
}

// CreateWxUser 创建微信用户
// @Tags WxUser
// @Summary 创建微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "创建微信用户"
// @Success 200 {object} response.Response{msg=string} "创建成功"
// @Router /wxuser/createWxUser [post]
func (a *wxuser) CreateWxUser(c *gin.Context) {
	var info model.WxUser
	err := c.ShouldBindJSON(&info)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = serviceWxUser.CreateWxUser(&info)
	if err != nil {
		global.GVA_LOG.Error("创建失败!", zap.Error(err))
		response.FailWithMessage("创建失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("创建成功", c)
}

// DeleteWxUser 删除微信用户
// @Tags WxUser
// @Summary 删除微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "删除微信用户"
// @Success 200 {object} response.Response{msg=string} "删除成功"
// @Router /wxuser/deleteWxUser [delete]
func (a *wxuser) DeleteWxUser(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	ID := c.Query("ID")
	err := serviceWxUser.DeleteWxUser(ctx, ID)
	if err != nil {
		global.GVA_LOG.Error("删除失败!", zap.Error(err))
		response.FailWithMessage("删除失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("删除成功", c)
}

// DeleteWxUserByIds 批量删除微信用户
// @Tags WxUser
// @Summary 批量删除微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{msg=string} "批量删除成功"
// @Router /wxuser/deleteWxUserByIds [delete]
func (a *wxuser) DeleteWxUserByIds(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	IDs := c.QueryArray("IDs[]")
	err := serviceWxUser.DeleteWxUserByIds(ctx, IDs)
	if err != nil {
		global.GVA_LOG.Error("批量删除失败!", zap.Error(err))
		response.FailWithMessage("批量删除失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("批量删除成功", c)
}

// UpdateWxUser 更新微信用户（管理后台接口，需要管理员权限）
// @Tags WxUser
// @Summary 更新微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body model.WxUser true "更新微信用户"
// @Success 200 {object} response.Response{msg=string} "更新成功"
// @Router /wxuser/updateWxUser [put]
func (a *wxuser) UpdateWxUser(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	var info model.WxUser
	err := c.ShouldBindJSON(&info)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	err = serviceWxUser.UpdateWxUser(ctx, info)
	if err != nil {
		global.GVA_LOG.Error("更新失败!", zap.Error(err))
		response.FailWithMessage("更新失败:"+err.Error(), c)
		return
	}
	response.OkWithMessage("更新成功", c)
}

// UpdateUserInfo 更新用户信息（小程序用户端接口，从token获取用户ID）
// @Tags WxUser
// @Summary 更新用户信息
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.UpdateUserInfoRequest true "更新用户信息"
// @Success 200 {object} response.Response{msg=string} "更新成功"
// @Router /wxuser/updateUserInfo [post]
func (a *wxuser) UpdateUserInfo(c *gin.Context) {
	// 手动从 token 解析用户ID
	token := c.Request.Header.Get("x-token")
	if token == "" {
		token, _ = c.Cookie("x-token")
	}

	if token == "" {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 解析JWT获取用户ID
	wxClaims, err := parseWxToken(token)
	if err != nil {
		global.GVA_LOG.Error("解析Token失败", zap.Error(err))
		response.FailWithMessage("Token无效或已过期", c)
		return
	}

	userID := wxClaims.UserId
	if userID == 0 {
		response.FailWithMessage("用户ID无效", c)
		return
	}

	// 绑定请求参数
	var req request.UpdateUserInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 创建业务用Context
	ctx := c.Request.Context()

	// 构建更新数据，使用token中的用户ID
	updateData := model.WxUser{}
	updateData.ID = userID
	if req.Nickname != nil {
		updateData.Nickname = req.Nickname
	}
	if req.Avatar != "" {
		updateData.Avatar = req.Avatar
	}

	err = serviceWxUser.UpdateWxUser(ctx, updateData)
	if err != nil {
		global.GVA_LOG.Error("更新失败!", zap.Error(err))
		response.FailWithMessage("更新失败:"+err.Error(), c)
		return
	}

	response.OkWithMessage("更新成功", c)
}

// FindWxUser 用id查询微信用户
// @Tags WxUser
// @Summary 用id查询微信用户
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param ID query uint true "用id查询微信用户"
// @Success 200 {object} response.Response{data=model.WxUser,msg=string} "查询成功"
// @Router /wxuser/findWxUser [get]
func (a *wxuser) FindWxUser(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	ID := c.Query("ID")
	rewxuser, err := serviceWxUser.GetWxUser(ctx, ID)
	if err != nil {
		global.GVA_LOG.Error("查询失败!", zap.Error(err))
		response.FailWithMessage("查询失败:"+err.Error(), c)
		return
	}
	response.OkWithData(rewxuser, c)
}

// GetWxUserList 分页获取微信用户列表
// @Tags WxUser
// @Summary 分页获取微信用户列表
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data query request.WxUserSearch true "分页获取微信用户列表"
// @Success 200 {object} response.Response{data=response.PageResult,msg=string} "获取成功"
// @Router /wxuser/getWxUserList [get]
func (a *wxuser) GetWxUserList(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	var pageInfo request.WxUserSearch
	err := c.ShouldBindQuery(&pageInfo)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	list, total, err := serviceWxUser.GetWxUserInfoList(ctx, pageInfo)
	if err != nil {
		global.GVA_LOG.Error("获取失败!", zap.Error(err))
		response.FailWithMessage("获取失败:"+err.Error(), c)
		return
	}
	response.OkWithDetailed(response.PageResult{
		List:     list,
		Total:    total,
		Page:     pageInfo.Page,
		PageSize: pageInfo.PageSize,
	}, "获取成功", c)
}

// GetWxUserPublic 不需要鉴权的微信用户接口
// @Tags WxUser
// @Summary 不需要鉴权的微信用户接口
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=object,msg=string} "获取成功"
// @Router /wxuser/getWxUserPublic [get]
func (a *wxuser) GetWxUserPublic(c *gin.Context) {
	// 创建业务用Context
	ctx := c.Request.Context()

	// 此接口不需要鉴权 示例为返回了一个固定的消息接口，一般本接口用于C端服务，需要自己实现业务逻辑
	serviceWxUser.GetWxUserPublic(ctx)
	response.OkWithDetailed(gin.H{"info": "不需要鉴权的微信用户接口信息"}, "获取成功", c)
}

// GetUserInfo 获取当前登录用户信息
// @Tags WxUser
// @Summary 获取当前登录用户详情
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Success 200 {object} response.Response{data=model.WxUser,msg=string} "获取成功"
// @Router /wxuser/getUserInfo [get]
func (a *wxuser) GetUserInfo(c *gin.Context) {
	// 手动从 token 解析用户ID（因为插件使用自己的Claims结构）
	token := c.Request.Header.Get("x-token")
	if token == "" {
		token, _ = c.Cookie("x-token")
	}

	if token == "" {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 直接解析JWT获取payload
	wxClaims, err := parseWxToken(token)
	if err != nil {
		global.GVA_LOG.Error("解析Token失败", zap.Error(err))
		response.FailWithMessage("Token无效或已过期", c)
		return
	}

	userID := wxClaims.UserId
	if userID == 0 {
		response.FailWithMessage("用户ID无效", c)
		return
	}

	// 查询用户信息
	user, err := service.Service.WxUser.GetWxUserByID(userID)
	if err != nil {
		global.GVA_LOG.Error("获取用户信息失败", zap.Error(err))
		response.FailWithMessage("获取用户信息失败", c)
		return
	}

	response.OkWithData(user, c)
}

// SetUserAudioUrl 设置用户放屁音频URL
// @Tags WxUser
// @Summary 设置用户放屁音频URL
// @Security ApiKeyAuth
// @Accept application/json
// @Produce application/json
// @Param data body request.SetUserAudioUrlRequest true "设置音频URL"
// @Success 200 {object} response.Response{msg=string} "设置成功"
// @Router /wxuser/setUserAudioUrl [post]
func (a *wxuser) SetUserAudioUrl(c *gin.Context) {
	// 手动从 token 解析用户ID
	token := c.Request.Header.Get("x-token")
	if token == "" {
		token, _ = c.Cookie("x-token")
	}

	if token == "" {
		response.FailWithMessage("未登录或Token无效", c)
		return
	}

	// 解析JWT获取用户ID
	wxClaims, err := parseWxToken(token)
	if err != nil {
		global.GVA_LOG.Error("解析Token失败", zap.Error(err))
		response.FailWithMessage("Token无效或已过期", c)
		return
	}

	userID := wxClaims.UserId
	if userID == 0 {
		response.FailWithMessage("用户ID无效", c)
		return
	}

	// 绑定请求参数
	var req request.SetUserAudioUrlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误: "+err.Error(), c)
		return
	}

	// 调用服务层设置音频URL
	err = service.Service.WxUser.SetUserAudioUrl(c.Request.Context(), userID, req.AudioUrl)
	if err != nil {
		global.GVA_LOG.Error("设置音频URL失败", zap.Error(err))
		response.FailWithMessage("设置失败: "+err.Error(), c)
		return
	}

	response.OkWithMessage("设置成功", c)
}

// parseWxToken 解析微信Token（辅助函数）
func parseWxToken(tokenString string) (*request.WxClaims, error) {
	claims := &request.CustomClaims{}

	jwtToken, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(global.GVA_CONFIG.JWT.SigningKey), nil
	})

	if err != nil {
		return nil, err
	}

	if jwtToken.Valid {
		if c, ok := jwtToken.Claims.(*request.CustomClaims); ok {
			return &c.WxClaims, nil
		}
	}

	return nil, fmt.Errorf("token无效")
}
