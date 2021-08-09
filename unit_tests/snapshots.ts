// adapted from: https://medium.com/blogfoster-engineering/how-to-use-the-power-of-jests-snapshot-testing-without-using-jest-eff3239154e5
import assert from 'assert';
import expect from 'expect';
import jestMatcherUtils from 'jest-matcher-utils';
import { SnapshotState, toMatchSnapshot } from 'jest-snapshot';

export function matchSnapshot(
  actual: any, //TODO populate
  testFile: string,
  testTitle: string
) {
  // Intilize the SnapshotState, it's responsible for actually matching
  // actual snapshot with expected one and storing results to `__snapshots__` folder
  const snapshotState = new SnapshotState(testFile, {
    updateSnapshot: process.env.SNAPSHOT_UPDATE ? 'all' : 'new',
    prettierPath: '<rootDir>/node_modules/prettier',
  });

  // Bind the `toMatchSnapshot` to the object with snapshotState and
  // currentTest name, as `toMatchSnapshot` expects it as it's `this`
  // object members
  const matcher = toMatchSnapshot.bind({
    snapshotState,
    currentTestName: testTitle,
    assertionCalls: 0,
    equals: () => true,
    isNot: false,
    promise: '',
    suppressedErrors: [],
    utils: {
      ...jestMatcherUtils,
      iterableEquality: () => true,
      subsetEquality: () => true,
    },
  });

  // Execute the matcher
  const result = matcher(actual);

  // Store the state of snapshot, depending on updateSnapshot value
  snapshotState.save();

  // Return results outside
  return result;
}

function makeTestTitle(test: Mocha.Context) {
  let next = test;
  const title = [];

  for (;;) {
    if (!next.parent) {
      break;
    }

    title.push(next.title);
    next = next.parent;
  }

  return title.reverse().join(' ');
};

/*
  Three options:

  1. This expect.extend works only in jest at this point or if we downport to a version prior to v21. The problem with the downport is we lose types...

  2. The chai matcher is still an option, if you uncommit the last PR (prior to this one) it should bring it to a point where you can revert the conversion to expect, but the syntax is weird and it also doesn't work with mocha types as of today.

  3. Convert to jest... perf hit..., should be able to keep chai if you configure it right or use the codemod to convert the code but the js-dom register should work with snapshots as long as the output is a string representation. I'd recommend using inlineSnapshots too to reduce file sizes (plus a little perf gain due to less io operations).
    - https://jestjs.io/docs/migration-guide#jest-codemods
    - ts-jest is the flavor that you guys want to use, passing the configs shouldn't be too hard: https://kulshekhar.github.io/ts-jest/docs/guides/esm-support
*/
expect.extend({
  toMatchSnapshot(str: string) {
    const ctx: Mocha.Context = JSON.parse(str);

    const test = ctx?.test;
    const state = expect.getState();

    console.log(test);
    console.log(state);

    if (!ctx || !ctx.test) {
      throw new Error(
        `missing \`ctx\` parameter for .toMatchSnapshot(), did you forget to pass \`this\` expect().toMatchSnapshot(this)?`,
      );
    }

    // would contain the full path to test file
    const testFile = ctx.titlePath;
    const testTitle = makeTestTitle(ctx.title);
    const result = matchSnapshot(ctx, testFile, testTitle);

    assert.ok(result.pass, !result.pass ? result.message() : '');

    return this;
  }
})
