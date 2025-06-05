import { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Piece, FilterType, ChartData } from '../types';
import { generateRandomPiece, getColorForValue } from '../utils/pieceGenerator';
import FilterButtons from '../components/FilterButtons';
import PieceCard from '../components/PieceCard';
import axios from 'axios';
import LineChartComponent from '../components/LineChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Cor');
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Generate initial pieces
  useEffect(() => {
    const initialPieces = Array.from({ length: 5 }, generateRandomPiece);
    setPieces(initialPieces);
  }, []);

  // Auto-generate new pieces every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newPiece = generateRandomPiece();
      setPieces(prev => [newPiece, ...prev]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update chart data when pieces or filter changes
  useEffect(() => {
    const updateChartData = () => {
      const counts: { [key: string]: number } = {};
      
      pieces.forEach(piece => {
        let key: string;
        switch (activeFilter) {
          case 'Cor':
            key = piece.color;
            break;
          case 'Tamanho':
            key = piece.size;
            break;
          case 'Material':
            key = piece.material;
            break;
          default:
            key = piece.color;
        }
        counts[key] = (counts[key] || 0) + 1;
      });

      const data = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        color: getColorForValue(name, activeFilter)
      }));

      setChartData(data);
    };

    updateChartData();
  }, [pieces, activeFilter]);

  // Buscar peças do backend
  useEffect(() => {
    axios.get('http://localhost:3001/pieces').then(res => setPieces(res.data));
  }, []);

  // Adicionar nova peça no backend
  const handleRefresh = async () => {
    const newPiece = generateRandomPiece();
    await axios.post('http://localhost:3001/pieces', {
      ...newPiece,
      timestamp: newPiece.timestamp.toISOString(),
    });
    setPieces(prev => [newPiece, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-lg font-semibold">CLP Controller</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Distribution Chart Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-center">Distribuição de Partes</h2>
          
          {chartData.length > 0 ? (
            <LineChartComponent data={chartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Carregando dados...
            </div>
          )}
          
          <FilterButtons 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>

        {/* Pieces List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Peças Geradas</h3>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {pieces.length > 0 ? (
              pieces.map((piece) => (
                <PieceCard key={piece.id} piece={piece} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhuma peça gerada ainda...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
