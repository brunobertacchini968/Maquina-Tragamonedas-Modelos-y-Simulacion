"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import "./SlotGrid.css";

const symbols = {
  cereza: { image: "cereza.png", value: 10 },
  siete_negro: { image: "siete_negro.png", value: 50, type: "regular" },
  siete_blanco: { image: "siete_blanco.png", value: 100, type: "regular" },
  bar_triple: { image: "bar_triple.png", value: 200, type: "regular" },
  bar_simple: { image: "bar_simple.png", value: 300, type: "regular" },
  "5_bar": { image: "5_bar.png", value: 500, type: "regular" },
  spin: { image: "spin.png", value: 0, type: "wildcard" },
  esfera: { image: "esfera.png", value: 0, type: "special" },
  conejo: { image: "conejo.png", value: 0, type: "bonus" },
};

export default function SlotGrid({ grid = [], spinning, winningLines = [] }) {
  if (grid.length === 0) {
    grid = [
      ["/images/cereza.png", "/images/siete_blanco.png", "/images/bar_simple.png"],
      ["/images/5_bar.png", "/images/spin.png", "/images/conejo.png"],
      ["/images/bar_triple.png", "/images/esfera.png", "/images/cereza.png"],
    ];
  }

  const processedGrid = useMemo(() => {
    return grid.map((row) =>
      row.map((symbol) => symbol.replace("/images/", "").replace(".png", ""))
    );
  }, [grid]);

  const [randomGrid, setRandomGrid] = useState(processedGrid);
  const [displayGrid, setDisplayGrid] = useState(processedGrid);

  const adjustProbability = (symbol) => {
    if (symbols[symbol]?.type === "wildcard" || symbols[symbol]?.type === "special") {
      return Math.random() > 0.75;
    } else if (symbols[symbol]?.type === "bonus") {
      return Math.random() > 0.85;
    }
    return true;
  };

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setRandomGrid(() =>
          Array.from({ length: 3 }, () =>
            Array.from({ length: 5 }, () => {
              const available = Object.keys(symbols).filter(adjustProbability);
              return available[Math.floor(Math.random() * available.length)];
            })
          )
        );
      }, 50);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayGrid(processedGrid);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayGrid(processedGrid);
    }
  }, [spinning, processedGrid]);

  const gridToShow = spinning ? randomGrid : displayGrid;

  return (
    <div className="slot-machine">
      <div className="slot-grid-container">
        {gridToShow.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`slot-row ${winningLines.includes(rowIndex) ? "winning-row" : ""}`}
          >
            {row.map((symbol, colIndex) => {
              const isWinningCell = winningLines.includes(rowIndex) && colIndex === 0;
              return (
                <motion.div
                  key={colIndex}
                  className={`slot-cell ${isWinningCell ? "winning-cell" : ""}`}
                  initial={{ rotateX: 0 }}
                  animate={spinning ? { rotateX: 360 } : { rotateX: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <img
                    className="slot-image"
                    src={
                      symbols[symbol]
                        ? `/images/${symbols[symbol].image}`
                        : "/images/default.png"
                    }
                    alt={symbol}
                  />
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

