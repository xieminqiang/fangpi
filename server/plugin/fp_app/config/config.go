package config

type WxUserConfig struct {
	AppID     string `mapstructure:"app-id" json:"app-id" yaml:"app-id"`
	AppSecret string `mapstructure:"app-secret" json:"app-secret" yaml:"app-secret"`
	// 小红书小组件
	XhsAppID  string `mapstructure:"xhs-app-id" json:"xhs-app-id" yaml:"xhs-app-id"`
	XhsSecret string `mapstructure:"xhs-secret" json:"xhs-secret" yaml:"xhs-secret"`
}
