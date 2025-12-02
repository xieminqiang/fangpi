package router

import (
	"github.com/flipped-aurora/gin-vue-admin/server/middleware"
	"github.com/gin-gonic/gin"
)

var Break = new(breakRouter)

type breakRouter struct{}

// Init 初始化 Break App 路由
func (r *breakRouter) Init(public *gin.RouterGroup, private *gin.RouterGroup) {
	// 需要JWT认证的接口
	{
		group := public.Group("break").Use(middleware.JWTAuth()).Use(middleware.OperationRecord()) // ✅ 添加JWT中间件

		// 放屁记录相关
		group.POST("record", apiFartRecord.CreateFartRecord) // 创建放屁记录
		group.POST("makeup", apiFartRecord.MakeupFartRecord) // 补卡记录
		group.GET("today", apiFartRecord.GetTodayRecords)    // 获取今日记录

		// 统计分析相关
		group.GET("statistics/trend", apiStatistics.GetTrendData)           // 获取趋势数据
		group.GET("statistics/summary", apiStatistics.GetStatisticsSummary) // 获取统计小结

		// 成就系统相关
		group.GET("achievements", apiAchievement.GetUserAchievements)                            // 获取用户成就列表
		group.GET("achievements/list", apiAchievement.GetAchievementList)                        // 获取所有成就配置
		group.POST("achievements/:achievementId/view", apiAchievement.MarkAchievementViewed)     // 标记成就为已查看
		group.GET("achievements/:achievementId/progress", apiAchievement.GetAchievementProgress) // 获取成就进度

		// 等级配置相关
		group.POST("levelConfig", apiLevelConfig.CreateLevelConfig)       // 创建等级配置
		group.DELETE("levelConfig/:id", apiLevelConfig.DeleteLevelConfig) // 删除等级配置
		group.PUT("levelConfig", apiLevelConfig.UpdateLevelConfig)        // 更新等级配置
		group.GET("levelConfig/:id", apiLevelConfig.GetLevelConfig)       // 根据ID获取等级配置
		group.POST("levelConfig/list", apiLevelConfig.GetLevelConfigList) // 分页获取等级配置列表
		group.GET("levelConfig/all", apiLevelConfig.GetAllLevelConfigs)   // 获取所有等级配置

		// 音频库（小程序）
		group.GET("audioLibrary/feed", apiAudioLibrary.GetAudioLibraryFeed) // 获取屁趣音效音频库

		// 小程序配置（公开接口）
		group.GET("appConfig/showFartEncyclopediaEntry", apiAppConfig.GetShowFartEncyclopediaEntry) // 获取是否显示"屁的全家族大全"入口

		// AI个性点评相关
		group.GET("ai/review", apiAiReview.GetAiPersonalityReview)              // 获取AI个性点评
		group.POST("ai/review/refresh", apiAiReview.RefreshAiPersonalityReview) // 刷新AI个性点评

		// AI聊天相关
		group.GET("ai/chat/roles", apiAiChat.GetRoleList)        // 获取AI角色列表
		group.POST("ai/chat/clear", apiAiChat.ClearConversation) // 清空对话历史
		group.GET("ai/chat/ws", apiAiChat.ChatWebSocket)         // WebSocket聊天接口
	}

	// 临时公开接口（用于数据回填和调试，完成后可以移除）
	{
		group := public.Group("break")
		group.POST("backfill-checkin", apiAchievement.BackfillCheckinDays)   // 回填打卡天数数据
		group.GET("test-continuous-days", apiAchievement.TestContinuousDays) // 测试连续天数计算
		group.POST("manual-level-up", apiAchievement.ManualCheckLevelUp)     // 手动检查等级升级
		group.GET("test-user-info", apiAchievement.TestUserInfo)             // 测试用户信息
	}

	// 管理后台接口（不需要JWT认证）
	{
		group := private.Group("break")

		// 成就管理相关
		group.POST("achievement", apiAchievement.CreateAchievement)                    // 创建成就配置
		group.DELETE("achievement/:id", apiAchievement.DeleteAchievement)              // 删除成就配置
		group.PUT("achievement", apiAchievement.UpdateAchievement)                     // 更新成就配置
		group.GET("achievement/:id", apiAchievement.GetAchievement)                    // 根据ID获取成就配置
		group.POST("achievement/list", apiAchievement.GetAchievementList)              // 分页获取成就配置列表
		group.GET("achievement/all", apiAchievement.GetAllAchievements)                // 获取所有成就配置
		group.POST("achievement/backfill-checkin", apiAchievement.BackfillCheckinDays) // 回填打卡天数数据

		// 音频库管理相关
		group.POST("audioLibrary", apiAudioLibrary.CreateAudioLibrary)       // 创建音频库
		group.PUT("audioLibrary", apiAudioLibrary.UpdateAudioLibrary)        // 更新音频库
		group.POST("audioLibrary/list", apiAudioLibrary.GetAudioLibraryList) // 分页获取音频库列表
		group.GET("audioLibrary/all", apiAudioLibrary.GetAllAudioLibraries)  // 获取所有音频库（必须在:id之前）
		group.GET("audioLibrary/:id", apiAudioLibrary.GetAudioLibrary)       // 根据ID获取音频库
		group.DELETE("audioLibrary/:id", apiAudioLibrary.DeleteAudioLibrary) // 删除音频库

		// 小程序配置相关
		group.PUT("appConfig/showFartEncyclopediaEntry", apiAppConfig.SetShowFartEncyclopediaEntry)   // 设置是否显示"屁的全家族大全"入口
	}
}
