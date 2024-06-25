module.exports = {
  git: {
    commitMessage: "chore: release namadillo v${version}",
    tagName: "namadillo-${version}",
    tagAnnotation: "Release namadillo ${version}",
  },
  github: {
    release: true,
    draft: true,
    releaseName: "Namadillo ${version}",
    assets: ["namadillo-*.zip"],
  },
  npm: {
    publish: false
  }
};
