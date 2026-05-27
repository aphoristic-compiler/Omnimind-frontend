"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Everything you need, completely free",
    price: { monthly: 0, annual: 0 },
    features: [
      "Unlimited uploads",
      "Unlimited storage",
      "Semantic AI search",
      "AI-powered insights",
      "Unlimited collaborators",
      "Advanced analytics",
      "API access",
      "Custom integrations",
    ],
    cta: "Start exploring",
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Start free,
            <br />
            <span className="text-stroke">always free</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            No credit card required. No hidden fees. Upgrade anytime if you need more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex justify-center">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className="relative p-8 lg:p-10 bg-card border-2 border-foreground max-w-lg w-full"
            >
              <span className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-primary-foreground text-xs font-mono uppercase tracking-widest">
                Forever Free
              </span>

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="font-display text-4xl lg:text-5xl text-foreground">{plan.name}</h3>
                <p className="text-base text-muted-foreground mt-3">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl text-foreground font-bold">
                    $0
                  </span>
                  <span className="text-lg text-muted-foreground">/forever</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button className="w-full py-4 flex items-center justify-center gap-2 text-base font-medium transition-all group bg-foreground text-primary-foreground hover:bg-foreground/90 rounded-lg">
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No credit card required. No hidden fees. No restrictions.
        </p>
      </div>
    </section>
  );
}
