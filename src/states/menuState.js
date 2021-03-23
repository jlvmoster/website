import { atom } from 'recoil';

const menuState = atom({
  key: 'menuState',
  default: 'closed',
});

export default menuState;
