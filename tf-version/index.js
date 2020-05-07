let ObjCount = 0;
let ObservedObj = [];
let net;
const classifier = knnClassifier.create();
const webcamElement = document.getElementById('webcam');

async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Successfully loaded model');

  // Create an object from Tensorflow.js data API which could capture image 
  // from the web camera as Tensor.
  const webcam = await tf.data.webcam(webcamElement);

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = async () => {
    ObjCount++;
    const name = document.getElementById("image-name").value;
    ObservedObj[ObjCount] = name;
    // Capture an image from the web camera.
    const img = await webcam.capture();

    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(img, true);

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, ObjCount);
    // document.getElementById("learned-list").innerHTML = 
    //   {ObservedObj.map(each => {
    //     <li key={each.index}>{each.name}</li>
    //   })}
    
    // Dispose the tensor to release the memory.
    img.dispose();
  };

  // When clicking a button, add an example for that class.
  document.getElementById('add-name').addEventListener('click', () => addExample());

  while (true) {
    if (classifier.getNumClasses() > 0) {
      const img = await webcam.capture();

      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(img, 'conv_preds');
      // Get the most likely class and confidence from the classifier module.
      const result = await classifier.predictClass(activation);

      document.getElementById('output').innerText = `
        prediction: ${ObservedObj[result.label]}\n
        probability: ${result.confidences[result.label]}
      `;

      // Dispose the tensor to release the memory.
      img.dispose();
    }

    await tf.nextFrame();
  }
}
app();