import { useRef, useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Webcam from 'react-webcam';

export const useDetection = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [personDetected, setPersonDetected] = useState(false);
  const [personCount, setPersonCount] = useState(0);
  const [isPersonClose, setIsPersonClose] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        setModel(loadedModel);
        setIsLoaded(true);
        console.log('COCO-SSD Loaded');
      } catch (err) {
        console.error('Failed to load model', err);
      }
    };
    loadModel();
  }, []);

  // Detection Loop
  const detect = useCallback(async () => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4 &&
      model &&
      canvasRef.current
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set Canvas Dimensions
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Detect Objects
      const predictions = await model.detect(video);

      // Draw and Check for Person
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        let count = 0;
        let foundClose = false;

        predictions.forEach((prediction: cocoSsd.DetectedObject) => {
          if (prediction.class === 'person' && prediction.score > 0.5) {
            count++;

            // Calculate Area to determine proximity
            const [x, y, width, height] = prediction.bbox;
            const areaPercentage = (width * height) / (videoWidth * videoHeight);

            // If person covers more than 15% of frame, they are considered "close"
            if (areaPercentage > 0.15) {
              foundClose = true;
            }

            // Draw Bounding Box
            ctx.strokeStyle = foundClose ? '#FF00FF' : '#00FFFF'; // Magenta if close, Cyan if far
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            // Draw Label
            ctx.fillStyle = foundClose ? '#FF00FF' : '#00FFFF';
            ctx.font = '18px Arial';
            ctx.fillText(
              `${foundClose ? 'Hello! ' : ''}Visitor (${Math.round(prediction.score * 100)}%)`,
              x,
              y > 10 ? y - 5 : 10
            );
          }
        });

        setPersonCount(count);
        setPersonDetected(count > 0);
        setIsPersonClose(foundClose);
      }
    }
    requestAnimationFrame(detect);
  }, [model]);

  // Trigger detection loop when model matches
  useEffect(() => {
    if (isLoaded && model) {
      detect();
    }
  }, [isLoaded, model, detect]);

  return { webcamRef, canvasRef, personDetected, personCount, isPersonClose, isLoaded };
};
