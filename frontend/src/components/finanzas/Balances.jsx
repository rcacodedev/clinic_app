import React, { useState, useEffect } from 'react';
import { getBalanceFinanzas } from '../../services/finanzasService'; // Asumimos que tienes esta función para obtener los balances
import '../../styles/finanzas/balances.css'

const Balances = () => {
  const [balances, setBalances] = useState(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const data = await getBalanceFinanzas(); // Obtenemos los balances
        setBalances(data);
      } catch (error) {
        console.error("Error al cargar los balances", error);
      }
    };

    fetchBalances();
  }, []);

  if (!balances) {
    return <div className="cargando">Cargando...</div>;
  }

  return (
    <div className="balances-container">
        <h2>Resumen de Balances</h2>
        <div className="balance-card-container">
          {/* Columna de Ingresos */}
          <div className="balance-column">
            <h3>Ingresos</h3>
            <div className="balance-card">
              <h4>Trimestral</h4>
              <p>{balances.ingresos_trimestre} USD</p>
            </div>
            <div className="balance-card">
              <h4>Mensual</h4>
              <p>{balances.ingresos_mes} USD</p>
            </div>
            <div className="balance-card">
              <h4>Anual</h4>
              <p>{balances.ingresos_anio} USD</p>
            </div>
          </div>

          {/* Columna de Ingresos Cotizados */}
          <div className="balance-column">
            <h3>Ingresos Cotizados</h3>
            <div className="balance-card">
              <h4>Trimestral</h4>
              <p>{balances.ingresos_cotizados_trimestre} USD</p>
            </div>
            <div className="balance-card">
              <h4>Mensual</h4>
              <p>{balances.ingresos_cotizados_mes} USD</p>
            </div>
            <div className="balance-card">
              <h4>Anual</h4>
              <p>{balances.ingresos_cotizados_anio} USD</p>
            </div>
          </div>

          {/* Columna de Gastos */}
          <div className="balance-column">
            <h3>Gastos</h3>
            <div className="balance-card">
              <h4>Trimestral</h4>
              <p>{balances.gastos_trimestre} USD</p>
            </div>
            <div className="balance-card">
              <h4>Mensual</h4>
              <p>{balances.gastos_mes} USD</p>
            </div>
            <div className="balance-card">
              <h4>Anual</h4>
              <p>{balances.gastos_anio} USD</p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Balances;
