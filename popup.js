document.addEventListener('DOMContentLoaded', () => {
  const doiInput = document.getElementById('doiInput');
  const convertButton = document.getElementById('convertButton');
  const bibtexOutput = document.getElementById('bibtexOutput');
  const copyButton = document.getElementById('copyButton');
  const status = document.getElementById('status');

  const validateDOI = (doi) => {
    const doiRegex = /^10\.\d{4,9}\/[-._;()\/:a-zA-Z0-9]+$/;
    return doiRegex.test(doi);
  };

  const showStatus = (message, isError = false) => {
    status.textContent = message;
    status.className = isError ? 'status error' : 'status';
  };

  const formatBibTeX = (bibtex) => {
    // First, normalize all whitespace
    let formatted = bibtex.replace(/\s+/g, ' ').trim();
    
    // Find the citation key part
    const citationStart = formatted.indexOf('@');
    const firstBrace = formatted.indexOf('{');
    const citationKey = formatted.slice(citationStart, firstBrace + 1);
    
    // Get the main content (everything after the citation key until the last brace)
    let mainContent = formatted.slice(firstBrace + 1, formatted.lastIndexOf('}')).trim();
    
    // Split into fields, being careful not to split within braces
    let fields = [];
    let currentField = '';
    let braceCount = 0;
    
    for (let char of mainContent) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      
      if (char === ',' && braceCount === 0) {
        if (currentField.trim()) fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField.trim()) fields.push(currentField.trim());
    
    // Combine it all back together
    return citationKey + '\n  ' + 
           fields.join(',\n  ') +
           '\n}';
  };

  convertButton.addEventListener('click', async () => {
    const doi = doiInput.value.trim();
    
    if (!doi) {
      showStatus('Please enter a DOI', true);
      return;
    }

    if (!validateDOI(doi)) {
      showStatus('Invalid DOI format', true);
      return;
    }

    convertButton.disabled = true;
    showStatus('Converting...');

    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}/transform/application/x-bibtex`, {
        headers: {
          'Accept': 'application/x-bibtex',
          'User-Agent': 'DOItoBibTeX_Extension/1.0 (mailto:neri@users.noreply.github.com)'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BibTeX');
      }

      const bibtex = await response.text();
      bibtexOutput.value = formatBibTeX(bibtex);
      showStatus('Conversion successful!');
    } catch (error) {
      showStatus(`Error: ${error.message}`, true);
      bibtexOutput.value = '';
    } finally {
      convertButton.disabled = false;
    }
  });

  copyButton.addEventListener('click', async () => {
    if (!bibtexOutput.value) {
      showStatus('Nothing to copy', true);
      return;
    }

    try {
      await navigator.clipboard.writeText(bibtexOutput.value);
      showStatus('Copied to clipboard!');
    } catch (error) {
      showStatus('Failed to copy to clipboard', true);
    }
  });

  // Enable convert button when input changes
  doiInput.addEventListener('input', () => {
    showStatus('');
  });
}); 