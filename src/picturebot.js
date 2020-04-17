const SIZE = 300; //canvas size
const THRESHOLD = 128; //gray
const LEARNING_DATA = []; //decision name mapped to value
let OBJ_PROP = null; 
let OBJ_COUNT = 0;

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
    let context = this.canvas.getContext('2d');
    let image = new Image();
    image.onload = function() {
      // To adjust image aspect ratio to browser
      debugger;
      let min = Math.min(image.width, image.height);

      let startX = (image.width - min) / 2;
      let startY = (image.height - min) / 2;

      context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);     
    }
    image.src = imageURL;
    let pixelArr = context.getImageData( 0, 0, SIZE, SIZE);
    let matrix = this.getGreyScaleMatrix(pixelArr);
    this.processMatrix(matrix);
  }

  learn() {
    let name = document.getElementById("image-name").value;
    if (name == "") {
      alert("Enter a name for this object.");
      return;
    }
    OBJ_COUNT++;
    LEARNING_DATA[OBJ_COUNT] = {
      name: name,
      prop: OBJ_PROP
    }
    console.log(LEARNING_DATA);
    document.getElementById("output").value = name;
    document.getElementById("image-name").value = "";
  }

  handleKeyPress(event) {
    if (event.key == "Enter") {
      this.learn();
    }
  }

  processMatrix(matrix) {
    this.isolateObject(matrix);
    debugger;
    let blackPixels = this.countBlackPixels(matrix);
    console.log("black pixels ", blackPixels)
    let boxArea = SIZE * SIZE;
    console.log("box area", boxArea);
    let fullness = blackPixels / boxArea;

    OBJ_PROP = fullness;


    this.recognize(OBJ_PROP);

    // this.updateCanvas(matrix);
    this.updateData(LEARNING_DATA);
  }
//   processMatrix(matrix) {
//     this.isolateObject(matrix);
//     let box = this.getBoundingBox(matrix);
//     let boxProps = this.getBoundingBoxProps(box);
// debugger;
//     let blackPixels = this.countBlackPixels(matrix);
//     console.log("black pixels ", blackPixels)
//     let boxArea = boxProps.width * boxProps.length;
//     console.log("box area", boxArea);
//     let fullness = blackPixels / boxArea;
//     console.log("aspect ratio", boxProps.aspectRatio);
//     // OBJ_PROP = boxProps.aspectRatio;

//     OBJ_PROP = [];
//     OBJ_PROP[1] = boxProps.aspectRatio;
//     OBJ_PROP[2] = fullness;

//     this.recognize(OBJ_PROP);

//     this.updateCanvas(matrix);
//     this.drawBox(box);
//   }

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
    if (OBJ_COUNT == 0) {
      name = "Not Sure";
    } else {
      let neighbor = this.getNearestNeighbor(currentObject);
      name = neighbor.name;
    }
    document.getElementById("output").innerHTML = name;
  }

  getNearestNeighbor(currentObject) {
    let neighbor = null;
    let minDist = null;
    for (let i = 1; i <= OBJ_COUNT; i++) {
      let dist = Math.abs(currentObject - LEARNING_DATA[i].prop);
      dist = this.distance(currentObject, LEARNING_DATA[i].prop);
      if (minDist == null || minDist > dist) {
        minDist = dist;
        neighbor = LEARNING_DATA[i];
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

  // getBoundingBoxProps(box) {
  //   let props = {
  //     length: 0,
  //     width: 0,
  //     aspectRatio: 0
  //   }
  //   debugger;
  //   //Calculate the actual lenth and width of the image
  //   let deltaX = box.xMax - box.xMin + 1;
  //   let deltaY = box.yMax - box.yMin + 1;

  //   props.length = Math.max(deltaX, deltaY);
  //   props.width = Math.min(deltaX, deltaY);
  //   props.aspectRatio = props.width / props.length;

  //   return props;
  // }

  // getBoundingBox(matrix) {
  //   let box = {
  //     xMin: SIZE + 1,
  //     xMax: 0,
  //     yMin: SIZE + 1,
  //     yMax: 0
  //   }; //301,0,301,0

  //   for (let y = 1; y <= SIZE; y++) {
  //     for (let x = 1; x <= SIZE; x++) {
  //       if (matrix[y][x] == 0) {
  //         box.yMin = Math.min(y, box.yMin);
  //         box.yMax = Math.max(y, box.yMax);
  //         box.xMin = Math.min(x, box.xMin);
  //         box.xMax = Math.max(x, box.xMax);
  //       }
  //     }
  //   }

  //   return box;
  // }

  // drawBox(box) {
  //   let context = this.canvas.getContext('2d');
  //   context.beginPath();
  //   let deltaX = box.xMax - box.xMin;
  //   let deltaY = box.yMax - box.yMin;
  //   context.rect(box.xMin, box.yMin, deltaX, deltaY);
  //   context.stroke();
  // }

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

  //dataArray comes as a single array of 4 values per pixel 
  // [red, green, blue, opacity]
  getGreyScaleMatrix(dataArray) {
    let matrix = [];
    for (let y = 1; y <= SIZE; y++) {
      matrix[y] = [];
      for (let x = 1; x <= SIZE; x++) {
        let pixelIndex = (y - 1) * SIZE * 4 + (x - 1) * 4;
        let red = dataArray[pixelIndex + 0];
        let green = dataArray[pixelIndex + 1];
        let blue = dataArray[pixelIndex + 2];
        matrix[i][j] = (red + green + blue) / 3;
      }
    }
    return matrix;
  }

  updateData(LEARNING_DATA) {
    const listContainer = document.getElementById("learned-list");
    listContainer.innerHTML = LEARNING_DATA.map((record,i) => {
        return <li key={i}>{record.name} : {record.OBJ_PROP}</li>
      })}
  }
  // updateCanvas(matrix) {
  //   let context = this.canvas.getContext('2d');
  //   let image = context.getImageData(0, 0, SIZE, SIZE);

  //   for (let i = 1; i <= SIZE; i++) {
  //     for (let j = 1; j <= SIZE; j++) {
  //       let groupIndex = (i - 1) * SIZE * 4 + (j - 1) * 4;
  //       image.data[groupIndex + 0] = matrix[i][j];
  //       image.data[groupIndex + 1] = matrix[i][j];
  //       image.data[groupIndex + 2] = matrix[i][j];
  //     }
  //   }

  //   context.putImageData(image, 0, 0);
  // }
}















