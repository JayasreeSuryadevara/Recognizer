const SIZE = 300; //canvas size
const THRESHOLD = 128; //gray
const NUM_SAMPLES = 24;
let context;
let currentSample = 1; //first sample image
let observedObj = []; // map name of obj to analyzed data
let analyzed = [] //analyzed obj size and mass
let objCount = 0;

export default class PictureBot {
  constructor(canvas) {
    this.canvas = canvas;
    context = this.canvas.getContext('2d');
    this.listenToImageDrop();
    this.startEvents();
  }

  listenToImageDrop() {
    this.canvas.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();

      this.drawImage(e.dataTransfer.files);
    });

    this.canvas.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();

      e.dataTransfer.dropEffect = 'copy';
    });
  }

  startEvents() {
    const sampleButton = document.getElementById("sampler");
    sampleButton.addEventListener("click", () => { this.browseSamples() });
    const backButton = document.getElementById("back");
    backButton.addEventListener("click", () => { this.goBack() });
    const forwardButton = document.getElementById("forward");
    forwardButton.addEventListener("click", () => { this.goForward() });
    const learnButton = document.getElementById("button");
    learnButton.addEventListener("click" , () => { this.learn() });
    const inputField = document.getElementById("image-name");
    inputField.addEventListener("keyup", (e) => { this.handleKeyPress(e) });
  }

  drawImage(fileList) {
    let file = null;
    let imageURL = null;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        file = fileList[i];
        break;
      }
    }
    if (file !== null) {
      imageURL = URL.createObjectURL(file);
    }
    this.loadAndDrawImage(imageURL)
  }

  loadAndDrawImage(imageURL) {
    let image = new Image();
    // let context = this.canvas.getContext("2d");
    image.onload = function() {
      // To adjust image aspect ratio to browser
      // debugger;
      let min = Math.min(image.width, image.height);

      let startX = (image.width - min) / 2;
      let startY = (image.height - min) / 2;

      context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);
      // context.drawImage(image, 0,0)     
    }
    image.src = imageURL;
    this.processMatrix();
  }

  learn() {
    document.getElementById("output").innerText = "Got it!"
    let name = document.getElementById("image-name").value;
    if (name == "") {
      alert("Enter a name for this object.");
      return;
    }
    objCount++;
    observedObj[objCount] = {
      name: name,
      props: analyzed
    }
    console.log(observedObj);
    document.getElementById("output").value = name;
    document.getElementById("image-name").value = "";
  }

  handleKeyPress(event) {
    if (event.key == "Enter") {
      this.learn();
    }
  }

  browseSamples() {
    document.getElementById("controls").style.display = "block";
    this.processSample(currentSample);
  }

  processSample(num) {
    currentSample = num;
    let image = new Image();
    image.crossOrigin = "Anonymous";
    // let context = this.canvas.getContext("2d");
    image.src = "samples/" + currentSample + ".jpeg";
    context.clearRect(0,0,SIZE,SIZE);

    image.onload = function () {
      context.drawImage(image, 0, 0);
    };
    this.processMatrix();
    this.updateControlls();
  }

  updateControlls() {

    // disable back button if viewing first sample
    if (currentSample === 1) {
      document.getElementById("back").disabled = true;
    } else {
      document.getElementById("back").disabled = false;
    }

    // disable forward button if viewing last sample
    if (currentSample === NUM_SAMPLES) {
      document.getElementById("forward").disabled = true;
    } else {
      document.getElementById("forward").disabled = false;
    }

    // showing the number of the current sample
    document.getElementById("sample-count").innerText =
      currentSample + " / " + NUM_SAMPLES;
  }

  
	goForward() {
    if (currentSample < NUM_SAMPLES) {
      this.processSample(currentSample + 1);
    }
  }

  goBack() {
    if (currentSample > 1) {
      this.processSample(currentSample - 1);
    }
  }

  processMatrix() {
    // let context = this.canvas.getContext("2d");
    let pixelArr = context.getImageData(0, 0, SIZE, SIZE);
    let matrix = this.getGreyScaleMatrix(pixelArr);
    this.applyThreshold(matrix);
    const boundingBox = this.getBoundingBox(matrix);
    const boxProps = this.getBBoxProps(boundingBox);
    let blackPixels = this.countBlackPixels(matrix);

    const aspectRatio = boxProps.width / boxProps.length;
    console.log("ar",aspectRatio);
    analyzed[0] = aspectRatio;
    const mass = (blackPixels / boxProps.area).toFixed(5);
    console.log("mass", mass);
    analyzed[1] = mass;

    this.findObject(analyzed);

    this.updateData(observedObj);
  }

  countBlackPixels(matrix) {
    let count = 0;
    for (let i = 1; i <= SIZE; i++) {
      for (let j = 1; j <= SIZE; j++) {
        if (matrix[i][j] == 0) {
          count++;
        }
      }
    }
    return count;
  }

  findObject(currentObject) {
    let name;
    if (objCount == 0) {
      name = "Not Sure";
    } else {
      let neighbor = this.getNearestNeighbor(currentObject);
      if (neighbor) name = neighbor.name;
    }
    document.getElementById("output").innerText = name;
  }

  getNearestNeighbor(currentObject) {
    let neighbor = null;
    let minDist = null;
    for (let i = 1; i <= objCount; i++) {
      let dist = Math.abs(currentObject - observedObj[i].props);
      dist = this.distance(currentObject, observedObj[i].props);
      if (minDist == null || minDist > dist) {
        minDist = dist;
        neighbor = observedObj[i];
      }
    }
    return neighbor;
  }

  distance(p1, p2) {
    let dist = 0;
    for (let i = 1; i <= 2; i++) {
      dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
    }
    return Math.sqrt(dist);
  }

  getBBoxProps(box) {
    let props = {
      length: 0,
      width: 0,
      area: 0
    }
    //Calculate the actual lenth and width of the image
    let deltaX = box.xMax - box.xMin + 1;
    let deltaY = box.yMax - box.yMin + 1;

    props.length = Math.max(deltaX, deltaY);
    props.width = Math.min(deltaX, deltaY);
    props.area = props.width * props.length;

    return props;
  }

  getBoundingBox(matrix) {
    let box = {
      xMin: SIZE + 1,
      xMax: 0,
      yMin: SIZE + 1,
      yMax: 0
    }; //301,0,301,0

    for (let i = 1; i <= SIZE; i++) {
      for (let j = 1; j <= SIZE; j++) {
        if (matrix[i][j] == 0) {
          box.yMin = Math.min(i, box.yMin);
          box.yMax = Math.max(i, box.yMax);
          box.xMin = Math.min(j, box.xMin);
          box.xMax = Math.max(j, box.xMax);
        }
      }
    }

    return box;
  }

  applyThreshold(matrix) {
    for (let i = 1; i <= SIZE; i++) {
      for (let j = 1; j <= SIZE; j++) {
        if (matrix[i][j] < THRESHOLD) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = 255;
        }
      }
    }
  }

  //dataArray comes as a single array of 4 values per pixel 
  // [red, green, blue, opacity]
  getGreyScaleMatrix(dataArray) {
    let matrix = [];
    for (let y = 1; y <= SIZE; y++) {
      matrix[y] = [];
      for (let x = 1; x <= SIZE; x++) {
        let pixelIndex = (y - 1) * SIZE * 4 + (x - 1) * 4;
        let red = dataArray.data[pixelIndex + 0];
        let green = dataArray.data[pixelIndex + 1];
        let blue = dataArray.data[pixelIndex + 2];
        matrix[y][x] = (red + green + blue) / 3;
      }
    }
    return matrix;
  }

  updateData(observedObj) {
    const listContainer = document.getElementById("learned-list");
    listContainer.innerHTML = observedObj.map((record,i) => {
      return `<li key=${i}>${record.name} : ${record.props.analyzed}</li>`
    }).join("");
  }

}















