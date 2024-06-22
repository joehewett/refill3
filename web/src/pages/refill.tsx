import React, { useEffect, useState } from "react";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { Button } from "../components/button";
import { Loading } from "../components/loading";
import { FileIcon } from "../components/file_icon";

function splitKeys(keys: string) {
  return keys.split(",").map((key) => key.trim());
}

export default function Example() {
  // const prodAPI = "https://gin-production-0e58.up.railway.app/refill";
  const devAPI = "http://localhost:8090/refill";

  const [response, setResponse] = useState("");
  const [dataInput, setDataInput] = useState("");
  const [keys, setKeys] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apiKey, setAPIKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Load the API key from local storage
  useEffect(() => {
    const storedAPIKey = localStorage.getItem("openai_api_key");
    if (storedAPIKey) {
      setAPIKey(storedAPIKey);
    }
  }, []);

  const submitData = (e: React.FormEvent<HTMLFormElement>) => {
    // When the form is submitted, store whatever is in the key in local storage
    localStorage.setItem("openai_api_key", apiKey);

    const data = new FormData();
    files.forEach((file) => {
      data.append("file", file);
    });
    data.append("keys", keys);
    data.append("instructions", instructions);
    data.append("openai_api_key", apiKey);

    setLoading(true);
    fetch(devAPI, {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        let json = JSON.stringify(res, null, 2);
        // stringify the response, removing any escaped n or t chars
        json = json
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\/g, "\r");
        // Strip off the first and last quotes
        if (json.startsWith('"') && json.endsWith('"')) {
          json = json.slice(1, -1);
        }

        setResponse(json);
        setLoading(false);
      })
      .catch((err) => {
        setResponse(JSON.stringify(err, null, 0));
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
        <div></div>
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
          <div className="h-96 w-full bg-gray-800 text-gray-200 p-4 rounded-lg overflow-y-scroll whitespace-pre-wrap">
            <pre>{response}</pre>
          </div>
        </div>
        <div></div>
      </div>
    </form>
  );
}
