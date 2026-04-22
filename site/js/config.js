/*
  Mrówki Coloring — site config

  In production, set CRM_API to your CRM server URL (e.g. https://crm.mrowki-coloring.pl).
  On localhost, it defaults to http://localhost:3000.

  Edit this file directly OR override via env during your build/deploy.
*/
window.__CRM_API__ = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000';
  // TODO: change to your production CRM URL
  return 'https://crm.mrowki-coloring.pl';
})();
