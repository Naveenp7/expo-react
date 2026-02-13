import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Fuse from 'fuse.js';
import projectsData from '../data/projects.json';

// Initialize Fuse outside component to avoid rebuilds
const fuse = new Fuse(projectsData, {
    keys: ['keywords'],
    threshold: 0.6, // More fuzzy to catch variations
});

export const useVoice = () => {
    const [response, setResponse] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const commands = [
        {
            command: '*',
            callback: (command: string) => handleQuery(command)
        }
    ];

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
        error
    } = useSpeechRecognition({ commands });

    // Handle TTS using Native SpeechSynthesis
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            // Specifically target English voices
            const voices = window.speechSynthesis.getVoices();

            // Try to find a specific English voice
            const engVoice = voices.find(v => v.lang.includes('en-US')) ||
                voices.find(v => v.lang.includes('en')) ||
                voices.find(v => v.name.includes('English'));

            if (engVoice) {
                utterance.voice = engVoice;
                console.log("Using Voice:", engVoice.name);
            } else {
                console.log("No specific English voice found. Using default.");
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                startListening();
            };

            utterance.onerror = (e) => {
                console.error("SpeechSynthesis Error:", e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
            setResponse(text);
        } else {
            console.error("TTS not supported in this browser");
        }
    };

    const handleQuery = (query: string) => {
        if (!query) return;

        // Stop listening while processing
        SpeechRecognition.stopListening();

        console.log("Query:", query);
        const lowerQuery = query.toLowerCase();

        // 1. Direct checks for common conversational fillers
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi ') || lowerQuery === 'hi') {
            speak("Hello! How can I help you regarding the projects?");
            resetTranscript();
            return;
        }

        if (lowerQuery.includes('how are you')) {
            speak("I am doing great, thank you! I am ready to explain any project here.");
            resetTranscript();
            return;
        }

        // 2. Fuzzy Search for Projects
        const results = fuse.search(query);

        let answer = '';
        if (results.length > 0) {
            answer = results[0].item.answer;
        } else {
            answer = "Sorry, I didn't quite catch that. Could you rephrase your question about the projects?";
        }

        speak(answer);
        resetTranscript();
    };

    const startListening = () => {
        console.log("Attempting to start listening...");
        if (!window.isSecureContext) {
            console.error("Speech Recognition requires a secure context (HTTPS) or localhost.");
            alert("Voice features require HTTPS. Please deploy with SSL.");
            return;
        }

        try {
            // Continuous listening for demo
            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
            console.log("SpeechRecognition.startListening called.");
        } catch (err) {
            console.error("Failed to call SpeechRecognition.startListening:", err);
        }
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    // Initial Voice Load
    useEffect(() => {
        // Ensure voices are loaded (Chrome quirk)
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // Log Speech Recognition Errors
    useEffect(() => {
        if (error) {
            console.error("Speech Recognition Error:", error);
        }
    }, [error]);

    // Error handling and auto-restart
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error("Browser does not support Speech Recognition.");
            return;
        }

        if (!isMicrophoneAvailable) {
            console.warn("Microphone is not available.");
            // You might want to show a UI alert here as well
        }

        if (!window.isSecureContext) {
            console.warn("Application is not running in a secure context (HTTPS). Speech Recognition may fail.");
        }

        // Restart listening if it stops unexpectedly
        // BUT ONLY if we have permission / microphone access
        // Otherwise this creates an infinite loop of denial errors
        if (!listening && !isSpeaking && isMicrophoneAvailable && error !== 'not-allowed' && error !== 'service-not-allowed') {
            // Small delay to prevent rapid loops
            const timeout = setTimeout(() => {
                startListening();
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [listening, isSpeaking, browserSupportsSpeechRecognition, isMicrophoneAvailable]);


    return {
        listening,
        transcript,
        resetTranscript,
        response,
        isSpeaking,
        speak,
        startListening,
        stopListening,
        browserSupportsSpeechRecognition
    };
};
