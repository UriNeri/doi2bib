// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('DOI to BibTeX extension installed');
}); 