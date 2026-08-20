import { useState } from "react";
import ProcessStep from "./Components/ProcessStep";
import MetricCard from "./Components/MetricCard";
import process from "./Data/process.json";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("asIs");
  const [trade, setTrade] = useState({ currencyPair: "EUR/USD", position: "BUY", lotSize: "", issuer: "", price: "" });
  const [riskResult, setRiskResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [decision, setDecision] = useState(null);

  const handleChange = (field, value) => {
    setTrade((previous) => ({ ...previous, [field]: value }));
  };

  const extractTradeFromMessage = () => {
    setValidationError("");
    setIsExtracting(true);

    setTimeout(() => {
      const message = tradeMessage.toLowerCase();
      let currencyPair = "";
      let position = "";
      let lotSize = "";
      let issuer = "";
      let price = "";

      if (message.includes("eur/usd")) currencyPair = "EUR/USD";
      else if (message.includes("gbp/usd")) currencyPair = "GBP/USD";
      else if (message.includes("usd/jpy")) currencyPair = "USD/JPY";
      else if (message.includes("usd/chf")) currencyPair = "USD/CHF";

      if (message.includes("buy") || message.includes("purchase")) position = "BUY";
      else if (message.includes("sell")) position = "SELL";

      const lotMatch = message.match(/([\d,.]+)\s*(million|m|bn|billion)/);
      if (lotMatch) {
        let number = parseFloat(lotMatch[1].replace(/,/g, ""));
        if (lotMatch[2] === "million" || lotMatch[2] === "m") number *= 1000000;
        if (lotMatch[2] === "billion" || lotMatch[2] === "bn") number *= 1000000000;
        lotSize = String(number);
      }

      const priceMatch = message.match(/(?:at|price)\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (priceMatch) price = priceMatch[1];

      const issuerMatch = message.match(/(?:from|issuer)\s+([a-zA-Z\s]+?)(?=\s+at\s+|\s+price\s+|$)/i);
      if (issuerMatch) issuer = issuerMatch[1].trim();

      setTrade((previous) => ({ ...previous, currencyPair, position, lotSize, issuer, price }));
      setIsExtracting(false);
    }, 800);
  };

  const runPreDealCheck = () => {
    setValidationError("");
    setRiskResult(null);
    setDecision(null);

    if (!trade.currencyPair || !trade.position || !trade.lotSize || !trade.issuer || !trade.price) {
      setValidationError("Please provide all mandatory trade parameters before running the check.");
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      const lotSize = Number(trade.lotSize);
      const riskLevel = lotSize >= 5000000 ? "HIGH" : lotSize >= 2000000 ? "MEDIUM" : "LOW";
      const confidence = riskLevel === "HIGH" ? 91 : riskLevel === "MEDIUM" ? 87 : 94;
      setRiskResult({ level: riskLevel, confidence });
      setIsChecking(false);
    }, 1500);
  };

  const approveTrade = () => setDecision("APPROVED");
  const rejectTrade = () => setDecision("REJECTED");

  return (
    <>
      <header className="header">
        <div>
          <div className="eyebrow">PRODUCT PROTOTYPE</div>
          <h1>AS-IS → TO-BE</h1>
          <p>{process.name}</p>
        </div>
      </header>

      <main className="container">
        <nav className="tabs" aria-label="Prototype views">
          <button className={activeTab === "asIs" ? "active" : ""} onClick={() => setActiveTab("asIs")} aria-current={activeTab === "asIs" ? "page" : undefined}>AS-IS</button>
          <button className={activeTab === "toBe" ? "active" : ""} onClick={() => setActiveTab("toBe")} aria-current={activeTab === "toBe" ? "page" : undefined}>TO-BE</button>
          <button className={activeTab === "tryIt" ? "active" : ""} onClick={() => setActiveTab("tryIt")} aria-current={activeTab === "tryIt" ? "page" : undefined}>TRY ME</button>
        </nav>

        {activeTab === "asIs" && (
          <section>
            <div className="section-heading">
              <div><span className="section-label">CURRENT STATE</span><h2>{process.asIs.title}</h2></div>
              <div className="problem-box">⚠ Multiple screens and manual steps</div>
            </div>
            <div className="process-list">
              {process.asIs.steps.map((step) => <ProcessStep key={step.number} step={step} />)}
            </div>
          </section>
        )}

        {activeTab === "toBe" && (
          <section>
            <div className="section-heading">
              <div><span className="section-label">FUTURE STATE</span><h2>{process.toBe.title}</h2></div>
              <div className="success-box">✓ Simplified trading workflow</div>
            </div>
            <div className="process-list">
              {process.toBe.steps.map((step) => <ProcessStep key={step.number} step={step} isToBe />)}
            </div>
            <div className="metrics">
              <MetricCard label="Screens" before={process.metrics.screensBefore} after={process.metrics.screensAfter} />
              <MetricCard label="Manual steps" before={process.metrics.manualStepsBefore} after={process.metrics.manualStepsAfter} />
              <MetricCard label="Efficiency" before="Baseline" after={process.metrics.estimatedEfficiencyImprovement} />
            </div>
          </section>
        )}

        {activeTab === "tryIt" && (
          <section>
            <div className="section-heading">
              <div>
                <span className="section-label">INTERACTIVE PROTOTYPE</span>
                <h2>AI-Assisted FX Pre-Deal Check</h2>
                <p>Describe a trade in natural language, review the extracted details, and simulate the pre-deal risk workflow.</p>
              </div>
            </div>

            <div className="conversation-card">
              <div className="conversation-header">
                <div>
                  <span className="section-label">CONVERSATIONAL AI</span>
                  <h3>Describe your trade</h3>
                  <p>Start with a simple sentence. The assistant will identify the currency pair, position, size, issuer and price.</p>
                </div>
                <span className="prototype-badge">AI PROTOTYPE</span>
              </div>
              <div className="conversation-input-area">
                <textarea value={tradeMessage} onChange={(e) => setTradeMessage(e.target.value)} placeholder="Example: I want to buy EUR/USD for 2 million from ABC Bank at 1.1740." rows="4" />
                <button className="extract-button" onClick={extractTradeFromMessage} disabled={isExtracting || !tradeMessage.trim()}>
                  {isExtracting ? "Understanding trade..." : "Extract Trade Details"}
                </button>
              </div>
            </div>

            <div className="trade-card">
              <div className="trade-card-header">
                <h3>Trade details</h3>
                <span className="prototype-badge">REVIEW & EDIT</span>
              </div>
              <div className="trade-form">
                <div className="form-field"><label>Currency pair</label><select value={trade.currencyPair} onChange={(e) => handleChange("currencyPair", e.target.value)}><option>EUR/USD</option><option>GBP/USD</option><option>USD/JPY</option><option>USD/CHF</option></select></div>
                <div className="form-field"><label>Position</label><select value={trade.position} onChange={(e) => handleChange("position", e.target.value)}><option>BUY</option><option>SELL</option></select></div>
                <div className="form-field"><label>Lot size</label><input type="number" placeholder="e.g. 2000000" value={trade.lotSize} onChange={(e) => handleChange("lotSize", e.target.value)} /></div>
                <div className="form-field"><label>Issuer name</label><input type="text" placeholder="e.g. ABC Bank" value={trade.issuer} onChange={(e) => handleChange("issuer", e.target.value)} /></div>
                <div className="form-field"><label>Price</label><input type="number" step="0.0001" placeholder="e.g. 1.1740" value={trade.price} onChange={(e) => handleChange("price", e.target.value)} /></div>
              </div>
              <button className="run-check-button" onClick={runPreDealCheck} disabled={isChecking}>{isChecking ? "Running Credit Risk Check..." : "Run Pre-Deal Check"}</button>
              {validationError && <div className="validation-message">⚠ {validationError}</div>}

              {riskResult && (
                <div className="risk-result-card">
                  <div className="risk-result-header">
                    <div><span className="section-label">ML CREDIT RISK CLASSIFICATION</span><h3>Credit Risk Result</h3></div>
                    <div className={`risk-badge ${riskResult.level.toLowerCase()}`}>{riskResult.level}</div>
                  </div>
                  <div className="risk-details">
                    <div><span>Model confidence</span><strong>{riskResult.confidence}%</strong></div>
                    <div><span>Decision status</span><strong>Human review required</strong></div>
                  </div>
                  <div className="human-guardrail"><div className="guardrail-icon">👤</div><div><strong>Risk Officer Review</strong><p>The ML classification provides a recommendation. A risk officer remains the human decision-maker before the trade proceeds.</p></div></div>
                  <div className="risk-actions"><button className="approve-button" onClick={approveTrade}>Approve</button><button className="reject-button" onClick={rejectTrade}>Reject</button></div>
                </div>
              )}

              {decision && (
                <div className={`decision-result ${decision.toLowerCase()}`}>
                  <div className="decision-icon">{decision === "APPROVED" ? "✓" : "!"}</div>
                  <div><span className="section-label">FINAL DECISION</span><h3>{decision === "APPROVED" ? "Trade approved" : "Trade rejected"}</h3><p>{decision === "APPROVED" ? "The trade has passed the pre-deal credit risk review." : "The trade cannot proceed and requires further review."}</p></div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default App;
