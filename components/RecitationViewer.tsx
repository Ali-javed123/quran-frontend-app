// components/RecitationViewer.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Volume2,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import { RecitationStartData, WrongWord, AIMistake, VerificationResultData, AIFeedbackData, RecitationError } from '../types/ayahs';
import { useRecitationChecker } from '../hooks/useRecitationChecker';

interface RecitationViewerProps {
  suraIndex: number | null;
  ayaIndex: number | null;
  pageNo: number | null;
  paraNo: number | null;
  ayahText?: string;
  onClose: () => void;
}

export const RecitationViewer: React.FC<RecitationViewerProps> = ({
  suraIndex,
  ayaIndex,
  pageNo,
  paraNo,
  ayahText,
  onClose,
}) => {
  const {
    isConnected,
    isRecording,
    isLoading,
    currentAccuracy,
    currentAyah,
    connectionError,
    reconnect,
    startRecitation,
    startRecording,
    stopRecording,
    cancelRecitation,
    onVerificationResult,
    onAIFeedback,
    onError,
  } = useRecitationChecker();
  
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [localTranscribedText, setLocalTranscribedText] = useState<string>('');
  const [localWrongWords, setLocalWrongWords] = useState<WrongWord[]>([]);
  const [localAIFeedback, setLocalAIFeedback] = useState<AIFeedbackData | null>(null);
  const [localAccuracy, setLocalAccuracy] = useState<number>(0);
  const [localIsPerfect, setLocalIsPerfect] = useState<boolean>(false);
  
  // Setup event listeners for this component
  useEffect(() => {
    // const handleVerification = (data: VerificationResultData) => {
    //   setLocalAccuracy(data.accuracy);
    //   setLocalTranscribedText(data.transcribedText);
    //   setLocalWrongWords(data.wrongWords);
    //   setLocalIsPerfect(data.isPerfect);
    // };
    const handleVerification = (data: VerificationResultData) => {
  setLocalAccuracy(data.accuracy);
  setLocalTranscribedText(data.transcribedText);
  setLocalIsPerfect(data.isPerfect);

  // Filter: only real substitution errors show in UI
  const realErrors = (data.wrongWords || []).filter(
    (w) =>
      w.errorType === 'substitution' &&
      w.userWord &&
      w.correctWord
  );
  setLocalWrongWords(realErrors);
};
    
    const handleAIFeedback = (data: AIFeedbackData) => {
      setLocalAIFeedback(data);
    };
    
    const handleError = (error: RecitationError) => {
      console.error('Recitation error:', error);
    };
    
    onVerificationResult(handleVerification);
    onAIFeedback(handleAIFeedback);
    onError(handleError);
    
    return () => {
      // Cleanup will be handled by the hook
    };
  }, [onVerificationResult, onAIFeedback, onError]);
  
  useEffect(() => {
    // Reset local state when component mounts
    setLocalAccuracy(0);
    setLocalTranscribedText('');
    setLocalWrongWords([]);
    setLocalAIFeedback(null);
    setLocalIsPerfect(false);
    setShowFeedback(false);
    
    const startData: RecitationStartData = {
      suraIndex: suraIndex ?? null,
      ayaIndex: ayaIndex ?? null,
      pageNo: pageNo ?? null,
      paraNo: paraNo ?? null,
    };
    
    // Small delay to ensure socket is ready
    const timer = setTimeout(() => {
      startRecitation(startData, `ayah-${suraIndex}-${ayaIndex}-${Date.now()}`);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cancelRecitation();
    };
  }, [suraIndex, ayaIndex, pageNo, paraNo]);
  
  const handleToggleRecording = async (): Promise<void> => {
    if (!isConnected) {
      console.error('Cannot record: Socket not connected');
      return;
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };
  
  const handleRetryConnection = (): void => {
    reconnect();
    const startData: RecitationStartData = {
      suraIndex: suraIndex ?? null,
      ayaIndex: ayaIndex ?? null,
      pageNo: pageNo ?? null,
      paraNo: paraNo ?? null,
    };
    startRecitation(startData, `ayah-${suraIndex}-${ayaIndex}-${Date.now()}`);
  };
  
  const displayText: string = currentAyah?.textTajweed || ayahText || '';
  const displaySuraIndex: number = currentAyah?.suraIndex || suraIndex || 0;
  const displayAyaIndex: number = currentAyah?.ayaIndex || ayaIndex || 0;
  
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getAccuracyMessage = (accuracy: number): string => {
    if (accuracy >= 95) return 'Excellent! Perfect recitation!';
    if (accuracy >= 85) return 'Very good! A few minor improvements needed.';
    if (accuracy >= 70) return 'Good effort! Review the highlighted words.';
    return 'Keep practicing! Focus on the correct pronunciation.';
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              AI Recitation Checker
            </h2>
            {/* Connection Status Indicator */}
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Connection Status */}
        {!isConnected && (
          <div className="m-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 dark:text-red-300 font-semibold">
                Connection Lost
              </span>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">
              Unable to connect to the verification server. Please check your connection.
            </p>
            <button
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        {connectionError && !isConnected && (
          <div className="m-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              {connectionError}
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && isConnected && (
          <div className="m-4 p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
            <p className="text-gray-500">Loading ayah data...</p>
          </div>
        )}
        
        {/* Ayah Display */}
        {displayText && !isLoading && (
          <div className="p-6 border-b">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Surah {displaySuraIndex} • Ayah {displayAyaIndex}
              </p>
              <div 
                className="quran-ayat-text text-3xl md:text-4xl leading-[2.4] text-right font-arabic"
                dir="rtl"
              >
                {displayText}
              </div>
            </div>
          </div>
        )}
        
        {/* Recording Controls - Only show when connected and not loading */}
        {isConnected && !isLoading && (
          <div className="p-6 flex flex-col items-center gap-6">
            <button
              onClick={handleToggleRecording}
              disabled={!isConnected}
              className={`
                w-24 h-24 rounded-full flex items-center justify-center transition-all
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
            
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {isRecording 
                ? '🔴 Recording... Speak the ayah clearly' 
                : '🎤 Click the microphone and recite the ayah'}
            </p>
            
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Listening...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Accuracy Display */}
        {(localAccuracy > 0 || currentAccuracy > 0) && !isLoading && (
          <div className="px-6 pb-4">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Accuracy Score</span>
                <span className={`text-2xl font-bold ${getAccuracyColor(localAccuracy || currentAccuracy)}`}>
                  {localAccuracy || currentAccuracy}%
                </span>
              </div>
              
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (localAccuracy || currentAccuracy) >= 90 ? 'bg-green-500' :
                    (localAccuracy || currentAccuracy) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${localAccuracy || currentAccuracy}%` }}
                />
              </div>
              
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {getAccuracyMessage(localAccuracy || currentAccuracy)}
              </p>
              
              {(localIsPerfect) && (
                <div className="mt-3 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Perfect recitation! Masha&apos;Allah!</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Transcribed Text */}
        {localTranscribedText && !isLoading && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                What you recited:
              </p>
              <p className="text-right font-arabic text-lg" dir="rtl">
                {localTranscribedText}
              </p>
            </div>
          </div>
        )}
        
        {/* Wrong Words Display */}
        {localWrongWords.length > 0 && (localAccuracy || currentAccuracy) < 95 && !isLoading && (
          <div className="px-6 pb-4">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="w-full text-left bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                  ⚠️ {localWrongWords.length} word(s) need improvement
                </span>
                <span>{showFeedback ? '▲' : '▼'}</span>
              </div>
            </button>
            
            {showFeedback && (
              <div className="mt-3 space-y-3">
                {localWrongWords.map((word: WrongWord, idx: number) => (
                  <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-arabic text-lg" dir="rtl">
                          {word.userOriginal ? (
                            <>
                              <span className="text-red-600 line-through">
                                {word.userOriginal}
                              </span>
                              {' → '}
                              <span className="text-green-600">
                                {word.correctOriginal}
                              </span>
                            </>
                          ) : word.isMissing ? (
                            <span className="text-orange-600">
                              Missing: {word.correctOriginal}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              Extra: {word.userOriginal}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Position: {word.position}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* AI Feedback */}
        {localAIFeedback && !isLoading && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  AI Teacher Feedback
                </span>
              </div>
              
              {localAIFeedback.overall && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {localAIFeedback.overall}
                </p>
              )}
              
              {localAIFeedback.mistakes && localAIFeedback.mistakes.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="font-medium">Mistakes to correct:</p>
                  {localAIFeedback.mistakes.map((mistake: AIMistake, idx: number) => (
                    <div key={idx} className="text-sm">
                      <span className="text-red-600">{mistake.user}</span>
                      {' → '}
                      <span className="text-green-600">{mistake.correct}</span>
                      {mistake.tip && (
                        <p className="text-gray-500 text-xs mt-1">{mistake.tip}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {localAIFeedback.encouragement && (
                <p className="mt-3 text-emerald-600 dark:text-emerald-400 italic">
                  {localAIFeedback.encouragement}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t p-4 flex justify-end gap-3">
          <button
            onClick={() => {
              cancelRecitation();
              onClose();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Stop & Submit
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
};