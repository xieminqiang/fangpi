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
)

var NicknameTemplate = new(nicknameTemplate)

type nicknameTemplate struct{}

// GetRandomNicknameTemplate 随机获取一个昵称模板
func (s *nicknameTemplate) GetRandomNicknameTemplate(ctx context.Context) (*model.BreakNicknameTemplate, error) {
	var templates []model.BreakNicknameTemplate

	// 查询所有启用的昵称模板（未删除的）
	err := global.GVA_DB.Where("deleted_at IS NULL").Find(&templates).Error
	if err != nil {
		return nil, fmt.Errorf("查询昵称模板失败: %v", err)
	}

	if len(templates) == 0 {
		return nil, errors.New("没有可用的昵称模板")
	}

	// 使用当前时间作为种子创建随机数生成器
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	// 随机选择一个模板
	randomIndex := rng.Intn(len(templates))

	return &templates[randomIndex], nil
}

// CreateNicknameTemplate 创建昵称模板
func (s *nicknameTemplate) CreateNicknameTemplate(ctx context.Context, template *model.BreakNicknameTemplate) (*model.BreakNicknameTemplate, error) {
	if err := global.GVA_DB.Create(template).Error; err != nil {
		return nil, err
	}
	return template, nil
}

// GetNicknameTemplateList 获取昵称模板列表（分页）
func (s *nicknameTemplate) GetNicknameTemplateList(ctx context.Context, pageInfo *request.NicknameTemplateSearch) (list []model.BreakNicknameTemplate, total int64, err error) {
	limit := pageInfo.PageSize
	offset := pageInfo.PageSize * (pageInfo.Page - 1)
	db := global.GVA_DB.Model(&model.BreakNicknameTemplate{}).Where("deleted_at IS NULL")

	// 构建查询条件
	if pageInfo.Name != "" {
		db = db.Where("name LIKE ?", "%"+pageInfo.Name+"%")
	}

	// 获取总数
	if err = db.Count(&total).Error; err != nil {
		return
	}

	// 获取列表
	if limit > 0 {
		db = db.Limit(limit).Offset(offset)
	}
	err = db.Order("id DESC").Find(&list).Error
	return list, total, err
}

// UpdateNicknameTemplate 更新昵称模板
func (s *nicknameTemplate) UpdateNicknameTemplate(ctx context.Context, template *model.BreakNicknameTemplate) (*model.BreakNicknameTemplate, error) {
	if err := global.GVA_DB.Model(&model.BreakNicknameTemplate{}).Where("id = ?", template.ID).Updates(template).Error; err != nil {
		return nil, err
	}
	// 重新查询更新后的数据
	if err := global.GVA_DB.Where("id = ?", template.ID).First(template).Error; err != nil {
		return nil, err
	}
	return template, nil
}

// DeleteNicknameTemplate 删除昵称模板
func (s *nicknameTemplate) DeleteNicknameTemplate(ctx context.Context, id uint) error {
	return global.GVA_DB.Delete(&model.BreakNicknameTemplate{}, id).Error
}

// DeleteNicknameTemplateByIds 批量删除昵称模板
func (s *nicknameTemplate) DeleteNicknameTemplateByIds(ctx context.Context, ids []uint) error {
	return global.GVA_DB.Delete(&[]model.BreakNicknameTemplate{}, "id IN ?", ids).Error
}

// InitDefaultNicknames 初始化默认昵称数据
func (s *nicknameTemplate) InitDefaultNicknames(ctx context.Context) error {
	// 检查是否已有数据
	var count int64
	global.GVA_DB.Model(&model.BreakNicknameTemplate{}).Where("deleted_at IS NULL").Count(&count)
	if count > 0 {
		// 如果已有数据，不重复初始化
		return nil
	}

	// 30个搞笑、中二、卡通风格的昵称列表
	nicknameList := []string{
		"气浪狐", "尾气喵", "噗闪狼", "屁屁熊", "放屁兔",
		"臭气鼠", "响屁虎", "屁王龙", "气爆鸡", "屁神猴",
		"臭屁狗", "响屁猫", "屁力鸭", "气浪鸟", "屁星人",
		"臭气侠", "响屁王", "屁力士", "气爆君", "屁神兽",
		"屁气侠", "响屁星", "气爆龙", "臭屁神", "屁力王",
		"气浪侠", "响屁君", "屁神猫", "气爆狗", "臭气龙",
	}

	defaultImage := "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/2025-10-17/default_img.png"

	// 批量创建昵称模板
	templates := make([]model.BreakNicknameTemplate, 0, len(nicknameList))
	for _, name := range nicknameList {
		templates = append(templates, model.BreakNicknameTemplate{
			Name:  name,
			Image: defaultImage,
		})
	}

	// 批量插入
	if err := global.GVA_DB.Create(&templates).Error; err != nil {
		return fmt.Errorf("初始化默认昵称失败: %v", err)
	}

	return nil
}
