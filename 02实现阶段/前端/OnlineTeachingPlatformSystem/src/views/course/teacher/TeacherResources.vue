<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, type UploadFile } from 'element-plus';
import { getChapters, insertChapters, uploadFile, saveAsset } from '@/api/data';
import { useRoute } from 'vue-router';

interface Chapter {
  id: number;
  label: string;
  isOriginal?: boolean;
  children?: Chapter[];
}

export default defineComponent({
  setup() {
    const showChapterForm = ref(false);
    const newChapter = reactive<Chapter>({
      id: 0,
      label: '',
    });
    const route = useRoute();
    const courseId = Number(route.params.courseId);
    const selectedChapter = ref<Chapter | null>(null);
    const selectedChapterId = ref<number | null>(null);
    const selectedChapterLabel = ref<string | null>(null);

    const chapters = reactive<Chapter[]>([]);
    const activeStep = ref(0);

    const isAddButtonDisabled = computed(() => chapters.length > 0);
    const isDisabled = ref<boolean>(true);

    const permissionOptions = [
      { label: '仅查看', value: 'VIEW_ONLY' },
      { label: '可下载', value: 'DOWNLOAD' }
    ];

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
          // 给每个初始章节添加 isOriginal 属性
          const chaptersWithData = response.data.map((chapter: Chapter) => {
            return recursivelySetIsOriginal(chapter);
          });
          chapters.splice(0, chapters.length, ...chaptersWithData);
          if (chapters.length > 0) {
            isDisabled.value = true;
          } else {
            isDisabled.value = false;
          }
          ElMessage.success('获取章节数据成功');
        } else {
          ElMessage.error('获取章节数据失败');
        }
      } catch (error) {
        ElMessage.error('获取章节数据失败');
      }
    };

    onMounted(() => {
      getChaptersData();
    });

    const addChapter = () => {
      if (!newChapter.label.trim()) {
        alert('章节标题不能为空');
        return;
      }

      const newChapterItem: Chapter = {
        id: Date.now(),
        label: newChapter.label,
        children: [],
      };

      if (selectedChapter.value) {
        if (!selectedChapter.value.children) {
          selectedChapter.value.children = [];
        }
        selectedChapter.value.children.push(newChapterItem);
      } else {
        chapters.push(newChapterItem);
      }

      newChapter.label = '';
      selectedChapter.value = null;
      showChapterForm.value = false;
    };

    const addTopLevelChapter = () => {
      selectedChapter.value = null; // 确保添加顶级章节
      showChapterForm.value = true;
    };

    const append = (data: Chapter) => {
      selectedChapter.value = data;
      showChapterForm.value = true;
    };

    const remove = (node: any, data: Chapter) => {
      if (data.isOriginal) {
        alert('无法删除原始章节');
        return;
      }

      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d: Chapter) => d.id === data.id);
      children.splice(index, 1);
    };

    const handleNodeClick = (data: Chapter) => {
      selectedChapter.value = data;
    };

    // 提交章节到后端
    const submitChapters = async () => {
      try {
        if (!chapters.length) {
          ElMessage.warning('没有章节数据可提交');
          return;
        }

        const response = await insertChapters(courseId, chapters);

        if (response.code === 200) {
          isDisabled.value = true;
          getChaptersData();
          ElMessage.success('章节提交成功');
        } else {
          ElMessage.error('章节提交失败');
        }
      } catch (error) {
        ElMessage.error('章节提交失败');
      }
    };

    // 下一步
    const nextStep = () => {
      if (activeStep.value === 0 && !chapters.length) {
        ElMessage.warning('请先添加章节');
        return;
      }
      if (activeStep.value === 1 && !selectedChapterId.value) {
        ElMessage.warning('请先选择章节');
        return;
      }
      activeStep.value++;
    };

    // 上一步
    const prevStep = () => {
      activeStep.value--;
    };

    // 处理章节选择
    const handleChapterSelection = (data: Chapter) => {
      selectedChapterId.value = data.id;
      selectedChapterLabel.value = data.label;
    };

    // 文件上传相关
    const fileList = ref<UploadFile[]>([]);
    const selectedPermission = ref('VIEW_ONLY'); // 添加权限选择
    const uploadDialogVisible = ref(false);
    const uploading = ref(false);
    const uploadProgress = ref(0);

    // 文件上传前验证
    const beforeUpload = (file: File): boolean => {
      const isFileAllowed = file.type.match('image/*') || file.type.match('video/*') || file.type.match('application/pdf');
      if (!isFileAllowed) {
        ElMessage.error('只支持图片、视频和PDF文件！');
        return false;
      }

      const isSizeOk = file.size / 1024 / 1024 < 100;
      if (!isSizeOk) {
        ElMessage.error('每个文件大小不能超过 100MB!');
        return false;
      }

      return true;
    };

    // 文件选择变化时触发
    const handleFileChange = (file: UploadFile, newFileList: UploadFile[]) => {
      fileList.value = newFileList;
    };

    // 超出文件数量限制时触发
    const handleExceed = (files: File[]) => {
      ElMessage.warning(`最多上传10个文件，当前已选择${fileList.value.length}个文件`);
    };

    // 上传文件
    const submitUpload = () => {
      if (!selectedChapterId.value) {
        ElMessage.warning('请先选择章节');
        return;
      }

      if (fileList.value.length === 0) {
        ElMessage.warning('请先选择文件');
        return;
      }

      if (!selectedPermission.value) {
        ElMessage.warning('请先选择文件权限');
        return;
      }

      uploadDialogVisible.value = true;
      uploading.value = true;
      uploadProgress.value = 0;

      // 遍历文件列表，逐个上传文件
      let uploadedCount = 0;
      const totalFiles = fileList.value.length;

      fileList.value.forEach((fileItem, index) => {
        uploadFileItem(fileItem.raw as unknown as File, index, totalFiles, () => {
          uploadedCount++;
          uploadProgress.value = Math.round((uploadedCount / totalFiles) * 100);
          if (uploadedCount === totalFiles) {
            uploading.value = false;
            uploadDialogVisible.value = false;
            fileList.value = [];
            ElMessage.success('所有文件上传完成');
          }
        });
      });
    };

    // 上传文件到后端
    const uploadFileItem = async (file: File, index: number, totalFiles: number, onComplete: () => void) => {
      try {
        const response = await uploadFile(file);
        if (response.code === 200) {
          ElMessage.success(`文件 ${index + 1}/${totalFiles} 上传成功`);
          // 在这里可以添加保存资源信息的逻辑
          if (selectedChapterId.value !== null) {
            saveAssetToDatabase(file, response.data, selectedChapterId.value);
          }
        } else {
          ElMessage.error(`文件 ${index + 1}/${totalFiles} 上传失败`);
        }
      } catch (error) {
        ElMessage.error(`文件 ${index + 1}/${totalFiles} 上传失败`);
      } finally {
        onComplete();
      }
    };

    // 保存资源信息到数据库
    const saveAssetToDatabase = async (file: File, url: string, chapterId: number) => {
      try {
        const asset = {
          chapterId: chapterId,
          assetUrl: url,
          assetPermission: selectedPermission.value, // 使用用户选择的权限
          assetName: file.name,
          assetType: file.name.split('.').pop(),
          assetSize: file.size,
          downloadCount: 0
        };

        const response = await saveAsset(asset);
        if (response.code === 200) {
          ElMessage.success('资源信息保存成功');
        } else {
          ElMessage.error('资源信息保存失败');
        }
      } catch (error) {
        ElMessage.error('资源信息保存失败');
      }
    };

    return {
      showChapterForm,
      newChapter,
      chapters,
      addChapter,
      addTopLevelChapter,
      append,
      remove,
      handleNodeClick,
      selectedChapter,
      submitChapters,
      isAddButtonDisabled,
      isDisabled,
      nextStep,
      prevStep,
      activeStep,
      selectedChapterId,
      selectedChapterLabel,
      handleChapterSelection,
      handleExceed,
      beforeUpload,
      handleFileChange,
      submitUpload,
      selectedPermission,
      permissionOptions,
      uploadDialogVisible,
      uploading,
      uploadProgress
    };
  },
});
</script>

