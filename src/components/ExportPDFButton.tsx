import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import { Portfolio, OptionGreeks } from '@/types/option';

interface ExportPDFButtonProps {
  portfolio: Portfolio;
  selectedGreek?: keyof OptionGreeks;
  surfaceStats?: {
    min: number;
    max: number;
    avg: number;
    std: number;
  };
  pnlAttribution?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
    unexplained: number;
    total: number;
  };
  stressTestResults?: {
    spotPriceChange: number;
    volatilityChange: number;
    rateChange: number;
    stressedPortfolio: Portfolio;
  };
  volSurfaceInfo?: {
    minStrike: number;
    maxStrike: number;
    minMaturity: number;
    maxMaturity: number;
    avgVol: number;
  };
}

export default function ExportPDFButton({ 
  portfolio, 
  selectedGreek,
  surfaceStats,
  pnlAttribution,
  stressTestResults,
  volSurfaceInfo 
}: ExportPDFButtonProps) {
  const [showPDF, setShowPDF] = useState(false);

  // Function to handle download
  const handleDownload = () => {
    setShowPDF(true);
  };

  // Function to close the PDF viewer
  const handleClose = () => {
    setShowPDF(false);
  };

  return (
    <>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        title="Generate detailed PDF report"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
            clipRule="evenodd"
          />
        </svg>
        Export PDF Report
      </button>

      {showPDF && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
        >
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 
                id="pdf-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                Portfolio Risk Analysis Report
                {selectedGreek && ` - ${selectedGreek.toUpperCase()} Analysis`}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Use browser's print function (Ctrl/Cmd + P) to save as PDF
                </span>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close PDF viewer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 w-full h-full min-h-0">
              <PDFViewer 
                style={{ width: '100%', height: '100%' }}
                showToolbar={true}
              >
                <PDFReport 
                  portfolio={portfolio}
                  selectedGreek={selectedGreek}
                  surfaceStats={surfaceStats}
                  pnlAttribution={pnlAttribution}
                  stressTestResults={stressTestResults}
                  volSurfaceInfo={volSurfaceInfo}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 