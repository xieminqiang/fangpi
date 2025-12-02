package config

type WxUserConfig struct {
	AppID     string `mapstructure:"app-id" json:"app-id" yaml:"app-id"`
	AppSecret string `mapstructure:"app-secret" json:"app-secret" yaml:"app-secret"`
}
