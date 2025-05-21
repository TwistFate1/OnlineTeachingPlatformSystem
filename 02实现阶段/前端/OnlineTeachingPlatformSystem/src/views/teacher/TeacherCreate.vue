<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch } from 'vue';
import { ElMessage, genFileId, type FormInstance, type UploadFile, type UploadInstance, type UploadProps, type UploadRawFile } from 'element-plus';
import { fetchCategories, insertClassification, insertCourse, uploadFile } from '@/api/data';
import router from '@/router';
import { useUserStore } from '@/stores/user';

export default defineComponent({
  name: 'TeacherCreateCourse',
  setup() {
    const userStore = useUserStore();
    const courseData = reactive({
      accountId: userStore.id,
      courseName: '',
      courseType: '',
      courseBrief: '',
      coverImageFile: null as Blob | null,
      coverImageUrl: '',
      teachingObjectives: '',
      cost: '',
      teachingStartTime: '',
      teachingEndTime: '',
      classification: [], // 添加分类字段
    });

    const activeStep = ref(0);
    const courseForm = ref<FormInstance>();
    const classifications = ref<{ value: string; label: string }[]>([]);
    const selectedCourseTypeName = ref('');

    // 开始时间选择器选项禁用
    const startDatePickerOptions = (time: Date) => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return time.getTime() < oneWeekAgo;
    };

    // 结束时间选择器选项（依赖开始时间）
    const endDatePickerOptions = (time: Date) => {
      if (!courseData.teachingStartTime) return true;
      const startTime = new Date(courseData.teachingStartTime);
      // 结束时间必须在开始时间的一周后
      const oneWeekLater = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
      return time.getTime() < oneWeekLater.getTime();
    };

    // 获取课程类型
    onMounted(async () => {
      try {
        const fetchedCategories = await fetchCategories();
        classifications.value = fetchedCategories.map((item: { categoryId: string; categoryInfo: string; }) => ({
          value: item.categoryId,
          label: item.categoryInfo,
        }));
      } catch (error) {
        console.error('获取课程类型失败:', error);
        ElMessage.error('获取课程类型失败');
      }
    });

    // 处理封面图片上传（支持覆盖上传）
    const handleCoverImageChange = (file: UploadFile) => {
      if (file.raw) {
        courseData.coverImageFile = file.raw;
        courseData.coverImageUrl = URL.createObjectURL(file.raw);
      }
    };

    // 限制图片尺寸和大小
    const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
      const isImage = rawFile.type.startsWith('image/');
      if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
      }

      const isSizeOk = rawFile.size / 1024 / 1024 < 2;
      if (!isSizeOk) {
        ElMessage.error('图片大小不能超过 2MB!');
        return false;
      }

      const img = new Image();
      const url = URL.createObjectURL(rawFile);
      console.log(url)
      img.src = url;
      return new Promise((resolve) => {
        img.onload = () => {
          const isDimensionsOk = img.width >= 200 && img.height >= 200;
          if (!isDimensionsOk) {
            ElMessage.error('图片尺寸不能小于 200x200 像素!');
            return false;
          }
          URL.revokeObjectURL(url);
          resolve(true);
        };
      });
    };

    const upload = ref<UploadInstance>()

    const handleExceed: UploadProps['onExceed'] = (files) => {
      upload.value!.clearFiles();
      const file = files[0] as UploadRawFile;
      file.uid = genFileId();
      upload.value!.handleStart(file);
    }

    // 格式化日期显示
    const formatDate = (dateString: string | number | Date) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
      const day = date.getDate().toString().padStart(2, '0'); // 日期补零
      const hours = date.getHours().toString().padStart(2, '0'); // 小时补零
      const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    };

    // 上一步
    const prevStep = () => {
      activeStep.value = 0;
      if (courseData.coverImageFile) {
        courseData.coverImageUrl = URL.createObjectURL(courseData.coverImageFile);
      }
    };

    // 验证表单并进入下一步
    const validateForm = () => {
      if (courseForm.value) {
        courseForm.value.validate((valid) => {
          if (valid) {
            activeStep.value = 1;
            // 确保在切换步骤时重新生成图片 URL
            if (courseData.coverImageFile) {
              courseData.coverImageUrl = URL.createObjectURL(courseData.coverImageFile);
            }
          } else {
            ElMessage.error('请填写所有必填字段并确保格式正确');
          }
        });
      } else {
        ElMessage.error('表单未正确加载');
      }
    };

    const createCourse = async () => {
      try {
        // 1. 上传封面图片
        if (courseData.coverImageFile) {
          const uploadResult = await uploadFile(courseData.coverImageFile as File);
          if (uploadResult.code !== 200) {
            throw new Error('封面上传失败');
          }
          courseData.coverImageUrl = uploadResult.data; // 保存上传后的图片 URL
          ElMessage.success('封面上传成功');
        }

        // 2. 提交课程信息
        const courseToSend = {
          accountId: courseData.accountId,
          courseName: courseData.courseName,
          courseType: courseData.courseType,
          courseBrief: courseData.courseBrief,
          coverImageUrl: courseData.coverImageUrl,
          teachingObjectives: courseData.teachingObjectives,
          cost: courseData.cost,
          teachingStartTime: courseData.teachingStartTime,
          teachingEndTime: courseData.teachingEndTime,
        };
        const response = await insertCourse(courseToSend);
        if (response.code !== 200) {
          throw new Error('课程插入失败');
        }
        const courseId = response.data;
        ElMessage.success('课程插入成功');

        // 3. 处理课程分类
        if (courseData.classification && courseData.classification.length > 0) {
          const classificationResponse = await insertClassification(courseId, courseData.classification);
          if (classificationResponse.code !== 200) {
            throw new Error('课程分类关联失败');
          }
          ElMessage.success('课程分类关联成功');
        }
        router.push('/profile/teacher/courses');
      } catch (error) {
        ElMessage.error('课程创建失败');
      }
    };

    // 自定义验证函数：检查课程价格
    const validateCost = (rule: any, value: number, callback: any) => {
      if (value < 0) {
        callback(new Error('课程价格不能为负数'));
      } else if ((value === 0 && Number(courseData.cost) !== 0) || (value > 0 && Number(courseData.cost) <= 0)) {
        callback(new Error('请输入有效的课程价格'));
      } else {
        callback();
      }
    };

    // 集中管理验证规则
    const rules = reactive({
      courseName: [
        { required: true, message: '请输入课程名称', trigger: 'blur' },
        { min: 1, max: 30, message: '课程名称长度应在1到30个字符之间', trigger: 'blur' },
      ],
      courseType: [
         { required: true, message: '请选择课程模式', trigger: 'change' },
      ],
      classification: [
        { required: true, message: '请选择至少一个课程类型', trigger: 'change' },
      ],
      courseBrief: [
        { required: true, message: '请输入课程简介', trigger: 'change' },
        { min: 1, max: 255, message: '课程简介长度应在1到255个字符之间', trigger: 'change' },
      ],
      coverImageFile: [
        { required: true, message: '请上传封面图片', trigger: 'change' },
      ],
      teachingObjectives: [
        { required: true, message: '请输入教学目标', trigger: 'change' },
        { min: 1, max: 255, message: '教学目标长度应在1到255个字符之间', trigger: 'change' },
      ],
      cost: [
        { required: true, message: '请输入课程价格' },
        { validator: validateCost, trigger: 'change' },
      ],
      teachingStartTime: [
        { required: true, message: '请选择开始时间', trigger: 'blur' },
      ],
      teachingEndTime: [
        { required: true, message: '请选择结束时间', trigger: 'blur' },
      ]
    });

    // 监听开始时间变化，重置结束时间
    watch(() => courseData.teachingStartTime, (newVal) => {
      if (newVal) {
        courseData.teachingEndTime = '';
      }
    });

    return {
      upload,
      courseData,
      activeStep,
      courseForm,
      classifications,
      selectedCourseTypeName,
      startDatePickerOptions,
      endDatePickerOptions,
      formatDate,
      handleCoverImageChange,
      prevStep,
      validateForm,
      createCourse,
      rules, // 返回集中管理的验证规则
      beforeAvatarUpload, // 返回上传前的检查函数
      handleExceed,
    };
  },
});
</script>

