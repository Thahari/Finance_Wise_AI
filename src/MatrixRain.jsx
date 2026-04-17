import React, { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full screen
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Characters to display - mixing finance symbols with matrix-like characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$€£¥+-*/=%#&_()@<>[]{}|'.split('');
    
    const fontSize = 18;
    const columns = Math.ceil(canvas.width / fontSize);
    
    // Array for drops - one per column
    const drops = [];
    for (let x = 0; x < columns; x++) {
      // Randomize initial positions so it doesn't drop all at once
      drops[x] = Math.random() * -100;
    }

    const draw = () => {
      // Dark background with opacity to create trail effect
      ctx.fillStyle = 'rgba(14, 14, 14, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.font = `500 ${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Skip text rendering if drop is still "above" the screen
        if (drops[i] < 0) {
          drops[i]++;
          continue;
        }

        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Shiny white text with a subtle glow for the "shiny" effect
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Reset shadow so background doesn't glow on next clear
        ctx.shadowBlur = 0;
        
        // Randomly scatter drops to top when they hit the bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35); // slightly faster for cool effect

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }} // Adjusted opacity to not overwhelm the text
    />
  );
};

export default MatrixRain;
