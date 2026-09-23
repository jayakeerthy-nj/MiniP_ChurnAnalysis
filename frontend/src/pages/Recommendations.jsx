import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recommendationApi, analyticsApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CustomerRiskBadge } from "../components/customers/CustomerRiskBadge";
import { Loading } from "../components/ui/Loading";
import { formatPercent } from "../utils/formatters";
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executiveBrief, setExecutiveBrief] = useState(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recommendationApi.getRecommendations();
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to load retention recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const generateExecutiveBrief = async () => {
    try {
      setGeneratingBrief(true);
      const res = await analyticsApi.getExecutiveBrief();
      setExecutiveBrief(res.data.brief || res.data.executiveBrief);
    } catch (e) {
      console.error("Brief generation error:", e);
      setExecutiveBrief("Executive intelligence brief synthesis is temporarily offline. Operational recommendation queues remain active.");
    } finally {
      setGeneratingBrief(false);
    }
  };

  if (loading) {
    return <Loading message="Formulating Retention Recommendations..." fullPage />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        category="PRESCRIPTIVE ACTION ENGINE"
        title="Customer Retention & Intervention Strategy"
        subtitle="Automated intervention blueprints matching high-vulnerability customer profiles with tailored relationship manager workflows and service recovery protocols."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={generateExecutiveBrief}
            loading={generatingBrief}
            icon={Sparkles}
            className="font-mono uppercase text-xs tracking-wider"
          >
            Generate Executive AI Brief
          </Button>
        }
      />

      {/* AI Executive Strategy Brief Card */}
      {executiveBrief && (
        <div className="p-5 bg-primary/10 border border-primary/30 rounded-md space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-primary font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Gemini Executive Retention Intelligence Brief</span>
          </div>
          <div className="text-xs text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
            {executiveBrief}
          </div>
        </div>
      )}

      {/* Recommendations Queue */}
      <Card
        title="Prioritized Customer Action Queue"
        subtitle="Prescriptive intervention plans ordered by risk severity and revenue impact"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="bank-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Risk Tier</th>
                <th>Primary Risk Driver</th>
                <th>Prescribed Action</th>
                <th>Priority</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted font-mono">
                    No open retention recommendations at this time
                  </td>
                </tr>
              ) : (
                recommendations.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="font-semibold text-white">
                        {rec.customerName || rec.name}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {rec.customerId}
                      </div>
                    </td>
                    <td>
                      <CustomerRiskBadge
                        level={rec.riskLevel || rec.predictedRiskLevel}
                        probability={rec.churnProbability || rec.predictedChurnProb}
                      />
                    </td>
                    <td className="font-mono text-xs text-neutral-300">
                      {rec.primaryDriver || rec.driver || "Low Transaction Velocity"}
                    </td>
                    <td>
                      <div className="font-medium text-white text-xs">
                        {rec.actionTitle || rec.recommendedAction}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5 max-w-sm">
                        {rec.actionDetail || rec.reason}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                          rec.priority === "URGENT" || rec.priority === "HIGH"
                            ? "bg-red-950/60 text-red-400 border-red-600/30"
                            : rec.priority === "MEDIUM"
                            ? "bg-amber-950/60 text-amber-400 border-amber-600/30"
                            : "bg-emerald-950/60 text-emerald-400 border-emerald-600/30"
                        }`}
                      >
                        {rec.priority || "NORMAL"}
                      </span>
                    </td>
                    <td className="text-right font-mono">
                      <Link
                        to={`/customers/${rec.customerId}`}
                        className="text-[11px] text-primary hover:text-white font-semibold inline-flex items-center gap-1"
                      >
                        <span>EXECUTE</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Recommendations;
