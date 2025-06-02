import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Datos del Dr Test Alpha
  const doctors = [
    {
      id: "test-alpha",
      name: "Dr. Test Alpha",
      specialty: "Medicina General",
      license: "MD-ALPHA-TEST",
      location: {
        lat: 38.9532,
        lng: 1.2989,
        address: "Cala de Bou, Ibiza"
      },
      available: true,
      experience: "15 años",
      price: 60,
      rating: 4.8,
      verified: true,
      distance: 0.1
    }
  ];

  // Filtrar por parámetros de consulta
  const { lat, lng, distance, verified } = req.query;
  
  // Por simplicidad, siempre devolver Dr Test Alpha
  res.status(200).json(doctors);
}
