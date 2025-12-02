package service

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"gorm.io/gorm"
)

var WxUser = new(wxuser)

type wxuser struct{}

// getChineseFirstLetter 获取中文拼音首字母
// 对于这30个特定的昵称，使用映射表确保准确性
func getChineseFirstLetter(text string) string {
	if len(text) == 0 {
		return ""
	}

	// 30个昵称的首字母映射表
	levelNameLetterMap := map[string]string{
		"气浪狐": "Q", "尾气喵": "W", "噗闪狼": "P", "屁屁熊": "P", "放屁兔": "F",
		"臭气鼠": "C", "响屁虎": "X", "屁王龙": "P", "气爆鸡": "Q", "屁神猴": "P",
		"臭屁狗": "C", "响屁猫": "X", "屁力鸭": "P", "气浪鸟": "Q", "屁星人": "P",
		"臭气侠": "C", "响屁王": "X", "屁力士": "P", "气爆君": "Q", "屁神兽": "P",
		"屁气侠": "P", "响屁星": "X", "气爆龙": "Q", "臭屁神": "C", "屁力王": "P",
		"气浪侠": "Q", "响屁君": "X", "屁神猫": "P", "气爆狗": "Q", "臭气龙": "C",
	}

	// 从映射表中获取首字母
	if letter, ok := levelNameLetterMap[text]; ok {
		return letter
	}

	// 理论上不会走到这里，但为了安全起见返回空字符串
	return ""
}

// WxRegister 微信用户注册
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxRegister(wxu *model.WxUser) (wxUser *model.WxUser, err error) {
	err = s.CreateWxUser(wxu)
	if err != nil {
		return nil, err
	}
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// WxLogin 微信用户登录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxLogin(wxu *model.WxUser) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		// 判断用户是否未注册
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("用户未注册")
		}
		return nil, err
	}
	return &user, nil
}

// WxQuickLogin 微信快速登录（自动注册）
// 通过 code 获取 openid，如果用户不存在则自动注册
// Author [yourname](https://github.com/yourname)
func (s *wxuser) WxQuickLogin(wxu *model.WxUser) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}

	// 尝试获取用户
	user, err := s.GetWxUserByOpenid(*wxu.Openid)
	if err != nil {
		// 如果用户不存在，则自动注册
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 设置默认值
			// 30个搞笑、中二、卡通风格的昵称列表
			nicknameList := []string{
				"气浪狐", "尾气喵", "噗闪狼", "屁屁熊", "放屁兔",
				"臭气鼠", "响屁虎", "屁王龙", "气爆鸡", "屁神猴",
				"臭屁狗", "响屁猫", "屁力鸭", "气浪鸟", "屁星人",
				"臭气侠", "响屁王", "屁力士", "气爆君", "屁神兽",
				"屁气侠", "响屁星", "气爆龙", "臭屁神", "屁力王",
				"气浪侠", "响屁君", "屁神猫", "气爆狗", "臭气龙",
			}

			// 使用当前时间作为种子创建随机数生成器，确保随机性均匀分布
			rng := rand.New(rand.NewSource(time.Now().UnixNano()))
			// 从30个昵称中随机选择一个（均匀分布，O(1)时间复杂度，高效）
			randomNickname := nicknameList[rng.Intn(len(nicknameList))]

			// 获取 openid 的后三位作为昵称后缀
			openidSuffix := ""
			if wxu.Openid != nil && len(*wxu.Openid) >= 3 {
				openidSuffix = "_" + (*wxu.Openid)[len(*wxu.Openid)-3:]
			} else if wxu.Openid != nil && len(*wxu.Openid) > 0 {
				// 如果 openid 长度不足3位，使用全部字符
				openidSuffix = "_" + *wxu.Openid
			}
			defaultNickname := randomNickname + openidSuffix
			defaultAvatar := "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png"
			defaultPhone := ""
			defaultStatus := "1"
			defaultLevelName := "新手屁民"

			newUser := &model.WxUser{
				Openid:    wxu.Openid,
				Nickname:  &defaultNickname,
				Avatar:    defaultAvatar,
				Phone:     &defaultPhone,
				Status:    &defaultStatus,
				Level:     1,
				LevelName: defaultLevelName,
			}

			// 创建新用户
			err = s.CreateWxUser(newUser)
			if err != nil {
				return nil, fmt.Errorf("自动注册用户失败: %v", err)
			}

			// 重新获取用户信息
			user, err = s.GetWxUserByOpenid(*wxu.Openid)
			if err != nil {
				return nil, fmt.Errorf("获取新注册用户失败: %v", err)
			}

			return &user, nil
		}
		return nil, err
	}

	// 用户已存在，直接返回
	return &user, nil
}

