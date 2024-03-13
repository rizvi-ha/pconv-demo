import React, { useState, useRef, useEffect } from 'react';

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [processedImage, setProcessedImage] = useState('');
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
      // Create an image element to load the selected file
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        // Create a temporary canvas to draw the resized image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 500;
  
        // Draw the image with new dimensions
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        // Convert canvas to blob and update the image state
        canvas.toBlob((blob) => {
          const resizedImage = new File([blob], file.name, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          setImage(resizedImage); // Update state with the resized image
  
          // Update preview
          setPreview(URL.createObjectURL(resizedImage));
        }, 'image/png');
      };
    } else {
      setImage(null);
      setPreview('');
    }
  };

  const handleSave = async () => {
    if (!image) return; // Exit if no image
  
    // Ensure the canvas drawing's transparent parts are filled with black
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
  
    // Create a new imageData object, filling transparent parts with black
    let imgData = ctx.getImageData(0, 0, w, h);
    ctx.putImageData(imgData, 0, 0);
  
    // Convert the canvas to a Blob as JPG
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 1.0));
    const maskImageFile = new File([blob], 'mask-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
  });
    const formData = new FormData();
    formData.append('original_image', image);
    formData.append('mask_image', maskImageFile); // Now sending as JPG
  
    const url = 'http://127.0.0.1:5001/upload';
  
    fetch(url, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
      .then(data => { 
        console.log(data); 
        setProcessedImage(data.encoded_image);
      })
      .catch(error => console.error('Error:', error));
  };
  

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {/* If your logo is in the public folder, you can reference it like below */}
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" style={{ height: '150px', marginRight: '10px' }} />
        
        <h1 style={{ margin: 0 }}>PicassoGPT</h1>
      </header>
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
        {processedImage && (
          <img
            src={`data:image/jpeg;base64,${processedImage}`}
            alt="Processed"
            style={{ maxWidth: '500px', maxHeight: '500px', width: 'auto', height: 'auto', objectFit: 'contain', position: 'absolute', top: '0', left: '0' }}
          />
        )}
        <button onClick={handleSave} style={{ position: 'absolute', right: 0, zIndex: 3 }}>Save Image & Mask</button>
      </div>
    </div>
  );
}

export default ImageUploader;
