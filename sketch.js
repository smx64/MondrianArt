//initializing Serial-Arduino variables
let serialConnect;
let connectButton;
let readyToReceive;

let a0_val;
let d2_val;

//initializing element variables
let mondrianImage;
let mondrianDup;
let headerFont;
let alphaSlider;
let alphaSlider_Val;

//initializing designer image variables
let designerImage;
let designerRadio;
let designerRadio_Val;

//initializing color-picker variables
let redPicker;
let redPicker_Val;
let yellowPicker;
let yellowPicker_Val;
let bluePicker;
let bluePicker_Val;

let imgRedVal;
let imgGreenVal;
let imgBlueVal;
let imgAlphaVal;

//pre-loading image and font
function preload()
{
  mondrianImage = loadImage("./NeonMondrian.jpg");
  designerImage = loadImage("./DesignerImage.jpg");
  headerFont = loadFont("./Kanit.ttf");
}

function receiveSerial()
{
  let line = serialConnect.readUntil("\n");
  trim(line);
  if(!line) return;

  if(line.charAt(0) != "{")
  {
    print("error: ",line);
    readyToReceive = true;
    return;
  }

  //fetching data from serial connection
  let data = JSON.parse(line).data;
  let a0 = data.A0;
  let d2 = data.D2;

  //mapping potentiometer value to transparancy slider
  a0_val = map(a0.value, 0, 4095, 0, 255);

  //mapping button press to panel-image radio button
  if(d2.count)
  {
    d2_val = map(d2.count % 2, 0, 1, 0, 1)
  }

  readyToReceive = true;
}

function connectToSerial()
{
  if (!serialConnect.opened())
  {
    serialConnect.open(9600);
    readyToReceive = true;
    connectButton.hide();
  }
}

function setup()
{
  createCanvas(windowWidth, windowHeight);
  background(25);

  readyToReceive = false;
  serialConnect = createSerial();

  //loading "original" image's pixels
  mondrianImage.loadPixels();
  mondrianDup = mondrianImage.get();

  //resizing images to maintain aspect-ratio
  mondrianImage.resize(0,height);
  designerImage.resize(0,height);
  mondrianDup.resize(0,height);

  //code for generating interface text
  fill(255);
  textFont(headerFont);
  textAlign(CENTER,CENTER);
  textSize(60);
  text("mondrian", width/1.375, 40);
  fill(0,255,225);
  text("art", width/1.185 , 40);

  fill(200);
  textFont("sans-serif");
  textSize(14);
  text("- interactive image manipulation via physical computing -", width/1.325, 87);

  textSize(16);
  fill(255);
  textFont(headerFont);
  text("Change RED pixels to:", width/1.5, height/3.6);
  text("Change YELLOW pixels to:", width/1.525, height/2.89);
  text("Change BLUE pixels to:", width/1.505, height/2.42);
  text("Toggle transparency for ALL coloured pixels", width/1.33, height/1.82);

  //code for creating color-pickers for each primary color
  redPicker = createColorPicker("Red");
  redPicker.position(width/1.35, height/3.75);
  
  yellowPicker = createColorPicker("Yellow");
  yellowPicker.position(width/1.35, height/3);
  
  bluePicker = createColorPicker("Blue");
  bluePicker.position(width/1.35, height/2.5);

  alphaSlider = createSlider(0, 255, 128, 1);
  alphaSlider.position(width/1.49, height/2);
  alphaSlider.style("width","255px");

  designerRadio = createRadio();
  designerRadio.option('ShowOG','Show Original Image');
  designerRadio.option('ShowIMG','Show Collage Image');
  designerRadio.selected('ShowOG');
  designerRadio.position(width/1.55, height/1.55);
  designerRadio.style('font-family','sans-serif');

  designerRadio_Val = designerRadio.value();

  connectButton = createButton("Initiate Serial Connection");
  connectButton.position(width/1.41, height/1.29);
  connectButton.mousePressed(connectToSerial);

  textAlign(CENTER, CENTER);
  textSize(15);
  text("Transparency & Panel-Image will be controlled by potentiometer and button press", width/1.32, height/1.1);
  fill(0,255,225);
  text("once serial connection is established successfully", width/1.32, height/1.07);
}

function draw()
{
  //request new data from serial
  if(serialConnect.opened() && readyToReceive)
  {
    readyToReceive = false;
    serialConnect.clear();
    serialConnect.write(0xab);
  }

  //read new data from serial
  if(serialConnect.availableBytes()>8)
  {
    receiveSerial();
  }

  //loading pixels of the "duplicate" image
  mondrianDup.loadPixels();
  
  //storing color-picker value into variable
  redPicker_Val = redPicker.color();
  yellowPicker_Val = yellowPicker.color();
  bluePicker_Val = bluePicker.color();
  
  //activating transparency slider only AFTER serial connection established
  if(readyToReceive)
  {
    alphaSlider.value(a0_val);
    alphaSlider_Val = a0_val;

    //generating back-panel image based on button click
    if(d2_val==0)
    {
      designerRadio.selected('ShowOG');
      designerRadio_Val = designerRadio.value()
    }
    else if(d2_val==1)
    {
      designerRadio.selected('ShowIMG');
      designerRadio_Val = designerRadio.value();
    }
  }

  for(let i=0; i<mondrianDup.pixels.length; i+=4)
  {
    //loading individual RGB values of original into variables
    imgRedVal = mondrianImage.pixels[i+0];
    imgGreenVal = mondrianImage.pixels[i+1];
    imgBlueVal = mondrianImage.pixels[i+2];
    imgTranVal = mondrianImage.pixels[i+3];

    //detecting red color in duplicate image, and modifying pixel values
    if((imgRedVal<=255 && imgRedVal>=175) && (imgGreenVal<=150 && imgGreenVal>=0) && (imgBlueVal<=255 && imgBlueVal>=0))
    {
      mondrianDup.pixels[i+0] = red(redPicker_Val);
      mondrianDup.pixels[i+1] = green(redPicker_Val);
      mondrianDup.pixels[i+2] = blue(redPicker_Val);
      mondrianDup.pixels[i+3] = alphaSlider_Val;
    }

    //detecting yellow color in duplicate image, and modifiying pixel values
    if((imgRedVal<=255 && imgRedVal>=200) && (imgGreenVal<=255 && imgGreenVal>=100) && (imgBlueVal<=100 && imgBlueVal>=0))
    {
      mondrianDup.pixels[i+0] = red(yellowPicker_Val);
      mondrianDup.pixels[i+1] = green(yellowPicker_Val);
      mondrianDup.pixels[i+2] = blue(yellowPicker_Val);
      mondrianDup.pixels[i+3] = alphaSlider_Val;
    }

    //detecting blue color in duplicate image, and modifiying pixel values
    if((imgRedVal<=100 && imgRedVal>=0) && (imgGreenVal<=100 && imgGreenVal>=0) && (imgBlueVal<=255 && imgBlueVal>=95))
    {
      mondrianDup.pixels[i+0] = red(bluePicker_Val);
      mondrianDup.pixels[i+1] = green(bluePicker_Val);
      mondrianDup.pixels[i+2] = blue(bluePicker_Val);
      mondrianDup.pixels[i+3] = alphaSlider_Val;
    }
  }
  //updating duplicate image's pixels
  mondrianDup.updatePixels();

  switch(designerRadio_Val)
  {
    case 'ShowOG':
      image(mondrianImage,0,0);
    break;
    case 'ShowIMG':
      image(designerImage,0,0);
    break;
  }

  //generating edited image (stacked) in real-time
  image(mondrianDup,0,0);
}