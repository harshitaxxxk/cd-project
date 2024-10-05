import { useState } from "react";
import './App.css';  // Assuming the styles are here

function App() {
  const [code, setCode] = useState("");
  const [intermediateCode, setIntermediateCode] = useState([]);

  const handleSubmit = async () => {
    const response = await fetch("3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      const data = await response.json();
      setIntermediateCode(data.intermediate_code);
    } else {
      console.error("Error generating intermediate code");
    }
  };

  return (
    <div className="container">
      <h1>Intermediate Code Generator</h1>
      <textarea
        className="code-input"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code here..."
      />
      <button className="generate-btn" onClick={handleSubmit}>
        Generate Intermediate Code
      </button>

      <div className="output">
        <h2>Generated Intermediate Code:</h2>
        <ul>
          {intermediateCode.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
