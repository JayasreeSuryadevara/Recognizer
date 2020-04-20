/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _picturebot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./picturebot */ \"./src/picturebot.js\");\n\n\n// Constant to manipulate canvas width and height (square)\nconst SIZE = 300;\n\n\nconst canvas = document.getElementById('canvas');\ncanvas.width = SIZE;\ncanvas.height = SIZE;\n\n\nnew _picturebot__WEBPACK_IMPORTED_MODULE_0__[\"default\"](canvas);\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/picturebot.js":
/*!***************************!*\
  !*** ./src/picturebot.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return PictureBot; });\nconst SIZE = 300; //canvas size\nconst THRESHOLD = 128; //gray\nconst CURRENT_SAMPLE = 1;\nconst NUM_SAMPLES = 24;\nlet observedObj = []; // map name of obj to analyzed data\nlet analyzed = [] //analyzed obj size and mass\nlet objCount = 0;\n\nclass PictureBot {\n  constructor(canvas) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext(\"2d\");\n    this.listenToImageDrop();\n    this.startEvents();\n  }\n\n  listenToImageDrop() {\n    this.canvas.addEventListener('drop', (e) => {\n      e.stopPropagation();\n      e.preventDefault();\n\n      this.drawImage(e.dataTransfer.files);\n    });\n\n    this.canvas.addEventListener('dragover', (e) => {\n      e.stopPropagation();\n      e.preventDefault();\n\n      e.dataTransfer.dropEffect = 'copy';\n    });\n  }\n\n  startEvents() {\n    const sampleButton = document.getElementById(\"sampler\");\n    sampleButton.addEventListener(\"click\", () => { this.browseSamples() });\n    const learnButton = document.getElementById(\"button\");\n    learnButton.addEventListener(\"click\" , () => { this.learn() });\n    const inputField = document.getElementById(\"image-name\");\n    inputField.addEventListener(\"keyup\", (e) => { this.handleKeyPress(e) });\n  }\n\n  drawImage(fileList) {\n    let file = null;\n    let imageURL = null;\n    for (let i = 0; i < fileList.length; i++) {\n      if (fileList[i].type.match(/^image\\//)) {\n        file = fileList[i];\n        break;\n      }\n    }\n    if (file !== null) {\n      imageURL = URL.createObjectURL(file);\n    }\n    this.loadAndDrawImage(imageURL)\n  }\n\n  loadAndDrawImage(imageURL) {\n    let context = this.canvas.getContext('2d');\n    let image = new Image();\n    image.onload = function() {\n      // To adjust image aspect ratio to browser\n      // debugger;\n      // let min = Math.min(image.width, image.height);\n\n      // let startX = (image.width - min) / 2;\n      // let startY = (image.height - min) / 2;\n\n      // context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);\n      context.drawImage(image, 0,0)     \n    }\n    image.src = imageURL;\n    let pixelArr = context.getImageData( 0, 0, SIZE, SIZE);\n    // console.log(\"pixelArray\", pixelArr);\n    let matrix = this.getGreyScaleMatrix(pixelArr);\n    // console.log(\"matrix\", matrix);\n    // debugger;\n    this.processMatrix(matrix);\n  }\n\n  learn() {\n    document.getElementById(\"output\").innerHTML = \"Got it!\"\n    let name = document.getElementById(\"image-name\").value;\n    if (name == \"\") {\n      alert(\"Enter a name for this object.\");\n      return;\n    }\n    objCount++;\n    observedObj[objCount] = {\n      name: name,\n      props: analyzed\n    }\n    console.log(observedObj);\n    document.getElementById(\"output\").value = name;\n    document.getElementById(\"image-name\").value = \"\";\n  }\n\n  handleKeyPress(event) {\n    if (event.key == \"Enter\") {\n      this.learn();\n    }\n  }\n\n  browseSamples() {\n    document.getElementById(\"controls\").style.display = \"block\";\n    this.processSample(CURRENT_SAMPLE);\n  }\n\n  processSample(num) {\n    CURRENT_SAMPLE = num;\n    let image = new Image();\n    image.src = \"/samples\" + CURRENT_SAMPLE + \".jpeg\";\n    this.ctx.clearRect(0,0,SIZE,SIZE);\n    var location = {\n      x: SIZE / 2,\n      y: SIZE / 2\n    }\n    drawText(LOADING, SIZE / 8, this.ctx, location);\n\n    image.onload = function () {\n      // takes time to load; when complete, draw and process the image\n      this.ctx.drawImage(image, 0, 0);\n      let pixelArr = this.ctx.getImageData(0, 0, SIZE, SIZE);\n      let matrix = this.getGreyScaleMatrix(pixelArr);\n      this.processMatrix(matrix);\n    };\n\n    updateControlls();\n  }\n\n  updateControlls() {\n    // disable back button if viewing first sample\n    if (CURRENT_SAMPLE <= 1) {\n      document.getElementById(\"back\").disabled = true;\n    } else {\n      document.getElementById(\"back\").disabled = false;\n    }\n\n    // disable forward button if viewing last sample\n    if (CURRENT_SAMPLE == NUM_SAMPLES) {\n      document.getElementById(\"forward\").disabled = true;\n    } else {\n      document.getElementById(\"forward\").disabled = false;\n    }\n\n    // showing the number of the current sample\n    document.getElementById(\"sample\").innerHTML =\n      CURRENT_SAMPLE + \" / \" + NUM_SAMPLES;\n  }\n\n  processMatrix(matrix) {\n    this.applyThreshold(matrix);\n    const boundingBox = this.getBoundingBox(matrix);\n    const boxProps = this.getBBoxProps(boundingBox);\n    let blackPixels = this.countBlackPixels(matrix);\n\n    const aspectRatio = boxProps.width / boxProps.length;\n    console.log(\"ar\",aspectRatio);\n    analyzed[0] = aspectRatio;\n    const mass = (blackPixels / boxProps.area).toFixed(5);\n    console.log(\"mass\", mass);\n    analyzed[1] = mass;\n\n    this.findObject(analyzed);\n\n    this.updateData(observedObj);\n  }\n\n  countBlackPixels(matrix) {\n    let count = 0;\n    for (let i = 1; i <= SIZE; i++) {\n      for (let j = 1; j <= SIZE; j++) {\n        if (matrix[i][j] == 0) {\n          count++;\n        }\n      }\n    }\n    return count;\n  }\n\n  findObject(currentObject) {\n    let name;\n    if (objCount == 0) {\n      name = \"Not Sure\";\n    } else {\n      let neighbor = this.getNearestNeighbor(currentObject);\n      if (neighbor) name = neighbor.name;\n    }\n    document.getElementById(\"output\").innerHTML = name;\n  }\n\n  getNearestNeighbor(currentObject) {\n    let neighbor = null;\n    let minDist = null;\n    for (let i = 1; i <= objCount; i++) {\n      let dist = Math.abs(currentObject - observedObj[i].props);\n      dist = this.distance(currentObject, observedObj[i].props);\n      if (minDist == null || minDist > dist) {\n        minDist = dist;\n        neighbor = observedObj[i];\n      }\n    }\n    return neighbor;\n  }\n\n  distance(p1, p2) {\n    let dist = 0;\n    for (let i = 1; i <= 2; i++) {\n      dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);\n    }\n    return Math.sqrt(dist);\n  }\n\n  getBBoxProps(box) {\n    let props = {\n      length: 0,\n      width: 0,\n      area: 0\n    }\n    //Calculate the actual lenth and width of the image\n    let deltaX = box.xMax - box.xMin + 1;\n    let deltaY = box.yMax - box.yMin + 1;\n\n    props.length = Math.max(deltaX, deltaY);\n    props.width = Math.min(deltaX, deltaY);\n    props.area = props.width * props.length;\n\n    return props;\n  }\n\n  getBoundingBox(matrix) {\n    let box = {\n      xMin: SIZE + 1,\n      xMax: 0,\n      yMin: SIZE + 1,\n      yMax: 0\n    }; //301,0,301,0\n\n    for (let i = 1; i <= SIZE; i++) {\n      for (let j = 1; j <= SIZE; j++) {\n        if (matrix[i][j] == 0) {\n          box.yMin = Math.min(i, box.yMin);\n          box.yMax = Math.max(i, box.yMax);\n          box.xMin = Math.min(j, box.xMin);\n          box.xMax = Math.max(j, box.xMax);\n        }\n      }\n    }\n\n    return box;\n  }\n\n  applyThreshold(matrix) {\n    for (let i = 1; i <= SIZE; i++) {\n      for (let j = 1; j <= SIZE; j++) {\n        if (matrix[i][j] < THRESHOLD) {\n          matrix[i][j] = 0;\n        } else {\n          matrix[i][j] = 255;\n        }\n      }\n    }\n  }\n\n  //dataArray comes as a single array of 4 values per pixel \n  // [red, green, blue, opacity]\n  getGreyScaleMatrix(dataArray) {\n    let matrix = [];\n    for (let y = 1; y <= SIZE; y++) {\n      matrix[y] = [];\n      for (let x = 1; x <= SIZE; x++) {\n        let pixelIndex = (y - 1) * SIZE * 4 + (x - 1) * 4;\n        let red = dataArray.data[pixelIndex + 0];\n        let green = dataArray.data[pixelIndex + 1];\n        let blue = dataArray.data[pixelIndex + 2];\n        matrix[y][x] = (red + green + blue) / 3;\n      }\n    }\n    return matrix;\n  }\n\n  updateData(observedObj) {\n    const listContainer = document.getElementById(\"learned-list\");\n    listContainer.innerHTML = observedObj.map((record,i) => {\n      return `<li key=${i}>${record.name}</li>`\n    }).join(\"\");\n  }\n\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n//# sourceURL=webpack:///./src/picturebot.js?");

/***/ })

/******/ });