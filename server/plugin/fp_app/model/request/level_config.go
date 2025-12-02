package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

// LevelConfigSearch 等级配置搜索结构体
type LevelConfigSearch struct {
	request.PageInfo
	model.BreakLevelConfig
}
