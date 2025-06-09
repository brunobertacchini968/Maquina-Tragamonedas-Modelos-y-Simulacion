import { symbols } from '../models/slotSymbols.js';

const paylines = {
  1: [
    // Línea central horizontal
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ],
  ],
  3: [
    // Línea superior horizontal
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    // Línea central horizontal
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ],
    // Línea inferior horizontal
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ],
  ],
  5: [
    // Línea superior horizontal
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
    ],
    // Línea central horizontal
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ],
    // Línea inferior horizontal
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ],
    // Línea en ∧ (sube y baja)
    [
      [0, 1],
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 1],
    ],
    // Línea en ∨ (baja y sube)
    [
      [0, 1],
      [1, 2],
      [2, 1],
      [3, 0],
      [4, 1],
    ],
  ],
}

const symbolWeights = {
  cereza: 10,
  bar_simple: 8,
  siete_blanco: 6,
  siete_negro: 4,
  bar_triple: 4,
  spin: 2,
  esfera: 2,
  "5_bar": 6,
};

const transposeGrid = (grid) => {
  if (!grid || grid.length === 0) {
    console.error("Error: Grid vacío o no definido antes de la transposición.");
    return grid;
  }

  const rows = grid[0].length;
  const cols = grid.length;
  const transposed = Array.from({ length: rows }, () => Array(cols).fill("/images/cereza.png")); // Fallback

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (grid[col] && grid[col][row]) {
        transposed[row][col] = grid[col][row];
      } else {
        console.error(`Error: Posición [${col}, ${row}] no encontrada en grid.`);
      }
    }
  }

  console.log("✅ Grid después de transposición:", transposed);
  return transposed;
};

const getRandomSymbol = () => {
  const weightedSymbols = [];

  for (const [symbol, weight] of Object.entries(symbolWeights)) {
    const symbolData = symbols.symbols[symbol];
    if (!symbolData) continue;

    if (symbolData.type === "wildcard" || symbolData.type === "special") {
      if (Math.random() > 0.15) {
        for (let i = 0; i < weight; i++) weightedSymbols.push(symbol);
      }
    } else if (symbolData.type === "bonus") {
      if (Math.random() > 0.25) {
        for (let i = 0; i < weight; i++) weightedSymbols.push(symbol);
      }
    } else {
      for (let i = 0; i < weight; i++) weightedSymbols.push(symbol);
    }
  }

  if (weightedSymbols.length === 0) {
    console.error("Advertencia: Ningún símbolo válido encontrado, asignando cereza por defecto.");
    weightedSymbols.push("cereza");
  }

  const symbol = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
  return symbol;
};


const generateRandomGrid = () => {
  const grid = [];

  for (let col = 0; col < 5; col++) {
    const column = [];
    for (let row = 0; row < 3; row++) {
      const symbol = getRandomSymbol();
      const symbolData = symbols.symbols[symbol];
      if (!symbolData) {
        console.error(`Símbolo no encontrado: ${symbol}`);
        column.push("/images/cereza.png");
      } else {
        column.push(`/images/${symbolData.image}`);
      }
    }
    grid.push(column);
  }

  console.log("Grid ANTES de transposición:", grid);
  const transposeGridFinal = transposeGrid(grid)
  console.log("Grid generado en el backend:", transposeGridFinal);
  return transposeGridFinal;
};

const checkWinningLines = (grid, lines) => {
  const winningLines = [];
  let totalPayout = 0;

  const validLines = parseInt(lines);
  if (isNaN(validLines) || ![1, 3, 5].includes(validLines)) {
    console.error(`Número de líneas inválido: ${lines}. Usando 1 línea por defecto.`);
    lines = 1;
  }

  const symbolGrid = grid.map((column) =>
    column.map((symbol) => {
      if (!symbol) {
        console.error("Advertencia: símbolo no válido encontrado, usando 'cereza' por defecto.");
        return "cereza";
      }
      return symbol.replace("/images/", "").replace(".png", "");
    })
  );

  const activePaylines = paylines[lines];
  console.log("Líneas de pago activas para", lines, "líneas:", activePaylines);

  if (!activePaylines || !Array.isArray(activePaylines)) {
    console.error(`No se encontraron líneas de pago para ${lines} líneas`);
    return { winningLines: [], payout: 0 };
  }

  for (const line of activePaylines) {
    const symbolsInLine = line.map(([x, y]) => {
      if (symbolGrid[y] && symbolGrid[y][x]) {
        return symbolGrid[y][x];
      } else {
        return undefined;
      }
    });
    console.log("Símbolos en la línea:", symbolsInLine);

    let currentSymbol = symbolsInLine[0];
    let count = 1;

    if (!currentSymbol || currentSymbol === "spin") {
      currentSymbol = null;
    }

    for (let i = 1; i < symbolsInLine.length; i++) {
      const symbol = symbolsInLine[i];

      if (!symbol) break;

      if (symbol === currentSymbol || symbol === "spin" || currentSymbol === "spin") {
        count++;
        if (currentSymbol === "spin" && symbol !== "spin") {
          currentSymbol = symbol;
        }
      } else {
        break;
      }
    }

    console.log(`Racha encontrada: ${count} símbolos iguales (actual: ${currentSymbol})`);
    if (count >= 3 && currentSymbol && currentSymbol !== "spin") {
      const payout = symbols.symbols[currentSymbol]?.value || 0;
      totalPayout += payout * count;
      winningLines.push({ line, symbol: currentSymbol, count, payout: payout * count });
      console.log(`✅ Línea ganadora con símbolo ${currentSymbol}, cantidad: ${count}, pago: ${payout * count}`);
    } else {
      console.log(`Racha encontrada: ${count} símbolos iguales (actual: ${currentSymbol})`);
    }
  };

  console.log("Líneas ganadoras:", winningLines);
  console.log("Pago total:", totalPayout);
  return { winningLines, payout: totalPayout };
};


