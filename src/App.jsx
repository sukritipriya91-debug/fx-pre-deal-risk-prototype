import { useState } from "react";
import ProcessStep from "./components/ProcessStep";
import MetricCard from "./components/MetricCard";
import process from "./data/process.json";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("asIs");

  // Phase 2: Interactive trade inputs
  const [trade, setTrade] = useState({
  currencyPair: "EUR/USD",
  position: "BUY",
  lotSize: "",
  issuer: "",
  price: ""
});

const [riskResult, setRiskResult] = useState(null);
const [isChecking, setIsChecking] = useState(false);
const [validationError, setValidationError] = useState("");
const [tradeMessage, setTradeMessage] = useState("");
const [isExtracting, setIsExtracting] = useState(false);
const [decision, setDecision] = useState(null);
const [auditTrail, setAuditTrail] = useState([]);
  const handleChange = (field, value) => {
  setTrade((previousTrade) => ({
    ...previousTrade,
    [field]: value
  }));
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

    // Currency pair
    if (message.includes("eur/usd")) {
      currencyPair = "EUR/USD";
    } else if (message.includes("gbp/usd")) {
      currencyPair = "GBP/USD";
    } else if (message.includes("usd/jpy")) {
      currencyPair = "USD/JPY";
    } else if (message.includes("usd/chf")) {
      currencyPair = "USD/CHF";
    }

    // Position
    if (
      message.includes("buy") ||
      message.includes("purchase")
    ) {
      position = "BUY";
    } else if (message.includes("sell")) {
      position = "SELL";
    }

    // Lot size
    const lotMatch = message.match(
      /([\d,.]+)\s*(million|m|bn|billion)/
    );

    if (lotMatch) {
      let number = parseFloat(
        lotMatch[1].replace(/,/g, "")
      );

      const unit = lotMatch[2];

      if (
        unit === "million" ||
        unit === "m"
      ) {
        number = number * 1000000;
      }

      if (
        unit === "billion" ||
        unit === "bn"
      ) {
        number = number * 1000000000;
      }

      lotSize = String(number);
    }

    // Price
    const priceMatch = message.match(
      /(?:at|price)\s*([0-9]+(?:\.[0-9]+)?)/i
    );

    if (priceMatch) {
      price = priceMatch[1];
    }

    // Issuer
    const issuerMatch = message.match(
      /(?:from|issuer)\s+([a-zA-Z\s]+?)(?=\s+at\s+|\s+price\s+|$)/i
    );

    if (issuerMatch) {
      issuer = issuerMatch[1].trim();
    }

    setTrade((previousTrade) => ({
      ...previousTrade,
      currencyPair,
      position,
      lotSize,
      issuer,
      price
    }));

    setIsExtracting(false);
  }, 800);
};
const approveTrade = () => {
  setDecision("APPROVED");

  setAuditTrail((previousTrail) => [
    ...previousTrail,
    {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      event: "Human risk review completed",
      detail: "Risk officer approved the trade"
    }
  ]);
};

const rejectTrade = () => {
  setDecision("REJECTED");

  setAuditTrail((previousTrail) => [
    ...previousTrail,
    {
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      event: "Human risk review completed",
      detail: "Risk officer rejected the trade"
    }
  ]);
};

