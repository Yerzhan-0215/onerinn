// 类型定义
export type LanguageCode = 'ru' | 'kk' | 'zh' | 'en';
type LanguageConfig = {
  code: LanguageCode;
  pathPrefix: string;
  displayName: string;
};

// 语言配置常量
const LANGUAGE_CONFIGS: readonly LanguageConfig[] = [
  { code: 'ru', pathPrefix: '/ru', displayName: 'Русский' },
  { code: 'kk', pathPrefix: '/kk', displayName: 'Қазақша' },
  { code: 'zh', pathPrefix: '/zh', displayName: '中文' },
  { code: 'en', pathPrefix: '', displayName: 'English' }
] as const;

// 预先生成的映射表
const PATH_TO_LANG = Object.fromEntries(
  LANGUAGE_CONFIGS.map(({ pathPrefix, code }) => [pathPrefix, code])
);

const LANG_TO_CONFIG = Object.fromEntries(
  LANGUAGE_CONFIGS.map(config => [config.code, config])
);

/**
 * 检测路径中的语言代码
 * @param pathname - 当前路径 (e.g. '/ru/artworks')
 * @returns 匹配的语言代码，默认返回 'en'
 */
export function detectLanguage(pathname: string): LanguageCode {
  const matchedPrefix = Object.keys(PATH_TO_LANG).find(prefix => 
    pathname.startsWith(`${prefix}/`) || pathname === prefix
  );
  
  return matchedPrefix ? PATH_TO_LANG[matchedPrefix] : 'en';
}

/**
 * 标准化路径语言前缀
 * @param pathname - 原始路径 (e.g. '/ru/device')
 * @param targetLang - 目标语言代码
 * @returns 标准化后的路径 (e.g. '/zh/device')
 */
export function normalizePath(pathname: string, targetLang: LanguageCode): string {
  const config = LANG_TO_CONFIG[targetLang];
  if (!config) throw new Error(`Unsupported language: ${targetLang}`);
  
  // 移除现有语言前缀
  const pathWithoutLang = LANGUAGE_CONFIGS.reduce((path, { pathPrefix }) => 
    path.replace(new RegExp(`^${pathPrefix}`), ''),
    pathname
  ).replace(/^\/+/, '');
  
  // 处理默认语言(英语)的特殊情况
  return config.pathPrefix ? `/${config.pathPrefix}/${pathWithoutLang}` : `/${pathWithoutLang}`;
}

/**
 * 获取所有语言选项
 * @returns 语言选项列表 {code: string, name: string}
 */
export function getLanguageOptions(): {code: LanguageCode; name: string}[] {
  return LANGUAGE_CONFIGS.map(({ code, displayName }) => ({ code, name: displayName }));
}

// 兼容旧版本导出
export const languageOptions = getLanguageOptions();