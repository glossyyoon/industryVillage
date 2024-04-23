import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import * as AWS from 'aws-sdk';
import ReactS3Client from 'react-aws-s3-typescript';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
});

const InterviewCamera: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [selectedMimeType, setSelectedMimeType] = useState('');

  const mirrorVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useLayoutEffect(() => {
    const mimeTypes = getSupportedMimeTypes();
    if (mimeTypes.length > 0) {
      setSelectedMimeType(mimeTypes[0]);
    }
  }, []);

  useEffect(() => {
    if (!stream) {
      void getMedia();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const getMedia = async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: { exact: true },
        },
        video: {
          width: 1280,
          height: 720,
        },
      };
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (mirrorVideoRef.current) {
        mirrorVideoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      console.log(`현재 마이크와 카메라가 연결되지 않았습니다`);
    }
  };

  const handleStartRecording = () => {
    setRecordedBlobs([]);
    try {
      mediaRecorderRef.current = new MediaRecorder(stream as MediaStream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedBlobs((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (e) {
      console.log(`MediaRecorder error`);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleDownload = () => {
    const blob = new Blob(recordedBlobs, { type: selectedMimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recorded-video.webm';
  
    const command = new PutObjectCommand({
      Bucket: "summit-rekognition-video",
      Key: `${Date.now()+'video'}`,
      Body: blob,
      ContentType: 'video/mp4'
    });
  
    try {
      const response = async() => client.send(command);
      console.log(response);
      console.log('확인');
      console.log(command);
    } catch (err) {
      console.error(err+`S3 upload error`);
    }

  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    }, 100);
  };

  const getSupportedMimeTypes = () => {
    const types = [
      'video/webm; codecs=vp8',
      'video/webm; codecs=vp9',
      'video/webm; codecs=h264',
      'video/mp4; codecs=h264',
    ];
    return types.filter((type) => MediaRecorder.isTypeSupported(type));
  };

  return (
    <div
    >
      <video
        ref={mirrorVideoRef}
        playsInline
        autoPlay
        muted

      />

      <div>
        <button onClick={handleStartRecording} disabled={recording}>
          시작
        </button>
        <button onClick={handleStopRecording} disabled={!recording}>
          종료
        </button>
        <button
          onClick={handleDownload}
          disabled={recording || recordedBlobs.length === 0}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default InterviewCamera;
