package initialize

import (
	"context"
	"fmt"

	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func Gorm(ctx context.Context) {
	err := global.GVA_DB.WithContext(ctx).AutoMigrate(
		model.WxUser{},
		model.BreakUserCheckinDays{},
		model.BreakFartRecord{},
		model.BreakFartTogetherRecord{},
		model.BreakAchievement{},
		model.BreakUserAchievement{},
		model.BreakLevelConfig{},
		model.BreakAudioLibrary{},
		model.BreakAppConfig{},
		model.BreakUserPointsRecord{},
	)
	if err != nil {
		err = errors.Wrap(err, "注册表失败!")
		zap.L().Error(fmt.Sprintf("%+v", err))
	}
}
