import React, { useState } from "react";
import { Button, Card } from "antd";
import * as XLSX from "xlsx";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { ArrowLeftOutlined } from "@ant-design/icons";


const DraggableWord = ({ word, id }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                display: "inline-block",
                padding: "4px 8px",
                margin: "4px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "move",
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
            }}
        >
            {word}
        </div>
    );
};

const DroppableInput = ({ id, words }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                border: "1px dashed #888",
                minHeight: 30,
                padding: 6,
                minWidth: 200,
                backgroundColor: "#fff",
                marginTop: 4,
            }}
        >
            {words.map((word, i) => (
                <span key={i} style={{ marginRight: 4 }}>
                    {word}
                </span>
            ))}
        </div>
    );
};

const SentenceBuilderPage = ({ goHome }) => {
    const [excelData, setExcelData] = useState([]);
    const [inputWords, setInputWords] = useState({});
    const [currentPage, setCurrentPage] = useState(0);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const rows = data.slice(1).map((row) => {
                const positiveWords = row[1]?.split(/\s+/).map((w) => w.replace(/[.,?]/g, "").trim()) || [];
                const negativeWords = row[2]?.split(/\s+/).map((w) => w.replace(/[.,?]/g, "").trim()) || [];

                const uniqueWords = Array.from(new Set([...positiveWords, ...negativeWords]));

                return {
                    question: row[0],
                    positive: row[1],
                    negative: row[2],
                    words: uniqueWords,
                };
            });

            const inputs = {};
            rows.forEach((_, i) => {
                inputs[i] = { pos: [], neg: [] };
            });

            setExcelData(rows);
            setInputWords(inputs);
        };

        reader.readAsBinaryString(file);
    };


    const handleDragEnd = ({ active, over }) => {
        if (!active || !over) return;

        const [indexStr, word] = active.id.split("-");
        const [targetIndexStr, type] = over.id.split("-");
        const index = parseInt(indexStr);
        const targetIndex = parseInt(targetIndexStr);

        if (index !== targetIndex) return;

        const correctSentence = type === "pos" ? excelData[index].positive : excelData[index].negative;
        const correctWords = correctSentence.split(/\s+/).map((w) => w.replace(/[.,?]/g, "").trim());

        const currentWords = inputWords[index][type];

        // Don't allow more words if the sentence is already complete
        if (currentWords.length >= correctWords.length) return;

        const updated = [...currentWords, word];

        // Validate current input with correct sentence word by word
        for (let i = 0; i < updated.length; i++) {
            if (updated[i] !== correctWords[i]) return; // If word is incorrect, reject drop
        }

        setInputWords((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                [type]: updated,
            },
        }));
    };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={goHome}
                    style={{ marginBottom: 20 }}
                >
                    Back to Home
                </Button>
            </div>

            <h2 style={{ marginTop: 10 }}>Sentence Builder</h2>
            <input type="file" onChange={handleFileUpload} style={{ marginBottom: 20 }} />

            {excelData.length > 0 && (
                <DndContext onDragEnd={handleDragEnd}>
                    {excelData.slice(currentPage * 5, currentPage * 5 + 5).map((item, i) => {
                        const index = currentPage * 5 + i;

                        return (
                            <Card
  key={index}
  title={`Q${index + 1}: ${item.question}`}
  style={{ marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}
>
  <div style={{ marginBottom: 10, display: 'flex', gap: '40px', alignItems: 'center' }}>
    <div>
      <strong>Positive:</strong>
      <DroppableInput id={`${index}-pos`} words={inputWords[index]?.pos || []} />
    </div>
    <div>
      <strong>Negative:</strong>
      <DroppableInput id={`${index}-neg`} words={inputWords[index]?.neg || []} />
    </div>
  </div>

  <div style={{ marginTop: 8 }}>
    {item.words.map((w, wi) => (
      <DraggableWord key={`${index}-${w}-${wi}`} word={w} id={`${index}-${w}`} />
    ))}
  </div>
</Card>

                        );
                    })}

                    <div>
                        <Button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>Previous</Button>
                        <Button
                            style={{ marginLeft: 10 }}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={(currentPage + 1) * 5 >= excelData.length}
                        >
                            Next
                        </Button>
                    </div>
                </DndContext>
            )}
        </div>
    );
};

export default SentenceBuilderPage;
