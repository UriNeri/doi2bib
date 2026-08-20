document.addEventListener('DOMContentLoaded', () => {
  const doiInput = document.getElementById('doiInput');
  const convertButton = document.getElementById('convertButton');
  const bibtexOutput = document.getElementById('bibtexOutput');
  const copyButton = document.getElementById('copyButton');
  const status = document.getElementById('status');

  const normalizeDOI = (input) => input
    .trim()
    .replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, '');

  const parseIdentifier = (input) => {
    const normalizedInput = input.trim();
    const normalizedDOI = normalizeDOI(normalizedInput);

    if (validateDOI(normalizedDOI)) {
      return { type: 'doi', value: normalizedDOI };
    }

    const pmcidMatch = normalizedInput.match(/^(?:pmcid\s*:?\s*)?(PMC\d+)$/i);
    if (pmcidMatch) {
      return { type: 'pmcid', value: pmcidMatch[1].toUpperCase() };
    }

    const pmidMatch = normalizedInput.match(/^(?:pmid\s*:?\s*)?(\d+)$/i);
    if (pmidMatch) {
      return { type: 'pmid', value: pmidMatch[1] };
    }

    return null;
  };

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

  const resolveDOI = async (identifier) => {
    if (identifier.type === 'doi') {
      return identifier.value;
    }

    const query = identifier.type === 'pmcid'
      ? `PMCID:${identifier.value}`
      : `EXT_ID:${identifier.value} AND SRC:MED`;
    const url = new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
    url.search = new URLSearchParams({
      query,
      format: 'json',
      pageSize: '1'
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to resolve ${identifier.type.toUpperCase()}`);
    }

    const data = await response.json();
    const result = data.resultList?.result?.[0];

    if (!result?.doi) {
      throw new Error(`Could not resolve ${identifier.type.toUpperCase()} to a DOI`);
    }

    return result.doi;
  };

  const convertInput = async () => {
    const input = doiInput.value.trim();

    if (!input) {
      showStatus('Please enter a DOI', true);
      return;
    }

    const identifier = parseIdentifier(input);

    if (!identifier) {
      showStatus('Invalid DOI, PMID, or PMCID format', true);
      return;
    }

    convertButton.disabled = true;
    showStatus('Converting...');

    try {
      const doi = await resolveDOI(identifier);
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}/transform/application/x-bibtex`, {
        headers: {
          'Accept': 'application/x-bibtex',
          'User-Agent': 'DOItoBibTeX_Extension/1.0 (mailto:your-email@example.com)'
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
  };

  convertButton.addEventListener('click', convertInput);

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

  doiInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !convertButton.disabled) {
      event.preventDefault();
      convertInput();
    }
  });
});