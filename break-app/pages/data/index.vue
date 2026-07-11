<template>
	<view class="container">
		<!-- Header with Gradient -->
		<view class="header-gradient fade-in">
			<view class="header-content">
				<text class="title">实验室</text>
				<text class="subtitle">探索你的秘密</text>
			</view>
		</view>

		<!-- Period Selector -->
		<view class="period-selector" style="animation-delay: 0.1s;">
			<u-subsection 
				:list="periods" 
				:current="currentPeriodIndex"
				mode="button"
				activeColor="#0d1b14"
				inactiveColor="#8af5bf"
				bgColor="rgba(138, 245, 191, 0.2)"
				@change="onPeriodChange"
			></u-subsection>
		</view>

		<!-- 可滚动内容区域 -->
		<scroll-view class="scroll-content" scroll-y="true" :enhanced="true" :show-scrollbar="false">
			<!-- Fart Trend Chart -->
			<view class="chart-card" >
				<!-- <text class="chart-title">趋势图 📈</text> -->
				<!-- 临时显示数据点 -->
				<view class="trend-data-display">
					<view 
						v-for="(value, index) in chartData" 
						:key="index"
						class="data-point-item"
					>
						<text class="data-time">{{ chartLabels[index] }}</text>
						<text class="data-value">{{ value }}次</text>
					</view>
				</view>
				<!-- 图表组件 - 今日 -->
				<view v-show="selectedPeriod === '今日'" class="trend-chart-echart">
					<!-- Loading 遮罩层 -->
					<view v-if="chartLoading.day" class="chart-loading">
						<view class="loading-spinner"></view>
						<text class="loading-text">加载中...</text>
					</view>
					<l-echart 
						ref="dayChartRef" 
						:custom-style="chartStyle"
						type="2d"
						:is-disable-scroll="false"
					></l-echart>
				</view>
				
				<!-- 图表组件 - 本周 -->
				<view v-show="selectedPeriod === '本周'" class="trend-chart-echart">
					<!-- Loading 遮罩层 -->
					<view v-if="chartLoading.week" class="chart-loading">
						<view class="loading-spinner"></view>
						<text class="loading-text">加载中...</text>
					</view>
					<l-echart 
						ref="weekChartRef" 
						:custom-style="chartStyle"
						type="2d"
						:is-disable-scroll="false"
					></l-echart>
				</view>
				
				<!-- 图表组件 - 本月 -->
				<view v-show="selectedPeriod === '本月'" class="trend-chart-echart">
					<!-- Loading 遮罩层 -->
					<view v-if="chartLoading.month" class="chart-loading">
						<view class="loading-spinner"></view>
						<text class="loading-text">加载中...</text>
					</view>
					<l-echart 
						ref="monthChartRef" 
						:custom-style="chartStyle"
						type="2d"
						:is-disable-scroll="false"
					></l-echart>
				</view>
			</view>

			<!-- AI Summary Card -->
			<view class="ai-card slide-in" style="animation-delay: 0.9s;">
				<view class="ai-header">
					<image class="ai-icon" src="/static/img/jqr.png" mode="aspectFit" />
					<text class="ai-title">小结卡片</text>
				</view>
				<view class="ai-content">
					<text class="ai-item">{{ selectedPeriod }}共记录 <text class="ai-highlight">{{ totalCount }}</text> 次，排气频率适中 </text>
					<text class="ai-item">{{ mostCommonType }}占比最高，平均气味为{{ averageSmell }}～</text>
					<text class="ai-item">整体心情{{ mostCommonMood.name }}，保持愉快状态 </text>
				</view>
			
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 引入 lime-echart 组件
import LEchart from '@/uni_modules/lime-echart/components/l-echart/l-echart.vue'

// 引入 echarts（小程序使用 require，非小程序使用 import）
// #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
const echarts = require('../../uni_modules/lime-echart/static/echarts.min')
// #endif
// #ifndef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
// 非小程序环境，如果安装了 npm 包可以使用 import
// import * as echarts from 'echarts'
const echarts = require('../../uni_modules/lime-echart/static/echarts.min')
// #endif

