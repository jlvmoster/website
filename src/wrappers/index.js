import React from 'react';
import { compose } from '../util';
import Layout from '../components/layout/Layout';
import withRecoil from './withRecoil';
import withSiteMetadata from './withSiteMetadata';

const EnhancedRoot = compose(withRecoil)(React.Fragment);
const EnhancedLayout = compose(withSiteMetadata)(Layout);

export const _wrapRootElement = ({ element }) => <EnhancedRoot>{element}</EnhancedRoot>;
export const _wrapPageElement = ({ element, props }) => <EnhancedLayout {...props}>{element}</EnhancedLayout>;
