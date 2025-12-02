-- Break App 数据库初始化脚本
-- 创建所有需要的表（去掉表情符号，降低难度）
-- 执行时间: 2025-10-17

SET NAMES utf8mb4;

-- ============================================
-- 1. 放屁记录表
-- ============================================
DROP TABLE IF EXISTS `break_fart_record`;
CREATE TABLE `break_fart_record` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) DEFAULT NULL COMMENT '删除时间',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `fart_type` varchar(20) NOT NULL COMMENT '屁屁类型：loud-响亮型，soft-轻柔型，silent-无声型',
  `smell_level` int NOT NULL COMMENT '气味等级：1-清香，2-一般，3-浓烈',
  `mood` varchar(20) NOT NULL COMMENT '心情：happy-开心，normal-一般，embarrassed-尴尬',
  `note` varchar(500) DEFAULT NULL COMMENT '备注（饮食、心情描述）',
  `fart_date` date NOT NULL COMMENT '放屁日期',
  `fart_time` time NOT NULL COMMENT '放屁时间',
  `hour_of_day` int NOT NULL COMMENT '小时（0-23），用于统计',
  `time_period` varchar(10) NOT NULL COMMENT '时间段：dawn-凌晨，morning-上午，afternoon-下午，evening-晚上',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_fart_date` (`fart_date`),
  KEY `idx_user_date` (`user_id`, `fart_date`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='放屁档案-放屁记录表';

-- ============================================
-- 2. 成就配置表
-- ============================================
DROP TABLE IF EXISTS `break_achievement`;
CREATE TABLE `break_achievement` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '成就ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) DEFAULT NULL COMMENT '删除时间',
  `achievement_code` varchar(50) NOT NULL COMMENT '成就编码',
  `achievement_name` varchar(100) NOT NULL COMMENT '成就名称',
  `achievement_desc` varchar(500) DEFAULT NULL COMMENT '成就描述',
  `achievement_icon` varchar(500) DEFAULT NULL COMMENT '成就图标',
  `achievement_emoji` varchar(10) DEFAULT NULL COMMENT '成就emoji',
  `unlock_condition` json DEFAULT NULL COMMENT '解锁条件（JSON格式）',
  `reward_exp` int DEFAULT 0 COMMENT '奖励经验值',
  `sort_order` int DEFAULT 0 COMMENT '排序',
  `status` int DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`achievement_code`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='放屁档案-成就配置表';

-- 初始化成就数据
INSERT INTO `break_achievement` (`achievement_code`, `achievement_name`, `achievement_desc`, `achievement_emoji`, `unlock_condition`, `reward_exp`, `sort_order`, `status`) VALUES
('first_loud', '初次放响', '完成第一次响亮型记录', '💨', '{"type":"fart_type_count","fart_type":"loud","count":1}', 10, 1, 1),
('first_soft', '温柔一刻', '完成第一次轻柔型记录', '🌬️', '{"type":"fart_type_count","fart_type":"soft","count":1}', 10, 2, 1),
('first_silent', '无声胜有声', '完成第一次无声型记录', '💨', '{"type":"fart_type_count","fart_type":"silent","count":1}', 10, 3, 1),
('fragrant_master', '香香代表', '记录30次清香气味', '🌸', '{"type":"smell_level_count","smell_level":1,"count":30}', 50, 4, 1),
('happy_farter', '开心放放', '记录50次开心心情', '🤣', '{"type":"mood_count","mood":"happy","count":50}', 100, 5, 1),
('stink_master', '臭气大师', '记录50次浓烈气味', '💀', '{"type":"smell_level_count","smell_level":3,"count":50}', 200, 6, 1),
('rookie_100', '百屁新人', '累计记录达到100次', '🎯', '{"type":"total_farts","count":100}', 100, 7, 1),
('veteran_300', '屁界老司机', '累计记录达到300次，已经是放屁界的老司机了！', '🚗', '{"type":"total_farts","count":300}', 300, 8, 1),
('continuous_7', '七日连击', '连续7天都有记录，七日连击达成！', '⚡', '{"type":"continuous_days","days":7}', 150, 9, 1),
('continuous_30', '月度坚持王', '连续30天都有记录，月度坚持王非你莫属！', '👑', '{"type":"continuous_days","days":30}', 500, 10, 1);

-- ============================================
-- 3. 用户成就表
-- ============================================
DROP TABLE IF EXISTS `break_user_achievement`;
CREATE TABLE `break_user_achievement` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) DEFAULT NULL COMMENT '删除时间',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `achievement_id` bigint unsigned NOT NULL COMMENT '成就ID',
  `achievement_code` varchar(50) NOT NULL COMMENT '成就编码',
  `unlock_time` datetime NOT NULL COMMENT '解锁时间',
  `is_viewed` int DEFAULT 0 COMMENT '是否已查看：0-未查看，1-已查看',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_unlock_time` (`unlock_time`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='放屁档案-用户成就表';

-- ============================================
-- 4. 等级配置表（优化版：添加打卡天数，降低难度）
-- ============================================
DROP TABLE IF EXISTS `break_level_config`;
CREATE TABLE `break_level_config` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) DEFAULT NULL COMMENT '删除时间',
  `level` int NOT NULL COMMENT '等级',
  `level_name` varchar(50) NOT NULL COMMENT '等级名称',
  `level_emoji` varchar(10) DEFAULT NULL COMMENT '等级emoji',
  `level_image` varchar(500) DEFAULT NULL COMMENT '等级图片URL',
  `required_exp` int NOT NULL COMMENT '所需经验值',
  `required_farts` int NOT NULL COMMENT '所需放屁次数',
  `required_days` int NOT NULL DEFAULT 0 COMMENT '所需打卡天数（防止刷级）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_level` (`level`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='放屁档案-等级配置表';

-- 初始化等级配置（降低难度，去掉名称中的表情符号）
INSERT INTO `break_level_config` (`level`, `level_name`, `level_emoji`, `required_exp`, `required_farts`, `required_days`) VALUES
(1, '新手屁民', '🍼', 0, 0, 0),
(2, '见习屁师', '🌱', 30, 30, 3),      -- 需要3天打卡
(3, '熟练屁匠', '🔥', 80, 80, 7),      -- 需要7天打卡
(4, '专业屁王', '👑', 150, 150, 15),   -- 需要15天打卡
(5, '传说屁神', '⭐', 300, 300, 30),   -- 需要30天打卡
(6, '终极屁宗', '💫', 600, 600, 60);   -- 需要60天打卡

-- ============================================
-- 5. 用户打卡天数统计表（用于防止刷级）
-- ============================================
DROP TABLE IF EXISTS `break_user_checkin_days`;
CREATE TABLE `break_user_checkin_days` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `checkin_date` date NOT NULL COMMENT '打卡日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `checkin_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_checkin_date` (`checkin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='放屁档案-用户打卡天数表';

-- ============================================
-- 验证表创建
-- ============================================
SHOW TABLES LIKE 'break_%';

-- 查看等级配置
SELECT level, level_name, level_emoji, required_exp, required_farts, required_days 
FROM break_level_config 
ORDER BY level;

-- 查看成就配置
SELECT achievement_code, achievement_name, achievement_emoji, reward_exp 
FROM break_achievement 
ORDER BY sort_order;

