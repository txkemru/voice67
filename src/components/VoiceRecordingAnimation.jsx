import React, { useEffect, useRef } from 'react';
import './VoiceRecordingAnimation.css';

const BAR_COUNT = 48;

const VoiceRecordingAnimation = ({ isRecording, volume, barData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isRecording) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const drawBars = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const barWidth = width / BAR_COUNT;
      const bars = barData && barData.length === BAR_COUNT ? barData : Array(BAR_COUNT).fill(volume * 0.7 + 0.2);
      ctx.save();
      for (let i = 0; i < BAR_COUNT; i++) {
        const barHeight = (bars[i] || 0.1) * height * 0.9;
        const x = i * barWidth + barWidth * 0.15;
        const y = height - barHeight;
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, y, barWidth * 0.7, barHeight);
      }
      ctx.restore();
      animationFrame = requestAnimationFrame(drawBars);
    };
    drawBars();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isRecording, volume, barData]);

  if (!isRecording) return null;

  return (
    <div className="voice-recording-bars">
      <canvas
        ref={canvasRef}
        width={320}
        height={44}
        className="bars-canvas"
      />
    </div>
  );
};

export default VoiceRecordingAnimation; 