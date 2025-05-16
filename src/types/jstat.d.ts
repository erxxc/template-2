declare module 'jstat' {
    interface JStatStatic {
        // Normal distribution functions
        normal: {
            pdf: (x: number, mean: number, std: number) => number;
            cdf: (x: number, mean: number, std: number) => number;
        };
        
        // Statistical functions
        mean: (array: number[]) => number;
        stdev: (array: number[]) => number;
        variance: (array: number[]) => number;
        
        // Cumulative distribution functions
        studentt: {
            cdf: (x: number, df: number) => number;
        };
    }

    const jStat: JStatStatic;
    export default jStat;
} 