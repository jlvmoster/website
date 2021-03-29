import React from 'react';
import types from '../types';

/**
 * This icon component is taken from the Font Awesome gamepad (solid) icon.
 *
 * Modifications were made:
 * - Replaced `class` attribute with `className` React component property
 * - Removed `aria-hidden`, `data-prefix`, `data-icon` and `role` attributes attributes
 * - Moved `fill` attribute from the <path> to <svg>
 *
 * [Font Awesome License](https://fontawesome.com/license)
 */
const Gamepad = ({ className }) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='currentColor'>
    <path d='M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z' />
  </svg>
);

Gamepad.propTypes = types;

export default Gamepad;
