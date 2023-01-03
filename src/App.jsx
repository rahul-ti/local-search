import React, { useEffect, useState } from "react";
import "./App.css";
import Fuse from "fuse.js";
import { CannedResponseCategories } from "./cannedResponses";
import fuzzysort from "fuzzysort";
import searchimg from "./search.png";
import searchtime from "./time.png";

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [perf, setPerf] = useState([]);
  const [fuzzySortResult, setFuzzySortResult] = useState([]);
  const [mixedResult, setMixedResult] = useState([]);
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
  var searchResultsCount = 20;
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
    includeScore: true,
  });

  useEffect(() => {
    var totalPerfStart = performance.now();
    var queryPerf = [];
    var startTime = performance.now();
    const results = fuse.search(query);
    var endTime = performance.now();
    queryPerf.push(
      `Fuse took ${(endTime - startTime).toFixed(0)} milliseconds`
    );
    console.log(`Fuse took ${(endTime - startTime).toFixed(0)} milliseconds`);
    results.length > searchResultsCount
      ? (results.length = searchResultsCount)
      : (results.length = results.length);
    console.log(results);
    setResult(results);

    startTime = performance.now();

    var fuzzysortsearch = fuzzysort.go(query, cannedResponses, {
      keys: ["shortCode", "content", "title"],
      limit: searchResultsCount,
    });
    setFuzzySortResult(fuzzysortsearch);
    endTime = performance.now();
    console.log(fuzzysortsearch);
    queryPerf.push(
      `FuzzySort took ${(endTime - startTime).toFixed(0)} milliseconds`
    );
    setPerf(queryPerf);
    console.log(
      `FuzzySort took ${(endTime - startTime).toFixed(0)} milliseconds`
    );
    var mixedResults = [];

    var maxThresholdFuzzySort =
      fuzzysortsearch[fuzzysortsearch.length - 1]?.score;
    var maxThresholdFuse = results[results.length - 1]?.score;
    results.forEach((result) => {
      mixedResults[result.item.id] = {
        shortCode: result.item.shortCode,
        content: result.item.content,
        title: result.item.title,
        id: result.item.id,
        score: result.score,
      };
      mixedResults[result.item.id].score = result.score / maxThresholdFuse;
    });
    fuzzysortsearch.forEach((result) => {
      if (mixedResults[result.obj.id]) {
        mixedResults[result.obj.id].score =
          (mixedResults[result.obj.id].score * result.score) /
          maxThresholdFuzzySort;
      } else {
        mixedResults[result.obj.id] = {
          shortCode: result.obj.shortCode,
          content: result.obj.content,
          title: result.obj.title,
          id: result.obj.id,
          score: result.score,
        };
        mixedResults[result.obj.id].score =
          result.score / maxThresholdFuzzySort;
      }
    });
    mixedResults.sort((a, b) => a.score - b.score);
    mixedResults = mixedResults.filter((result) => result);
    var totalPerfEnd = performance.now();
    queryPerf.push(
      `Mixed Results took ${(totalPerfEnd - totalPerfStart).toFixed(
        0
      )} milliseconds`
    );
    setPerf(queryPerf);
    console.log(
      `Total time: ${(totalPerfEnd - totalPerfStart).toFixed(0)} milliseconds`
    );
    // mixedResults.forEach((result) =>
    //   console.log(result.shortCode, Number(result.score).toFixed(20))
    // );
    console.log(mixedResults);
    setMixedResult(mixedResults);
  }, [query]);

  return (
    <div className="App">
      <div className="explainer">
      <p className="explainer-text">Agents remember the keywords for the common canned responses they use frequently. Some of the key words you can try out to test this functionality are: <b><code>Hold, FRT, AWB, downtime, DC, mobile</code></b></p>
      <p className="explainer-text">Enter the keywords in the search bar to see the results.</p>
      </div>
      <input
        type="text"
        className="search"
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="main">
        <div>
          <div className="header">Fuse.js Results</div>
          <div>
            <p className="perf">
              <small>{perf[0]}</small>
            </p>
          </div>
          {result.map((result) => {
            return (
              // formatted html to show a title, subtitle, and content
              <div key={result.item.id}>
                <div className="title">{result.item.shortCode}</div>
                <div className="content">{result.item.content}</div>
                <div className="content">
                  {Number(result.score).toFixed(20)}
                </div>
                <hr />
              </div>
            );
          })}
          {result.length === 0 && query.length > 3 ? (
            <div className="no-results">
              <h4>No Results</h4>
              <img src={searchimg} alt="" />
            </div>
          ) : null}
        </div>
        <div>
          <div className="header">FuzzySort Results</div>
          <div>
            <p className="perf">
              <small>{perf[1]}</small>
            </p>
          </div>
          {fuzzySortResult.map((result) => {
            return (
              // formatted html to show a title, subtitle, and content
              <div key={result.obj.id}>
                <div className="title">{result.obj.shortCode}</div>
                <div className="content">{result.obj.content}</div>
                <div className="content">{result.score}</div>
                <hr />
              </div>
            );
          })}
          {fuzzySortResult.length === 0 && query.length > 3 ? (
            <div className="no-results">
              <h4>No Results</h4>
              <img src={searchtime} alt="" />
            </div>
          ) : null}
        </div>
        <div>
          <div className="header">Mix of Fuse and Fuzzysort Results</div>
          <div>
            <p className="perf">
              <small>{perf[2]}</small>
            </p>
          </div>
          {mixedResult.map((result) => {
            return (
              // formatted html to show a title, subtitle, and content
              <div>
                <div className="title">
                  {result?.shortCode ? result.shortCode : "error"}
                </div>
                <div className="content">
                  {result?.content ? result.content : "error"}
                </div>
                <div className="content">
                  {Number(result.score).toFixed(20)}
                </div>
                <hr />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;