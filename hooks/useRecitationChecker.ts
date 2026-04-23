// // hooks/useRecitationChecker.ts
// // FIX: startRecording is called ONLY after recitation-ready event fires

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { Socket, io } from 'socket.io-client';
// import {
//   RecitationStartData,
//   RecitationReadyData,
//   VerificationResultData,
//   AIFeedbackData,
//   RecitationError,
// } from '../types/ayahs';

// interface UseRecitationCheckerReturn {
//   isConnected: boolean;
//   isRecording: boolean;
//   isLoading: boolean;
//   isMicActive: boolean;
//   currentAccuracy: number;
//   currentAyah: RecitationReadyData | null;
//   activeAyahId: string | null;
//   connectionError: string | null;
//   reconnect: () => void;
//   resetState: () => void;
//   startRecitation: (data: RecitationStartData, ayahId: string) => void;
//   startRecording: () => Promise<void>;
//   stopRecording: () => void;
//   cancelRecitation: () => void;
//   onVerificationResult: (cb: (data: VerificationResultData) => void) => void;
//   onAIFeedback: (cb: (data: AIFeedbackData) => void) => void;
//   onError: (cb: (error: RecitationError) => void) => void;
// }

// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// let socketInstance: Socket | null = null;
// let connectionPromise: Promise<Socket> | null = null;

// const getSocket = (): Promise<Socket> => {
//   if (socketInstance?.connected) return Promise.resolve(socketInstance);
//   if (connectionPromise) return connectionPromise;

//   connectionPromise = new Promise((resolve, reject) => {
//     const socket = io(SOCKET_URL, {
//       transports          : ['websocket', 'polling'],
//       reconnection        : true,
//       reconnectionAttempts: 10,
//       reconnectionDelay   : 1000,
//       reconnectionDelayMax: 5000,
//       timeout             : 30000,
//     });

//     const tid = setTimeout(() => reject(new Error('Connection timeout')), 15000);

//     socket.on('connect', () => {
//       clearTimeout(tid);
//       socketInstance = socket;
//       connectionPromise = null;
//       resolve(socket);
//     });

//     socket.on('connect_error', (err) => {
//       clearTimeout(tid);
//       connectionPromise = null;
//       reject(err);
//     });
//   });

//   return connectionPromise;
// };

// export const useRecitationChecker = (): UseRecitationCheckerReturn => {
//   const [socket, setSocket]               = useState<Socket | null>(null);
//   const [isConnected, setIsConnected]     = useState(false);
//   const [isRecording, setIsRecording]     = useState(false);
//   const [isLoading, setIsLoading]         = useState(false);
//   const [isMicActive, setIsMicActive]     = useState(false);
//   const [currentAccuracy, setCurrentAccuracy] = useState(0);
//   const [currentAyah, setCurrentAyah]     = useState<RecitationReadyData | null>(null);
//   const [activeAyahId, setActiveAyahId]   = useState<string | null>(null);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
//   const streamRef         = useRef<MediaStream | null>(null);
//   const intervalRef       = useRef<NodeJS.Timeout | null>(null);

//   // ── Callback registries ────────────────────────────────────
//   const verificationCbs = useRef<((d: VerificationResultData) => void)[]>([]);
//   const aiFeedbackCbs   = useRef<((d: AIFeedbackData) => void)[]>([]);
//   const errorCbs        = useRef<((e: RecitationError) => void)[]>([]);

//   // ✅ FIX: pendingStartRecording — stores the start-recording request
//   // until recitation-ready fires from the server
//   const pendingStartRecordingRef = useRef(false);
//   const isReadyRef               = useRef(false); // tracks if recitation-ready received

//   /* ── Socket init ─────────────────────────────────────────── */
//   useEffect(() => {
//     let mounted = true;

//     const init = async () => {
//       try {
//         setConnectionError(null);
//         const sock = await getSocket();
//         if (!mounted) return;

//         setSocket(sock);
//         setIsConnected(sock.connected);

//         // ── Event handlers ──────────────────────────────────
//         const onConnect = () => {
//           if (mounted) { setIsConnected(true); setConnectionError(null); }
//         };

