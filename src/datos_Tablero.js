// Definición del tablero 8x8 (Perímetro)
export const boardCells = [
    // --- FILA SUPERIOR (0-7) ---
    { id: 0, name: "SALIDA", type: "start", color: "#fff", grid: [1, 1] },
    { id: 1, name: "Rio", type: "prop", price: 60, color: "#81c784", grid: [1, 2] },
    { id: 2, name: "Delhi", type: "prop", price: 60, color: "#81c784", grid: [1, 3] },
    { id: 3, name: "Suerte", type: "chance", color: "#b2dfdb", grid: [1, 4] },
    { id: 4, name: "Bangkok", type: "prop", price: 100, color: "#4dd0e1", grid: [1, 5] },
    { id: 5, name: "Cairo", type: "prop", price: 100, color: "#4dd0e1", grid: [1, 6] },
    { id: 6, name: "Madrid", type: "prop", price: 120, color: "#4dd0e1", grid: [1, 7] },
    { id: 7, name: "CÁRCEL", type: "jail", color: "#cfd8dc", grid: [1, 8] },

    // --- COLUMNA DERECHA (8-13) ---
    { id: 8, name: "Jakarta", type: "prop", price: 140, color: "#ce93d8", grid: [2, 8] },
    { id: 9, name: "Berlin", type: "prop", price: 140, color: "#ce93d8", grid: [3, 8] },
    { id: 10, name: "TREN", type: "rail", price: 200, color: "#8d6e63", grid: [4, 8] },
    { id: 11, name: "Moscow", type: "prop", price: 180, color: "#ffcc80", grid: [5, 8] },
    { id: 12, name: "Toronto", type: "prop", price: 180, color: "#ffcc80", grid: [6, 8] },
    { id: 13, name: "Seoul", type: "prop", price: 200, color: "#ffcc80", grid: [7, 8] },

    // --- FILA INFERIOR (14-21) ---
    { id: 14, name: "PARKING", type: "parking", color: "#fff", grid: [8, 8] },
    { id: 15, name: "Zurich", type: "prop", price: 220, color: "#ef9a9a", grid: [8, 7] },
    { id: 16, name: "Riyadh", type: "prop", price: 220, color: "#ef9a9a", grid: [8, 6] },
    { id: 17, name: "Caja", type: "chest", color: "#ffab91", grid: [8, 5] },
    { id: 18, name: "Sydney", type: "prop", price: 240, color: "#fff59d", grid: [8, 4] },
    { id: 19, name: "Beijing", type: "prop", price: 240, color: "#fff59d", grid: [8, 3] },
    { id: 20, name: "Dubai", type: "prop", price: 260, color: "#fff59d", grid: [8, 2] },
    { id: 21, name: "POLICIA", type: "goto", color: "#90a4ae", grid: [8, 1] },

    // --- COLUMNA IZQUIERDA (22-27) ---
    { id: 22, name: "NY", type: "prop", price: 300, color: "#81d4fa", grid: [7, 1] },
    { id: 23, name: "Tokyo", type: "prop", price: 300, color: "#81d4fa", grid: [6, 1] },
    { id: 24, name: "London", type: "prop", price: 320, color: "#81d4fa", grid: [5, 1] },
    { id: 25, name: "Hong K.", type: "prop", price: 350, color: "#b39ddb", grid: [4, 1] },
    { id: 26, name: "Paris", type: "prop", price: 400, color: "#b39ddb", grid: [3, 1] },
    { id: 27, name: "TAX", type: "tax", price: 200, color: "#b0bec5", grid: [2, 1] }
];