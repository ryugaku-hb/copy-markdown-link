import {
  linkFormats,
  LinkFormatKey,
  isLinkFormatKey,
  dom,
  showStatus,
  showPreview,
  setLinkFormat,
  setPrefixSuffix,
  getCurrentTabInfo,
  copyText,
  initUI,
} from "@popup";

await initUI();

// 监听下拉框变化，保存选择
dom.format.addEventListener("change", async () => {
  try {
    const formatKey = dom.format.value;
    if (isLinkFormatKey(formatKey)) {
      await setLinkFormat(formatKey);
    }
  } catch (err) {
    console.error("保存格式失败", err);
  }
});

dom.copyBtn.addEventListener("click", async () => {
  try {
    // 保存前缀后缀
    const prefix = dom.prefix.value;
    const suffix = dom.suffix.value;

    await setPrefixSuffix(prefix, suffix);

    // 获取当前标签页信息
    const { title, url } = await getCurrentTabInfo();

    // 获取用户选择的格式化器
    const formatKey = dom.format.value as LinkFormatKey;
    const formatter = linkFormats[formatKey];

    // 生成格式化文本
    let text = formatter.generate({ title, url });
    // 添加前缀和后缀
    text = `${prefix}${text}${suffix}`;

    // 复制到剪贴板
    await copyText(text);

    // 显示状态和预览
    showStatus("已复制到剪贴板 ✓", "success");
    showPreview(text);
  } catch (err: any) {
    // 捕获任何错误
    showStatus("复制失败，请重试！", "error");
    showPreview(err.message);
  }
});
