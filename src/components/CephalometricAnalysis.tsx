import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Sparkles, AlertCircle, Target } from 'lucide-react';

const CephalometricAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    alert("AI Analysis complete! Landmarks detected.");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-headline text-slate-900">Cephalometric Analysis</h2>
        {image && (
          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        )}
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center cursor-pointer hover:border-teal-500 transition-colors bg-slate-50"
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Upload Cephalometric X-Ray</h3>
          <p className="text-slate-500 mt-2">Click to upload or drag and drop</p>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
          <img src={image} alt="Cephalometric X-Ray" className="w-full h-auto" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-6 h-6 text-slate-900" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CephalometricAnalysis;
