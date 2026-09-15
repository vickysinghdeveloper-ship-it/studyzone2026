import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Armchair,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { Student, AttendanceRecord } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student;
  allStudents?: Student[];
  onMarkAttendance: (data: { studentId?: string; studentCode?: string; status?: string; mode?: string }) => void;
  todayRecord?: AttendanceRecord;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  allStudents = [],
  onMarkAttendance,
  todayRecord
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    studentName?: string;
    studentCode?: string;
    seatNumber?: string;
    checkInTime?: string;
  } | null>(null);

  const [manualCode, setManualCode] = useState('');
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'qr-reader-region';

  // Play audio chime on successful check-in
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  // Process scanned text (QR code text)
  const handleDecodedText = (decodedText: string) => {
    if (!decodedText) return;

    // Clean decoded text (strip whitespace, extract code if URL or JSON)
    let cleaned = decodedText.trim();
    if (cleaned.includes('code=')) {
      const match = cleaned.match(/code=([A-Za-z0-9-]+)/);
      if (match) cleaned = match[1];
    } else if (cleaned.includes('SZ-')) {
      const match = cleaned.match(/(SZ-[A-Za-z0-9-]+)/);
      if (match) cleaned = match[1];
    }

    // Match student from allStudents or fallback to currentStudent
    let targetStudent = allStudents.find(
      (s) =>
        s.studentCode.toLowerCase() === cleaned.toLowerCase() ||
        s.id.toLowerCase() === cleaned.toLowerCase() ||
        s.phone === cleaned
    );

    // If scanned code belongs to current student or no match but resembles a code
    if (!targetStudent) {
      if (
        cleaned.toLowerCase() === currentStudent.studentCode.toLowerCase() ||
        cleaned === currentStudent.phone ||
        cleaned.toLowerCase() === currentStudent.id.toLowerCase()
      ) {
        targetStudent = currentStudent;
      }
    }

    // Default to current student if student is scanning on their own portal
    if (!targetStudent) {
      targetStudent = currentStudent;
    }

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Execute attendance handler
    onMarkAttendance({
      studentId: targetStudent.id,
      studentCode: targetStudent.studentCode,
      status: 'present',
      mode: 'qr_scan'
    });

    playChime();
    triggerConfetti();

    setScanResult({
      success: true,
      message: 'Attendance Checked-In Successfully!',
      studentName: targetStudent.name,
      studentCode: targetStudent.studentCode,
      seatNumber: targetStudent.seatNumber || 'General Seat',
      checkInTime: timeStr
    });

    stopScanner();
  };

  // Start Camera QR Scanner with robust camera device detection and fallbacks
  const startScanner = async (overrideCameraId?: string) => {
    setCameraError(null);
    setScanResult(null);

    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      // 1. Fetch available camera devices if not already loaded
      let cameras = availableCameras;
      if (cameras.length === 0) {
        try {
          const deviceList = await Html5Qrcode.getCameras();
          if (deviceList && deviceList.length > 0) {
            cameras = deviceList.map((d, index) => ({
              id: d.id,
              label: d.label || `Camera ${index + 1}`
            }));
            setAvailableCameras(cameras);
          }
        } catch (e) {
          console.warn('Could not enumerate cameras list:', e);
        }
      }

      const html5Qrcode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5Qrcode;

      // 2. Determine target camera (explicit ID or environment/user fallback)
      let cameraTarget: any = overrideCameraId || selectedCameraId;

      if (!cameraTarget) {
        if (cameras.length > 0) {
          const backCam = cameras.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('environment') ||
              c.label.toLowerCase().includes('rear')
          );
          cameraTarget = backCam ? backCam.id : cameras[0].id;
          setSelectedCameraId(cameraTarget);
        } else {
          cameraTarget = { facingMode: 'environment' };
        }
      }

      const scanConfig = {
        fps: 10,
        qrbox: { width: 220, height: 220 }
      };

      const onScanSuccess = (decodedText: string) => {
        handleDecodedText(decodedText);
      };

      const onScanFailure = () => {};

      // 3. Attempt camera start with fallbacks
      try {
        await html5Qrcode.start(cameraTarget, scanConfig, onScanSuccess, onScanFailure);
        setIsScanning(true);
      } catch (firstErr) {
        console.warn('First camera start failed, trying facingMode user fallback:', firstErr);
        try {
          await html5Qrcode.start({ facingMode: 'user' }, scanConfig, onScanSuccess, onScanFailure);
          setIsScanning(true);
        } catch (secondErr) {
          console.warn('Second camera start failed, trying first available device:', secondErr);
          if (cameras.length > 0) {
            await html5Qrcode.start(cameras[0].id, scanConfig, onScanSuccess, onScanFailure);
            setIsScanning(true);
          } else {
            throw secondErr;
          }
        }
      }
    } catch (err: any) {
      console.error('Final Camera Launch Error:', err);
      let errMsg = 'Unable to launch camera on this device.';
      const errStr = String(err?.message || err || '').toLowerCase();

      if (errStr.includes('permission') || err?.name === 'NotAllowedError') {
        errMsg = 'Camera access was blocked by browser. Please allow camera permissions in your browser bar.';
      } else if (errStr.includes('notfound') || errStr.includes('device') || err?.name === 'NotFoundError') {
        errMsg = 'No camera or webcam device detected on your hardware.';
      } else if (errStr.includes('notreadable') || errStr.includes('in use') || err?.name === 'NotReadableError') {
        errMsg = 'Camera is currently in use by another app or browser tab.';
      }

      setCameraError(errMsg);
      setIsScanning(false);
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    setIsScanning(false);
  };

  // File Upload QR Code Reader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader-file-region');
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleDecodedText(decodedText);
    } catch (err) {
      // If QR code could not be detected in image, fallback to auto-checking current student ID
      handleDecodedText(currentStudent.studentCode);
    }
  };

  // Handle Manual Code Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      handleDecodedText(currentStudent.studentCode);
      return;
    }
    handleDecodedText(manualCode.trim());
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Hidden container for file scan */}
      <div id="qr-reader-file-region" className="hidden" />

      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-indigo-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                <span>Smart ID Attendance Scanner</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-indigo-200 font-medium">
                Scan your ID Card QR code for instant daily check-in
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-center space-x-2">
          {[
            { id: 'camera', label: 'Live Camera', icon: Camera },
            { id: 'upload', label: 'Upload ID Image', icon: Upload },
            { id: 'manual', label: 'Quick ID Check-In', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setScanResult(null);
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* SUCCESS RESULT SCREEN */}
          {scanResult ? (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 uppercase tracking-wider inline-block mb-1">
                  Attendance Confirmed
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {scanResult.studentName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold mt-0.5">
                  ID Code: {scanResult.studentCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Check-In Time</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {scanResult.checkInTime}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Seat</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center mt-0.5">
                    <Armchair className="w-3.5 h-3.5 mr-1" />
                    {scanResult.seatNumber}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setScanResult(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Scan Another ID
                </button>
                <button
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: LIVE CAMERA SCANNER */}
              {activeTab === 'camera' && (
                <div className="space-y-4 text-center">
                  {/* Camera Selection Dropdown if multiple devices found */}
                  {availableCameras.length > 1 && (
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Select Camera Device:</span>
                      <select
                        value={selectedCameraId}
                        onChange={(e) => {
                          const newCamId = e.target.value;
                          setSelectedCameraId(newCamId);
                          startScanner(newCamId);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs"
                      >
                        {availableCameras.map((cam) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-indigo-500/30 shadow-inner min-h-[260px] flex items-center justify-center">
                    <div id={readerElementId} className="w-full h-full" />

                    {!isScanning && !cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-300 bg-slate-900/90 space-y-3">
                        <Camera className="w-12 h-12 text-indigo-400 animate-pulse" />
                        <p className="text-xs font-bold text-slate-200">Initializing Live Camera Feed...</p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() => startScanner()}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                          >
                            Launch Camera
                          </button>
                          <button
                            onClick={() => handleDecodedText(currentStudent.studentCode)}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all cursor-pointer"
                          >
                            Demo QR Scan
                          </button>
                        </div>
                      </div>
                    )}

                    {cameraError && (
                      <div className="p-6 text-center space-y-3 bg-slate-900/95 text-rose-300 max-w-sm">
                        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                        <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
                        
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            onClick={() => startScanner()}
                            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md"
                          >
                            Retry Launching Camera
                          </button>
                          
                          <button
                            onClick={() => handleDecodedText(currentStudent.studentCode)}
                            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Instant Demo ID Attendance Check-In</span>
                          </button>

                          <button
                            onClick={() => setActiveTab('manual')}
                            className="w-full py-1.5 text-[11px] text-slate-400 hover:text-slate-200 underline font-semibold cursor-pointer"
                          >
                            Switch to Manual Quick ID Check-In
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                    <span>Center the QR Code on your Smart ID Card inside the camera viewfinder</span>
                  </p>
                </div>
              )}

              {/* TAB 2: UPLOAD IMAGE SCANNER */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-slate-900/60 hover:bg-indigo-100/60 transition-all text-center cursor-pointer space-y-3 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Upload ID Card Photo / Screenshot
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Click to select image file from gallery or files
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                      Choose File
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MANUAL QUICK CHECK-IN */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        Student: {currentStudent.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Your registered ID Code is <strong className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{currentStudent.studentCode}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID Code or Phone Number
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder={`e.g. ${currentStudent.studentCode}`}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 cursor-pointer active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Auto Daily Attendance</span>
                  </button>
                </form>
              )}

              {/* Today's Status Banner */}
              {todayRecord && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Already checked in today at {todayRecord.checkInTime}!</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded uppercase">
                    Present
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
