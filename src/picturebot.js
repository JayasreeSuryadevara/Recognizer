const SIZE = 300;
const THRESHOLD = 60;
const OBJECT_PROP = null;
const OBSERVATIONS = [];
const OBS_COUNT = 0;
const DIMENSIONS = 2;


export default class PictureBot {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
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
    const learnButton = document.getElementById("button");
    learnButton.addEventListener("click" , () => { this.learn(); });
    const inputField = document.getElementById("image-name");
    inputField.addEventListener("keyup", (e) => { this.handleKeyPress(e); });
  }

  drawImage(fileList) {
    // const output = document.getElementById('output');
    let file = null;
    let imageURL = null;
    for (let i = 0; i < fileList.length; i++) {
      console.log("type",fileList[i].type )
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
    let context = this.canvas.getContext('2d');
    let image = new Image();
    image.onload = function() {
      context.drawImage(image, 0, 0, SIZE, SIZE);     
    }
    image.src = imageURL;
    let matrix = this.getPixelMatrix(image.data);
    debugger;
    this.processMatrix(matrix);
  }

  learn() {
    let name = document.getElementById("image-name").value;
    if (name == "") {
      alert("Enter a name for this object.");
      return;
    }
    OBS_COUNT++;
    OBSERVATIONS[OBS_COUNT] = {
      name: name,
      prop: OBJECT_PROP
    }
    document.getElementById("image-name").value = "";
  }

  handleKeyPress(event) {
    if (event.key == "Enter") {
      this.learn();
    }
  }

  processMatrix(matrix) {
    debugger;
    this.isolateObject(matrix);
    let box = this.getBoundingBox(matrix);
    let boxProp = this.getBoxProperties(box);

    let blackPixels = this.countBlackPixels(matrix);
    let boxArea = boxProp.width * boxProp.length;
    let fullness = blackPixels / boxArea;

    OBJECT_PROP = boxProp.aspectRatio;

    OBJECT_PROP = [];
    OBJECT_PROP[1] = boxProp.aspectRatio;
    OBJECT_PROP[2] = fullness;

    this.recognize(OBJECT_PROP);

    this.updateCanvas(matrix);
    this.drawBox(box);
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

  recognize(currentObject) {
    let name;
    if (OBS_COUNT == 0) {
      name = '?';
    } else {
      let neighbor = this.getNearestNeighbor(currentObject);
      name = neighbor.name;
    }
    document.getElementById("output").innerHTML = name;
  }

  getNearestNeighbor(currentObject) {
    let neighbor = null;
    let minDist = null;
    for (let i = 1; i <= OBS_COUNT; i++) {
      let dist = Math.abs(currentObject - OBSERVATIONS[i].prop);
      dist = this.distance(currentObject, OBSERVATIONS[i].prop);
      if (minDist == null || minDist > dist) {
        minDist = dist;
        neighbor = OBSERVATIONS[i];
      }
    }
    return neighbor;
  }

  distance(p1, p2) {
    let dist = 0;
    for (let i = 1; i <= DIMENSIONS; i++) {
      dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);
    }
    return Math.sqrt(dist);
  }

  getBoxProperties(box) {
    let prop = {
      length: 0,
      width: 0,
      aspectRatio: 0
    }

    let deltaX = box.xMax - box.xMin + 1;
    let deltaY = box.yMax - box.yMin + 1;

    prop.length = Math.max(deltaX, deltaY);
    prop.width = Math.min(deltaX, deltaY);
    prop.aspectRatio = prop.width / prop.length;

    return prop;
  }

  getBoundingBox(matrix) {
    let bbox = {
      xMin: SIZE + 1,
      xMax: 0,
      yMin: SIZE + 1,
      yMax: 0
    };

    for (let y = 1; y <= SIZE; y++) {
      for (let x = 1; x <= SIZE; x++) {
        if (matrix[y][x] == 0) {
          bbox.yMin = Math.min(y, bbox.yMin);
          bbox.yMax = Math.max(y, bbox.yMax);
          bbox.xMin = Math.min(x, bbox.xMin);
          bbox.xMax = Math.max(x, bbox.xMax);
        }
      }
    }

    return bbox;
  }

  drawBox(box) {
    let context = this.canvas.getContext('2d');
    context.beginPath();
    let deltaX = box.xMax - box.xMin;
    let deltaY = box.yMax - box.yMin;
    context.rect(box.xMin, box.yMin, deltaX, deltaY);
    context.stroke();
  }

  isolateObject(matrix) {
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

  getPixelMatrix(dataArray) {
    let matrix = [];
    for (let i = 1; i <= SIZE; i++) {
      matrix[i] = [];
      for (let j = 1; j <= SIZE; j++) {
        let groupIndex = (i - 1) * SIZE * 4 + (j - 1) * 4;
        let red = dataArray[groupIndex + 0];
        let green = dataArray[groupIndex + 1];
        let blue = dataArray[groupIndex + 2];
        matrix[i][j] = (red + green + blue) / 3;
      }
    }
    return matrix;
  }

  updateCanvas(matrix) {
    let context = this.canvas.getContext('2d');
    let image = context.getImageData(0, 0, SIZE, SIZE);

    for (let i = 1; i <= SIZE; i++) {
      for (let j = 1; j <= SIZE; j++) {
        let groupIndex = (i - 1) * SIZE * 4 + (j - 1) * 4;
        image.data[groupIndex + 0] = matrix[i][j];
        image.data[groupIndex + 1] = matrix[i][j];
        image.data[groupIndex + 2] = matrix[i][j];
      }
    }

    context.putImageData(image, 0, 0);
  }
}















