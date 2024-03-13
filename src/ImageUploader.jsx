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

  const handleSave = async () => {
    if (!image) return; // Exit if no image
  
    const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
    const formData = new FormData();
    formData.append('original_image', image);
    formData.append('mask_image', blob);
  
    const url = 'http://192.168.1.39:5001/upload';
  
    fetch(url, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
  }; 

  return (
    <div style={{ position: 'relative', width: '500px', height: '500px', margin: '20px' }}>
      <input type="file" onChange={handleImageChange} accept="image/*" style={{ zIndex: 2, position: 'absolute' }} />
      {preview && (
        <>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '500px', maxHeight: '500px', width: '100%', height: '100%', objectFit: 'contain', position: 'absolute' }}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ position: 'absolute', left: '0', top: '0', width: '100%', height: '100%' }}
          />
        </>
      )}
      <button onClick={handleSave} style={{ position: 'absolute', right: 0, zIndex: 3 }}>Save Image & Mask</button>
    </div>
  );
}

export default ImageUploader;
