/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

import './src/styles/global.css';
import { _wrapRootElement, _wrapPageElement } from './src/wrappers';

export const wrapRootElement = _wrapRootElement;
export const wrapPageElement = _wrapPageElement;
