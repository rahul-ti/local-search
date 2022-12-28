import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Fuse from "fuse.js";
import { CannedResponseCategories } from "./cannedResponses";

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  var cannedResponses = [];
  CannedResponseCategories.forEach((category) => {
    category.cannedResponses.forEach((response) => {
      cannedResponses.push({
        shortCode: response.shortCode,
        title: response.title,
        content: response.message.messageFragments[0].content,
        id: response.id,
      });
    });
  });

  const fuse = new Fuse(cannedResponses, {
    keys: [
      { name: "content", weight: 1 },
      { name: "title", weight: 2 },
      { name: "shortCode", weight: 5 },
    ],
    ignoreFieldNorm: true,
    distance: 1000,
    shouldSort: true,
    threshold: 0.1,
  });

  useEffect(() => {
    var startTime = performance.now();
    const results = fuse.search(query);
    var endTime = performance.now();
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`);
    setResult(results);
  }, [query]);
  return (
    <div className="App">
      <input
        type="text"
        className="search"
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />
      {result.map((result) => {
        return (
          <div key={result.id}>
            <p>{result.item.shortCode}</p>
            <p>{result.item.title}</p>
            <p>{result.item.content}</p>
            <hr />
          </div>
        );
      })}
    </div>
  );
}

export default App;
