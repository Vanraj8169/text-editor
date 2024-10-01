import React, { useEffect, useRef, useState } from "react";
import { Canvas, Textbox } from "fabric";

const TextEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const initCanvas = new Canvas(canvasRef.current, {
      height: 600,
      width: 400,
      backgroundColor: "lightgrey",
    });
    setCanvas(initCanvas);

    // Cleanup function to dispose of the canvas before re-initializing
    return () => {
      initCanvas.dispose();
    };
  }, []);

  // Undo function
  const handleUndo = () => {
    if (currentIndex > 0) {
      canvas.loadFromJSON(history[currentIndex - 1], () => {
        canvas.renderAll();
        setCurrentIndex(currentIndex - 1);
      });
    }
  };

  // Redo function
  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      canvas.loadFromJSON(history[currentIndex + 1], () => {
        canvas.renderAll();
        setCurrentIndex(currentIndex + 1);
      });
    }
  };

  // Function to save state to history for undo/redo
  const saveHistory = () => {
    const canvasJson = JSON.stringify(canvas);
    if (currentIndex < history.length - 1) {
      setHistory(history.slice(0, currentIndex + 1));
    }
    setHistory((prev) => [...prev, canvasJson]);
    setCurrentIndex((prev) => prev + 1);
  };

  // Add text to canvas
  const addText = () => {
    const textBox = new Textbox("Edit me", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      editable: true,
      fill: "black",
    });
    canvas.add(textBox).setActiveObject(textBox);
    saveHistory();
  };

  // Event listeners for object modification to trigger saveHistory
  useEffect(() => {
    if (canvas) {
      canvas.on("object:modified", saveHistory);
    }
  }, [canvas]);

  // Font size change handler
  const changeFontSize = (event) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      activeObject.set("fontSize", parseInt(event.target.value, 10));
      canvas.renderAll();
      saveHistory();
    }
  };

  // Font style change handlers
  const toggleBold = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      const isBold = activeObject.fontWeight === "bold";
      activeObject.set("fontWeight", isBold ? "normal" : "bold");
      canvas.renderAll();
      saveHistory();
    }
  };

  const toggleItalic = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      const isItalic = activeObject.fontStyle === "italic";
      activeObject.set("fontStyle", isItalic ? "normal" : "italic");
      canvas.renderAll();
      saveHistory();
    }
  };

  const toggleUnderline = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      const isUnderlined = activeObject.underline;
      activeObject.set("underline", !isUnderlined);
      canvas.renderAll();
      saveHistory();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {/* Header for Undo/Redo */}
      <div className="flex space-x-4">
        <button
          onClick={handleUndo}
          className="px-4 py-2 bg-gray-200 rounded shadow-md hover:bg-gray-300"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-4 py-2 bg-gray-200 rounded shadow-md hover:bg-gray-300"
        >
          Redo
        </button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="border-2 border-black" />

      {/* Font settings */}
      <div className="flex space-x-4">
        <label>
          Font Size:
          <input
            type="number"
            className="ml-2 p-1 border rounded"
            onChange={changeFontSize}
            defaultValue={20}
          />
        </label>
        <button
          onClick={toggleBold}
          className="px-4 py-2 bg-gray-200 rounded shadow-md hover:bg-gray-300"
        >
          Bold
        </button>
        <button
          onClick={toggleItalic}
          className="px-4 py-2 bg-gray-200 rounded shadow-md hover:bg-gray-300"
        >
          Italic
        </button>
        <button
          onClick={toggleUnderline}
          className="px-4 py-2 bg-gray-200 rounded shadow-md hover:bg-gray-300"
        >
          Underline
        </button>
      </div>

      {/* Add Text Button */}
      <button
        onClick={addText}
        className="px-6 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600"
      >
        Add Text
      </button>
    </div>
  );
};

export default TextEditor;
