/*
 *  Buzz Chat - Spam-free decentralized chat
 *
 *  https://github.com/MikaelLazarev/buzzchat
 *  Copyright (c) 2020. Mikhail Lazarev
 */

import io from 'socket.io-client';
import {RootState} from './index';
import {ThunkDispatch, ThunkMiddleware} from 'redux-thunk';
import {Action, MiddlewareAPI, Dispatch} from 'redux';
import {BACKEND_ADDR} from '../../config';
// import {namespace} from './companies';

// interface ThunkMiddleware {
//   dispatch: ThunkDispatch<RootState, unknown, Action<string>>;
//   getState: () => RootState;
// }

export interface JwtData {
  message: string;
  code: string;
  type: string;
}

export interface SocketEmitAction {
  type: 'SOCKET_EMIT';
  event: string;
  payload: unknown;
  typeOnFailure: string;
  opHash?: string;
}

export interface SocketOnAction {
  type: 'SOCKET_ON';
  event: string;
  typeOnSuccess: string;
}

/**
 * An Error Object used by the package.
 */
interface UnauthorizedError {
  message: string;
  inner: Error;
  data: JwtData;
}

type resolver = (value?: SocketIOClient.Socket | undefined) => void;

export function createSocketMiddleware(): ThunkMiddleware<
  RootState,
  Action<string>,
  Action<string>
> {
  let socket = io(BACKEND_ADDR, {
    reconnection: true,
    reconnectionDelay: 500,
    jsonp: false,
    reconnectionAttempts: Infinity,
    transports: ['websocket'],
  });

  socket.on('connect_error', (err: string) => {
    console.log(err);
  });

  let socketAuth: SocketIOClient.Socket | undefined = undefined;
  let isConnecting: boolean = false;
  let waitingPromises: resolver[] = [];

  /*
   * getNamespace returns promise for connected and authentificated namespace
   */
  const getNamespace: (jwtToken: string) => Promise<SocketIOClient.Socket> = (
    jwtToken,
  ) => {
    return new Promise<SocketIOClient.Socket>((resolve, reject) => {
      if (socketAuth) {
        resolve(socketAuth);
      }

      console.log('CONNE23G');
      // If connection in progress we add resolver in queue
      if (isConnecting) {
        waitingPromises.push(resolve);
        return;
      } else {
        isConnecting = true;
        waitingPromises = [];
      }

      socket
        .emit('authenticate', {token: jwtToken}) //send the jwt
        .on('authenticated', () => {
          socketAuth = socket;
          console.log('CONNECTED', socketAuth);
          resolve(socket);

          for (const f of waitingPromises) {
            f(socket);
          }
        })
        .on('unauthorized', (msg: UnauthorizedError) => {
          console.log(`ERROR unauthorized: ${JSON.stringify(msg.data)}`);
          reject(msg.data.code);
          throw new Error(msg.data.type);
        })
        .on('disconnect', () => {
          console.log('DISCONNECTED!');
          if (socketAuth) socketAuth = undefined;
        });
    });
  };

  /*
   ** Middleware gets connection and emits new request or start to listen on
   */

  return ({dispatch, getState}) => {
    return (next: Dispatch) => (action: SocketEmitAction | SocketOnAction) => {
      const jwt = getState().auth.access?.token;

      console.log('DISPATCH', action);
      switch (action.type) {
        case 'SOCKET_EMIT':
          if (jwt) {
            getNamespace(jwt).then((socket) => {
              socket.emit(action.event, action.payload, action.opHash);
              console.log(
                `[SOCKET.IO] : EMIT : ${action.event} with opHash ${action.opHash}`,
              );
            });
          } else {
            dispatch({type: action.typeOnFailure});
          }

          return next(action);

        case 'SOCKET_ON':
          if (jwt) {
            getNamespace(jwt).then((socket) => {
              socket.on(action.event, (payload: any) => {
                console.log('[SOCKET.IО] : GET NEW INFO : ', payload);
                dispatch({
                  type: action.typeOnSuccess,
                  payload: payload,
                });
              });
              console.log('[SOCKET.IO] : LISTENER ADDED : ', action.event);
            });
          } else {
            console.log('Cant connect');
          }
          return next(action);

        default:
          console.log('NEXT', action);
          return next(action);
      }
    };
  };
}

export default createSocketMiddleware();
