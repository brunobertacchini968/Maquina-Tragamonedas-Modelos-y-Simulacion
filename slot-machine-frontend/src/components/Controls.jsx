"use client"
import "./Controls.css"

const Controls = ({ lines, setLines, totalWin, betAmount, setBetAmount }) => {
  return (
    <div className="controls-container">
      <div className="control-panel">
        <div className="panel-header">
          <div className="panel-title">CONFIGURACIÓN</div>
          <div className="panel-lights">
            <div className="status-light active"></div>
            <div className="status-light"></div>
            <div className="status-light"></div>
          </div>
        </div>

        <label className="payline-label">
          <span className="label-text">LÍNEAS A APOSTAR</span>
          <div className="select-wrapper">
            <select className="payline-select" value={lines} onChange={(e) => setLines(Number(e.target.value))}>
              <option value={1}>1 línea</option>
              <option value={3}>3 líneas</option>
              <option value={5}>5 líneas</option>
            </select>
            <div className="select-arrow">▼</div>
          </div>
        </label>
      </div>

      <div className="win-display">
        <div className="display-header">TOTAL GANADO</div>
        <div className={`win-amount ${totalWin > 0 ? "win-animation" : ""}`}>
          <span className="currency">$</span>
          <span className="amount">{totalWin}</span>
        </div>
        <div className="display-border"></div>
      </div>
    </div>
  )
}

export default Controls