import { getTrendDataAPI, getStatisticsSummaryAPI } from '@/src/api/fart.js'
import { useUserStore } from '@/src/stores/user.js'

// 响应式数据
const selectedPeriod = ref('今日')
const periods = ref(['今日', '本周', '本月'])
const currentPeriodIndex = ref(0)

const timeLabels = ref(['凌晨', '上午', '下午', '晚上'])

// 统计数据
const trendData = ref(null)
const summaryData = ref(null)

// 数据缓存，避免重复请求
const dataCache = ref({
  day: { trendData: null, summaryData: null, timestamp: 0 },
  week: { trendData: null, summaryData: null, timestamp: 0 },
  month: { trendData: null, summaryData: null, timestamp: 0 }
})

// 缓存有效期（5分钟）
const CACHE_DURATION = 5 * 60 * 1000

// ECharts 图表引用 - 分别为今日、本周、本月
const dayChartRef = ref(null)
const weekChartRef = ref(null)
const monthChartRef = ref(null)

// 图表实例 - 分别为今日、本周、本月
const chartInstances = {
	day: null,
	week: null,
	month: null
}

// 初始化标志，防止重复初始化
const isInitializing = {
	day: false,
	week: false,
	month: false
}

const isInitialized = {
	day: false,
	week: false,
	month: false
}

// 图表加载状态（首次进入时显示 loading）
const chartLoading = ref({
	day: true,
	week: false,
	month: false
})

// 根据周期类型获取图表数据和标签
const getChartData = (periodType) => {
	const cache = dataCache.value[periodType]
	if (!cache || !cache.trendData) {
		// 返回默认数据
		if (periodType === 'day') return { labels: ['凌晨', '上午', '下午', '晚上'], data: [0, 0, 0, 0] }
		if (periodType === 'week') return { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], data: [0, 0, 0, 0, 0, 0, 0] }
		if (periodType === 'month') return { labels: ['月初', '月中', '月底'], data: [0, 0, 0] }
		return { labels: [], data: [] }
	}
	
	const trendData = cache.trendData
	if (periodType === 'day') {
		const tp = trendData.timePeriodData || {}
		return {
			labels: ['凌晨', '上午', '下午', '晚上'],
			data: [tp.dawn || 0, tp.morning || 0, tp.afternoon || 0, tp.evening || 0]
		}
	} else if (periodType === 'week') {
		return {
			labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			data: trendData.weekData || [0, 0, 0, 0, 0, 0, 0]
		}
	} else if (periodType === 'month') {
		return {
			labels: ['月初', '月中', '月底'],
			data: trendData.monthData || [0, 0, 0]
		}
	}
	return { labels: [], data: [] }
}

// 当前显示的图表数据和标签（用于数据显示）
const chartLabels = computed(() => {
	const typeMap = { '今日': 'day', '本周': 'week', '本月': 'month' }
	const periodType = typeMap[selectedPeriod.value]
	return getChartData(periodType).labels
})

const chartData = computed(() => {
	const typeMap = { '今日': 'day', '本周': 'week', '本月': 'month' }
	const periodType = typeMap[selectedPeriod.value]
	return getChartData(periodType).data
})

// 动态计算图表高度
const getChartHeight = () => {
	// 获取系统信息
	const systemInfo = uni.getSystemInfoSync()
	const screenHeight = systemInfo.windowHeight
	const screenWidth = systemInfo.windowWidth
	
	// 根据屏幕高度动态计算图表高度
	// 小屏幕设备（高度 < 600px）使用较小高度
	// 大屏幕设备使用较大高度
	if (screenHeight < 600) {
		return '300rpx'
	} else if (screenHeight < 700) {
		return '350rpx'
	} else if (screenHeight < 800) {
		return '400rpx'
	} else {
		return '450rpx'
	}
}

const chartStyle = ref(`width: 100%; height: ${getChartHeight()};`)

// 放屁记录数据（已废弃，使用 summaryData 替代）
// const fartRecords = ref([])

// 类型映射
const typeNames = {
	loud: '响亮型',
	soft: '轻柔型',
	silent: '无声型'
}

