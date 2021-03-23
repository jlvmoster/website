import React from 'react';
import { RecoilRoot } from 'recoil';

const withRecoil = Component => props => (
  <RecoilRoot>
    <Component {...props} />
  </RecoilRoot>
);

export default withRecoil;
