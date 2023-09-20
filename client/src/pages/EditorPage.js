import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import { socket_global } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-kotlin";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-scala";
import "ace-builds/src-noconflict/mode-swift";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-haskell";
import "ace-builds/src-noconflict/mode-erlang";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-r";
import "ace-builds/src-noconflict/mode-coffee";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-typescript";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-github";

import "ace-builds/src-noconflict/ext-language_tools";
import API from '../utils/ApiIntance';
import Header from '../components/Header';
import freeice from 'freeice';
import { useStateWithCallback } from '../hooks/useStateWithCallback';
import Avatar from 'react-avatar';


import { io } from 'socket.io-client';

const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
};



const languages = {
    "c": "c_cpp",
    "cpp": "c_cpp",
    "java": "java",
    "javascript": "javascript",
    "kotlin": "kotlin",
    "python": "python",
    "python3": "python",
    "scala": "scala",
    "swift": "swift",
    "csharp": "csharp",
    "go": "golang",
    "haskell": "haskell",
    "erlang": "erlang",
    "perl": "perl",
    "ruby": "ruby",
    "php": "php",
    "bash": "bash",
    "r": "r",
    "coffeescript": "coffee",
    "mysql": "mysql",
    "typescript": "typescript",
}

const EditorPage = () => {

    const [code, setCode] = useState("")
    const codeC = useRef("")

    const [inputCode, setInputCode] = useState("")
    const inputcodeC = useRef("")

    const [outputCode, setoutputCode] = useState("")
    const outputCodeC = useRef("")

    const [clients, setClients] = useStateWithCallback([]);
    const clientsRef = useRef(null);

    const [statusId, setStatusId] = useState("");
    const [status, setStatus] = useState("idel");

    const [isRunning, setIsRunning] = useState(false);
    // const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState({
        time: "0.00",
        result: "idel",
    });

    const [lan, setLan] = useState("c");
    const [theme, setTheme] = useState('monokai');
    const [font, setFont] = useState('8');
    const languageC = useRef("c")

    const reactNavigator = useNavigate();
    const socketRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();

    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    let setOwn = false;

    // const user = { id: socketRef.current.id, username: location.state?.username }

    // useEffect(() => {
    //     // if (clients.length == 1) {
    //     // console.log(clients)
    //     if (typeof window !== undefined) {
    //         // console.log(localStorage.getItem("code"));
    //         // console.log(localStorage.getItem("inputcode"));
    //         // setCode(localStorage.getItem("code"));
    //         // setInputCode(localStorage.getItem("inputcode") == "null" ? "" : localStorage.getItem("inputcode"));
    //     }
    //     // }   
    // }, []);

    const onRun = async () => {
        setIsRunning(true);
        // localStorage.setItem("code", code);
        // localStorage.setItem("inputcode", inputCode);
        // console.log(code);
        try {
            let response = await API.post("/create", {
                source_code: code,
                language: lan,
                api_key: "guest",
                input: inputCode,
            });
            setStatusId(response.data.id);
            setStatus(response.data.status);
        } catch (err) {
            setIsRunning(false);
            console.log(err);
        }
    };
    // const onSave = async () => {
    //     setIsSaving(true);
    //     localStorage.setItem("code", code);
    //     localStorage.setItem("inputcode", inputCode);
    //     setIsSaving(false);
    // };

    useEffect(() => {
        async function get_details() {
            await getOutput(statusId);
        }
        get_details();
    }, [statusId]);


    const getOutput = async (statusId) => {
        if (statusId === "") return;
        try {
            let response = await API.get(`/get_details?id=${statusId}&api_key=guest`);
            // console.log(response);
            const { stdout, stderr, build_stderr } = response.data;
            let newOutput = "";
            if (stdout) {
                newOutput += stdout;
            } else {
                if (build_stderr) newOutput += build_stderr
            }
            if (stderr) newOutput += stderr;
            setoutputCode(newOutput)
            outputCodeC.current = newOutput

            setData({ time: response.data.time, result: response.data.result });
            if (response.data.status !== "completed") {
                await getOutput(statusId);
            }

            setStatus("completed");
            setIsRunning(false);
            setStatusId("");
        } catch (err) {
            setIsRunning(false);
            console.log(err);
        }
    };

    //selector
    const handleChangeLanguages = (event) => {
        // setLanguage((language) => (language = event.target.value));
        languageC.current = event.target.value
        setLan(languageC.current)
        // console.log(languageC.current)
        socketRef.current.emit(ACTIONS.LAN_CHANGE, {
            roomId, language: languageC.current
        })
    };
    const handleChangeTheme = (event) => {
        setTheme(event.target.value);
    };
    const handleChangeFont = (event) => {
        setFont(event.target.value);
    };

    useEffect(() => {
        if (outputCode != '') {
            // console.log("output is done: " + outputCode)
            socketRef.current.emit(ACTIONS.OCODE_CHANGE, { roomId, code: outputCode })
        }
    }, [outputCode])

    useEffect(() => {
        // console.log(clients)
        clientsRef.current = clients;
    }, [clients]);


    const addNewClient = useCallback(
        (newClient, cb) => {
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            } else {
                // console.log('user already exist!')
            }
        },
        [clients, setClients]
    );

    useEffect(() => {
        const init = async () => {
            // socketRef.current = socket_global
            // socketRef.current = io('https://nodejs-code-syncer.herokuapp.com/', options)
            socketRef.current = io('http://localhost:5000/', options)
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));


            socketRef.current.on('connect', () => {
                // console.log(socketRef.current.id);
                //add own
                if (!setOwn) {
                    // console.log("added first")

                    addNewClient({ id: socketRef.current.id, username: location.state.username, muted: true }, () => {
                        const localElement = audioElements.current[socketRef.current.id];
                        // console.log(localMediaStream.c)
                        if (localElement) {
                            // console.log(localElement)
                            localElement.volume = 0;
                            localElement.srcObject = localMediaStream.current;
                        }
                    });
                    setOwn = true
                }
            });


            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            //capture
            async function captureMedia() {
                // Start capturing local audio stream.
                localMediaStream.current =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        // video: true
                    });
            }
            await captureMedia();




            // console.log(audioElements.current)
            // console.log(clients)
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({ username, socketId }) => {
                // setClients({ ...clients, cli }, () => { });//remove
                // console.log(clients)//remove
                if (username !== location.state.username) {
                    toast.success(`${username} joined the room.`);
                    // console.log(`${username} joined`);
                    // console.log("code: " + codeC.current)
                    // console.log("language: " + languageC.current)
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        socketId,
                        code: codeC.current
                    });
                    socketRef.current.emit(ACTIONS.ISYNC_CODE, {
                        socketId,
                        code: inputcodeC.current
                    });
                    socketRef.current.emit(ACTIONS.OSYNC_CODE, {
                        socketId,
                        code: outputCodeC.current
                    });
                    socketRef.current.emit(ACTIONS.SYNC_LAN, {
                        socketId,
                        language: languageC.current
                    });
                }
            }
            );

            //add-peer
            socketRef.current.on(ACTIONS.ADD_PEER, handleNewPeer);
            socketRef.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
            socketRef.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
            socketRef.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
            socketRef.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
                handleSetMute(true, userId);
            });
            socketRef.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
                handleSetMute(false, userId);
            });
            async function handleNewPeer({
                peerId,
                createOffer,
                username: remoteUser,
            }) {
                if (peerId in connections.current) {
                    return console.warn(
                        `You are already connected with ${peerId} (${location.state?.username})`
                    );
                }

                // Store it to connections
                connections.current[peerId] = new RTCPeerConnection({
                    iceServers: freeice(),
                });

                // console.log(connections.current)
                // Handle new ice candidate on this peer connection
                connections.current[peerId].onicecandidate = (event) => {
                    socketRef.current.emit(ACTIONS.RELAY_ICE, {
                        peerId,
                        icecandidate: event.candidate,
                    });
                };

                // Handle on track event on this connection
                connections.current[peerId].ontrack = ({
                    streams: [remoteStream],
                }) => {
                    // console.log(remoteUser)
                    addNewClient({ id: peerId, username: remoteUser, muted: true }, () => {
                        // get current users mute info
                        // console.log("added")
                        const currentUser = clientsRef.current.find(
                            (client) => client.id === socketRef.current.id
                        );
                        if (currentUser) {
                            socketRef.current.emit(ACTIONS.MUTE_INFO, {
                                userId: socketRef.current.id,
                                roomId,
                                isMute: currentUser.muted,
                            });
                        }
                        // console.log(remoteUser)
                        if (audioElements.current[peerId]) {
                            audioElements.current[peerId].srcObject =
                                remoteStream;
                        } else {
                            let settled = false;
                            const interval = setInterval(() => {
                                if (audioElements.current[peerId]) {
                                    audioElements.current[
                                        peerId
                                    ].srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 300);
                        }
                    });
                };

                // Add connection to peer connections track
                localMediaStream.current.getTracks().forEach((track) => {
                    connections.current[peerId].addTrack(
                        track,
                        localMediaStream.current
                    );
                });

                // Create an offer if required
                if (createOffer) {
                    const offer = await connections.current[
                        peerId
                    ].createOffer();
                    // console.log(offer)
                    // Set as local description
                    await connections.current[peerId].setLocalDescription(
                        offer
                    );

                    // send offer to the server
                    socketRef.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: offer,
                    });
                }
            }
            async function handleRemovePeer({ peerId, userId }) {
                // console.log(peerId)
                // Correction: peerID to peerId
                if (connections.current[peerId]) {
                    connections.current[peerId].close();
                    // console.log('closed')
                }
                delete connections.current[peerId];
                delete audioElements.current[peerId];
                setClients((list) => list.filter((c) => c.id !== peerId));
            }
            async function handleIceCandidate({ peerId, icecandidate }) {
                if (icecandidate) {
                    connections.current[peerId].addIceCandidate(icecandidate);
                }
            }
            async function setRemoteMedia({
                peerId,
                sessionDescription: remoteSessionDescription,
            }) {
                connections.current[peerId].setRemoteDescription(
                    new RTCSessionDescription(remoteSessionDescription)
                );

                // If session descrition is offer then create an answer
                if (remoteSessionDescription.type === 'offer') {
                    const connection = connections.current[peerId];

                    const answer = await connection.createAnswer();
                    connection.setLocalDescription(answer);

                    socketRef.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: answer,
                    });
                }
            }
            async function handleSetMute(mute, userId) {
                const clientIdx = clientsRef.current
                    .map((client) => client.id)
                    .indexOf(userId);
                const allConnectedClients = JSON.parse(
                    JSON.stringify(clientsRef.current)
                );
                if (clientIdx > -1) {
                    allConnectedClients[clientIdx].muted = mute;
                    setClients(allConnectedClients);
                }
            }




            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    // console.log(`${username} left`);
                    // setClients((prev) => {
                    //     return prev.filter(
                    //         (client) => client.socketId !== socketId
                    //     );
                    // }, () => { });
                }
            );
        };
        init();
        return () => {
            localMediaStream.current
                .getTracks()
                .forEach((track) => track.stop());
            socketRef.current.emit(ACTIONS.LEAVE, { roomId });
            for (let peerId in connections.current) {
                connections.current[peerId].close();
                delete connections.current[peerId];
                delete audioElements.current[peerId];
            }
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.off(ACTIONS.ADD_PEER);
            socketRef.current.off(ACTIONS.REMOVE_PEER);
            socketRef.current.off(ACTIONS.ICE_CANDIDATE);
            socketRef.current.off(ACTIONS.SESSION_DESCRIPTION);
            socketRef.current.off(ACTIONS.MUTE);
            socketRef.current.off(ACTIONS.UNMUTE);
        };
    }, []);


    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== '') {
                    // console.log(code)
                    setCode(code)
                    codeC.current = code
                }
            });
            socketRef.current.on(ACTIONS.ICODE_CHANGE, ({ code }) => {
                if (code !== '') {
                    // console.log(code)
                    setInputCode(code)
                    inputcodeC.current = code
                }
            });
            socketRef.current.on(ACTIONS.OCODE_CHANGE, ({ code }) => {
                if (code !== '') {
                    // console.log(code)
                    setoutputCode(code)
                    outputCodeC.current = code
                }
            });
            socketRef.current.on(ACTIONS.LAN_CHANGE, ({ language }) => {
                // console.log(language)
                // setLanguage(language)
                languageC.current = language
                setLan(language)
                // console.log("sync:" + lan)
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
            socketRef.current.off(ACTIONS.ICODE_CHANGE);
            socketRef.current.off(ACTIONS.OCODE_CHANGE);
            socketRef.current.off(ACTIONS.LAN_CHANGE);
        };
    }, [socketRef.current]);

    const [isMuted, setMuted] = useState(true);

    const handleMuteClick = (clientId) => {
        if (clientId !== socketRef.current.id) {
            return;
        }
        setMuted((prev) => !prev);
    };

    const handleMute = (isMute, userId) => {
        let settled = false;

        if (userId === socketRef.current.id) {
            let interval = setInterval(() => {
                if (localMediaStream.current) {
                    // console.log(localMediaStream.current.getTracks())
                    localMediaStream.current.getTracks()[0].enabled = !isMute;
                    if (isMute) {
                        socketRef.current.emit(ACTIONS.MUTE, {
                            roomId,
                            userId: socketRef.current.id,
                        });
                    } else {
                        socketRef.current.emit(ACTIONS.UNMUTE, {
                            roomId,
                            userId: socketRef.current.id,
                        });
                    }
                    settled = true;
                }
                if (settled) {
                    clearInterval(interval);
                }
            }, 200);
        }
    };

    useEffect(() => {
        handleMute(isMuted, socketRef.current.id);
    }, [isMuted]);

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const codeChange = (code) => {
        // console.log("run code in code editor")
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code })
    }
    const InputcodeChange = (code) => {
        // console.log("run code in inputcode editor")
        socketRef.current.emit(ACTIONS.ICODE_CHANGE, { roomId, code })
    }

    /////////////////////////

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }




    function leaveRoom() {
        reactNavigator('/');
    }
    /////////////////////////

    return (
        <div className="mainWrap">
            {/* aside --> pass (clients detail) */}
            {/* <Aside clients={clients} /> */}
            {/*  */}
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <div key={client.id}>
                                <div className="client" >
                                    <Avatar name={client.username} className="client" size={40} round="14px" />
                                    {/* <video style={{ width: '180px', height: '50px' }}
                                        // controls
                                        autoPlay
                                        ref={(instance) => {
                                            provideRef(instance, client.id);
                                        }}></video> */}

                                    {client.id === socketRef.current.id ?
                                        <button
                                            onClick={() =>
                                                handleMuteClick(client.id)
                                            }
                                            className="micBtn"
                                        >
                                            {client.muted ? (
                                                <img
                                                    className={"mic"}
                                                    src="/mic-mute.png"
                                                    alt="mic"
                                                />
                                            ) : (
                                                <img
                                                    className={"mic"}
                                                    src="/mic.png"
                                                    alt="mic"
                                                />
                                            )}
                                        </button> :
                                        <button
                                            onClick={() =>
                                                handleMuteClick(client.id)
                                            }
                                            className="micBtn"
                                        >
                                            {client.muted ? (
                                                <img
                                                    className={"mic"}
                                                    src="/novol.png"
                                                    alt="mic"
                                                />
                                            ) : (
                                                <img
                                                    className={"mic"}
                                                    src="/vol.png"
                                                    alt="mic"
                                                />
                                            )}
                                        </button>}


                                    <audio
                                        style={{ width: '180px', height: '50px' }}
                                        // controls
                                        autoPlay
                                        ref={(instance) => {
                                            provideRef(instance, client.id);
                                        }}
                                    />


                                </div>
                                <span className="userName">{client.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            {/*  */}
            {/* Editor --> pass (Lan,handleChangeLanguages,languages,theme,handleChangeTheme,themes,font,handleChangeFont,fontSizes) */}
            {/* Editor --> pass (onRun,onrunning,onSave,onSaving) */}
            <div className="editorWrap">
                <Header
                    lan={lan}
                    handleChangeLanguages={handleChangeLanguages}
                    theme={theme}
                    handleChangeTheme={handleChangeTheme}
                    font={font}
                    handleChangeFont={handleChangeFont}
                    onRun={onRun}
                    // onSave={onSave}
                    isRunning={isRunning}
                // isSaving={isSaving}
                />
                {/* Editor */}
                <div className='editors'>
                    <AceEditor
                        value={code}
                        mode={languages[lan]}
                        theme={theme}
                        onChange={(e) => {
                            setCode(e)
                            codeC.current = e
                            codeChange(e)
                        }}
                        name="mainEditor"
                        editorProps={{ $blockScrolling: true }}
                        enableSnippets={true}
                        enableLiveAutocompletion={true}
                        enableBasicAutocompletion={true}
                        showLineNumbers={true}
                        fontSize={parseInt(font)}
                        tabSize={2}
                        wrapEnabled={true}
                    />
                    <div className='inouWrap'>
                        <div className='heading'>
                            Input :
                        </div>
                        <AceEditor
                            value={inputCode}
                            theme={theme}
                            onChange={(e) => {
                                setInputCode(e)
                                inputcodeC.current = e
                                InputcodeChange(e)
                            }}
                            name="inputEditor"
                            editorProps={{ $blockScrolling: true }}
                            enableLiveAutocompletion={true}
                            enableBasicAutocompletion={true}
                            enableSnippets={true}
                            showLineNumbers={true}
                            fontSize={parseInt(font)}
                            tabSize={2}
                            wrapEnabled={true}
                        />
                        <div className='heading'>
                            Output :
                        </div>
                        <AceEditor
                            value={outputCode}
                            theme={theme}
                            name="OutputEditor"
                            editorProps={{ $blockScrolling: false }}
                            fontSize={parseInt(font)}
                            tabSize={2}
                            wrapEnabled={true}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

export default EditorPage;
