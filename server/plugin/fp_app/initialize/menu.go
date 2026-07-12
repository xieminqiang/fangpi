package initialize

import (
	"context"
	"fmt"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	model "github.com/flipped-aurora/gin-vue-admin/server/model/system"
	"gorm.io/gorm"
)

func Menu(ctx context.Context) {
	// 先查找或创建父菜单：放屁档案
	var parentMenu model.SysBaseMenu
	err := global.GVA_DB.Where("name = ?", "fpArchive").First(&parentMenu).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// 父菜单不存在，创建它
			parentMenu = model.SysBaseMenu{
				ParentId:  0,
				Path:      "fpArchive",
				Name:      "fpArchive",
				Hidden:    false,
				Component: "view/routerHolder.vue",
				Sort:      0,
				Meta:      model.Meta{Title: "放屁档案", Icon: "document"},
			}
			if err = global.GVA_DB.Create(&parentMenu).Error; err != nil {
				fmt.Printf("创建父菜单失败: %v\n", err)
				return
			}
		} else {
			fmt.Printf("查询父菜单失败: %v\n", err)
			return
		}
	}

	// 定义所有子菜单
	childMenus := []model.SysBaseMenu{
		// 子菜单1：放屁用户管理
		{
			Path:      "wxuser",
			Name:      "wxuser",
			Hidden:    false,
			Component: "plugin/fp_app/view/wx_user.vue",
			Sort:      1,
			Meta:      model.Meta{Title: "放屁用户管理", Icon: "avatar"},
		},
		// 子菜单2：成就管理
		{
			Path:      "achievement",
			Name:      "achievement",
			Hidden:    false,
			Component: "plugin/fp_app/view/achievement.vue",
			Sort:      2,
			Meta:      model.Meta{Title: "成就管理", Icon: "trophy"},
		},
		// 子菜单3：等级管理
		{
			Path:      "levelConfig",
			Name:      "levelConfig",
			Hidden:    false,
			Component: "plugin/fp_app/view/levelConfig.vue",
			Sort:      3,
			Meta:      model.Meta{Title: "等级管理", Icon: "star"},
		},
		// 子菜单4：放屁音频库
		{
			Path:      "audioLibrary",
			Name:      "audioLibrary",
			Hidden:    false,
			Component: "plugin/fp_app/view/audio_library.vue",
			Sort:      4,
			Meta:      model.Meta{Title: "放屁音频库", Icon: "video-play"},
		},
		// 子菜单5：放屁记录
		{
			Path:      "fartRecord",
			Name:      "fartRecord",
			Hidden:    false,
			Component: "plugin/fp_app/view/fart_record.vue",
			Sort:      5,
			Meta:      model.Meta{Title: "放屁记录", Icon: "list"},
		},
		// 子菜单6：邀请放屁
		{
			Path:      "fartTogetherRecord",
			Name:      "fartTogetherRecord",
			Hidden:    false,
			Component: "plugin/fp_app/view/fart_together_record.vue",
			Sort:      6,
			Meta:      model.Meta{Title: "邀请放屁", Icon: "connection"},
		},
	}

	// 逐个检查并创建子菜单
	for _, childMenu := range childMenus {
		var existingMenu model.SysBaseMenu
		err := global.GVA_DB.Where("name = ?", childMenu.Name).First(&existingMenu).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// 菜单不存在，创建它
				childMenu.ParentId = parentMenu.ID
				if err = global.GVA_DB.Create(&childMenu).Error; err != nil {
					fmt.Printf("创建子菜单 %s 失败: %v\n", childMenu.Name, err)
				}
			} else {
				fmt.Printf("查询子菜单 %s 失败: %v\n", childMenu.Name, err)
			}
		}
		// 如果菜单已存在，跳过
	}
}
