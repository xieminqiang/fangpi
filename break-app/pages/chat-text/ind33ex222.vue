<template>
	<view class="chat-index-container">
		<!-- 页面标题 -->
		<view class="page-header">
	<!-- 		<text class="header-title">AI健康助手</text>
			<text class="header-subtitle">选择一位助手开始聊天</text> -->
		</view>

		<!-- 角色列表 -->
		<view class="role-list">
			<view 
				v-for="role in roleList" 
				:key="role.id" 
				class="role-card"
				@click="selectRole(role)"
			>
				<view class="role-avatar">{{ role.avatar }}</view>
				<view class="role-info">
					<view class="role-name">{{ role.name }}</view>
					<view class="role-description">{{ role.description }}</view>
					<view class="role-tags">
						<text 
							v-for="(tag, index) in role.tags" 
							:key="index" 
							class="role-tag"
						>{{ tag }}</text>
					</view>
				</view>
				<view class="role-arrow">
					<text class="arrow-icon">→</text>
				</view>
			</view>
		</view>

		<!-- 使用说明 -->
		<view class="usage-tips">
		<!-- 	<view class="tips-title">💡 使用小贴士</view>
			<view class="tips-item">• 屁屁精灵：轻松幽默，适合日常健康咨询</view>
			<view class="tips-item">• 肠博士：专业严谨，适合深度健康问题</view> -->
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAiChatRolesAPI } from '@/src/api/ai.js'

const roleList = ref([])

// 获取角色列表
const getRoleList = async () => {
	try {
		uni.showLoading({ title: '加载中...' })
		const res = await getAiChatRolesAPI()
		
		if (res.data.code === 0) {
			roleList.value = res.data.data || []
		} else {
			uni.showToast({
				title: res.msg || '获取角色列表失败',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('获取角色列表失败:', error)
		uni.showToast({
			title: '网络错误',
			icon: 'none'
		})
	} finally {
		uni.hideLoading()
	}
}

// 选择角色
const selectRole = (role) => {
	uni.navigateTo({
		url: `/pages/chat/chat?roleId=${role.id}&roleName=${role.name}&roleAvatar=${role.avatar}`
	})
}

onMounted(() => {
	getRoleList()
})
</script>

<style lang="scss" scoped>
.chat-index-container {
	min-height: 100vh;
	background: linear-gradient(to bottom, #f8f9fa, #ffffff);
	padding: 20rpx;
}

.page-header {
	text-align: center;
	padding: 60rpx 0 40rpx;
	
	.header-title {
		display: block;
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
	}
	
	.header-subtitle {
		font-size: 28rpx;
		color: #999;
	}
}

.role-list {
	padding: 0 20rpx;
}

.role-card {
	display: flex;
	align-items: center;
	background: white;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s;
	
	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
	}
}

.role-avatar {
	font-size: 80rpx;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.role-info {
	flex: 1;
}

.role-name {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 12rpx;
}

.role-description {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 16rpx;
}

.role-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.role-tag {
	display: inline-block;
	padding: 6rpx 16rpx;
	background: #f0f7ff;
	color: #1890ff;
	font-size: 22rpx;
	border-radius: 8rpx;
}

.role-arrow {
	margin-left: 16rpx;
	
	.arrow-icon {
		font-size: 40rpx;
		color: #999;
	}
}

.usage-tips {
	margin-top: 60rpx;
	padding: 32rpx;
	background: #fff8e1;
	border-radius: 24rpx;
	border: 2rpx dashed #ffd54f;
}

.tips-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #f57c00;
	margin-bottom: 20rpx;
}

.tips-item {
	font-size: 26rpx;
	color: #666;
	line-height: 2;
	padding-left: 8rpx;
}
</style>
