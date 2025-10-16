// src/App.tsx
import React from "react";
import { TonConnectUIProvider, TonConnectButton } from "@tonconnect/ui-react";
import { TON_CONNECT_MANIFEST_URL } from "./constants.js";
import PoCComponent from "./PoCComponent.js";

function App() {
  return (
    <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
      <div style={{ minHeight: "100vh", position: "relative", padding: 20 }}>
        <header style={{ position: "absolute", top: 10, right: 10 }}>
          <TonConnectButton />
        </header>

        <main style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
          <div style={{ width: 720 }}>
            <h1>CandleSpinner PoC</h1>
            <PoCComponent />
          </div>
        </main>
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
