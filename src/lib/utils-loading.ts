// Utilitário para disparar eventos de loading global
export function setPageLoading(loading: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(loading ? 'page-loading-start' : 'page-loading-stop'));
  }
}
