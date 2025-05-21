import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as string | null, // Account_Id
    token: null as string | null, // 认证Token
    positionId: null as string | null, // 用户角色ID
    positionName: '', // 用户角色名称
    isLoggedIn: false, // 登录状态
    tokenExpiresIn: null as null | number, // Token过期时间（秒）
    tokenExpirationTime: null as null | number, // Token过期时间（绝对时间）
  }),
  actions: {
    // 登录成功后调用此方法
    loginSuccess(token: string, accountId: string, positionId: string, positionName: string, expiresIn: number) {
      this.token = token;
      this.id = accountId;
      this.positionId = positionId;
      // 将 positionName 转换为英文
      this.positionName = this.mapPositionName(positionName);
      this.isLoggedIn = true;
      this.tokenExpiresIn = expiresIn;
      this.tokenExpirationTime = Date.now() + expiresIn * 1000;
    },
    // 登出时调用此方法
    logout() {
      this.token = null;
      this.id = null;
      this.positionId = null;
      this.positionName = '';
      this.isLoggedIn = false;
      this.tokenExpiresIn = null;
      this.tokenExpirationTime = null;
    },
    // 检查Token是否过期
    isTokenExpired() {
      if (!this.isLoggedIn || !this.tokenExpirationTime) {
        return true; // 未登录或没有过期时间，视为过期
      }
      return Date.now() >= this.tokenExpirationTime;
    },
    // 角色名称映射
    mapPositionName(chineseName: string): string {
      const positionMap = {
        '管理员': 'admin',
        '教师': 'teacher',
        '学生': 'student',
      };
      return positionMap[chineseName as keyof typeof positionMap] || 'default';
    },
  }
});