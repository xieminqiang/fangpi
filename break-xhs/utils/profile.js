/**
 * 个人中心 - 用户数据映射
 */
const DEFAULT_AVATAR =
  'https://sbx-server.oss-cn-shenzhen.aliyuncs.com/fp-wx/uploads/default-avatar.png';

function mapUserInfo(user) {
  if (!user || typeof user !== 'object') {
    return {
      nickname: '新手屁屁',
      avatarUrl: DEFAULT_AVATAR,
      totalFarts: 0,
      experience: 0,
      levelName: ''
    };
  }
  return {
    nickname: user.nickname || '新手屁屁',
    avatarUrl: user.avatar || DEFAULT_AVATAR,
    totalFarts: user.totalFarts != null ? user.totalFarts : 0,
    experience: user.experience != null ? user.experience : 0,
    levelName: user.levelName || ''
  };
}

module.exports = {
  DEFAULT_AVATAR,
  mapUserInfo
};
