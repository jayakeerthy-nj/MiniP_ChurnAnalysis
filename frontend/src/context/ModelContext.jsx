import React, { createContext, useContext, useState, useEffect } from "react";
import { analyticsApi } from "../services/api";

const FALLBACK_MODELS = [
  {
    id: "bankshield_hybrid",
    name: "BankShield-Hybrid (Custom)",
    shortName: "BankShield-Hybrid",
    type: "Custom Hybrid Stacking",
    description: "Proprietary multi-layer stacking ensemble (XGBoost + CatBoost + LightGBM) with Logistic Meta-Learner, Platt Calibration, and Behavioral Guardrails",
    accuracy: 0.9845,
    rocAuc: 0.9980,
    f1: 0.9421,
    isCustom: true,
    canCombine: false,
    badge: "CUSTOM HYBRID",
    color: "emerald"
  },
  {
    id: "xgboost",
    name: "XGBoost",
    shortName: "XGBoost",
    type: "Gradient Boosted Trees",
    description: "Scalable extreme gradient boosted tree classifier with second-order gradients and regularization",
    accuracy: 0.9825,
    rocAuc: 0.9978,
    f1: 0.9360,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "cyan"
  },
  {
    id: "catboost",
    name: "CatBoost",
    shortName: "CatBoost",
    type: "Symmetric Trees",
    description: "Oblivious decision trees with ordered target statistics and minimal prediction shift",
    accuracy: 0.9815,
    rocAuc: 0.9977,
    f1: 0.9326,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "amber"
  },
  {
    id: "lightgbm",
    name: "LightGBM",
    shortName: "LightGBM",
    type: "Histogram GBDT",
    description: "Fast histogram-based gradient boosting framework with leaf-wise tree growth",
    accuracy: 0.9825,
    rocAuc: 0.9977,
    f1: 0.9353,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "blue"
  },
  {
    id: "random_forest",
    name: "Random Forest",
    shortName: "Random Forest",
    type: "Bagging Ensemble",
    description: "Ensemble of 100 decorrelated decision trees with bootstrap aggregation and random feature subsets",
    accuracy: 0.9770,
    rocAuc: 0.9960,
    f1: 0.9179,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "purple"
  },
  {
    id: "logistic_regression",
    name: "Logistic Regression",
    shortName: "Logistic Reg.",
    type: "Linear Classifier",
    description: "L2-regularized linear probability model providing interpretable log-odds baseline",
    accuracy: 0.9505,
    rocAuc: 0.9898,
    f1: 0.8358,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "zinc"
  }
];

const ModelContext = createContext(null);

export const ModelProvider = ({ children }) => {
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [loading, setLoading] = useState(true);

  // Read saved preferences from localStorage
  const [selectedModelId, setSelectedModelIdState] = useState(() => {
    try {
      return localStorage.getItem("bankshield_selected_model") || "bankshield_hybrid";
    } catch {
      return "bankshield_hybrid";
    }
  });

  const [isCombinedMode, setIsCombinedModeState] = useState(() => {
    try {
      return localStorage.getItem("bankshield_is_combined") === "true";
    } catch {
      return false;
    }
  });

  const [combinedModels, setCombinedModelsState] = useState(() => {
    try {
      const saved = localStorage.getItem("bankshield_combined_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure custom model is not in saved list
        return parsed.filter((m) => m !== "bankshield_hybrid").slice(0, 2);
      }
    } catch {}
    return ["xgboost", "catboost"];
  });

  // Load model catalog from backend
  useEffect(() => {
    let isMounted = true;
    const fetchModels = async () => {
      try {
        const res = await analyticsApi.getAvailableModels();
        if (res.data?.models && isMounted) {
          setModels(res.data.models);
        }
      } catch (err) {
        // Fallback already in state
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchModels();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectModel = (modelId) => {
    if (modelId === "combined") {
      setIsCombinedModeState(true);
      try {
        localStorage.setItem("bankshield_is_combined", "true");
      } catch {}
      return;
    }

    setIsCombinedModeState(false);
    setSelectedModelIdState(modelId);
    try {
      localStorage.setItem("bankshield_is_combined", "false");
      localStorage.setItem("bankshield_selected_model", modelId);
    } catch {}
  };

  const setCombinedSelection = (modelsArray) => {
    // Constraint: Never allow custom hybrid model in combinations
    const filtered = modelsArray
      .filter((m) => m !== "bankshield_hybrid")
      .slice(0, 2);

    setCombinedModelsState(filtered);
    setIsCombinedModeState(true);
    try {
      localStorage.setItem("bankshield_is_combined", "true");
      localStorage.setItem("bankshield_combined_models", JSON.stringify(filtered));
    } catch {}
  };

  const toggleCombinedMode = (enable) => {
    setIsCombinedModeState(enable);
    try {
      localStorage.setItem("bankshield_is_combined", enable ? "true" : "false");
    } catch {}
  };

  // Determine active model display object
  const activeModel = React.useMemo(() => {
    if (isCombinedMode) {
      const names = combinedModels.map((mId) => {
        const found = models.find((m) => m.id === mId);
        return found ? found.shortName : mId.toUpperCase();
      });
      return {
        id: "combined",
        name: `Combined Ensemble (${names.join(" + ") || "Select 2 Models"})`,
        shortName: `Ensemble (${names.join("+")})`,
        type: "Ensemble Soft-Voting (50/50)",
        description: `Blended average probability of ${names.join(" and ")}. Custom BankShield-Hybrid is excluded.`,
        isCustom: false,
        isCombined: true,
        combinedModels,
        badge: "COMBINED (2 MODELS)",
        color: "indigo"
      };
    }

    const found = models.find((m) => m.id === selectedModelId);
    return found || models[0];
  }, [isCombinedMode, combinedModels, selectedModelId, models]);

  const combinableModels = React.useMemo(() => {
    return models.filter((m) => m.canCombine);
  }, [models]);

  return (
    <ModelContext.Provider
      value={{
        models,
        combinableModels,
        selectedModelId,
        isCombinedMode,
        combinedModels,
        activeModel,
        loading,
        selectModel,
        setCombinedSelection,
        toggleCombinedMode
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
};
