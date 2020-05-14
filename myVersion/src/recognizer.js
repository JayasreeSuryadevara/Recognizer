var IMAGE_SIZE = 300;  // pixels
var CAM_CONTEXT = null; // displays the raw image, what the PC 'sees'
var THR_CONTEXT = null; // displays the thresholded image
var POINTS_CONTEXT = null; // displays the thresholded image
var CLASSES_CONTEXT = null; // displays the thresholded image
var LOW_THRESHOLD = 120;  // from 0 (black) to 255 (white)
var HIGH_THRESHOLD = 200;  // from 0 (black) to 255 (white)
var THRESHOLD = null; // from 0 (black) to 255 (white)
var OBSERVATIONS = [];   // what PC has 'learned'
var OBSERVATION_COUNT = 0;    // how many things PC has 'learned'

var CLASSES = [];
var CLASS_COUNT = 0; // NEW

var SAMPLE_POINT = null; // what PC 'understands' from current image
var FEATURE_COUNT = 2;    // aspect ratio and fullness
var FEATURE_1 = "Aspect Ratio";   // aspect ratio and fullness
var FEATURE_2 = "Fullness";    	// aspect ratio and fullness

var CURRENT_SAMPLE = 1;  // we start showing the first sample image
var NUM_SAMPLES = 32; // how many samples are there

var BLACK = 0;   // no light
var WHITE = 255; // maximum amount of light

// OPTIONAL
var CONTEXT_SIZE = 800;
var CONTEXT_SIZE = IMAGE_SIZE;

var BACKGROUND = null;

var FRAME_RATE = 30;

var MODES = { camera: "camera", samples: "samples" };
var MODE = MODES.camera;

var VIDEO_INTERVAL = null;
var LOADING = "Loading...";

function main() {
  loadModel(); // optional
  initializeDrawingContexts();

  setThreshold(LOW_THRESHOLD);

  initializeCamera();
}/// main function

function initializeDrawingContexts() {
  var canvas = document.getElementById('camera');
  canvas.width = IMAGE_SIZE;
  canvas.height = IMAGE_SIZE;
  CAM_CONTEXT = canvas.getContext('2d');

  canvas = document.getElementById('threshold');
  canvas.width = IMAGE_SIZE;
  canvas.height = IMAGE_SIZE;
  THR_CONTEXT = canvas.getContext('2d');


  canvas = document.getElementById('points');
  //CONTEXT_SIZE		= canvas.clientWidth;
  canvas.width = CONTEXT_SIZE;
  canvas.height = CONTEXT_SIZE;
  POINTS_CONTEXT = canvas.getContext('2d');

  canvas = document.getElementById('classes');
  canvas.width = CONTEXT_SIZE;
  canvas.height = CONTEXT_SIZE;
  CLASSES_CONTEXT = canvas.getContext('2d');
}// we set the camera canvas size size and initialize the context


function initializeSamples() {
  document.getElementById("controls").style.display = "block";
  BACKGROUND = null;
  processSample(CURRENT_SAMPLE);
}

function initializeCamera() {
  document.getElementById("controls").style.display = "none";
  var video = document.createElement('video');
  // accessing back camera from device
  // fixing height of device, width preserves aspect ratio
  const constraints = {
    video: { facingMode: "environment" },
    frameRate: FRAME_RATE
  };

  CAM_CONTEXT.clearRect(0, 0, CONTEXT_SIZE, CONTEXT_SIZE);
  var location = {
    x: CONTEXT_SIZE / 2,
    y: CONTEXT_SIZE / 2
  }
  drawText(LOADING, CONTEXT_SIZE / 8, CAM_CONTEXT, location);

  var promise = navigator.mediaDevices.getUserMedia(constraints);
  promise.then(function (stream) {
    video.srcObject = stream;
    video.onloadedmetadata = function (e) {
      if (MODE == MODES.camera) {
        video.play();
        beginProcessing(video);
      };
    }
  }).catch(function (err) {
    document.getElementById("machineOutput").innerHTML = "camera error";
  });

}

function beginProcessing(videoFrame) {
  VIDEO_INTERVAL = setInterval(processVideoFrame, FRAME_RATE, videoFrame);
}

