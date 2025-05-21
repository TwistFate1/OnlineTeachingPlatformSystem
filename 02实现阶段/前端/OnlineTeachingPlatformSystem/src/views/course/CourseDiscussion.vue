<template>
  <div class="discussion-container">
    <div class="discussion-form">
      <el-input
        v-model="newDiscussionContent"
        type="textarea"
        placeholder="发表新讨论..."
        :rows="4"
        resize="none"
      />
      <div class="discussion-form-actions">
        <el-button type="primary" @click="addNewDiscussion">发布</el-button>
      </div>
    </div>

    <div class="discussion-list">
      <div
        v-for="discussion in rootDiscussions"
        :key="discussion.discussionId"
        class="discussion-item"
      >
        <el-card>
          <div class="discussion-header">
            <span class="discussion-author">{{ discussion.authorName }}#{{ discussion.accountId }}</span>
          </div>
          <div class="discussion-content">
            {{ discussion.discussionContent }}
          </div>
          <div class="discussion-actions">
            <el-button
              :disabled="!canReply(discussion.accountId)"
              link
              type="primary"
              @click="openReplyForm(discussion.discussionId)"
            >
              回复
            </el-button>
            <el-button
              link
              type="primary"
              @click="toggleExpand(discussion.discussionId)"
            >
              {{ discussion.expanded ? '收起子评论' : '展开子评论' }}
            </el-button>
          </div>
          <div v-if="discussion.expanded">
            <div
              v-for="reply in discussion.replies"
              :key="reply.discussionId"
              class="discussion-reply"
            >
              <el-card>
                <div class="discussion-header">
                  <span class="discussion-author">{{ reply.authorName }}#{{ reply.accountId }}</span>
                </div>
                <div class="discussion-content">
                  {{ reply.discussionContent }}
                </div>
                <div class="discussion-actions">
                  <el-button
                    :disabled="!canReply(reply.accountId)"
                    link
                    type="primary"
                    @click="openReplyForm(reply.discussionId)"
                  >
                    回复
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    :disabled="reply.loaded"
                    @click="toggleExpand(reply.discussionId)"
                  >
                    {{ reply.expanded ? '收起子评论' : '展开子评论' }}
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog
      v-model="showReplyForm"
      title="回复评论"
      width="50%"
    >
      <el-input
        v-model="replyContent"
        type="textarea"
        placeholder="回复..."
        :rows="3"
        resize="none"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelReply">取消</el-button>
          <el-button type="primary" @click="submitReply">提交回复</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import { fetchAccountInfo, fetchRootDiscussions, fetchSubDiscussions, uploadDiscussion } from '@/api/data';

interface Discussion {
  discussionId: number;
  accountId: number;
  authorName: string;
  discussionContent: string;
  disDiscussionId: number | null;
  expanded: boolean;
  loaded: boolean; // 添加 loaded 属性
  replies: Discussion[];
}

