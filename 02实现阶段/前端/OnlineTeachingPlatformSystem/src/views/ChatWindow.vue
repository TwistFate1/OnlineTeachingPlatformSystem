<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import { API_URL, API_KEY } from '@/api/deepSeekApi';

export default defineComponent({
  name: 'ChatWindow',
  setup() {
    const generateUniqueId = () => {
      return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    };
    const messages = ref<{ id: string; role: string; content: string }[]>([
      {
        id: generateUniqueId(),
        role: 'system',
        content: '你好，我是你的学习助手！'
      }
    ]);
    const inputMessage = ref('');
    const messagesContainer = ref<HTMLElement | null>(null);
    let currentAssistantMessageId: string | null = null;

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };

    const sendMessage = async () => {
      if (inputMessage.value.trim()) {
        // 添加用户消息
        const userMessageId = generateUniqueId();
        messages.value.push({
          id: userMessageId,
          role: 'user',
          content: inputMessage.value
        });

        // 清空输入框
        inputMessage.value = '';
        scrollToBottom();

        try {
          // 创建一个占位的助手消息
          const assistantMessageId = generateUniqueId();
          messages.value.push({
            id: assistantMessageId,
            role: 'assistant',
            content: ''
          });
          currentAssistantMessageId = assistantMessageId;

          // 发送请求并处理流式响应
          const response = await fetch(`${API_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: messages.value,
              stream: true
            })
          });

          if (response.ok) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let partialContent = '';

            while (true) {
              const { done, value } = await reader?.read() as any;
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              // 拆分多个 data 部分
              const dataParts = chunk.split('data:').filter(part => part.trim() !== '');
              for (const dataPart of dataParts) {
                if (dataPart.trim() === '[DONE]') break;

                try {
                  const parsedData = JSON.parse(dataPart);
                  const delta = parsedData.choices[0].delta;

                  // 如果存在 role 字段，跳过（第一个数据块）
                  if (delta.role) continue;

                  const content = delta.content || '';
                  partialContent += content;

                  // 更新助手消息的内容
                  const assistantMessageIndex = messages.value.findIndex(msg => msg.id === currentAssistantMessageId);
                  if (assistantMessageIndex !== -1) {
                    messages.value[assistantMessageIndex].content = partialContent;
                  }
                } catch (error) {
                  console.error('Error parsing stream response:', error);
                }
              }
            }
          } else {
            console.error('Failed to fetch stream response:', response.statusText);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          // 如果发生错误，更新助手消息为错误信息
          const errorMessageIndex = messages.value.findIndex(msg => msg.id === currentAssistantMessageId);
          if (errorMessageIndex !== -1) {
            messages.value[errorMessageIndex].content = 'Failed to send message. Please try again later.';
          }
        } finally {
          currentAssistantMessageId = null;
        }

        // 滚动到底部
        scrollToBottom();
      }
    };

    const renderMessageContent = (content: string) => {
      // 使用 KaTeX 渲染 LaTeX 公式
      let processedContent = content.replace(/\\\[([\s\S]+?)\\\]/g, (match, p1) => {
        try {
          return katex.renderToString(p1, {
            throwOnError: false,
            trust: true
          });
        } catch (error) {
          console.error('Error rendering KaTeX:', error);
          return match;
        }
      }).replace(/\\\(([\s\S]+?)\\\)/g, (match, p1) => {
        try {
          return katex.renderToString(p1, {
            throwOnError: false,
            trust: true,
            displayMode: false
          });
        } catch (error) {
          console.error('Error rendering KaTeX:', error);
          return match;
        }
      });

      // 使用 marked 将 Markdown 转换为 HTML
      processedContent = marked.parse(processedContent) as string;

      // 使用 DOMPurify 清理内容
      processedContent = DOMPurify.sanitize(processedContent);

      return processedContent;
    };

    // 每次消息更新时滚动到底部
    watch(messages, () => {
      scrollToBottom();
    }, { deep: true });

    return {
      messages,
      inputMessage,
      sendMessage,
      renderMessageContent
    };
  }
});
</script>

<template>
  <el-card shadow="never" class="chat-window" body-style="width: 100%; height: 100%">
    <div class="messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <div v-if="message.role === 'system' || message.role === 'assistant'" class="icon-container">
          <img src="@/assets/robot-icon.png" alt="Robot Icon" class="robot-icon" />
        </div>
        <div :class="['message-content', { 'user': message.role === 'user', 'assistant': message.role === 'assistant', 'system': message.role === 'system' }]">
          <div v-html="renderMessageContent(message.content)"></div>
        </div>
        <div v-if="message.role === 'user'" class="icon-container">
          <img src="@/assets/user-icon.png" alt="User Icon" class="user-icon" />
        </div>
      </div>
    </div>
    <el-input autocomplete="off" class="input" v-model="inputMessage" placeholder="发送信息使用 AI 答疑" @keyup.enter="sendMessage">
      <template #append>
        <el-icon><Promotion /></el-icon>
      </template>
    </el-input>
  </el-card>
</template>

<style scoped>
.chat-window {
  width: 100%;
  min-height: calc(100vh - 60px);
  padding: 0 50px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  min-height: 80vh;
  padding: 0 50px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  margin: 10px 0;
  width: 100%;
}

.icon-container {
  display: flex;
  justify-content: center;
  padding: 5px;
}

.robot-icon {
  width: 50px;
  height: 40px;
}

.user-icon {
  width: 40px;
  height: 40px;
}

.message-content {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
}

.message-content.user {
  background-color: #e6f7ff;
  margin-left: auto;
}

.message-content.assistant {
  background-color: #f0f0f0;
  margin-right: auto;
}

.message-content.system {
  background-color: #c7c7c7;
  margin-right: auto;
}

.input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
</style>