<script lang="ts">
import { defineComponent, ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage, type CascaderProps, type FormInstance } from 'element-plus';
import { useRouter } from 'vue-router';
import { fetchCitiesByProvinceId, fetchMajors, fetchProvinces, fetchRoles, fetchSchools, registerUser } from '@/api/data';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const activeStep = ref(0);
    const registerData = reactive({
      role: '',
      positionId: '',
      provinceId: '',
      cityId: '',
      schoolId: '',
      majorId: '',
      Account_Name: '',
      Main_Login_Method: 'Phone', // 默认选择手机号登录
      Phone: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      Gender: null,
      DateOfBirth: null,
      personalProfile: '', 
      region: [] // 用于级联选择器绑定
    });

    // 角色列表
    const roles = reactive<Array<{ value: string; label: string; description: string }>>([]);

    // 省市列表
    const address = reactive<Array<{ provinceId: string; provinceName: string; children: Array<{ cityId: string; cityName: string }> }>>([]);

    // 学校选项
    const schools = reactive<Array<{ schoolId: string; schoolName: string; schoolType: string }>>([]);

    // 专业选项
    const majors = reactive<Array<{ majorId: string; majorName: string}>>([]);

    // 级联选择器配置
    const props: CascaderProps = {
      lazy: true,
      lazyLoad(node: any, resolve: any) {
        const { data } = node;
        if (node.root) {
          setTimeout(() => {
            fetchProvinces().then((res) => {
              // 更新 address 数组
              address.length = 0;
              address.push(...res);

              const provinces = res.map((item: { provinceId: string; provinceName: string; }) => ({
                value: item.provinceId,
                label: item.provinceName,
                leaf: false,
              }));
              resolve(provinces);
            }).catch((error) => {
              ElMessage.error('获取省份列表失败，请稍后再试');
            });
          }, 1000);
        }
        else {
          setTimeout(() => {
          fetchCitiesByProvinceId(data.value).then((res) => {
            // 找到对应的省份并更新其 children
            const province = address.find(p => p.provinceId === data.value);
            if (province) {
              province.children = res;
            }

            const cities = res.map((item: { cityId: string; cityName: string; }) => ({
              value: item.cityId,
              label: item.cityName,
              leaf: true,
            }));
            resolve(cities);
          }).catch((error) => {
            ElMessage.error('获取城市列表失败，请稍后再试');
          });
        }, 1000);
        }
      }
    };

    // 处理地区选择变化
    const handleRegionChange = (value: string[]) => {
      if (value.length >= 1) {
        registerData.provinceId = value[0];
      }
      if (value.length >= 2) {
        registerData.cityId = value[1];
      }
    };

    // 获取角色列表
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles();
        const formattedRoles = fetchedRoles.map((item: any) => ({
          value: item.positionId.toString(), // 使用 positionId 作为 value
          label: item.positionName, // 使用 positionName 作为 label
          description: `选择此角色如果您是${item.positionName}。`, // 使用 positionName 构造描述
        }));
        roles.splice(0, roles.length, ...formattedRoles); // 清空并替换 roles 数组
      } catch (error) {
        ElMessage.error('获取角色列表失败，请稍后再试');
      }
    };

    // 获取学校列表
    const loadSchools = async () => {
      try {
        const fetchedSchools = await fetchSchools();
        schools.splice(0, schools.length, ...fetchedSchools);
      } catch (error) {
        ElMessage.error('获取学校列表失败，请稍后再试');
      }
    };

    // 获取专业列表
    const loadMajors = async () => {
      try {
        const fetchedMajors = await fetchMajors();
        majors.splice(0, majors.length, ...fetchedMajors);
      } catch (error) { 
        ElMessage.error('获取专业列表失败，请稍后再试');
      }
    };

    // 页面加载时获取角色列表、学校列表和专业列表
    onMounted(() => {
      loadRoles();
      loadSchools();
      loadMajors();
    });

    // 验证密码是否一致
    const validatePassword = (rule: any, value: string, callback: any) => {
      if (value !== registerData.Password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    // 验证规则
    const infoRules = reactive({
      Account_Name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, message: '用户名长度至少为2个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
      ],
      Password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
        { max: 50, message: '密码长度不能超过50个字符', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码必须同时包含字母和数字', trigger: 'blur' },
      ],
      ConfirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validatePassword, trigger: 'blur' },
      ],
      region: [
        { required: true, message: '请选择所在地区', trigger: 'change' },
        { validator: (rule: any, value: any, callback: any) => {
            if (value && (value[0] || value[1])) {
              callback();
            } else {
              callback(new Error('请选择所在地区'));
            }
          }, trigger: 'change'
        },
      ],
      schoolId: [
        { required: true, message: '请选择学校', trigger: 'change' },
      ],
      majorId: [
        { required: true, message: '请选择专业', trigger: 'change' },
      ],
      Gender: [
        { required: true, message: '请选择性别', trigger: 'change' },
      ],
      DateOfBirth: [
        { required: true, message: '请选择出生日期', trigger: 'change' },
      ],
      personalProfile: [
        { required: true, message: '请输入个人简介', trigger: 'blur' },
        { max: 255, message: '个人简介最多255个字符', trigger: 'blur' },
      ],
    });

    // 独立手机号的验证规则
    const phoneRules = computed(() => {
      return registerData.Main_Login_Method === 'Phone'
        ? [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' },
          ]
        : [];
    });

    // 独立邮箱的验证规则
    const emailRules = computed(() => {
      return registerData.Main_Login_Method === 'Email'
        ? [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入有效的邮箱', trigger: 'blur' },
            {
              pattern: /^[^\s@]+@(qq|gmail|163|126|yeah|sina|sohu|hotmail|outlook|yahoo)\.com$/,
              message: '请输入有效的邮箱后缀',
              trigger: 'blur',
            },
            { max: 255, message: '邮箱长度不能超过255个字符', trigger: 'blur' },
          ]
        : [];
    });

    // 获取角色名称
    const getRoleName = (roleId: string): string => {
      const role = roles.find(r => r.value === roleId);
      return role ? role.label : roleId;
    };

    // 获取省份名称
    const getProvinceName = (provinceId: string): string => {
      const province = address.find(p => p.provinceId === provinceId);
      return province ? province.provinceName : '';
    };

    // 获取城市名称
    const getCityName = (cityId: string): string => {
      const province = address.find(p => p.provinceId === registerData.provinceId);
      if (province && province.children) {
        const city = province.children.find(c => c.cityId === cityId);
        return city ? city.cityName : '';
      }
      return '';
    };

    // 获取学校名称
    const getSchoolName = (schoolId: string | null) => {
      if (!schoolId) return '';
      const school = schools.find(s => s.schoolId === schoolId);
      return school ? school.schoolName : '';
    };

    // 获取专业名称
    const getMajorName = (majorId: string | null) => {
      if (!majorId) return '';
      const major = majors.find(m => m.majorId === majorId);
      return major ? major.majorName : '';
    };

    const disabledDate = (time: Date) => {
      return time.getTime() > Date.now()
    }

    const formatDate = (dateString: string): string => {
      if (!dateString) return '';

      const date = new Date(dateString);

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return dateString; // 或者返回其他默认值
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    // 选择角色
    const selectRole = (roleId: string) => {
      registerData.role = roleId; // 存储角色 positionId
      const selectedRole = roles.find(role => role.value === roleId);
      if (selectedRole) {
        registerData.positionId = selectedRole.value; // 存储 positionId
      }
    };

    // 检验表单
    const formRef = ref<FormInstance>()
    const isNextDisabled = ref(true); // 控制下一步按钮的禁用状态

    // 验证表单并更新按钮状态
    const validateForm = (formEl: FormInstance | undefined) => {
      if (!formEl) return; // 确保 formEl 存在
      formEl.validate((valid) => {
        isNextDisabled.value = !valid; // 如果表单验证不通过，则禁用下一步按钮
        if (valid) {
          ElMessage.success('表单验证通过，您可以继续');
        } else {
          ElMessage.error('表单验证失败，请检查输入');
        }
      });
    };

    watch(registerData, () => {
      isNextDisabled.value = true; // 重置按钮状态
    }, { deep: true });

    // 下一步
    const nextStep = () => {
      activeStep.value++;
    };

    // 上一步
    const prevStep = () => {
      activeStep.value--;
    };

    // 提交注册
    const submitRegistration = async () => {
      try {
        // 构建发送到后端的注册数据
        const formattedData = {
          accountName: registerData.Account_Name,
          password: registerData.Password,
          mainLoginMethod: registerData.Main_Login_Method,
          phone: registerData.Phone,
          email: registerData.Email,
          positionId: registerData.positionId,
          cityId: registerData.cityId,
          majorId: registerData.majorId,
          schoolId: registerData.schoolId,
          gender: registerData.Gender,
          dateOfBirth: registerData.DateOfBirth ? formatDate(registerData.DateOfBirth) : null,
          personalProfile: registerData.personalProfile,
        };

        // 调用注册 API
        const result = await registerUser(formattedData);

        // 根据后端返回的 Result 对象处理结果
        if (result.code === 200) {
          ElMessage.success(result.message);
          activeStep.value = 3;
        } else {
          ElMessage.error(result.message);
        }
      } catch (error) {
        ElMessage.error('注册失败，请检查网络或联系管理员');
      }
    };

    // 跳转到登录页面
    const goToLogin = () => {
      router.push('/login');
    };

    return {
      activeStep,
      registerData,
      props,
      roles,
      schools,
      majors,
      handleRegionChange,
      infoRules,
      phoneRules,
      emailRules,
      getRoleName,
      getProvinceName,
      getCityName,
      getSchoolName,
      getMajorName,
      disabledDate,
      formatDate,
      selectRole,
      formRef,
      isNextDisabled,
      validateForm,
      nextStep,
      prevStep,
      submitRegistration,
      goToLogin,
    };
  },
});
</script>

