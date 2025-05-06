export const verifiArrayisStr = (arr, str) => {
  if (arr.some((item) => item.right === str && item.value === 1)) {
    return true;
  }
  return false;
};

export const getSelectedKeywords = (promptData, key = "keyword") => {
  return promptData
    .filter((item) => item.checked)
    .map((item) => item[key])
    .join(",");
};
