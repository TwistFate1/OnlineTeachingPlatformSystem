<script lang="ts">
import { Memo } from '@element-plus/icons-vue';
import { defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'StudentCourse',
  setup() {
    const route = useRoute();
    const courseId = route.params.courseId as string;
    const activeIndex = ref(`/course/student/${courseId}/info`);

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
        <el-menu-item :index="'/course/student/' + courseId + '/info'">
          <el-icon><Memo /></el-icon>
          <template #title>课程信息</template>
        </el-menu-item>
        <el-menu-item :index="'/course/student/' + courseId + '/lists'">
          <el-icon><Files /></el-icon>
          <template #title>资源列表</template>
        </el-menu-item>
        <el-sub-menu router :index="'/course/student/' + courseId + '/homework'">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>课程任务</span>
          </template>
          <el-menu-item :index="'/course/student/' + courseId + '/homework'">
            <el-icon><Reading /></el-icon>
            <template #title>课程作业</template>
          </el-menu-item>
          <el-menu-item :index="'/course/student/' + courseId + '/quiz'">
            <el-icon><Document /></el-icon>
            <template #title>课程测验</template>
          </el-menu-item>
          <el-menu-item :index="'/course/student/' + courseId + '/live'">
            <el-icon><VideoCamera /></el-icon>
            <template #title>课程直播</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu router :index="'/course/student/' + courseId + '/discussion'">
          <template #title>
            <el-icon><ChatSquare /></el-icon>
            <span>课程互动</span>
          </template>
          <el-menu-item :index="'/course/student/' + courseId + '/discussion'">
            <el-icon><MessageBox /></el-icon>
            <template #title>课程讨论</template>
          </el-menu-item>
          <el-menu-item :index="'/course/student/' + courseId + '/review'">
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
