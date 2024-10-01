import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, Underline, Undo, Redo, Type } from "lucide-react";

const TextEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const undo = useCallback(() => {
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        const lastObj = objects[objects.length - 1];
        undoStack.current.push(lastObj);
        canvas.remove(lastObj);
        canvas.renderAll();
        redoStack.current = [];
      }
    }
  }, [canvas]);

  const redo = useCallback(() => {
    if (canvas && undoStack.current.length > 0) {
      const lastUndoObj = undoStack.current.pop();
      canvas.add(lastUndoObj);
      canvas.renderAll();
      redoStack.current.push(lastUndoObj);
    }
  }, [canvas]);

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const newCanvas = new fabric.Canvas(canvasRef.current);
      setCanvas(newCanvas);

      const resizeCanvas = () => {
        const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
        const containerHeight = Math.min(window.innerHeight * 0.7, 800);

        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;

        newCanvas.setWidth(containerWidth);
        newCanvas.setHeight(containerHeight);
        newCanvas.renderAll();
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        newCanvas.dispose();
        setCanvas(null);
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  const addText = () => {
    if (canvas) {
      const text = new fabric.IText("New Text", {
        left: 50,
        top: 50,
        fontFamily: "Arial",
        fontSize: 24,
      });
      canvas.add(text);
      canvas.renderAll();
    }
  };

  const setFont = (font) => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({ fontFamily: font });
      canvas.renderAll();
    }
  };

  const setBold = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({
        fontWeight: activeObject.fontWeight === "bold" ? "normal" : "bold",
      });
      canvas.renderAll();
    }
  };

  const setItalic = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({
        fontStyle: activeObject.fontStyle === "italic" ? "normal" : "italic",
      });
      canvas.renderAll();
    }
  };

  const setUnderline = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set({ underline: !activeObject.underline });
      canvas.renderAll();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-[90vw] mx-auto">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <Button
                onClick={undo}
                variant="outline"
                size="sm"
                className="p-1 sm:p-2"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                size="sm"
                className="p-1 sm:p-2"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <Select onValueChange={setFont}>
                <SelectTrigger className="w-[120px] sm:w-[180px] text-xs sm:text-sm">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Palatino">Palatino</SelectItem>
                  <SelectItem value="Garamond">Garamond</SelectItem>
                  <SelectItem value="Bookman">Bookman</SelectItem>
                  <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                  <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                  <SelectItem value="Arial Black">Arial Black</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={setBold}
                variant="outline"
                size="sm"
                className="p-1 sm:p-2"
              >
                <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                onClick={setItalic}
                variant="outline"
                size="sm"
                className="p-1 sm:p-2"
              >
                <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                onClick={setUnderline}
                variant="outline"
                size="sm"
                className="p-1 sm:p-2"
              >
                <Underline className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div
              className="canvas-container w-full bg-gray-200 rounded-lg overflow-hidden"
              style={{ height: "calc(70vh)" }}
            >
              <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>

            <Button
              onClick={addText}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Type className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextEditor;