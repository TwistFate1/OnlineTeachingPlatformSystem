<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div id="web">
    <Header />
    <main class="container">
      <el-scrollbar class="scrollbar" view-style="min-height: 100vh;" always>
        <router-view />
        <Footer />
      </el-scrollbar>
    </main>
  </div>
</template>

<style scoped>
#web {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 300px;
  height: 100vh;
  width: 100vw;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-top: 1px solid #c7c7c7;
}

.scrollbar {
  width: 100%;
  height: 100%;
}
</style>