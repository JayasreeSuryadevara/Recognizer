# myVersion
  A simplified Image Recognition software written to understand the concepts of Machine Learning, Neural Networks and AI.
  
# Problem
  The UI has a canvas that will aloow the user to drag and drop an image.
  Want to read the image data, make observations and let the user label the image.
  As the algorithm learn the labels and the observations it tries to label new images dropped onto the canvas.
  The predictions should get more accurate as the data increases
  
 # Solution
  
  Pixelize the image and set a threshold 
    - Pixel data comes in 4 pieces of information - Red, Green, Blue, Alpha
      By Averaging out the R, G, B  values and setting a threshold( 128 = Grey )
      and replacing all values less than threshold with 0 and more to 1
      you can in effect read the image as black and white 0 or 1 matrix

     

  Define minimum bounding box for the image
  Calculate the Aspect Ratio and Mass of the object in the image and store the observations
    - Aspect Ratio = length / width
  
  
