// App.jsx
import React, { useState } from "react";
import { Button } from "antd";
import FillInTheBlankPage from "./FillInTheBlankPage";
import SentenceBuilderPage from "./SentenceBuilderPage";
import "./App.css";

const App = () => {
  const [page, setPage] = useState("home");

  return (
    <div style={{ padding: 20 }}>
      {page === "home" && (
        <div>
          <h1>Sentence Learning App</h1>
          <Button type="primary" onClick={() => setPage("fill")}>
            Fill in the Blank
          </Button>
          <Button style={{ marginLeft: 10 }} onClick={() => setPage("builder")}>
            Sentence Builder
          </Button>
        </div>
      )}

      {page === "fill" && (
        <FillInTheBlankPage goHome={() => setPage("home")} />
      )}

      {page === "builder" && (
        <SentenceBuilderPage goHome={() => setPage("home")} />
      )}
    </div>
  );
};

export default App;