// 气味等级映射
const smellLevels = {
	1: '清香',
	2: '一般',
	3: '浓烈'
}

// 心情映射
const moodNames = {
	happy: '开心',
	normal: '放松',
	sad: '尴尬'
}

const moodEmojis = {
	happy: '🤣',
	normal: '😐',
	sad: '😢'
}

// 每天24小时的数据（已废弃，使用 trendData 替代）
// const hourlyData = ref([])

// 统计数据计算（使用真实的API数据）
// 1. 总次数
const totalCount = computed(() => {
	return summaryData.value?.totalCount || 0
})

// 2. 最多的类型
const mostCommonType = computed(() => {
	return summaryData.value?.mostCommonType?.typeName || '响亮型'
})

// 3. 平均气味等级
const averageSmell = computed(() => {
	return summaryData.value?.averageSmell?.levelName || '一般'
})

// 4. 最常见心情
const mostCommonMood = computed(() => {
	const mood = summaryData.value?.mostCommonMood
	if (!mood) return { name: '开心', emoji: '🤣' }
	return {
		name: mood.moodName,
		emoji: mood.moodEmoji
	}
})

// 统计卡片数据（根据API数据生成）
const statsCards = computed(() => {
	return [
		{
			label: `${selectedPeriod.value}放屁次数`,
			value: `${totalCount.value} 💨`,
			icon: '☁️'
		},
		{
			label: '最多类型',
			value: `${mostCommonType.value} 💥`,
			icon: '🔊'
		},
		{
			label: '平均气味等级',
			value: `${averageSmell.value} 😷`,
			icon: '😖'
		},
		{
			label: '心情指数',
			value: `${mostCommonMood.value.name} ${mostCommonMood.value.emoji}`,
			icon: '😊'
		}
	]
})

// 屁型分布数据（使用API数据计算百分比）
const fartTypes = computed(() => {
	const dist = summaryData.value?.typeDistribution
	if (!dist) {
		return [
			{ name: '响亮型', percent: 0, colorClass: 'peach-segment' },
			{ name: '轻柔型', percent: 0, colorClass: 'blue-segment' },
			{ name: '无声型', percent: 0, colorClass: 'mint-segment' }
		]
	}
	
	const total = dist.loud + dist.soft + dist.silent
	if (total === 0) {
		return [
			{ name: '响亮型', percent: 0, colorClass: 'peach-segment' },
			{ name: '轻柔型', percent: 0, colorClass: 'blue-segment' },
			{ name: '无声型', percent: 0, colorClass: 'mint-segment' }
		]
	}
	
	return [
		{
			name: '响亮型',
			percent: Math.round((dist.loud / total) * 100),
			colorClass: 'peach-segment'
		},
		{
			name: '轻柔型',
			percent: Math.round((dist.soft / total) * 100),
			colorClass: 'blue-segment'
		},
		{
			name: '无声型',
			percent: Math.round((dist.silent / total) * 100),
			colorClass: 'mint-segment'
		}
	]
})

// 心情表情位置数据
const moodEmojiPositions = computed(() => [
	{ icon: '😊', top: '20rpx', left: '40rpx', size: '48rpx' },
	{ icon: '🤣', top: '60rpx', right: '60rpx', left: 'auto', size: '60rpx' },
	{ icon: '🌸', top: '200rpx', left: '25%', size: '48rpx' },
	{ icon: '😷', top: '160rpx', right: '33%', left: 'auto', size: '60rpx' },
	{ icon: '💀', top: '50%', left: '50%', size: '80rpx', transform: 'translate(-50%, -50%)' },
	{ icon: '😖', top: '240rpx', left: '50rpx', size: '48rpx' }
])

// 图表相关计算（已废弃）
// const maxValue = computed(() => 0)

// 时间段数据聚合（已废弃，使用 chartData 替代）
// const sampledData = computed(() => [])

// 确保数据连续性，避免区域线折断
const ensureDataContinuity = (data) => {
	if (!data || data.length === 0) return [0]
	// 确保所有值都是数字，将 null/undefined 转换为 0
	return data.map(val => (val === null || val === undefined || isNaN(val)) ? 0 : Number(val))
}

