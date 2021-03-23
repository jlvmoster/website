/**
 * Taken from the Recompose library: https://github.com/acdlite/recompose/blob/master/src/packages/recompose/compose.js
 *
 * @param funcs functions to compose
 */
export const compose = (...funcs) =>
  funcs.reduce(
    (a, b) => (...args) => a(b(...args)),
    arg => arg
  );
