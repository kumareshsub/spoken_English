import React, { useState } from "react";
import { Upload, Button, Card } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const DraggableWord = ({ word, id }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <span
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                display: "inline-block",
                padding: "4px 8px",
                margin: 4,
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
                cursor: "move",
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
            }}
        >
            {word}
        </span>
    );
};

const DropZone = ({ word, expected, onDrop, questionTemplate, questionIndex }) => {
    const { setNodeRef } = useDroppable({ id: `drop-${questionIndex}` });

    const [error, setError] = useState(false);

    const handleDrop = (draggedWord) => {
        const attempt = questionTemplate.replace(/_+/, draggedWord).trim();
        const correct = questionTemplate.replace(/_+/, expected).trim();
      
        if (attempt === correct) {
          onDrop(draggedWord);
        } else {
          setError(true);
          setTimeout(() => setError(false), 800);
        }
      };
      
    return (
        <span
            ref={setNodeRef}
            style={{
                borderBottom: "2px solid black",
                minWidth: 60,
                padding: "2px 8px",
                backgroundColor: error ? "#ffcccc" : "#fff",
            }}
        >
            {word || "____"}
        </span>
    );
};

const FillInTheBlankPage = ({ goHome }) => {
    const [questions, setQuestions] = useState([]);
    const [filledWords, setFilledWords] = useState({});
    const [page, setPage] = useState(0);
    const pageSize = 5;

    const handleUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wb = XLSX.read(e.target.result, { type: "binary" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const parsed = rows.slice(1).map((row) => ({
                question: row[0],
                answer: row[1],
                options: [row[2], row[3], row[4], row[5]].filter(Boolean),
            }));

            setQuestions(parsed);
        };
        reader.readAsBinaryString(file);
        return false;
    };

    const handleDragEnd = ({ active, over }) => {
        if (!active || !over) return;
        const index = parseInt(over.id.split("-")[1]);
        const draggedWord = active.id.split("-")[1];

        const template = questions[index].question;
        const correct = questions[index].answer;
        const attempt = template.replace(/_+/, draggedWord).trim();
        const expected = template.replace(/_+/, correct).trim();

        if (attempt === expected) {
            setFilledWords((prev) => ({ ...prev, [index]: draggedWord }));
        }
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

            <h2 style={{ marginTop: 10 }}>Fill in the Blank</h2>
            <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload Excel</Button>
            </Upload>

            <DndContext onDragEnd={handleDragEnd}>
                {questions.slice(page * pageSize, (page + 1) * pageSize).map((q, i) => {
                    const index = page * pageSize + i;
                    return (
                        <>
                            <Card key={index} style={{ marginTop: 20, width: 800, textAlign: "center" }}>
                                <p style={{ textAlign: "center", font: "bold 20px Arial", margin: "0 4px", }}>
                                    {q.question.split("___")[0]}
                                    <DropZone
                                        word={filledWords[index]}
                                        expected={q.answer}
                                        onDrop={(w) => setFilledWords((prev) => ({ ...prev, [index]: w }))}
                                        questionTemplate={q.question}
                                        questionIndex={index}

                                    />
                                    {q.question.split("___")[1]}
                                </p>
                                <div>
                                    {q.options.map((word, wi) => (
                                        <DraggableWord key={`${index}-${word}`} word={word} id={`${index}-${word}`} />
                                    ))}
                                </div>
                            </Card>
                        </>
                    );


                })}
            </DndContext>

            {questions.length > pageSize && (
                <div style={{ marginTop: 20 }}>
                    <Button onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        onClick={() => setPage((p) => p + 1)}
                        disabled={(page + 1) * pageSize >= questions.length}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FillInTheBlankPage;