<template>
  <el-card>
    <el-steps :active="activeStep" align-center style="margin-bottom: 20px;">
      <el-step title="填写信息"></el-step>
      <el-step title="确认信息"></el-step>
    </el-steps>

    <div v-if="activeStep === 0">
      <el-form
        label-width="120px" 
        ref="courseForm" 
        :model="courseData"
        :rules="rules"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="courseData.courseName" clearable placeholder="请输入课程名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程类型" prop="courseType">
              <el-select v-model="courseData.courseType" placeholder="请选择课程类型">
                <el-option label="公开" value="公开" />
                <el-option label="私有" value="私有" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程分类" prop="classification">
              <el-select
                v-model="courseData.classification"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择课程分类"
              >
                <el-option
                  v-for="item in classifications"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程简介" prop="courseBrief">
              <el-input autosize v-model="courseData.courseBrief" type="textarea" placeholder="请输入课程简介"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教学目标" prop="teachingObjectives">
              <el-input autosize v-model="courseData.teachingObjectives" type="textarea" placeholder="请输入教学目标"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="封面图片" prop="coverImageFile">
              <el-upload
                ref="upload"
                drag
                class="upload"
                :auto-upload="false"
                :on-change="handleCoverImageChange"
                list-type="picture"
                :limit="1"
                accept="image/*"
                :file-list="courseData.coverImageUrl ? [{url: courseData.coverImageUrl}] : []"
                :on-exceed="handleExceed"
                :before-upload="beforeAvatarUpload"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <template #tip>只能上传图片文件，支持覆盖上传</template>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程价格" prop="cost">
              <el-input type="number" v-model.number="courseData.cost" placeholder="请输入课程价格（免费请填0）"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间" prop="teachingStartTime">
              <el-date-picker
                v-model="courseData.teachingStartTime"
                type="datetime"
                placeholder="选择开始时间"
                :disabled-date="startDatePickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="teachingEndTime" :rules="rules.teachingEndTime">
              <el-date-picker
                v-model="courseData.teachingEndTime"
                type="datetime"
                placeholder="选择结束时间"
                :disabled="!courseData.teachingStartTime"
                :disabled-date="endDatePickerOptions"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="button" :span="12"></el-col>
          <el-col class="button" :span="12">
            <el-form-item>
              <el-button type="primary" @click="validateForm">下一步</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        
      </el-form>
    </div>

    <div v-if="activeStep === 1">
      <el-descriptions border :column="4" style="margin-bottom: 20px;">
        <el-descriptions-item label="课程名称" align="center">{{ courseData.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程类型" align="center">{{ courseData.courseType }}</el-descriptions-item>
        <el-descriptions-item label="课程分类" :span="2" label-align="center">
          <el-tag
            v-for="id in courseData.classification"
            :key="id"
          >
            {{ classifications.find(t => t.value === id)?.label || '未知分类' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="教学目标" :span="4" label-align="center">{{ courseData.teachingObjectives }}</el-descriptions-item>
        <el-descriptions-item label="课程简介" :span="4" label-align="center">{{ courseData.courseBrief }}</el-descriptions-item>
        <el-descriptions-item label="封面图片" align="center">
          <img :src="courseData.coverImageUrl" style="max-width: 200px; max-height: 200px;" />
        </el-descriptions-item>
        <el-descriptions-item label="课程价格" align="center">{{ Number(courseData.cost) === 0 ? '免费' : `${courseData.cost} ¥` }}</el-descriptions-item>
        <el-descriptions-item label="开始时间" align="center">{{ formatDate(courseData.teachingStartTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间" align="center">{{ formatDate(courseData.teachingEndTime) }}</el-descriptions-item>
      </el-descriptions>
      <el-row>
        <el-col class="button" :span="12">
          <el-button @click="prevStep">返回修改</el-button>
        </el-col>
        <el-col class="button" :span="12">
          <el-button type="primary" @click="createCourse">确认提交</el-button>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<style scoped>
.upload {
  width: 100%;
}
.button {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>