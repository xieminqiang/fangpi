package service

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model/request"
	"gorm.io/gorm"
)

var AudioLibrary = new(audioLibrary)

type audioLibrary struct{}

// CreateAudioLibrary 创建音频库
func (s *audioLibrary) CreateAudioLibrary(ctx context.Context, audioLibrary *model.BreakAudioLibrary) (*model.BreakAudioLibrary, error) {
	// 确保时间字段被正确设置
	now := time.Now()
	audioLibrary.CreatedAt = now
	audioLibrary.UpdatedAt = now
	audioLibrary.ID = 0 // 确保ID为0，让数据库自动生成

	// 创建音频库
	if err := global.GVA_DB.Create(audioLibrary).Error; err != nil {
		return nil, err
	}

	return audioLibrary, nil
}

// DeleteAudioLibrary 删除音频库
func (s *audioLibrary) DeleteAudioLibrary(ctx context.Context, id uint) error {
	// 删除音频库
	if err := global.GVA_DB.Delete(&model.BreakAudioLibrary{}, id).Error; err != nil {
		return err
	}

	return nil
}

// DeleteMyAudioLibrary 删除用户自己的音频库记录（需要验证权限）
func (s *audioLibrary) DeleteMyAudioLibrary(ctx context.Context, id uint, userID uint) error {
	// 先查询记录，验证是否是用户自己的
	var record model.BreakAudioLibrary
	err := global.GVA_DB.Where("id = ?", id).First(&record).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("记录不存在")
		}
		return err
	}

	// 验证权限：只有创建该音频的用户才能删除
	if record.UserId != userID {
		return fmt.Errorf("无权限删除此音频，只能删除自己创建的音频")
	}

	// 验证分类：只有"自己放的屁"分类才能删除
	if record.ClassName != "自己放的屁" {
		return fmt.Errorf("只能删除分类为'自己放的屁'的音频")
	}

	// 删除音频库
	if err := global.GVA_DB.Delete(&model.BreakAudioLibrary{}, id).Error; err != nil {
		return err
	}

	return nil
}

