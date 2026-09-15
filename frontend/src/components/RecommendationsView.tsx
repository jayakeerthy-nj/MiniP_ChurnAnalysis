"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Sparkles, ShieldAlert, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executiveBrief, setExecutiveBrief] = useState<string | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const { setSelectedCustomerId } = useAuthStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/recommendations");
      setRecommendations(res.data.recommendations || []);
    } catch (e) {
      console.error("Recommendations error:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateExecutiveBrief = async () => {
    try {
      setGeneratingBrief(true);
      const res = await api.get("/analytics/executive-brief");
      setExecutiveBrief(res.data.brief);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingBrief(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="panel-tag">PRESCRIPTIVE RETENTION ENGINE</span>
          <h2 className="text-xl font-bold text-white">Targeted Business Retention Interventions</h2>
          <p className="text-xs text-muted mt-1">
            Algorithmic rules mapping high-risk customer segments to high-impact retention workflows.
          </p>
        </div>
        <button
          onClick={generateExecutiveBrief}
          disabled={generatingBrief}
          className="btn-cyan-sm flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>{generatingBrief ? "Synthesizing Brief..." : "Generate Gemini Executive Briefing"}</span>
        </button>
      </div>

      {executiveBrief && (
        <div className="panel-card border-cyanMain/50 bg-[#00b4d8]/5">
          <div className="flex items-center gap-2 text-cyanBright font-semibold text-sm mb-2">
            <Sparkles size={16} /> Gemini AI Executive Strategic Risk Directive
          </div>
          <p className="text-white text-sm whitespace-pre-line leading-relaxed">{executiveBrief}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-cyanMain font-mono animate-pulse">
          Evaluating retention heuristics across portfolio...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="panel-card hover:border-cyanMain/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-subtle text-muted border border-borderBright">
                    {rec.id} &bull; {rec.category}
                  </span>
                  <span className="tag-pill font-mono" style={{ backgroundColor: `${rec.badgeColor}22`, color: rec.badgeColor }}>
                    {rec.priority} PRIORITY
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{rec.title}</h3>
                <p className="text-xs text-muted mb-4 leading-relaxed">{rec.rationale}</p>

                <div className="p-3 bg-subtle rounded-lg border border-borderMuted mb-4">
                  <span className="text-[11px] text-cyanMain font-semibold block uppercase tracking-wider mb-1">
                    Recommended Strategic Action
                  </span>
                  <p className="text-xs text-white font-medium">{rec.action}</p>
                </div>

                <div className="mb-4">
                  <span className="text-[11px] text-muted block mb-1.5 font-mono">SUPPORTING SIGNALS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.signals?.map((s: string) => (
                      <span key={s} className="tag-pill tag-neutral text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="pt-3 border-t border-borderMuted">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted">Target Customer Pool:</span>
                    <span className="font-mono text-cyanBright font-bold">{rec.targetCount} Accounts Identified</span>
                  </div>

                  {rec.sampleCustomers?.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {rec.sampleCustomers.slice(0, 3).map((sc: any) => (
                        <div key={sc.customerId} className="flex items-center justify-between text-xs p-1.5 bg-app rounded border border-borderMuted">
                          <button
                            onClick={() => setSelectedCustomerId(sc.customerId)}
                            className="text-white hover:text-cyanBright text-left font-medium"
                          >
                            {sc.name} <span className="font-mono text-muted text-[10px]">({sc.customerId})</span>
                          </button>
                          <span className="font-mono text-cyanBright">₹{Number(sc.currentBalance).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};