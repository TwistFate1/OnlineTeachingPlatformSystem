<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from 'vue';
import { Picture } from '@element-plus/icons-vue';
import { checkSubscribe, fetchCourseClassifications, fetchPublicCourses, fetchTeacherCourses, subscribeCourse } from '@/api/data'; // 假设您已经封装了API
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

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
  name: 'Courses',
  components: {
    Picture,
  },
  setup() {
    const userStore = useUserStore();
    const courses = reactive<Course[]>([]);
    const courseIdList = reactive<number[]>([]);

    const dialogVisible = ref(false);
    const selectedCourse = ref<Course | null>(null);

    // 在 setup 中定义
    const isSubscribed = ref(false);

    // 格式化日期显示
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
      const day = date.getDate().toString().padStart(2, '0'); // 日期补零
      const hours = date.getHours().toString().padStart(2, '0'); // 小时补零
      const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    };

    // 获取教师所有课程
    const fetchCourses = async () => {
      try {
        const response = await fetchPublicCourses();
        courses.splice(0, courses.length, ...response.data.map((course: Course) => ({
          ...course,
          categories: [], // 初始化 categories 数组
          showAllCategories: false // 初始化显示状态
        })));
        courseIdList.splice(0, courseIdList.length, ...response.data.map((course: { courseId: any }) => course.courseId));
      } catch (error) {
        console.error('获取课程失败:', error);
      }
    };

    // 获取课程分类
    const fetchClassifications = async () => {
      try {
        const classificationData = await fetchCourseClassifications(courseIdList);
        // 将分类数据分配给对应的课程
        courses.forEach((course) => {
          // 直接通过课程 ID 获取分类列表
          const courseClassifications = classificationData.data[course.courseId] || [];
          course.categories = courseClassifications;
        });
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };

    // 计算属性：格式化课程价格
    const formattedCost = (course: Course) => {
      return course.cost === 0 ? '免费' : `${course.cost} ¥`;
    };

    const calculateTimeProgress = (startTime: string, endTime: string): number => {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const current = Date.now();
      let progress = ((current - start) / (end - start)) * 100;
      progress = progress < 0 ? 0 : progress > 100 ? 100 : progress;
      return progress;
    };

    // 检查订阅状态
    const checkSubscriptionStatus = async () => {
      if (selectedCourse.value && userStore.isLoggedIn) {
        const studentId = Number(userStore.id) || 0; // 确保 studentId 为 number 类型，且不为 null
        const courseId = selectedCourse.value.courseId;
        try {
          const response = await checkSubscribe(studentId, courseId);
          isSubscribed.value = response.data;
        } catch (error) {
          console.error('检查订阅状态失败:', error);
        }
      }
    };

    const openCourseDialog = (course: Course) => {
      selectedCourse.value = course;
      dialogVisible.value = true;
      checkSubscriptionStatus();
    };

    const joinCourse = async () => {
      try {
        if (!selectedCourse.value) {
          ElMessage.error('未选择课程');
          return;
        }
        const courseId = selectedCourse.value.courseId;
        const studentId = Number(userStore.id); // 确保 studentId 为 number 类型
        const cost = selectedCourse.value.cost;

        // 调用后端接口
        await subscribeCourse(courseId, studentId, cost);

        ElMessage.success('加入课程成功');
      } catch (error) {
        ElMessage.error('加入课程失败');
      }
    };

    // 在组件挂载时获取课程和分类
    onMounted(async () => {
      await fetchCourses();
      await fetchClassifications();
    });

    return {
      courses,
      formatDate,
      formattedCost,
      calculateTimeProgress,
      userStore,
      dialogVisible,
      selectedCourse,
      joinCourse,
      openCourseDialog,
      isSubscribed,
    };
  },
});
</script>

