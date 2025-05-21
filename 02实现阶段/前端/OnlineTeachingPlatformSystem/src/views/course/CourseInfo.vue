<script lang="ts">
import { defineComponent, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCourseById, getCourseClassifications } from '@/api/data';

interface Course {
  courseId: number;
  courseType: string;
  courseName: string;
  courseBrief: string;
  coverImageUrl: string;
  teachingObjectives: string;
  cost: number;
  courseTime: string;
  teachingStartTime: string;
  teachingEndTime: string;
  categories: string[]; // 添加 categories 属性
  showAllCategories: boolean; // 用于控制是否显示所有分类
}

export default defineComponent({
  name: 'TeacherInfo',
  setup() {
    const route = useRoute();
    const courseId = Number(route.params.courseId);
    const courseInfo = reactive<Course>({
      courseId: courseId,
      courseType: '',
      courseName: '',
      courseBrief: '',
      coverImageUrl: '',
      teachingObjectives: '',
      cost: 0,
      courseTime: '',
      teachingStartTime: '',
      teachingEndTime: '',
      categories: [],
      showAllCategories: false,
    });

    // 获取课程信息
    const getCourse = async () => {
      try {
        const response = await getCourseById(courseId)
        if (response.code === 200) {
          const data = response.data;
          courseInfo.courseType = data.courseType;
          courseInfo.courseName = data.courseName;
          courseInfo.courseBrief = data.courseBrief;
          courseInfo.coverImageUrl = data.coverImageUrl;
          courseInfo.teachingObjectives = data.teachingObjectives;
          courseInfo.cost = data.cost;
          courseInfo.courseTime = data.courseTime;
          courseInfo.teachingStartTime = data.teachingStartTime;
          courseInfo.teachingEndTime = data.teachingEndTime;
        } else {
          ElMessage.error(`获取课程信息失败: ${response.message}`);
        }
      } catch (error) {
        ElMessage.error('获取课程信息失败');
      }
    };

    // 获取课程分类
    const getClassifications = async () => {
      try {
        const response = await getCourseClassifications(courseId);
        if (response.code === 200) {
          courseInfo.categories = response.data;
        } else {
          ElMessage.error(`获取课程分类失败: ${response.message}`);
        }
      } catch (error) {
        ElMessage.error('获取课程分类失败');
      }
    };

    // 格式化日期显示
    const formatDate = (dateString: string | number | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
      const day = date.getDate().toString().padStart(2, '0'); // 日期补零
      const hours = date.getHours().toString().padStart(2, '0'); // 小时补零
      const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    };

    // 在组件挂载时获取数据
    onMounted(() => {
      if (courseId) {
        getCourse();
        getClassifications();
      } else {
        ElMessage.error('未指定课程ID');
      }
    });

    return {
      courseInfo,
      formatDate,
    };
  },
});
</script>

<template>
  <el-card>
    <el-descriptions border :column="4" style="margin-bottom: 20px;">
        <el-descriptions-item label="课程名称" align="center">{{ courseInfo.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程类型" align="center">{{ courseInfo.courseType }}</el-descriptions-item>
        <el-descriptions-item label="课程分类" :span="2" label-align="center">
          <el-tag
            v-for="id in courseInfo.categories"
            :key="id"
          >
            {{ id }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="教学目标" :span="4" label-align="center">{{ courseInfo.teachingObjectives }}</el-descriptions-item>
        <el-descriptions-item label="课程简介" :span="4" label-align="center">{{ courseInfo.courseBrief }}</el-descriptions-item>
        <el-descriptions-item label="封面图片" align="center">
          <img :src="courseInfo.coverImageUrl" style="max-width: 200px; max-height: 200px;" />
        </el-descriptions-item>
        <el-descriptions-item label="课程价格" align="center">{{ Number(courseInfo.cost) === 0 ? '免费' : `${courseInfo.cost} ¥` }}</el-descriptions-item>
        <el-descriptions-item label="开始时间" align="center">{{ formatDate(courseInfo.teachingStartTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间" align="center">{{ formatDate(courseInfo.teachingEndTime) }}</el-descriptions-item>
      </el-descriptions>
  </el-card>
</template>

<style scoped>
.input {
  padding: 8px;
}
.description-label {
  width: 100px;
  font-weight: bold;
}
</style>