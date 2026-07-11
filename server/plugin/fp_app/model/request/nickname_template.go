package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

// NicknameTemplateSearch 昵称模板搜索结构体
type NicknameTemplateSearch struct {
	request.PageInfo
	model.BreakNicknameTemplate
}











