
import { useRef, useEffect } from "react";
import { CoverData } from "./CoverTypes";

interface CoverCanvasProps {
  coverData: CoverData;
  width?: number;
  height?: number;
  scale?: number;
  className?: string;
}

const CoverCanvas = ({ 
  coverData,
  width = 400,
  height = 600,
  scale = 1,
  className = ""
}: CoverCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background color
    if (coverData.backgroundColor) {
      ctx.fillStyle = coverData.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw background image if available
    if (coverData.backgroundImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = coverData.backgroundImage;
      
      img.onload = () => {
        // Center and cover the canvas with the image
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        drawTexts();
      };
    } else {
      drawTexts();
    }
    
    function drawTexts() {
      if (coverData.titleText) {
        // Calculate base font size as a percentage of canvas width
        const baseTitleSize = Math.floor(canvas.width * 0.08); // 8% of canvas width
        
        // Apply the user's size preference as a multiplier (default is 1.0)
        // titleSize ranges from 18-24, so we map it to 0.85-1.15 multiplier
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.85 + ((coverData.titleSize - 18) / (24 - 18)) * 0.3) : 1.0;
        
        // Calculate final title size with user preferences applied
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier * scale);

        // Draw title
        ctx.font = `bold ${finalTitleSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.titleColor || '#303441';
        ctx.textAlign = 'center';
        
        let titleY;
        if (coverData.layout === 'top') {
          titleY = canvas.height * 0.2;
        } else if (coverData.layout === 'bottom') {
          titleY = canvas.height * 0.65;
        } else { // centered
          titleY = canvas.height * 0.45;
        }
        
        // Handle multiline text
        const titleLines = wrapText(ctx, coverData.titleText, canvas.width * 0.8, finalTitleSize);
        titleLines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, titleY + index * (finalTitleSize * 1.2));
        });
      }
      
      if (coverData.authorText) {
        // Calculate base author font size
        const baseAuthorSize = Math.floor(canvas.width * 0.045); // 4.5% of canvas width
        
        // Apply user's size preference (default is 1.0)
        // authorSize ranges from 12-16, so we map it to 0.9-1.1 multiplier
        const authorSizeMultiplier = coverData.authorSize ? 
          (0.9 + ((coverData.authorSize - 12) / (16 - 12)) * 0.2) : 1.0;
        
        // Calculate final author size with user preferences applied
        const finalAuthorSize = Math.floor(baseAuthorSize * authorSizeMultiplier * scale);
        
        ctx.font = `${finalAuthorSize}px 'Rosemartin', serif`;
        ctx.fillStyle = coverData.authorColor || '#303441';
        ctx.textAlign = 'center';
        
        // Get title size for spacing calculation
        const baseTitleSize = Math.floor(canvas.width * 0.08);
        const titleSizeMultiplier = coverData.titleSize ? 
          (0.85 + ((coverData.titleSize - 18) / (24 - 18)) * 0.3) : 1.0;
        const finalTitleSize = Math.floor(baseTitleSize * titleSizeMultiplier * scale);
        
        let authorY;
        if (coverData.layout === 'top') {
          authorY = canvas.height * 0.3 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
        } else if (coverData.layout === 'bottom') {
          authorY = canvas.height * 0.75 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
        } else { // centered
          authorY = canvas.height * 0.55 + ((coverData.titleText ? (finalTitleSize * 1.5) : 0));
        }
        
        ctx.fillText(coverData.authorText, canvas.width / 2, authorY);
      }
    }
    
  }, [coverData, width, height, scale]);

  // Utility function to wrap text for canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    maxWidth: number,
    fontSize: number
  ): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="book-cover-container">
      <canvas
        ref={canvasRef}
        className={`shadow-lg rounded-md book-canvas ${className}`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          aspectRatio: '5/8'
        }}
      />
      <div className="book-spine-overlay"></div>
      <div className="book-cover-overlay"></div>
    </div>
  );
};

export default CoverCanvas;
