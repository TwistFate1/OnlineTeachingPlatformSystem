<script lang="ts">
import { Memo } from '@element-plus/icons-vue';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'TeacherCourse',
  setup() {
    const route = useRoute();
    const courseId = route.params.courseId as string;
    const activeIndex = ref(`/course/teacher/${courseId}/info`);

    return {
      activeIndex,
      courseId,
    }
  }
});
</script>

<template>
  <el-container>
    <el-aside class="aside">
      <el-menu
        default-active="activeIndex"
        router
      >
        <el-sub-menu router :index="'/course/teacher/' + courseId + '/info'">
          <template #title>
            <el-icon><Memo /></el-icon>
            <span>课程任务</span>
          </template>
          <el-menu-item :index="'/course/teacher/' + courseId + '/info'">
            <el-icon><InfoFilled /></el-icon>
            <template #title>课程信息</template>
          </el-menu-item>
          <el-menu-item :index="'/course/teacher/' + courseId + '/student'">
            <el-icon><List /></el-icon>
            <template #title>学生列表</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu router :index="'/course/teacher/' + courseId + '/resources'">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>资源管理</span>
          </template>
          <el-menu-item :index="'/course/teacher/' + courseId + '/resources'">
            <el-icon><FolderAdd /></el-icon>
            <template #title>课程资源</template>
          </el-menu-item>
          <el-menu-item :index="'/course/teacher/' + courseId + '/lists'">
            <el-icon><Folder /></el-icon>
            <template #title>资源列表</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu router :index="'/course/teacher/' + courseId + '/homework'">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>课程任务</span>
          </template>
          <el-menu-item :index="'/course/teacher/' + courseId + '/homework'">
            <el-icon><Reading /></el-icon>
            <template #title>课程作业</template>
          </el-menu-item>
          <el-menu-item :index="'/course/teacher/' + courseId + '/quiz'">
            <el-icon><Document /></el-icon>
            <template #title>课程测验</template>
          </el-menu-item>
          <el-menu-item :index="'/course/teacher/' + courseId + '/live'">
            <el-icon><VideoCamera /></el-icon>
            <template #title>课程直播</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu router :index="'/course/teacher/' + courseId + '/discussion'">
          <template #title>
            <el-icon><ChatSquare /></el-icon>
            <span>课程互动</span>
          </template>
          <el-menu-item :index="'/course/teacher/' + courseId + '/discussion'">
            <el-icon><MessageBox /></el-icon>
            <template #title>课程讨论</template>
          </el-menu-item>
          <el-menu-item :index="'/course/teacher/' + courseId + '/review'">
            <el-icon><Star /></el-icon>
            <template #title>课程评论</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-main class="main">
      <el-card class="card" shadow="never" body-style="width: 100%; height: 100%">
        <router-view />
      </el-card>
    </el-main>
  </el-container>
</template>

<style scoped>
.aside {
  width: 160px;
  border-right: 1px solid #c7c7c7;
}
.main {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 0px;
  background-color: #f5f5f5;
}
.card {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
}
.el-menu {
  border-right: 0;
}
</style>
