# Some useful tips

- The core way of how this tool grabs configs is at https://github.com/storybookjs/storybook/blob/e31c79277b55fb62cbccff4b80cb2b1fb59746ed/lib/core-server/src/presets/common-preset.ts#L32
- How it replaces the values within the templates with the config: https://github.com/storybookjs/storybook/blob/7064642e1aee7786c77fe735c064c0c29dbcee01/lib/core-common/src/utils/template.ts#L4
- For custom bindings or custom templates (web components might have a few, and we will probably new a few): https://github.com/storybookjs/storybook/blob/7064642e1aee7786c77fe735c064c0c29dbcee01/lib/core-common/src/utils/interpolate.ts#L9
