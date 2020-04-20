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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return PictureBot; });\nconst SIZE = 300; //canvas size\nconst THRESHOLD = 128; //gray\nconst LEARNING_DATA = []; //decision name mapped to value\nlet OBJ_RATIO = 0;\nlet OBJ_COUNT = 0;\n\nclass PictureBot {\n  constructor(canvas) {\n    this.canvas = canvas;\n    this.ctx = canvas.getContext(\"2d\");\n    this.listenToImageDrop();\n    this.startEvents();\n  }\n\n  listenToImageDrop() {\n    this.canvas.addEventListener('drop', (e) => {\n      e.stopPropagation();\n      e.preventDefault();\n\n      this.drawImage(e.dataTransfer.files);\n    });\n\n    this.canvas.addEventListener('dragover', (e) => {\n      e.stopPropagation();\n      e.preventDefault();\n\n      e.dataTransfer.dropEffect = 'copy';\n    });\n  }\n\n  startEvents() {\n    const learnButton = document.getElementById(\"button\");\n    learnButton.addEventListener(\"click\" , () => { this.learn(); });\n    const inputField = document.getElementById(\"image-name\");\n    inputField.addEventListener(\"keyup\", (e) => { this.handleKeyPress(e); });\n  }\n\n  drawImage(fileList) {\n    let file = null;\n    let imageURL = null;\n    for (let i = 0; i < fileList.length; i++) {\n      if (fileList[i].type.match(/^image\\//)) {\n        file = fileList[i];\n        break;\n      }\n    }\n    if (file !== null) {\n      imageURL = URL.createObjectURL(file);\n    }\n    this.loadAndDrawImage(imageURL)\n  }\n\n  loadAndDrawImage(imageURL) {\n    let context = this.canvas.getContext('2d');\n    let image = new Image();\n    image.onload = function() {\n      // To adjust image aspect ratio to browser\n      // debugger;\n      let min = Math.min(image.width, image.height);\n\n      let startX = (image.width - min) / 2;\n      let startY = (image.height - min) / 2;\n\n      context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);     \n    }\n    image.src = imageURL;\n    let pixelArr = context.getImageData( 0, 0, SIZE, SIZE);\n    // console.log(\"pixelArray\", pixelArr);\n    let matrix = this.getGreyScaleMatrix(pixelArr);\n    // console.log(\"matrix\", matrix);\n    // debugger;\n    this.processMatrix(matrix);\n  }\n\n  learn() {\n    let name = document.getElementById(\"image-name\").value;\n    if (name == \"\") {\n      alert(\"Enter a name for this object.\");\n      return;\n    }\n    OBJ_COUNT++;\n    LEARNING_DATA[OBJ_COUNT] = {\n      name: name,\n      ratio: OBJ_RATIO\n    }\n    console.log(LEARNING_DATA);\n    document.getElementById(\"output\").value = name;\n    document.getElementById(\"image-name\").value = \"\";\n  }\n\n  handleKeyPress(event) {\n    if (event.key == \"Enter\") {\n      this.learn();\n    }\n  }\n\n  processMatrix(matrix) {\n    this.isolateObject(matrix);\n    let blackPixels = this.countBlackPixels(matrix);\n    console.log(\"black pixels \", blackPixels);\n    let boxArea = SIZE * SIZE;\n    console.log(\"box area\", boxArea);\n    OBJ_RATIO = blackPixels / boxArea;\n\n    // OBJ_PROP = fullness;\n\n\n    this.recognize(OBJ_RATIO);\n\n    this.updateData(LEARNING_DATA);\n  }\n//   processMatrix(matrix) {\n//     this.isolateObject(matrix);\n//     let box = this.getBoundingBox(matrix);\n//     let boxProps = this.getBoundingBoxProps(box);\n// debugger;\n//     let blackPixels = this.countBlackPixels(matrix);\n//     console.log(\"black pixels \", blackPixels)\n//     let boxArea = boxProps.width * boxProps.length;\n//     console.log(\"box area\", boxArea);\n//     let fullness = blackPixels / boxArea;\n//     console.log(\"aspect ratio\", boxProps.aspectRatio);\n//     // OBJ_PROP = boxProps.aspectRatio;\n\n//     OBJ_PROP = [];\n//     OBJ_PROP[1] = boxProps.aspectRatio;\n//     OBJ_PROP[2] = fullness;\n\n//     this.recognize(OBJ_PROP);\n\n//     this.updateCanvas(matrix);\n//     this.drawBox(box);\n//   }\n\n  countBlackPixels(matrix) {\n    let count = 0;\n    for (let i = 1; i <= SIZE; i++) {\n      for (let j = 1; j <= SIZE; j++) {\n        if (matrix[i][j] == 0) {\n          count++;\n        }\n      }\n    }\n    return count;\n  }\n\n  recognize(currentObject) {\n    let name;\n    if (OBJ_COUNT == 0) {\n      name = \"Not Sure\";\n    } else {\n      let neighbor = this.getNearestNeighbor(currentObject);\n      name = neighbor.name;\n    }\n    document.getElementById(\"output\").innerHTML = name;\n  }\n\n  getNearestNeighbor(currentObject) {\n    let neighbor = null;\n    let minDist = null;\n    for (let i = 1; i <= OBJ_COUNT; i++) {\n      let dist = Math.abs(currentObject - LEARNING_DATA[i].ratio);\n      dist = this.distance(currentObject, LEARNING_DATA[i].ratio);\n      if (minDist == null || minDist > dist) {\n        minDist = dist;\n        neighbor = LEARNING_DATA[i];\n      }\n    }\n    return neighbor;\n  }\n\n  distance(p1, p2) {\n    let dist = 0;\n    for (let i = 1; i <= 2; i++) {\n      dist += (p1[i] - p2[i]) * (p1[i] - p2[i]);\n    }\n    return Math.sqrt(dist);\n  }\n\n  // getBoundingBoxProps(box) {\n  //   let props = {\n  //     length: 0,\n  //     width: 0,\n  //     aspectRatio: 0\n  //   }\n  //   debugger;\n  //   //Calculate the actual lenth and width of the image\n  //   let deltaX = box.xMax - box.xMin + 1;\n  //   let deltaY = box.yMax - box.yMin + 1;\n\n  //   props.length = Math.max(deltaX, deltaY);\n  //   props.width = Math.min(deltaX, deltaY);\n  //   props.aspectRatio = props.width / props.length;\n\n  //   return props;\n  // }\n\n  // getBoundingBox(matrix) {\n  //   let box = {\n  //     xMin: SIZE + 1,\n  //     xMax: 0,\n  //     yMin: SIZE + 1,\n  //     yMax: 0\n  //   }; //301,0,301,0\n\n  //   for (let y = 1; y <= SIZE; y++) {\n  //     for (let x = 1; x <= SIZE; x++) {\n  //       if (matrix[y][x] == 0) {\n  //         box.yMin = Math.min(y, box.yMin);\n  //         box.yMax = Math.max(y, box.yMax);\n  //         box.xMin = Math.min(x, box.xMin);\n  //         box.xMax = Math.max(x, box.xMax);\n  //       }\n  //     }\n  //   }\n\n  //   return box;\n  // }\n\n  // drawBox(box) {\n  //   let context = this.canvas.getContext('2d');\n  //   context.beginPath();\n  //   let deltaX = box.xMax - box.xMin;\n  //   let deltaY = box.yMax - box.yMin;\n  //   context.rect(box.xMin, box.yMin, deltaX, deltaY);\n  //   context.stroke();\n  // }\n\n  isolateObject(matrix) {\n    for (let i = 1; i <= SIZE; i++) {\n      for (let j = 1; j <= SIZE; j++) {\n        if (matrix[i][j] < THRESHOLD) {\n          matrix[i][j] = 0;\n        } else {\n          matrix[i][j] = 255;\n        }\n      }\n    }\n  }\n\n  //dataArray comes as a single array of 4 values per pixel \n  // [red, green, blue, opacity]\n  getGreyScaleMatrix(dataArray) {\n    let matrix = [];\n    for (let y = 1; y <= SIZE; y++) {\n      matrix[y] = [];\n      for (let x = 1; x <= SIZE; x++) {\n        let pixelIndex = (y - 1) * SIZE * 4 + (x - 1) * 4;\n        let red = dataArray.data[pixelIndex + 0];\n        let green = dataArray.data[pixelIndex + 1];\n        let blue = dataArray.data[pixelIndex + 2];\n        matrix[y][x] = (red + green + blue) / 3;\n      }\n    }\n    return matrix;\n  }\n\n  updateData(LEARNING_DATA) {\n    const listContainer = document.getElementById(\"learned-list\");\n    listContainer.innerHTML = LEARNING_DATA.map((record,i) => {\n      return `<li key=${i}>${record.name} : ${record.ratio}</li>`\n    }).join(\"\");\n  }\n  // updateCanvas(matrix) {\n  //   let context = this.canvas.getContext('2d');\n  //   let image = context.getImageData(0, 0, SIZE, SIZE);\n\n  //   for (let i = 1; i <= SIZE; i++) {\n  //     for (let j = 1; j <= SIZE; j++) {\n  //       let groupIndex = (i - 1) * SIZE * 4 + (j - 1) * 4;\n  //       image.data[groupIndex + 0] = matrix[i][j];\n  //       image.data[groupIndex + 1] = matrix[i][j];\n  //       image.data[groupIndex + 2] = matrix[i][j];\n  //     }\n  //   }\n\n  //   context.putImageData(image, 0, 0);\n  // }\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n//# sourceURL=webpack:///./src/picturebot.js?");

/***/ })

/******/ });