export default defineComponent({
  name: 'CourseDiscussion',
  setup() {
    const route = useRoute();
    const courseId = route.params.courseId;
    const userStore = useUserStore();
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const accountId = computed(() => userStore.id);

    const rootDiscussions = ref<Discussion[]>([]);
    const newDiscussionContent = ref('');
    const replyContent = ref('');
    const currentReplyToDiscussionId = ref<number | null>(null);
    const showReplyForm = ref(false);

    const loadRootDiscussions = async () => {
      try {
        const response = await fetchRootDiscussions(courseId);
        rootDiscussions.value = response.data.map((item: any) => ({
          ...item,
          expanded: false,
          replies: []
        }));
        // 获取每个根评论的作者信息
        await Promise.all(
          rootDiscussions.value.map(async (discussion) => {
            if (discussion.accountId) {
              const accountInfo = await fetchAccountInfo(discussion.accountId);
              discussion.authorName = accountInfo.accountName || '未知用户';
            }
          })
        );
      } catch (error) {
        ElMessage.error('加载根评论失败');
      }
    };

    const loadSubDiscussions = async (discussionId: number) => {
      try {
        const response = await fetchSubDiscussions(discussionId);
        return response.data;
      } catch (error) {
        ElMessage.error('加载子评论失败');
        return [];
      }
    };

    const canReply = (authorId: number) => {
      return authorId.toString() != accountId.value;
    };

    const findParentAndToggle = (discussionId: number) => {
      for (const discussion of rootDiscussions.value) {
        // 维护的二级结构一定会找到
        const index = discussion.replies.findIndex(reply => reply.discussionId === discussionId);
        if (index !== -1) {
          discussion.replies[index].expanded = !discussion.replies[index].expanded;
          if (discussion.replies[index].expanded && !discussion.replies[index].loaded) {
            // 获取子评论的子评论，但是插入到 discussion.replies[index] 后面
            loadSubDiscussions(discussionId).then(subDiscussions => {
              // 将获取的子评论插入到当前子评论后面
              discussion.replies.splice(index + 1, 0, ...subDiscussions.map((item: any) => ({
                ...item,
                expanded: false,
                loaded: false
              })));
              // 直接传递原数组中的新评论
              const insertedSubDiscussions = discussion.replies.slice(index + 1, index + 1 + subDiscussions.length);
              loadAccountInfoForReplies(insertedSubDiscussions);
              // 对 discussion.replies 进行去重
              discussion.replies = discussion.replies.filter((reply, index, self) =>
                index === self.findIndex(r => r.discussionId === reply.discussionId)
              );
              discussion.replies[index].loaded = true;
            });
          }
          break;
        }
      }
    };

    const toggleExpand = (discussionId: number) => {
      const discussion = rootDiscussions.value.find(d => d.discussionId === discussionId);
      if (discussion) {
        // 如果是根评论
        discussion.expanded = !discussion.expanded;
        if (discussion.expanded && !discussion.loaded) {
          loadSubDiscussions(discussionId).then(subDiscussions => {
            discussion.replies = subDiscussions.map((item: any) => ({
              ...item,
              expanded: false,
              loaded: false
            }));
            discussion.loaded = true; // 标记为已加载
            // 获取子评论的作者信息
            loadAccountInfoForReplies(discussion.replies);
          });
        }
      } else {
        // 如果是二级评论
        findParentAndToggle(discussionId);
      }
    };

    const loadAccountInfoForReplies = async (replies: Discussion[]) => {
      await Promise.all(
        replies.map(async (reply) => {
          if (reply.accountId) {
            try {
              const accountInfo = await fetchAccountInfo(reply.accountId);
              reply.authorName = accountInfo.accountName || '未知用户';
            } catch (error) {
              console.error('获取用户信息失败:', error);
              reply.authorName = '未知用户';
            }
          }
        })
      );
    };

    const openReplyForm = (discussionId: number) => {
      currentReplyToDiscussionId.value = discussionId;
      replyContent.value = '';
      showReplyForm.value = true;
    };

    const cancelReply = () => {
      currentReplyToDiscussionId.value = null;
      replyContent.value = '';
      showReplyForm.value = false;
    };

    const submitReply = async () => {
      try {
        if (!replyContent.value.trim()) {
          ElMessage.warning('回复内容不能为空');
          return;
        }

        const discussionData = {
          courseId: courseId,
          accountId: accountId.value,
          discussionContent: replyContent.value,
          disDiscussionId: currentReplyToDiscussionId.value
        };

        const response = await uploadDiscussion(discussionData);
        if (response.code == 200) {
          ElMessage.success('回复成功');
          // 找到对应的父评论并添加回复
          findDiscussionById(currentReplyToDiscussionId.value, response.data);
          cancelReply();
        } else {
          ElMessage.error('回复失败');
        }
      } catch (error) {
        console.error('回复失败:', error);
        ElMessage.error('回复失败');
      }
    };

    const findDiscussionById = (discussionId: number | null, data: Discussion) => {
      // 找根评论
      for (const discussion of rootDiscussions.value) {
        if (discussion.discussionId === discussionId) {
          // 展开
          discussion.expanded = true;
          discussion.replies.unshift(data);
          const insertedSubDiscussions = discussion.replies.slice(0, 1);
          loadAccountInfoForReplies(insertedSubDiscussions);
          // 去重
          discussion.replies = discussion.replies.filter((reply, index, self) =>
            index === self.findIndex(r => r.discussionId === reply.discussionId)
          );
          return;
        }
      }
      // 找二级评论
      for (const discussion of rootDiscussions.value) {
        // 维护的二级结构一定会找到
        const index = discussion.replies.findIndex(reply => reply.discussionId === discussionId);
        if (index !== -1) {
          if (discussionId) {
            discussion.replies.splice(index + 1, 0, data);
            const insertedSubDiscussions = discussion.replies.slice(index + 1, index + 2);
            loadAccountInfoForReplies(insertedSubDiscussions);
            // 去重
            discussion.replies = discussion.replies.filter((reply, index, self) =>
              index === self.findIndex(r => r.discussionId === reply.discussionId)
            );
          }
          break;
        }
      }
    };

    const addNewDiscussion = async () => {
      try {
        if (!newDiscussionContent.value.trim()) {
          ElMessage.warning('评论内容不能为空');
          return;
        }

        const discussionData = {
          courseId: courseId,
          accountId: accountId.value,
          discussionContent: newDiscussionContent.value,
          disDiscussionId: null
        };

        const response = await uploadDiscussion(discussionData);
        if (response.code == 200) {
          rootDiscussions.value.unshift(response.data);
          // 获取新评论的作者信息
          const insertedSubDiscussions = rootDiscussions.value.slice(0, 1);
          loadAccountInfoForReplies(insertedSubDiscussions);
          ElMessage.success('发表评论成功');
          newDiscussionContent.value = '';
        } else {
          ElMessage.error('发表评论失败');
        }
      } catch (error) {
        ElMessage.error('发表评论失败');
      }
    };

    onMounted(() => {
      loadRootDiscussions();
    });

    return {
      isLoggedIn,
      rootDiscussions,
      newDiscussionContent,
      replyContent,
      currentReplyToDiscussionId,
      showReplyForm,
      canReply,
      toggleExpand,
      openReplyForm,
      cancelReply,
      submitReply,
      addNewDiscussion
    };
  }
});
</script>

<style scoped>
.discussion-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.discussion-list {
  margin-bottom: 20px;
}

.discussion-item {
  margin-bottom: 15px;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: bold;
}

.discussion-author {
  color: #333;
}

.discussion-content {
  margin-bottom: 12px;
  line-height: 1.5;
}

.discussion-form {
  margin-top: 30px;
}

.discussion-form-actions {
  margin-top: 10px;
  text-align: right;
}

.discussion-reply {
  margin-top: 10px;
  margin-left: 20px;
}
</style>