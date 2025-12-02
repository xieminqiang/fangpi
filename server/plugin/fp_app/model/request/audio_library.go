package request

import (
	"github.com/flipped-aurora/gin-vue-admin/server/model/common/request"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

// AudioLibrarySearch 音频库搜索结构体
type AudioLibrarySearch struct {
	request.PageInfo
	model.BreakAudioLibrary
}

