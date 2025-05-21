<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { fetchAccountInfo, fetchCity, fetchMajor, fetchPosition, fetchProvince, fetchSchool, fetchUserInfo, updateProfile } from '@/api/data';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'TeacherInfo',
  setup() {
    const userStore = useUserStore();
    const userInfo = ref({
      accountId: userStore.id,
      positionId: userStore.positionId,
      name: '',
      phone: '',
      email: '',
      positionName: '',
      schoolName: '',
      schoolType: '',
      majorName: '',
      cityName: '',
      provinceName: '',
      gender: '',
      dateOfBirth: '',
      personalProfile: ''
    });

    onMounted(async () => {
      await fetchUserData();
    });

    const fetchUserData = async () => {
      try {
        // 获取账户信息
        const account = await fetchAccountInfo(userInfo.value.accountId);
        userInfo.value.name = account.accountName;
        userInfo.value.phone = account.phone;
        userInfo.value.email = account.email;

        // 获取用户信息
        const info = await fetchUserInfo(userInfo.value.accountId, userInfo.value.positionId);
        userInfo.value.gender = info.gender ? '女' : '男';
        userInfo.value.dateOfBirth = info.dateOfBirth;
        userInfo.value.personalProfile = info.personalProfile;

        // 获取角色信息
        const position = await fetchPosition(userInfo.value.positionId);
        userInfo.value.positionName = position.positionName;

        // 获取学校信息
        const school = await fetchSchool(info.schoolId);
        userInfo.value.schoolName = school.schoolName;
        userInfo.value.schoolType = school.schoolType;

        // 获取专业信息
        const major = await fetchMajor(info.majorId);
        userInfo.value.majorName = major.majorName;

        // 获取城市信息
        const city = await fetchCity(info.cityId);
        userInfo.value.cityName = city.cityName;

        // 获取省份信息
        const province = await fetchProvince(city.provinceId);
        userInfo.value.provinceName = province.provinceName;
      } catch (error) {
        console.error('获取用户数据出错:', error);
      }
    };

    // 格式化日期
    const formatDate = (dateString: any) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // 如果日期无效，返回原始字符串
      } 
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };

    // 编辑个人简介
    const isEditing = ref(false);
    const newPersonalProfile = ref('');

    const startEditing = () => {
      newPersonalProfile.value = userInfo.value.personalProfile;
      isEditing.value = true;
    };

    const saveProfile = async () => {
      try {
        if (!newPersonalProfile.value) {
          ElMessage.error('个人简介不能为空');
          return;
        }
        if (userInfo.value.personalProfile === newPersonalProfile.value) {
          ElMessage.warning('个人简介没有修改');
          isEditing.value = false;
          return;
        }
        const response = await updateProfile(userInfo.value.accountId, userInfo.value.positionId, newPersonalProfile.value);
        if (response.code === 200) {
          userInfo.value.personalProfile = newPersonalProfile.value;
          isEditing.value = false;
          ElMessage.success('个人简介更新成功');
        } else {
          ElMessage.error('个人简介更新失败: ' + response.message);
        }
      } catch (error) {
        console.error('更新个人简介失败:', error);
        ElMessage.error('更新个人简介失败');
      }
    };

    return {
      userInfo,
      formatDate,
      isEditing,
      newPersonalProfile,
      startEditing,
      saveProfile
    };
  },
});
</script>

<template>
  <el-card>
    <el-descriptions border :column="6">
      <el-descriptions-item align="center" label="ID / 昵称">{{ userInfo.accountId || '暂无ID' }} / {{ userInfo.name || '暂无昵称' }}</el-descriptions-item>
      <el-descriptions-item align="center" label="角色">{{ userInfo.positionName || '暂无角色' }}</el-descriptions-item>
      <el-descriptions-item :span="2" align="center" label="电话">
        <div v-if="userInfo.phone">{{ userInfo.phone }}</div>
        <div v-else>暂无电话</div>
      </el-descriptions-item>
      <el-descriptions-item :span="2" align="center" label="邮箱">
        <div v-if="userInfo.email">{{ userInfo.email }}</div>
        <div v-else>暂无邮箱</div>
      </el-descriptions-item>
      <el-descriptions-item :span="2" align="center" label="学校">{{ userInfo.schoolName || '暂无学校' }}</el-descriptions-item>
      <el-descriptions-item align="center" label="学校类型">
        <el-tag type="primary">{{ userInfo.schoolType || '暂无类型' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item :span="3" align="center" label="专业">{{ userInfo.majorName || '暂无专业' }}</el-descriptions-item>
      <el-descriptions-item :span="2" align="center" label="省份 / 城市">
        {{ userInfo.provinceName || '暂无省份' }} / {{ userInfo.cityName || '暂无城市' }}
      </el-descriptions-item>
      <el-descriptions-item align="center" label="性别">{{ userInfo.gender || '暂无性别' }}</el-descriptions-item>
      <el-descriptions-item :span="3" align="center" label="出生日期">{{ formatDate(userInfo.dateOfBirth) || '暂无日期' }}</el-descriptions-item>
      <el-descriptions-item align="center" label="个人简介">
        <div v-if="!isEditing">
          {{ userInfo.personalProfile || '暂无个人简介' }}
          <el-button @click="startEditing">编辑</el-button>
        </div>
        <div v-else>
          <el-row>
            <el-col :span="24">
              <el-input
                type="textarea"
                max-length="255"
                v-model="newPersonalProfile"
                placeholder="请输入个人简介"
                class="input"
                :rows="3"
              >
              </el-input>
            </el-col>
            <el-col :span="12">
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-col>
            <el-col :span="12">
              <el-button @click="isEditing = false">取消</el-button>
            </el-col>
          </el-row>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped>
.input {
  padding: 8px;
}
</style>