//         const onDisconnect = () => {
//           if (mounted) { setIsConnected(false); setConnectionError('Connection lost. Reconnecting...'); }
//         };

//         const onRecitationReady = async (data: RecitationReadyData) => {
//           console.log('✅ recitation-ready received:', data);
//           if (!mounted) return;
//           setCurrentAyah(data);
//           setIsLoading(false);
//           isReadyRef.current = true;

//           // ✅ KEY FIX: If startRecording was requested before ready, start now
//           if (pendingStartRecordingRef.current) {
//             pendingStartRecordingRef.current = false;
//             console.log('▶️ Starting pending recording now that session is ready');
//             await startMicRecording(sock);
//           }
//         };

//         const onVerificationResult = (data: VerificationResultData) => {
//           if (mounted) {
//             setCurrentAccuracy(data.accuracy);
//             verificationCbs.current.forEach(cb => cb(data));
//           }
//         };

//         const onAIFeedback = (data: AIFeedbackData) => {
//           if (mounted) aiFeedbackCbs.current.forEach(cb => cb(data));
//         };

//         const onRecitationError = (error: RecitationError) => {
//           if (mounted) {
//             setIsLoading(false);
//             // Only surface errors that aren't the "not ready" race condition
//             errorCbs.current.forEach(cb => cb(error));
//           }
//         };

//         const onRecitationCancelled = () => {
//           if (mounted) {
//             isReadyRef.current = false;
//             pendingStartRecordingRef.current = false;
//           }
//         };

//         sock.on('connect',              onConnect);
//         sock.on('disconnect',           onDisconnect);
//         sock.on('recitation-ready',     onRecitationReady);
//         sock.on('verification-result',  onVerificationResult);
//         sock.on('ai-feedback',          onAIFeedback);
//         sock.on('recitation-error',     onRecitationError);
//         sock.on('recitation-cancelled', onRecitationCancelled);

//         return () => {
//           sock.off('connect',              onConnect);
//           sock.off('disconnect',           onDisconnect);
//           sock.off('recitation-ready',     onRecitationReady);
//           sock.off('verification-result',  onVerificationResult);
//           sock.off('ai-feedback',          onAIFeedback);
//           sock.off('recitation-error',     onRecitationError);
//           sock.off('recitation-cancelled', onRecitationCancelled);
//         };
//       } catch {
//         if (mounted) {
//           setIsConnected(false);
//           setConnectionError('Failed to connect to server');
//         }
//       }
//     };

//     init();
//     return () => {
//       mounted = false;
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, []);

//   /* ── Mic recording (internal) ─────────────────────────────── */
//   const startMicRecording = useCallback(async (sock: Socket) => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           channelCount   : 1,                             
//           sampleRate     : 16000,
//           echoCancellation: true,
//           noiseSuppression: true,
//         },
//       });
//       streamRef.current = stream;
//       setIsMicActive(true);

//       const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
//       const recorder = new MediaRecorder(stream, { mimeType });
//       mediaRecorderRef.current = recorder;

//       recorder.ondataavailable = (e: BlobEvent) => {
//         if (e.data.size > 0 && sock.connected) {
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const b64 = (reader.result as string).split(',')[1];
//             sock.emit('audio-chunk', { audio: b64 });
//           };
//           reader.readAsDataURL(e.data);
//         }
//       };

//       recorder.start(2000); // send a chunk every 2 seconds
//       setIsRecording(true);

//       // Keepalive ping
//       intervalRef.current = setInterval(() => {
//         if (sock.connected) sock.emit('ping');
//       }, 10000);

//     } catch (err) {
//       console.error('🎤 Mic error:', err);
//       setIsMicActive(false);
//       errorCbs.current.forEach(cb => cb({ message: 'Could not access microphone' }));
//     }
//   }, []);

//   /* ── Public API ──────────────────────────────────────────── */

//   const reconnect = useCallback(() => {
//     setConnectionError(null);
//     connectionPromise = null;
//     socketInstance?.disconnect();
//     socketInstance = null;
//     getSocket().catch(console.error);
//   }, []);

