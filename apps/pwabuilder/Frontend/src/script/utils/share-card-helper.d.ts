export declare function draw(canvas: HTMLCanvasElement, manifestData: String, swrData: String, securityData: String, siteName: String): Promise<void>;
export declare function drawRingPart(ctx: CanvasRenderingContext2D, lineWidth: number, trackColor: string, x: number, y: number, radius: number, start: number, end: number, clockwise: boolean, fillColor: string): void;
export declare function drawExclamation(ctx: CanvasRenderingContext2D, x: number): Promise<void>;
export declare function writeText(ctx: CanvasRenderingContext2D, x: number, percent: string, header: string): void;
