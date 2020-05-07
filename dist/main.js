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
/*! no static exports found */
/***/ (function(module, exports) {

eval("const SIZE = 300;\nlet ObjCount = 0;\nlet ObservedObj = [];\nlet net;\nconst classifier = knnClassifier.create();\n// const webcamElement = document.getElementById('webcam');\nlet canvas = document.getElementById('canvas');\ncanvas.width = SIZE;\ncanvas.height = SIZE;\n\nasync function app() {\n  // Load the model.\n  net = await mobilenet.load();\n\n  // Create an object from Tensorflow.js data API which could capture image \n  const context = canvas.getContext('2d');\n  canvas.addEventListener('drop', (e) => {\n    e.stopPropagation();\n    e.preventDefault();\n    drawImage(e.dataTransfer.files);\n  });\n\n  canvas.addEventListener('dragover', (e) => {\n    e.stopPropagation();\n    e.preventDefault();\n    e.dataTransfer.dropEffect = 'copy';\n  });\n\n  const drawImage = (fileList) => {\n    let file = null;\n    let imageURL = null;\n    for (let i = 0; i < fileList.length; i++) {\n      if (fileList[i].type.match(/^image\\//)) {\n        file = fileList[i];\n        break;\n      }\n    }\n    if (file !== null) {\n      imageURL = URL.createObjectURL(file);\n    }\n    loadAndDrawImage(imageURL)\n  }\n\n  const loadAndDrawImage = (imageURL) => {\n    let image = new Image();\n    image.onload = function () {\n      // To adjust image aspect ratio to browser\n      // debugger;\n      let min = Math.min(image.width, image.height);\n\n      let startX = (image.width - min) / 2;\n      let startY = (image.height - min) / 2;\n\n      context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);\n      // context.drawImage(image, 0,0)     \n    }\n    image.src = imageURL;\n    addExample();\n  }\n  // Reads an image from the webcam and associates it with a specific class\n  // index.\n  const addExample = () => {\n    ObjCount++;\n    const name = document.getElementById(\"image-name\").value;\n    ObservedObj[ObjCount] = name;\n  \n    let image = tf.browser.fromPixels(canvas);\n    // Get the intermediate activation of MobileNet 'conv_preds' and pass that\n    // to the KNN classifier.\n    const activation = net.infer(image, true);\n\n    // Pass the intermediate activation to the classifier.\n    classifier.addExample(activation, ObjCount);\n    // document.getElementById(\"learned-list\").innerHTML = `\n    //   ${ObservedObj.map((model,i) => {\n    //     return <li key={i}> {model.label} </li>\n    //   })}\n    //   `;\n\n    // Dispose the tensor to release the memory.\n    image.dispose();\n  };\n\n  // When clicking a button, add an example for that class.\n  document.getElementById('add-name').addEventListener('click', () => addExample());\n\n  while (true) {\n    if (classifier.getNumClasses() > 0) {\n      let image = tf.browser.fromPixels(canvas);\n      // Get the activation from mobilenet from the webcam.\n      const activation = net.infer(image, 'conv_preds');\n      // Get the most likely class and confidence from the classifier module.\n      const result = await classifier.predictClass(activation);\n\n      document.getElementById('output').innerText = `\n        prediction: ${ObservedObj[result.label]}\\n\n        probability: ${result.confidences[result.label]}\n      `;\n      // Dispose the tensor to release the memory.\n      image.dispose();\n    }\n\n    await tf.nextFrame();\n  }\n}\napp();\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });