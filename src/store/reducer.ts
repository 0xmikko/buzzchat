/*
 *  Buzz Chat - Spam-free decentralized chat
 *
 *  https://github.com/MikaelLazarev/buzzchat
 *  Copyright (c) 2020. Mikhail Lazarev
 */

import {combineReducers} from 'redux';
import chats from './chats/reducer';
import contacts from './contacts/reducer';
import profile from './profile/reducer';

export default combineReducers({
  chats,
  contacts,
  profile,
});