// 获取指定周期的图表配置
const getChartOption = (periodType) => {
	const { labels, data } = getChartData(periodType)
	const safeData = ensureDataContinuity(data)
	const safeLabels = labels.length > 0 ? labels : ['数据']
	
	return {
		grid: {
			left: '10%',
			right: '10%',
			bottom: '15%',
			top: '10%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: safeLabels,
			axisLine: {
				lineStyle: {
					color: 'rgba(138, 245, 191, 0.3)'
				}
			},
			axisLabel: {
				color: 'rgba(138, 245, 191, 0.8)',
				fontSize: 11,
				fontWeight: 'bold'
			},
			axisTick: {
				show: false
			}
		},
		yAxis: {
			type: 'value',
			min: 0, // 确保最小值从0开始，避免区域线折断
			axisLine: {
				show: false
			},
			axisTick: {
				show: false
			},
			axisLabel: {
				color: 'rgba(138, 245, 191, 0.6)',
				fontSize: 11
			},
			splitLine: {
				lineStyle: {
					color: 'rgba(138, 245, 191, 0.1)',
					type: 'dashed'
				}
			}
		},
		series: [{
			data: safeData,
			type: 'line',
			smooth: true,
			smoothMonotone: 'x',
			symbol: 'circle', // 显示数据点，便于调试
			symbolSize: 6,
			connectNulls: true, // 连接空值，避免折断
			itemStyle: {
				color: '#8af5bf',
				borderColor: '#fff',
				borderWidth: 2
			},
			lineStyle: {
				color: '#8af5bf',
				width: 2,
				shadowColor: 'rgba(138, 245, 191, 0.3)',
				shadowBlur: 8,
				shadowOffsetY: 3
			},
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(138, 245, 191, 0.3)' },
						{ offset: 1, color: 'rgba(138, 245, 191, 0.05)' }
					]
				}
			},
			emphasis: {
				focus: 'series',
				itemStyle: {
					color: '#5BCFA0',
					borderColor: '#fff',
					borderWidth: 3,
					shadowBlur: 10,
					shadowColor: 'rgba(138, 245, 191, 0.8)'
				}
			}
		}]
	}
}

// 当前显示的图表配置（用于兼容）
const chartOption = computed(() => {
	const typeMap = { '今日': 'day', '本周': 'week', '本月': 'month' }
	const periodType = typeMap[selectedPeriod.value]
	return getChartOption(periodType)
})

// 更新指定周期的图表数据
const updateChart = async (periodType) => {
	// 如果正在初始化，等待初始化完成
	if (isInitializing[periodType]) {
		return
	}
	
	const instance = chartInstances[periodType]
	if (!instance) {
		// 如果图表实例不存在，先初始化
		await initChart(periodType)
		return
	}
	
	try {
		// 等待数据更新完成
		await nextTick()
		
		// 获取该周期的图表配置
		const option = getChartOption(periodType)
		
		// 更新图表配置
		instance.setOption(option, {
			notMerge: false, // 合并配置，保留动画等状态
			lazyUpdate: false // 立即更新
		})
		
		// 延迟 resize 确保容器尺寸已更新
		setTimeout(() => {
			if (chartInstances[periodType]) {
				chartInstances[periodType].resize()
			}
		}, 150)
	} catch (error) {
		console.error(`更新${periodType}图表失败：`, error)
		// 如果更新失败，尝试重新初始化
		chartInstances[periodType] = null
		isInitialized[periodType] = false
		await initChart(periodType)
	}
}

