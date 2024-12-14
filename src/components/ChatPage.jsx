import React, { useState, useEffect } from "react";
import chatimg from "../assets/chatbotimg.png";
import { IoMdSend } from "react-icons/io";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Animation from "./Animation";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check user's preferred theme when component mounts
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    // Save the theme choice in localStorage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      setMessages([...messages, userInput]);
      setUserInput("");
      handleResponse(userInput);
    }
  };

  const handleResponse = async (userInput) => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      setShowAnimation(true);
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [
              { text: "Great to meet you. What would you like to know?" },
            ],
          },
        ],
      });

      let result = await chat.sendMessage(userInput);
      const chunkText = result.response.text();
      setMessages((prevMessages) => [...prevMessages, chunkText]);
      setShowAnimation(false);
    } catch (error) {
      setShowAnimation(false);
      console.error("Error:", error);
    } finally {
      setShowAnimation(false);
    }
  };

  return (
    <div
      className={`max-w-sm w-full flex flex-col p-6 rounded-lg shadow-md ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      } sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl`}
    >
      {/* Heading */}
      <header
        className={`flex justify-between items-center p-4 rounded-t-lg ${
          isDarkMode ? "bg-gray-700" : "bg-[#edeaeaf1]"
        }`}
      >
        <h1 className="text-xl sm:text-xl md:text-xl lg:text-xl xl:text-xl">
          Mitram
        </h1>
        <img
          src={chatimg}
          alt="chatbot"
          loading="lazy"
          className="h-10 w-10 object-contain"
        />
      </header>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 left-4 p-2 text-xl sm:text-2xl"
      >
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className="flex flex-col p-2 m-2">
              <div
                className={`p-2 rounded-lg block ${
                  isDarkMode ? "bg-gray-700" : "bg-[#edeaeaf1]"
                }`}
              >
                <p className="text-start block">{message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No messages yet</p>
          </div>
        )}
        {showAnimation && <Animation />}
      </div>

      {/* Chat input */}
      <form onSubmit={sendMessage} className="flex flex-col p-2 m-2 relative">
        <textarea
          type="text"
          placeholder="Type a message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={`w-full h-20 overflow-y-scroll outline-none resize-none p-2 border ${
            isDarkMode ? "bg-gray-600 text-white" : "bg-white text-black"
          } border-gray-300 sm:h-20 md:h-20 lg:h-24 xl:h-24`}
        />
        <button
          type="submit"
          className="absolute right-2 bottom-2 mb-2 text-blue-500 text-2xl sm:text-3xl"
        >
          <IoMdSend />
        </button>
      </form>
    </div>
  );
}

export default ChatPage;
