const colorMap = new Map([["green", "#3ba372"], ["yellow", "#ebc157"], ["red", "#eb5757"]]);
const accentMap = new Map([["green", "#E3FFF2"], ["yellow", "#FFFAED"], ["red", "#FFF3F3"]]);


export async function draw(canvas: HTMLCanvasElement, manifestData: String, swrData: String, securityData: String, siteName: String) {
  // manifest Data
  const maniData = manifestData.split('/');
  const maniPercent = `${parseFloat(maniData[0])} / ${parseFloat(maniData[1])}`
  const maniColor: string = maniData[2];
  const maniHeader = maniData[3];

  // sw Data
  const swData = swrData.split('/');
  const swPercent = `${parseFloat(swData[0])} / ${parseFloat(swData[1])}`
  const swColor = swData[2];
  const swHeader = swData[3];

  // sec Data
  const secData = securityData.split('/');
  const secPercent = `${parseFloat(secData[0])} / ${parseFloat(secData[1])}`
  const secColor = secData[2];
  const secHeader = secData[3];

  //let canvas = (this!.shadowRoot!.getElementById("myCanvas") as HTMLCanvasElement);
  let ctx = canvas!.getContext("2d");

  // canvas resolution
  canvas.width = 824; //413
  canvas.height = 660; //331

  const ringYpos = 243;

  let background = new Image();
  background.src = 'assets/share_score_backdrop.jpg';

   // Use `await` to wait for the image to load
  await new Promise(resolve => background.onload = resolve);
  // Now that the image is loaded, draw it on the canvas
  ctx!.drawImage(background, 0, 0);
  
  // offset to start top middle rather than
  // middle right like a unit circle
  const start = -0.5 * Math.PI;
  const trackColor = "#e4e4e7";

  // makes ends of lines round
  ctx!.lineCap = 'round';
  ctx!.lineJoin = 'round';

  // text for url
  ctx!.font = "bold 48px Hind, sans-serif";
  ctx!.fillStyle = "#292c3a";
  ctx!.fillText(siteName.replace(/\/$/, ""), 30, 70);

  ctx!.textAlign = "center";

  //brand label
  ctx!.font = "30px Hind, sans-serif";
  ctx!.fillStyle = "#292c3a";
  ctx!.fillText("PWA Score", 105, 115);

  ctx!.textAlign = "center";

  // --- mani ring ---
  // track
  drawRingPart(ctx!, 6, trackColor, 200, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(maniColor)!)

  // indicator
  let percentMani = eval(maniPercent);


  if(percentMani === 0){
    // draw exclamation
    await drawExclamation(ctx!, 145);

    ctx!.font = "24px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(maniHeader, 200, 340);
  } else {
    let radiansMani = (360 * percentMani) * (Math.PI / 180);
    let endMani = (start) + radiansMani;
    drawRingPart(ctx!, 12, colorMap.get(maniColor)!, 200, ringYpos, 57.44, start, endMani, false, "transparent");
    
    // text
    writeText(ctx!, 200, maniPercent, maniHeader);
  }

  // --- sw ring ---
  // track
  drawRingPart(ctx!, 6, trackColor, 412.5, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(swColor)!);

  // indicator
  let percentSW = eval(swPercent);
 
  if(percentSW === 0){
    await drawExclamation(ctx!, 357.5);

    ctx!.font = "24px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(swHeader, 412.5, 340);
  } else {
    let radiansSW = (360 * percentSW) * (Math.PI / 180);
    let endSW = (start) + radiansSW;
    drawRingPart(ctx!, 12, colorMap.get(swColor)!, 412.5, ringYpos, 57.44, start, endSW, false, "transparent");
    
    // text
    writeText(ctx!, 412.5, swPercent, swHeader);
  }
  
  // --- sec ring ---
  // track
  drawRingPart(ctx!, 6, trackColor, 624.5, ringYpos, 57.44, 0, 2 * Math.PI, false, accentMap.get(secColor)!);

  // indicator
  let percentSec = eval(secPercent);

  if(percentSec === 0) {
    // draw exclamation
    await drawExclamation(ctx!, 569.5);

    ctx!.font = "24px Hind, sans-serif";
    ctx!.fillStyle = "#292c3a";
    ctx!.fillText(secHeader, 624.5, 340);
  } else {
    let radiansSec = (360 * percentSec) * (Math.PI / 180);
    let endSec = (start) + radiansSec;
    drawRingPart(ctx!, 12, colorMap.get(secColor)!, 624.5, ringYpos, 57.44, start, endSec, false, "transparent");

    // text
    writeText(ctx!, 624.5, secPercent, secHeader);
  }
}

export function drawRingPart(ctx: CanvasRenderingContext2D, lineWidth: number, trackColor: string, x: number, y: number, radius: number, start: number, end: number, clockwise: boolean, fillColor: string){
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = trackColor;
  ctx.arc(x, y, radius, start, end, clockwise);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.stroke();
}

export async function drawExclamation(ctx: CanvasRenderingContext2D, x: number){
  // draw exclamation
  let exclamation = new Image();
  exclamation.src = 'assets/new/macro_error.svg';
  // Use `await` to wait for the image to load
  await new Promise(resolve => exclamation.onload = resolve);
  // Now that the image is loaded, draw it on the canvas
  ctx!.drawImage(exclamation, x, 188, 110, 110);
}

export function writeText(ctx: CanvasRenderingContext2D, x: number, percent: string, header: string){
  ctx!.font = "bold 24px Hind, sans-serif";
  ctx!.fillStyle = "#4f3fb6";
  ctx!.fillText(percent, x, 250);
  ctx!.font = "24px Hind, sans-serif";
  ctx!.fillStyle = "#292c3a";
  ctx!.fillText(header, x, 340);
}