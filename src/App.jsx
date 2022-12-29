import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Fuse from "fuse.js";
import { CannedResponseCategories } from "./cannedResponses";
import fuzzysort from "fuzzysort";
import searchimg from "./search.png";
import searchtime from "./time.png";


function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [fuzzySortResult, setFuzzySortResult] = useState([]);
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
    console.log(`Call to FuseResult took ${endTime - startTime} milliseconds`);
    (results.length > 5)? results.length = 5: results.length = results.length;
    setResult(results);
    startTime = performance.now();
    
      var fuzzysortsearch = fuzzysort.go(query, cannedResponses, {
        keys: ["shortCode", "content", "title"],
        limit: 5,
      })
      setFuzzySortResult(fuzzysortsearch);
    endTime = performance.now();
    console.log(`Call to setFuzzySortResult took ${endTime - startTime} milliseconds`);

  }, [query]);

  return (
    <div className="App">
      <input
        type="text"
        className="search"
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="header">Fuse.js Results</div>
      {result.map((result) => {
        return (
          // formatted html to show a title, subtitle, and content
          <div key={result.item.id}>
            <div className="title">{result.item.shortCode}</div>
            <div className="content">{result.item.content}</div>
            <hr />
          </div>
        );
      })}
      {
      (result.length === 0 && query.length > 3)? <div className="no-results"><h4>No Results</h4><img src={searchimg} alt="" /></div>: null}
      <div className="header">FuzzySort Results</div>
      {fuzzySortResult.map((result) => {
        return (
          // formatted html to show a title, subtitle, and content
          <div key={result.obj.id}>
            <div className="title">{result.obj.shortCode}</div>
            <div className="content">{result.obj.content}</div>
            <hr />
          </div>
        );
      })}
      {
      (fuzzySortResult.length === 0 && query.length > 3)? <div className="no-results"><h4>No Results</h4><img src={searchtime} alt="" /></div>: null}
    </div>
  );
}

export default App;
