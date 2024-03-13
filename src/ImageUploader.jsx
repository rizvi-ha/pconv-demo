import React, { useState, useRef, useEffect } from 'react';

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setPreview('');
    }
  }, [image]);

  useEffect(() => {
    if (preview) {
      const canvas = canvasRef.current;
      canvas.width = 500;
      canvas.height = 500;
      canvas.style.width = '500px';
      canvas.style.height = '500px';

      const context = canvas.getContext('2d');
      context.strokeStyle = "white";
      context.lineWidth = 10; // Example line width
      contextRef.current = context;
    }
  }, [preview]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      setImage(file);
    } else {
      setImage(null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '500px', height: '500px' }}>
      <input type="file" onChange={handleImageChange} accept="image/*" style={{ position: 'absolute', zIndex: 2 }} />
      {preview && (
        <>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '500px', maxHeight: '500px', width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', left: '0', top: '0', pointerEvents: 'auto' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </>
      )}
    </div>
  );
}

export default ImageUploader;
