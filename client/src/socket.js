import { io } from 'socket.io-client';

const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
};

// const socket_global = () => {
//     return io('https://nodejs-code-syncer.herokuapp.com/', options);
// }

export const socket_global = io('http://localhost:5000/', options);
// export const socket_global = io('https://nodejs-code-syncer.herokuapp.com/', options);