//   const resetState = useCallback(() => {
//     setCurrentAccuracy(0);
//     setCurrentAyah(null);
//     setActiveAyahId(null);
//     setIsLoading(false);
//     setIsRecording(false);
//     setIsMicActive(false);
//     isReadyRef.current = false;
//     pendingStartRecordingRef.current = false;
//   }, []);

//   const startRecitation = useCallback((data: RecitationStartData, ayahId: string) => {
//     if (!socket?.connected) {
//       setConnectionError('Not connected to server');
//       return;
//     }

//     // Reset for new session
//     setIsLoading(true);
//     setCurrentAccuracy(0);
//     setCurrentAyah(null);
//     setActiveAyahId(ayahId);
//     isReadyRef.current = false;
//     pendingStartRecordingRef.current = false;

//     console.log('📤 Emitting start-recitation:', data);
//     socket.emit('start-recitation', data);
//   }, [socket]);

//   // ✅ FIX: startRecording now either starts immediately (if ready)
//   // or sets a pending flag that fires once recitation-ready arrives
//   const startRecording = useCallback(async (): Promise<void> => {
//     if (!socket?.connected) {
//       setConnectionError('Not connected to server');
//       return;
//     }

//     if (isReadyRef.current) {
//       // Session already ready (recitation-ready already fired)
//       await startMicRecording(socket);
//     } else {
//       // Session not ready yet — set pending flag
//       console.log('⏳ Session not ready, will start recording when ready');
//       pendingStartRecordingRef.current = true;
//     }
//   }, [socket, startMicRecording]);

//   const stopRecording = useCallback(() => {
//     pendingStartRecordingRef.current = false;

//     if (mediaRecorderRef.current?.state === 'recording') {
//       mediaRecorderRef.current.stop();
//     }
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(t => t.stop());
//       streamRef.current = null;
//     }

//     setIsRecording(false);
//     setIsMicActive(false);

//     if (socket?.connected) {
//       socket.emit('complete-recitation');
//     }
//   }, [socket]);

//   const cancelRecitation = useCallback(() => {
//     pendingStartRecordingRef.current = false;
//     isReadyRef.current = false;

//     if (socket?.connected) {
//       socket.emit('cancel-recitation');
//     }
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (mediaRecorderRef.current?.state === 'recording') {
//       mediaRecorderRef.current.stop();
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(t => t.stop());
//       streamRef.current = null;
//     }

//     setIsRecording(false);
//     setIsLoading(false);
//     setIsMicActive(false);
//     setActiveAyahId(null);
//     setCurrentAyah(null);
//     setCurrentAccuracy(0);
//   }, [socket]);

//   const onVerificationResult = useCallback((cb: (d: VerificationResultData) => void) => {
//     verificationCbs.current.push(cb);
//   }, []);

//   const onAIFeedback = useCallback((cb: (d: AIFeedbackData) => void) => {
//     aiFeedbackCbs.current.push(cb);
//   }, []);

//   const onError = useCallback((cb: (e: RecitationError) => void) => {
//     errorCbs.current.push(cb);
//   }, []);

//   return {
//     isConnected,
//     isRecording,
//     isLoading,
//     isMicActive,
//     currentAccuracy,
//     currentAyah,
//     activeAyahId,
//     connectionError,
//     reconnect,
//     resetState,
//     startRecitation,
//     startRecording,
//     stopRecording,
//     cancelRecitation,
//     onVerificationResult,
//     onAIFeedback,
//     onError,
//   };
// };
// hooks/useRecitationChecker.ts
// FIX: startRecording is called ONLY after recitation-ready event fires














import { useState, useRef, useCallback, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import {
  RecitationStartData,
  RecitationReadyData,
  VerificationResultData,
  AIFeedbackData,
  RecitationError,
} from '../types/ayahs';

interface UseRecitationCheckerReturn {
  isConnected: boolean;
  isRecording: boolean;
  isLoading: boolean;
  isMicActive: boolean;
  currentAccuracy: number;
  currentAyah: RecitationReadyData | null;
  activeAyahId: string | null;
  connectionError: string | null;
  reconnect: () => void;
  resetState: () => void;
  startRecitation: (data: RecitationStartData, ayahId: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecitation: () => void;
  onVerificationResult: (cb: (data: VerificationResultData) => void) => void;
  onAIFeedback: (cb: (data: AIFeedbackData) => void) => void;
  onError: (cb: (error: RecitationError) => void) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

const getSocket = (): Promise<Socket> => {
  if (socketInstance?.connected) return Promise.resolve(socketInstance);
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports          : ['websocket', 'polling'],
      reconnection        : true,
      reconnectionAttempts: 10,
      reconnectionDelay   : 1000,
      reconnectionDelayMax: 5000,
      timeout             : 30000,
    });

    const tid = setTimeout(() => reject(new Error('Connection timeout')), 15000);

    socket.on('connect', () => {
      clearTimeout(tid);
      socketInstance = socket;
      connectionPromise = null;
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(tid);
      connectionPromise = null;
      reject(err);
    });
  });

  return connectionPromise;
};

