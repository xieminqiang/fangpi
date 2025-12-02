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
				<!-- 图表组件 -->
				<view class="trend-chart-echart">
					<l-echart 
						ref="trendChartRef" 
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
					<text class="ai-item">{{ selectedPeriod }}共记录 <text class="ai-highlight">{{ totalCount }}</text> 次，排气频率适中 💫</text>
					<text class="ai-item">{{ mostCommonType }}占比最高，平均气味为{{ averageSmell }}～💧</text>
					<text class="ai-item">整体心情{{ mostCommonMood.name }}，保持愉快状态 {{ mostCommonMood.emoji }}</text>
				</view>
				<text class="ai-bg-icon">☁️</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

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

// ECharts 图表引用
const trendChartRef = ref(null)

// 根据真实数据动态计算图表数据和标签
const chartLabels = computed(() => {
	if (!trendData.value) return ['凌晨', '上午', '下午', '晚上']
	
	if (trendData.value.type === 'day') {
		return ['凌晨', '上午', '下午', '晚上']
	} else if (trendData.value.type === 'week') {
		// 将日期标签转换为周一到周日
		return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
	} else if (trendData.value.type === 'month') {
		// 将月标签改为月初、月中、月底
		return ['月初', '月中', '月底']
	}
	return []
})

const chartData = computed(() => {
	if (!trendData.value) return [0, 0, 0, 0]
	
	if (trendData.value.type === 'day') {
		const tp = trendData.value.timePeriodData || {}
		return [tp.dawn || 0, tp.morning || 0, tp.afternoon || 0, tp.evening || 0]
	} else if (trendData.value.type === 'week') {
		return trendData.value.weekData || []
	} else if (trendData.value.type === 'month') {
		// 后端已经返回3个时间段的数据（月初、月中、月底）
		return trendData.value.monthData || []
	}
	return []
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

// ECharts 配置项
const chartOption = computed(() => ({
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
		data: chartLabels.value,
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
		data: chartData.value,
		type: 'line',
		smooth: true,
		smoothMonotone: 'x',
		symbol: 'none',
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
}))

// 初始化图表
const initChart = async () => {
	// 等待 DOM 渲染完成
	await nextTick()
	
	setTimeout(async () => {
		if (!trendChartRef.value) {
			console.warn('图表 ref 未找到')
			return
		}
		try {
			// 初始化图表，第二个参数可以传入回调
			const myChart = await trendChartRef.value.init(echarts, (chart) => {
				console.log('图表实例创建成功', chart)
			})
			
			if (myChart) {
				// 设置配置项
				myChart.setOption(chartOption.value)
				console.log('图表初始化成功')
				
				// 确保图表适配容器大小
				setTimeout(() => {
					myChart.resize()
				}, 100)
				
				// 监听窗口大小变化，重新调整图表大小
				uni.onWindowResize(() => {
					setTimeout(() => {
						myChart.resize()
					}, 100)
				})
			}
		} catch (error) {
			console.error('图表初始化失败：', error)
		}
	}, 800)
}

// 生命周期
onMounted(() => {
	// 检查是否已经有 token（已登录状态）
	// 从 userStore 中读取 token，而不是从 storage
	const userStore = useUserStore()
	if (userStore.token) {
		console.log('已有 token，直接加载数据')
		// 可以在这里加载真实数据
		loadData()
	} else {
		console.log('暂无 token，等待登录完成...')
	}
	
	// 初始化图表
	initChart()
	
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

// 页面卸载时移除事件监听
onUnmounted(() => {
	uni.$off('loginSuccess', onLoginSuccess)
	uni.$off('fartRecordAdded')
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
			// 更新图表
			initChart()
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
		
		// 更新图表
		initChart()
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
	overflow: hidden;
	/* 确保图表容器有明确的定位上下文 */
	z-index: 1;
	/* 响应式高度调整 */
	height: auto;
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