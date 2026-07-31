/* Keep volatile Yomi release details live without coupling two repositories. */
(function () {
  function applyVersion(version) {
    document.querySelectorAll('[data-yomi-version]').forEach(function (node) {
      node.textContent = version;
    });
    document.querySelectorAll('[data-yomi-download]').forEach(function (link) {
      link.setAttribute(
        'aria-label',
        'Download Yomi v' + version + ' for ' + link.dataset.yomiDownload,
      );
    });

    var schema = document.getElementById('yomi-schema');
    if (!schema) return;
    try {
      var data = JSON.parse(schema.textContent);
      var graph = data['@graph'] || [];
      var software = graph.find(function (entry) {
        return entry['@type'] === 'SoftwareApplication';
      });
      if (software) software.softwareVersion = version;
      schema.textContent = JSON.stringify(data);
    } catch (_) {}
  }

  function applyAssets(release) {
    if (release.tag_name) applyVersion(release.tag_name.replace(/^v/, ''));
    (release.assets || []).forEach(function (asset) {
      var target = document.querySelector(
        '[data-yomi-asset="' + asset.name + '"]',
      );
      if (!target) return;
      target.textContent = 'Download ' + Math.round(asset.size / 1000000) + ' MB →';
    });
  }

  // npm is a fallback in case GitHub's anonymous API rate limit is exhausted.
  fetch('https://registry.npmjs.org/@rikaidev%2Fyomi/latest')
    .then(function (response) {
      if (!response.ok) throw new Error('npm metadata unavailable');
      return response.json();
    })
    .then(function (pkg) { applyVersion(pkg.version); })
    .catch(function () {});

  fetch('https://api.github.com/repos/RikaiDev/yomi/releases/latest')
    .then(function (response) {
      if (!response.ok) throw new Error('release metadata unavailable');
      return response.json();
    })
    .then(applyAssets)
    .catch(function () {});
})();
