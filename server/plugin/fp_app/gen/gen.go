package main

//go:generate go mod tidy
//go:generate go mod download
//go:generate go run gen.go

import (
	"path/filepath"

	"gorm.io/gen"
	"github.com/flipped-aurora/gin-vue-admin/server/plugin/fp_app/model"
)

func main() {
	g := gen.NewGenerator(gen.Config{OutPath: filepath.Join("..", "..", "..", "fp_app", "blender", "model", "dao"), Mode: gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface})
	g.ApplyBasic(
		new(model.WxUser),
	)
	g.Execute()
}