// 初始化指定周期的图表
const initChart = async (periodType) => {
	// 如果已经初始化过，直接更新数据
	if (isInitialized[periodType] && chartInstances[periodType]) {
		await updateChart(periodType)
		return
	}
	
	// 如果正在初始化，直接返回
	if (isInitializing[periodType]) {
		return
	}
	
	// 设置初始化标志
	isInitializing[periodType] = true
	
	// 等待 DOM 渲染完成
	await nextTick()
	
	// 获取该周期的数据
	const { data } = getChartData(periodType)
	
	// 确保数据已准备好
	if (!data || data.length === 0) {
		console.warn(`${periodType}图表数据未准备好，延迟初始化`)
		isInitializing[periodType] = false
		// 如果数据一直未准备好，延迟后隐藏 loading（避免一直显示）
		setTimeout(() => {
			if (!isInitialized[periodType]) {
				chartLoading.value[periodType] = false
			}
		}, 3000)
		setTimeout(() => initChart(periodType), 300)
		return
	}
	
	setTimeout(async () => {
		// 根据周期类型获取对应的 ref
		const chartRef = periodType === 'day' ? dayChartRef.value : 
		                periodType === 'week' ? weekChartRef.value : 
		                monthChartRef.value
		
		if (!chartRef) {
			console.warn(`${periodType}图表 ref 未找到`)
			isInitializing[periodType] = false
			chartLoading.value[periodType] = false
			return
		}
		
		try {
			// 初始化图表，第二个参数可以传入回调
			const myChart = await chartRef.init(echarts, (chart) => {
				console.log(`${periodType}图表实例创建成功`, chart)
			})
			
			if (myChart) {
				// 保存图表实例
				chartInstances[periodType] = myChart
				isInitialized[periodType] = true
				isInitializing[periodType] = false
				
				// 获取该周期的图表配置
				const option = getChartOption(periodType)
				
				// 设置配置项
				myChart.setOption(option, {
					notMerge: true // 首次初始化不合并
				})
				console.log(`${periodType}图表初始化成功`)
				
				// 隐藏 loading（首次初始化完成后）
				chartLoading.value[periodType] = false
				
				// 确保图表适配容器大小
				setTimeout(() => {
					if (chartInstances[periodType]) {
						chartInstances[periodType].resize()
					}
				}, 200)
				
				// 监听窗口大小变化，重新调整图表大小
				uni.onWindowResize(() => {
					if (chartInstances[periodType]) {
						setTimeout(() => {
							chartInstances[periodType].resize()
						}, 100)
					}
				})
			} else {
				isInitializing[periodType] = false
			}
		} catch (error) {
			console.error(`${periodType}图表初始化失败：`, error)
			chartInstances[periodType] = null
			isInitialized[periodType] = false
			isInitializing[periodType] = false
			// 初始化失败时也隐藏 loading
			chartLoading.value[periodType] = false
		}
	}, 500)
}

// 防抖定时器
const updateTimers = {
	day: null,
	week: null,
	month: null
}

// 监听周期切换，初始化或显示对应图表
watch(selectedPeriod, async (newPeriod) => {
	const typeMap = { '今日': 'day', '本周': 'week', '本月': 'month' }
	const periodType = typeMap[newPeriod]
	
	// 检查该周期的数据是否已加载
	const cache = dataCache.value[periodType]
	if (!cache || !cache.trendData) {
		// 数据未加载，先加载数据（loadData 会处理图表初始化）
		return
	}
	
	// 如果该周期的图表未初始化，先初始化
	if (!isInitialized[periodType]) {
		chartLoading.value[periodType] = true
		await initChart(periodType)
	} else {
		// 已初始化，更新数据
		await updateChart(periodType)
	}
})

// 监听数据缓存变化，更新对应周期的图表
watch(() => dataCache.value, () => {
	// 更新所有已初始化的图表
	Object.keys(chartInstances).forEach(periodType => {
		if (isInitialized[periodType] && chartInstances[periodType]) {
			// 清除之前的定时器
			if (updateTimers[periodType]) {
				clearTimeout(updateTimers[periodType])
			}
			
			// 防抖：延迟更新，避免短时间内多次更新
			updateTimers[periodType] = setTimeout(() => {
				updateChart(periodType)
				updateTimers[periodType] = null
			}, 100)
		}
	})
}, { deep: true })

// 生命周期
onMounted(() => {
	// 检查是否已经有 token（已登录状态）
	// 从 userStore 中读取 token，而不是从 storage
	const userStore = useUserStore()
	if (userStore.token) {
		console.log('已有 token，直接加载数据')
		// 加载数据，数据加载完成后会自动初始化图表
		loadData()
	} else {
		console.log('暂无 token，等待登录完成...')
	}
	
	// 监听登录成功事件
	uni.$on('loginSuccess', onLoginSuccess)
	
	// 监听放屁记录添加事件
	uni.$on('fartRecordAdded', () => {
		console.log('收到放屁记录添加事件，刷新数据')
		clearAllCache()
		loadData(true)
	})
})

