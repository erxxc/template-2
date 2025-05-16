import { useEffect, useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Portfolio, Option, OptionGreeks } from '@/types/option';
import { calculateOptionMetrics } from '@/lib/utils/blackScholes';
import GreekExplanation from './GreekExplanation';
import { ErrorBoundary } from './ErrorBoundary';

// Dynamically import Plotly with no SSR and proper error handling
const Plot = dynamic(
  () => import('react-plotly.js').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-white rounded-lg shadow-lg p-4 flex items-center justify-center">
        <div className="text-gray-500">Loading visualization...</div>
      </div>
    )
  }
);

interface GreeksSurfaceViewerProps {
  portfolio: Portfolio;
  selectedGreek: keyof OptionGreeks;
}

interface SurfaceData {
  x: number[];  // Strike prices
  y: number[];  // Time to expiry
  z: number[][]; // Greek values
}

interface ViewSettings {
  viewMode: 'surface' | 'contour' | 'heatmap';
  showCrossSections: boolean;
  animate: boolean;
  showAnnotations: boolean;
}

export default function GreeksSurfaceViewer({ portfolio, selectedGreek }: GreeksSurfaceViewerProps) {
  const [surfaceData, setSurfaceData] = useState<SurfaceData | null>(null);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    viewMode: 'surface',
    showCrossSections: false,
    animate: false,
    showAnnotations: false,
  });
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0);

  // Generate a range of values for strike prices and time to expiry
  const generateSurfacePoints = useMemo(() => {
    const baseOption = portfolio.options[0];
    if (!baseOption) return null;

    // Generate strike price range (±30% around current spot price)
    const spotPrice = baseOption.spotPrice;
    const minStrike = spotPrice * 0.7;
    const maxStrike = spotPrice * 1.3;
    const strikePoints = 40; // Increased resolution
    const strikes = Array.from({ length: strikePoints }, (_, i) => 
      minStrike + (maxStrike - minStrike) * (i / (strikePoints - 1))
    );

    // Generate time to expiry range (0.1 to 2 years)
    const timePoints = 40; // Increased resolution
    const times = Array.from({ length: timePoints }, (_, i) => 
      0.1 + (2 - 0.1) * (i / (timePoints - 1))
    );

    return { strikes, times };
  }, [portfolio]);

  // Calculate surface data
  useEffect(() => {
    if (!generateSurfacePoints) return;
    const { strikes, times } = generateSurfacePoints;

    // Calculate Greeks for each point on the surface
    const zValues = times.map(t => 
      strikes.map(k => {
        const testOption: Option = {
          ...portfolio.options[0],
          strikePrice: k,
          timeToExpiry: t
        };
        const metrics = calculateOptionMetrics(testOption);
        return metrics.greeks[selectedGreek];
      })
    );

    setSurfaceData({
      x: strikes,
      y: times,
      z: zValues
    });
  }, [portfolio, selectedGreek, generateSurfacePoints]);

  // Animation effect
  useEffect(() => {
    let animationFrame: number;
    if (viewSettings.animate && surfaceData) {
      const animate = () => {
        setSelectedTimeIndex(prev => (prev + 1) % surfaceData.y.length);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [viewSettings.animate, surfaceData]);

  // Calculate surface statistics
  const surfaceStats = useMemo(() => {
    if (!surfaceData) return null;
    
    const allValues = surfaceData.z.flat();
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const variance = allValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / allValues.length;
    const std = Math.sqrt(variance);

    return { min, max, avg, std };
  }, [surfaceData]);

  if (!surfaceData) return <div>Loading surface data...</div>;

  // Prepare plot data based on view settings
  const plotData: any[] = [];

  // Main surface or heatmap
  if (viewSettings.viewMode === 'surface') {
    plotData.push({
      type: 'surface',
      x: surfaceData.x,
      y: surfaceData.y,
      z: surfaceData.z,
      colorscale: 'Viridis',
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f462",
          project: { z: true }
        }
      },
      hoverongaps: false,
      hoverlabel: {
        bgcolor: 'white',
        font: { family: 'monospace' }
      },
      hovertemplate: 
        'Strike: $%{x:.2f}<br>' +
        'Time: %{y:.2f}y<br>' +
        `${selectedGreek}: %{z:.4f}<br>` +
        '<extra></extra>'
    });
  } else if (viewSettings.viewMode === 'contour') {
    plotData.push({
      type: 'contour',
      x: surfaceData.x,
      y: surfaceData.y,
      z: surfaceData.z,
      colorscale: 'Viridis',
      contours: {
        coloring: 'heatmap',
        showlabels: true,
      },
      hoverongaps: false,
    });
  } else {
    plotData.push({
      type: 'heatmap',
      x: surfaceData.x,
      y: surfaceData.y,
      z: surfaceData.z,
      colorscale: 'Viridis',
      hoverongaps: false,
    });
  }

  // Add cross sections if enabled
  if (viewSettings.showCrossSections) {
    // Time slice
    plotData.push({
      type: 'scatter3d',
      x: surfaceData.x,
      y: Array(surfaceData.x.length).fill(surfaceData.y[selectedTimeIndex]),
      z: surfaceData.z[selectedTimeIndex],
      mode: 'lines',
      line: { color: 'red', width: 5 },
      name: `Time Slice (t=${surfaceData.y[selectedTimeIndex].toFixed(2)})`
    });
  }

  // Add annotations if enabled
  const annotations = viewSettings.showAnnotations ? [
    {
      x: surfaceData.x[Math.floor(surfaceData.x.length / 2)],
      y: surfaceData.y[Math.floor(surfaceData.y.length / 2)],
      z: Math.max(...surfaceData.z.flat()) * 1.1,
      text: `${selectedGreek} Surface`,
      showarrow: false,
      font: { size: 16 }
    }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-4 mb-4">
            <select 
              className="px-3 py-2 border rounded-md"
              value={viewSettings.viewMode}
              onChange={(e) => setViewSettings(prev => ({ 
                ...prev, 
                viewMode: e.target.value as ViewSettings['viewMode'] 
              }))}
            >
              <option value="surface">3D Surface</option>
              <option value="contour">Contour Map</option>
              <option value="heatmap">Heat Map</option>
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={viewSettings.showCrossSections}
                onChange={(e) => setViewSettings(prev => ({ 
                  ...prev, 
                  showCrossSections: e.target.checked 
                }))}
              />
              Show Cross Sections
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={viewSettings.animate}
                onChange={(e) => setViewSettings(prev => ({ 
                  ...prev, 
                  animate: e.target.checked 
                }))}
              />
              Animate Time Evolution
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={viewSettings.showAnnotations}
                onChange={(e) => setViewSettings(prev => ({ 
                  ...prev, 
                  showAnnotations: e.target.checked 
                }))}
              />
              Show Annotations
            </label>
          </div>

          <ErrorBoundary>
            <div className="w-full h-[600px] bg-white rounded-lg shadow-lg p-4">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-500">Loading visualization...</div>
                </div>
              }>
                <Plot
                  data={plotData}
                  layout={{
                    title: `${selectedGreek} Surface Analysis`,
                    scene: {
                      xaxis: { 
                        title: 'Strike Price ($)',
                        tickprefix: '$'
                      },
                      yaxis: { 
                        title: 'Time to Expiry (Years)',
                        ticksuffix: 'y'
                      },
                      zaxis: { 
                        title: selectedGreek,
                        tickformat: '.4f'
                      },
                      camera: {
                        eye: { x: 1.5, y: 1.5, z: 1.5 }
                      },
                      annotations: annotations
                    },
                    margin: { l: 0, r: 0, t: 30, b: 0 },
                    autosize: true,
                    showlegend: viewSettings.showCrossSections,
                  }}
                  useResizeHandler={true}
                  style={{ width: '100%', height: '100%' }}
                  config={{
                    displayModeBar: true,
                    scrollZoom: true,
                    toImageButtonOptions: {
                      format: 'png',
                      filename: `${selectedGreek}_surface`,
                      height: 1200,
                      width: 1600,
                      scale: 2
                    }
                  }}
                />
              </Suspense>
            </div>
          </ErrorBoundary>
        </div>

        <div className="lg:col-span-1">
          <GreekExplanation 
            selectedGreek={selectedGreek}
            surfaceStats={surfaceStats || undefined}
          />
        </div>
      </div>
    </div>
  );
} 