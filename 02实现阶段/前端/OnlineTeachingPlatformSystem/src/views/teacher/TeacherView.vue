<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'teacher',
  setup() {
    const activeIndex = ref('/profile/teacher/info');

    return {
      activeIndex,
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
        <el-menu-item index="/profile/teacher/info">
          <el-icon><User /></el-icon>
          <template #title>个人信息</template>
        </el-menu-item>
        <el-sub-menu router index="/profile/teacher/courses">
          <template #title>
            <el-icon><Memo /></el-icon>
            <span>我的课程</span>
          </template>
          <el-menu-item index="/profile/teacher/courses">
            <el-icon><List /></el-icon>
            <template #title>课程列表</template>
          </el-menu-item>
          <el-menu-item index="/profile/teacher/create">
            <el-icon><Management /></el-icon>
            <template #title>创建课程</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/profile/teacher/live">
          <el-icon><VideoCamera /></el-icon>
          <template #title>我的直播</template>
        </el-menu-item>
        <el-menu-item index="/profile/teacher/dataanalysis">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据分析</template>
        </el-menu-item>
        <el-menu-item index="/profile/teacher/achievements">
          <el-icon><Trophy /></el-icon>
          <template #title>我的成就</template>
        </el-menu-item>
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
