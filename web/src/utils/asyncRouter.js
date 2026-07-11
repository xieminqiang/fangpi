const viewModules = import.meta.glob('../view/**/*.vue')
const pluginModules = import.meta.glob('../plugin/**/*.vue')

// Debug: Log available plugin modules on load
if (import.meta.env.DEV) {
  console.log('Plugin modules found:', Object.keys(pluginModules).map(k => k.replace(/^\.\.\//, '')))
}

export const asyncRouterHandle = (asyncRouter) => {
  asyncRouter.forEach((item) => {
    if (item.component && typeof item.component === 'string') {
      item.meta.path = '/src/' + item.component
      if (item.component.split('/')[0] === 'view') {
        item.component = dynamicImport(viewModules, item.component)
      } else if (item.component.split('/')[0] === 'plugin') {
        item.component = dynamicImport(pluginModules, item.component)
      } else {
        console.warn('Unknown component type:', item.component)
      }
    }
    if (item.children) {
      asyncRouterHandle(item.children)
    }
  })
}

function dynamicImport(dynamicViewsModules, component) {
  const keys = Object.keys(dynamicViewsModules)
  // Normalize the component path - remove leading/trailing slashes, whitespace, and normalize separators
  const normalizedComponent = component.trim().replace(/^\/+|\/+$/g, '').replace(/\\/g, '/')
  
  if (import.meta.env.DEV) {
    console.log(`Looking for component: "${component}" (normalized: "${normalizedComponent}")`)
    console.log(`Total available modules: ${keys.length}`)
  }
  
  const matchKeys = keys.filter((key) => {
    // Remove '../' prefix and normalize
    const k = key.replace(/^\.\.\//, '').replace(/\\/g, '/')
    const matches = k === normalizedComponent
    if (import.meta.env.DEV && matches) {
      console.log(`✅ Found match: "${key}" -> "${k}"`)
    }
    return matches
  })
  const matchKey = matchKeys[0]

  if (!matchKey) {
    console.error(`❌ Component not found: "${component}" (normalized: "${normalizedComponent}")`)
    const availableKeys = keys.map(k => k.replace(/^\.\.\//, ''))
    console.error(`Available ${availableKeys.length} keys:`, availableKeys)
    
    // Check for similar matches (case-insensitive or partial)
    const similarMatches = keys.filter((key) => {
      const k = key.replace(/^\.\.\//, '').replace(/\\/g, '/').toLowerCase()
      return k.includes(normalizedComponent.toLowerCase()) || normalizedComponent.toLowerCase().includes(k)
    })
    if (similarMatches.length > 0) {
      console.warn('Similar matches found:', similarMatches.map(k => k.replace(/^\.\.\//, '')))
    }
    
    // Return the error component instead of throwing
    return () => import('@/view/error/index.vue')
  }

  if (import.meta.env.DEV) {
    console.log(`✅ Component found: "${component}" -> "${matchKey}"`)
  }

  const componentLoader = dynamicViewsModules[matchKey]
  if (!componentLoader) {
    console.error(`❌ Component loader is undefined for: "${matchKey}"`)
    return () => import('@/view/error/index.vue')
  }

  return componentLoader
}
