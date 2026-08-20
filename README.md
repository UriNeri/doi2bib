# DOI to BibTeX Chrome Extension

A simple Chrome extension that converts DOIs to BibTeX format using the [Crossref API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/).

The popup accepts:
- a raw DOI such as `10.1093/nar/gkae997`
- a DOI resolver URL such as `https://doi.org/10.1093/nar/gkae997`
- a PMID such as `31452104` or `pmid:31452104`
- a PMCID such as `PMC3531190` or `pmcid:PMC3531190`

PMIDs and PMCIDs are resolved to DOIs through the Europe PMC API before the BibTeX lookup.

This extension is powered by Crossref's free metadata service. Consider [becoming a Crossref member](https://www.crossref.org/membership/) if you're publishing scholarly content.

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked" and select the repo directory

## Note

Please replace the User-Agent email in `popup.js` with your contact information as per Crossref's API etiquette guidelines. 