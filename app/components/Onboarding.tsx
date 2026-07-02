"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSession } from "@/lib/api";

export const ONBOARDING_STORAGE_KEY = "sima_onboarding_done";
export const ONBOARDING_OPEN_EVENT = "sima:show-onboarding";

const CLIENT_STEP_COUNT = 7;
const STAFF_STEP_COUNT = 4;

type StepSet = "client" | "staff";

function resolveStepSet(): StepSet {
  const session = getSession();
  const role = session?.client?.role;
  return role === "SUPER_ADMIN" || role === "MODERATOR" ? "staff" : "client";
}

export default function Onboarding() {
  const t = useTranslations("onboarding");
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [stepSet, setStepSet] = useState<StepSet>("client");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStepSet(resolveStepSet());
    if (localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "true") {
      setVisible(true);
    }
    function onOpen() {
      setStepSet(resolveStepSet());
      setStep(0);
      setVisible(true);
    }
    window.addEventListener(ONBOARDING_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ONBOARDING_OPEN_EVENT, onOpen);
  }, []);

  function finish() {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  const totalSteps = stepSet === "staff" ? STAFF_STEP_COUNT : CLIENT_STEP_COUNT;
  const stepNum = step + 1;
  const isLast = step === totalSteps - 1;
  const stepKey = `step${stepNum}`;

  return (
    <>
      <style>{`
        @keyframes onboardIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9000] bg-primary/60 backdrop-blur-[3px]"
        onClick={finish}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(`${stepSet}.${stepKey}Title`)}
        className="fixed inset-0 z-[9001] flex items-center justify-center px-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-[0_24px_64px_rgba(29,29,29,0.24)]"
          style={{ animation: "onboardIn 220ms cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? "var(--accent, #B08D57)" : "var(--line, #e5e5e5)" }}
              />
            ))}
          </div>

          {/* Step label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            {t("of", { step: stepNum, total: totalSteps })}
          </p>

          {/* Title */}
          <h2 className="font-serif text-xl font-bold text-primary mb-3">
            {t(`${stepSet}.${stepKey}Title`)}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted leading-relaxed mb-8">
            {t(`${stepSet}.${stepKey}Text`)}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={finish}
              className="text-sm text-muted hover:text-primary transition-colors px-2 py-1"
            >
              {t("skip")}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="text-sm font-medium text-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-bg"
                >
                  ←
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(176,141,87,0.25)] active:translate-y-0"
              >
                {isLast ? t("done") : t("next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
