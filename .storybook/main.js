module.exports = {
  typescript: {
    check: false,
    checkOptions: {},
  },
  stories: [
    '../unit_tests/**/*.stories.mdx',
    '../unit_tests/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
};