function processVideoFrame(videoFrame) {
  var vw = videoFrame.videoWidth;
  var vh = videoFrame.videoHeight;
  var min = Math.min(vw, vh);

  var sx = (vw - min) / 2;
  var sy = (vh - min) / 2;

  CAM_CONTEXT.drawImage(videoFrame, sx, sy, min, min, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
  processImageMatrix();
}

function processSample(number) {
  CURRENT_SAMPLE = number;
  // loading image from samples directory to use instead of camera
  var img = new Image();
  img.src = "samples/" + CURRENT_SAMPLE + ".png";

  CAM_CONTEXT.clearRect(0, 0, CONTEXT_SIZE, CONTEXT_SIZE);
  var location = {
    x: CONTEXT_SIZE / 2,
    y: CONTEXT_SIZE / 2
  }
  drawText(LOADING, CONTEXT_SIZE / 8, CAM_CONTEXT, location);

  img.onload = function () {
    // takes time to load; when complete, draw and process the image
    CAM_CONTEXT.drawImage(img, 0, 0);
    processImageMatrix();
  };

  updateControlls();
}// displaying and processing a sample image given by index

function updateControlls() {
  // disable back button if viewing first sample
  let back = CURRENT_SAMPLE <= 1 ? true : false;
  document.getElementById("back").disabled = back;

  // disable forward button if viewing sample
  let forward = CURRENT_SAMPLE == NUM_SAMPLES ? true : false;
  document.getElementById("forward").disabled = forward;

  // showing the number of the current sample
  document.getElementById("sample").innerHTML =
    CURRENT_SAMPLE + " / " + NUM_SAMPLES;
}// disabling buttons and updating title

function goForward() {
  if (CURRENT_SAMPLE < NUM_SAMPLES) {
    processSample(CURRENT_SAMPLE + 1);
  }
}

function goBack() {
  if (CURRENT_SAMPLE > 1) {
    processSample(CURRENT_SAMPLE - 1);
  }
}

function processImageMatrix() {
  // image processing
  var matrix = getPixelMatrix(CAM_CONTEXT); 		// intensity matrix (gray)
  subtractBackground(matrix, IMAGE_SIZE);			//OPTIONAL
  applyThreshold(matrix, IMAGE_SIZE, THRESHOLD); 	//image segmentation

  // geometric properties
  var boundingBox = getBoundingBox(matrix, IMAGE_SIZE);
  var boxProperties = getBoxProperties(boundingBox);
  var blackPixelCount = countPixelsWithValue(BLACK, matrix, IMAGE_SIZE);

  // computing features 
  var aspectRatio = boxProperties.width / boxProperties.length;
  var fullness = blackPixelCount / boxProperties.area;

  // assembling feature vector = understanding the image contents
  SAMPLE_POINT = [];
  SAMPLE_POINT[1] = aspectRatio;
  SAMPLE_POINT[2] = fullness;

  // attempt to classify this sample point
  var className = classify(SAMPLE_POINT, FEATURE_COUNT);

  var location = {
    x: (boundingBox.xMin + boundingBox.xMax) / 2, 	// middle of box
    y: boundingBox.yMin								// top of box
  }

  //var fontSize = IMAGE_SIZE / 8;
  //drawText(className, fontSize, CAM_CONTEXT, location);
  document.getElementById("machineOutput").innerHTML = className;

  // OPTIONAL
  drawPoints(SAMPLE_POINT, POINTS_CONTEXT);
  drawClasses(CLASSES_CONTEXT);
  setPixelMatrix(matrix, THR_CONTEXT);
  drawBox(boundingBox, THR_CONTEXT);
}

function checkKeyPress(event) {
  switch (event.key) {
    case "Enter":
      learn();
      break;
    case "ArrowLeft":
      goBack();
      break;
    case "ArrowRight":
      goForward();
      break;
  }
}

function getPixelMatrix_tentative(context) {
  var matrix = [];

  for (var i = 1; i <= IMAGE_SIZE; i++) {
    matrix[i] = [];
    for (var j = 1; j <= IMAGE_SIZE; j++) {
      var pixel = context.getImageData(i - 1, j - 1, 1, 1);
      var red = pixel.data[0];
      var green = pixel.data[1];
      var blue = pixel.data[2];
      // intensities of red, green and blue are averaged
      matrix[i][j] = (red + green + blue) / 3;
    }
  }

  return matrix;
}// reads a gray intensity matrix from a given context

function getPixelMatrix(context) {
  var matrix = [];

  // converting from a long array into a matrix
  var image = context.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
  for (var i = 1; i <= IMAGE_SIZE; i++) {
    matrix[i] = [];
    for (var j = 1; j <= IMAGE_SIZE; j++) {
      var red = image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4];
      var green = image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4 + 1];
      var blue = image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4 + 2];
      // intensities of red, green and blue are averaged
      matrix[i][j] = (red + green + blue) / 3;
    }
  }

  return matrix;
}// reads a gray intensity matrix from a given context

