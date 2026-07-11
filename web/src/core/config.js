/**
 * 网站配置文件
 */
import packageInfo from '../../package.json'

const greenText = (text) => `\x1b[32m${text}\x1b[0m`

export const config = {
  appName: '小强管理系统',
  showViteLogo: true,
  keepAliveTabs: false,
  logs: []
}

export const viteLogo = (env) => {

 
}

export default config
