export const spinSlotMachine = async (lines, betAmount) => {
  const response = await fetch('http://localhost:3001/spin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lines, betAmount }),
  });

  if (!response.ok) {
    throw new Error('Error en la solicitud');
  }

  return response.json();
};