function learn() {
  var name = document.getElementById("objectName").value;
  if (name == "") {
    alert("Enter a name for this object.");
    return;
  }
  name = name.toLowerCase();

  // one more observation learned!
  OBSERVATION_COUNT++;
  OBSERVATIONS[OBSERVATION_COUNT] = {
    name: name,
    point: SAMPLE_POINT
  }

  // if new class name entered, update it
  if (CLASSES.indexOf(name) == -1) {
    CLASS_COUNT++;
    CLASSES[CLASS_COUNT] = name;
  }

  // reloading the sample to show updated name
  processImageMatrix();

  // emptying the text input box
  document.getElementById("objectName").value = "";
}// adds one more observation  

function classify(samplePoint, dimCount) {
  var className = "?";
  var neighbor = getNearestNeighbor(samplePoint, dimCount);
  if (neighbor != null) {
    className = neighbor.name;
  }
  return className;
}// attempts to classify 

function forget() {
  OBSERVATIONS = [];
  OBSERVATION_COUNT = 0;
  CLASSES = [];
  CLASS_COUNT = 0;
  // reloading the sample to show updated name
  processImageMatrix();
}

function drawText(text, fontSize, context, location, align = "center", angle = 0) {
  // save the current co-ordinate system 
  context.save();
  // move to the middle of where we want to draw our image
  context.translate(location.x, location.y);
  // rotate around that point
  context.rotate(angle);

  context.font = fontSize + "px Arial";
  context.textAlign = align;
  context.fillStyle = "black";
  context.fillText(text, 0, 0);

  // and restore the co-ords to how they were when we began
  context.restore();
}// writes text over a context


function subtractBackground(matrix, matrixSize) {
  if (BACKGROUND != null) {
    for (var i = 1; i <= IMAGE_SIZE; i++) {
      for (var j = 1; j <= IMAGE_SIZE; j++) {
        matrix[i][j] = 255 - Math.abs(BACKGROUND[i][j] - matrix[i][j]);
      }
    }
  }
}

function toggleBackground() {
  if (BACKGROUND == null) {
    BACKGROUND = getPixelMatrix(CAM_CONTEXT);
    setThreshold(HIGH_THRESHOLD);
  } else {
    BACKGROUND = null;
    setThreshold(LOW_THRESHOLD);
  }
  processImageMatrix();
}

// TASKS SUITABLE FOR SCHOOL CURRICULUM

function applyThreshold(matrix, matrixSize, thresholdValue) {
  for (var i = 1; i <= matrixSize; i++) {
    for (var j = 1; j <= matrixSize; j++) {
      if (matrix[i][j] < thresholdValue) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = 255;
      }
    }
  }
}

function getBoundingBox(matrix, matrixSize) {
  var bbox = {
    xMin: matrixSize + 1,
    xMax: 0,
    yMin: matrixSize + 1,
    yMax: 0
  };

  for (var i = 1; i <= matrixSize; i++) {
    for (var j = 1; j <= matrixSize; j++) {
      if (matrix[i][j] == 0) {
        bbox.yMin = Math.min(i, bbox.yMin);
        bbox.yMax = Math.max(i, bbox.yMax);
        bbox.xMin = Math.min(j, bbox.xMin);
        bbox.xMax = Math.max(j, bbox.xMax);
      }
    }
  }

  return bbox;
}

