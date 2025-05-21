// src/api.ts
import axios from 'axios';

// 创建一个 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // API 网关的地址
  timeout: 10000,
  withCredentials: true, // 打开withCredentials选项
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在这里可以添加请求前的处理逻辑，例如添加 token 到请求头
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 在这里可以添加响应后的处理逻辑
    return response;
  },
  (error) => {
    // 处理请求错误
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

// 封装获取角色列表的函数
export const fetchRoles = async () => {
  try {
    const response = await apiClient.get('/api/account_service/positions');
    return response.data;
  } catch (error) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
};

// 封装获取省份列表的函数
export const fetchProvinces = async () => {
  try {
    const response = await apiClient.get('/api/account_service/provinces');
    return response.data;
  } catch (error) {
    console.error('获取省份列表失败:', error);
    throw error;
  }
};

// 封装根据省份 ID 获取城市列表的函数
export const fetchCitiesByProvinceId = async (provinceId: any) => {
  try {
    const response = await apiClient.get(`/api/account_service/cities`, {
      params: {
        provinceId: provinceId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取城市列表失败:', error);
    throw error;
  }
};

// 封装获取学校列表的函数
export const fetchSchools = async () => {
  try {
    const response = await apiClient.get(`/api/account_service/schools`);
    return response.data;
  } catch (error) {
    console.error('获取学校列表失败:', error);
    throw error;
  }
};

// 封装获取专业列表的函数
export const fetchMajors = async () => {
  try {
    const response = await apiClient.get(`/api/account_service/majors`);
    return response.data;
  } catch (error) {
    console.error('获取专业列表失败:', error);
    throw error;
  }
};

// 封装注册函数
export const registerUser = async (userData: any) => {
  try {
    const response = await apiClient.post('/api/account_service/register', userData);
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

// 封装获取验证码的 API
export const fetchCaptcha = async (identifier: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/captcha`, {
      params: {
        identifier: identifier,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取验证码失败:', error);
    throw error;
  }
};

// 封装登录的 API
export const loginApi = async (loginData: any): Promise<any> => {
  try {
    const response = await apiClient.post('/api/account_service/login', loginData);
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 获取用户信息 API
export const fetchAccountInfo = async (accountId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/account_service/account', {
      params: {
        accountId: accountId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

export const fetchUserInfo = async (accountId: any, positionId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/info`, {
      params: {
        accountId: accountId,
        positionId: positionId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取信息失败:', error);
    throw error;
  }
};

export const fetchPosition = async (positionId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/position`, {
      params: {
        positionId: positionId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取角色信息失败:', error);
    throw error;
  }
};

export const fetchSchool = async (schoolId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/school`, {
      params: {
        schoolId: schoolId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取学校信息失败:', error);
    throw error;
  }
};

export const fetchMajor = async (majorId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/major`, {
      params: {
        majorId: majorId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取专业信息失败:', error);
    throw error;
  }
};

export const fetchCity = async (cityId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/city`, {
      params: {
        cityId: cityId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取城市信息失败:', error);
    throw error;
  }
};

export const fetchProvince = async (provinceId: any): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/account_service/province`, {
      params: {
        provinceId: provinceId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取省份信息失败:', error);
    throw error;
  }
};

export const updateProfile = async (accountId: any, positionId: any, personalProfile: any): Promise<any> => {
  try {
    const response = await apiClient.put('/api/account_service/profile', null, {
      params: {
        accountId,
        positionId,
        personalProfile
      }
    });
    return response.data;
  } catch (error) {
    console.error('更新个人简介失败:', error);
    throw error;
  }
};

// 获取所有课程分类
export const fetchCategories = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/course_service/categories');
    return response.data;
  } catch (error) {
    console.error('获取课程类别失败:', error);
    throw error;
  }
};

// 上传文件
export const uploadFile = async (file: File): Promise<any> => {
  try {
    // 创建 FormData 实例
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/file_service/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
};

// 封装创建课程函数
export const insertCourse = async (courseData: any): Promise<any> => {
  try {
    const response = await apiClient.post('/api/course_service/create', courseData);
    return response.data;
  } catch (error) {
    console.error('创建课程失败:', error);
    throw error;
  }
};

// 关联课程分类
export const insertClassification = async (courseId: number, classifications: string[]): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/course_service/classifications`, {
      courseId,
      classifications,
    });
    return response.data;
  } catch (error) {
    console.error('课程分类关联失败:', error);
    throw error;
  }
};

// 获取教师所有课程
export const fetchTeacherCourses = async (accountId: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/course_service/teacher/courses`, {
      params: {
        accountId: accountId
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取教师课程失败:', error);
    throw error;
  }
};

// 根据courseId列表获取分类名称
export const fetchCourseClassifications = async (courseIds: number[]): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/course_service/courses/classifications`, {
      params: {
        courseIds: courseIds
      },
      paramsSerializer: (params) => { // 添加 paramsSerializer
        return new URLSearchParams(params).toString();
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取课程分类失败:', error);
    throw error;
  }
};

// 获取所有公开课程
export const fetchPublicCourses = async (): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/course_service/courses/public`);
    return response.data;
  } catch (error) {
    console.error('获取公开课程失败:', error);
    throw error;
  }
};

// 封装订阅课程接口
export const subscribeCourse = async (courseId: number, studentId: number, cost: number): Promise<any> => {
  try {
    const response = await apiClient.post('/api/payment_service/subscribe', {
      courseId: courseId,
      studentId: studentId,
      cost: cost
    });
    return response.data;
  } catch (error) {
    console.error('订阅课程失败:', error);
    throw error;
  }
};

// 封装检查订阅状态接口
export const checkSubscribe = async (studentId: number, courseId: number): Promise<any> => {
  try {
    const response = await apiClient.get('/api/payment_service/subscribe/check', {
      params: {
        studentId: studentId,
        courseId: courseId
      }
    });
    return response.data;
  } catch (error) {
    console.error('检查订阅状态失败:', error);
    throw error;
  }
};

// 封装获取学生订阅课程接口
export const fetchStudentSubscriptions = async (studentId: number): Promise<any> => {
  try {
    const response = await apiClient.get('/api/payment_service/subscriptions', {
      params: {
        studentId: studentId
      }
    });
    return response.data; // 返回 courseId 列表
  } catch (error) {
    console.error('获取订阅课程 ID 列表失败:', error);
    throw error;
  }
};

// 封装获取课程列表接口
export const fetchCoursesByCourseIds = async (courseIds: number[]): Promise<any> => {
  try {
    const response = await apiClient.post('/api/course_service/courses/by-ids', 
      courseIds
    );
    return response.data; // 返回课程列表
  } catch (error) {
    console.error('获取课程列表失败:', error);
    throw error;
  }
};

// 搜索课程
export const searchCourses = async (name: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/course_service/courses/search', {
      params: {
        name: name
      }
    });
    return response.data;
  } catch (error) {
    console.error('搜索课程失败:', error);
    throw error;
  }
};

// 获取课程信息
export const getCourseById = async (courseId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/course_service/course', {
      params: { courseId: courseId }
    });
    return response.data;
  } catch (error) {
    console.error('获取课程信息失败:', error);
    throw error;
  }
};

// 获取课程分类
export const getCourseClassifications = async (courseId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/course_service/course/classifications', {
      params: { courseId: courseId }
    });
    return response.data;
  } catch (error) {
    console.error('获取课程分类失败:', error);
    throw error;
  }
};

// 获取章节数据
export const getChapters = async (courseId: number): Promise<any> => {
  try {
    const response = await apiClient.get('/api/teaching_service/chapters', {
      params: { courseId: courseId },
    });
    return response.data;
  } catch (error) {
    console.error('获取章节失败:', error);
    throw error;
  }
};

// 插入章节数据
export const insertChapters = async (courseId: number, chapters: any[]): Promise<any> => {
  try {
    const response = await apiClient.post('/api/teaching_service/chapters', {
      courseId: courseId,
      chapters: chapters,
    });
    return response.data;
  } catch (error) {
    console.error('插入章节失败:', error);
    throw error;
  }
};

// 插入资源
export const saveAsset = async (asset: any): Promise<any> => {
  try {
    const response = await apiClient.post('/api/teaching_service/assets', asset);
    return response.data;
  } catch (error) {
    console.error('插入章节失败:', error);
    throw error;
  }
};

// 获取指定章节的资源列表
export const fetchChapterAssets = async (chapterId: number): Promise<any> => {
  try {
    const response = await apiClient.get('/api/teaching_service/assets', {
      params: {
        chapterId: chapterId
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取章节资源列表失败:', error);
    throw error;
  }
};

// 获取课程学生列表
export const fetchCourseStudent = async (courseId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/payment_service/course/students', {
      params: {
        courseId: courseId
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取课程学生列表失败:', error);
    throw error;
  }
};

// 获取课程根评论列表
export const fetchRootDiscussions = async (courseId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/interaction_service/discussions/root', {
      params: {
        courseId: courseId
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取课程根评论列表失败:', error);
    throw error;
  }
};

// 获取评论子评论列表
export const fetchSubDiscussions = async (discussionId: any): Promise<any> => {
  try {
    const response = await apiClient.get('/api/interaction_service/discussions/sub', {
      params: {
        discussionId: discussionId
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取子评论列表失败:', error);
    throw error;
  }
};

// 上传评论
export const uploadDiscussion = async (discussionData: any) => {
  try {
    const response = await apiClient.post('/api/interaction_service/discussions', discussionData);
    // 检查后端返回的Result对象
    return response.data;
  } catch (error) {
    console.error('上传评论失败:', error);
    return { success: false, data: null, message: '请求失败，请检查网络或联系管理员' };
  }
};
