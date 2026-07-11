package model

import (
	"github.com/flipped-aurora/gin-vue-admin/server/global"
)

// BreakUserPointsRecord 用户积分记录 结构体
type BreakUserPointsRecord struct {
	global.GVA_MODEL
	UserId    uint  `json:"userId" form:"userId" gorm:"not null;index;comment:用户ID"`                    //用户ID
	Points    int   `json:"points" form:"points" gorm:"not null;comment:积分数量（扣除或增加）"`                  //积分数量（扣除或增加）
	PointsType int  `json:"pointsType" form:"pointsType" gorm:"not null;comment:积分类型:1-增加积分,2-扣除积分"` //积分类型:1-增加积分,2-扣除积分
	Remark    string `json:"remark" form:"remark" gorm:"size:200;comment:备注说明"`                       //备注说明
}

// TableName 用户积分记录 BreakUserPointsRecord自定义表名 break_user_points_record
func (BreakUserPointsRecord) TableName() string {
	return "break_user_points_record"
}

