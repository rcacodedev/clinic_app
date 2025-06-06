import React from 'react';

function TablaCitas({ titulo, citas, onPrecioClick, onToggleClick }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-black mb-4 border-b-4 border-tan text-left">
        {titulo}
      </h2>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Paciente</th>
              <th scope="col" className="px-6 py-3">Hora</th>
              <th scope="col" className="px-6 py-3">Precio</th>
              <th scope="col" className="px-6 py-3">Cotizada</th>
              <th scope="col" className="px-6 py-3">Efectivo</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Editar</span></th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {cita.patient_name} {cita.patient_primer_apellido}
                </th>
                <td className="px-6 py-4">{cita.comenzar}</td>
                <td className="px-6 py-4">
                  <button onClick={() => onPrecioClick(cita)} className="text-blue-600 hover:underline">💰</button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleClick(cita.id, 'cotizada')}
                    className={`font-medium ${cita.cotizada ? 'text-green-600' : 'text-gray-600'} hover:underline`}
                  >
                    📋
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleClick(cita.id, 'efectivo')}
                    className={`font-medium ${cita.efectivo ? 'text-green-600' : 'text-gray-600'} hover:underline`}
                  >
                    💵
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaCitas;
