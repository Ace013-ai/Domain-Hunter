import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface InputSectionProps {
  showContext: string;
  setShowContext: (val: string) => void;
  onFileUpload: (fileContent: string, fileName: string) => void;
  fileName: string | null;
  clearFile: () => void;
  isProcessing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  showContext,
  setShowContext,
  onFileUpload,
  fileName,
  clearFile,
  isProcessing
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload(content, file.name);
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 space-y-6">
      
      {/* Show Context Input */}
      <div>
        <label htmlFor="context" className="block text-sm font-semibold text-slate-700 mb-2">
          Show Name or URL Link <span className="text-red-500">*</span>
        </label>
        <input
          id="context"
          type="text"
          value={showContext}
          onChange={(e) => setShowContext(e.target.value)}
          placeholder="e.g. CES 2024, https://example-expo.com"
          disabled={isProcessing}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100 disabled:text-slate-500 outline-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          This provides context to the AI to ensure the correct company website is found.
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Company List (TXT or CSV) <span className="text-red-500">*</span>
        </label>
        
        {!fileName ? (
          <div 
            onClick={!isProcessing ? triggerFileUpload : undefined}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
              ${isProcessing ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
          >
            <Upload className={`w-10 h-10 mb-3 ${isProcessing ? 'text-slate-300' : 'text-blue-500'}`} />
            <p className="text-sm text-slate-600 font-medium">Click to upload company list</p>
            <p className="text-xs text-slate-400 mt-1">Supported formats: .txt, .csv (one name per line)</p>
            <input 
              type="file" 
              accept=".txt,.csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              disabled={isProcessing}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{fileName}</p>
                <p className="text-xs text-blue-600">Ready to process</p>
              </div>
            </div>
            {!isProcessing && (
              <button 
                onClick={clearFile}
                className="p-2 hover:bg-blue-100 rounded-full text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