// 登录成功回调
const onLoginSuccess = () => {
	console.log('收到 loginSuccess 事件，开始加载数据')
	loadData()
}

// 页面卸载时移除事件监听和清理图表实例
onUnmounted(() => {
	uni.$off('loginSuccess', onLoginSuccess)
	uni.$off('fartRecordAdded')
	
	// 清除所有防抖定时器
	Object.keys(updateTimers).forEach(periodType => {
		if (updateTimers[periodType]) {
			clearTimeout(updateTimers[periodType])
			updateTimers[periodType] = null
		}
	})
	
	// 清理所有图表实例
	Object.keys(chartInstances).forEach(periodType => {
		if (chartInstances[periodType]) {
			chartInstances[periodType].dispose && chartInstances[periodType].dispose()
			chartInstances[periodType] = null
		}
		isInitialized[periodType] = false
		isInitializing[periodType] = false
	})
	
	// 重置 loading 状态
	chartLoading.value = {
		day: true,
		week: false,
		month: false
	}
})

// 检查缓存是否有效
const isCacheValid = (statType) => {
	const cache = dataCache.value[statType]
	if (!cache.trendData || !cache.summaryData) return false
	return (Date.now() - cache.timestamp) < CACHE_DURATION
}

// 从缓存加载数据
const loadFromCache = (statType) => {
	const cache = dataCache.value[statType]
	trendData.value = cache.trendData
	summaryData.value = cache.summaryData
	console.log(`从缓存加载${statType}数据`)
}

// 保存数据到缓存
const saveToCache = (statType, trendDataValue, summaryDataValue) => {
	dataCache.value[statType] = {
		trendData: trendDataValue,
		summaryData: summaryDataValue,
		timestamp: Date.now()
	}
	console.log(`保存${statType}数据到缓存`)
}

// 清除所有缓存
const clearAllCache = () => {
	dataCache.value = {
		day: { trendData: null, summaryData: null, timestamp: 0 },
		week: { trendData: null, summaryData: null, timestamp: 0 },
		month: { trendData: null, summaryData: null, timestamp: 0 }
	}
	console.log('清除所有数据缓存')
}

// 方法
const loadData = async (forceRefresh = false) => {
	try {
		// 获取统计类型
		const typeMap = { '今日': 'day', '本周': 'week', '本月': 'month' }
		const statType = typeMap[selectedPeriod.value]
		
		// 检查缓存，如果有效且不强制刷新，则使用缓存
		if (!forceRefresh && isCacheValid(statType)) {
			loadFromCache(statType)
			// 等待数据更新后初始化或更新图表
			await nextTick()
			if (!isInitialized[statType]) {
				// 首次加载，初始化图表
				chartLoading.value[statType] = true
				await initChart(statType)
			} else {
				// 已初始化，更新图表
				updateChart(statType)
			}
			return
		}
		
		// uni.showLoading({ title: '加载中...' })
		
		// 并发请求趋势数据和统计小结
		const [trendRes, summaryRes] = await Promise.all([
			getTrendDataAPI(statType),
			getStatisticsSummaryAPI(statType)
		])
		
		let newTrendData = null
		let newSummaryData = null
		
		if (trendRes.data.code === 0) {
			newTrendData = trendRes.data.data
			trendData.value = newTrendData
			console.log('趋势数据:', newTrendData)
		}
		
		if (summaryRes.data.code === 0) {
			newSummaryData = summaryRes.data.data
			summaryData.value = newSummaryData
			console.log('统计小结:', newSummaryData)
		}
		
		// 保存到缓存
		if (newTrendData && newSummaryData) {
			saveToCache(statType, newTrendData, newSummaryData)
		}
		
		uni.hideLoading()
		
		// 等待数据更新后初始化或更新图表
		await nextTick()
		if (!isInitialized[statType]) {
			// 首次加载，初始化图表
			chartLoading.value[statType] = true
			await initChart(statType)
		} else {
			// 已初始化，更新图表
			updateChart(statType)
		}
	} catch (error) {
		console.error('加载数据失败:', error)
		uni.hideLoading()
		uni.showToast({ title: '加载失败', icon: 'none' })
	}
}

