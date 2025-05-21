<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchChapterAssets, getChapters } from '@/api/data';
import { useRoute } from 'vue-router';

interface Chapter {
  id: number;
  label: string;
  isOriginal?: boolean;
  children?: Chapter[];
}

interface Asset {
  id: number;
  chapterId: number;
  assetName: string;
  assetType: string;
  assetSize: number;
  assetUrl: string;
  assetPermission: string;
  downloadCount: number;
  uploadTime: string;
}

export default defineComponent({
  setup() {
    const route = useRoute();
    const courseId = Number(route.params.courseId);
    const selectedChapterId = ref<number | null>(null);
    const selectedChapterLabel = ref<string | null>(null);
    const chapters = reactive<Chapter[]>([]);
    const assets = reactive<Asset[]>([]);
    const loading = ref(false);

    const previewDialogVisible = ref(false);
    const previewAsset = ref<Asset | null>(null);

    // 递归函数：为章节及其所有子章节设置 isOriginal 属性
    const recursivelySetIsOriginal = (chapter: any): Chapter => {
      const newChapter: Chapter = {
        ...chapter,
        isOriginal: true, // 标记为原始章节
        children: [],
      };

      if (Array.isArray(chapter.children) && chapter.children.length > 0) {
        newChapter.children = chapter.children.map((child: any) => {
          return recursivelySetIsOriginal(child);
        });
      }

      return newChapter;
    };

    // 获取章节数据
    const getChaptersData = async () => {
      try {
        const response = await getChapters(courseId);
        if (response.code === 200 && Array.isArray(response.data)) {
          const chaptersWithData = response.data.map((chapter: Chapter) => {
            return recursivelySetIsOriginal(chapter);
          });
          chapters.splice(0, chapters.length, ...chaptersWithData);
          ElMessage.success('获取章节数据成功');
        } else {
          ElMessage.error('获取章节数据失败');
        }
      } catch (error) {
        ElMessage.error('获取章节数据失败');
      }
    };

    // 获取资源数据
    const getAssetsData = async (chapterId: number) => {
      loading.value = true;
      try {
        const response = await fetchChapterAssets(chapterId);
        if (response.code === 200 && Array.isArray(response.data)) {
          assets.splice(0, assets.length, ...response.data);
          loading.value = false;
        } else {
          ElMessage.error('获取资源数据失败');
          loading.value = false;
        }
      } catch (error) {
        ElMessage.error('获取资源数据失败');
        loading.value = false;
      }
    };

    // 处理章节选择
    const handleChapterSelection = (data: Chapter) => {
      selectedChapterId.value = data.id;
      selectedChapterLabel.value = data.label;
      getAssetsData(data.id);
    };

    onMounted(() => {
      getChaptersData();
    });

    // 格式化文件大小
    const formatFileSize = (size: number): string => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
      return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
    };

    // 预览文件
    const previewFile = (asset: Asset) => {
      previewAsset.value = asset;
      previewDialogVisible.value = true;
    };

    // 关闭预览对话框
    const closePreviewDialog = () => {
      previewDialogVisible.value = false;
      previewAsset.value = null;
    };

    // 下载文件
    const downloadFile = (asset: Asset) => {
      window.open(asset.assetUrl, '_blank');
    };

    // 判断文件类型
    const isImage = (url: string): boolean => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      return imageExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
    };

    const isPdf = (url: string): boolean => {
      return url.toLowerCase().endsWith('.pdf');
    };

    const isText = (url: string): boolean => {
      const textExtensions = ['txt', 'log', 'csv', 'html', 'htm', 'xml', 'json'];
      return textExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
    };

    const isAudio = (url: string): boolean => {
      const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
      return audioExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
    };

    const isVideo = (url: string): boolean => {
      const videoExtensions = ['mp4', 'webm', 'ogg', 'flv', 'mov', 'avi', 'wmv', 'mkv'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(`.${ext}`));
    };

    return {
      previewDialogVisible,
      previewAsset,
      chapters,
      selectedChapterId,
      selectedChapterLabel,
      assets,
      loading,
      handleChapterSelection,
      formatFileSize,
      previewFile,
      closePreviewDialog,
      downloadFile,
      isImage,
      isPdf,
      isText,
      isAudio,
      isVideo,
    };
  },
});
</script>

<template>
  <div>
    <el-card shadow="never">
      <div class="container">
        <aside class="tree-container">
          <el-tree
            v-if="chapters.length"
            :data="chapters"
            node-key="id"
            default-expand-all
            draggable
            @node-click="handleChapterSelection"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span :class="{'selected': selectedChapterId === data.id}">{{ data.label }}</span>
              </div>
            </template>
          </el-tree>
          <div v-else class="no-chapters">
            <el-empty description="暂无章节，请先添加章节" :image-size="200"></el-empty>
          </div>
        </aside>
        <el-main class="table-container">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          <div v-else>
            <div v-if="selectedChapterId" class="selected-info">
              <p>已选择章节：{{ selectedChapterLabel }}</p>
            </div>
            <div v-else class="selected-info">
              <p>请先选择章节以获取课程资源</p>
            </div>
            <el-table :data="assets" border stripe style="width: 100%; margin-top: 20px;">
              <el-table-column prop="assetName" label="文件名" />
              <el-table-column prop="assetType" label="文件类型" />
              <el-table-column label="文件大小">
                <template #default="scope">
                  {{ formatFileSize(scope.row.assetSize) }}
                </template>
              </el-table-column>
              <el-table-column prop="assetPermission" label="权限" />
              <el-table-column prop="uploadTime" label="上传时间" />
              <el-table-column prop="downloadCount" label="下载次数" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" link @click="previewFile(scope.row)">预览</el-button>
                  <el-button type="danger" :disabled="scope.row.assetPermission === 'VIEW_ONLY'" link @click="downloadFile(scope.row)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-main>
      </div>
    </el-card>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="文件预览" width="80%" :before-close="closePreviewDialog">
      <div v-if="previewAsset">
        <div v-if="isImage(previewAsset.assetName)">
          <img :src="previewAsset.assetUrl" alt="图片预览" style="max-width: 100%; max-height: 600px;" />
        </div>
        <div v-else-if="isPdf(previewAsset.assetName)">
          <embed :src="previewAsset.assetUrl" type="application/pdf" style="width: 100%; height: 600px;" />
        </div>
        <div v-else-if="isText(previewAsset.assetName)">
          <iframe :src="previewAsset.assetUrl" style="width: 100%; height: 600px; border: none;"></iframe>
        </div>
        <div v-else-if="isAudio(previewAsset.assetName)">
          <audio :src="previewAsset.assetUrl" controls style="width: 100%;"></audio>
        </div>
        <div v-else-if="isVideo(previewAsset.assetName)">
          <video :src="previewAsset.assetUrl" controls style="width: 100%;"></video>
        </div>
        <div v-else>
          <p>该文件类型不支持在线预览，请下载查看。</p>
          <el-button type="primary" @click="downloadFile(previewAsset)">下载文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 20px;
}

.tree-container {
  flex: 0 0 300px;
}

.table-container {
  flex: 1;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.no-chapters {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.selected {
  color: #409eff;
  font-weight: bold;
}
.selected-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>