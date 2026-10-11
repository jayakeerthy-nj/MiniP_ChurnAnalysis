import React, { useState, useRef, useEffect } from "react";
import { useModel } from "../../context/ModelContext";
import {
  Cpu,
  Layers,
  ChevronDown,
  Check,
  Info,
  Sparkles,
  Sliders,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export const ModelSelector = ({
  size = "md", // "sm" | "md" | "lg"
  variant = "default", // "default" | "compact" | "card"
  onModelChange,
  showCombineDetails = true
}) => {
  const {
    models,
    combinableModels,
    selectedModelId,
    isCombinedMode,
    combinedModels,
    activeModel,
    selectModel,
    setCombinedSelection,
    toggleCombinedMode
  } = useModel();

  const [isOpen, setIsOpen] = useState(false);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [tempCombine, setTempCombine] = useState(combinedModels);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (modelId) => {
    if (modelId === "combined") {
      setTempCombine(combinedModels.length === 2 ? combinedModels : ["xgboost", "catboost"]);
      setShowCombineModal(true);
      setIsOpen(false);
      return;
    }
    selectModel(modelId);
    setIsOpen(false);
    if (onModelChange) {
      onModelChange({ modelId, isCombined: false, combinedModels: null });
    }
  };

  const handleToggleCombineModel = (mId) => {
    // Cannot toggle custom model
    if (mId === "bankshield_hybrid") return;

    if (tempCombine.includes(mId)) {
      if (tempCombine.length > 1) {
        setTempCombine(tempCombine.filter((id) => id !== mId));
      }
    } else {
      if (tempCombine.length < 2) {
        setTempCombine([...tempCombine, mId]);
      } else {
        // Replace second model
        setTempCombine([tempCombine[0], mId]);
      }
    }
  };

  const applyCombine = () => {
    setCombinedSelection(tempCombine);
    setShowCombineModal(false);
    if (onModelChange) {
      onModelChange({
        modelId: "combined",
        isCombined: true,
        combinedModels: tempCombine
      });
    }
  };

  // Compact variant for Header
  if (variant === "compact") {
    return (
      <div className="relative font-mono" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle hover:bg-surface-hover border border-border rounded text-[11px] text-muted transition-colors cursor-pointer"
          title="Select Churn Prediction Model"
        >
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span className="text-neutral-400">ENGINE:</span>
          <span
            className={`font-semibold tracking-wide ${
              isCombinedMode
                ? "text-purple-400"
                : activeModel.isCustom
                ? "text-emerald-400"
                : "text-cyan-400"
            }`}
          >
            {activeModel.shortName.toUpperCase()}
          </span>
          <ChevronDown className="w-3 h-3 text-neutral-500 ml-0.5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-surface border border-neutral-700/80 rounded-md shadow-2xl z-50 py-1.5 backdrop-blur-md">
            <div className="px-3 py-1.5 border-b border-border text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
              <span>Select Active ML Model</span>
              <span className="text-primary text-[9px]">Live Inference</span>
            </div>

            <div className="max-h-72 overflow-y-auto py-1 divide-y divide-neutral-800/60">
              {/* Standalone & Custom Models */}
              <div className="py-1">
                {models.map((m) => {
                  const isSelected = !isCombinedMode && selectedModelId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelect(m.id)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                        isSelected ? "bg-primary/10 text-white" : "text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {m.isCustom ? (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Cpu className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            {m.name}
                            {m.isCustom && (
                              <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                PROPRIETARY
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400">{m.type}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Combine 2 Models Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleSelect("combined")}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                    isCombinedMode ? "bg-purple-500/10 text-white" : "text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-purple-300">
                        Combine 2 Models...
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Ensemble standalone models (50/50 blend)
                      </div>
                    </div>
                  </div>
                  {isCombinedMode && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Model Combination */}
        {showCombineModal && (
          <CombineModal
            models={models}
            combinableModels={combinableModels}
            tempCombine={tempCombine}
            onToggle={handleToggleCombineModel}
            onApply={applyCombine}
            onClose={() => setShowCombineModal(false)}
          />
        )}
      </div>
    );
  }

  // Full / Default Variant
  return (
    <div className="w-full font-sans" ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-subtle border border-border rounded-lg shadow-sm">
        {/* Active Model Indicator & Label */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
              isCombinedMode
                ? "bg-purple-950/40 border-purple-800 text-purple-400"
                : activeModel.isCustom
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                : "bg-cyan-950/40 border-cyan-800 text-cyan-400"
            }`}
          >
            {isCombinedMode ? (
              <Layers className="w-4 h-4" />
            ) : activeModel.isCustom ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-muted flex items-center gap-2">
              <span>Active Inference Engine</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  isCombinedMode
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : activeModel.isCustom
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                }`}
              >
                {activeModel.badge}
              </span>
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{activeModel.name}</span>
              <span className="text-xs font-mono font-normal text-neutral-400 hidden md:inline">
                ({activeModel.type})
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown & Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Main Select Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-neutral-700 rounded-md text-xs font-mono text-neutral-200 transition-colors shadow-sm cursor-pointer"
            >
              <span>Switch Model</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-neutral-700 rounded-lg shadow-2xl z-50 py-2 divide-y divide-neutral-800 backdrop-blur-md">
                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                  <span>ML Engine Options</span>
                  <span className="text-primary font-bold">Holdout ROC-AUC</span>
                </div>

                <div className="py-1">
                  {models.map((m) => {
                    const isSelected = !isCombinedMode && selectedModelId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelect(m.id)}
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                          isSelected ? "bg-primary/10 text-white" : "text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {m.isCustom ? (
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Cpu className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-xs flex items-center gap-1.5">
                              {m.name}
                              {m.isCustom && (
                                <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                              {m.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-neutral-400">{(m.rocAuc * 100).toFixed(1)}%</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Combine 2 Models */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelect("combined")}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-surface-hover transition-colors ${
                      isCombinedMode ? "bg-purple-500/10 text-white" : "text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-purple-300">
                          Combine Any 2 Standalone Models...
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          Soft-voting probability ensemble (50% / 50%)
                        </div>
                      </div>
                    </div>
                    {isCombinedMode && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Combine Button */}
          <button
            type="button"
            onClick={() => {
              setTempCombine(combinedModels.length === 2 ? combinedModels : ["xgboost", "catboost"]);
              setShowCombineModal(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border transition-colors cursor-pointer ${
              isCombinedMode
                ? "bg-purple-950/50 border-purple-700 text-purple-300 hover:bg-purple-900/50"
                : "bg-surface hover:bg-surface-hover border-neutral-700 text-neutral-300"
            }`}
            title="Configure model combination"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCombinedMode ? "Config Blend" : "Combine Models"}</span>
          </button>
        </div>
      </div>

      {/* Combine Modal */}
      {showCombineModal && (
        <CombineModal
          models={models}
          combinableModels={combinableModels}
          tempCombine={tempCombine}
          onToggle={handleToggleCombineModel}
          onApply={applyCombine}
          onClose={() => setShowCombineModal(false)}
        />
      )}
    </div>
  );
};

// Sub-component: Model Combination Modal
const CombineModal = ({
  models,
  combinableModels,
  tempCombine,
  onToggle,
  onApply,
  onClose
}) => {
  const customModel = models.find((m) => m.id === "bankshield_hybrid");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-neutral-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Combine Standalone Models (Ensemble Blend)
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Select up to <strong>2 standalone models</strong> to produce a blended soft-voting probability.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-lg p-1"
          >
            &times;
          </button>
        </div>

        {/* Rule Alert Banner */}
        <div className="p-3 bg-neutral-900/90 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-neutral-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Model Combination Rule:</span>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              <strong>BankShield-Hybrid</strong> is our custom proprietary architecture (multi-layer stacking with Platt calibration) and <strong>cannot</strong> be included in combinations. You can combine any 2 standalone models below (e.g., XGBoost + CatBoost).
            </p>
          </div>
        </div>

        {/* Model Selection Grid */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase font-mono text-neutral-400 tracking-wider">
            Available Models for Combination ({tempCombine.length}/2 Selected)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {combinableModels.map((m) => {
              const isChecked = tempCombine.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => onToggle(m.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isChecked
                      ? "bg-purple-950/30 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/50"
                      : "bg-surface-subtle hover:bg-surface-hover border-border text-neutral-300"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        ({(m.rocAuc * 100).toFixed(1)}% ROC)
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                      {m.type}
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-neutral-600 bg-surface"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}

            {/* Custom Hybrid Model (Exempt Card) */}
            {customModel && (
              <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-500 opacity-60 cursor-not-allowed flex items-start justify-between gap-2 sm:col-span-2">
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5 text-neutral-400">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500/50" />
                    <span>{customModel.name}</span>
                    <span className="px-1.5 py-0.2 text-[9px] bg-red-950/50 text-red-400 border border-red-900 rounded font-mono">
                      EXCLUDED FROM COMBINATION
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Proprietary custom stacking framework — cannot be combined with standalone models.
                  </div>
                </div>
                <div className="text-[10px] font-mono text-neutral-600 shrink-0">LOCKED</div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Summary Pill */}
        <div className="p-2.5 bg-surface-subtle border border-border rounded-lg text-xs font-mono flex items-center justify-between">
          <span className="text-neutral-400 text-[11px]">Active Combination:</span>
          <span className="text-purple-300 font-bold">
            {tempCombine.length === 2
              ? `${models.find((m) => m.id === tempCombine[0])?.shortName || tempCombine[0]} (50%) + ${
                  models.find((m) => m.id === tempCombine[1])?.shortName || tempCombine[1]
                } (50%)`
              : tempCombine.length === 1
              ? `${models.find((m) => m.id === tempCombine[0])?.shortName} (Select 1 more)`
              : "Please select 2 models"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={tempCombine.length === 0}
            className="px-4 py-2 text-xs font-mono font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <span>Apply Ensemble Blend</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