export const useRecitationChecker = (): UseRecitationCheckerReturn => {
  const [socket, setSocket]               = useState<Socket | null>(null);
  const [isConnected, setIsConnected]     = useState(false);
  const [isRecording, setIsRecording]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [isMicActive, setIsMicActive]     = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [currentAyah, setCurrentAyah]     = useState<RecitationReadyData | null>(null);
  const [activeAyahId, setActiveAyahId]   = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const intervalRef       = useRef<NodeJS.Timeout | null>(null);

  const verificationCbs = useRef<((d: VerificationResultData) => void)[]>([]);
  const aiFeedbackCbs   = useRef<((d: AIFeedbackData) => void)[]>([]);
  const errorCbs        = useRef<((e: RecitationError) => void)[]>([]);

  const pendingStartRecordingRef = useRef(false);
  const isReadyRef               = useRef(false);
  // =====================================================
  const logRomanConversion = (data: any, label: string) => {
    console.group(`🕌 ${label} - Roman Conversion`);
    console.log('📝 Original Arabic:', data.text?.substring(0, 100));
    console.log('🔊 Roman Output:', data.romanText?.substring(0, 100));
    if (data.romanText && data.romanText.length > 100) {
      console.log('📋 Full Roman:', data.romanText);
    }
    console.log('📊 Word Count:', data.wordCount || 'N/A');
    console.groupEnd();
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setConnectionError(null);
        const sock = await getSocket();
        if (!mounted) return;

        setSocket(sock);
        setIsConnected(sock.connected);

        const onConnect = () => {
          if (mounted) { setIsConnected(true); setConnectionError(null); }
        };

        const onDisconnect = () => {
          if (mounted) { setIsConnected(false); setConnectionError('Connection lost. Reconnecting...'); }
        };

        const onRecitationReady = async (data: RecitationReadyData) => {
          console.log('✅ recitation-ready received:', data);
                    logRomanConversion(data, 'Correct Ayah');

          if (!mounted) return;
          setCurrentAyah(data);
          setIsLoading(false);
          isReadyRef.current = true;

          if (pendingStartRecordingRef.current) {
            pendingStartRecordingRef.current = false;
            console.log('▶️ Starting pending recording now that session is ready');
            await startMicRecording(sock);
          }
        };

        const onVerificationResult = (data: VerificationResultData) => {
          if (mounted) {
            setCurrentAccuracy(data.accuracy);
            verificationCbs.current.forEach(cb => cb(data));
          }
        };

        const onAIFeedback = (data: AIFeedbackData) => {
          if (mounted) aiFeedbackCbs.current.forEach(cb => cb(data));
        };

        const onRecitationError = (error: RecitationError) => {
          if (mounted) {
            setIsLoading(false);
            errorCbs.current.forEach(cb => cb(error));
          }
        };

        const onRecitationCancelled = () => {
          if (mounted) {
            isReadyRef.current = false;
            pendingStartRecordingRef.current = false;
          }
        };

        sock.on('connect',              onConnect);
        sock.on('disconnect',           onDisconnect);
        sock.on('recitation-ready',     onRecitationReady);
        sock.on('verification-result',  onVerificationResult);
        sock.on('ai-feedback',          onAIFeedback);
        sock.on('recitation-error',     onRecitationError);
        sock.on('recitation-cancelled', onRecitationCancelled);

        return () => {
          sock.off('connect',              onConnect);
          sock.off('disconnect',           onDisconnect);
          sock.off('recitation-ready',     onRecitationReady);
          sock.off('verification-result',  onVerificationResult);
          sock.off('ai-feedback',          onAIFeedback);
          sock.off('recitation-error',     onRecitationError);
          sock.off('recitation-cancelled', onRecitationCancelled);
        };
      } catch {
        if (mounted) {
          setIsConnected(false);
          setConnectionError('Failed to connect to server');
        }
      }
    };

    init();
    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startMicRecording = useCallback(async (sock: Socket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount   : 1,                             
          sampleRate     : 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      setIsMicActive(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0 && sock.connected) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const b64 = (reader.result as string).split(',')[1];
            sock.emit('audio-chunk', { audio: b64 });
          };
          reader.readAsDataURL(e.data);
        }
      };

      recorder.start(2000);
      setIsRecording(true);

      intervalRef.current = setInterval(() => {
        if (sock.connected) sock.emit('ping');
      }, 10000);

    } catch (err) {
      console.error('🎤 Mic error:', err);
      setIsMicActive(false);
      errorCbs.current.forEach(cb => cb({ message: 'Could not access microphone' }));
    }
  }, []);

  const reconnect = useCallback(() => {
    setConnectionError(null);
    connectionPromise = null;
    socketInstance?.disconnect();
    socketInstance = null;
    getSocket().catch(console.error);
  }, []);

  const resetState = useCallback(() => {
    setCurrentAccuracy(0);
    setCurrentAyah(null);
    setActiveAyahId(null);
    setIsLoading(false);
    setIsRecording(false);
    setIsMicActive(false);
    isReadyRef.current = false;
    pendingStartRecordingRef.current = false;
  }, []);

  const startRecitation = useCallback((data: RecitationStartData, ayahId: string) => {
    if (!socket?.connected) {
      setConnectionError('Not connected to server');
      return;
    }

    setIsLoading(true);
    setCurrentAccuracy(0);
    setCurrentAyah(null);
    setActiveAyahId(ayahId);
    isReadyRef.current = false;
    pendingStartRecordingRef.current = false;

    console.log('📤 Emitting start-recitation:', data);
    socket.emit('start-recitation', data);
  }, [socket]);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!socket?.connected) {
      setConnectionError('Not connected to server');
      return;
    }

    if (isReadyRef.current) {
      await startMicRecording(socket);
    } else {
      console.log('⏳ Session not ready, will start recording when ready');
      pendingStartRecordingRef.current = true;
    }
  }, [socket, startMicRecording]);

  const stopRecording = useCallback(() => {
    pendingStartRecordingRef.current = false;

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsMicActive(false);

    if (socket?.connected) {
      socket.emit('complete-recitation');
    }
  }, [socket]);

  const cancelRecitation = useCallback(() => {
    pendingStartRecordingRef.current = false;
    isReadyRef.current = false;

    if (socket?.connected) {
      socket.emit('cancel-recitation');
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsLoading(false);
    setIsMicActive(false);
    setActiveAyahId(null);
    setCurrentAyah(null);
    setCurrentAccuracy(0);
  }, [socket]);

  const onVerificationResult = useCallback((cb: (d: VerificationResultData) => void) => {
    verificationCbs.current.push(cb);
  }, []);

  const onAIFeedback = useCallback((cb: (d: AIFeedbackData) => void) => {
    aiFeedbackCbs.current.push(cb);
  }, []);

  const onError = useCallback((cb: (e: RecitationError) => void) => {
    errorCbs.current.push(cb);
  }, []);

  return {
    isConnected,
    isRecording,
    isLoading,
    isMicActive,
    currentAccuracy,
    currentAyah,
    activeAyahId,
    connectionError,
    reconnect,
    resetState,
    startRecitation,
    startRecording,
    stopRecording,
    cancelRecitation,
    onVerificationResult,
    onAIFeedback,
    onError,
  };
};