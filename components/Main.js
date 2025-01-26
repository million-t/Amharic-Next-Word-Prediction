import { useState, useRef } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Copy from "../public/icons/copy.svg";
import Undo from "../public/icons/undo.svg";
import Loader from "../public/icons/loader.svg";
import Corrected from "./corrected";

export default function Main() {
  const [text, setText] = useState("");
  const [previousText, setPreviousText] = useState("");
  const [words, setWords] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [answer, setAnswer] = useState([]);
  const [hoveredWord, setHoveredWord] = useState(null);
  const contentEditableRef = useRef(null);
  

  function handleTextChange(e) {
    const newText = e.target.innerText;

    setText(newText);
    // console.log(newText);
    const words = newText
      .split(" ")
      .filter((word) => word.trim().length > 0).length;
    setWords(words);
  }

  function handleCopy() {
    setMessage("Copied to clipboard!");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  function handleUndo() {
    setMessage("Undo successful!");
    setText(previousText);
    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  async function handleSubmit(e) {
    try {
      setLoading(true);
      setPreviousText(text);
  
      const res = await fetch(
        "https://nlp-fastapi-backend.onrender.com/next_word",
        {
          method: "POST",
          body: JSON.stringify({ text: text }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!res.ok) {
        if (res.status >= 400) {
          alert(`Error ${res.status}: ${res.statusText}`);
        } else {
          alert("An error occurred: " + res.statusText);
        }
        setLoading(false);
        return;
      }
  
      const data = await res.json();
      
      const next_word = data["next_word"];
      // console.log(next_word)
      if (next_word) {
        const new_text = text + " " + next_word;
        setText(new_text);
        contentEditableRef.current.innerText = new_text;
        setFixed(true);
      } 
    } catch (error) {
      alert("An error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col px-2 sm:px-40 py-16 sm:py-28">
      <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 sm:p-4">
        <form className="flex flex-col h-full gap-4">
          <div
            contentEditable
            className="px-4 resize-none w-full h-full bg-white dark:bg-neutral-800 border-none focus:ring-0 placeholder-neutral-400 overflow-scroll"
            placeholder="Enter your text"
            onInput={handleTextChange}
            ref={contentEditableRef}
          ></div>
          <div className="grid grid-cols-3 justify-between w-full ">
            <div className="flex gap-4 place-self-start self-center">
              <p className="self-center whitespace-nowrap">{words} Words</p>
              <span
                className={`${
                  words !== 0 ? "bg-green-500" : "bg-neutral-500"
                } w-1.5 h-1.5 rounded-full  self-center invisible sm:visible`}
              />
              <p
                className={`hover-element ${
                  words !== 0 ? "hidden" : "invisible sm:visible"
                } self-center`}
              >
                Write something!
              </p>
            </div>
            <div className="place-self-center self-center">
              <button
                type="button"
                disabled={!text}
                onClick={handleSubmit}
                className={`${
                  words !== 0
                    ? "bg-teal-600 dark:bg-teal-800 hover:bg-teal-700 dark:hover:bg-teal-900"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed"
                } rounded-full px-3 py-1.5 font-bold w-48 flex justify-center`}
              >
                {!loading ? (
                  <span>Predict Next Word</span>
                ) : (
                  <Loader className="p-0.5 w-6 h-6 text-gray-400 animate-spin dark:text-gray-600 fill-white" />
                )}
              </button>
            </div>
            <div className="flex place-self-end self-center gap-4">
              {/* <button type="button" onClick={handleUndo}>
                <Undo className="w-6 h-6 fill-current text-neutral-400 self-center hover:text-teal-800" />
              </button> */}
              <CopyToClipboard text={text} onCopy={handleCopy}>
                <button type="button">
                  <Copy className="w-6 h-6 fill-current text-neutral-400 self-center hover:text-teal-800" />
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </form>
      </div>
      <div className="w-full my-4">
        {message ? (
          <span className="bg-teal-700 text-white rounded-lg px-2 py-2 pr-6">
            {message}
          </span>
        ) : (
          <span className="text-gray-200 dark:text-neutral-900">
            This is invisible
          </span>
        )}
      </div>
    </div>
  );
}
