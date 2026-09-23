import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    ArrowLeft, BookOpen, Check, X, Coins, Trophy, Sparkles, Clock,
    ChevronRight, Lightbulb, Play, GraduationCap, TrendingUp, Calculator,
    Scale, Target, Brain, LineChart, Search, Plus, Trash2, Layers,
    ArrowRightLeft, PiggyBank, BarChart3, Zap, Wallet,
} from "lucide-react";
import "../Styles/semana1.css"; // botones, quiz, reward, monedas…
import "../Styles/semana2.css"; // word-count, sim…
import "../Styles/semana3.css"; // teach, formula, step-solver…
import "../Styles/semana5.css"; // estilos propios de la semana 5
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu hook está en otro lado

/* =====================================================================
   SEMANA 5 · PROJECT EVALUATION & INVESTMENTS
   The capstone of the math: NPV/VPN, IRR/TIR, B/C, Payback (PRI),
   risk vs return, fixed vs variable income, and FICs / Tyba.
   It reuses present value (W3) and rate math to decide if a real
   investment creates wealth. Saves to Progreso_Semanas (Semana: 5).
   ===================================================================== */

const SECTION_KEYS = ["reading", "check", "npvtir", "bcpri", "risk", "explore", "final"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Coins per activity ---- */
const XP = {
    reading: 20,
    checkCorrect: 4,      // ~10 questions
    npvtir: 40,           // NPV & IRR problems
    bcpri: 35,            // B/C & Payback problems
    risk: 25,             // risk/return + fixed/variable match
    explore: 25,          // research Tyba / funds
    finalCorrect: 7,      // capstone exam
};

/* =====================================================================
   CONTENT
   ===================================================================== */
const OBJECTIVES = [
    "Explain the four key indicators: NPV (VPN), IRR (TIR), B/C and Payback (PRI).",
    "Decide whether a project creates value using NPV and its decision rule.",
    "Read the risk vs return spectrum and tell fixed income from variable income.",
    "Understand collective investment funds (FICs) and platforms like Tyba.",
    "Combine present value, rates and indicators to judge a real investment.",
];
const DELIVERABLES = [
    "Read the project-evaluation chapter and pass a comprehension check.",
    "Calculate NPV and IRR for real cases with a cash-flow calculator.",
    "Work out Benefit-Cost and Payback, and link them to earlier weeks.",
    "Match risk vs return and fixed vs variable income.",
    "Research Tyba/funds, then pass a capstone: borrow, invest, and judge it with NPV.",
];

/* ---- Reading ---- */
const READING = [
    { h: "1. A financial crossroads" },
    { p: "Imagine you saved COP $1,000,000 this year and face two offers. Proposal A: a friend's food stand promises to pay you a single COP $1,300,000 at the end of 3 years. Proposal B: a bank CDT pays a guaranteed 8% Effective Annual rate every year for 3 years. Which one truly creates value?" },
    { p: "Looking only at the raw numbers is misleading. As you learned in Week 3, money has a time value: receiving COP $1,300,000 three years from now is not the same as holding it today. To decide well, investors use financial feasibility indicators — metrics that check whether a project returns enough to pay for the time and the risk involved." },
    { h: "2. The four indicators you need" },
    { p: "Net Present Value (NPV / VPN) measures the net wealth added to you today. Internal Rate of Return (IRR / TIR) measures the true percentage yield the project produces. The Benefit-Cost ratio (B/C) tells you how many pesos of benefit you get per peso invested. The Payback Period (PRI) tells you how long it takes to recover your original money. NPV and IRR are the two most important." },
    { h: "3. Net Present Value (NPV / VPN)" },
    { p: "NPV brings every future cash flow back to today with a discount rate (r), then subtracts the initial investment. In plain terms: it discounts all the money the project will pay you, adds it up, and compares it to what you put in. The formula is NPV = Σ CFₜ ÷ (1 + r)ᵗ − I₀." },
    { p: "The decision rule is simple. NPV > 0: accept — the project adds wealth beyond your minimum required return. NPV = 0: neutral — it earns exactly your required return. NPV < 0: reject — you'd do better placing your money elsewhere." },
    { h: "4. Internal Rate of Return (IRR / TIR)" },
    { p: "The IRR is the exact discount rate that makes NPV equal to zero — the project's own break-even yield. Its rule: if IRR is greater than your discount rate (your opportunity cost), accept; if it's lower, reject, because you'd earn more elsewhere. NPV tells you value in pesos; IRR tells you value as a percentage." },
    { h: "5. Benefit-Cost (B/C) and Payback (PRI)" },
    { p: "The Benefit-Cost ratio divides the present value of all future inflows by the initial investment. If B/C > 1.0 the project gives more benefit than cost (accept); if B/C < 1.0, costs win (reject). The Payback Period measures the time needed for the cumulative cash flows to repay the initial cost — quick to compute, but the basic version ignores the time value of money." },
    { h: "6. A worked example: the lemonade stand" },
    { p: "Let's evaluate one project completely, step by step. The data: initial investment I₀ = COP $500,000 (the money you put in today, Year 0). Discount rate r = 10% per year (the minimum return you expect — your opportunity cost). Duration: 3 years. Expected inflows: Year 1 = $200,000, Year 2 = $250,000, Year 3 = $200,000." },
    { h: "Step 1 — Bring every future amount back to today (Present Value)" },
    { p: "Each future inflow is worth less today, so we discount it. Year 1: 200,000 ÷ 1.10 = $181,818. Year 2: 250,000 ÷ 1.21 = $206,612. Year 3: 200,000 ÷ 1.331 = $150,263. (Notice we divide by (1 + r) once for Year 1, twice for Year 2, three times for Year 3.)" },
    { h: "Step 2 — Add up the present value of all inflows (Total PV)" },
    { p: "Total PV = 181,818 + 206,612 + 150,263 = $538,693. What this means: brought back to today's pesos, all the future lemonade income is worth the same as having $538,693 in your pocket right now." },
    { h: "Step 3 — Net Present Value (NPV / VPN)" },
    { p: "NPV subtracts what you invested from what you get in today's value: NPV = Total PV − Initial investment = 538,693 − 500,000 = +$38,693. Decision: because NPV is positive (+$38,693 > 0), you accept the project — it earns more than your 10% required return." },
    { h: "Step 4 — Benefit-Cost ratio (B/C)" },
    { p: "B/C compares how much you get back, in present value, for each peso invested: B/C = Total PV ÷ Initial investment = 538,693 ÷ 500,000 = 1.077. Meaning: you recover $1.077 for every $1.00 you invested — a net gain of 7.7% on a discounted basis." },
    { h: "Step 5 — Payback Period (PRI)" },
    { p: "Payback asks when you get your $500,000 back, using the plain (non-discounted) inflows. After Year 1 you've recovered $200,000, so $300,000 is still missing. After Year 2 you add $250,000, leaving $50,000 missing. During Year 3 you'll receive $200,000, but you only need $50,000 of it: 50,000 ÷ 200,000 = 0.25 of the year. So PRI = 2 + 0.25 = 2.25 years (2 years and 3 months)." },
    { p: "Putting it together: Total PV = $538,693 (today's value of the future income); NPV = +$38,693 (net gain above your 10% threshold); B/C = 1.077 ($1.077 back per $1 in); PRI = 2.25 years (time to recover your money). Every indicator agrees — this is a good project." },
    { h: "7. Risk, return, and where to invest" },
    { p: "The fundamental rule across all markets: higher potential return means higher risk. From low to high, the spectrum runs CDTs → collective investment funds → individual stocks → cryptocurrency. Investments split into two classes. Fixed income (renta fija): you lend money to a bank or government for pre-set interest — CDTs, TES bonds — low risk, predictable. Variable income (renta variable): you buy ownership in companies — stocks in Ecopetrol or Bancolombia, real estate, crypto — higher risk, non-guaranteed, bigger upside." },
    { p: "Building a diversified portfolio yourself is expensive and complex. Collective investment funds (FICs) pool money from thousands of small investors into one professionally managed portfolio. Tyba is a popular Colombian app (backed by Credicorp Capital) that lets you start investing in FICs with small amounts from your phone." },
    { p: "The very first thing Tyba does when you sign up is ask you a short set of risk-profiling questions — before you invest a single peso. These questions measure your risk tolerance: how you'd react if your money dropped, how long you plan to invest, and what your goals are. Based on your answers, Tyba labels your profile as conservative, moderate or aggressive. Only after that does it build an automated portfolio for you, spreading your money across fixed income (CDTs, bonds) and variable income (local and global stocks) to match that profile. In short: Tyba profiles your risk first, then invests to fit it." },
];

/* term → meaning in Spanish (the only Spanish in the module) */
const GLOSSARY = {
    "Net Present Value": "Valor Presente Neto (VPN) — la riqueza neta que un proyecto te suma hoy.",
    "Internal Rate of Return": "Tasa Interna de Retorno (TIR) — el % de rentabilidad propio del proyecto.",
    "Benefit-Cost": "Relación Beneficio-Costo (B/C) — cuántos pesos ganas por cada peso invertido.",
    "Payback Period": "Período de Recuperación (PRI) — cuánto tardas en recuperar tu inversión inicial.",
    "discount rate": "Tasa de descuento — tu costo de oportunidad, lo mínimo que exiges ganar.",
    "fixed income": "Renta fija — prestas tu dinero a cambio de intereses fijos (CDT, bonos).",
    "variable income": "Renta variable — compras participación en empresas; el retorno no está garantizado.",
    "collective investment funds": "Fondos de inversión colectiva (FIC) — juntan dinero de muchos en un portafolio administrado.",
};
const KEY_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/* ---- Comprehension (12 questions, IELTS style) ---- */
const CHECK = [
    { q: "Why is comparing raw cash amounts across years misleading?", correct: 0, feedback: "Money has a time value — future pesos are worth less today.", options: ["Because money has a time value.", "Because banks forbid it.", "Because inflation doesn't exist.", "Because cash is always worth more later."] },
    { q: "What does NPV (VPN) measure?", correct: 1, feedback: "The net wealth added to you today, in pesos.", options: ["The project's percentage yield.", "The net wealth added today, in pesos.", "How long to recover your money.", "The bank's monthly fee."] },
    { q: "The NPV decision rule says accept when…", correct: 2, feedback: "NPV > 0 means value added beyond your required return.", options: ["NPV < 0.", "NPV = 0.", "NPV > 0.", "NPV equals the investment."] },
    { q: "What is the IRR (TIR)?", correct: 0, feedback: "The discount rate that makes NPV = 0.", options: ["The discount rate that makes NPV zero.", "The bank's interest on savings.", "The initial investment.", "The total interest paid."] },
    { q: "You accept a project by IRR when…", correct: 3, feedback: "IRR above your discount rate = better than your alternative.", options: ["IRR equals zero.", "IRR is negative.", "IRR is below your discount rate.", "IRR is above your discount rate."] },
    { q: "A B/C ratio of 1.077 means…", correct: 1, feedback: "$1.077 of present-value benefit per $1 invested.", options: ["you lose 7.7% of your money.", "you get $1.077 back per $1 invested.", "the project takes 1.077 years.", "the rate is 1.077%."] },
    { q: "The basic Payback Period's main flaw is that it…", correct: 2, feedback: "It ignores the time value of money.", options: ["is too hard to calculate.", "needs a bank account.", "ignores the time value of money.", "only works for CDTs."] },
    { q: "In the lemonade example, NPV was +$38,693, so you should…", correct: 0, feedback: "Positive NPV → accept.", options: ["accept the project.", "reject the project.", "wait forever.", "borrow more money."] },
    { q: "Fixed income (renta fija) is best described as…", correct: 1, feedback: "Lending for pre-set interest — low risk, predictable.", options: ["buying company ownership.", "lending money for pre-set interest.", "trading cryptocurrency.", "a type of credit card."] },
    { q: "Which sits at the HIGH-risk end of the spectrum?", correct: 3, feedback: "Cryptocurrency is the highest-risk example given.", options: ["CDTs.", "Government bonds.", "A savings pocket.", "Cryptocurrency."] },
    { q: "What problem do collective investment funds (FICs) solve?", correct: 0, feedback: "They pool small investors into one diversified, managed portfolio.", options: ["Building a diversified portfolio alone is costly and complex.", "They remove all risk.", "They pay no returns.", "They are only for banks."] },
    { q: "What does Tyba do first when you sign up?", correct: 2, feedback: "It profiles your risk: conservative, moderate or aggressive.", options: ["Gives you a loan.", "Guarantees 20% returns.", "Profiles your risk tolerance.", "Opens a credit card."] },
];

/* ---- NPV & IRR problems (with the cash-flow calculator) ---- */
const NPVTIR_PROBLEMS = [
    {
        teach: {
            title: "What NPV really does (in one idea)",
            body: "NPV answers: 'after bringing every future payment back to today's value, does this project leave me richer than my alternative?' You already know how — it's Week 3's present value, done to each year's cash flow, then all added up and compared to what you invested. Positive = yes, it adds wealth. The calculator below does the discounting; you read the result and decide.",
            example: "Different case: invest $300,000 at 10%, inflows $150,000 / $150,000 / $100,000. Discount each: 150,000÷1.10 = 136,364; 150,000÷1.21 = 123,967; 100,000÷1.331 = 75,131. Total PV = $335,462, minus $300,000 = NPV +$35,462. Positive → accept. Once you see how it works here, do the lemonade stand below yourself.",
        },
        scenario: "Lemonade stand: I₀ = $500,000, r = 10%, inflows Year 1–3 = $200,000, $250,000, $200,000.",
        steps: [
            { type: "choice", q: "First: what is the discount rate as a decimal?", options: ["0.10", "10", "1.10", "0.010"], correct: 0, feedback: "10% ÷ 100 = 0.10." },
            { type: "number", q: "Present value of Year 2's $250,000? (250,000 ÷ 1.10²)", answer: 206612, tol: 0.02, hint: "1.10² = 1.21 → 250,000 ÷ 1.21", feedback: "250,000 ÷ 1.21 ≈ 206,612." },
            { type: "number", q: "Using the calculator, what's the NPV? (total PV − 500,000)", answer: 38693, tol: 0.03, hint: "Enter I₀, r and the 3 flows; read NPV.", feedback: "NPV ≈ +$38,693 — positive, so the project adds wealth." },
            { type: "choice", q: "The decision?", options: ["Accept — NPV is positive.", "Reject — NPV is positive.", "It doesn't matter."], correct: 0, feedback: "Positive NPV → accept." },
        ],
    },
    {
        teach: {
            title: "IRR: the project's own yield",
            body: "IRR (TIR) is the single rate that would make NPV exactly zero — the break-even percentage the project earns by itself. Compare it to your discount rate: if IRR is higher, the project beats your alternative; if lower, your money is better elsewhere. The calculator finds IRR for you from the same cash flows.",
            example: "Same lemonade stand. Its NPV is positive at a 10% discount rate, which already tells you the IRR must be ABOVE 10%. The calculator computes it exactly. The rule: IRR > 10% → accept.", example: "Different case: invest $100,000, inflows $60,000 / $60,000. At a 10% discount rate the NPV is positive, so the IRR must be above 10% — the calculator shows about 13%. Since 13% > 10%, accept. Now judge the lemonade stand below by its own IRR.",
        },
        scenario: "Same lemonade stand (I₀ $500,000; inflows $200,000 / $250,000 / $200,000). Now judge it by IRR.",
        steps: [
            { type: "choice", q: "IRR is defined as the rate that makes NPV equal to…", options: ["zero.", "the investment.", "the discount rate."], correct: 0, feedback: "IRR is the rate where NPV = 0." },
            { type: "choice", q: "The NPV was positive at 10%. So the IRR must be…", options: ["above 10%.", "exactly 10%.", "below 10%."], correct: 0, feedback: "Positive NPV at 10% means the true yield is higher than 10%." },
            { type: "number", q: "Read the IRR from the calculator (whole %, no decimals).", answer: 15, tol: 0.25, hint: "Enter I₀ and the 3 flows; read IRR %.", feedback: "IRR ≈ 15% — well above the 10% discount rate." },
            { type: "choice", q: "Decision by IRR?", options: ["Accept — IRR beats the 10% discount rate.", "Reject — IRR is too high.", "Ignore it."], correct: 0, feedback: "IRR > discount rate → accept." },
        ],
    },
    {
        teach: {
            title: "Your turn: a bigger project",
            body: "Same method, new numbers. Identify I₀, the discount rate, and each year's inflow. Let the calculator discount and total. If NPV > 0, the project earns more than your required return.",
            example: "Different case: invest $1,000,000 at 12%, inflows $400,000 / $400,000 / $400,000. PVs: 400,000÷1.12 = 357,143; ÷1.2544 = 318,878; ÷1.404928 = 284,713. Total PV = $960,734. NPV = 960,734 − 1,000,000 = −$39,266 → negative, so REJECT. Notice a project can fail. Now try the profitable one below.",
        },
        scenario: "Invest $2,000,000, r = 10%, inflows Year 1–3 = $800,000, $900,000, $800,000.",
        steps: [
            { type: "number", q: "Present value of Year 1's $800,000? (800,000 ÷ 1.10)", answer: 727273, tol: 0.02, hint: "800,000 ÷ 1.10", feedback: "≈ 727,273." },
            { type: "number", q: "What's the total NPV? (use the calculator)", answer: 72127, tol: 0.05, hint: "Total PV − 2,000,000.", feedback: "NPV ≈ +$72,127 — accept." },
            { type: "choice", q: "Is this project financially viable?", options: ["Yes — NPV is positive.", "No — NPV is negative.", "Can't tell."], correct: 0, feedback: "Positive NPV = viable." },
        ],
    },
];

/* ---- B/C & Payback problems (links to earlier weeks) ---- */
const BCPRI_PROBLEMS = [
    {
        teach: {
            title: "Benefit-Cost: pesos back per peso in",
            body: "B/C divides the present value of all future inflows by what you invested. B/C = PV of inflows ÷ I₀. Above 1.0 means each peso invested returns MORE than a peso in today's value (accept). It uses the exact same discounted inflows as NPV — NPV is the difference, B/C is the ratio.",
            example: "Different case: PV of inflows = $660,000, I₀ = $600,000. B/C = 660,000 ÷ 600,000 = 1.10 — you get $1.10 back for every $1, so accept. Then compute the lemonade stand's B/C below yourself.",
        },
        scenario: "Lemonade stand: PV of inflows = $538,693, initial investment = $500,000.",
        steps: [
            { type: "number", q: "Compute B/C = 538,693 ÷ 500,000. (2 decimals, e.g. 1.08)", answer: 1.08, tol: 0.03, hint: "538,693 ÷ 500,000", feedback: "≈ 1.08 — more benefit than cost." },
            { type: "choice", q: "What does B/C > 1.0 tell you?", options: ["Accept — benefits beat costs.", "Reject — costs beat benefits.", "The project is free."], correct: 0, feedback: "B/C above 1.0 → accept." },
        ],
    },
    {
        teach: {
            title: "Payback (PRI): when do I get my money back?",
            body: "Add up the cash flows year by year until they equal your initial cost. The year it crosses is your payback point; for the fraction, divide the money still missing at the start of that year by that year's cash flow. It's the same 'running balance' idea you used in the amortization table in Week 4 — except here the balance is your investment being recovered.",
            example: "Different case: I₀ = $400,000, inflows $150,000 / $150,000 / $150,000. After Year 1: recovered $150,000 (need $250,000 more). After Year 2: $300,000 total (need $100,000 more). In Year 3: 100,000 ÷ 150,000 = 0.67. PRI = 2 + 0.67 = 2.67 years. Now find the lemonade stand's payback below.",
        },
        scenario: "I₀ = $500,000, inflows Year 1–3 = $200,000, $250,000, $200,000.",
        steps: [
            { type: "number", q: "How much is still unrecovered at the START of Year 3? (500,000 − 200,000 − 250,000)", answer: 50000, tol: 0.02, hint: "500,000 − 450,000", feedback: "$50,000 left to recover entering Year 3." },
            { type: "number", q: "What fraction of Year 3 is needed? (50,000 ÷ 200,000, as a decimal)", answer: 0.25, tol: 0.05, hint: "50,000 ÷ 200,000", feedback: "0.25 of the year." },
            { type: "number", q: "So the Payback Period in years is… (2 + 0.25)", answer: 2.25, tol: 0.03, hint: "2 + 0.25", feedback: "PRI = 2.25 years (2 years, 3 months)." },
            { type: "choice", q: "How does this connect to Week 4's amortization table?", options: ["Both track a running balance until it reaches a target (here, your money recovered).", "They are unrelated.", "Payback uses no math."], correct: 0, feedback: "Same running-balance logic — recovering capital instead of paying down debt." },
        ],
    },
];

/* ---- Risk / return + fixed / variable (classify game) ---- */
const RISK_ITEMS = [
    { label: "A CDT paying a guaranteed 9% E.A.", income: "fixed", risk: "low" },
    { label: "Shares of Ecopetrol on the stock market", income: "variable", risk: "high" },
    { label: "A Colombian government bond (TES)", income: "fixed", risk: "low" },
    { label: "Bitcoin", income: "variable", risk: "high" },
    { label: "A corporate bond with fixed coupons", income: "fixed", risk: "low" },
    { label: "A real estate investment trust (equity)", income: "variable", risk: "high" },
];

/* ---- Final capstone: borrow → invest → judge with NPV ---- */
const FINAL = [
  { q: "You'll borrow money and invest it. Which tool tells you if it's worth it?", correct: 0, feedback: "NPV nets the investment's present value against the loan's cost.", options: ["Net Present Value, comparing today's values.", "Your credit score with the lending bank.", "The usury rate set by the regulator.", "The nominal rate printed on the loan."] },
  { q: "A loan quoted at 2% monthly, converted to E.A., is about…", correct: 3, feedback: "(1.02)¹² − 1 ≈ 26.82% (Week 3 conversion).", options: ["exactly 12% per year.", "exactly 24% per year.", "roughly 2% per year.", "about 26.82% per year."] },
  { q: "To compare a loan with an investment fairly, you should…", correct: 1, feedback: "Put both on the same effective annual basis.", options: ["mix a monthly rate with an annual one.", "bring both to the same effective annual basis.", "use a different time base for each side.", "skip the rate and compare raw pesos."] },
  { q: "PV of $1,300,000 received in 1 year at 27% is about…", correct: 2, feedback: "1,300,000 ÷ 1.27 ≈ 1,023,622.", options: ["around $1,651,000.", "around $1,300,000.", "around $1,023,622.", "around $890,000."] },
  { q: "If the investment's NPV (using the loan's rate) is positive, then…", correct: 0, feedback: "It repays the loan and still leaves profit today.", options: ["it repays the loan and leaves profit.", "it loses money against the loan.", "the result is exactly break-even.", "the loan becomes interest-free."] },
  { q: "If that same NPV comes out negative, the honest conclusion is…", correct: 3, feedback: "The investment doesn't beat the loan's cost.", options: ["borrow a bit more to fix it.", "it's guaranteed profit anyway.", "the sign makes no difference here.", "don't borrow to invest — it loses value."] },
  { q: "Using the loan's rate as the discount rate makes sense because…", correct: 1, feedback: "The loan is your cost of capital to beat.", options: ["it is a random rate you pick.", "the loan is your cost of capital.", "regulators legally require that rate.", "it always lowers the final answer."] },
  { q: "IRR would confirm the same 'invest' decision when…", correct: 2, feedback: "IRR above the loan rate = the project out-earns the borrowing cost.", options: ["IRR is below the loan's rate.", "IRR comes out exactly zero.", "IRR is above the loan's rate.", "IRR turns out negative."] },
  { q: "Which fits a very cautious student: renta fija or renta variable?", correct: 0, feedback: "Fixed income is low-risk and predictable.", options: ["fixed income, like a CDT or bond.", "variable income, like stocks or crypto.", "only cryptocurrency, for the upside.", "neither is possible for a student."] },
  { q: "A FIC / Tyba mainly helps a small investor by…", correct: 3, feedback: "Pooling money into a diversified, managed portfolio.", options: ["guaranteeing a fixed yearly profit.", "removing every fee and tax owed.", "letting you skip risk profiling.", "giving cheap access to a diversified portfolio."] },
  { q: "Best summary of the whole course's logic?", correct: 1, feedback: "Value money over time, compare on one basis, accept positive NPV.", options: ["always pick the biggest raw number.", "compare at one point in time; accept what adds value.", "never borrow and never invest.", "ignore rates and trust the cash total."] },
  { q: "Discounting a future amount to today uses which formula?", correct: 2, feedback: "PV = FV ÷ (1 + r)ⁿ — the Week 3 tool at the heart of NPV.", options: ["FV = PV × (1 + r)ⁿ.", "I = P × r × t.", "PV = FV ÷ (1 + r)ⁿ.", "E.A. = (1 + i)ᵐ − 1."] },
];

/* =====================================================================
   HELPERS
   ===================================================================== */
const money = (n) => "COP $" + (Math.round(parseFloat(n) || 0)).toLocaleString("es-CO");
const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const parseNum = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TERMS_RE = new RegExp("(" + KEY_TERMS.map(escapeRe).join("|") + ")", "g");
function renderReadingText(text) {
    return text.split(TERMS_RE).map((part, i) => {
        if (!part) return null;
        const hit = KEY_TERMS.find((t) => t === part);
        if (hit) return <mark className="hl" key={i} title={GLOSSARY[hit]}>{part}</mark>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
    });
}
function shuffleArr(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(arr, n) { return !n || n >= arr.length ? shuffleArr(arr) : shuffleArr(arr).slice(0, n); }

/* NPV para un arreglo de flujos y una tasa (r en decimal) */
function npvOf(I0, flows, r) {
    return flows.reduce((s, cf, i) => s + cf / Math.pow(1 + r, i + 1), 0) - I0;
}
/* IRR por bisección (asume flujos convencionales: −I0 y luego entradas) */
function irrOf(I0, flows) {
    let lo = -0.9, hi = 5;
    const f = (r) => npvOf(I0, flows, r);
    if (f(lo) * f(hi) > 0) return null;
    for (let k = 0; k < 100; k++) {
        const mid = (lo + hi) / 2;
        if (f(mid) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
}

/* =====================================================================
   REWARD
   ===================================================================== */
function Reward({ title, subtitle, coins, saving, onExit, gold }) {
    return (
        <div className="s1-reward">
            <div className={`reward-badge ${gold ? "gold" : ""}`}>{gold ? <Sparkles size={40} strokeWidth={2.1} /> : <Trophy size={40} strokeWidth={2.1} />}</div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <div className="reward-coins">
                <span className="coin-burst" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="coin-fly" style={{ "--i": i }}>🪙</span>)}</span>
                <Coins size={20} strokeWidth={2.3} /> +{coins} coins
            </div>
            <p className="reward-note">These coins power your Fluency Meter on the dashboard.</p>
            <button className="s1-btn primary" onClick={onExit}>Continue <ChevronRight size={18} strokeWidth={2.4} /></button>
            {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
        </div>
    );
}

/* =====================================================================
   QUIZ RUNNER (80% to pass, retry)
   ===================================================================== */
function QuizRunner({ title, emoji, questions, pickCount, passThreshold, xpPerCorrect, xpComplete, onSave, onExit }) {
    const [attempt, setAttempt] = useState(0);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [coins, setCoins] = useState(0);

    const deck = useMemo(() => sample(questions, pickCount).map((q) => ({ ...q, order: shuffleArr(q.options.map((_, i) => i)) })), [questions, pickCount, attempt]);
    const q = deck[current];
    const answered = answers[current] !== undefined;
    const isLast = current === deck.length - 1;
    const pick = (i) => { if (!answered) setAnswers({ ...answers, [current]: i }); };

    const next = () => {
        if (!isLast) { setCurrent(current + 1); return; }
        const correct = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
        const pct = Math.round((correct / deck.length) * 100);
        const passed = passThreshold == null || pct >= passThreshold;
        const xp = correct * xpPerCorrect + (xpComplete || 0);
        setCoins(xp); setSaving(true); setFinished(true);
        onSave({ correct, total: deck.length, xp, pct, passed }).finally(() => setSaving(false));
    };
    const retry = () => { setAttempt((a) => a + 1); setCurrent(0); setAnswers({}); setFinished(false); setCoins(0); };

    if (finished) {
        const correct = deck.reduce((a, qq, i) => a + (answers[i] === qq.correct ? 1 : 0), 0);
        const pct = Math.round((correct / deck.length) * 100);
        const passed = passThreshold == null || pct >= passThreshold;
        if (!passed) {
            return (
                <div className="s1-reward">
                    <div className="reward-badge"><X size={40} strokeWidth={2.1} /></div>
                    <h2>Almost there</h2>
                    <p>You got {correct} / {deck.length} correct ({pct}%). You need at least {passThreshold}% to pass.</p>
                    <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
                    <p className="reward-note">Your coins are saved, but you need {passThreshold}% to move on. Try again — new questions.</p>
                    <button className="s1-btn primary" onClick={retry}>Try again <ChevronRight size={18} strokeWidth={2.4} /></button>
                    {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing your progress…</span>}
                </div>
            );
        }
        return <Reward title={correct === deck.length ? "Perfect!" : "You passed!"} subtitle={`You got ${correct} / ${deck.length} correct.`} coins={coins} saving={saving} onExit={onExit} />;
    }

    return (
        <div className="s1-quiz">
            <div className="quiz-top"><h2>{emoji} {title}</h2><span className="quiz-count">{current + 1} / {deck.length}</span></div>
            <div className="quiz-track"><i style={{ width: `${((current + (answered ? 1 : 0)) / deck.length) * 100}%` }} /></div>
            <p className="quiz-q">{q.q}</p>
            <div className="quiz-options">
                {q.order.map((oi, pos) => {
                    const opt = q.options[oi];
                    let cls = "quiz-opt";
                    if (answered) { if (oi === q.correct) cls += " correct"; else if (oi === answers[current]) cls += " wrong"; }
                    return (
                        <button key={oi} className={cls} onClick={() => pick(oi)} disabled={answered}>
                            <span className="opt-key">{String.fromCharCode(65 + pos)}</span>
                            <span className="opt-text">{opt}</span>
                            {answered && oi === q.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
                        </button>
                    );
                })}
            </div>
            {answered && (
                <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
                    <span><b>{answers[current] === q.correct ? "Correct! " : "Not quite. "}</b>{q.feedback}</span>
                </div>
            )}
            <div className="quiz-nav">
                <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
                <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "Finish" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
            </div>
        </div>
    );
}

/* =====================================================================
   READER
   ===================================================================== */
function Reader({ done, onFinish, onExit }) {
    const [term, setTerm] = useState(null);
    return (
        <div>
            <div className="reader-bar">
                <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
                <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~10 min read</div>
            </div>
            <article className="s1-reader">
                <span className="reader-tag">READING · B2 · INVESTING</span>
                <h1>Project Evaluation &amp; Investments</h1>
                <p className="reader-sub">The indicators that separate a good investment from a bad one.</p>
                <div className="reader-terms">
                    <span className="terms-label">Key words (tap for meaning):</span>
                    {["Net Present Value", "Internal Rate of Return", "Benefit-Cost", "Payback Period", "discount rate", "fixed income", "variable income", "collective investment funds"].map((t) => (
                        <button key={t} className={`term-chip ${term === t ? "on" : ""}`} onClick={() => setTerm(term === t ? null : t)}>{t}</button>
                    ))}
                </div>
                {term && <div className="term-pop"><b>{term}</b> — {GLOSSARY[term]}</div>}
                <div className="reader-body">
                    {READING.map((b, i) => (b.h ? <h2 key={i}>{b.h}</h2> : <p key={i}>{renderReadingText(b.p)}</p>))}
                </div>
                <div className="reader-finish">
                    {done ? <span className="reader-done"><Check size={18} strokeWidth={3} /> You've read this</span>
                        : <button className="s1-btn primary big" onClick={onFinish}><Check size={18} strokeWidth={2.6} /> I've finished reading <span className="coin-tag"><Coins size={15} /> +{XP.reading}</span></button>}
                </div>
            </article>
        </div>
    );
}

/* =====================================================================
   CASH-FLOW CALCULATOR · NPV, IRR, B/C, Payback from I0 + flows + rate
   ===================================================================== */
function CashFlowCalc() {
    const [I0, setI0] = useState("");
    const [r, setR] = useState("");
    const [flows, setFlows] = useState(["", "", ""]);
    const [showWork, setShowWork] = useState(false);

    const i0 = parseFloat(I0 || 0);
    const rate = parseFloat(r || 0) / 100;
    const validFlows = flows.filter((f) => f !== "").map((f) => parseFloat(f || 0));

    const pvPerYear = validFlows.map((cf, i) => ({ year: i + 1, cf, denom: Math.pow(1 + rate, i + 1), pv: cf / Math.pow(1 + rate, i + 1) }));
    const pvInflows = pvPerYear.reduce((s, y) => s + y.pv, 0);
    const npv = i0 ? pvInflows - i0 : 0;
    const bc = i0 ? pvInflows / i0 : 0;
    const irr = i0 && validFlows.length ? irrOf(i0, validFlows) : null;

    // Payback (simple) con el desglose acumulado
    let payback = null; const pbRows = [];
    if (i0 && validFlows.length) {
        let acc = 0, done = false;
        for (let k = 0; k < validFlows.length; k++) {
            const before = acc; acc += validFlows[k];
            const missing = Math.max(0, i0 - before);
            if (!done && acc >= i0) { const frac = missing / validFlows[k]; payback = k + frac; pbRows.push({ year: k + 1, cf: validFlows[k], cumBefore: before, note: `need ${money(missing)} of this year → ${missing.toFixed(0)}/${validFlows[k].toFixed(0)} = ${(frac).toFixed(2)}` }); done = true; }
            else pbRows.push({ year: k + 1, cf: validFlows[k], cumBefore: before, note: done ? "already recovered" : `recovered ${money(acc)} so far` });
        }
        if (!done) payback = null;
    }

    const setFlow = (idx, v) => { const next = [...flows]; next[idx] = v; setFlows(next); };
    const addYear = () => setFlows([...flows, ""]);
    const delYear = (idx) => setFlows(flows.filter((_, i) => i !== idx));
    const hasData = i0 > 0 && validFlows.length > 0 && rate >= 0;

    return (
        <div className="fincalc">
            <div className="fincalc-head"><BarChart3 size={16} strokeWidth={2.3} /> Cash-flow calculator (NPV · IRR · B/C · Payback)</div>
            <div className="cf-top">
                <label>Initial investment I₀<input type="number" value={I0} onChange={(e) => setI0(e.target.value)} placeholder="500000" /></label>
                <label>Discount rate r (%)<input type="number" value={r} onChange={(e) => setR(e.target.value)} placeholder="10" /></label>
            </div>
            <div className="cf-flows">
                {flows.map((f, idx) => (
                    <div key={idx} className="cf-flow">
                        <span>Year {idx + 1}</span>
                        <input type="number" value={f} onChange={(e) => setFlow(idx, e.target.value)} placeholder="cash inflow" />
                        {flows.length > 1 && <button className="exp-del" onClick={() => delYear(idx)}><Trash2 size={14} strokeWidth={2.2} /></button>}
                    </div>
                ))}
                <button className="cf-add" onClick={addYear}><Plus size={15} strokeWidth={2.5} /> Add a year</button>
            </div>
            <div className="fincalc-out cf-out">
                <div><span>PV of inflows</span><b>{money(pvInflows)}</b></div>
                <div className={`${npv >= 0 ? "hi" : "lo"}`}><span>NPV (VPN)</span><b>{money(npv)}</b></div>
                <div><span>IRR (TIR)</span><b>{irr == null ? "—" : (irr * 100).toFixed(1) + "%"}</b></div>
                <div><span>Benefit-Cost (B/C)</span><b>{bc ? bc.toFixed(3) : "—"}</b></div>
                <div><span>Payback (years)</span><b>{payback == null ? "—" : payback.toFixed(2)}</b></div>
                <div><span>Decision</span><b className={npv >= 0 ? "ok" : "bad"}>{i0 ? (npv >= 0 ? "Accept ✓" : "Reject ✗") : "—"}</b></div>
            </div>

            {hasData && (
                <button className="cf-work-toggle" onClick={() => setShowWork((s) => !s)}>
                    <Lightbulb size={15} strokeWidth={2.4} /> {showWork ? "Hide the steps" : "Show me the steps"} <ChevronRight size={15} strokeWidth={2.4} className={showWork ? "rot" : ""} />
                </button>
            )}

            {hasData && showWork && (
                <div className="cf-work">
                    <div className="cf-work-block">
                        <h4>1 · Present value of each inflow — divide by (1 + r)ᵗ</h4>
                        {pvPerYear.map((y) => (
                            <p key={y.year} className="cf-line">Year {y.year}: {money(y.cf)} ÷ {y.denom.toFixed(4)} = <b>{money(y.pv)}</b></p>
                        ))}
                        <p className="cf-line total">Total PV = {money(pvInflows)}</p>
                    </div>
                    <div className="cf-work-block">
                        <h4>2 · NPV (VPN) = Total PV − I₀</h4>
                        <p className="cf-line">{money(pvInflows)} − {money(i0)} = <b>{money(npv)}</b> → {npv >= 0 ? "positive, ACCEPT ✓" : "negative, REJECT ✗"}</p>
                    </div>
                    <div className="cf-work-block">
                        <h4>3 · Benefit-Cost = Total PV ÷ I₀</h4>
                        <p className="cf-line">{money(pvInflows)} ÷ {money(i0)} = <b>{bc.toFixed(3)}</b> → {bc >= 1 ? "above 1.0, ACCEPT ✓" : "below 1.0, REJECT ✗"}</p>
                    </div>
                    <div className="cf-work-block">
                        <h4>4 · IRR (TIR) — the rate that makes NPV = 0</h4>
                        {irr == null
                            ? <p className="cf-line">No sign change in the cash flows, so IRR can't be found here.</p>
                            : <>
                                <p className="cf-line">Found by trial: the calculator tests rates until NPV ≈ 0. Result: <b>{(irr * 100).toFixed(1)}%</b>.</p>
                                <p className="cf-line">Check at r = {(irr * 100).toFixed(1)}%: NPV = {money(npvOf(i0, validFlows, irr))} ≈ 0 ✓. Since IRR {irr > rate ? ">" : "<"} your discount rate ({(rate * 100).toFixed(1)}%), you {irr > rate ? "ACCEPT ✓" : "REJECT ✗"}.</p>
                            </>}
                    </div>
                    <div className="cf-work-block">
                        <h4>5 · Payback (PRI) — add inflows until they repay I₀</h4>
                        {pbRows.map((row) => (
                            <p key={row.year} className="cf-line">Year {row.year}: +{money(row.cf)} · {row.note}</p>
                        ))}
                        <p className="cf-line total">Payback ≈ {payback == null ? "never recovered" : payback.toFixed(2) + " years"}</p>
                    </div>
                </div>
            )}

            <p className="fincalc-tip">💡 Enter I₀ and each year's inflow. NPV &gt; 0 → accept. IRR &gt; your discount rate → accept. B/C &gt; 1 → accept.</p>
        </div>
    );
}

/* =====================================================================
   STEP SET (guided problems + the cash-flow calculator)
   ===================================================================== */
function StepSet({ title, emoji, problems, xp, onSave, onExit }) {
    const [pi, setPi] = useState(0);
    const [si, setSi] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [choiceIdx, setChoiceIdx] = useState(null);
    const [numInput, setNumInput] = useState("");
    const [numError, setNumError] = useState(false);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    const problem = problems[pi];
    const step = problem.steps[si];
    const isLastStep = si === problem.steps.length - 1;
    const isLastProblem = pi === problems.length - 1;

    const resetStep = () => { setAnswered(false); setChoiceIdx(null); setNumInput(""); setNumError(false); };
    const pickChoice = (i) => { if (answered) return; setChoiceIdx(i); setAnswered(true); };
    const submitNumber = () => {
        const val = parseNum(numInput);
        const tol = (step.tol || 0.01) * Math.abs(step.answer) + 1;
        if (!Number.isNaN(val) && Math.abs(val - step.answer) <= tol) { setAnswered(true); setNumError(false); }
        else setNumError(true);
    };
    const next = () => {
        if (!isLastStep) { setSi(si + 1); resetStep(); return; }
        if (!isLastProblem) { setPi(pi + 1); setSi(0); resetStep(); return; }
        setSaving(true); setFinished(true);
        onSave({ done: true, xp }).finally(() => setSaving(false));
    };

    if (finished) return <Reward title="Evaluated! 📊" subtitle="You judged real projects with the indicators pros use." coins={xp} saving={saving} onExit={onExit} />;

    return (
        <div className="s1-start step-wrap">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><BarChart3 size={22} strokeWidth={2.1} /></div>
                <div><h2>{emoji} {title}</h2><p>Problem {pi + 1} of {problems.length} · step {si + 1} of {problem.steps.length}</p></div>
            </div>

            {problem.teach && si === 0 && (
                <div className="s3-teach">
                    <h3><Lightbulb size={18} strokeWidth={2.3} /> {problem.teach.title}</h3>
                    <p>{problem.teach.body}</p>
                    <p className="s3-teach-ex"><b>Worked example — </b>{problem.teach.example}</p>
                </div>
            )}

            <div className="fincalc-row"><CashFlowCalc /></div>

            <div className="s1-quiz step-card">
                <div className="step-scenario"><Brain size={16} strokeWidth={2.2} /> {problem.scenario}</div>
                <div className="quiz-track"><i style={{ width: `${((si + (answered ? 1 : 0)) / problem.steps.length) * 100}%` }} /></div>
                <p className="quiz-q">{step.q}</p>

                {step.type === "choice" ? (
                    <div className="quiz-options">
                        {step.options.map((opt, i) => {
                            let cls = "quiz-opt";
                            if (answered) { if (i === step.correct) cls += " correct"; else if (i === choiceIdx) cls += " wrong"; }
                            return (
                                <button key={i} className={cls} onClick={() => pickChoice(i)} disabled={answered}>
                                    <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                                    <span className="opt-text">{opt}</span>
                                    {answered && i === step.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="num-step">
                        {step.hint && <div className="num-hint"><Lightbulb size={15} strokeWidth={2.3} /> {step.hint}</div>}
                        <div className="num-entry">
                            <input className={`start-input ${numError ? "err" : ""} ${answered ? "ok" : ""}`} type="text" inputMode="decimal" value={numInput}
                                onChange={(e) => { setNumInput(e.target.value); setNumError(false); }} placeholder="Type your answer (numbers only)" disabled={answered} />
                            {!answered && <button className="s1-btn primary" onClick={submitNumber}>Check</button>}
                        </div>
                        {numError && <p className="num-msg err">Not quite — use the cash-flow calculator to check and try again.</p>}
                    </div>
                )}

                {answered && (
                    <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
                        <span><b>Correct! </b>{step.feedback}</span>
                    </div>
                )}

                <div className="quiz-nav">
                    <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
                    <button className="s1-btn primary" onClick={next} disabled={!answered}>
                        {isLastStep && isLastProblem ? "Finish" : isLastStep ? "Next problem" : "Next step"} <ChevronRight size={18} strokeWidth={2.4} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =====================================================================
   RISK / RETURN · classify each asset (income type + risk level)
   ===================================================================== */
function RiskGame({ onSave, onExit }) {
    const [attempt, setAttempt] = useState(0);
    const [choices, setChoices] = useState({}); // { idx: {income, risk} }
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [coins, setCoins] = useState(0);

    const passThreshold = 80;
    const set = (idx, key, val) => {
        const cur = choices[idx] || {};
        if (cur[key]) return; // lock once chosen
        setChoices({ ...choices, [idx]: { ...cur, [key]: val } });
    };
    const complete = (idx) => choices[idx]?.income && choices[idx]?.risk;
    const allDone = RISK_ITEMS.every((_, i) => complete(i));
    const correct = RISK_ITEMS.reduce((a, it, i) => a + ((choices[i]?.income === it.income && choices[i]?.risk === it.risk) ? 1 : 0), 0);
    const pct = Math.round((correct / RISK_ITEMS.length) * 100);

    const finish = () => {
        const xp = correct * 4;
        setCoins(xp); setSaving(true); setDone(true);
        onSave({ correct, total: RISK_ITEMS.length, xp, pct, passed: pct >= passThreshold }).finally(() => setSaving(false));
    };
    const retry = () => { setAttempt((a) => a + 1); setChoices({}); setDone(false); setCoins(0); };

    if (done) {
        if (pct < passThreshold) {
            return (
                <div className="s1-reward">
                    <div className="reward-badge"><X size={40} strokeWidth={2.1} /></div>
                    <h2>Not quite</h2>
                    <p>You classified {correct} / {RISK_ITEMS.length} correctly ({pct}%). You need {passThreshold}% to pass.</p>
                    <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
                    <p className="reward-note">Remember: fixed income = lending (low risk); variable = ownership (high risk). Try again.</p>
                    <button className="s1-btn primary" onClick={retry}>Try again <ChevronRight size={18} strokeWidth={2.4} /></button>
                    {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing…</span>}
                </div>
            );
        }
        return <Reward title="Sorted the market! ⚖️" subtitle={`You classified ${correct} / ${RISK_ITEMS.length} assets correctly.`} coins={coins} saving={saving} onExit={onExit} />;
    }

    return (
        <div className="s1-start">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><Scale size={22} strokeWidth={2.1} /></div>
                <div><h2>Risk vs return · fixed vs variable</h2><p>For each asset, tag its income type and its risk level. Green = correct.</p></div>
            </div>

            <div className="s3-teach">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> Quick reminder</h3>
                <p><b>Fixed income</b> = you lend for pre-set interest (CDTs, bonds) → usually <b>low risk</b>. <b>Variable income</b> = you own a piece of a company or asset (stocks, crypto, REITs) → usually <b>high risk</b>. Higher potential return always comes with higher risk.</p>
            </div>

            <div className="risk-list" key={attempt}>
                {RISK_ITEMS.map((it, i) => {
                    const c = choices[i] || {};
                    const ok = c.income === it.income && c.risk === it.risk;
                    const answeredBoth = c.income && c.risk;
                    return (
                        <div key={i} className={`risk-card ${answeredBoth ? (ok ? "ok" : "no") : ""}`}>
                            <span className="risk-label">{it.label}</span>
                            <div className="risk-tags">
                                <div className="risk-group">
                                    <button className={`risk-btn ${c.income === "fixed" ? "on" : ""}`} onClick={() => set(i, "income", "fixed")} disabled={!!c.income}>Fixed</button>
                                    <button className={`risk-btn ${c.income === "variable" ? "on" : ""}`} onClick={() => set(i, "income", "variable")} disabled={!!c.income}>Variable</button>
                                </div>
                                <div className="risk-group">
                                    <button className={`risk-btn low ${c.risk === "low" ? "on" : ""}`} onClick={() => set(i, "risk", "low")} disabled={!!c.risk}>Low risk</button>
                                    <button className={`risk-btn high ${c.risk === "high" ? "on" : ""}`} onClick={() => set(i, "risk", "high")} disabled={!!c.risk}>High risk</button>
                                </div>
                            </div>
                            {answeredBoth && <span className={`risk-mark ${ok ? "ok" : "no"}`}>{ok ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}</span>}
                        </div>
                    );
                })}
            </div>

            <div className="sort-foot">
                <span className="sort-count">{RISK_ITEMS.filter((_, i) => complete(i)).length} / {RISK_ITEMS.length} tagged</span>
                <button className="s1-btn primary" onClick={finish} disabled={!allDone}>Finish <ChevronRight size={18} strokeWidth={2.4} /></button>
            </div>
        </div>
    );
}

/* =====================================================================
   EXPLORE · research Tyba / a fund and write what you found
   ===================================================================== */
function Explore({ existing, onSave, onExit }) {
    const [platform, setPlatform] = useState(existing?.platform || "");
    const [cdtRate, setCdtRate] = useState(existing?.cdtRate || "");
    const [fundReturn, setFundReturn] = useState(existing?.fundReturn || "");
    const [notes, setNotes] = useState(existing?.notes || "");
    const [choice, setChoice] = useState(existing?.choice || "");
    const [why, setWhy] = useState(existing?.why || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const MIN_NOTES = 25, MIN_WHY = 30;
    const ready = platform.trim() && parseFloat(cdtRate) > 0 && parseFloat(fundReturn) !== 0 && countWords(notes) >= MIN_NOTES && choice && countWords(why) >= MIN_WHY;
    const submit = () => { setSaving(true); setSaved(true); onSave({ platform, cdtRate: parseFloat(cdtRate), fundReturn: parseFloat(fundReturn), notes, choice, why }).finally(() => setSaving(false)); };

    if (saved) return <Reward title="Explorer! 🔎" subtitle="You compared real returns like an investor sizing up the market." coins={XP.explore} saving={saving} onExit={onExit} />;

    return (
        <div className="s1-start">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><Search size={22} strokeWidth={2.1} /></div>
                <div><h2>Explore Tyba &amp; real returns</h2><p>Look up what a CDT and a fund actually pay today, then decide which fits you.</p></div>
            </div>

            <div className="s3-teach">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> Your mission</h3>
                <p>Open Tyba (or another investment site or a bank). Find two things: the rate a <b>CDT</b> pays now (fixed income), and the recent return of a <b>collective investment fund / FIC</b> (variable income). Notice how the fund's return isn't guaranteed and can move up or down, while the CDT's is fixed.</p>
                <p className="s3-teach-ex"><b>Then think like this week:</b> the CDT is your safe baseline. A fund only makes sense if you believe its return beats that baseline enough to justify the extra risk — that's the risk-vs-return trade-off in action.</p>
            </div>

            <div className="start-block">
                <h3><span className="step-n">1</span> What did you find?</h3>
                <p className="start-tip">Platform / site you used:</p>
                <input className="start-input" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Tyba" />
                <div className="cf-top" style={{ marginTop: 12 }}>
                    <label>CDT rate (% E.A.)<input type="number" value={cdtRate} onChange={(e) => setCdtRate(e.target.value)} placeholder="e.g. 9" /></label>
                    <label>Fund recent return (% per year)<input type="number" value={fundReturn} onChange={(e) => setFundReturn(e.target.value)} placeholder="e.g. 11" /></label>
                </div>
                <p className="start-tip" style={{ margin: "12px 0 4px" }}>In English, describe how each pays you and whether the fund's return is guaranteed (min {MIN_NOTES} words):</p>
                <WordFieldLocal value={notes} onChange={setNotes} min={MIN_NOTES} max={120} rows={4} placeholder="On Tyba I found that a CDT pays … while the fund returned … over the last year, which is not guaranteed because …" />
            </div>

            <div className="start-block">
                <h3><span className="step-n">2</span> Which would you choose, and why?</h3>
                <div className="plan-choices">
                    {[
                        { id: "cdt", label: "The CDT (fixed income)", desc: "Safe and predictable." },
                        { id: "fund", label: "The fund / FIC (variable)", desc: "More risk, more potential upside." },
                        { id: "mix", label: "A mix of both", desc: "Some safe, some for growth." },
                    ].map((o) => (
                        <button key={o.id} className={`plan-choice ${choice === o.id ? "on" : ""}`} onClick={() => setChoice(o.id)}>
                            <span className="plan-choice-ico"><Layers size={18} strokeWidth={2.1} /></span>
                            <span className="plan-choice-text"><b>{o.label}</b><span>{o.desc}</span></span>
                        </button>
                    ))}
                </div>
                <p className="start-tip" style={{ marginTop: 12 }}>Justify it using risk vs return (min {MIN_WHY} words):</p>
                <WordFieldLocal value={why} onChange={setWhy} min={MIN_WHY} max={110} rows={4} placeholder="I would choose … because my risk tolerance is … and the extra return of the fund …" />
            </div>

            <div className="start-foot">
                <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish exploring <span className="coin-tag"><Coins size={15} /> +{XP.explore}</span></button>
            </div>
        </div>
    );
}

/* =====================================================================
   FINAL CAPSTONE · borrow → invest → judge with NPV (guided, then exam)
   ===================================================================== */
function FinalCapstone({ onSave, onExit }) {
    const [phase, setPhase] = useState("intro"); // intro → build → exam
    return phase === "exam" ? (
        <QuizRunner title="Capstone exam" emoji="🏆" questions={FINAL} pickCount={10} passThreshold={80} xpPerCorrect={XP.finalCorrect} xpComplete={0}
            onExit={onExit} onSave={onSave} />
    ) : phase === "build" ? (
        <CapstoneBuild onExit={onExit} onReady={() => setPhase("exam")} />
    ) : (
        <div className="s1-start">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><Trophy size={22} strokeWidth={2.1} /></div>
                <div><h2>Capstone: should you borrow to invest?</h2><p>Everything comes together: rates, present value, and NPV, on one real decision.</p></div>
            </div>
            <div className="s3-teach">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> The big question</h3>
                <p>Here's the ultimate test of this course. Suppose you take a <b>loan</b>, use it to make an <b>investment</b>, and the investment later pays you back. Did you actually come out ahead — or did the loan's interest eat all the profit?</p>
                <p>The trick ties it all together: convert the loan's rate to a fair basis (Week 3), then discount the investment's payout to today using that rate. If the <b>NPV is positive</b>, the investment out-earns the loan and you profit. If it's negative, borrowing to invest loses money. You'll work one case, then take a short exam.</p>
            </div>
            <div className="start-foot">
                <button className="s1-btn primary big" onClick={() => setPhase("build")}><Play size={18} strokeWidth={2.4} /> Start the case</button>
            </div>
        </div>
    );
}

/* Caso guiado del capstone: préstamo → inversión → VPN */
function CapstoneBuild({ onExit, onReady }) {
    // Datos del caso
    const loan = 1000000, monthlyRate = 0.02, payout = 1300000, months = 12;
    const ea = Math.pow(1 + monthlyRate, 12) - 1;         // 26.82%
    const pvPayout = payout / (1 + ea);                    // descontar 1 año a la EA del préstamo
    const npv = pvPayout - loan;

    const steps = [
        { type: "choice", q: "You borrow $1,000,000 at 2% monthly to invest. First, convert the loan rate to E.A.:", options: ["(1.02)¹² − 1 ≈ 26.82%", "2% × 12 = 24%", "2% ÷ 12 ≈ 0.17%"], correct: 0, feedback: "Effective annual = (1.02)¹² − 1 ≈ 26.82% — always compound, never just ×12." },
        { type: "choice", q: "Why use the loan's 26.82% E.A. as your discount rate?", options: ["The loan is your cost of capital — the investment must beat it.", "It's a random number.", "To make NPV bigger."], correct: 0, feedback: "Your opportunity cost is the loan's rate; the project has to out-earn it." },
        { type: "number", q: "The investment pays $1,300,000 in 1 year. Its present value at 26.82%? (1,300,000 ÷ 1.2682)", answer: 1025074, tol: 0.03, hint: "1,300,000 ÷ 1.2682", feedback: "≈ $1,025,074 today." },
        { type: "number", q: "NPV = PV of payout − loan. (≈1,025,074 − 1,000,000)", answer: 25074, tol: 0.15, hint: "PV − 1,000,000", feedback: "NPV ≈ +$25,074 — small but positive." },
        { type: "choice", q: "So, should you borrow to make this investment?", options: ["Yes — NPV is positive, so it repays the loan and leaves profit.", "No — NPV is positive so you lose.", "It's impossible to tell."], correct: 0, feedback: "Positive NPV = the investment beats the loan's cost. You profit (barely) — and now you can justify it with numbers." },
    ];

    const [si, setSi] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [choiceIdx, setChoiceIdx] = useState(null);
    const [numInput, setNumInput] = useState("");
    const [numError, setNumError] = useState(false);
    const step = steps[si];
    const isLast = si === steps.length - 1;

    const reset = () => { setAnswered(false); setChoiceIdx(null); setNumInput(""); setNumError(false); };
    const pickChoice = (i) => { if (answered) return; setChoiceIdx(i); setAnswered(true); };
    const submitNumber = () => {
        const val = parseNum(numInput);
        const tol = (step.tol || 0.02) * Math.abs(step.answer) + 1;
        if (!Number.isNaN(val) && Math.abs(val - step.answer) <= tol) { setAnswered(true); setNumError(false); }
        else setNumError(true);
    };
    const next = () => { if (!isLast) { setSi(si + 1); reset(); } else onReady(); };

    return (
        <div className="s1-start step-wrap">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><Trophy size={22} strokeWidth={2.1} /></div>
                <div><h2>🏆 The case: borrow $1,000,000, invest it</h2><p>Step {si + 1} of {steps.length}</p></div>
            </div>

            <div className="s3-teach">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> The setup</h3>
                <p>You borrow <b>$1,000,000</b> at <b>2% monthly</b>. You invest it in something that will pay you <b>$1,300,000 in one year</b>. To judge it, bring that future payout back to today using the loan's own rate — if today's value beats the $1,000,000 you borrowed, you profit.</p>
            </div>

            <div className="fincalc-row"><CashFlowCalc /></div>

            <div className="s1-quiz step-card">
                <div className="quiz-track"><i style={{ width: `${((si + (answered ? 1 : 0)) / steps.length) * 100}%` }} /></div>
                <p className="quiz-q">{step.q}</p>
                {step.type === "choice" ? (
                    <div className="quiz-options">
                        {step.options.map((opt, i) => {
                            let cls = "quiz-opt";
                            if (answered) { if (i === step.correct) cls += " correct"; else if (i === choiceIdx) cls += " wrong"; }
                            return (
                                <button key={i} className={cls} onClick={() => pickChoice(i)} disabled={answered}>
                                    <span className="opt-key">{String.fromCharCode(65 + i)}</span>
                                    <span className="opt-text">{opt}</span>
                                    {answered && i === step.correct && <Check size={18} strokeWidth={3} className="opt-tick" />}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="num-step">
                        {step.hint && <div className="num-hint"><Lightbulb size={15} strokeWidth={2.3} /> {step.hint}</div>}
                        <div className="num-entry">
                            <input className={`start-input ${numError ? "err" : ""} ${answered ? "ok" : ""}`} type="text" inputMode="decimal" value={numInput}
                                onChange={(e) => { setNumInput(e.target.value); setNumError(false); }} placeholder="Type your answer" disabled={answered} />
                            {!answered && <button className="s1-btn primary" onClick={submitNumber}>Check</button>}
                        </div>
                        {numError && <p className="num-msg err">Not quite — check with the calculator and try again.</p>}
                    </div>
                )}
                {answered && (
                    <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} /><span><b>Correct! </b>{step.feedback}</span></div>
                )}
                <div className="quiz-nav">
                    <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
                    <button className="s1-btn primary" onClick={next} disabled={!answered}>{isLast ? "Go to exam" : "Next step"} <ChevronRight size={18} strokeWidth={2.4} /></button>
                </div>
            </div>
        </div>
    );
}

/* Word field with a minimum (local) */
function WordFieldLocal({ value, onChange, placeholder, min, max = 130, rows = 4 }) {
    const w = countWords(value);
    const ok = w >= min && w <= max;
    const state = w === 0 ? "" : ok ? "ok" : w > max ? "over" : "low";
    return (
        <>
            <textarea className="start-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            <p className={`word-count ${state}`}>{w} words · min {min} · max {max} {ok ? "✓" : w < min ? `— write ${min - w} more` : "— too long, trim it"}</p>
        </>
    );
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export const Semana5 = ({ userData, API_URL, existingRow, onBack }) => {
    const { store, dispatch } = useGlobalReducer();

    const initChecklist = useMemo(() => { try { return existingRow?.Checklist_JSON ? JSON.parse(existingRow.Checklist_JSON) : {}; } catch { return {}; } }, [existingRow]);
    const initResp = useMemo(() => { try { return existingRow?.Respuestas_JSON ? JSON.parse(existingRow.Respuestas_JSON) : {}; } catch { return {}; } }, [existingRow]);

    const [checklist, setChecklist] = useState(initChecklist);
    const respRef = useRef(initResp);
    const [points, setPoints] = useState({
        comportamiento: parseFloat(existingRow?.Puntos_Comportamiento || 0),
        quizzes: parseFloat(existingRow?.Puntos_Quizzes || 0),
        aprendi: parseFloat(existingRow?.Puntos_Aprendi || 0),
    });

    const hydrated = useRef(!!existingRow);
    useEffect(() => {
        if (hydrated.current || !existingRow) return;
        hydrated.current = true;
        setChecklist(initChecklist); respRef.current = initResp;
        setPoints({
            comportamiento: parseFloat(existingRow.Puntos_Comportamiento || 0),
            quizzes: parseFloat(existingRow.Puntos_Quizzes || 0),
            aprendi: parseFloat(existingRow.Puntos_Aprendi || 0),
        });
    }, [existingRow]); // eslint-disable-line

    const [open, setOpen] = useState(null);
    useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [open]);

    const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
    const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

    const persist = (nextChecklist, nextPoints, respPatch) => {
        respRef.current = { ...respRef.current, ...respPatch };
        const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
        const newPct = Math.round((done / TOTAL_SECTIONS) * 100);
        const row = {
            Student_Key: userData.Student_Key, Semana: 5,
            Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
            Porcentaje: newPct,
            Puntos_Comportamiento: nextPoints.comportamiento,
            Puntos_Quizzes: nextPoints.quizzes,
            Puntos_Aprendi: nextPoints.aprendi,
            Checklist_JSON: JSON.stringify(nextChecklist),
            Respuestas_JSON: JSON.stringify(respRef.current),
        };
        const prev = store.semanas?.[5];
        dispatch({ type: "save_progreso", payload: row });
        fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
            .catch((e) => { console.error("Error guardando Semana 5:", e); dispatch({ type: "rollback_progreso", payload: { Semana: 5, prev } }); });
    };

    const complete = (key, addPoints, respPatch, pass = true) => {
        const already = !!checklist[key];
        const nextChecklist = { ...checklist, [key]: already || pass };
        const nextPoints = already ? points : {
            comportamiento: points.comportamiento + (addPoints.comportamiento || 0),
            quizzes: points.quizzes + (addPoints.quizzes || 0),
            aprendi: points.aprendi + (addPoints.aprendi || 0),
        };
        setChecklist(nextChecklist); setPoints(nextPoints);
        persist(nextChecklist, nextPoints, respPatch);
        return Promise.resolve();
    };

    /* ---------- VIEWS ---------- */
    if (open === "reading") return (
        <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
            onFinish={() => { complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
    );
    if (open === "check") return (
        <div className="s1"><QuizRunner title="Reading check" emoji="🧠" questions={CHECK} pickCount={10} passThreshold={80} xpPerCorrect={XP.checkCorrect} xpComplete={0}
            onExit={() => setOpen(null)}
            onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );
    if (open === "npvtir") return (
        <div className="s1"><StepSet title="NPV &amp; IRR" emoji="📈" problems={NPVTIR_PROBLEMS} xp={XP.npvtir}
            onExit={() => setOpen(null)}
            onSave={() => complete("npvtir", { aprendi: XP.npvtir }, { npvtir: { done: true, at: new Date().toISOString() } })} /></div>
    );
    if (open === "bcpri") return (
        <div className="s1"><StepSet title="Benefit-Cost &amp; Payback" emoji="⏱️" problems={BCPRI_PROBLEMS} xp={XP.bcpri}
            onExit={() => setOpen(null)}
            onSave={() => complete("bcpri", { aprendi: XP.bcpri }, { bcpri: { done: true, at: new Date().toISOString() } })} /></div>
    );
    if (open === "risk") return (
        <div className="s1"><RiskGame onExit={() => setOpen(null)}
            onSave={(r) => complete("risk", { quizzes: r.xp }, { risk: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );
    if (open === "explore") return (
        <div className="s1"><Explore existing={respRef.current?.explore} onExit={() => setOpen(null)}
            onSave={(r) => complete("explore", { comportamiento: XP.explore }, { explore: { ...r, at: new Date().toISOString() } })} /></div>
    );
    if (open === "final") return (
        <div className="s1"><FinalCapstone onExit={() => setOpen(null)}
            onSave={(r) => complete("final", { quizzes: r.correct * XP.finalCorrect }, { final: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );

    /* ---------- MENU ---------- */
    const Section = ({ k, icon, title, desc, topics, cta }) => (
        <div className={`act-card ${checklist[k] ? "done" : ""}`}>
            <div className="act-ico">{checklist[k] ? <Check size={22} strokeWidth={3} /> : icon}</div>
            <div className="act-main">
                <h3>{title}</h3><p>{desc}</p>
                {topics && <div className="act-topics">{topics.map((t, i) => <span key={i}>{t}</span>)}</div>}
            </div>
            {cta}
        </div>
    );
    const btn = (k, label, extra) => checklist[k]
        ? <button className="act-cta done" onClick={() => setOpen(k)}>Done ✓</button>
        : <button className="act-cta play" onClick={() => setOpen(k)}>{label} {extra}</button>;

    return (
        <div className="s1">
            <button className="s1-back" onClick={onBack}><ArrowLeft size={18} strokeWidth={2.4} /> Back to overview</button>

            <div className="s1-hero s5-hero">
                <span className="s1-tag"><BarChart3 size={14} strokeWidth={2.6} /> WEEK 5 · PROJECT EVALUATION</span>
                <h1>Is this investment actually worth it?</h1>
                <p>Bring it all together: present value, rates, and the indicators pros use — NPV, IRR, B/C and Payback — to judge real investments and even whether to borrow to invest.</p>
                <div className="s1-progress"><div className="bar"><i style={{ width: `${pct}%` }} /></div><span className="pill">{pct}%</span></div>
            </div>

            <div className="obj-card">
                <div className="obj-col">
                    <div className="obj-head"><span className="obj-ico learn"><GraduationCap size={20} strokeWidth={2.2} /></span><h3>What you'll learn</h3></div>
                    <ul className="obj-list">{OBJECTIVES.map((o, i) => <li key={i}><Check size={16} strokeWidth={3} /> {o}</li>)}</ul>
                </div>
                <div className="obj-col">
                    <div className="obj-head"><span className="obj-ico do"><Target size={20} strokeWidth={2.2} /></span><h3>By the end, you'll…</h3></div>
                    <ul className="obj-list">{DELIVERABLES.map((o, i) => <li key={i}><ChevronRight size={16} strokeWidth={3} /> {o}</li>)}</ul>
                </div>
            </div>

            <div className="s1-quest">
                <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: Project Evaluation" desc="NPV, IRR, B/C, Payback, risk vs return, fixed vs variable, and Tyba."
                    topics={["NPV & IRR", "Risk vs return", "FICs / Tyba"]}
                    cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

                <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Reading check" desc="10 random questions from the chapter — pass with 80%."
                    cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.checkCorrect}</span>)} />

                <Section k="npvtir" icon={<LineChart size={22} strokeWidth={2.1} />} title="NPV &amp; IRR" desc="Discount cash flows and decide, with a full cash-flow calculator."
                    topics={["NPV / VPN", "IRR / TIR", "Decision rule"]}
                    cta={btn("npvtir", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.npvtir}</span>)} />

                <Section k="bcpri" icon={<Clock size={22} strokeWidth={2.1} />} title="Benefit-Cost &amp; Payback" desc="Ratio and recovery time — linked to the amortization idea."
                    topics={["B/C ratio", "Payback (PRI)", "Running balance"]}
                    cta={btn("bcpri", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.bcpri}</span>)} />

                <Section k="risk" icon={<Scale size={22} strokeWidth={2.1} />} title="Risk vs return" desc="Tag each asset: fixed vs variable income, low vs high risk."
                    topics={["Fixed income", "Variable income", "Risk level"]}
                    cta={btn("risk", <><Play size={16} strokeWidth={2.6} /> Play</>, <span className="coin-tag"><Coins size={14} /> +{XP.risk}</span>)} />

                <Section k="explore" icon={<Search size={22} strokeWidth={2.1} />} title="Explore Tyba &amp; funds" desc="Research a real CDT and fund, then choose with risk vs return."
                    topics={["Tyba", "CDT vs FIC", "Real returns"]}
                    cta={btn("explore", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.explore}</span>)} />

                <Section k="final" icon={<Trophy size={22} strokeWidth={2.1} />} title="Capstone: borrow to invest? ⭐" desc="Combine rates, present value and NPV, then pass the exam."
                    topics={["Loan → invest", "NPV decision", "Exam"]}
                    cta={btn("final", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.finalCorrect}</span>)} />
            </div>
        </div>
    );
};