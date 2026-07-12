/**
 * SVG 雪碧图构建插件（v2.8.6+ 完全清洁版本）
 * 将 src/plugin、src/assets/icons 下的 .svg 注入 index.html 为 <symbol>
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
            const content = $2.replace(clearHeightWidth, (s1, s2, s3) => {
              if (s2 === 'width') {
                width = s3
              } else if (s2 === 'height') {
                height = s3
              }
              return ''
            })
            const viewBox = hasViewBox.test($2) ? '' : `viewBox="0 0 ${width} ${height}"`
            return `<symbol id="${pluginName}${dirent.name.replace('.svg', '')}" ${content}${viewBox}>`
          })
          .replace('</svg>', '</symbol>')
        svgRes.push(svg)
      }
    }
  }
  return svgRes
}

export const svgBuilder = (paths, base, outDir, assets, mode) => {
  if (!paths) return
  if (typeof paths === 'string') paths = [paths]
  if (!base) base = '/'
  if (!outDir) outDir = 'dist'
  if (!assets) assets = 'assets'
  if (!mode) mode = 'development'
  const res = findSvgFile(paths)
  return {
    name: 'svg-transform',
    transformIndexHtml(html) {
      return html.replace(
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
