import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface VolSurfaceData {
  strikes: number[];
  maturities: number[];
  volatilities: number[][];
}

interface VolatilitySurfaceProps {
  onVolatilityUpdate: (interpolator: (strike: number, maturity: number) => number) => void;
}

export default function VolatilitySurface({ onVolatilityUpdate }: VolatilitySurfaceProps) {
  const [surfaceData, setSurfaceData] = useState<VolSurfaceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bilinear interpolation function
  const interpolateVol = (strike: number, maturity: number, data: VolSurfaceData): number => {
    const { strikes, maturities, volatilities } = data;
    
    // Find nearest strike indices
    let i1 = 0;
    while (i1 < strikes.length - 1 && strikes[i1 + 1] <= strike) i1++;
    const i2 = Math.min(i1 + 1, strikes.length - 1);
    
    // Find nearest maturity indices
    let j1 = 0;
    while (j1 < maturities.length - 1 && maturities[j1 + 1] <= maturity) j1++;
    const j2 = Math.min(j1 + 1, maturities.length - 1);
    
    // Calculate weights
    const x = (strike - strikes[i1]) / (strikes[i2] - strikes[i1] || 1);
    const y = (maturity - maturities[j1]) / (maturities[j2] - maturities[j1] || 1);
    
    // Perform bilinear interpolation
    const v11 = volatilities[j1][i1];
    const v12 = volatilities[j1][i2];
    const v21 = volatilities[j2][i1];
    const v22 = volatilities[j2][i2];
    
    const interpolated = 
      v11 * (1 - x) * (1 - y) +
      v12 * x * (1 - y) +
      v21 * (1 - x) * y +
      v22 * x * y;
    
    return interpolated;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, dynamicTyping: true });
      
      if (result.errors.length > 0) {
        throw new Error('Failed to parse CSV file');
      }

      // Extract unique strikes and maturities
      const data = result.data as Array<{ strike: number; maturity: number; volatility: number }>;
      const strikes = [...new Set(data.map(row => row.strike))].sort((a, b) => a - b);
      const maturities = [...new Set(data.map(row => row.maturity))].sort((a, b) => a - b);
      
      // Create volatility matrix
      const volatilities = maturities.map(mat => 
        strikes.map(strike => {
          const point = data.find(d => d.strike === strike && d.maturity === mat);
          return point ? point.volatility : 0;
        })
      );

      const surfaceData = { strikes, maturities, volatilities };
      setSurfaceData(surfaceData);
      
      // Create and pass the interpolator function
      const interpolator = (strike: number, maturity: number) => 
        interpolateVol(strike, maturity, surfaceData);
      
      onVolatilityUpdate(interpolator);
      setError(null);
    } catch (err) {
      setError('Error processing volatility surface data. Please check the file format.');
      console.error(err);
    }
  }, [onVolatilityUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const generateSampleCSV = () => {
    const strikes = [80, 90, 100, 110, 120];
    const maturities = [0.25, 0.5, 1, 2];
    const rows = ['strike,maturity,volatility'];
    
    strikes.forEach(strike => {
      maturities.forEach(maturity => {
        // Generate sample volatility with smile effect
        const moneyness = Math.log(100 / strike);
        const vol = 0.2 + 0.05 * moneyness * moneyness + 0.02 * maturity;
        rows.push(`${strike},${maturity},${vol.toFixed(4)}`);
      });
    });

    const content = rows.join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_volatility_surface.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div>
          <p className="text-lg mb-2">
            {isDragActive
              ? 'Drop the volatility surface file here...'
              : 'Drag and drop a volatility surface CSV file, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            Format: CSV with columns for strike, maturity, and volatility
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={generateSampleCSV}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
      >
        Download Sample CSV
      </button>

      {surfaceData && (
        <div className="h-[400px] mt-6">
          <Plot
            data={[{
              type: 'surface',
              x: surfaceData.strikes,
              y: surfaceData.maturities,
              z: surfaceData.volatilities,
              colorscale: 'Viridis',
              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  highlightcolor: "#42f462",
                  project: { z: true }
                }
              }
            }]}
            layout={{
              title: 'Volatility Surface',
              scene: {
                xaxis: { title: 'Strike' },
                yaxis: { title: 'Maturity' },
                zaxis: { title: 'Volatility' },
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
              },
              margin: { l: 0, r: 0, t: 30, b: 0 },
              autosize: true
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  );
} 