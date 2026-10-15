// 框架产物的时间字段统一使用本地墙钟时间（YYYY-MM-DDTHH:mm:ss），不携带时区后缀。
export function formatLocalIso(value) {
  const date = value instanceof Date
    ? value
    : (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return String(value);
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