// UpdateAudioLibrary 更新音频库
func (s *audioLibrary) UpdateAudioLibrary(ctx context.Context, audioLibrary *model.BreakAudioLibrary) (*model.BreakAudioLibrary, error) {
	// 使用 Updates 方法而不是 Save，避免时间字段问题
	updates := map[string]interface{}{
		"name":        audioLibrary.Name,
		"url":         audioLibrary.Url,
		"tags":        audioLibrary.Tags,
		"image":       audioLibrary.Image,
		"description": audioLibrary.Description,
		"class_name":  audioLibrary.ClassName,
		"updated_at":  time.Now(),
	}

	// 更新音频库
	if err := global.GVA_DB.Model(&model.BreakAudioLibrary{}).Where("id = ?", audioLibrary.ID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 重新查询更新后的数据
	if err := global.GVA_DB.Where("id = ?", audioLibrary.ID).First(audioLibrary).Error; err != nil {
		return nil, err
	}

	return audioLibrary, nil
}

// GetAudioLibrary 根据ID获取音频库
func (s *audioLibrary) GetAudioLibrary(ctx context.Context, id uint) (*model.BreakAudioLibrary, error) {
	var audioLibrary model.BreakAudioLibrary
	if err := global.GVA_DB.Where("id = ?", id).First(&audioLibrary).Error; err != nil {
		return nil, err
	}

	return &audioLibrary, nil
}

// GetAudioLibraryList 分页获取音频库列表
func (s *audioLibrary) GetAudioLibraryList(ctx context.Context, pageInfo *request.AudioLibrarySearch) (list []model.BreakAudioLibrary, total int64, err error) {
	limit := pageInfo.PageSize
	offset := pageInfo.PageSize * (pageInfo.Page - 1)
	db := global.GVA_DB.Model(&model.BreakAudioLibrary{})

	// 构建查询条件
	if pageInfo.Name != "" {
		db = db.Where("name LIKE ?", "%"+pageInfo.Name+"%")
	}
	if pageInfo.Url != "" {
		db = db.Where("url LIKE ?", "%"+pageInfo.Url+"%")
	}
	if pageInfo.Description != "" {
		db = db.Where("description LIKE ?", "%"+pageInfo.Description+"%")
	}

	// 获取总数
	if err = db.Count(&total).Error; err != nil {
		return
	}

	// 获取列表
	err = db.Limit(limit).Offset(offset).Order("id DESC").Find(&list).Error
	return list, total, err
}

// GetAllAudioLibraries 获取所有音频库
func (s *audioLibrary) GetAllAudioLibraries(ctx context.Context) ([]model.BreakAudioLibrary, error) {
	var list []model.BreakAudioLibrary
	if err := global.GVA_DB.Order("id DESC").Find(&list).Error; err != nil {
		return nil, err
	}

	return list, nil
}

// AudioFeedCard 小程序端展示的音频卡片
type AudioFeedCard struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name"`
	Url         string   `json:"url"`
	Image       string   `json:"image"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	MoodText    string   `json:"moodText"`
	AccentColor string   `json:"accentColor"`
	Badge       string   `json:"badge"`
	ClassName   string   `json:"class_name"` // 分类名称，如：声学类屁、体感类屁、化学类屁
}

// AudioCollection 小程序端的专题集合
type AudioCollection struct {
	Title    string          `json:"title"`
	Subtitle string          `json:"subtitle"`
	Icon     string          `json:"icon"`
	Style    string          `json:"style"`
	Items    []AudioFeedCard `json:"items"`
}

// TagStat 标签云
type TagStat struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
	Emoji string `json:"emoji"`
	Tone  string `json:"tone"`
}

// AudioFeedResponse 小程序端总数据（简化版）
type AudioFeedResponse struct {
	List         []AudioFeedCard `json:"list"`         // 音频列表
	TrendingTags []TagStat       `json:"trendingTags"` // 热门标签
	Empty        bool            `json:"empty"`        // 是否为空
	Total        int             `json:"total"`        // 总数
}

// GetAudioLibraryFeed 获取小程序端音频库数据（简化版，支持分页）
// 过滤掉没有音频URL的数据
// userID: 当前用户ID，如果为0表示未登录，只能看到公共音频
// 返回：公共音频（user_id为0或null） + 当前用户自己的私人音频（user_id = userID）
func (s *audioLibrary) GetAudioLibraryFeed(ctx context.Context, page, pageSize int, userID uint) (*AudioFeedResponse, error) {
	var audios []model.BreakAudioLibrary
	var total int64

	// 构建查询条件：只查询有URL的数据
	db := global.GVA_DB.Model(&model.BreakAudioLibrary{}).Where("url IS NOT NULL AND url != ''")

	// 添加用户权限过滤：
	// 1. 公共音频：user_id = 0 或 user_id IS NULL
	// 2. 如果已登录，还要包含当前用户自己的私人音频：user_id = userID
	if userID > 0 {
		// 已登录：返回公共音频 + 自己的私人音频
		db = db.Where("(user_id = 0 OR user_id IS NULL) OR user_id = ?", userID)
	} else {
		// 未登录：只返回公共音频
		db = db.Where("user_id = 0 OR user_id IS NULL")
	}

	// 先获取总数
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	// 排序规则：当前用户自己的音频（user_id = userID）排在第一位，然后按更新时间倒序
	offset := (page - 1) * pageSize
	if userID > 0 {
		// 如果已登录，将自己的音频排在第一位
		// 使用 CASE WHEN 实现：当前用户的音频排在前面（排序值为0），其他排在后面（排序值为1）
		db = db.Order(fmt.Sprintf("CASE WHEN user_id = %d THEN 0 ELSE 1 END, updated_at DESC, id DESC", userID))
	} else {
		// 未登录，只按更新时间排序
		db = db.Order("updated_at DESC, id DESC")
	}
	if err := db.Offset(offset).Limit(pageSize).Find(&audios).Error; err != nil {
		return nil, err
	}

	cards := make([]AudioFeedCard, 0, len(audios))
	for idx, audio := range audios {
		// 再次过滤，确保URL不为空
		if audio.Url == "" {
			continue
		}
		// 使用全局索引计算 accentColor，而不是当前页索引
		globalIdx := offset + idx
		cards = append(cards, buildAudioFeedCard(audio, globalIdx))
	}

	// 构建热门标签（基于所有数据，但这里为了性能，可以只基于当前页）
	// 如果需要真正的热门标签，需要单独查询所有标签统计
	trendingTags := buildTrendingTags(cards)

	resp := &AudioFeedResponse{
		List:         cards,
		TrendingTags: trendingTags,
		Empty:        len(cards) == 0,
		Total:        int(total),
	}

	return resp, nil
}

var accentPalette = []string{
	"#FFB6C1", "#A8E6CF", "#FFD3B6", "#C5CAE9", "#FFECB3", "#B2EBF2",
}

var playfulTagMap = map[string]struct {
	Emoji string
	Tone  string
}{
	"搞笑": {"😂", "#FFF3E0"},
	"经典": {"🎧", "#E8F5E9"},
	"日常": {"🌤️", "#E3F2FD"},
	"特殊": {"⚡", "#F3E5F5"},
	"长音": {"📻", "#FFFDE7"},
	"短音": {"⏱️", "#FCE4EC"},
	"响亮": {"📢", "#E0F2F1"},
	"轻柔": {"🫧", "#F1F8E9"},
	"助眠": {"🌙", "#EDE7F6"},
	"整蛊": {"🤡", "#FFF8E1"},
}

// extractClassName 从tags中提取分类名称，如果数据库已有class_name则直接使用
func extractClassName(audio model.BreakAudioLibrary) string {
	// 如果数据库已有class_name字段，优先使用
	if audio.ClassName != "" {
		return audio.ClassName
	}

	// 否则从tags中提取（兼容旧数据）
	tags := []string(audio.Tags)
	classKeywords := map[string]string{
		"声学": "声学类屁",
		"体感": "体感类屁",
		"化学": "化学类屁",
		"物理": "物理类屁",
		"生物": "生物类屁",
		"机械": "机械类屁",
		"电子": "电子类屁",
		"自然": "自然类屁",
		"人工": "人工类屁",
		"饮食": "饮食类屁",
		"传奇": "传奇神话类屁",
		"神话": "传奇神话类屁",
	}

	// 遍历tags，查找匹配的分类关键词
	for _, tag := range tags {
		for keyword, className := range classKeywords {
			if strings.Contains(tag, keyword) {
				return className
			}
		}
	}

	// 如果没有匹配到，返回默认分类
	return "其他类屁"
}

func buildAudioFeedCard(audio model.BreakAudioLibrary, idx int) AudioFeedCard {
	tags := []string(audio.Tags)
	accent := accentPalette[idx%len(accentPalette)]
	if len(tags) > 0 {
		if tagStyle, ok := playfulTagMap[tags[0]]; ok {
			accent = tagStyle.Tone
		}
	}

	mood := deriveMoodText(tags)
	badge := ""
	switch {
	case idx == 0:
		badge = "今日主打"
	case idx == 1:
		badge = "热度飙升"
	case idx == 2:
		badge = "收藏最多"
	case idx == 3:
		badge = "解压必备"
	}

	// 提取分类名称（优先使用数据库字段）
	className := extractClassName(audio)

	return AudioFeedCard{
		ID:          audio.ID,
		Name:        audio.Name,
		Url:         audio.Url,
		Image:       audio.Image,
		Description: audio.Description,
		Tags:        tags,
		MoodText:    mood,
		AccentColor: accent,
		Badge:       badge,
		ClassName:   className,
	}
}

func deriveMoodText(tags []string) string {
	if len(tags) == 0 {
		return "随手收藏，随时放松"
	}
	for _, tag := range tags {
		switch {
		case strings.Contains(tag, "轻") || strings.Contains(tag, "助眠"):
			return "柔软气垫，轻拍入眠"
		case strings.Contains(tag, "响") || strings.Contains(tag, "整蛊"):
			return "整蛊必备，现场秒燃"
		case strings.Contains(tag, "经典"):
			return "经典回放，百听不厌"
		}
	}
	return "屁趣声场，治愈一整天"
}

func buildTrendingTags(cards []AudioFeedCard) []TagStat {
	tagCount := map[string]int{}
	for _, card := range cards {
		for _, tag := range card.Tags {
			if tag == "" {
				continue
			}
			tagCount[tag]++
		}
	}

	stats := make([]TagStat, 0, len(tagCount))
	for tag, count := range tagCount {
		style := playfulTagMap[tag]
		stats = append(stats, TagStat{
			Name:  tag,
			Count: count,
			Emoji: style.Emoji,
			Tone:  style.Tone,
		})
	}

	sort.Slice(stats, func(i, j int) bool {
		return stats[i].Count > stats[j].Count
	})
	if len(stats) > 8 {
		stats = stats[:8]
	}
	return stats
}

func buildCollections(cards []AudioFeedCard) []AudioCollection {
	collections := []AudioCollection{}

	soft := filterCardsByKeywords(cards, []string{"轻", "助眠", "白噪音", "舒缓"})
	if len(soft) == 0 {
		soft = cards
	}
	collections = append(collections, AudioCollection{
		Title:    "轻柔舒缓",
		Subtitle: "躺平瞬间，安心入梦",
		Icon:     "🛌",
		Style:    "soothing",
		Items:    limitCards(soft, 4),
	})

	prank := filterCardsByKeywords(cards, []string{"响", "整蛊", "搞怪", "恶作剧"})
	if len(prank) == 0 {
		prank = cards
	}
	collections = append(collections, AudioCollection{
		Title:    "恶作剧工坊",
		Subtitle: "一键点燃全场笑声",
		Icon:     "🎉",
		Style:    "party",
		Items:    limitCards(prank, 4),
	})

	classic := filterCardsByKeywords(cards, []string{"经典", "日常", "复古"})
	if len(classic) == 0 {
		classic = cards
	}
	collections = append(collections, AudioCollection{
		Title:    "经典常驻",
		Subtitle: "永不过时的屁趣收藏",
		Icon:     "📻",
		Style:    "classic",
		Items:    limitCards(classic, 4),
	})

	return collections
}

func filterCardsByKeywords(cards []AudioFeedCard, keywords []string) []AudioFeedCard {
	filtered := make([]AudioFeedCard, 0, len(cards))
	for _, card := range cards {
		if len(card.Tags) == 0 {
			continue
		}
		for _, tag := range card.Tags {
			for _, keyword := range keywords {
				if strings.Contains(tag, keyword) {
					filtered = append(filtered, card)
					goto NextCard
				}
			}
		}
	NextCard:
	}
	return filtered
}

func limitCards(cards []AudioFeedCard, limit int) []AudioFeedCard {
	if len(cards) <= limit {
		return cards
	}
	return cards[:limit]
}
