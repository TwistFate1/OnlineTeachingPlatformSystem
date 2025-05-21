import { useUserStore } from '@/stores/user';
import { createRouter, createWebHistory, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router';
import { ElMessage } from 'element-plus'; // 引入 Element Plus 的消息提示组件

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false }, // 不需要认证
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }, // 不需要认证
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }, // 不需要认证
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('@/views/CoursesView.vue'),
      meta: { requiresAuth: false }, // 不需要认证
    },
    {
      path: '/schools',
      name: 'schools',
      component: () => import('@/views/SchoolsView.vue'),
      meta: { requiresAuth: false }, // 不需要认证
    },
    {
      path: '/ai-dialog',
      name: 'ai',
      component: () => import('@/views/ChatWindow.vue'),
      meta: { requiresAuth: true }, // 需要认证
    },
    {
      path: '/course',
      name: 'course',
      component: () => import('@/views/course/CourseView.vue'),
      children: [
        {
          path: 'teacher/:courseId',
          name: 'TeacherCourse',
          component: () => import('@/views/course/teacher/TeacherCourse.vue'),
          meta: { requiredRole: 'teacher' }, // 需要教师角色
          children: [
            {
              path: 'info',
              name: 'TeacherCourseInfo',
              component: () => import('@/views/course/CourseInfo.vue'),
            },
            {
              path: 'student',
              name: 'TeacherStudent',
              component: () => import('@/views/course/teacher/TeacherStudent.vue'),
            },
            {
              path: 'resources',
              name: 'TeacherResources',
              component: () => import('@/views/course/teacher/TeacherResources.vue'),
            },
            {
              path: 'lists',
              name: 'TeacherCourseLists',
              component: () => import('@/views/course/CourseLists.vue'),
            },
            {
              path: 'homework',
              name: 'TeacherHomework',
              component: () => import('@/views/course/teacher/TeacherHomework.vue'),
            },
            {
              path: 'quiz',
              name: 'TeacherQuiz',
              component: () => import('@/views/course/teacher/TeacherQuiz.vue'),
            },
            {
              path: 'live',
              name: 'TeacherLive',
              component: () => import('@/views/course/teacher/TeacherLive.vue'),
            },
            {
              path: 'discussion',
              name: 'TeacherCourseDiscussion',
              component: () => import('@/views/course/CourseDiscussion.vue'),
            },
            {
              path: 'review',
              name: 'TeacherCourseReview',
              component: () => import('@/views/course/CourseReview.vue'),
            }
          ]
        },
        {
          path: 'student/:courseId',
          name: 'StudentCourse',
          component: () => import('@/views/course/student/StudentCourse.vue'),
          meta: { requiredRole: 'student' }, // 需要学生角色
          children: [
            {
              path: 'info',
              name: 'StudentCourseInfo',
              component: () => import('@/views/course/CourseInfo.vue'),
            },
            {
              path: 'lists',
              name: 'StudentCourseLists',
              component: () => import('@/views/course/CourseLists.vue'),
            },
            {
              path: 'homework',
              name: 'StudentHomework',
              component: () => import('@/views/course/student/StudentHomework.vue'),
            },
            {
              path: 'quiz',
              name: 'StudentQuiz',
              component: () => import('@/views/course/student/StudentQuiz.vue'),
            },
            {
              path: 'live',
              name: 'StudentLive',
              component: () => import('@/views/course/student/StudentLive.vue'),
            },
            {
              path: 'discussion',
              name: 'StudentCourseDiscussion',
              component: () => import('@/views/course/CourseDiscussion.vue'),
            },
            {
              path: 'review',
              name: 'StudentCourseReview',
              component: () => import('@/views/course/CourseReview.vue'),
            }
          ]
        },
      ],
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }, // 需要认证
      children: [
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/admin/AdminView.vue'),
          meta: { requiredRole: 'admin' }, // 需要管理员角色
        },
        {
          path: 'teacher',
          name: 'teacher',
          component: () => import('@/views/teacher/TeacherView.vue'),
          meta: { requiredRole: 'teacher' }, // 需要教师角色
          children: [
            {
              path: 'info',
              name: 'TeacherInfo',
              component: () => import('@/views/InfoView.vue'),
            },
            {
              path: 'courses',
              name: 'TeacherCourses',
              component: () => import('@/views/teacher/TeacherCourses.vue'),
            },
            {
              path: 'create',
              name: 'TeacherCreate',
              component: () => import('@/views/teacher/TeacherCreate.vue'),
            },
            {
              path: 'live',
              name: 'TeacherLives',
              component: () => import('@/views/teacher/TeacherLives.vue'),
            },
            {
              path: 'dataAnalysis',
              name: 'TeacherDataAnalysis',
              component: () => import('@/views/teacher/TeacherDataAnalysis.vue'),
            },
            {
              path: 'achievements',
              name: 'TeacherAchievements',
              component: () => import('@/views/teacher/TeacherAchievements.vue'),
            },
            {
              path: '',
              name: 'TeacherDefault',
              redirect: '/profile/teacher/info', // 默认重定向到个人信息
            },
          ],
        },
        {
          path: 'student',
          name: 'student',
          component: () => import('@/views/student/StudentView.vue'),
          meta: { requiredRole: 'student' }, // 需要学生角色
           children: [
            {
              path: 'info',
              name: 'StudentInfo',
              component: () => import('@/views/InfoView.vue'),
            },
            {
              path: 'courses',
              name: 'StudentCourses',
              component: () => import('@/views/student/StudentCourses.vue'),
            },
            {
              path: 'live',
              name: 'StudentLives',
              component: () => import('@/views/student/StudentLives.vue'),
            },
            {
              path: 'dataAnalysis',
              name: 'StudentDataAnalysis',
              component: () => import('@/views/student/StudentDataAnalysis.vue'),
            },
            {
              path: 'achievements',
              name: 'StudentAchievements',
              component: () => import('@/views/student/StudentAchievements.vue'),
            },
            {
              path: '',
              name: 'StudentDefault',
              redirect: '/profile/student/info', // 默认重定向到个人信息
            },
          ],
        },
      ],
    },
  ],
});

// 导航守卫
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userStore = useUserStore();
  const requiredRole = to.meta.requiredRole;

  // 检查Token是否过期
  if (userStore.isLoggedIn && userStore.isTokenExpired()) {
    userStore.logout();
  }

  // 判断当前路由是否需要认证
  const requiresAuth = to.meta.requiresAuth;

  if (requiredRole) {
    if (!userStore.isLoggedIn || userStore.positionName !== requiredRole) {
      // 如果需要特定角色但用户没有该角色，重定向到主页
      next({ name: 'home' });
      // 提醒用户
      ElMessage.error('您没有权限访问此页面，请联系管理员。');
    } else {
      next();
    }
  } else if (requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 如果路由需要认证但用户未登录，重定向到登录页面
      next({ name: 'login' });
      // 提醒用户
      ElMessage.error('请先登录！');
    } else if (userStore.isLoggedIn && !userStore.positionName) {
      // 如果用户已登录但没有具体角色，重定向到主页
      next({ name: 'home' });
      // 提醒用户
      ElMessage.error('您的账户没有分配角色，请联系管理员。');
    } else {
      next();
    }
  } else {
    // 如果路由不需要认证，直接放行
    next();
  }
});

export default router;