// 切换周期
const changePeriod = (period) => {
	if (selectedPeriod.value === period) return
	selectedPeriod.value = period
	loadData() // 使用缓存，不强制刷新
}

// u-subsection 切换事件
const onPeriodChange = (index) => {
	currentPeriodIndex.value = index
	const period = periods.value[index]
	changePeriod(period)
}

// 添加新记录（已废弃）
// const addFartRecord = (record) => {}

// 暴露方法供外部调用
defineExpose({
	clearAllCache,
	loadData: (forceRefresh = true) => loadData(forceRefresh)
})
</script>

<style scoped>
/* 容器 */
.container {
	height: 100vh;
	background-color: #f6f8f7;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* 滚动内容区域 */
.scroll-content {
	flex: 1;
	height: 0; /* 重要：让 flex 子元素正确计算高度 */
	overflow-y: auto;
	-webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
	/* 优化滚动性能 */
	will-change: scroll-position;
	/* 确保内容区域有足够的空间 */
	min-height: 0;
}

/* 动画 */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(50rpx) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}


.fade-in {
	animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}


/* Header with Gradient */
.header-gradient {
	background: linear-gradient(to bottom, #d4f1f4 0%, #fffacd 100%);
	padding: 28rpx;
	padding-bottom: 16rpx;
	flex-shrink: 0; /* 防止被压缩 */
}

.header-content {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	padding-top: 45rpx;
}

.title {
	color: #0d1b14;
	font-size: 32rpx;
	font-weight: bold;
	line-height: 1.2;

}

.subtitle {
	color: rgba(13, 27, 20, 0.8);
	font-size: 28rpx;
	padding-bottom: 24rpx;

}

/* Period Selector */
.period-selector {
	background: linear-gradient(to bottom, #fffacd 0%, #f6f8f7 100%);
	padding: 20rpx 28rpx;
	flex-shrink: 0; /* 防止被压缩 */
}





/* Chart Card */
.chart-card {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	
	margin: 20rpx;	
	background-color: #f6f8f7;
	border: 2rpx solid rgba(138, 245, 191, 0.2);
	border-radius: 32rpx;
	padding: 20rpx 0;
	/* 响应式间距 */
	flex-shrink: 0;
}

.chart-title {
	color: #0d1b14;
	font-size: 28rpx;
	font-weight: 600;
	margin-left: 20rpx;
	margin-top: 0;
	margin-bottom: 10rpx;
}

/* Trend Chart - ECharts */
.trend-chart-echart {
	position: relative;
	width: 100%;
	min-height: 300rpx;
	max-height: 500rpx;
	border-radius: 16rpx;
	overflow: visible; /* 改为 visible，避免裁剪图表内容 */
	/* 确保图表容器有明确的定位上下文 */
	z-index: 1;
	/* 响应式高度调整 */
	height: auto;
	/* 确保容器有明确的尺寸 */
	box-sizing: border-box;
}

/* 图表 Loading 遮罩层 */
.chart-loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: rgba(246, 248, 247, 0.9);
	border-radius: 16rpx;
	z-index: 10;
}

/* Loading 旋转动画 */
.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid rgba(138, 245, 191, 0.2);
	border-top-color: #8af5bf;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.loading-text {
	color: rgba(13, 27, 20, 0.6);
	font-size: 24rpx;
	font-weight: 500;
}

/* 临时数据显示 */
.trend-data-display {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 20rpx 20rpx;
	background: linear-gradient(to bottom, rgba(138, 245, 191, 0.05) 0%, rgba(138, 245, 191, 0) 100%);
	border-radius: 16rpx;
}

.data-point-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.data-time {
	color: rgba(138, 245, 191, 0.8);
	font-size: 24rpx;
	font-weight: bold;
}

