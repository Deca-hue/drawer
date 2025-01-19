const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const opacitySlider = document.getElementById('opacity');
    const eraserTool = document.getElementById('eraserTool');
    const brushTool = document.getElementById('brushTool');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const clearCanvas = document.getElementById('clearCanvas');
    const drawRectangle = document.getElementById('drawRectangle');
    const drawCircle = document.getElementById('drawCircle');
    const textTool = document.getElementById('textTool');
    const uploadImage = document.getElementById('uploadImage');

    let isDrawing = false;
    let drawingMode = 'brush'; // 'brush', 'rectangle', 'circle', 'text'
    let isErasing = false;
    let startX = 0, startY = 0;
    let undoStack = [];
    let redoStack = [];

    // Save the current canvas state to the undo stack
    function saveState() {
      undoStack.push(canvas.toDataURL());
      redoStack = [];
    }

    // Restore canvas state from an image
    function restoreState(stack) {
      if (stack.length > 0) {
        const img = new Image();
        img.src = stack.pop();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }

    // Drawing Functions
    function draw(e) {
      if (!isDrawing) return;

      ctx.globalAlpha = parseFloat(opacitySlider.value);
      ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;
      ctx.lineWidth = brushSize.value;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      [startX, startY] = [e.offsetX, e.offsetY];
    }

    function drawShape(e) {
      if (!isDrawing) return;

      // Save the current canvas state before drawing
      restoreCanvas();

      ctx.globalAlpha = parseFloat(opacitySlider.value);
      ctx.lineWidth = brushSize.value;
      ctx.strokeStyle = colorPicker.value;

      ctx.beginPath();
      if (drawingMode === 'rectangle') {
        const width = e.offsetX - startX;
        const height = e.offsetY - startY;
        ctx.rect(startX, startY, width, height);
      } else if (drawingMode === 'circle') {
        const radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2));
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    function restoreCanvas() {
      const img = new Image();
      img.src = undoStack[undoStack.length - 1];
      img.onload = () => ctx.drawImage(img, 0, 0);
    }

    function addText(e) {
      const text = prompt('Enter your text:');
      if (text) {
        saveState();
        ctx.font = `${brushSize.value * 4}px Arial`;
        ctx.fillStyle = colorPicker.value;
        ctx.globalAlpha = parseFloat(opacitySlider.value);
        ctx.fillText(text, e.offsetX, e.offsetY);
      }
    }

    // Event Listeners
    canvas.addEventListener('mousedown', (e) => {
      saveState();
      isDrawing = true;
      [startX, startY] = [e.offsetX, e.offsetY];

      if (drawingMode === 'text') {
        addText(e);
        isDrawing = false;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (drawingMode === 'brush') draw(e);
      if (drawingMode === 'rectangle' || drawingMode === 'circle') drawShape(e);
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);

    // Toolbar Buttons
    eraserTool.addEventListener('click', () => {
      isErasing = true;
      drawingMode = 'brush';
    });

    brushTool.addEventListener('click', () => {
      isErasing = false;
      drawingMode = 'brush';
    });

    drawRectangle.addEventListener('click', () => {
      drawingMode = 'rectangle';
      isErasing = false;
    });

    drawCircle.addEventListener('click', () => {
      drawingMode = 'circle';
      isErasing = false;
    });

    textTool.addEventListener('click', () => {
      drawingMode = 'text';
    });

    undoButton.addEventListener('click', () => restoreState(undoStack));
    redoButton.addEventListener('click', () => restoreState(redoStack));

    clearCanvas.addEventListener('click', () => {
      saveState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    uploadImage.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          saveState();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    });