<template>
  <el-card shadow="never" class="courses-card">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="box-card">
            <div v-if="courses.length > 0">
              <el-row :gutter="20">
                <el-col
                  :xs="24" 
                  :sm="12" 
                  :md="8" 
                  :lg="6" 
                  :xl="4"
                  v-for="course in courses"
                  :key="course.courseId"
                >
                  <el-card class="course-card" body-style="padding: 0;" @click="openCourseDialog(course)">
                    <el-row>
                      <el-col class="cover" :span="24">
                        <!-- 课程类型标签显示在图片左上角 -->
                        <el-tag 
                          class="course-type-tag" 
                          :class="{ 'public-tag': course.courseType === '公开', 'private-tag': course.courseType === '私有' }"
                          effect="dark"
                        >
                          {{ course.courseType }}
                        </el-tag>
                        <el-image :src="course.coverImageUrl" fit="cover"></el-image>
                        <!-- 分类标签显示在图片底部 -->
                        <div class="course-category">
                          <el-tag 
                            v-for="(category, index) in course.showAllCategories ? course.categories : course.categories.slice(0, 2)" 
                            :key="index"
                            class="category-item"
                            size="small"
                            type="info"
                          >
                            {{ category }}
                          </el-tag>
                          <!-- 显示省略号 -->
                          <div v-if="course.categories.length > 2 && !course.showAllCategories" 
                              class="category-ellipsis" 
                              @mouseenter="course.showAllCategories = true" 
                              @mouseleave="course.showAllCategories = false">
                            <el-tag
                              class="category-item"
                              size="small"
                              type="info"
                            >
                              +{{ course.categories.length - 2 }}
                            </el-tag>
                          </div>
                        </div>
                      </el-col>
                      <el-col class="info" :span="24">
                        <div class="course-title-price">
                          <h3 class="course-title">{{ course.courseName }}</h3>
                          <p class="course-price">{{ formattedCost(course) }}</p>
                        </div>
                        <p class="course-brief">{{ course.courseBrief }}</p>
                        <div class="course-meta">
                          <p>教学目标: {{ course.teachingObjectives }}</p>
                          <div class="course-time-container">
                            <el-row align="middle" justify="center">
                              <el-col class="show" :span="2">
                                <el-icon color="#f56c6c"><Flag /></el-icon>
                              </el-col>
                              <el-col :span="20">
                                <el-progress :percentage="calculateTimeProgress(course.teachingStartTime, course.teachingEndTime)" :show-text="false" color="#409eff"></el-progress>
                              </el-col>
                              <el-col class="show" :span="2">
                                <el-icon color="#67c23a"><Flag /></el-icon>
                              </el-col>
                              <el-col :span="12">
                                <span class="course-time-text">{{ formatDate(course.teachingStartTime) }}</span>
                              </el-col>
                              <el-col :span="12">
                                <span class="course-time-text">{{ formatDate(course.teachingEndTime) }}</span>
                              </el-col>
                            </el-row>
                          </div>
                        </div>
                      </el-col>
                    </el-row>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            <div v-else class="no-courses">
              <el-empty description="暂无课程" :image-size="200"></el-empty>
            </div>
          </el-card>
        </el-col>
      </el-row>
  </el-card>

  <!-- 课程详情对话框 -->
  <el-dialog v-model="dialogVisible" title="课程详情" width="60%">
    <el-card>
      <el-descriptions :column="1" border>
      <el-descriptions-item label="课程名称" align="center">{{ selectedCourse?.courseName }}</el-descriptions-item>
      <el-descriptions-item label="课程简介" label-align="center">{{ selectedCourse?.courseBrief }}</el-descriptions-item>
      <el-descriptions-item label="课程类型" align="center">{{ selectedCourse?.courseType }}</el-descriptions-item>
      <el-descriptions-item label="课程价格" align="center">{{ formattedCost(selectedCourse!) }}</el-descriptions-item>
      <el-descriptions-item label="教学目标" label-align="center">{{ selectedCourse?.teachingObjectives }}</el-descriptions-item>
      <el-descriptions-item label="授课时间" align="center">
        {{ formatDate(selectedCourse?.teachingStartTime!) }} - {{ formatDate(selectedCourse?.teachingEndTime!) }}
      </el-descriptions-item>
      <el-descriptions-item label="课程分类" label-align="center">
        <el-tag
          v-for="(category, index) in selectedCourse?.categories"
          :key="index"
          class="category-item"
          size="small"
          type="info"
        >
          {{ category }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <el-row>
      <el-col class="button" :span="12">
        <el-button 
          type="primary" 
          @click="joinCourse"
          :disabled="!(userStore.isLoggedIn && userStore.positionName === 'student') || isSubscribed"
        >
          {{ !(userStore.isLoggedIn && userStore.positionName === 'student') ? '需要登录学生用户才能加入课程' : isSubscribed ? '已加入课程' : '加入课程' }}
        </el-button>
      </el-col>
      <el-col class="button" :span="12">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </el-col>
    </el-row>
    </el-card>
  </el-dialog>
</template>

<style scoped>
.courses-card {
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  border: 0;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-card {
  min-width: 220px;
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

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.cover {
  width: 100%;
  height: 150px;
  position: relative;
}

.cover .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 课程类型标签 */
.course-type-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

.public-tag {
  background-color: #409eff;
}

.private-tag {
  background-color: #67c23a;
}

/* 分类标签 */
.course-category {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  display: flex;
  flex-wrap: wrap;
}

.category-item {
  margin: 4px;
  font-size: 12px;
}

/* 省略号提示 */
.category-ellipsis {
  margin-left: 8px;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.course-price {
  font-size: 16px;
  color: #f56c6c;
  margin: 0;
}

.info .course-brief {
  font-size: 14px;
  color: #303133;
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.info .course-meta {
  font-size: 14px;
  color: #606266;
}

.info .course-meta p:first-child {
  margin: 10px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
}

.course-time {
  font-weight: bold;
  color: #409eff;
}

.course-time-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.show {
  text-align: center;
}

.button {
  margin-top: 5px;
  text-align: center;
}

.flag {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 2px;
}

.course-time-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  color: #409eff;
}

.no-courses {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
