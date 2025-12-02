package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

// AchievementSearch 成就配置搜索结构体
type AchievementSearch struct {
	request.PageInfo
	model.BreakAchievement
}
