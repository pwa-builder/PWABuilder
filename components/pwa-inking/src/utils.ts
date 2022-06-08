// helper methods for inking canvas and toolbar

export function getLowLatencyContext(canvas: HTMLCanvasElement, canvasName: string) {

    let context = (canvas.getContext('2d', {
        desynchronized: true
    }) as CanvasRenderingContext2D);

    // check for low-latency
    if ("getContextAttributes" in context && (context as any).getContextAttributes().desynchronized) {
        console.log("Low latency is supported for " + canvasName + " canvas");
    } else {
        console.log("Low latency is NOT supported for " + canvasName + " canvas");
    }

    return context;
}

export function runAsynchronously(func: Function) {
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback( () => {
            func();
        }); 
    } else {
        (async () => { 
            func();
        })()
    }
}

export function drawPencilStroke(context: CanvasRenderingContext2D, previousX: number, currentX: number, previousY: number, currentY: number) {
    
    // record context properties before modifying
    let strokeColor = context.strokeStyle;
    let strokeLayer = context.globalCompositeOperation;
    let strokeWidth = context.lineWidth;
    let opacity = context.globalAlpha;

    // make sure the smallest pencil strokes don't appear obviously bigger than other strokes of the same size
    if (strokeWidth < 4) {
        context.strokeStyle = context.fillStyle;
        context.stroke();
        return;
    }

    // use the distance formula to calcuate the line length between the two points on the canvas
    let distance  = Math.round(Math.sqrt(Math.pow(currentX - previousX, 2)+Math.pow(currentY - previousY, 2)));

    // split length into incremental pieces
    let stepX = (currentX - previousX)/distance;
    let stepY = (currentY - previousY)/distance;
    
    for (let i = 0; i < distance; i++ ) {

        // find the next coordinate to ink
        let currentX = previousX + (i * stepX);	
        let currentY = previousY + (i * stepY);

        // introduce slight randomization where the ink is actually placed

        let numLayers = (strokeWidth/10) + 1  // scale number of ink layers to maintain texture across different stroke sizes
        let opacity = 0.5; // fade ink layers lighter toward the edge (to mimic outlier flecks in pencil strokes)
        let layerWidth = 1; // how wide the ink can potentially be applied

        // draw layers of randomized ink (rectangles) and make the stroke darker and thinner as it approaches the center
        for (numLayers; numLayers > 0; numLayers--) {
            context.globalAlpha = opacity;
            let randomX = currentX + ((Math.random()-0.5) * strokeWidth * layerWidth);			
            let randomY = currentY + ((Math.random()-0.5) * strokeWidth * layerWidth);
            context.fillRect(randomX, randomY, Math.random() + 2, Math.random() + 1);
            opacity += 0.05;
            layerWidth -= 0.05;
        }

    }

    // restore context properties
    context.fillStyle = strokeColor;
    context.globalCompositeOperation = strokeLayer;
    context.lineWidth = strokeWidth;
    context.globalAlpha = opacity;
}

export function hideElementIfVisible(el: HTMLElement) {
    if (el.classList.contains("show")) 
        el.classList.remove("show");
}

export function toCamelCase(str: string) {
    return str.toLowerCase().replace(/-(.)/g, function(match, upperLetter) {
        return upperLetter.toUpperCase();
    });
}

export function toDash(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}