import dayjs from 'dayjs';

/**
 * 格式化时间戳为可读的日期时间格式
 * @param timestamp 时间戳（毫秒）
 * @param format 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export const formatTimestamp = (timestamp?: number | null, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!timestamp) return '-';
  return dayjs(timestamp).format(format);
};
