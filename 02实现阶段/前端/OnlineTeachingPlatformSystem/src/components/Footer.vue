<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'Footer',
  components: {},
  setup() {
    const scrollTop = ref(0);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    const handleScroll = () => {
      scrollTop.value = window.pageYOffset || document.documentElement.scrollTop;
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    return {
      scrollTop,
      scrollToTop
    };
  }
});
</script>

<template>
  <div class="footer-container">
    <el-footer height="auto">
      <div class="footer-content">
        <div class="footer-links">
          <el-link href="#" type="primary">关于我们</el-link>
          <el-link href="#" type="primary">使用条款</el-link>
          <el-link href="#" type="primary">隐私政策</el-link>
          <el-link href="#" type="primary">联系我们</el-link>
        </div>
        
        <div class="footer-social">
          <el-link href="#" type="primary" style="margin-right: 15px;">
            <i class="el-icon-weixin"></i>
          </el-link>
          <el-link href="#" type="primary" style="margin-right: 15px;">
            <i class="el-icon-weibo"></i>
          </el-link>
          <el-link href="#" type="primary">
            <i class="el-icon-github"></i>
          </el-link>
        </div>
        
        <div class="footer-copyright">
          <p>© 2025 OD. <br class="responsive-break" />All rights reserved.</p>
        </div>
      </div>
    </el-footer>
  </div>
</template>

<style scoped>
.footer-container {
  width: 100%;
  background-color: #f5f5f5;
  border-top: 1px solid #c7c7c7;
  padding: 30px 60px;
}

.footer-content {
  margin: 0 auto;
  padding: 0 20px;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px
}

.footer-social {
  display: flex;
  margin-bottom: 20px;
}

.footer-copyright {
  color: #666;
  text-align: center;
}

.back-to-top {
  text-align: center;
}

.responsive-break {
  display: none;
}

@media screen and (max-width: 480px) {
  .footer-links {
    flex-direction: column;
  }
  
  .footer-social {
    justify-content: center;
  }

  .footer-container {
    padding: 30px 0;
  }

  .responsive-break {
    display: block;
  }
}
</style>