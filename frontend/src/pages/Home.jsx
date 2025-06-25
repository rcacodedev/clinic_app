import React, { useEffect, useState } from "react";
import Agenda from "../components/Agenda/Agenda";
import CitasHoyYManana from "../components/citas/CitasHome";
function Home() {
  return (
    <div className="main-container">
      <Agenda />
      <CitasHoyYManana />
    </div>
  );
}

export default Home;
