import React, { useRef, useState, useEffect } from "react";

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera", error);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    startCamera();
    getLocation();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setImage({ dataUrl, location });
    // Stop the video stream when the image is captured
    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  };

  const handleRetake = () => {
    setImage(null);
    startCamera(); // Restart the camera
  };

  return (
    <div className="container">
      <h1 style={{textAlign:"center"}}>POC</h1>
      {!image ? (
        <div className="container">
          <video  ref={videoRef} autoPlay width="640" height="480"></video>
          <button onClick={handleCapture} className="btn">Capture</button>
        </div>
      ) : (
        <div className="container">
          <img src={image.dataUrl} alt="Captured" width="640" height="480" />
          <div>
          <button className="btn" onClick={handleRetake}>Retake</button>
          <button className="btn"  onClick={() => console.log(image)}>Save</button>{" "}
            </div>
        
          <p>Latitude: {image.location.lat}</p>
          <p>Longitude: {image.location.lng}</p>
          {/* Implement save functionality as needed */}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      ></canvas>
    </div>
  );
};

export default CameraCapture;
