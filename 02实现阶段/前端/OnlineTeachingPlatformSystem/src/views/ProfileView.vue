<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'profile',
});
</script>

<template>
  <el-card shadow="never" class="profile-container" body-style="padding: 0;">
    <router-view />
  </el-card>
</template>

<style scoped>
.profile-container {
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  border: 0;
}
</style>
