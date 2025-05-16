import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCSV, parseJSON, generateSampleCSV, generateSampleJSON } from '@/lib/utils/fileParser';
import { Option } from '@/types/option';

interface FileUploadProps {
  onPortfolioLoad: (options: Option[]) => void;
}

export default function FileUpload({ onPortfolioLoad }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setLoading(true);
    setError(null);

    try {
      let options: Option[];
      if (file.name.endsWith('.csv')) {
        options = await parseCSV(file);
      } else if (file.name.endsWith('.json')) {
        options = await parseJSON(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or JSON file.');
      }

      onPortfolioLoad(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while parsing the file.');
    } finally {
      setLoading(false);
    }
  }, [onPortfolioLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const downloadSample = (format: 'csv' | 'json') => {
    const content = format === 'csv' ? generateSampleCSV() : generateSampleJSON();
    const type = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `sample-portfolio.${format}`;

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="text-gray-600">Processing file...</div>
        ) : (
          <div>
            <p className="text-lg mb-2">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag and drop a portfolio file, or click to select'}
            </p>
            <p className="text-sm text-gray-500">Supports CSV and JSON formats</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => downloadSample('csv')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
        >
          Download Sample CSV
        </button>
        <button
          onClick={() => downloadSample('json')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
        >
          Download Sample JSON
        </button>
      </div>
    </div>
  );
} 