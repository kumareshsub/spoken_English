// // Required dependencies: react, antd, xlsx, react-dnd, react-dnd-html5-backend

// import React, { useState } from "react";
// import { Upload, Button, Pagination, Card } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import * as XLSX from "xlsx";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";

// const TYPE = "word";

// const DraggableWord = ({ word }) => {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: TYPE,
//     item: { word },
//     collect: (monitor) => ({ isDragging: monitor.isDragging() }),
//   }));
//   return (
//     <span
//       ref={drag}
//       style={{
//         display: "inline-block",
//         margin: 4,
//         padding: 8,
//         border: "1px solid #ccc",
//         borderRadius: 4,
//         backgroundColor: isDragging ? "#ddd" : "#fafafa",
//         cursor: "move",
//       }}
//     >
//       {word}
//     </span>
//   );
// };

// const DropZone = ({ onDrop, filledWord }) => {
//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: TYPE,
//     drop: (item) => onDrop(item.word),
//     collect: (monitor) => ({ isOver: monitor.isOver() }),
//   }));

//   return (
//     <span
//       ref={drop}
//       style={{
//         display: "inline-block",
//         minWidth: 80,
//         borderBottom: "2px solid #000",
//         margin: "0 4px",
//         padding: "0 8px",
//         backgroundColor: isOver ? "#e0ffe0" : undefined,
//       }}
//     >
//       {filledWord || "____"}
//     </span>
//   );
// };

// const Question = ({ data, index, filledWord, onDrop }) => {
//   const normalizedSentence = data.question.replace(/_+/g, "[blank]");
//   const sentenceParts = normalizedSentence.split("[blank]");

//   return (
//     <Card style={{ marginBottom: 16 }}>
//       <p>
//         {sentenceParts[0]}
//         <DropZone onDrop={onDrop} filledWord={filledWord} />
//         {sentenceParts[1] || ""}
//       </p>
//       <div>
//         {data.options.map((option, i) => (
//           <DraggableWord word={option} key={i} />
//         ))}
//       </div>
//     </Card>
//   );
// };

// const App = () => {
//   const [questions, setQuestions] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filledWords, setFilledWords] = useState({});
//   const pageSize = 5;

//   const handleExcelUpload = (file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const workbook = XLSX.read(e.target.result, { type: "binary" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       const parsed = data.slice(1).map((row) => ({
//         question: row[0],
//         answer: row[1],
//         options: [row[2], row[3], row[4], row[5]].filter(Boolean),
//       }));
//       setQuestions(parsed);
//     };
//     reader.readAsBinaryString(file);
//     return false;
//   };

//   const paginatedQuestions = questions.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div style={{ padding: 24 }}>
//         <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
//           <Button icon={<UploadOutlined />}>Upload Excel File</Button>
//         </Upload>

//         <div style={{ marginTop: 24 }}>
//           {paginatedQuestions.map((q, idx) => {
//             const globalIndex = (currentPage - 1) * pageSize + idx;
//             return (
//               <Question
//                 key={globalIndex}
//                 data={q}
//                 index={globalIndex}
//                 filledWord={filledWords[globalIndex] || null}
//                 onDrop={(word) =>
//                   setFilledWords((prev) => ({ ...prev, [globalIndex]: word }))
//                 }
//               />
//             );
//           })}
//         </div>

//         {questions.length > pageSize && (
//           <Pagination
//             current={currentPage}
//             pageSize={pageSize}
//             total={questions.length}
//             onChange={(page) => setCurrentPage(page)}
//             style={{ marginTop: 24, textAlign: "center" }}
//           />
//         )}
//       </div>
//     </DndProvider>
//   );
// };

// export default App;

import React, { useState } from "react";
import { Button, Card } from "antd";
import * as XLSX from "xlsx";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import "./styles.css";

const DraggableWord = ({ word, id }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    padding: "4px 8px",
    margin: "4px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "move",
    display: "inline-block",
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {word}
    </div>
  );
};

const DroppableInput = ({ id, words }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="droppable-box">
      {words.map((word, index) => (
        <span key={index} className="dropped-word">
          {word}
        </span>
      ))}
    </div>
  );
};

function App() {
  const [excelData, setExcelData] = useState([]);
  const [inputWords, setInputWords] = useState({});
  const [currentPage, setCurrentPage] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const rows = data.slice(1).map((row) => ({
        question: row[0],
        positive: row[1],
        negative: row[2],
        words: row[3]?.split(/[\s,]+/).filter(Boolean) || [],
      }));

      const initInputs = {};
      rows.forEach((_, i) => {
        initInputs[i] = { pos: [], neg: [] };
      });

      setExcelData(rows);
      setInputWords(initInputs);
      setCurrentPage(0);
    };

    reader.readAsBinaryString(file);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!active || !over) return;

    const wordId = active.id; // "0-the-1"
    const [srcIndexStr, word] = wordId.split("-");
    const [targetIndexStr, type] = over.id.split("-");

    const srcIndex = parseInt(srcIndexStr);
    const targetIndex = parseInt(targetIndexStr);

    if (srcIndex !== targetIndex) return;

    const correctAnswer =
      (type === "pos"
        ? excelData[targetIndex].positive
        : excelData[targetIndex].negative) || "";

    const correctWords = correctAnswer.split(" ").filter(Boolean);
    const existingWords = inputWords[targetIndex][type] || [];
    const updatedWords = [...existingWords, word];

    for (let i = 0; i < updatedWords.length; i++) {
      if (updatedWords[i] !== correctWords[i]) return; // Reject if not matching
    }

    setInputWords((prev) => ({
      ...prev,
      [targetIndex]: {
        ...prev[targetIndex],
        [type]: updatedWords,
      },
    }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Drag-and-Drop Sentence Builder</h2>
      <input type="file" onChange={handleFileUpload} />

      {excelData.length > 0 && (
        <DndContext onDragEnd={handleDragEnd}>
          {excelData.slice(currentPage * 5, currentPage * 5 + 5).map((item, i) => {
            const index = currentPage * 5 + i;
            return (
              <Card key={index} title={`Q${index + 1}: ${item.question}`} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <strong>Positive:</strong>
                    <DroppableInput id={`${index}-pos`} words={inputWords[index]?.pos || []} />
                  </div>
                  <div>
                    <strong>Negative:</strong>
                    <DroppableInput id={`${index}-neg`} words={inputWords[index]?.neg || []} />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <strong>Available Words:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
                    {item.words.map((word, wIdx) => (
                      <DraggableWord
                        word={word}
                        key={`${index}-${word}-${wIdx}`}
                        id={`${index}-${word}-${wIdx}`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}

          <div style={{ marginTop: 20 }}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={(currentPage + 1) * 5 >= excelData.length}
              style={{ marginLeft: 10 }}
            >
              Next
            </Button>
          </div>
        </DndContext>
      )}
    </div>
  );
}

export default App;