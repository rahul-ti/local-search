import React, { useEffect, useState } from "react";
import "./App.css";
import { CannedResponses } from "./cannedResponses";
import fuzzysort from "fuzzysort";
import searchtime from "./time.png";

function App() {
  const [query, setQuery] = useState("");
  const [perf, setPerf] = useState([]);
  const [fuzzySortResult, setFuzzySortResult] = useState([]);
  var searchResultsCount = 20;

  useEffect(() => {
    var queryPerf = [];
    var startTime = performance.now();
    var fuzzysortsearch = fuzzysort.go(query, CannedResponses, {
      keys: ["shortcode", "description", "title"],
      limit: searchResultsCount,
      //assign different weights to different keys using scoreFn
      scoreFn: (a) => {
        var score = -100000;
        score = Math.max(
          a[0]?.score == null ? -10000 : a[0].score,
          a[1]?.score == null ? -10000 : a[1].score - 3000,
          a[2]?.score == null ? -10000 : a[2].score - 3000
        );
        return score;
      },
    });
    var endTime = performance.now();
    console.log(fuzzysortsearch);
    setFuzzySortResult(fuzzysortsearch);
    queryPerf.push(
      `FuzzySort took ${(endTime - startTime).toFixed(0)} milliseconds`
    );
    setPerf(queryPerf);
  }, [query, searchResultsCount]);

  return (
    <div className="App">
      <div className="explainer">
        <p className="explainer-text">
          Agents remember the keywords for the common canned responses they use
          frequently. Some of the key words you can try out to test this
          functionality are:{" "}
          <b>
            <code>Hold, FRT, AWB, downtime, DC, mobile</code>
          </b>
        </p>
        <p className="explainer-text">
          Enter the keywords in the search bar to see the results. Try the same
          keywords of FC if you wish to compare performance and result quality.
        </p>
      </div>
      <input
        type="text"
        className="search"
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="main">
        <div>
          <div className="header">FuzzySort Results</div>
          <div>
            <p className="perf">
              <small>{perf[0]}</small>
            </p>
          </div>
          {fuzzySortResult.map((result, index) => {
            return (
              // formatted html to show a title, subtitle, and content
              <div key={result.obj.id}>
                <div className="title">{result.obj.shortcode}</div>
                <div className="content">{result.obj.formattedDescription}</div>
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
      </div>
    </div>
  );
}

export default App;
