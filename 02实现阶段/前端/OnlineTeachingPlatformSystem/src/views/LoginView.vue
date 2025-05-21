<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'; // 引入 Pinia 用户存储
import { fetchCaptcha, loginApi } from '@/api/data';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const loginFormRef = ref();
    const canGetCaptcha = ref(false);
    const hasGottenCaptcha = ref(false); // 标志变量
    const isCaptchaValid = ref(false);
    const imageUrl = ref('');
    const code = ref('');
    const isLoginDataValid = ref(false);
    const userStore = useUserStore(); // 获取 Pinia 用户存储实例

    // 登录表单数据
    const loginData = reactive({
      identifier: '',
      password: '',
      captcha: '',
      remember: false,
      type: '' as 'Email' | 'Phone', // 新增 type 字段
    });

    // 验证邮箱或手机号
    const validateIdentifier = (rule: any, value: string, callback: any) => {
      const emailRegex = /^[^\s@]+@(qq|gmail|163|126|yeah|sina|sohu|hotmail|outlook|yahoo)\.com$/;
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        callback(new Error('请输入有效的邮箱或手机号'));
      } else {
        loginData.type = emailRegex.test(value) ? 'Email' : 'Phone';
        callback();
      }
    };

    // 验证规则
    const loginRules = reactive({
      identifier: [
        { required: true, message: '请输入邮箱或手机号', trigger: 'blur' },
        { validator: validateIdentifier, trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
        { max: 50, message: '密码长度不能超过50个字符', trigger: 'blur' },
      ],
      captcha: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
      ],
    });

    // 判断是否可以获取验证码
    const validateForCaptcha = () => {
      loginFormRef.value.validateField('identifier', (correct: any) => {
        hasGottenCaptcha.value = false; // 重置标志变量
        if (correct) {
          canGetCaptcha.value = true;
        } else {
          canGetCaptcha.value = false;
        }
      });
    };

    // 获取验证码
    const getCaptcha = async () => {
      try {
        const response = await fetchCaptcha(loginData.identifier);
        if (response.code == 200) {
          imageUrl.value = response.data.imageUrl;
          code.value = response.data.code;
          isCaptchaValid.value = true;
          ElMessage.success(response.message);
        }
        else {
          isCaptchaValid.value = false;
          ElMessage.error(response.message);
        }
      } catch (error) {
        ElMessage.error('获取验证码失败，请稍后再试');
      }
    };

    watch(canGetCaptcha, (newVal) => {
      if (newVal && !hasGottenCaptcha.value) {
        getCaptcha();
        hasGottenCaptcha.value = true; // 设置标志为已获取验证码
      }
    });

    // 刷新验证码
    const refreshCaptcha = async () => {
      if (!canGetCaptcha.value) {
        ElMessage.info('请先输入邮箱或手机号');
        return;
      }
      if (!isCaptchaValid.value) {
        ElMessage.info('请先获取验证码');
        return;
      }
      try {
        const response = await fetchCaptcha(loginData.identifier);
        if (response.code == 200) {
          imageUrl.value = response.data.imageUrl;
          code.value = response.data.code;
          isCaptchaValid.value = true;
          ElMessage.success(response.message);
        }
        else {
          isCaptchaValid.value = false;
          ElMessage.error(response.message);
        }
      } catch (error) {
        ElMessage.error('刷新验证码失败，请稍后再试');
      }
    };

    // 检查验证码
    const checkCaptcha = () => {
      if (loginData.captcha === code.value) {
        isLoginDataValid.value = true;
        ElMessage.success('验证码正确');
      }
      else {
        isLoginDataValid.value = false;
        ElMessage.error('验证码错误，请重新输入');
      }
    };

    // 登录逻辑
    const login = async () => {
      loginFormRef.value.validate(async (valid: any) => {
        if (valid) {
          try {
            // 调用封装好的登录 API
            const response = await loginApi({
              identifier: loginData.identifier,
              password: loginData.password,
              captcha: loginData.captcha,
              type: loginData.type, // 传递 type
            });

            if (response.code === 200) {
              const { token, accountId, positionId, positionName, expiresIn } = response.data;
              // 将 token、accountId、角色信息和过期时间存储到 Pinia
              userStore.loginSuccess(token, accountId, positionId, positionName, expiresIn);
              ElMessage.success('登录成功');
              router.push('/'); // 跳转到首页
            } else {
              ElMessage.error(response.message);
              refreshCaptcha(); // 登录失败刷新验证码
            }
          } catch (error) {
            ElMessage.error('登录失败，请检查邮箱/手机号、密码和验证码');
            refreshCaptcha(); // 登录失败刷新验证码
          }
        }
      });
    };

    return {
      loginFormRef,
      loginData,
      loginRules,
      validateForCaptcha,
      login,
      refreshCaptcha,
      canGetCaptcha,
      getCaptcha,
      isCaptchaValid,
      imageUrl,
      checkCaptcha,
      isLoginDataValid,
    };
  },
});
</script>

<template>
  <el-card shadow="never" class="login-card">
    <el-card>
      <el-container>
        <el-header class="login-header">
          <el-row>
            <el-col class="login-title">
              登录中心
            </el-col>
          </el-row>
          <el-divider content-position="right">
            欢迎使用在线教学平台
          </el-divider>
        </el-header>
        <el-main class="login-main">
          <el-card class="login-content" shadow="never">
            <el-card class="login-form" shadow="never">
              <el-form
                ref="loginFormRef"
                label-width="120px"
                label-position="right"
                :model="loginData"
                :rules="loginRules"
                @submit.prevent
              >
                <el-form-item label="邮箱/手机号" prop="identifier">
                  <el-input
                    v-model="loginData.identifier"
                    maxlength="255"
                    placeholder="请输入邮箱或手机号"
                    clearable
                    prefix-icon="user"
                    @change="validateForCaptcha"
                  />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="loginData.password"
                    maxlength="60"
                    placeholder="请输入密码"
                    show-password
                    clearable
                    prefix-icon="lock"
                  />
                </el-form-item>
                <el-form-item v-if="!isCaptchaValid" width="32px">请先输入邮箱或手机号以获取验证码</el-form-item>
                <el-form-item v-if="isCaptchaValid" label="验证码" prop="captcha">
                  <el-row class="captcha" :gutter="10">
                    <el-col :span="16">
                      <el-input
                        v-model="loginData.captcha"
                        placeholder="请输入验证码"
                        clearable
                        @change="checkCaptcha"
                      />
                    </el-col>
                    <el-col :span="8">
                      <img :src="`data:image/png;base64,${imageUrl}`" alt="验证码" class="captcha-image" @click="refreshCaptcha" />
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-form>
              <el-row :gutter="50">
                <el-col :span="24">
                  <el-button
                    type="primary"
                    class="login-button"
                    @click="login"
                    :disabled="!isLoginDataValid"
                  >
                    登录
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <router-link to="/register">
                    没有账号？前往注册中心
                  </router-link>
                </el-col>
                <el-col :span="12">
                  <div>
                    模糊不清？点击图片刷新
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-card>
        </el-main>
      </el-container>
    </el-card>
  </el-card>
</template>

<style scoped>
.login-card {
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  border: 0;
}

.login-header {
  padding: 0;
}

.login-title {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.login-main {
  padding: 20px 0 0 0;
}

.login-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 10px;
}

.login-form {
  padding: 20px;
  border-radius: 8px;
}

.captcha-image {
  width: 120px;
  height: 32px;
  cursor: pointer;
}

.el-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.captcha {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 32px;
  margin-bottom: 18px;
  font-size: 16px;
}
</style>