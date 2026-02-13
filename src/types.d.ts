declare module 'react-speech-recognition' {
    export interface SpeechRecognitionOptions {
        transcribing?: boolean;
        clearTranscriptOnListen?: boolean;
        commands?: {
            command: string | string[] | RegExp;
            callback: (command: string) => void;
            isFuzzyMatch?: boolean;
            fuzzyMatchingThreshold?: number;
            bestMatchOnly?: boolean;
        }[];
        language?: string;
        continuous?: boolean;
    }

    export interface SpeechRecognition {
        getRecognition(): SpeechRecognition | null;
        startListening(options?: SpeechRecognitionOptions): Promise<void>;
        stopListening(): Promise<void>;
        abortListening(): Promise<void>;
        browserSupportsSpeechRecognition(): boolean;
        applyPolyfill(speechRecognitionPolyfill: any): void;
    }

    export function useSpeechRecognition(options?: SpeechRecognitionOptions): {
        transcript: string;
        interimTranscript: string;
        finalTranscript: string;
        listening: boolean;
        resetTranscript: () => void;
        browserSupportsSpeechRecognition: boolean;
    };

    const SpeechRecognition: SpeechRecognition;
    export default SpeechRecognition;
}