function getBoxProperties(box) {
  var properties = {
    length: 0,
    width: 0,
    area: 0
  }

  var deltaX = box.xMax - box.xMin + 1;
  var deltaY = box.yMax - box.yMin + 1;

  properties.length = Math.max(deltaX, deltaY);
  properties.width = Math.min(deltaX, deltaY);
  properties.area = properties.length * properties.width;

  return properties;
}

function countPixelsWithValue(value, matrix, matrixSize) {
  var count = 0;
  for (var i = 1; i <= matrixSize; i++) {
    for (var j = 1; j <= matrixSize; j++) {
      if (matrix[i][j] == value) {
        count++;
      }
    }
  }
  return count;
}

function euclideanDistance(p1, p2) {
  var dist = 0;
  for (var i = 1; i <= FEATURE_COUNT; i++) {
    dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(dist);
}

function getNearestNeighbor(samplePoint) {
  var neighbor = null;
  var minDist = null;
  for (var i = 1; i <= OBSERVATION_COUNT; i++) {
    var dist = euclideanDistance(OBSERVATIONS[i].point, samplePoint);
    if (minDist == null || minDist > dist) {
      minDist = dist;
      neighbor = OBSERVATIONS[i];
    }
  }
  return neighbor;
}


// NEEDED FOR THRESHOLDED CONTEXT

function setPixelMatrix_tentative(matrix, context) {
  for (var i = 1; i <= IMAGE_SIZE; i++) {
    for (var j = 1; j <= IMAGE_SIZE; j++) {
      var val = matrix[i][j];
      context.fillStyle = "rgb(" + val + "," + val + "," + val + ")";
      context.fillRect(i, j, 1, 1);
    }
  }
}// writes a matrix as an image to a context

function setPixelMatrix(matrix, context) {
  var image = context.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);

  for (var i = 1; i <= IMAGE_SIZE; i++) {
    for (var j = 1; j <= IMAGE_SIZE; j++) {
      image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4] = matrix[i][j];
      image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4 + 1] = matrix[i][j];
      image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4 + 2] = matrix[i][j];
      image.data[(i - 1) * IMAGE_SIZE * 4 + (j - 1) * 4 + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}// writes a matrix as an image to a context



function drawClasses(context) {
  var maxPerColumn = 8;
  var margin = CONTEXT_SIZE * 0.110;
  context.clearRect(0, 0, CONTEXT_SIZE * 2, CONTEXT_SIZE);

  for (var i = 1; i <= CLASS_COUNT; i++) {
    var location = {
      x: margin + Math.floor((i - 1) / maxPerColumn) * margin * 3.5,
      y: margin + ((i - 1) % maxPerColumn) * margin
    }

    drawDot(location, context, COLORS[i]);

    var fontSize = CONTEXT_SIZE / 14;
    location.x += margin * 0.4;
    location.y += margin * 0.15;
    drawText(CLASSES[i], fontSize, context, location, "left");
  }

}// draws a grid of class names as bullet points

function drawBox(box, context) {
  context.beginPath();
  var deltaX = box.xMax - box.xMin;
  var deltaY = box.yMax - box.yMin;
  context.rect(box.xMin, box.yMin, deltaX, deltaY);
  context.stroke();
}

function onThresholdSliderMove(slider) {
  THRESHOLD = slider.value;
  // reloading the sample to show updated name
  processImageMatrix();
}

function setThreshold(value) {
  var slider = document.getElementById("slider");
  slider.value = value;
  onThresholdSliderMove(slider);
}


function specialFunction() {
  if (MODE == MODES.camera) {
    toggleBackground();
  } else {
    processSample(0);
  }
}

function selectMode(select) {
  switch (select.value) {
    case MODES.camera:
      MODE = MODES.camera;
      initializeCamera();
      break;
    case MODES.samples:
      clearInterval(VIDEO_INTERVAL);
      MODE = MODES.samples;
      initializeSamples();
      break;
  }
}