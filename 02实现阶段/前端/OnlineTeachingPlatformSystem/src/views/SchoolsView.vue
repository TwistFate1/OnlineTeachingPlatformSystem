<script lang="ts">
import { defineComponent, reactive, onMounted } from 'vue';
import { fetchSchools } from '@/api/data'; // 引入获取学校列表的API

interface School {
  schoolId: number;
  schoolName: string;
  schoolType: string;
}

export default defineComponent({
  name: 'Schools',
  setup() {
    const schools = reactive<School[]>([]);

    const fetchSchoolList = async () => {
      try {
        const response = await fetchSchools();
        schools.splice(0, schools.length, ...response.map((school: School) => ({
          ...school,
        })));
      } catch (error) {
        console.error('获取学校列表失败:', error);
      }
    };

    onMounted(() => {
      fetchSchoolList();
    });

    return {
      schools,
    };
  },
});
</script>

<template>
  <el-card shadow="never" class="schools-card">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2>学校阵列</h2>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6" v-for="school in schools" :key="school.schoolId">
            <el-card class="school-card" body-style="padding: 0;">
              <div class="school-info">
                <h3>{{ school.schoolName }}</h3>
                <p>{{ school.schoolType }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
.schools-card {
  padding: 0 50px;
  border: 0;
}

.school-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
}

.school-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.school-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.school-info h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.school-info p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}
</style>
