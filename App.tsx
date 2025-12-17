import React, { useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { InputSection } from './components/InputSection';
import { ResultsTable } from './components/ResultsTable';
import { ProgressBar } from './components/ProgressBar';
import { parseCSV, exportToCSV } from './utils/csvHelper';
import { findCompanyDomain } from './services/geminiService';
import { CompanyEntry, Status, ProcessingStats } from './types';
import { Play, Download, Trash2, StopCircle, RefreshCw } from 'lucide-react';

// Number of concurrent requests
const BATCH_SIZE = 5;

const App: React.FC = () => {
  const [showContext, setShowContext] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [entries, setEntries] = useState<CompanyEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false); // To break the loop if needed

  // Derived stats
  const stats: ProcessingStats = {
    total: entries.length,
    completed: entries.filter(e => e.status === Status.COMPLETED).length,
    failed: entries.filter(e => e.status === Status.ERROR).length,
    pending: entries.filter(e => e.status === Status.IDLE).length,
    inProgress: entries.filter(e => e.status === Status.PROCESSING).length
  };

  const handleFileUpload = (content: string, name: string) => {
    const lines = parseCSV(content);
    const newEntries: CompanyEntry[] = lines.map((line, index) => ({
      id: `entry-${Date.now()}-${index}`,
      originalName: line,
      domain: null,
      sourceUrl: null,
      status: Status.IDLE
    }));
    setEntries(newEntries);
    setFileName(name);
  };

  const clearFile = () => {
    setEntries([]);
    setFileName(null);
  };

  const clearProcessed = () => {
    // Keep only IDLE or PROCESSING entries
    setEntries(prev => prev.filter(e => e.status === Status.IDLE || e.status === Status.PROCESSING));
  };

  const processBatch = async () => {
    if (!processingRef.current) return;

    // Find up to BATCH_SIZE idle entries
    // Note: We need to check current state. 
    // Since state updates are async, we rely on functional updates or a fresh query.
    // However, for recursion, we pass the data or query it.
    
    // We will update status to processing immediately, then execute.
    let batchIds: string[] = [];
    
    setEntries(currentEntries => {
      const idle = currentEntries.filter(e => e.status === Status.IDLE);
      const batch = idle.slice(0, BATCH_SIZE);
      batchIds = batch.map(b => b.id);
      
      if (batchIds.length === 0) {
        // No more items to process
        return currentEntries;
      }

      return currentEntries.map(entry => 
        batchIds.includes(entry.id) 
          ? { ...entry, status: Status.PROCESSING } 
          : entry
      );
    });

    if (batchIds.length === 0) {
      setIsProcessing(false);
      processingRef.current = false;
      return;
    }

    // Process the batch in parallel
    const currentBatchEntries = entries.filter(e => batchIds.includes(e.id)); 
    // NOTE: 'entries' inside this closure might be stale, but we only need names.
    // The safest way is to grab the names from the state update logic or just rely on the stable IDs.
    
    // Let's refetch the actual data objects for the names using a temporary lookup or just simple map since `entries` in closure isn't updated yet?
    // Actually, React state updates are batched. We need to be careful.
    // We can just use the previous `entries` state logic or pass the items.
    // To solve this cleanly: use a helper to get names by ID from the "latest" state? 
    // Or just filter from the `entries` available in the render scope IF we assume this function is re-created or `entries` is ref.
    
    // Better approach: Functional recursion.
    // But since we need the updated "Processing" status to show in UI, we did the setEntries above.
    // We need to wait for that render? No, we just need the data.
    
    // We'll reconstruct the items we just marked as processing.
    // We know which IDs we picked. We can find their names from the current `entries` scope (before the update applied visually, but the data is there).
    const itemsToProcess = entries
      .filter(e => e.status === Status.IDLE)
      .slice(0, BATCH_SIZE);

    if (itemsToProcess.length === 0) {
        setIsProcessing(false);
        processingRef.current = false;
        return;
    }

    try {
        await Promise.all(itemsToProcess.map(async (item) => {
            try {
                const result = await findCompanyDomain(item.originalName, showContext);
                
                setEntries(prev => prev.map(e => {
                    if (e.id === item.id) {
                        return {
                            ...e,
                            status: Status.COMPLETED,
                            domain: result.domain,
                            sourceUrl: result.sourceUrl
                        };
                    }
                    return e;
                }));
            } catch (err: any) {
                setEntries(prev => prev.map(e => {
                    if (e.id === item.id) {
                        return {
                            ...e,
                            status: Status.ERROR,
                            errorMsg: err.message || "Unknown error"
                        };
                    }
                    return e;
                }));
            }
        }));
    } catch (e) {
        console.error("Batch error", e);
    }

    // Recurse
    if (processingRef.current) {
        setTimeout(processBatch, 500); // Small delay to be gentle and allow UI updates
    }
  };

  const startProcessing = () => {
    if (!showContext || entries.length === 0) return;
    setIsProcessing(true);
    processingRef.current = true;
    processBatch();
  };

  const stopProcessing = () => {
    processingRef.current = false;
    setIsProcessing(false);
  };

  // Check if we can start
  const canStart = !isProcessing && fileName && showContext.trim().length > 0 && stats.pending > 0;
  const hasProcessedData = stats.completed > 0 || stats.failed > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Trade Show Domain Finder</h1>
                <p className="text-xs text-slate-500">AI-Powered Enrichment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Actions Area */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <InputSection 
          showContext={showContext}
          setShowContext={setShowContext}
          onFileUpload={handleFileUpload}
          fileName={fileName}
          clearFile={clearFile}
          isProcessing={isProcessing}
        />

        {entries.length > 0 && (
          <>
            <ProgressBar stats={stats} />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-3">
                 {!isProcessing ? (
                   <button
                    onClick={startProcessing}
                    disabled={!canStart}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all
                      ${canStart 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                   >
                     <Play className="w-4 h-4" />
                     <span>Start Finding Domains</span>
                   </button>
                 ) : (
                   <button
                    onClick={stopProcessing}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-lg font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all"
                   >
                     <StopCircle className="w-4 h-4" />
                     <span>Stop Processing</span>
                   </button>
                 )}
                 
                 {/* Helper text for auto-enable */}
                 {!isProcessing && stats.pending > 0 && canStart && (
                    <span className="text-sm text-green-600 font-medium animate-pulse">
                      Ready to start!
                    </span>
                 )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={clearProcessed}
                  disabled={!hasProcessedData || isProcessing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors
                    ${hasProcessedData && !isProcessing
                      ? 'border-red-200 text-red-600 hover:bg-red-50 bg-white'
                      : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Completed/Error</span>
                </button>

                <button
                  onClick={() => exportToCSV(entries)}
                  disabled={entries.length === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors
                    ${entries.length > 0 
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-50 bg-white' 
                      : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <ResultsTable data={entries} />
          </>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);
root.render(<App />);
