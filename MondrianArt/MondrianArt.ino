#include <ArduinoJson.h>

//initializing Arduino variables
int potVal = 0;
int buttonVal_Current = 0;
int buttonVal_Previous = 0;
int buttonClickCount = 0;

//function declaration for sending data over to P5
void sendData()
{
  StaticJsonDocument<128> resJson;
  JsonObject data = resJson.createNestedObject("data");
  JsonObject A0 = data.createNestedObject("A0");
  JsonObject D2 = data.createNestedObject("D2");

  A0["value"] = potVal;
  D2["count"] = buttonClickCount;

  String resTxt = "";
  serializeJson(resJson, resTxt);
  Serial.println(resTxt);
}

void setup()
{
  Serial.begin(9600);
  while(!Serial)
  {
    //empty
  }
}

void loop()
{
  potVal = analogRead(A0);
  buttonVal_Current = digitalRead(2);

  //counting unique button presses
  if(buttonVal_Current==1 && buttonVal_Previous==0)
  {
    buttonClickCount++;
  }

  buttonVal_Previous = buttonVal_Current;

  if(Serial.available()>0)
  {
    int byteIn = Serial.read();
    if(byteIn == 0xAB)
    {
      Serial.flush();
      sendData();
    }
  }
}
