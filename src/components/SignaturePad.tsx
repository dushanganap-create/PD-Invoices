import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Upload, Trash2, Check } from 'lucide-react';
import { SignatureData } from '../types/invoice';

interface SignaturePadProps {
  signature: SignatureData;
  onChange: (sig: SignatureData) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ signature, onChange }) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>(
    signature.type === 'draw' || signature.type === 'type' || signature.type === 'upload'
      ? signature.type
      : 'type'
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup drawing context
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';

        // If there's an existing drawn dataUrl, draw it
        if (signature.type === 'draw' && signature.dataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = signature.dataUrl;
        }
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange({
      ...signature,
      type: 'draw',
      dataUrl,
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({
      ...signature,
      dataUrl: undefined,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        onChange({
          ...signature,
          type: 'upload',
          dataUrl: loadEvent.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center gap-1 p-1 bg-neutral-800 rounded-lg text-xs font-medium text-neutral-300">
        <button
          type="button"
          onClick={() => {
            setActiveTab('type');
            onChange({ ...signature, type: 'type' });
          }}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'type' ? 'bg-neutral-700 text-white shadow-sm' : 'hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Type Name</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('draw');
            onChange({ ...signature, type: 'draw' });
          }}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'draw' ? 'bg-neutral-700 text-white shadow-sm' : 'hover:text-white'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Draw</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            onChange({ ...signature, type: 'upload' });
          }}
          className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'upload' ? 'bg-neutral-700 text-white shadow-sm' : 'hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Type Mode */}
      {activeTab === 'type' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Signatory Full Name</label>
            <input
              type="text"
              value={signature.typedName || ''}
              onChange={(e) =>
                onChange({
                  ...signature,
                  type: 'type',
                  typedName: e.target.value,
                })
              }
              placeholder="e.g. Marcus Vance"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {signature.typedName && (
            <div className="p-4 bg-white rounded-lg border border-neutral-200 text-center">
              <span className="font-playfair italic text-2xl text-neutral-900 tracking-wider">
                {signature.typedName}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Draw Mode */}
      {activeTab === 'draw' && (
        <div className="space-y-2">
          <div className="relative border border-neutral-600 rounded-lg bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={340}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-28 cursor-crosshair touch-none"
            />
            <button
              type="button"
              onClick={clearCanvas}
              title="Clear Signature"
              className="absolute top-2 right-2 p-1.5 bg-neutral-100 text-neutral-600 hover:text-red-600 rounded hover:bg-neutral-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">Sign directly above using your mouse or finger.</p>
        </div>
      )}

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <label className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-900/50">
            <Upload className="w-6 h-6 text-neutral-400 mb-1" />
            <span className="text-xs font-medium text-neutral-300">Click to upload signature image</span>
            <span className="text-[10px] text-neutral-500">PNG or transparent JPG</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          {signature.dataUrl && (
            <div className="p-2 bg-white rounded border border-neutral-200 flex items-center justify-center">
              <img src={signature.dataUrl} alt="Signature Preview" className="h-12 object-contain" />
            </div>
          )}
        </div>
      )}

      {/* Signatory Details */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800">
        <div>
          <label className="block text-[11px] text-neutral-400 mb-0.5">Signatory Title</label>
          <input
            type="text"
            value={signature.signatoryTitle || ''}
            onChange={(e) => onChange({ ...signature, signatoryTitle: e.target.value })}
            placeholder="Managing Director"
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[11px] text-neutral-400 mb-0.5">Signing Date</label>
          <input
            type="date"
            value={signature.date || ''}
            onChange={(e) => onChange({ ...signature, date: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
