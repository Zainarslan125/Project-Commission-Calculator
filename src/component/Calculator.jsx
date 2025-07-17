import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CommissionCalculator() {
  const [budget, setBudget] = useState(1000);
  const [commissionPct, setCommissionPct] = useState(5);
  const [estimatedDays, setEstimatedDays] = useState(10);
  const [actualDays, setActualDays] = useState(8);
  const [gracePeriod, setGracePeriod] = useState(0);
  const [technicalCount, setTechnicalCount] = useState(2);
  const [nonTechnicalCount, setNonTechnicalCount] = useState(1);
  const [results, setResults] = useState(null);

  useEffect(() => {
    calculateCommission();
  }, [budget, commissionPct, estimatedDays, actualDays, gracePeriod, technicalCount, nonTechnicalCount]);

  const calculateCommission = () => {
    if (
      budget <= 0 ||
      commissionPct <= 0 ||
      estimatedDays <= 0 ||
      actualDays <= 0 ||
      gracePeriod < 0 ||
      technicalCount < 0 ||
      nonTechnicalCount < 0
    ) {
      setResults({ error: "All values must be valid and greater than zero where applicable." });
      return;
    }

    const graceLimit = estimatedDays + gracePeriod;
    if (actualDays > graceLimit) {
      setResults({
        error: null,
        commissionPool: "0.00",
        speedMultiplier: "0.00",
        finalPool: "0.00",
        technicalShare: "0.00",
        nonTechnicalShare: "0.00",
        graceExceeded: true
      });
      return;
    }

    const commissionPool = (budget * commissionPct) / 100;
    let speedMultiplier = estimatedDays / actualDays;
    if (speedMultiplier > 1.5) speedMultiplier = 1.5;
    else if (speedMultiplier < 0.5) speedMultiplier = 0.5;

    const finalPool = commissionPool * speedMultiplier;

    const technicalWeight = 1;
    const nonTechnicalWeight = 0.5;

    const totalWeight = technicalCount * technicalWeight + nonTechnicalCount * nonTechnicalWeight;

    if (totalWeight === 0) {
      setResults({ error: "At least one person (technical or non-technical) must be involved." });
      return;
    }

    const perWeightShare = finalPool / totalWeight;

    const technicalShare = technicalCount > 0 ? (perWeightShare * technicalWeight).toFixed(2) : null;
    const nonTechnicalShare = nonTechnicalCount > 0 ? (perWeightShare * nonTechnicalWeight).toFixed(2) : null;

    setResults({
      finalPool: finalPool.toFixed(2),
      commissionPool: commissionPool.toFixed(2),
      speedMultiplier: speedMultiplier.toFixed(2),
      technicalShare,
      nonTechnicalShare,
      graceExceeded: false
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Project Commission Calculator</h2>
      <Card className="space-y-4 p-4">
        <CardContent className="space-y-4">
          <div>
            <Label>Project Budget ($)</Label>
            <Input type="text" value={budget} onChange={e => setBudget(+e.target.value)} />
          </div>
          <div>
            <Label>Commission %</Label>
            <Input type="text" value={commissionPct} onChange={e => setCommissionPct(+e.target.value)} />
          </div>
          <div>
            <Label>Estimated Days</Label>
            <Input type="text" value={estimatedDays} onChange={e => setEstimatedDays(+e.target.value)} />
          </div>
          <div>
            <Label>Grace Period (Days)</Label>
            <Input type="text" value={gracePeriod} onChange={e => setGracePeriod(+e.target.value)} />
          </div>
          <div>
            <Label>Actual Days</Label>
            <Input type="text" value={actualDays} onChange={e => setActualDays(+e.target.value)} />
          </div>
          <div>
            <Label>Technical Persons</Label>
            <Input type="text" value={technicalCount} onChange={e => setTechnicalCount(+e.target.value)} />
          </div>
          <div>
            <Label>Non-Technical Persons</Label>
            <Input type="text" value={nonTechnicalCount} onChange={e => setNonTechnicalCount(+e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="mt-6 space-y-2">
          {results.error ? (
            <p className="text-red-600 font-semibold">{results.error}</p>
          ) : (
            <>
              <h3 className="text-xl font-semibold">Results</h3>
              {results.graceExceeded ? (
                <p className="text-yellow-600 font-semibold">Project exceeded the grace period. No commission awarded.</p>
              ) : (
                <>
                  <p>Base Commission Pool (5%): <strong>${results.commissionPool}</strong></p>
                  <p>Speed Multiplier: <strong>{results.speedMultiplier}x</strong></p>
                  <p>Total Adjusted Pool: <strong>${results.finalPool}</strong></p>
                  {results.technicalShare && (
                    <p>Per Technical Person Share: <strong>${results.technicalShare}</strong></p>
                  )}
                  {results.nonTechnicalShare && (
                    <p>Per Non-Technical Person Share: <strong>${results.nonTechnicalShare}</strong></p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
