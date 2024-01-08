import React from "react";
import { Info } from "lucide-react";

import InfoModal from "../modals/InfoModal";

function Header({ showInfo }) {
  return (
    <header>
      <h1 className="">Football Connections</h1>
      {showInfo && <InfoModal trigger={<Info />} />}
    </header>
  );
}

export default Header;
