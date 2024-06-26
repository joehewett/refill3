import React, { useEffect, useState } from "react";
import { Reports } from "./reports";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { Button } from "../components/button";
import { Loading } from "../components/loading";
import { FileIcon } from "../components/file_icon";

export default function Form() {
  const apiBase = "http://localhost:8090/";

  const [keys, setKeys] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apiKey, setAPIKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] = useState("");
  const [parsedResponse, setParsedResponse] = useState<any[]>([]);
  const [reports, setReports] = useState<string>("");

  useEffect(() => {
    if (response) {
      try {
        const parsedResponse = JSON.parse(response);
        setParsedResponse(parsedResponse);
        setError('')
      } catch (e) {
        if (e instanceof SyntaxError) {
          setError("Invalid JSON response: " + e.message + ": " + response);
        }
      }
    }
  }, [response]);

  useEffect(() => {
    // Whenever the parsed response changes, append it to the reports list
    if (!response) {
      return
    }

    try {
      const existingReports = reports || "[]"
      const parsedReports = JSON.parse(existingReports)
      const parsedResponse = JSON.parse(response)

      parsedReports.push(parsedResponse)
      const json = JSON.stringify(parsedReports, null, 2)

      setReports(json)

      localStorage.setItem("reports", json)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError("Error when trying to write to reports: " + e.message);
      }
    }
  }, [parsedResponse]);

  const removeReports = () => {
    setReports("")
    localStorage.setItem("reports", "")
  }

  // Load the API key from local storage
  useEffect(() => {
    const storedAPIKey = localStorage.getItem("openai_api_key");
    if (storedAPIKey) {
      setAPIKey(storedAPIKey);
    }
  }, []);

  // Load the API key from local storage
  useEffect(() => {
    const storedInstructions = localStorage.getItem("instructions");
    setInstructions(storedInstructions || "");
  }, []);

  useEffect(() => {
    const storedReports = localStorage.getItem("reports") || "";
    if (storedReports) {
      setReports(storedReports);
    }
  }, []);

  const submitData = (e: React.FormEvent<HTMLFormElement>) => {
    // When the form is submitted, store whatever is in the key in local storage
    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("keys", keys);
    localStorage.setItem("instructions", instructions);

    const data = new FormData();
    files.forEach((file) => {
      data.append("file", file);
    });
    data.append("keys", keys);
    data.append("instructions", instructions);
    data.append("openai_api_key", apiKey);

    setLoading(true);
    fetch(apiBase + "refill", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        setResponse(res);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        }
        setLoading(false);
      });
  };

  return (
    <form
      encType="multipart/form-data"
      method="POST"
      onSubmit={(e) => {
        e.preventDefault();
        submitData(e);
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="flex flex-col items-left justify-center gap-4 lg:col-span-2 text-lg space-y-8">
          Extract structured data from unstructured text. Insert some text data
          and add some comma-separated keys to get started.
          <Input
            className="w-64"
            placeholder="OpenAI API Key"
            onChange={(v) => setAPIKey(v.target.value)}
            value={apiKey}
          />
          {/* File upload area */}
          <div className="flex flex-col gap-4">
            <label className="text-lg">
              Upload the files containing the data you want to run the
              extraction on
            </label>
            <input
              type="file"
              className="text-lg w-full border-2 border-dashed border-gray-300 p-4 rounded-lg"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    setFiles((prev) => [...prev, files[i]]);
                  }
                }
              }}
            />
          </div>
          {files.length > 0 && (
            <div className="flex flex-col">
              <h2>Files</h2>
              <ul className="flex flex-col gap-4">
                {files.map((file, index) => (
                  <li key={index}>
                    <FileIcon file={file} setFiles={setFiles} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Input
            className="w-full text-lg"
            placeholder="Keys to extract (comma separated)"
            onChange={(v) => setKeys(v.target.value)}
          />
          <Textarea
            defaultValue={instructions}
            onChange={(v) => setInstructions(v.target.value)}
            className="h-2 w-full resize-none font-mono text-lg selection:bg-accent"
            placeholder="Insert any custom instructions for the extraction process here"
          />
          <Button
            variant="default"
            className="bg-gray-700 gap-4 text-gray-200"
            size="sm"
            type="submit"
          >
            Start Refill
            <Loading loading={loading} />
          </Button>

          <div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
          </div>
          <div>
            {parsedResponse.map((item: { [key: string]: string }, index: number) => (
              <div key={index} className="p-4 border border-gray-300 rounded-lg mb-4">
                {Object.entries(item).map(([key, value]) => (
                  <KeyValuePair key={key} keyName={key} value={value} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-left gap-4 lg:col-span-2 text-lg space-y-8">

          <Reports reports={reports} removeReports={removeReports} />
        </div>
      </div>
    </form>
  );
}


function KeyValuePair({ keyName, value }: { keyName: string; value: string }) {
  return (
    <div className="mb-4">
      <span className="block text-gray-700 font-semibold">{keyName}:</span>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}
