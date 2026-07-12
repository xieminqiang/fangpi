package initialize

import (
	"context"
	model "github.com/flipped-aurora/gin-vue-admin/server/model/system"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/plugin-tool/utils"
)

func Api(ctx context.Context) {
	entities := []model.SysApi{
		// 微信用户相关API
		{Path: "/wxuser/deleteWxUser", Description: "删除微信用户", ApiGroup: "微信用户", Method: "DELETE"},
		{Path: "/wxuser/deleteWxUserByIds", Description: "批量删除微信用户", ApiGroup: "微信用户", Method: "DELETE"},
		{Path: "/wxuser/updateWxUser", Description: "更新微信用户", ApiGroup: "微信用户", Method: "PUT"},
		{Path: "/wxuser/findWxUser", Description: "根据ID获取微信用户", ApiGroup: "微信用户", Method: "GET"},
		{Path: "/wxuser/getWxUserList", Description: "获取微信用户列表", ApiGroup: "微信用户", Method: "GET"},
		{Path: "/wxuser/wxLogin", Description: "微信登录", ApiGroup: "微信用户", Method: "POST"},
		{Path: "/wxuser/wxRegister", Description: "微信注册", ApiGroup: "微信用户", Method: "POST"},
		// 音频库管理相关API
		{Path: "/break/audioLibrary", Description: "创建音频库", ApiGroup: "放屁音频库", Method: "POST"},
		{Path: "/break/audioLibrary", Description: "更新音频库", ApiGroup: "放屁音频库", Method: "PUT"},
		{Path: "/break/audioLibrary/list", Description: "分页获取音频库列表", ApiGroup: "放屁音频库", Method: "POST"},
		{Path: "/break/audioLibrary/all", Description: "获取所有音频库", ApiGroup: "放屁音频库", Method: "GET"},
		{Path: "/break/audioLibrary/:id", Description: "根据ID获取音频库", ApiGroup: "放屁音频库", Method: "GET"},
		{Path: "/break/audioLibrary/:id", Description: "删除音频库", ApiGroup: "放屁音频库", Method: "DELETE"},
		{Path: "/break/audioLibrary/feed", Description: "屁趣音效音频库", ApiGroup: "放屁音频库", Method: "GET"},
		// 放屁记录管理相关API
		{Path: "/break/fartRecord/list", Description: "分页获取放屁记录", ApiGroup: "放屁记录", Method: "POST"},
		{Path: "/break/fartRecord/:id", Description: "根据ID获取放屁记录", ApiGroup: "放屁记录", Method: "GET"},
		{Path: "/break/fartRecord/:id", Description: "删除放屁记录", ApiGroup: "放屁记录", Method: "DELETE"},
		{Path: "/break/fartRecord/deleteByIds", Description: "批量删除放屁记录", ApiGroup: "放屁记录", Method: "DELETE"},
		// 邀请放屁记录管理相关API
		{Path: "/break/fartTogetherRecord/list", Description: "分页获取邀请放屁记录", ApiGroup: "邀请放屁", Method: "POST"},
		{Path: "/break/fartTogetherRecord/:id", Description: "根据ID获取邀请放屁记录", ApiGroup: "邀请放屁", Method: "GET"},
		{Path: "/break/fartTogetherRecord/:id", Description: "删除邀请放屁记录", ApiGroup: "邀请放屁", Method: "DELETE"},
		{Path: "/break/fartTogetherRecord/deleteByIds", Description: "批量删除邀请放屁记录", ApiGroup: "邀请放屁", Method: "DELETE"},
	}
	utils.RegisterApis(entities...)
}
