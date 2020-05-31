/*
 *  Buzz Chat - Spam-free decentralized chat
 *
 *  https://github.com/MikaelLazarev/buzzchat
 *  Copyright (c) 2020. Mikhail Lazarev
 */

import {applyMiddleware, compose, createStore} from 'redux';
import reducer from './reducer';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import createApiMiddleware from './middleware';
import createSocketMiddleware from './socketMiddleware';

let composeEnhancers: typeof compose;

if (__DEV__) {
  composeEnhancers = composeWithDevTools({});
} else {
  composeEnhancers = compose;
}

export type RootState = ReturnType<typeof reducer>;

export default function configureStore() {
  return createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(thunk, createSocketMiddleware, createApiMiddleware),
    ),
  );
}
