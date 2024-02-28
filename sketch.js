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
  headerFont = loadFont("./BlackHan.ttf");
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
  background(255);

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
  fill(225,50,150);
  textFont(headerFont);
  textAlign(CENTER,CENTER);
  textSize(45);
  text("neon mondrian", width/1.32, 50);

  fill(0);
  textFont("sans-serif");
  textSize(13);
  text("- interactive color-changing image via physical computing -", width/1.32, 82);

  textSize(16);
  text("Choose color for the red pixels:", width/1.6, height/3.5)
  text("Choose color for the yellow pixels:", width/1.585, height/2.85)
  text("Choose color for the blue pixels:", width/1.595, height/2.38)
  text("Toggle transparency for all pixels:", width/1.587, height/1.95)

  //code for creating color-pickers for each primary color
  redPicker = createColorPicker("Red");
  redPicker.position(width/1.38, height/3.75)
  
  yellowPicker = createColorPicker("Yellow");
  yellowPicker.position(width/1.38, height/3)
  
  bluePicker = createColorPicker("Blue");
  bluePicker.position(width/1.38, height/2.5);

  alphaSlider = createSlider(0, 255, 128, 1);
  alphaSlider.position(width/1.38, height/2);
  alphaSlider.style("width","255px");

  designerRadio = createRadio();
  designerRadio.option('ShowOG','Show Original Image');
  designerRadio.option('ShowIMG','Show Collage Image');
  designerRadio.selected('ShowOG');
  designerRadio.position(width/1.82, height/1.6);
  designerRadio.style('font-family','sans-serif');

  designerRadio_Val = designerRadio.value();

  connectButton = createButton("Initiate Connection");
  connectButton.position(width/1.82, height/1.3);
  connectButton.mousePressed(connectToSerial);

  textAlign(CENTER, CENTER);
  text("Transparency & Panel-Image will be controlled by potentiometer and button press", width/1.358, height/1.2);
  fill(255,0,0);
  text("once serial connection is established successfully", width/1.51, height/1.16);
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