.data-value {
	color: #0d1b14;
	font-size: 28rpx;
	font-weight: bold;
	padding: 12rpx 20rpx;
	background: rgba(138, 245, 191, 0.2);
	border-radius: 12rpx;
}



/* AI Summary Card */
.ai-card {
	position: relative;
	padding: 20rpx;
	margin: 0 20rpx 40rpx 20rpx;
	background: linear-gradient(135deg, #FFDAB9 0%, #A7C7E7 100%);
	border-radius: 32rpx;
	overflow: hidden;
	/* 响应式调整 */
	flex-shrink: 0;
}

.ai-header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.ai-icon {
	width: 48rpx;
	height: 48rpx;
}

.ai-title {
	color: #0d1b14;
	font-size: 28rpx;
	font-weight: bold;
}

.ai-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.ai-item {
	color: rgba(13, 27, 20, 0.8);
	font-size: 28rpx;

}

.ai-highlight {
	font-weight: bold;
	color: #0d1b14;
}

.ai-bg-icon {
	position: absolute;
	right: -48rpx;
	bottom: -48rpx;
	font-size: 256rpx;
	opacity: 0.1;
	transform: rotate(15deg);
}

/* 响应式媒体查询 */
@media screen and (max-height: 600px) {
	/* 小屏幕设备优化 */
	.header-gradient {
		padding: 20rpx;
		padding-bottom: 12rpx;
	}
	
	.header-content {
		padding-top: 30rpx;
	}
	
	.title {
		font-size: 28rpx;
	}
	
	.subtitle {
		font-size: 24rpx;
	}
	
	.period-selector {
		padding: 16rpx 20rpx;
	}
	
	.chart-card {
		margin: 16rpx;
		gap: 16rpx;
	}
	
	.chart-title {
		font-size: 24rpx;
		margin-left: 16rpx;
	}
	
	.trend-chart-echart {
		min-height: 250rpx;
		max-height: 350rpx;
	}
	
	.ai-card {
		margin: 0 16rpx 30rpx 16rpx;
		padding: 16rpx;
	}
	
	.ai-header {
		gap: 16rpx;
		margin-bottom: 20rpx;
	}
	
	.ai-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.ai-title {
		font-size: 24rpx;
	}
	
	.ai-item {
		font-size: 24rpx;
	}
}

@media screen and (min-height: 800px) {
	/* 大屏幕设备优化 */
	.trend-chart-echart {
		min-height: 400rpx;
		max-height: 600rpx;
	}
	
	.chart-card {
		gap: 24rpx;
	}
	
	.ai-card {
		margin-bottom: 60rpx;
	}
}

/* 超小屏幕设备特殊优化 */
@media screen and (max-height: 500px) {
	.header-gradient {
		padding: 16rpx;
		padding-bottom: 8rpx;
	}
	
	.header-content {
		padding-top: 20rpx;
		gap: 4rpx;
	}
	
	.title {
		font-size: 24rpx;
	}
	
	.subtitle {
		font-size: 20rpx;
		padding-bottom: 16rpx;
	}
	
	.period-selector {
		padding: 12rpx 16rpx;
	}
	
	.chart-card {
		margin: 12rpx;
		gap: 12rpx;
		padding: 12rpx 0;
	}
	
	.chart-title {
		font-size: 20rpx;
		margin-left: 12rpx;
		margin-bottom: 8rpx;
	}
	
	.trend-chart-echart {
		min-height: 200rpx;
		max-height: 280rpx;
	}
	
	.trend-data-display {
		padding: 0rpx 12rpx;
	}
	
	.data-time {
		font-size: 20rpx;
	}
	
	.data-value {
		font-size: 22rpx;
		padding: 8rpx 16rpx;
	}
	
	.ai-card {
		margin: 0 12rpx 20rpx 12rpx;
		padding: 12rpx;
	}
	
	.ai-header {
		gap: 12rpx;
		margin-bottom: 16rpx;
	}
	
	.ai-icon {
		width: 32rpx;
		height: 32rpx;
	}
	
	.ai-title {
		font-size: 20rpx;
	}
	
	.ai-item {
		font-size: 20rpx;
	}
	
	.ai-content {
		gap: 12rpx;
	}
}
</style>