export const spinSlotMachine = async (lines, betAmount) => {
  try {
    if (lines === undefined || lines === null) {
      throw new Error("El parámetro lines es requerido");
    }

    if (betAmount === undefined || betAmount <= 0) {
      throw new Error("El parámetro betAmount es requerido y debe ser mayor a 0");
    }

    console.log("spinSlotMachine recibió lines:", lines, "betAmount:", betAmount);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const grid = generateRandomGrid();

    console.log("Símbolos disponibles:", symbols);
    console.log("Grid recibido:", grid);

    const { winningLines, payout } = checkWinningLines(grid, lines);

    const totalWinnings = payout * betAmount;
    console.log("Winning lines:", winningLines);
    console.log("Total payout:", payout);

    return {
      success: true,
      grid,
      winningLines: winningLines.map((wl) => wl.positions),
      payout: totalWinnings,
    };
  } catch (error) {
    console.error("Error en spinSlotMachine:", error);
    return {
      success: false,
      error: error.message,
      grid: [],
      winningLines: [],
      payout: 0,
    };
  }
};

export const spinController = async (req, res) => {
  try {
    const { lines, betAmount } = req.body;

    console.log("req.body completo:", req.body);
    console.log("lines extraído:", lines, "betAmount extraído:", betAmount);

    if (lines === undefined || lines === null) {
      return res.status(400).json({
        success: false,
        error: "El parámetro lines es requerido",
      });
    }

    if (betAmount === undefined || betAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "El parámetro betAmount es requerido y debe ser mayor a 0",
      });
    }

    const result = await spinSlotMachine(lines, betAmount);

    res.json(result);
  } catch (error) {
    console.error("Error en spinController:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};

export const simulateSpins = async (
  totalSpins = 10000,
  lines = 5,
  betAmount = 1,
  concurrency = 100
) => {
  let totalWagered = 0;
  let totalWon = 0;
  let winCount = 0;
  const winLineDistribution = {};

  const runBatch = async (batchSize) => {
    const promises = Array.from({ length: batchSize }, () =>
      spinSlotMachine(lines, betAmount)
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (!result.success) continue;

      totalWagered += betAmount;
      totalWon += result.payout;

      if (result.payout > 0) {
        winCount++;
        const count = result.winningLines.length;
        winLineDistribution[count] = (winLineDistribution[count] || 0) + 1;
      }
    }
  };

  for (let i = 0; i < totalSpins; i += concurrency) {
    const batchSize = Math.min(concurrency, totalSpins - i);
    await runBatch(batchSize);
  }

  const winRate = (winCount / totalSpins) * 100;
  const rtp = (totalWon / totalWagered) * 100;

  console.log("🧪 RESULTADOS DE SIMULACIÓN (Concurrente):");
  console.log(`🎰 Total de tiradas: ${totalSpins}`);
  console.log(`💰 Total apostado: ${totalWagered}`);
  console.log(`🏆 Total ganado: ${totalWon}`);
  console.log(`📈 Porcentaje de jugadas ganadoras: ${winRate.toFixed(2)}%`);
  console.log(`📊 RTP (Retorno al jugador): ${rtp.toFixed(2)}%`);
  console.log("📐 Distribución de líneas ganadoras por tirada:");
  for (const [numLines, count] of Object.entries(winLineDistribution)) {
    console.log(`   ${numLines} línea(s): ${count} veces`);
  }

  return {
    totalSpins,
    totalWagered,
    totalWon,
    winRate,
    rtp,
    winLineDistribution,
  };
};

simulateSpins(10000, 5, 1, 100); // 10k spins, 5 líneas, $1 apuesta, 100 concurrentes

export { generateRandomGrid, checkWinningLines, getRandomSymbol }