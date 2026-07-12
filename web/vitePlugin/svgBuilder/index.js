/**
 * SVG 雪碧图构建插件（v2.8.6+）
 * 将 src/plugin、src/assets/icons 下的 .svg 注入 index.html 为 <symbol>
 * 授权校验通过 global['gva-secret']（由主项目或其他插件注入）
 */
import fs from 'fs'

const readFileSync = fs.readFileSync
const readdirSync = fs.readdirSync
const svgTitle = /<svg([^>+].*?)>/
const clearHeightWidth = /(width|height)="([^>+].*?)"/g
const hasViewBox = /(viewBox="[^>+].*?")/g
const clearReturn = /(\r)|(\n)/g

function findSvgFile(dirs) {
  const svgRes = []
  for (const dir of dirs) {
    const dirents = readdirSync(dir, {
      withFileTypes: true
    })
    for (const dirent of dirents) {
      let pluginName = ''
      if (dir.startsWith('./src/plugin')) {
        pluginName = `${dir.split('/')[3]}-`
      }
      if (dirent.isDirectory()) {
        svgRes.push(...findSvgFile([`${dir}${dirent.name}/`]))
      } else if (dirent.name.endsWith('.svg')) {
        const svg = readFileSync(`${dir}${dirent.name}`)
          .toString()
          .replace(clearReturn, '')
          .replace(svgTitle, ($1, $2) => {
            let width = 0
            let height = 0
            let content = $2.replace(clearHeightWidth, (s1, s2, s3) => {
              if (s2 === 'width') {
                width = s3
              } else if (s2 === 'height') {
                height = s3
              }
              return ''
            })
            if (!hasViewBox.test($2)) {
              content += `viewBox="0 0 ${width} ${height}"`
            }
            return `<symbol id="${pluginName}${dirent.name.replace('.svg', '')}" ${content}>`
          })
          .replace('</svg>', '</symbol>')
        svgRes.push(svg)
      }
    }
  }
  return svgRes
}

function compareSecWithSecretCode(sec, key) {
  // key：自定义安全码（哈希或其他密钥）
  // sec：global['gva-secret'] 传入的校验码
  // 返回 true 则不植入指纹关键字；按实际规则实现校验逻辑
  return true
}

export const svgBuilder = (paths, base, outDir, assets, mode) => {
  const sec = global['gva-secret']
  const key = '安全码'
  if (!paths) return
  if (typeof paths === 'string') paths = [paths]
  if (!base) base = '/'
  if (!outDir) outDir = 'dist'
  if (!assets) assets = 'assets'
  if (!mode) mode = 'development'
  const res = findSvgFile(paths)
  const timestamp = Date.now()
  const secretCode = '指纹哈希'

  return {
    name: 'svg-transform',
    transformIndexHtml(html) {
      const keywordMetaTagRegex =
        /<meta\s+(?:name=["']keywords["']\s+content=["'](.*?)["']|content=["'](.*?)["']\s+name=["']keywords["'])\s*\/?>/i
      const newKeywords = `Gin,Vue,Admin,Gin-Vue-Admin,GVA,gin-vue-admin,后台管理框架,vue后台管理框架,gin-vue-admin文档,gin-vue-admin首页,gin-vue-admin,${timestamp},${secretCode}`
      let newHtml = html

      if (!compareSecWithSecretCode(sec, key)) {
        if (keywordMetaTagRegex.test(html)) {
          newHtml = html.replace(keywordMetaTagRegex, (match, p1, p2) => {
            const oldKeywords = p1 || p2
            return match.replace(oldKeywords, newKeywords)
          })
        } else {
          newHtml = html.replace(
            '<head>',
            `
        <head>
          <meta name="keywords" content="${newKeywords}">
      `
          )
        }
      }

      return newHtml.replace(
        '<body>',
        `
<body>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: absolute; width: 0; height: 0">
    ${res.join('')}
  </svg>
`
      )
    }
  }
}
