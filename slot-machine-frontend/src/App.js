import React, { useState, useEffect } from "react";
import SlotGrid from "./components/SlotGrid";
import Controls from "./components/Controls";
import { spinSlotMachine } from "./api/slotApi";
import "./App.css";

export default function App() {
  const [grid, setGrid] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
  ]);
  const [lines, setLines] = useState(1);
  const [winningLines, setWinningLines] = useState([]);
  const [payout, setPayout] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [winMessage, setWinMessage] = useState("");
  const [showRules, setShowRules] = useState(false);

  const [credits, setCredits] = useState(() => {
    const savedCredits = localStorage.getItem("slotMachineCredits");
    const parsedCredits = savedCredits ? Number.parseInt(savedCredits, 10) : 100;
    return isNaN(parsedCredits) ? 100 : parsedCredits;
  });
  const [totalEarned, setTotalEarned] = useState(() => {
    const savedTotal = localStorage.getItem("totalEarned");
    const parsedTotal = savedTotal ? Number.parseInt(savedTotal, 10) : 0;
    return isNaN(parsedTotal) ? 0 : parsedTotal;
  });

  const checkWinningRows = (grid) => {
    const winningLines = [];
    for (let row = 0; row < grid.length; row++) {
      const currentRow = grid[row];
      if (currentRow.every(cell => cell === currentRow[0] && cell !== "")) {
        winningLines.push(row);
      }
    }
    return winningLines;
  };

  const calculatePayout = (winningLines, betAmount) => {
    return winningLines.length * betAmount * 10;
  };

  const handleSpin = async () => {
    if (credits < betAmount) {
      alert("No tienes suficientes créditos para jugar.");
      return;
    }

    setCredits(credits - (betAmount * lines));

    setSpinning(true);
    try {
      const result = await spinSlotMachine(lines, betAmount);
      setGrid(result.grid);
      setWinningLines(result.winningLines || []);
      setPayout(result.payout || 0);

      const newTotal = totalEarned + (result.payout || 0);
      setTotalEarned(newTotal);
      localStorage.setItem("totalEarned", newTotal);

      setCredits((prevCredits) => prevCredits + (result.payout || 0));

    } catch (error) {
      console.error("Error en la tirada:", error);
    }

    setTimeout(() => {
      setSpinning(false);
    }, 2000);
  };

  const handleAddCredits = () => {
    const amount = prompt("Ingrese la cantidad de créditos a cargar:");
    if (amount && !isNaN(amount) && amount > 0) {
      setCredits(credits + parseInt(amount, 10));
    } else {
      alert("Ingresa un número válido.");
    }
  };

  useEffect(() => {
    if (payout > 0) {
      setWinMessage(`¡Ganaste ${payout} créditos!`);
      setTimeout(() => {
        setWinMessage("");
      }, 3000);
    }
  }, [payout]);


  return (
    <div className="slot-machine-container">
      {winMessage && (
        <div className="win-message">
          {winMessage}
        </div>
      )}
      <div className="slot-grid-wrapper">
        <SlotGrid grid={grid} winningLines={winningLines} spinning={spinning} />
      </div>

      <div className="bottom-controls">
        <div className="credits-container">
          <div className="credits-display">
            CREDITOS DISPONIBLES: <strong>{credits}</strong>
          </div>
          <button className="add-credits-button" onClick={handleAddCredits}>
            CARGAR CREDITO
          </button>
        </div>

        <div className="bet-controls">
          <label>MONTO POR LINEA</label>
          <input
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
          />
        </div>

        <div className="rules-button-container">
          <button className="rules-button" onClick={() => setShowRules(true)}>
            VER REGLAS
          </button>
        </div>
      </div>


      <div className="side-controls">
        <Controls lines={lines} setLines={setLines} totalWin={payout} />
        <div className="lever-wrapper" onClick={handleSpin}>
          <div className="lever"></div>
          <button
            className={`lever-button ${spinning ? "spinning" : ""}`}
            onClick={handleSpin}
          >
            {spinning ? "SPINNING..." : "SPIN"}
          </button>
        </div>
      </div>

      {showRules && (
        <div className="rules-modal" onClick={() => setShowRules(false)}>
          <div
            className="rules-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Reglas del Juego</h2>
            <ul>
              <li>Los siguientes símbolos tienen como premio $10: cereza, 7 blanco, 7 negro, bar simple, 5 bar, bar triple.</li>
              <li>El simbolo Spin actúa como comodín.</li>
              <li>El simbolo Esfera no hace absolutamente nada.</li>
              <li>El simbolo Conejo otorga un tiro gratis.</li>
              <li>Puedes seleccionar entre 1 y 5 líneas para jugar.</li>
              <li>El premio se calcula como: <strong>Valor del simbolo</strong> * <strong>Cantidad de apariciones del simbolo</strong> * <strong>Cantidad apostada</strong></li>
              <li>Se gana teniendo minimo 3 simbolos iguales seguidos.</li>
              <li>Solo se puede ganar comenzando de izquierda a derecha.</li>
            </ul>
            <button className="close-rules-button" onClick={() => setShowRules(false)}>
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>

  );

}
