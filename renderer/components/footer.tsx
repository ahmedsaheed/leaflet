import React, { useState, useEffect } from "react";
import readingTime from "reading-time";
import { EditorView } from "@codemirror/view";
import { EditorUtils } from "./editorutils";
import { AnimatePresence, motion } from "framer-motion";
import formatDistance from "date-fns/formatDistance";
import fs from "fs-extra";
import { CLOCKIcon } from "./icons";

export type FooterProps = {
  insert: boolean;
  vimToggler: () => void;
  value: string;
  cursor: string;
  editorview: EditorView;
  path: string;
};

export const Footer = (prop: FooterProps) => {
  const [showChild, setShowChild] = useState(true);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    const toggleInterval = setTimeout(() => {
      setIsOn((prevIsOn) => !prevIsOn);
    }, 7000);

    return () => {
      clearTimeout(toggleInterval);
    };
  }, [isOn]);

  let dateCraeted = "Loading...";
  if (prop.path) {
    const lastEdited = fs.statSync(prop.path).mtime;
    dateCraeted = formatDistance(lastEdited, new Date(), {
      addSuffix: true,
    });
  }
  function animate() {
    return (
      <AnimatePresence>
        {isOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span
              style={{ marginLeft: "10px", marginRight: "30px" }}
            >{` last edited ${dateCraeted}`}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 ButtomBar ${
        prop.insert ? "insert-util-parent" : ""
      }`}
      onMouseEnter={() => setShowChild(true)}
      // onMouseLeave={() => setShowChild(false)}
      style={{
        display: "inline",
        userSelect: "none",
        maxHeight: "10vh",
        marginTop: "20px",
        height: "40px",
      }}
    >
      <>
        <div
          onMouseEnter={() => setShowChild(true)}
          style={{
            float: prop.insert ? "none" : "right",
            paddingLeft: "10px",
            paddingTop: "5px",
            fontSize: "12px !important",
          }}
        >
          <div>
            {prop.insert ? (
              <AnimatePresence>
                {showChild && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="insert-util">

                      {EditorUtils(prop.editorview)}

                      <div
                        style={{
                          float: "right",
                          display: "inline",
                        }}
                      >
                        <select
                          style={{
                            float: "right",
                            backgroundColor: "transparent",
                            border: "none",
                            appearance: "none",
                            outline: "none",
                            cursor: "pointer",
                            fontSize: "15px !important",
                          }}
                        >
                          <option>{prop.cursor}</option>
                          <option>
                            {prop.value.toString().split(" ").length} Words
                          </option>
                          <option value="dark">
                            {prop.value.toString().length} Characters
                          </option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <AnimatePresence>
                {showChild && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm opacity-50"
                  >
                    <span style={{ display: "inline" }}>
                      <div className="py-2 flex items-center">
                        <div className="inline-block ml-auto"></div>

                        <CLOCKIcon />
                        <span style={{ marginLeft: "10px" }}>{`${
                          readingTime(prop.value).text
                        }`}</span>
                        <div
                          style={{ display: "inline", marginRight: "30px" }}
                        ></div>
                        {isOn ? (
                          animate()
                        ) : (
                          <>
                            <AnimatePresence>
                              {!isOn && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <span style={{ marginRight: "30px" }}>{`${
                                    prop.value.toString().split(" ").length
                                  } words  ${
                                    prop.value.toString().length
                                  } characters `}</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </span>

                    <div style={{ display: "inline" }}></div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </>
    </div>
  );
};