<template>
  <div>
    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="章节管理" />
      <el-step title="章节选择" />
      <el-step title="资源上传" />
    </el-steps>
    <el-card shadow="never" class="upload-content">
      <div v-if="activeStep === 0">
        <el-row :gutter="20">
          <el-col class="button" :span="8">
            <el-button type="primary" @click="addTopLevelChapter" :disabled="isDisabled">
              添加顶级章节
            </el-button>
          </el-col>
          <el-col class="button" :span="8">
            <el-button type="success" @click="submitChapters" :disabled="isDisabled">
              提交章节
            </el-button>
          </el-col>
          <el-col class="button" :span="8">
            <el-button type="success" @click="nextStep" :disabled="!isAddButtonDisabled">
              选择章节
            </el-button>
          </el-col>
        </el-row>

        <el-dialog v-model="showChapterForm" title="添加章节">
          <el-form>
            <el-form-item label="章节标题">
              <el-input v-model="newChapter.label" placeholder="请输入章节标题"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showChapterForm = false">取消</el-button>
              <el-button type="primary" @click="addChapter">添加</el-button>
            </span>
          </template>
        </el-dialog>

        <el-tree
          v-if="chapters.length"
          :data="chapters"
          node-key="id"
          default-expand-all
          draggable
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span>{{ data.label }}</span>
              <div>
                <el-button
                  type="primary"
                  link
                  @click.stop="append(data)"
                  :disabled="data.isOriginal"
                >
                  添加子章节
                </el-button>
                <el-button
                  type="danger"
                  link
                  style="margin-left: 4px"
                  @click.stop="remove(node, data)"
                  :disabled="data.isOriginal"
                >
                  删除章节
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>

        <div v-else class="no-chapters">
          <el-empty description="暂无章节，请先添加章节" :image-size="200"></el-empty>
        </div>
      </div>

      <div v-if="activeStep === 1">
        <el-row :gutter="20">
          <el-col class="button" :span="8">
            <el-button type="primary" @click="prevStep">
              返回
            </el-button>
          </el-col>
          <el-col :span="8"></el-col>
          <el-col class="button" :span="8">
            <el-button type="success" @click="nextStep" :disabled="!selectedChapterId">
              上传资源
            </el-button>
          </el-col>
        </el-row>

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

        <div v-if="selectedChapterId" class="selected-info">
          <p>已选择章节：{{ selectedChapterLabel }}</p>
        </div>
      </div>

      <div v-if="activeStep === 2">
        <el-row :gutter="20">
          <el-col class="button" :span="8">
            <el-button type="primary" @click="prevStep">
              返回
            </el-button>
          </el-col>
          <el-col :span="8"></el-col>
          <el-col class="button" :span="8">
            <el-button type="success" @click="submitUpload">
              确认上传
            </el-button>
          </el-col>
        </el-row>
        <div class="resource-upload">
          <p>选中的章节 ID：{{ selectedChapterId }}</p>
          <p>选中的章节名称：{{ selectedChapterLabel }}</p>

          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            action=""
            :auto-upload="false"
            :limit="10"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持多种格式，最多上传10个文件，单个文件不超过100MB</div>
            </template>
          </el-upload>

          <!-- 权限选择 -->
          <div style="margin-top: 20px;">
            <el-select v-model="selectedPermission" placeholder="请选择文件权限">
              <el-option
                v-for="item in permissionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>

          <el-dialog v-model="uploadDialogVisible" title="上传进度" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
            <div class="upload-progress">
              <el-progress :percentage="uploadProgress" />
              <p>正在上传: {{ uploadProgress }}%</p>
            </div>
          </el-dialog>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.button {
  text-align: center;
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
.upload-content {
  margin-top: 20px;
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
.resource-upload {
  margin-top: 20px;
}
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>