<template>
  <el-card shadow="never" class="register-card">
    <el-card>
      <el-container>
        <el-header class="register-header">
          <el-row>
            <el-col class="Title">
              注册中心
            </el-col>
          </el-row>
          <el-divider content-position="right">
            <router-link to="/login">已有账号？去登录</router-link>
          </el-divider>
        </el-header>
        <el-main>
          <el-steps :active="activeStep" finish-status="success" align-center>
            <el-step title="选择角色" />
            <el-step title="填写信息" />
            <el-step title="确认信息" />
            <el-step title="完成注册" />
          </el-steps>
        </el-main>
      </el-container>
      <el-card shadow="never" class="register-content">
        <div v-if="activeStep === 0">
          <div class="role-selection">
            <el-card
              v-for="(role, index) in roles"
              :key="index"
              :class="['role-card', { selected: registerData.role === role.value }]"
              :shadow="registerData.role === role.value ? 'always' : 'hover'"
              @click="selectRole(role.value)"
            >
              <div class="role-name">{{ role.label }}</div>
              <div class="role-desc">{{ role.description }}</div>
            </el-card>
          </div>
          <el-row class="step">
            <el-col :span="4"></el-col>
            <el-col :span="16">
              <div v-if="!registerData.role" class="role-prompt">
                请选择一个角色以继续。
              </div>
              <div v-if="registerData.role" class="role-prompt">
                您选择的角色是：{{ getRoleName(registerData.role) }}!
              </div>
            </el-col>
            <el-col :span="4">
              <el-button @click="nextStep" :disabled="!registerData.role">下一步</el-button>
            </el-col>
          </el-row>
        </div>
  
        <div v-if="activeStep === 1">
          <el-form
            ref="formRef"
            :model="registerData"
            :rules="infoRules"
            label-width="120px"
            label-position="right"
            @submit.prevent
            class="register-form"
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="用户名" prop="Account_Name">
                  <el-input v-model="registerData.Account_Name" maxlength="30" clearable placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- 主要登录方式选择 -->
                <el-form-item label="主要登录方式">
                  <el-radio-group v-model="registerData.Main_Login_Method">
                    <el-radio value="Phone">手机号</el-radio>
                    <el-radio value="Email">邮箱</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <!-- 根据主要登录方式显示或隐藏对应的输入框 -->
                <el-form-item
                  v-if="registerData.Main_Login_Method === 'Phone'"
                  label="手机号"
                  :rules="phoneRules"
                  prop="Phone"
                >
                  <el-input v-model="registerData.Phone" maxlength="11" clearable placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item
                  v-if="registerData.Main_Login_Method === 'Email'"
                  :rules="emailRules"
                  label="邮箱"
                  prop="Email"
                >
                  <el-input v-model="registerData.Email" maxlength="255" clearable placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- 如果主要登录方式是手机号，则邮箱可以不填，反之亦然 -->
                <el-form-item
                  v-if="registerData.Main_Login_Method !== 'Email'"
                  :rules="emailRules"
                  label="邮箱（可选）"
                  prop="Email"
                >
                  <el-input v-model="registerData.Email" maxlength="255" clearable placeholder="请输入邮箱（可选）" />
                </el-form-item>
                <el-form-item
                  v-if="registerData.Main_Login_Method !== 'Phone'"
                  :rules="phoneRules"
                  label="手机号（可选）"
                  prop="Phone"
                >
                  <el-input v-model="registerData.Phone" maxlength="11" clearable placeholder="请输入手机号（可选）" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="密码" prop="Password">
                  <el-input
                    v-model="registerData.Password"
                    maxlength="60"
                    placeholder="请输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="ConfirmPassword">
                  <el-input
                    v-model="registerData.ConfirmPassword"
                    maxlength="60"
                    placeholder="请再次输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="所在学校" prop="schoolId">
                  <el-select v-model="registerData.schoolId" filterable placeholder="请选择学校">
                    <el-option
                      v-for="school in schools"
                      :key="school.schoolId"
                      :label="school.schoolName"
                      :value="school.schoolId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所在专业" prop="majorId">
                  <el-select v-model="registerData.majorId" filterable placeholder="请选择专业">
                    <el-option
                      v-for="major in majors"
                      :key="major.majorId"
                      :label="major.majorName"
                      :value="major.majorId"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="所在地区" prop="region">
                  <el-cascader
                    v-model="registerData.region"
                    :props="props"
                    @change="handleRegionChange"
                  ></el-cascader>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="Gender">
                  <el-radio-group v-model="registerData.Gender">
                    <el-radio :value="0">男</el-radio>
                    <el-radio :value="1">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="出生日期" prop="DateOfBirth">
                  <el-date-picker
                    v-model="registerData.DateOfBirth"
                    type="date"
                    :disabled-date="disabledDate"
                    placeholder="选择出生日期"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12"></el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="个人简介" prop="personalProfile">
                  <el-input
                    type="textarea"
                    v-model="registerData.personalProfile"
                    maxlength="255"
                    placeholder="请输入个人简介"
                    :autosize="{ minRows: 4, maxRows: 4 }"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row class="step">
              <el-col :span="8">
                <el-button @click="prevStep">上一步</el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="success" @click="validateForm(formRef)">验证</el-button>
              </el-col>
              <el-col :span="8">
                <el-button type="primary" @click="nextStep" :disabled="isNextDisabled">下一步</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <div v-if="activeStep === 2">
          <el-card class="confirmation-card">
            <el-descriptions class="confirmation-descriptions" border>
              <el-descriptions-item align="center" label="角色">{{ getRoleName(registerData.role) }}</el-descriptions-item>
              <el-descriptions-item align="center" label="用户名">{{ registerData.Account_Name }}</el-descriptions-item>
              <el-descriptions-item align="center" label="主要登录方式">{{ registerData.Main_Login_Method === 'Phone' ? '手机号' : '邮箱' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="手机号">{{ registerData.Phone }}</el-descriptions-item>
              <el-descriptions-item span="2" align="center" label="邮箱">{{ registerData.Email }}</el-descriptions-item>
              <el-descriptions-item align="center" label="学校">{{ getSchoolName(registerData.schoolId) }}</el-descriptions-item>
              <el-descriptions-item align="center" label="专业">{{ getMajorName(registerData.majorId) }}</el-descriptions-item>
              <el-descriptions-item align="center" label="省份">{{ getProvinceName(registerData.provinceId) }}</el-descriptions-item>
              <el-descriptions-item align="center" label="城市">{{ getCityName(registerData.cityId) }}</el-descriptions-item>
              <el-descriptions-item align="center" label="性别">{{ registerData.Gender === 0 ? '男' : '女' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="出生日期">{{ formatDate(registerData.DateOfBirth || '') }}</el-descriptions-item>
              <el-descriptions-item align="center" label="个人简介">{{ registerData.personalProfile }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-row class="step">
            <el-col :span="4">
              <el-button @click="prevStep">上一步</el-button>
            </el-col>
            <el-col :span="16">
              <div class="role-prompt">
                请确保信息无误后进行注册!
              </div>
            </el-col>
            <el-col :span="4">
              <el-button type="success" @click="submitRegistration">去注册</el-button>
            </el-col>
          </el-row>
        </div>

        <div v-if="activeStep === 3">
          <el-result
            icon="success"
            title="注册成功"
            sub-title="您的账号已成功创建，现在可以登录了。"
          >
            <template #extra>
              <el-button type="primary" @click="goToLogin">去登录</el-button>
            </template>
          </el-result>
        </div>
      </el-card>
    </el-card>
  </el-card>
</template>

<style scoped>
.register-card {
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  border: 0;
}

.register-header{
  padding: 0;
}

.register-header .Title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.register-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 10px;
}

.role-selection {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.role-card {
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid;
  cursor: pointer;
}

.role-card:hover {
  transform: translateY(-3px);
}

.selected {
  border: 2px solid #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.role-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.role-desc {
  font-size: 12px;
  color: #666;
}

.step {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
}

.el-col {
  text-align: center;
}

.role-prompt {
  color: #ff4d4f;
  text-align: center;
}

.register-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-form-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-select, .el-input__wrapper {
  width: 100%;
}

.confirmation-card {
  margin: 20px auto;
  max-width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.confirmation-descriptions :deep(.el-descriptions__label) {
  font-weight: bold;
  color: #606266;
}

.confirmation-descriptions :deep(.el-descriptions__content) {
  color: #303133;
}
</style>