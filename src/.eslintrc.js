module.exports = {
    root: true,
    extends: ['scratch', 'scratch/es6'],
    env: {
        browser: true
    },
    rules: {
      "indent": ["error", 4, { "SwitchCase": 1 }]
    }
};
