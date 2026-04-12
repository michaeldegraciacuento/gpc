import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';


interface Member {
  id: number;
  member_id: string;
}

interface QRScannerProps {
  onScan: (memberId: string) => void;
  onClose: () => void;
  members: Member[];
}

import { validateMemberId } from '@/utils/validateMemberId';

export default function QRScanner({ onScan, onClose, members }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
        // Dynamically import jsQR for QR code scanning
        const jsQR = (await import('jsqr')).default;
        const scan = () => {
          if (!active || !videoRef.current) return;
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code && code.data) {
              // Validate scanned QR
              const validId = validateMemberId(code.data, members);
              if (validId) {
                onScan(validId);
                onClose();
                return;
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Invalid QR',
                  text: 'The scanned QR is not a valid member.',
                  confirmButtonText: 'OK',
                });
                onClose();
                return;
              }
            }
          }
          requestAnimationFrame(scan);
        };
        scan();
      }
    })();
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScan, onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, position: 'relative', width: 320, maxWidth: '90vw' }}>
        <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 14 }}>Scan Member QR Code</div>
      </div>
    </div>
  );
}
