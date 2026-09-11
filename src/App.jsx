import { useEffect, useMemo, useState } from "react";
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
  const [assistantStatus, setAssistantStatus] = useState("Ready for trade details");

  const isTradeComplete = useMemo(
    () => Boolean(trade.currencyPair && trade.position && trade.lotSize && trade.issuer && trade.price),
    [trade]
  );

  const calculateRisk = (tradeInput) => {
    const lotSize = Number(tradeInput.lotSize);
    const riskLevel = lotSize >= 5000000 ? "HIGH" : lotSize >= 2000000 ? "MEDIUM" : "LOW";
    const confidence = riskLevel === "HIGH" ? 91 : riskLevel === "MEDIUM" ? 87 : 94;
    return { level: riskLevel, confidence };
  };

  const runPreDealCheckForTrade = (tradeInput, { automated = false } = {}) => {
    setValidationError("");
    setRiskResult(null);
    setDecision(null);

    if (!tradeInput.currencyPair || !tradeInput.position || !tradeInput.lotSize || !tradeInput.issuer || !tradeInput.price) {
      setValidationError("Please provide all mandatory trade parameters before running the check.");
      setAssistantStatus("Waiting for missing trade details");
      return;
    }

    setIsChecking(true);
    setAssistantStatus(automated ? "Running automated pre-deal assessment" : "Running pre-deal assessment");
    setTimeout(() => {
      setRiskResult(calculateRisk(tradeInput));
      setIsChecking(false);
      setAssistantStatus("Recommendation ready — human decision required");
    }, automated ? 700 : 1200);
  };

  useEffect(() => {
    if (!isTradeComplete || isExtracting || activeTab !== "tryIt") return undefined;

    setAssistantStatus("Trade complete — running risk assessment automatically");
    const timer = setTimeout(() => {
      runPreDealCheckForTrade(trade, { automated: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [trade, isTradeComplete, isExtracting, activeTab]);

  const handleChange = (field, value) => {
    setTrade((previous) => {
      const nextTrade = { ...previous, [field]: value };
      setRiskResult(null);
      setDecision(null);
      setValidationError("");
      setAssistantStatus("Trade updated — completing assessment automatically");
      return nextTrade;
    });
  };

  const extractTradeFromMessage = () => {
    setValidationError("");
    setIsExtracting(true);
    setRiskResult(null);
    setDecision(null);
    setAssistantStatus("Understanding your trade request");

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

      const extractedTrade = { currencyPair, position, lotSize, issuer, price };
      setTrade(extractedTrade);
      setIsExtracting(false);

      const complete = Object.values(extractedTrade).every(Boolean);
      if (complete) {
        setAssistantStatus("Trade captured — automatic risk assessment queued");
      } else {
        setAssistantStatus("Trade captured — complete the highlighted details");
        setValidationError("I captured what I could. Please complete the missing mandatory trade details below.");
      }
    }, 650);
  };

  const runPreDealCheck = () => runPreDealCheckForTrade(trade);
  const approveTrade = () => {
    setDecision("APPROVED");
    setAssistantStatus("Human decision recorded — trade approved");
  };
  const rejectTrade = () => {
    setDecision("REJECTED");
    setAssistantStatus("Human decision recorded — trade rejected");
  };

  return (
    <>
      <header className="header">
        <div className="header-shell">
          <div>
            <div className="eyebrow">FX PRE-DEAL RISK · PRODUCT PROTOTYPE</div>
            <h1>From manual controls to guided decisions</h1>
            <p>{process.name}</p>
          </div>
          <div className="header-status-card">
            <span className="status-dot" />
            <div>
              <strong>Human-in-the-loop</strong>
              <span>AI recommends. Risk officers decide.</span>
            </div>
          </div>
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
            <div className="section-heading tryme-heading">
              <div>
                <span className="section-label">INTERACTIVE PROTOTYPE</span>
                <h2>AI-Assisted FX Pre-Deal Check</h2>
                <p>Enter a trade naturally or fill the structured inputs. Once the required details are complete, the assistant produces a risk recommendation while keeping the final decision with a human reviewer.</p>
              </div>
              <div className="live-status"><span className="pulse" /><div><span>Agent status</span><strong>{assistantStatus}</strong></div></div>
            </div>

            <div className="tryme-grid">
              <div className="conversation-card premium-panel">
                <div className="conversation-header">
                  <div>
                    <span className="section-label">CONVERSATIONAL AGENT</span>
                    <h3>Describe the trade</h3>
                    <p>Example: “Buy EUR/USD for 2 million from ABC Bank at 1.1740.” If all required fields are detected, the risk check starts automatically.</p>
                  </div>
                  <span className="prototype-badge">AI ASSISTED</span>
                </div>
                <div className="conversation-input-area">
                  <textarea value={tradeMessage} onChange={(e) => setTradeMessage(e.target.value)} placeholder="Describe the intended FX trade..." rows="5" />
                  <div className="conversation-actions">
                    <button className="extract-button" onClick={extractTradeFromMessage} disabled={isExtracting || !tradeMessage.trim()}>
                      {isExtracting ? "Understanding trade..." : "Submit to Agent"}
                    </button>
                    <span className="microcopy">No approval is automated.</span>
                  </div>
                </div>
              </div>

              <aside className="guardrail-summary premium-panel">
                <span className="section-label">CONTROL FRAMEWORK</span>
                <h3>Human guardrails remain in force</h3>
                <div className="guardrail-list">
                  <div><span>01</span><p><strong>AI extracts</strong><br />Trade parameters are parsed from natural language.</p></div>
                  <div><span>02</span><p><strong>AI recommends</strong><br />Risk classification is generated automatically.</p></div>
                  <div><span>03</span><p><strong>Human decides</strong><br />Approve or reject remains a risk-officer action.</p></div>
                </div>
              </aside>
            </div>

            <div className="trade-card premium-panel">
              <div className="trade-card-header">
                <div><span className="section-label">STRUCTURED TRADE DATA</span><h3>Trade details</h3></div>
                <span className={`completion-badge ${isTradeComplete ? "complete" : "incomplete"}`}>{isTradeComplete ? "AUTO-CHECKING" : "REQUIRES INPUT"}</span>
              </div>
              <div className="trade-form">
                <div className="form-field"><label>Currency pair</label><select value={trade.currencyPair} onChange={(e) => handleChange("currencyPair", e.target.value)}><option value="">Select</option><option>EUR/USD</option><option>GBP/USD</option><option>USD/JPY</option><option>USD/CHF</option></select></div>
                <div className="form-field"><label>Position</label><select value={trade.position} onChange={(e) => handleChange("position", e.target.value)}><option value="">Select</option><option>BUY</option><option>SELL</option></select></div>
                <div className="form-field"><label>Lot size</label><input className={!trade.lotSize ? "missing" : ""} type="number" placeholder="e.g. 2000000" value={trade.lotSize} onChange={(e) => handleChange("lotSize", e.target.value)} /></div>
                <div className="form-field"><label>Issuer name</label><input className={!trade.issuer ? "missing" : ""} type="text" placeholder="e.g. ABC Bank" value={trade.issuer} onChange={(e) => handleChange("issuer", e.target.value)} /></div>
                <div className="form-field full-width"><label>Price</label><input className={!trade.price ? "missing" : ""} type="number" step="0.0001" placeholder="e.g. 1.1740" value={trade.price} onChange={(e) => handleChange("price", e.target.value)} /></div>
              </div>

              <div className="check-bar">
                <div><span className="section-label">PRE-DEAL ASSESSMENT</span><p>The assessment starts automatically as soon as all mandatory inputs are complete. The button remains available only as a manual refresh.</p></div>
                <button className="run-check-button" onClick={runPreDealCheck} disabled={isChecking || !isTradeComplete}>{isChecking ? "Checking..." : "Refresh Check"}</button>
              </div>

              {validationError && <div className="validation-message">⚠ {validationError}</div>}

              {riskResult && (
                <div className="risk-result-card">
                  <div className="risk-result-header">
                    <div><span className="section-label">ML CREDIT RISK CLASSIFICATION</span><h3>Recommendation ready</h3></div>
                    <div className={`risk-badge ${riskResult.level.toLowerCase()}`}>{riskResult.level} RISK</div>
                  </div>
                  <div className="risk-details">
                    <div><span>Model confidence</span><strong>{riskResult.confidence}%</strong></div>
                    <div><span>Decision status</span><strong>Human review required</strong></div>
                    <div><span>Trade</span><strong>{trade.position} {trade.currencyPair}</strong></div>
                    <div><span>Notional</span><strong>{Number(trade.lotSize).toLocaleString()}</strong></div>
                  </div>
                  <div className="human-guardrail"><div className="guardrail-icon">◎</div><div><strong>Risk Officer Control Point</strong><p>This model output is advisory. The trade cannot proceed until an authorized human reviewer records the final decision.</p></div></div>
                  <div className="risk-actions"><button className="approve-button" onClick={approveTrade}>Approve trade</button><button className="reject-button" onClick={rejectTrade}>Reject trade</button></div>
                </div>
              )}

              {decision && (
                <div className={`decision-result ${decision.toLowerCase()}`}>
                  <div className="decision-icon">{decision === "APPROVED" ? "✓" : "!"}</div>
                  <div><span className="section-label">FINAL HUMAN DECISION</span><h3>{decision === "APPROVED" ? "Trade approved" : "Trade rejected"}</h3><p>{decision === "APPROVED" ? "The authorized reviewer approved this trade after the AI-assisted pre-deal assessment." : "The authorized reviewer rejected this trade. Further review is required before proceeding."}</p></div>
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
