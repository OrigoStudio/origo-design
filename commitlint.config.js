module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 250], // Increased from the default of 100
    'body-max-line-length': [2, 'always', 250],
    'footer-max-line-length': [2, 'always', 250],
  },
};
