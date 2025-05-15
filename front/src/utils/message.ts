import { App } from 'antd';

// 创建一个全局的消息服务
let messageInstance: ReturnType<typeof App.useApp>['message'] | null = null;

// 初始化消息实例
export const initMessage = (instance: ReturnType<typeof App.useApp>['message']) => {
  messageInstance = instance;
};

// 全局消息API
export const globalMessage = {
  success: (content: string, duration?: number) => {
    messageInstance?.success(content, duration);
  },
  error: (content: string, duration?: number) => {
    messageInstance?.error(content, duration);
  },
  warning: (content: string, duration?: number) => {
    messageInstance?.warning(content, duration);
  },
  info: (content: string, duration?: number) => {
    messageInstance?.info(content, duration);
  },
  loading: (content: string, duration?: number) => {
    return messageInstance?.loading(content, duration);
  },
};

export default globalMessage;
