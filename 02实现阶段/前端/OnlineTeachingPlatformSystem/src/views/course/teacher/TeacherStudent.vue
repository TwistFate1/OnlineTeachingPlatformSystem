<template>
  <div class="student-container">
    <el-card shadow="never">
      <div class="header">
        <h2>课程学生列表</h2>
        <el-button type="primary" @click="addStudentDialogVisible = true">添加学生</el-button>
      </div>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else>
        <el-table :data="students" border stripe style="width: 100%; margin-top: 20px;">
          <el-table-column prop="id" label="学生ID" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="phone" label="电话" />
          <el-table-column prop="email" label="邮箱" />
        </el-table>
      </div>
    </el-card>

    <!-- 添加学生对话框 -->
    <el-dialog v-model="addStudentDialogVisible" title="添加学生" width="40%">
      <el-form :model="newStudent" ref="searchForm">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="学生ID" label-width="100px">
              <el-input v-model="newStudent.id" placeholder="请输入学生ID"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="searchStudent" style="margin-left: 10px;">查询</el-button>
          </el-col>
        </el-row>
        <el-form-item label="课程费用" label-width="100px">
          <el-input-number v-model="courseCost" :min="0" disabled style="width: 100%;"></el-input-number>
        </el-form-item>

        <div v-if="searchedStudent" class="searched-student-info">
          <el-form :model="searchedStudent" label-width="100px">
            <el-form-item label="学生ID">
              <el-input v-model="searchedStudent.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchedStudent.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="searchedStudent.phone" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="searchedStudent.email" disabled></el-input>
            </el-form-item>
          </el-form>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addStudentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddStudent" :disabled="!searchedStudent">确认添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchCourseStudent, fetchAccountInfo, subscribeCourse, getCourseById } from '@/api/data';
import { useRoute } from 'vue-router';

interface Student {
  id: number;
  username: string;
  phone: string;
  email: string;
}

export default defineComponent({
  setup() {
    const students = ref<Student[]>([]);
    const loading = ref(false);
    const addStudentDialogVisible = ref(false);
    const selectedStudent = ref<Student>({
      id: 0,
      username: '',
      phone: '',
      email: ''
    });
    const newStudent = ref({
      id: null as number | null,
    });
    const courseCost = ref(0);
    const route = useRoute();
    const courseId = Number(route.params.courseId);
    const searchedStudent = ref<Student | null>(null);
    const searchForm = ref(null);

    // 获取课程费用
    const getCourseCost = async () => {
      try {
        const response = await getCourseById(courseId);
        if (response.code === 200) {
          courseCost.value = response.data.cost;
        } else {
          ElMessage.error('获取课程信息失败');
        }
      } catch (error) {
        ElMessage.error('获取课程信息失败');
      }
    };

    // 获取课程学生列表
    const fetchStudents = async (courseId: number) => {
      try {
        loading.value = true;
        const response = await fetchCourseStudent(courseId);
        if (response.code === 200 && Array.isArray(response.data)) {
          // 并发请求获取每个学生的详细信息
          const studentPromises = response.data.map(async (student: any) => {
            const accountResponse = await fetchAccountInfo(student.studentId);
            return {
              id: student.studentId,
              username: accountResponse.accountName,
              phone: accountResponse.phone,
              email: accountResponse.email,
            };
          });

          // 等待所有请求完成
          const studentResults = await Promise.all(studentPromises);
          students.value = studentResults;
        } else {
          ElMessage.error('获取学生列表失败');
        }
        loading.value = false;
      } catch (error) {
        ElMessage.error('获取学生列表失败');
        loading.value = false;
      }
    };

    // 搜索
    const searchStudent = async () => {
      if (!newStudent.value.id) {
        ElMessage.error('请输入学生ID');
        return;
      }

      const accountResponse = await fetchAccountInfo(newStudent.value.id);
      searchedStudent.value = {
        id: newStudent.value.id,
        username: accountResponse.accountName,
        phone: accountResponse.phone,
        email: accountResponse.email,
      };
    };

    // 确认添加学生
    const confirmAddStudent = async () => {
      if (!searchedStudent.value) {
        ElMessage.error('请先查询学生信息');
        return;
      }

      try {
        console.log(courseId)
        console.log(searchedStudent.value.id)
        console.log(courseCost.value)
        const response = await subscribeCourse(courseId, Number(searchedStudent.value.id), courseCost.value);
        if (response.code === 200) {
          ElMessage.success('添加学生成功');
          fetchStudents(courseId);
          addStudentDialogVisible.value = false;
          newStudent.value.id = null;
          searchedStudent.value = null;
        } else {
          ElMessage.error('添加学生失败');
        }
      } catch (error) {
        ElMessage.error('添加学生失败');
      }
    };

    onMounted(() => {
      fetchStudents(courseId);
      getCourseCost();
    });

    return {
      students,
      courseCost,
      loading,
      addStudentDialogVisible,
      selectedStudent,
      newStudent,
      fetchStudents,
      confirmAddStudent,
      searchStudent,
      searchedStudent,
      searchForm
    };
  },
});
</script>

<style scoped>
.student-container {
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.searched-student-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>