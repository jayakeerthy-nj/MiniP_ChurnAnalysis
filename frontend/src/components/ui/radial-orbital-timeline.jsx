"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link as LinkIcon, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RadialOrbitalTimeline({
  timelineData = [],
  className = "",
  isHeroBackground = false,
  radius = 230,
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [viewMode] = useState("orbital");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [centerOffset] = useState({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const centerViewOnNode = (nodeId) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId) => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = {};
      Object.keys(prev).forEach((key) => {
        const numericKey = parseInt(key, 10);
        if (numericKey !== id) {
          newState[numericKey] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const currentRadius = isHeroBackground ? radius : 185;
    const radian = (angle * Math.PI) / 180;

    const x = currentRadius * Math.cos(radian) + centerOffset.x;
    const y = (currentRadius * 0.78) * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const baseOpacity = isHeroBackground ? 0.35 : 0.45;
    const maxOpacity = isHeroBackground ? 0.75 : 1;
    const opacity = Math.max(
      baseOpacity,
      Math.min(maxOpacity, baseOpacity + (maxOpacity - baseOpacity) * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center overflow-hidden relative select-none ${
        isHeroBackground ? "bg-transparent pointer-events-none" : "bg-black rounded-2xl border border-neutral-800"
      } ${className}`}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Background Ambience / Glow */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0,transparent_65%)] pointer-events-none ${isHeroBackground ? "opacity-60" : ""}`} />

      <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1200px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Glowing Core */}
          <div className={`absolute w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/80 via-blue-500/70 to-teal-400/80 animate-pulse flex items-center justify-center z-10 ${
            isHeroBackground ? "opacity-40 blur-[1px] shadow-[0_0_80px_rgba(59,130,246,0.5)]" : "shadow-[0_0_50px_rgba(59,130,246,0.6)]"
          }`}>
            <div className="absolute w-28 h-28 rounded-full border border-blue-400/20 animate-ping opacity-60"></div>
            <div
              className="absolute w-36 h-36 rounded-full border border-indigo-400/15 animate-ping opacity-40"
              style={{ animationDelay: "0.6s" }}
            ></div>
            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-inner"></div>
          </div>

          {/* Orbital Track Rings */}
          <div
            className={`absolute rounded-full border border-white/15 border-dashed ${
              isHeroBackground ? "w-[480px] h-[380px] opacity-40" : "w-[370px] h-[370px]"
            }`}
          ></div>
          <div
            className={`absolute rounded-full border border-white/5 ${
              isHeroBackground ? "w-[620px] h-[480px] opacity-30" : "w-[470px] h-[470px]"
            }`}
          ></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = !!pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className={`absolute transition-all duration-700 cursor-pointer ${
                  isHeroBackground ? "pointer-events-auto" : ""
                }`}
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Energy Pulse Ring */}
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                {/* Node Icon Circle */}
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    isExpanded
                      ? "bg-white text-black scale-150 shadow-xl shadow-white/30"
                      : isRelated
                      ? "bg-white/80 text-black animate-pulse"
                      : isHeroBackground
                      ? "bg-black/80 text-white/90 backdrop-blur-md hover:border-white hover:text-white"
                      : "bg-black text-white hover:border-white/80"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-white"
                      : isRelated
                      ? "border-white"
                      : isHeroBackground
                      ? "border-white/30 hover:border-white/80 shadow-md shadow-blue-500/20"
                      : "border-white/40"
                  }
                  transition-all duration-300 transform
                `}
                >
                  <Icon size={16} />
                </div>

                {/* Node Title Label */}
                <div
                  className={`
                  absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[11px] font-medium tracking-wider font-grotesk
                  transition-all duration-300
                  ${isExpanded ? "text-white scale-110 font-bold" : isHeroBackground ? "text-neutral-400 hover:text-white" : "text-white/70 hover:text-white"}
                `}
                >
                  {item.title}
                </div>

                {/* Detail Popover Card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/95 backdrop-blur-xl border-white/30 shadow-2xl shadow-blue-500/20 overflow-visible z-[250] text-left pointer-events-auto">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/60"></div>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 py-0.5 text-[10px] ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "OPERATIONAL"
                            : item.status === "in-progress"
                            ? "ACTIVE ENGINE"
                            : "QUEUED PIPELINE"}
                        </Badge>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm mt-2 text-white font-grotesk font-medium">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-neutral-300 px-4 pb-4">
                      <p className="leading-relaxed font-light">{item.content}</p>

                      <div className="mt-3.5 pt-3 border-t border-neutral-800">
                        <div className="flex justify-between items-center text-[11px] mb-1.5 text-neutral-400">
                          <span className="flex items-center">
                            <Zap size={12} className="mr-1 text-amber-400" />
                            Engine Confidence / Throughput
                          </span>
                          <span className="font-mono text-white font-medium">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds && item.relatedIds.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-neutral-800">
                          <div className="flex items-center mb-2">
                            <LinkIcon size={12} className="text-neutral-400 mr-1.5" />
                            <h4 className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                              Connected Pipeline Stages
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2.5 py-0 text-[11px] rounded border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white transition-all font-grotesk"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={10}
                                    className="ml-1 text-neutral-400"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { RadialOrbitalTimeline };
