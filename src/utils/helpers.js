export function setButtonText(
  btn,
  isLoading,
  defaultText = "SAVE",
  loadingText = "SAVING..."
) {
  if (isLoading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = defaultText;
  }
}
