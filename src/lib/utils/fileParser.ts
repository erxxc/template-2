import { Option } from '@/types/option';
import Papa from 'papaparse';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateOption(option: Partial<Option>): option is Option {
  const requiredFields: (keyof Option)[] = [
    'ticker',
    'type',
    'spotPrice',
    'strikePrice',
    'timeToExpiry',
    'volatility',
    'riskFreeRate',
    'quantity'
  ];

  for (const field of requiredFields) {
    if (option[field] === undefined) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (option.type !== 'Call' && option.type !== 'Put') {
    throw new ValidationError('Option type must be either "Call" or "Put"');
  }

  const numericFields: (keyof Option)[] = [
    'spotPrice',
    'strikePrice',
    'timeToExpiry',
    'volatility',
    'riskFreeRate',
    'quantity'
  ];

  for (const field of numericFields) {
    const value = option[field] as number;
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      throw new ValidationError(`${field} must be a positive number`);
    }
  }

  return true;
}

export async function parseCSV(file: File): Promise<Option[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const options = results.data
            .filter((row: any) => Object.keys(row).length > 0) // Filter out empty rows
            .map((row: any) => {
              const option: Partial<Option> = {
                ticker: row.ticker,
                type: row.type,
                spotPrice: row.spotPrice,
                strikePrice: row.strikePrice,
                timeToExpiry: row.timeToExpiry,
                volatility: row.volatility,
                riskFreeRate: row.riskFreeRate,
                quantity: row.quantity
              };

              if (validateOption(option)) {
                return option;
              }
              return null;
            });

          resolve(options.filter((opt): opt is Option => opt !== null));
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function parseJSON(file: File): Promise<Option[]> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!Array.isArray(data)) {
      throw new ValidationError('JSON must contain an array of options');
    }

    const options = data
      .filter((item: any) => Object.keys(item).length > 0) // Filter out empty objects
      .map((item: any) => {
        const option: Partial<Option> = {
          ticker: item.ticker,
          type: item.type,
          spotPrice: item.spotPrice,
          strikePrice: item.strikePrice,
          timeToExpiry: item.timeToExpiry,
          volatility: item.volatility,
          riskFreeRate: item.riskFreeRate,
          quantity: item.quantity
        };

        if (validateOption(option)) {
          return option;
        }
        return null;
      });

    return options.filter((opt): opt is Option => opt !== null);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error(`JSON parsing error: ${error.message}`);
  }
}

export function generateSampleCSV(): string {
  const headers = [
    'ticker',
    'type',
    'spotPrice',
    'strikePrice',
    'timeToExpiry',
    'volatility',
    'riskFreeRate',
    'quantity'
  ].join(',');

  const sampleData = [
    'AAPL,Call,150,155,0.5,0.3,0.05,10',
    'AAPL,Put,150,145,0.25,0.35,0.05,5',
    'GOOGL,Call,2800,2850,0.75,0.25,0.05,3',
    'GOOGL,Put,2800,2750,0.5,0.28,0.05,4',
    'MSFT,Call,310,315,0.3,0.22,0.05,8',
    'MSFT,Put,310,305,0.6,0.24,0.05,6',
    'TSLA,Call,220,225,0.4,0.45,0.05,5',
    'TSLA,Put,220,215,0.35,0.42,0.05,7',
    'NVDA,Call,480,490,0.45,0.38,0.05,4',
    'NVDA,Put,480,470,0.55,0.36,0.05,3'
  ];

  return [headers, ...sampleData].join('\n');
}

export function generateSampleJSON(): string {
  const sampleData = [
    {
      ticker: 'AAPL',
      type: 'Call',
      spotPrice: 150,
      strikePrice: 155,
      timeToExpiry: 0.5,
      volatility: 0.3,
      riskFreeRate: 0.05,
      quantity: 10
    },
    {
      ticker: 'AAPL',
      type: 'Put',
      spotPrice: 150,
      strikePrice: 145,
      timeToExpiry: 0.25,
      volatility: 0.35,
      riskFreeRate: 0.05,
      quantity: 5
    },
    {
      ticker: 'GOOGL',
      type: 'Call',
      spotPrice: 2800,
      strikePrice: 2850,
      timeToExpiry: 0.75,
      volatility: 0.25,
      riskFreeRate: 0.05,
      quantity: 3
    },
    {
      ticker: 'GOOGL',
      type: 'Put',
      spotPrice: 2800,
      strikePrice: 2750,
      timeToExpiry: 0.5,
      volatility: 0.28,
      riskFreeRate: 0.05,
      quantity: 4
    },
    {
      ticker: 'MSFT',
      type: 'Call',
      spotPrice: 310,
      strikePrice: 315,
      timeToExpiry: 0.3,
      volatility: 0.22,
      riskFreeRate: 0.05,
      quantity: 8
    },
    {
      ticker: 'MSFT',
      type: 'Put',
      spotPrice: 310,
      strikePrice: 305,
      timeToExpiry: 0.6,
      volatility: 0.24,
      riskFreeRate: 0.05,
      quantity: 6
    },
    {
      ticker: 'TSLA',
      type: 'Call',
      spotPrice: 220,
      strikePrice: 225,
      timeToExpiry: 0.4,
      volatility: 0.45,
      riskFreeRate: 0.05,
      quantity: 5
    },
    {
      ticker: 'TSLA',
      type: 'Put',
      spotPrice: 220,
      strikePrice: 215,
      timeToExpiry: 0.35,
      volatility: 0.42,
      riskFreeRate: 0.05,
      quantity: 7
    },
    {
      ticker: 'NVDA',
      type: 'Call',
      spotPrice: 480,
      strikePrice: 490,
      timeToExpiry: 0.45,
      volatility: 0.38,
      riskFreeRate: 0.05,
      quantity: 4
    },
    {
      ticker: 'NVDA',
      type: 'Put',
      spotPrice: 480,
      strikePrice: 470,
      timeToExpiry: 0.55,
      volatility: 0.36,
      riskFreeRate: 0.05,
      quantity: 3
    }
  ];

  return JSON.stringify(sampleData, null, 2);
} 