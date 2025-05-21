<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'CourseView',
  setup() {
    
  }
});
</script>

<template>
  <el-card shadow="never" class="course-container" body-style="padding: 0;">
    <router-view />
  </el-card>
</template>

<style scoped>
.course-container {
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  border: 0;
}
</style>
