import React from "react";
import Navbar from "./Navbar";

function Home() {
  const textShadow = {
    textShadow: "3px 3px #cc4433",
  } as React.CSSProperties;

  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow overflow-auto">
          <div className="h-full flex items-center justify-evenly">
            <div className="text-center">
              <h1
                className="font-bold text-6xl m-4 text-blue-200"
                style={textShadow}
              >
                Jeopardy!
              </h1>
              <h2
                className="font-bold text-5xl m-4 text-blue-200"
                style={textShadow}
              >
                On Raspberry Pi
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