// OpenidLogin 通过 OpenID 登录
// 适用于已登录过的用户，使用保存的 openid 快速登录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) OpenidLogin(openid string) (wxures *model.WxUser, err error) {
	if nil == global.GVA_DB {
		return nil, fmt.Errorf("db not init")
	}

	// 通过 openid 获取用户
	user, err := s.GetWxUserByOpenid(openid)
	if err != nil {
		// 判断用户是否未找到
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("用户不存在，请重新登录")
		}
		return nil, err
	}

	// 检查用户状态
	if user.Status != nil && *user.Status != "1" {
		return nil, fmt.Errorf("用户已被禁用")
	}

	return &user, nil
}

// CreateWxUser 创建微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) CreateWxUser(wxuser *model.WxUser) (err error) {
	err = global.GVA_DB.Create(wxuser).Error
	return err
}

// DeleteWxUser 删除微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) DeleteWxUser(ctx context.Context, ID string) (err error) {
	err = global.GVA_DB.Delete(&model.WxUser{}, "id = ?", ID).Error
	return err
}

// DeleteWxUserByIds 批量删除微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) DeleteWxUserByIds(ctx context.Context, IDs []string) (err error) {
	err = global.GVA_DB.Delete(&[]model.WxUser{}, "id in ?", IDs).Error
	return err
}

// UpdateWxUser 更新微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) UpdateWxUser(ctx context.Context, wxuser model.WxUser) (err error) {
	err = global.GVA_DB.Model(&model.WxUser{}).Where("id = ?", wxuser.ID).Updates(&wxuser).Error
	return err
}

// GetWxUser 根据ID获取微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUser(ctx context.Context, ID string) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("id = ?", ID).First(&wxuser).Error
	return
}

// GetWechatMallUserByOpenid 根据openid获取wechatMallUser表记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserByOpenid(openid string) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("openid = ?", openid).First(&wxuser).Error
	return
}

// GetWxUserByID 根据ID获取用户信息
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserByID(id uint) (wxuser model.WxUser, err error) {
	err = global.GVA_DB.Where("id = ?", id).First(&wxuser).Error
	return
}

// SetUserAudioUrl 设置用户放屁音频URL
// Author [yourname](https://github.com/yourname)
func (s *wxuser) SetUserAudioUrl(ctx context.Context, userID uint, audioUrl string) error {
	return global.GVA_DB.Model(&model.WxUser{}).Where("id = ?", userID).Update("audio_url", audioUrl).Error
}

// GetWxUserInfoList 分页获取微信用户记录
// Author [yourname](https://github.com/yourname)
func (s *wxuser) GetWxUserInfoList(ctx context.Context, info request.WxUserSearch) (list []model.WxUser, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&model.WxUser{})
	var wxusers []model.WxUser
	// 如果有条件搜索 下方会自动创建搜索语句
	if len(info.CreatedAtRange) == 2 {
		db = db.Where("created_at BETWEEN ? AND ?", info.CreatedAtRange[0], info.CreatedAtRange[1])
	}

	if info.Nickname != nil && *info.Nickname != "" {
		db = db.Where("nickname LIKE ?", "%"+*info.Nickname+"%")
	}
	if info.Phone != nil && *info.Phone != "" {
		db = db.Where("phone LIKE ?", "%"+*info.Phone+"%")
	}
	if info.Status != nil && *info.Status != "" {
		db = db.Where("status = ?", *info.Status)
	}
	if info.Gender != nil && *info.Gender != "" {
		db = db.Where("gender = ?", *info.Gender)
	}
	if info.Level != nil {
		db = db.Where("level = ?", *info.Level)
	}
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	if limit != 0 {
		db = db.Limit(limit).Offset(offset)
	}
	err = db.Find(&wxusers).Error
	return wxusers, total, err
}

func (s *wxuser) GetWxUserPublic(ctx context.Context) {

}
