/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

import './src/styles/global.css';
import { _wrapRootElement, _wrapPageElement } from './src/wrappers';

export const wrapRootElement = _wrapRootElement;
export const wrapPageElement = _wrapPageElement;
