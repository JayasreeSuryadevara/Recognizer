const SIZE = 300;
let ObjCount = 0;
let ObservedObj = [];
let net;
const classifier = knnClassifier.create();
// const webcamElement = document.getElementById('webcam');
let canvas = document.getElementById('canvas');
canvas.width = SIZE;
canvas.height = SIZE;

async function app() {
  // Load the model.
  net = await mobilenet.load();

  // Create an object from Tensorflow.js data API which could capture image 
  const context = canvas.getContext('2d');
  canvas.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
    drawImage(e.dataTransfer.files);
  });

  canvas.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  const drawImage = (fileList) => {
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
    loadAndDrawImage(imageURL)
  }

  const loadAndDrawImage = (imageURL) => {
    let image = new Image();
    image.onload = function () {
      // To adjust image aspect ratio to browser
      // debugger;
      let min = Math.min(image.width, image.height);

      let startX = (image.width - min) / 2;
      let startY = (image.height - min) / 2;

      context.drawImage(image, startX, startY, min, min, 0, 0, SIZE, SIZE);
      // context.drawImage(image, 0,0)     
    }
    image.src = imageURL;
    addExample();
  }
  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = () => {
    ObjCount++;
    const name = document.getElementById("image-name").value;
    ObservedObj[ObjCount] = name;
  
    let image = tf.browser.fromPixels(canvas);
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(image, true);

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, ObjCount);
    // document.getElementById("learned-list").innerHTML = `
    //   ${ObservedObj.map((model,i) => {
    //     return <li key={i}> {model.label} </li>
    //   })}
    //   `;

    // Dispose the tensor to release the memory.
    image.dispose();
  };

  // When clicking a button, add an example for that class.
  document.getElementById('add-name').addEventListener('click', () => addExample());

  while (true) {
    if (classifier.getNumClasses() > 0) {
      let image = tf.browser.fromPixels(canvas);
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(image, 'conv_preds');
      // Get the most likely class and confidence from the classifier module.
      const result = await classifier.predictClass(activation);

      document.getElementById('output').innerText = `
        prediction: ${ObservedObj[result.label]}\n
        probability: ${result.confidences[result.label]}
      `;
      // Dispose the tensor to release the memory.
      image.dispose();
    }

    await tf.nextFrame();
  }
}
app();