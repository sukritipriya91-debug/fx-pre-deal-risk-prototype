function ProcessStep({ step, isToBe = false }) {
  return (
    <div className={`process-step ${step.painPoint ? "pain-point" : ""}`}>
      <div className="step-number">
        {step.number}
      </div>

      <div className="step-content">
        <h3>{step.title}</h3>
        <p>{step.description}</p>

        {step.painPoint && !isToBe && (
          <span className="pain-label">
            Pain point
          </span>
        )}
      </div>
    </div>
  );
}

export default ProcessStep;