const runPreDealCheck = () => {
  setValidationError("");
  setRiskResult(null);
  setDecision(null);
  setAuditTrail([]);

  // Validate mandatory parameters
  if (
    !trade.currencyPair ||
    !trade.position ||
    !trade.lotSize ||
    !trade.issuer ||
    !trade.price
  ) {
    setValidationError(
      "Please provide all mandatory trade parameters before running the check."
    );
    return;
  }

  setIsChecking(true);

  // Simulate ML model processing time
  setTimeout(() => {
    const lotSize = Number(trade.lotSize);

    let riskLevel;
    let confidence;

    /*
      Simulated classification logic.

      This is NOT a real credit-risk model.
      It is only being used to demonstrate
      the product experience.
    */

    if (lotSize >= 5000000) {
      riskLevel = "HIGH";
      confidence = 91;
    } else if (lotSize >= 2000000) {
      riskLevel = "MEDIUM";
      confidence = 87;
    } else {
      riskLevel = "LOW";
      confidence = 94;
    }

    setRiskResult({
  level: riskLevel,
  confidence: confidence
});

setAuditTrail([
  {
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    event: "ML credit risk classification completed",
    detail: `${riskLevel} risk identified with ${confidence}% model confidence`
  }
]);

setIsChecking(false);
  }, 1500);
};
  return (
    <>
      <header className="header">
        <div>
          <div className="eyebrow">
            PRODUCT PROTOTYPE
          </div>

          <h1>
            AS-IS → TO-BE
          </h1>

          <p>
            {process.name}
          </p>
        </div>
      </header>

      <main className="container">

        <div className="tabs">

          <button
            className={activeTab === "asIs" ? "active" : ""}
            onClick={() => setActiveTab("asIs")}
          >
            AS-IS
          </button>

          <button
            className={activeTab === "toBe" ? "active" : ""}
            onClick={() => setActiveTab("toBe")}
          >
            TO-BE
          </button>

          <button
            className={activeTab === "tryIt" ? "active" : ""}
            onClick={() => setActiveTab("tryIt")}
          >
            TRY IT
          </button>

        </div>

        {/* AS-IS */}

        {activeTab === "asIs" && (

          <section>

            <div className="section-heading">

              <div>
                <span className="section-label">
                  CURRENT STATE
                </span>

                <h2>
                  {process.asIs.title}
                </h2>
              </div>

              <div className="problem-box">
                ⚠ Multiple screens and manual steps
              </div>

            </div>

            <div className="process-list">

              {process.asIs.steps.map((step) => (

                <ProcessStep
                  key={step.number}
                  step={step}
                />

              ))}

            </div>

          </section>

        )}

        {/* TO-BE */}

        {activeTab === "toBe" && (

          <section>

            <div className="section-heading">

              <div>
                <span className="section-label">
                  FUTURE STATE
                </span>

                <h2>
                  {process.toBe.title}
                </h2>
              </div>

              <div className="success-box">
                ✓ Simplified trading workflow
              </div>

            </div>

            <div className="process-list">

              {process.toBe.steps.map((step) => (

                <ProcessStep
                  key={step.number}
                  step={step}
                  isToBe={true}
                />

              ))}

            </div>

            <div className="metrics">

              <MetricCard
                label="Screens"
                before={process.metrics.screensBefore}
                after={process.metrics.screensAfter}
              />

              <MetricCard
                label="Manual steps"
                before={process.metrics.manualStepsBefore}
                after={process.metrics.manualStepsAfter}
              />

              <MetricCard
                label="Efficiency"
                before="Baseline"
                after={process.metrics.estimatedEfficiencyImprovement}
              />

            </div>

          </section>

        )}

        {/* TRY IT */}

        {activeTab === "tryIt" && (

          <section>

            <div className="section-heading">

              <div>
                <span className="section-label">
                  INTERACTIVE PROTOTYPE
                </span>

                <h2>
                  AI-Assisted FX Pre-Deal Check
                </h2>

                <p>
                  Enter the trade parameters below to simulate
                  the new pre-deal risk workflow.
                </p>
              </div>

            </div>
<div className="conversation-card">

  <div className="conversation-header">
    <div>
      <span className="section-label">
        CONVERSATIONAL AI
      </span>

      <h3>
        Describe your trade
      </h3>

      <p>
        Enter the trade in natural language and the
        assistant will identify the required parameters.
      </p>
    </div>

    <span className="prototype-badge">
      AI PROTOTYPE
    </span>
  </div>

  <div className="conversation-input-area">

    <textarea
      value={tradeMessage}
      onChange={(e) =>
        setTradeMessage(e.target.value)
      }ß
      placeholder="Example: I want to buy EUR/USD for 2 million from ABC Bank at 1.1740."
      rows="4"
    />

    <button
      className="extract-button"
      onClick={extractTradeFromMessage}
      disabled={isExtracting || !tradeMessage.trim()}
    >
      {isExtracting
        ? "Understanding trade..."
        : "Extract Trade Details"}
    </button>

  </div>

</div>
            <div className="trade-card">

              <div className="trade-card-header">
                <h3>
                  Trade details
                </h3>

                <span className="prototype-badge">
                  PROTOTYPE
                </span>
              </div>

              <div className="trade-form">

                <div className="form-field">

                  <label>
                    Currency pair
                  </label>

                  <select
                    value={trade.currencyPair}
                    onChange={(e) =>
                      handleChange(
                        "currencyPair",
                        e.target.value
                      )
                    }
                  >
                    <option>EUR/USD</option>
                    <option>GBP/USD</option>
                    <option>USD/JPY</option>
                    <option>USD/CHF</option>
                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Position
                  </label>

                  <select
                    value={trade.position}
                    onChange={(e) =>
                      handleChange(
                        "position",
                        e.target.value
                      )
                    }
                  >
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Lot size
                  </label>

                  <input
                    type="number"
                    placeholder="e.g. 2000000"
                    value={trade.lotSize}
                    onChange={(e) =>
                      handleChange(
                        "lotSize",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-field">

                  <label>
                    Issuer name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. ABC Bank"
                    value={trade.issuer}
                    onChange={(e) =>
                      handleChange(
                        "issuer",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="form-field">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 1.1740"
                    value={trade.price}
                    onChange={(e) =>
                      handleChange(
                        "price",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <button
                className="run-check-button"
                onClick={runPreDealCheck}
                disabled={isChecking}
              >
                {isChecking ? "Running Credit Risk Check..." : "Run Pre-Deal Check"}
              </button>

              {validationError && (
                <div className="validation-message">
                  ⚠ {validationError}
                </div>
              )}

              {riskResult && (
                <div className="risk-result-card">
                  <div className="risk-result-header">
                    <div>
                      <span className="section-label">
                        ML CREDIT RISK CLASSIFICATION
                      </span>

                      <h3>Credit Risk Result</h3>
                    </div>

                    <div className={`risk-badge ${riskResult.level.toLowerCase()}`}>
                      {riskResult.level}
                    </div>
                  </div>

                  <div className="risk-details">
                    <div>
                      <span>Model confidence</span>
                      <strong>{riskResult.confidence}%</strong>
                    </div>

                    <div>
                      <span>Decision status</span>
                      <strong>Human review required</strong>
                    </div>
                  </div>

                  <div className="human-guardrail">
                    <div className="guardrail-icon">
                      👤
                    </div>

                    <div>
                      <strong>
                        Risk Officer Review
                      </strong>

                      <p>
                        The ML classification provides a recommendation.
                        A risk officer remains the human decision-maker
                        before any trade-related data is modified.
                      </p>
                    </div>
                  </div>

                  <div className="risk-actions">
                    <button 
                      className="approve-button"
                      onClick={approveTrade}
                    >
                      Approve
                    </button>

                    <button 
                      className="reject-button"
                      onClick={rejectTrade}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {decision && (
                <div className={`decision-result ${decision.toLowerCase()}`}>
                  <div className="decision-icon">
                    {decision === "APPROVED" ? "✓" : "!"}
                  </div>

                  <div>
                    <span className="section-label">
                      FINAL DECISION
                    </span>

                    <h3>
                      {decision === "APPROVED"
                        ? "Trade approved"
                        : "Trade rejected"}
                    </h3>

                    <p>
                      {decision === "APPROVED"
                        ? "The trade has passed the pre-deal credit risk review."
                        : "The trade cannot proceed and requires further review."}
                    </p>
                  </div>
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
