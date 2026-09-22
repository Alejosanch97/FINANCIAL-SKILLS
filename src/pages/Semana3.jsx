import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    ArrowLeft, BookOpen, Check, X, Coins, Trophy, Sparkles, Clock, Video,
    ChevronRight, Lightbulb, Play, GraduationCap, TrendingUp, Calculator,
    Hourglass, Scale, ArrowRightLeft, LineChart, Target, Brain, Gift,
    Delete, RotateCcw, Zap,
} from "lucide-react";
import "../Styles/semana1.css"; // reutiliza botones, quiz, reward, monedas…
import "../Styles/semana2.css"; // reutiliza word-count, sim, etc.
import "../Styles/semana3.css"; // estilos propios de la semana 3
import useGlobalReducer from "../hooks/useGlobalReducer"; // ajusta la ruta si tu hook está en otro lado

/* =====================================================================
   SEMANA 3 · MATEMÁTICA FINANCIERA (EL CORAZÓN)
   Formaliza el valor del dinero en el tiempo: interés simple vs compuesto,
   VP/VF, y tasas (nominal, efectiva, EA, equivalencias). Une la S1 (cuánto
   ahorro) y la S2 (dónde) con la matemática que hace crecer la plata.
   Todo se guarda en Progreso_Semanas (Semana: 3) vía save_progreso.
   ===================================================================== */

const VIDEO_TIME = "https://res.cloudinary.com/k44zr7ap/video/upload/v1790103274/videoplayback_1.mp4"; // valor del dinero en el tiempo
const VIDEO_RATES = "https://res.cloudinary.com/k44zr7ap/video/upload/v1790103265/videoplayback_3.mp4"; // tasas nominales y efectivas

const SECTION_KEYS = ["reading", "check", "timevalue", "interest", "pvfv", "rates", "growth", "final"];
const TOTAL_SECTIONS = SECTION_KEYS.length;

/* ---- Monedas por actividad ---- */
const XP = {
    reading: 20,
    checkCorrect: 4,       // ~10 preguntas
    timevalueCorrect: 6,   // video + juego hoy/mañana
    interest: 35,          // problemas paso a paso
    pvfv: 35,              // problemas paso a paso
    rates: 30,             // video + emparejar
    growth: 25,            // actividad: mi ahorro en X años
    finalCorrect: 6,       // mini examen
};

/* =====================================================================
   CONTENIDO
   ===================================================================== */
const OBJECTIVES = [
    "Explain the time value of money: why a peso today beats a peso tomorrow.",
    "Tell simple interest apart from compound interest, and calculate both.",
    "Move money through time with Present Value and Future Value.",
    "Read and convert interest rates: nominal, periodic and Effective Annual (E.A.).",
    "Project how much your own savings will grow over the years.",
];
const DELIVERABLES = [
    "Read Sofia's story and pass a comprehension check.",
    "Watch the time-value video and win the 'today vs tomorrow' game.",
    "Solve interest and PV/FV problems step by step with a calculator.",
    "Match periodic rates to their Effective Annual rate.",
    "Project your Week 1–2 savings into the future and pass the final exam.",
];

/* ---- Lectura: "The Time Traveler's Wallet" ---- */
const READING = [
    { h: "1. A Strange Discovery in Grandfather's Attic" },
    { p: "On a rainy Saturday morning in Bogotá, fifteen-year-old Sofia was helping her grandfather clean out the attic of his old house in La Candelaria. Dust danced in the pale light as they moved heavy wooden boxes filled with antique books, old photographs, and vintage vinyl records." },
    { p: "In a dark cabinet, Sofia found a small iron box locked with a rusted padlock. Her grandfather smiled, took a key from his pocket, and opened it. Inside lay a yellowed envelope with a single $10,000 COP banknote dated September 1970 and a handwritten note." },
    { p: "\"Look at this, Sofia,\" her grandfather said softly. \"In 1970, $10,000 COP was a small fortune. Back then it could buy a high-end bicycle, fifty cinema tickets, or a month of groceries for a family.\"" },
    { p: "Sofia stared at the crisp bill. \"Wait, Grandpa… today $10,000 COP can barely buy a large empanada and a juice! What happened to the rest of the money?\"" },
    { p: "\"The money didn't disappear,\" her grandfather explained. \"Its purchasing power changed. That note stayed completely still inside a box for over fifty years. While it slept, the price of everything around it rose because of inflation. This brings us to the most important rule in all of finance: a peso today is worth more than a peso tomorrow.\"" },
    { h: "2. Why Money Has a 'Time Value'" },
    { p: "Money is not just paper or numbers on a screen; it is a tool used to trade value. The Time Value of Money rests on three pillars." },
    { p: "First, inflation: over time, the general price of goods and services rises. If an ice cream costs $5,000 COP today and inflation is 5% per year, next year it costs $5,250 COP. If your cash doesn't grow, you lose buying power." },
    { p: "Second, opportunity cost: if you hold cash in a jar under your bed, you give up the chance to put that money to work in a bank, a CDT, or a business where it earns interest." },
    { p: "Third, risk and uncertainty: receiving $100,000 COP right now is guaranteed. A promise of $100,000 COP in five years carries risk — the person might not pay, or conditions might change." },
    { h: "3. The Magical Engine: Interest" },
    { p: "To compensate you for inflation, opportunity cost and risk, banks pay you interest when you deposit or invest. When you borrow, you pay interest for the privilege of using someone else's money today." },
    { p: "Interest is the price of renting money over time. How that interest is calculated — simply, or compounding on itself — decides whether your wealth grows slowly or expands exponentially. That is exactly the math you'll master this week." },
];

/* término (como aparece en el texto) → significado en español */
const GLOSSARY = {
    "Time Value of Money": "Valor del dinero en el tiempo — un peso hoy vale más que un peso mañana.",
    "purchasing power": "Poder adquisitivo — lo que tu dinero realmente puede comprar.",
    "inflation": "Inflación — la subida general de los precios; tu dinero compra menos con el tiempo.",
    "opportunity cost": "Costo de oportunidad — lo que dejas de ganar por no poner tu dinero a trabajar.",
    "interest": "Interés — el precio de 'arrendar' dinero en el tiempo; lo que ganas o pagas.",
    "risk": "Riesgo — la posibilidad de que una promesa de dinero futuro no se cumpla.",
};
const KEY_TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/* ---- Comprensión de la lectura (12 preguntas, estilo IELTS) ---- */
const CHECK = [
    { q: "What is the single most important rule the grandfather teaches?", correct: 0, feedback: "A peso today is worth more than a peso tomorrow.", options: ["A peso today is worth more than a peso tomorrow.", "A peso tomorrow is always worth more than today.", "Old banknotes gain value if you keep them.", "Money never changes value over time."] },
    { q: "What happened to the $10,000 note from 1970?", correct: 1, feedback: "The number stayed the same, but its purchasing power fell.", options: ["It physically lost part of its printed value.", "It kept its number but lost purchasing power.", "It grew in value because it is now antique.", "It was replaced by a larger banknote."] },
    { q: "Which three pillars support the time value of money?", correct: 2, feedback: "Inflation, opportunity cost, and risk.", options: ["Savings, spending, and borrowing.", "Banks, CDTs, and pockets.", "Inflation, opportunity cost, and risk.", "Income, expenses, and goals."] },
    { q: "What is 'opportunity cost' in the text?", correct: 0, feedback: "Giving up the chance to make idle money earn interest.", options: ["Giving up the return your idle money could have earned.", "The fee a bank charges to open an account.", "The tax you pay on your savings each year.", "The cost of buying something on sale."] },
    { q: "Why is a guaranteed amount today better than a promise for later?", correct: 3, feedback: "The future promise carries risk and loses time value.", options: ["Because future money is always tax-free.", "Because banks forbid future promises.", "Because today's money can never be spent.", "Because the future promise carries risk and lost time."] },
    { q: "In the ice-cream example, what does 5% inflation do?", correct: 1, feedback: "The same ice cream costs more next year.", options: ["It makes the ice cream cheaper next year.", "It raises the price from $5,000 to $5,250.", "It keeps the price frozen for five years.", "It has no effect on the price at all."] },
    { q: "What does the text call interest?", correct: 2, feedback: "The price of renting money over time.", options: ["A punishment for saving money.", "A tax charged only on loans.", "The price of renting money over time.", "A guarantee that money never loses value."] },
    { q: "Why do banks pay you interest on deposits?", correct: 0, feedback: "To compensate for inflation, opportunity cost and risk.", options: ["To compensate for inflation, opportunity cost and risk.", "Because the law forces them to give gifts.", "Because keeping cash at home is illegal.", "To make you spend the money faster."] },
    { q: "What decides whether wealth grows slowly or explodes?", correct: 1, feedback: "How the interest is calculated — simple vs compound.", options: ["The color of your debit card.", "How the interest is calculated.", "How many banks you visit.", "The age of your banknotes."] },
    { q: "When you borrow money, what do you do with interest?", correct: 3, feedback: "You pay it for using someone else's money today.", options: ["You receive it as a reward.", "You avoid it completely.", "You split it with the bank.", "You pay it to use someone else's money."] },
    { q: "Best meaning of 'purchasing power'?", correct: 0, feedback: "What your money can actually buy.", options: ["What your money can actually buy.", "The number printed on a banknote.", "The age of a currency.", "The number of bank accounts you own."] },
    { q: "What is the main idea Sofia learns overall?", correct: 2, feedback: "Money has a time value, and interest is the engine behind it.", options: ["Old money is always worth more.", "Cash under the bed is the safest choice.", "Money has a time value, powered by interest.", "Inflation only affects rich people."] },
];

/* ---- Quiz del video 1 (valor del dinero en el tiempo) ---- */
const VIDEO_TIME_Q = [
    { q: "The time value of money means…", correct: 1, feedback: "Money available now is worth more than the same amount later.", options: ["money loses its number over time.", "money now is worth more than the same amount later.", "money later is always worth more than now.", "money has no value until you spend it."] },
    { q: "Moving money forward in time (today → future) is called…", correct: 0, feedback: "Compounding grows a present value into a future value.", options: ["compounding.", "discounting.", "depreciating.", "budgeting."] },
    { q: "Moving money backward in time (future → today) is called…", correct: 2, feedback: "Discounting finds the present value of a future amount.", options: ["compounding.", "inflating.", "discounting.", "saving."] },
    { q: "Two amounts are only comparable when they are…", correct: 3, feedback: "You must bring them to the same point in time first.", options: ["from the same bank.", "in the same currency only.", "the same size.", "at the same point in time."] },
];

/* ---- Quiz del video 2 (tasas nominales y efectivas) ---- */
const VIDEO_RATES_Q = [
    { q: "A nominal rate is…", correct: 0, feedback: "A stated yearly rate that ignores how often it compounds.", options: ["a stated rate that ignores compounding frequency.", "the true cost after compounding.", "a rate only used for savings.", "always higher than the effective rate."] },
    { q: "The Effective Annual Rate (E.A.) is…", correct: 1, feedback: "The real yearly rate after accounting for compounding.", options: ["the rate before any compounding.", "the real yearly rate after compounding.", "a rate banks are not allowed to show.", "the same as the monthly rate."] },
    { q: "If a rate compounds monthly, how many periods per year?", correct: 2, feedback: "Monthly means 12 compounding periods.", options: ["1", "6", "12", "24"] },
    { q: "2% monthly gives an E.A. that is…", correct: 3, feedback: "(1.02)^12 − 1 = 26.82%, more than 2×12 = 24%.", options: ["exactly 24%.", "less than 24%.", "exactly 2%.", "more than 24% (about 26.82%)."] },
];

/* ---- Juego "hoy vs mañana" (valor del dinero en el tiempo) ---- */
const TODAY_TOMORROW = [
    { text: "$500,000 today, or $530,000 in one year when inflation is 5%?", better: "future", why: "The future amount is 6% more while prices rise 5% — you still gain about 1% in real value. Waiting barely wins." },
    { text: "$1,000,000 today, or $1,080,000 in one year with inflation at 9%?", better: "today", why: "8% more but prices rise 9% — you'd lose ~1% of real buying power. Take it today." },
    { text: "$300,000 today (you'd invest it at 12% E.A.), or $320,000 in a year?", better: "today", why: "Invested today it becomes ~$336,000 — more than the $320,000 offered. Opportunity cost makes today win." },
    { text: "$2,000,000 today, or $2,300,000 in 2 years in a safe CDT (inflation ~5%)?", better: "future", why: "15% total over 2 years beats ~10% inflation — a real gain of ~5%. Waiting pays." },
    { text: "A guaranteed $600,000 today, or $700,000 in a year from a friend who often forgets to pay?", better: "today", why: "17% more looks great, but the risk of never being paid is real. Certainty usually beats a shaky promise." },
    { text: "$1,000,000 today, or $1,100,000 in one year — inflation 4%, and you could invest at 6%?", better: "future", why: "The offer is 10% more. That beats both the 4% inflation and the 6% you'd earn investing — so waiting wins here. Always compare the offer against your best alternative." },
    { text: "$800,000 today, or $824,000 in one year with inflation at 3%?", better: "today", why: "Only 3% more while inflation is 3% — you break even at best, and lose the chance to invest. Take it today." },
    { text: "$400,000 today, or $500,000 in 3 years (inflation ~6%)?", better: "future", why: "25% total over 3 years vs ~18% inflation — a real gain. The larger future amount wins." },
];

/* ---- Problemas paso a paso: interés simple vs compuesto ---- */
const INTEREST_PROBLEMS = [
    {
        teach: {
            title: "Why simple interest?",
            body: "Simple interest pays you only on the money you first put in — never on the interest you've already earned. It's a straight line: the same amount every period. Banks use it for some short-term loans and basic notes.",
            example: "Example from the reading: invest $1,000,000 at 10% for 3 years. Each year you earn 1,000,000 × 0.10 = $100,000, always the same. After 3 years: $300,000 in interest → $1,300,000 total. Now solve it yourself and check with the calculator (P=1000000, r=10, n=3).",
        },
        scenario: "You invest COP $1,000,000 at 10% annual interest for 3 years, using SIMPLE interest.",
        steps: [
            { type: "choice", q: "First: what is the rate as a decimal?", options: ["0.10", "10", "1.0", "0.010"], correct: 0, feedback: "10% = 10 ÷ 100 = 0.10." },
            { type: "choice", q: "Simple or compound interest here?", options: ["Simple", "Compound"], correct: 0, feedback: "The problem says simple: interest is on the original principal only." },
            { type: "number", q: "Compute the total interest I = P × r × t.", answer: 300000, tol: 0.01, hint: "I = 1,000,000 × 0.10 × 3", feedback: "1,000,000 × 0.10 × 3 = 300,000." },
            { type: "number", q: "Now the Future Value: FV = P + I.", answer: 1300000, tol: 0.01, hint: "FV = 1,000,000 + 300,000", feedback: "1,000,000 + 300,000 = 1,300,000." },
            { type: "choice", q: "What does this mean?", options: ["You earned the same $100,000 every year — a straight line.", "Your interest grew faster each year.", "You lost money to inflation for sure."], correct: 0, feedback: "Simple interest is linear: identical interest every period." },
        ],
    },
    {
        teach: {
            title: "Why compound interest?",
            body: "Compound interest is the snowball: each period's interest is added to your balance, so next period you earn interest on your interest. Einstein called it the eighth wonder of the world — it's what savings accounts, CDTs and investments use.",
            example: "Same $1,000,000 at 10% for 3 years, but compounding. Year 1: 1,100,000. Year 2 earns on 1,100,000 → 1,210,000. Year 3 → 1,331,000. The formula shortcut: FV = 1,000,000 × (1.10)³ = 1,331,000. That's $31,000 MORE than simple — and the gap explodes over decades. Check it: P=1000000, r=10, n=3, read the Compound FV.",
        },
        scenario: "Same COP $1,000,000 at 10% for 3 years — but now COMPOUND interest.",
        steps: [
            { type: "choice", q: "Which formula do you use?", options: ["FV = P (1 + r)ⁿ", "FV = P (1 + r·t)", "I = P · r · t"], correct: 0, feedback: "Compound growth uses FV = P (1 + r)ⁿ." },
            { type: "number", q: "Compute FV = 1,000,000 × (1.10)³.", answer: 1331000, tol: 0.01, hint: "1.10³ = 1.331", feedback: "1,000,000 × 1.331 = 1,331,000." },
            { type: "number", q: "How much MORE did compound earn than simple ($1,300,000)?", answer: 31000, tol: 0.02, hint: "1,331,000 − 1,300,000", feedback: "Compound earned $31,000 more in just 3 years." },
            { type: "choice", q: "Why does compound beat simple?", options: ["Because you earn interest on your interest (snowball).", "Because the rate is secretly higher.", "Because simple interest is illegal."], correct: 0, feedback: "Each year's interest joins the principal and earns more — the snowball effect." },
        ],
    },
    {
        teach: {
            title: "Compound over more years",
            body: "The longer money compounds, the bigger the curve. Time is the real ingredient — small amounts left alone for years beat big amounts added late. This is why starting early matters more than starting big.",
            example: "Deposit $500,000 at 8% E.A. and leave it 5 years. FV = 500,000 × (1.08)⁵. Since 1.08⁵ ≈ 1.469, you get ≈ $734,664 — about 47% more, with zero extra effort. Verify: P=500000, r=8, n=5, read Compound FV.",
        },
        scenario: "A savings account pays 8% E.A. You deposit COP $500,000 and leave it 5 years (compound).",
        steps: [
            { type: "choice", q: "Which values go into FV = P(1+r)ⁿ?", options: ["P=500,000  r=0.08  n=5", "P=500,000  r=8  n=5", "P=500,000  r=0.08  n=60"], correct: 0, feedback: "Rate as a decimal (0.08) and n in years (5)." },
            { type: "number", q: "Compute FV = 500,000 × (1.08)⁵.", answer: 734664, tol: 0.01, hint: "1.08⁵ ≈ 1.469", feedback: "500,000 × 1.469328 ≈ 734,664." },
            { type: "choice", q: "What does the result tell you?", options: ["Your money grew about 47% over 5 years without you doing anything.", "You must add money every month or it shrinks.", "The account lost value to fees."], correct: 0, feedback: "Compound interest grew your deposit by roughly 47% over 5 years." },
        ],
    },
];

/* ---- Problemas paso a paso: Valor Presente / Valor Futuro ---- */
const PVFV_PROBLEMS = [
    {
        teach: {
            title: "What is Future Value?",
            body: "Future Value (FV) answers: 'If I have money TODAY, how much will it become later?' You move forward in time by compounding — multiplying by (1 + r) once per period. Use it when you already have the money and want to know its worth down the road.",
            example: "Deposit $500,000 at 8% for 5 years. FV = 500,000 × (1.08)⁵ = 500,000 × 1.469328 ≈ $734,664. You start with a present amount and grow it. Check with the calculator: P=500000, r=8, n=5 → Compound FV.",
        },
        scenario: "You deposit COP $500,000 at 8% per year. How much will you have in 5 years?",
        steps: [
            { type: "choice", q: "Are you moving money FORWARD or BACKWARD in time?", options: ["Forward — I have money today and want its future value.", "Backward — I have a future amount and want today's value."], correct: 0, feedback: "You have money now → find its Future Value (compounding)." },
            { type: "choice", q: "Which formula fits?", options: ["FV = PV (1 + r)ⁿ", "PV = FV ÷ (1 + r)ⁿ"], correct: 0, feedback: "Forward in time = Future Value." },
            { type: "number", q: "Compute FV = 500,000 × (1.08)⁵.", answer: 734664, tol: 0.01, hint: "1.08⁵ ≈ 1.469328", feedback: "≈ 734,664 COP." },
            { type: "choice", q: "Interpret it:", options: ["In 5 years my $500,000 becomes about $734,664.", "I need $734,664 today to reach $500,000.", "I lose $234,664 to inflation."], correct: 0, feedback: "The deposit grows to about $734,664 in 5 years." },
        ],
    },
    {
        teach: {
            title: "What is Present Value?",
            body: "Present Value (PV) is the mirror image: 'I need a certain amount in the FUTURE — how much must I put in TODAY?' You move backward in time by discounting — dividing by (1 + r) once per period. Use it to plan for a future goal.",
            example: "You want $2,000,000 in 2 years and a CDT pays 12%. PV = 2,000,000 ÷ (1.12)² = 2,000,000 ÷ 1.2544 ≈ $1,594,388. So you deposit ~$1,594,388 today and interest adds the rest. Verify: P=2000000, r=12, n=2 → read Present Value.",
        },
        scenario: "You want to buy a computer in 2 years that costs COP $2,000,000. A CDT pays 12% E.A. How much must you deposit TODAY?",
        steps: [
            { type: "choice", q: "Forward or backward in time?", options: ["Forward — I want a future value.", "Backward — I know the future amount and want today's value."], correct: 1, feedback: "You know the future ($2,000,000) → discount to Present Value." },
            { type: "choice", q: "Which formula fits?", options: ["FV = PV (1 + r)ⁿ", "PV = FV ÷ (1 + r)ⁿ"], correct: 1, feedback: "Backward in time = Present Value (discounting)." },
            { type: "number", q: "Compute PV = 2,000,000 ÷ (1.12)².", answer: 1594388, tol: 0.01, hint: "1.12² = 1.2544", feedback: "2,000,000 ÷ 1.2544 ≈ 1,594,388." },
            { type: "choice", q: "What does the result mean?", options: ["Deposit ~$1,594,388 today and the interest covers the rest.", "You need $2,000,000 today no matter what.", "The CDT is a bad idea."], correct: 0, feedback: "You only need ~$1,594,388 now; interest adds the remaining ~$405,612." },
        ],
    },
    {
        teach: {
            title: "PV reveals what a promise is really worth",
            body: "Because money has time value, a future promise is worth LESS today. Present Value tells you exactly how much less — it's how you compare an amount now against an amount later, fairly, at the same point in time.",
            example: "A relative promises $1,000,000 in 3 years, money worth 10%. PV = 1,000,000 ÷ (1.10)³ = 1,000,000 ÷ 1.331 ≈ $751,315. So that 'million' is really worth ~$751,315 today. Check: P=1000000, r=10, n=3 → Present Value.",
        },
        scenario: "A relative promises you COP $1,000,000 in 3 years. Money is worth 10% E.A. What is that promise worth TODAY?",
        steps: [
            { type: "choice", q: "Which direction in time?", options: ["Backward — discount the future promise to today.", "Forward — compound it to the future."], correct: 0, feedback: "A future promise → bring it back to today (Present Value)." },
            { type: "number", q: "Compute PV = 1,000,000 ÷ (1.10)³.", answer: 751315, tol: 0.01, hint: "1.10³ = 1.331", feedback: "1,000,000 ÷ 1.331 ≈ 751,315." },
            { type: "choice", q: "Interpret:", options: ["That future million is worth only ~$751,315 today.", "That future million is worth ~$1,331,000 today.", "Time has no effect on the value."], correct: 0, feedback: "Because of time value, the promise is worth ~$751,315 now." },
        ],
    },
];

/* ---- Emparejar: tasa periódica ↔ Efectiva Anual (E.A.) ---- */
const RATE_PAIRS = [
    { a: "2% monthly", b: "26.82% E.A." },
    { a: "1% monthly", b: "12.68% E.A." },
    { a: "3% quarterly", b: "12.55% E.A." },
    { a: "5% semi-annual", b: "10.25% E.A." },
    { a: "1.5% monthly", b: "19.56% E.A." },
];

/* ---- Mini examen final (mezcla de todo) ---- */
const FINAL = [
    { q: "A peso today is worth more than a peso tomorrow because of…", correct: 2, feedback: "Inflation, opportunity cost and risk.", options: ["luck.", "bank fees only.", "inflation, opportunity cost and risk.", "the color of money."] },
    { q: "Simple interest of $100,000 at 5% for 2 years equals…", correct: 0, feedback: "I = 100,000 × 0.05 × 2 = 10,000.", options: ["$10,000.", "$5,000.", "$20,000.", "$110,250."] },
    { q: "Compound: $100,000 at 10% for 2 years gives FV of…", correct: 1, feedback: "100,000 × 1.1² = 121,000.", options: ["$120,000.", "$121,000.", "$110,000.", "$100,000."] },
    { q: "To move money from today into the future you…", correct: 0, feedback: "Compounding: FV = PV(1+r)ⁿ.", options: ["compound it.", "discount it.", "ignore the rate.", "subtract inflation."] },
    { q: "Present Value answers the question…", correct: 3, feedback: "How much is a future amount worth today?", options: ["How much will my money grow?", "What bank should I use?", "How risky is my CDT?", "What is a future amount worth today?"] },
    { q: "PV = FV ÷ (1 + r)ⁿ is used to…", correct: 1, feedback: "Discount a future value back to today.", options: ["grow money forward.", "find today's value of future money.", "compute simple interest.", "convert currencies."] },
    { q: "A 2% monthly rate compounded for a year gives an E.A. of about…", correct: 2, feedback: "(1.02)^12 − 1 ≈ 26.82%.", options: ["24%.", "12.68%.", "26.82%.", "2%."] },
    { q: "The nominal rate differs from the E.A. because it…", correct: 0, feedback: "It ignores how often interest compounds.", options: ["ignores compounding frequency.", "already includes compounding.", "is always smaller after compounding.", "is illegal in Colombia."] },
    { q: "Why does compound interest beat simple over time?", correct: 3, feedback: "Interest earns interest — exponential growth.", options: ["It uses a higher secret rate.", "Banks add bonus money.", "It avoids all taxes.", "Interest earns interest (exponential)."] },
    { q: "You need $1,000,000 in 2 years at 10% E.A. Deposit today ≈", correct: 1, feedback: "1,000,000 ÷ 1.21 ≈ 826,446.", options: ["$1,210,000.", "$826,446.", "$1,000,000.", "$500,000."] },
    { q: "Over 30 years, the gap between simple and compound interest is…", correct: 0, feedback: "Compounding pulls far ahead over long horizons.", options: ["huge — compound wins by a lot.", "zero.", "tiny and irrelevant.", "always in favor of simple."] },
    { q: "The formula E.A. = (1 + iₚ)ᵐ − 1 converts…", correct: 2, feedback: "A periodic rate into its Effective Annual rate.", options: ["pesos into dollars.", "future value into present value.", "a periodic rate into an annual effective rate.", "simple into compound principal."] },
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

/* =====================================================================
   REWARD (idéntico look)
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
   QUIZ RUNNER (baraja, set aleatorio, 80% para pasar, reintento)
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
   READER (historia de Sofia)
   ===================================================================== */
function Reader({ done, onFinish, onExit }) {
    const [term, setTerm] = useState(null);
    return (
        <div>
            <div className="reader-bar">
                <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
                <div className="reader-meta"><Clock size={15} strokeWidth={2.3} /> ~8 min read</div>
            </div>
            <article className="s1-reader">
                <span className="reader-tag">READING · B2 · STORY</span>
                <h1>The Time Traveler's Wallet</h1>
                <p className="reader-sub">Sofia discovers why a peso today beats a peso tomorrow.</p>
                <div className="reader-terms">
                    <span className="terms-label">Key words (tap for meaning):</span>
                    {["Time Value of Money", "purchasing power", "inflation", "opportunity cost", "interest", "risk"].map((t) => (
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
   VIDEO LESSON reutilizable (video Cloudinary + quiz)
   ===================================================================== */
function VideoLesson({ url, title, hint, questions, pickCount, passThreshold, xpPerCorrect, xpComplete, onSave, onExit, extra }) {
    return (
        <div>
            <div className="reader-bar">
                <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
                <a className="speed-toggle" href={url} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
            </div>
            <div className="video-frame">
                <video src={url} controls playsInline preload="metadata" controlsList="nodownload">Your browser can't play this video.</video>
            </div>
            <p className="video-hint">🎧 {hint}</p>
            {extra}
            <QuizRunner title={title} emoji="🎬" questions={questions} pickCount={pickCount} passThreshold={passThreshold} xpPerCorrect={xpPerCorrect} xpComplete={xpComplete} onSave={onSave} onExit={onExit} />
        </div>
    );
}

/* =====================================================================
   TIME VALUE · video + juego "hoy vs mañana"
   ===================================================================== */
function TodayTomorrowGame({ onSave, onExit }) {
    const [attempt, setAttempt] = useState(0);
    const [current, setCurrent] = useState(0);
    const [choice, setChoice] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [coins, setCoins] = useState(0);

    const deck = useMemo(() => sample(TODAY_TOMORROW, 6), [attempt]);
    const item = deck[current];
    const isLast = current === deck.length - 1;
    const passThreshold = 80;

    const pick = (val) => {
        if (choice) return;
        setChoice(val);
        if (val === item.better) setScore((s) => s + 1);
    };
    const next = () => {
        if (!isLast) { setCurrent(current + 1); setChoice(null); return; }
        const pct = Math.round((score / deck.length) * 100);
        const passed = pct >= passThreshold;
        const xp = score * XP.timevalueCorrect;
        setCoins(xp); setSaving(true); setFinished(true);
        onSave({ correct: score, total: deck.length, xp, pct, passed }).finally(() => setSaving(false));
    };
    const retry = () => { setAttempt((a) => a + 1); setCurrent(0); setChoice(null); setScore(0); setFinished(false); setCoins(0); };

    if (finished) {
        const pct = Math.round((score / deck.length) * 100);
        if (pct < passThreshold) {
            return (
                <div className="s1-reward">
                    <div className="reward-badge"><X size={40} strokeWidth={2.1} /></div>
                    <h2>Not quite</h2>
                    <p>You got {score} / {deck.length} ({pct}%). You need {passThreshold}% to pass.</p>
                    <div className="reward-coins"><Coins size={20} strokeWidth={2.3} /> +{coins} coins</div>
                    <p className="reward-note">Think about inflation, opportunity cost and risk. Try again.</p>
                    <button className="s1-btn primary" onClick={retry}>Try again <ChevronRight size={18} strokeWidth={2.4} /></button>
                    {saving && <span className="s1-sync"><span className="s1-sync-dot" /> Syncing…</span>}
                </div>
            );
        }
        return <Reward title="Time master! ⏳" subtitle={`You judged ${score} / ${deck.length} scenarios correctly.`} coins={coins} saving={saving} onExit={onExit} />;
    }

    return (
        <div className="s1-quiz tt-game">
            <div className="quiz-top"><h2>⏳ Today or tomorrow?</h2><span className="quiz-count">{current + 1} / {deck.length}</span></div>
            <div className="quiz-track"><i style={{ width: `${(current / deck.length) * 100}%` }} /></div>
            <p className="tt-scenario">{item.text}</p>
            <div className="tt-cards">
                <button className={`tt-card ${choice === "today" ? (item.better === "today" ? "right" : "wrong") : ""} ${choice && item.better === "today" ? "reveal" : ""}`} onClick={() => pick("today")} disabled={!!choice}>
                    <Gift size={26} strokeWidth={2} /><b>Take it today</b>
                </button>
                <button className={`tt-card ${choice === "future" ? (item.better === "future" ? "right" : "wrong") : ""} ${choice && item.better === "future" ? "reveal" : ""}`} onClick={() => pick("future")} disabled={!!choice}>
                    <Hourglass size={26} strokeWidth={2} /><b>Wait for the future</b>
                </button>
            </div>
            {choice && (
                <div className="quiz-feedback"><Lightbulb size={18} strokeWidth={2.2} />
                    <span><b>{choice === item.better ? "Right! " : "Actually… "}</b>{item.why}</span>
                </div>
            )}
            <div className="quiz-nav">
                <button className="s1-btn ghost" onClick={onExit}>Save &amp; exit</button>
                <button className="s1-btn primary" onClick={next} disabled={!choice}>{isLast ? "Finish" : "Next"} <ChevronRight size={18} strokeWidth={2.4} /></button>
            </div>
        </div>
    );
}

function TimeValueLesson({ onSave, onExit }) {
    return (
        <div>
            <div className="reader-bar">
                <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
                <a className="speed-toggle" href={VIDEO_TIME} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
            </div>
            <div className="video-frame">
                <video src={VIDEO_TIME} controls playsInline preload="metadata" controlsList="nodownload">Your browser can't play this video.</video>
            </div>
            <p className="video-hint">🎧 Watch how money moves through time, then win the game below.</p>
            <div className="s3-note">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> The one big idea</h3>
                <p>Money you have <b>now</b> can be invested to grow, and it isn't shrunk by inflation yet. So the same number is worth more today than in the future. But if a future amount is <b>big enough</b> to beat inflation and risk, waiting can win. Judge each case below.</p>
            </div>
            <TodayTomorrowGame onSave={onSave} onExit={onExit} />
        </div>
    );
}

/* =====================================================================
   FINANCIAL CALCULATOR (panel de apoyo para los problemas)
   ===================================================================== */
function FinCalc() {
    const [P, setP] = useState("");
    const [r, setR] = useState("");
    const [n, setN] = useState("");
    const p = parseFloat(P || 0), rate = parseFloat(r || 0) / 100, per = parseFloat(n || 0);
    const simpleI = p && rate && per ? p * rate * per : 0;
    const simpleFV = p ? p + simpleI : 0;
    const compFV = p && per ? p * Math.pow(1 + rate, per) : 0;
    const pv = p && per ? p / Math.pow(1 + rate, per) : 0;

    return (
        <div className="fincalc">
            <div className="fincalc-head"><Calculator size={16} strokeWidth={2.3} /> Financial calculator</div>
            <div className="fincalc-inputs">
                <label>P (amount)<input type="number" value={P} onChange={(e) => setP(e.target.value)} placeholder="1000000" /></label>
                <label>r (% per period)<input type="number" value={r} onChange={(e) => setR(e.target.value)} placeholder="10" /></label>
                <label>n (periods)<input type="number" value={n} onChange={(e) => setN(e.target.value)} placeholder="3" /></label>
            </div>
            <div className="fincalc-out">
                <div><span>Simple interest</span><b>{money(simpleI)}</b></div>
                <div><span>Simple FV = P(1+r·n)</span><b>{money(simpleFV)}</b></div>
                <div className="hi"><span>Compound FV = P(1+r)ⁿ</span><b>{money(compFV)}</b></div>
                <div><span>Present Value = P ÷ (1+r)ⁿ</span><b>{money(pv)}</b></div>
            </div>
            <p className="fincalc-tip">Tip: enter the rate as a percentage (e.g. 10), and n in the same period as the rate.</p>
        </div>
    );
}

/* =====================================================================
   STEP SET · resuelve varios problemas paso a paso (con calculadora)
   ===================================================================== */
function StepSet({ title, emoji, intro, problems, xp, onSave, onExit }) {
    const [pi, setPi] = useState(0);        // índice de problema
    const [si, setSi] = useState(0);        // índice de paso
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

    const pickChoice = (i) => {
        if (answered) return;
        setChoiceIdx(i); setAnswered(true);
    };
    const submitNumber = () => {
        const val = parseNum(numInput);
        const target = step.answer;
        const tol = (step.tol || 0.01) * Math.abs(target) + 1;
        if (!Number.isNaN(val) && Math.abs(val - target) <= tol) { setAnswered(true); setNumError(false); }
        else { setNumError(true); }
    };

    const next = () => {
        if (!isLastStep) { setSi(si + 1); resetStep(); return; }
        if (!isLastProblem) { setPi(pi + 1); setSi(0); resetStep(); return; }
        setSaving(true); setFinished(true);
        onSave({ done: true, xp }).finally(() => setSaving(false));
    };

    if (finished) return <Reward title="Problems solved! 🧮" subtitle="You worked through every step like a real analyst." coins={xp} saving={saving} onExit={onExit} />;

    return (
        <div className="s1-start step-wrap">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><Calculator size={22} strokeWidth={2.1} /></div>
                <div><h2>{emoji} {title}</h2><p>Problem {pi + 1} of {problems.length} · step {si + 1} of {problem.steps.length}</p></div>
            </div>

            {intro && si === 0 && pi === 0 && intro}

            {problem.teach && (
                <div className="s3-teach">
                    <h3><Lightbulb size={18} strokeWidth={2.3} /> {problem.teach.title}</h3>
                    <p>{problem.teach.body}</p>
                    <p className="s3-teach-ex"><b>Worked example — </b>{problem.teach.example}</p>
                </div>
            )}

            <div className="fincalc-row">
                <FinCalc />
            </div>

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
                            <input className={`start-input ${numError ? "err" : ""} ${answered ? "ok" : ""}`} type="text" inputMode="numeric" value={numInput}
                                onChange={(e) => { setNumInput(e.target.value); setNumError(false); }} placeholder="Type your answer (numbers only)" disabled={answered} />
                            {!answered && <button className="s1-btn primary" onClick={submitNumber}>Check</button>}
                        </div>
                        {numError && <p className="num-msg err">Not quite — recompute with the calculator and try again.</p>}
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
   RATE MATCH · empareja tasa periódica ↔ E.A.  (+ video 2)
   ===================================================================== */
function RateMatch({ onSave, onExit }) {
    const [showGame, setShowGame] = useState(false);
    const [leftSel, setLeftSel] = useState(null);
    const [matched, setMatched] = useState({});     // { a: b }
    const [wrongPair, setWrongPair] = useState(null);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    const lefts = useMemo(() => shuffleArr(RATE_PAIRS.map((p) => p.a)), []);
    const rights = useMemo(() => shuffleArr(RATE_PAIRS.map((p) => p.b)), []);
    const answerFor = (a) => RATE_PAIRS.find((p) => p.a === a).b;
    const allDone = Object.keys(matched).length === RATE_PAIRS.length;

    const clickRight = (b) => {
        if (!leftSel || matched[leftSel]) return;
        if (answerFor(leftSel) === b) { setMatched({ ...matched, [leftSel]: b }); setLeftSel(null); }
        else { setWrongPair({ a: leftSel, b }); setTimeout(() => setWrongPair(null), 600); }
    };
    const finish = () => { setSaving(true); setDone(true); onSave({ done: true, xp: XP.rates }).finally(() => setSaving(false)); };

    if (done) return <Reward title="Rates matched! 🔗" subtitle="You converted periodic rates into their true annual cost." coins={XP.rates} saving={saving} onExit={onExit} />;

    if (!showGame) {
        return (
            <div>
                <div className="reader-bar">
                    <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
                    <a className="speed-toggle" href={VIDEO_RATES} target="_blank" rel="noreferrer"><Video size={15} strokeWidth={2.4} /> Open in new tab</a>
                </div>
                <div className="video-frame">
                    <video src={VIDEO_RATES} controls playsInline preload="metadata" controlsList="nodownload">Your browser can't play this video.</video>
                </div>
                <p className="video-hint">🎧 Watch how nominal, periodic and effective rates relate.</p>
                <div className="s3-formula">
                    <h3><ArrowRightLeft size={18} strokeWidth={2.3} /> The conversion rule</h3>
                    <p className="formula">E.A. = (1 + i<sub>p</sub>)<sup>m</sup> − 1</p>
                    <p className="s3-formula-note">where <b>i<sub>p</sub></b> is the periodic rate (as a decimal) and <b>m</b> is how many periods per year: monthly m=12, bi-monthly m=6, quarterly m=4, semi-annual m=2.</p>
                    <p className="s3-formula-ex"><b>Example:</b> a card at 2% monthly → (1 + 0.02)<sup>12</sup> − 1 = <b>26.82% E.A.</b> Even though 2% × 12 = 24% nominal, monthly compounding makes the real cost higher.</p>
                </div>
                <div className="start-foot">
                    <button className="s1-btn primary big" onClick={() => setShowGame(true)}><Play size={18} strokeWidth={2.4} /> Play the matching game</button>
                </div>
            </div>
        );
    }

    return (
        <div className="s1-start">
            <div className="reader-bar"><button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button></div>
            <div className="start-head">
                <div className="start-ico"><ArrowRightLeft size={22} strokeWidth={2.1} /></div>
                <div><h2>Match the rates</h2><p>Tap a periodic rate on the left, then its Effective Annual (E.A.) match on the right.</p></div>
            </div>
            <div className="match-grid">
                <div className="match-col">
                    {lefts.map((a) => (
                        <button key={a} className={`match-item ${matched[a] ? "done" : ""} ${leftSel === a ? "sel" : ""} ${wrongPair?.a === a ? "shake" : ""}`}
                            onClick={() => !matched[a] && setLeftSel(a)} disabled={!!matched[a]}>
                            {matched[a] && <Check size={15} strokeWidth={3} />} {a}
                        </button>
                    ))}
                </div>
                <div className="match-col">
                    {rights.map((b) => {
                        const isMatched = Object.values(matched).includes(b);
                        return (
                            <button key={b} className={`match-item right ${isMatched ? "done" : ""} ${wrongPair?.b === b ? "shake" : ""}`}
                                onClick={() => clickRight(b)} disabled={isMatched}>
                                {isMatched && <Check size={15} strokeWidth={3} />} {b}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="sort-foot">
                <span className="sort-count">{Object.keys(matched).length} / {RATE_PAIRS.length} matched</span>
                <button className="s1-btn primary" onClick={finish} disabled={!allDone}>Finish <ChevronRight size={18} strokeWidth={2.4} /></button>
            </div>
        </div>
    );
}

/* =====================================================================
   GROWTH PROJECTOR · ¿cuánto crece MI ahorro en X años? (actividad)
   ===================================================================== */
function GrowthChart({ years, monthly, rate }) {
    const W = 640, H = 240, pad = 34;
    const i = Math.pow(1 + rate / 100, 1 / 12) - 1;
    const pts = [];
    for (let y = 0; y <= years; y++) {
        const months = y * 12;
        const plain = monthly * months;
        const invested = i > 0 ? monthly * ((Math.pow(1 + i, months) - 1) / i) : plain;
        pts.push({ y, plain, invested });
    }
    const maxV = Math.max(...pts.map((p) => p.invested), 1);
    const x = (y) => pad + (y / years) * (W - pad * 2);
    const yy = (v) => H - pad - (v / maxV) * (H - pad * 2);
    const line = (key) => pts.map((p) => `${x(p.y).toFixed(1)},${yy(p[key]).toFixed(1)}`).join(" ");
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="growth-chart">
            <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} className="gc-axis" />
            <line x1={pad} y1={pad} x2={pad} y2={H - pad} className="gc-axis" />
            <polyline points={line("plain")} className="gc-plain" />
            <polyline points={line("invested")} className="gc-invested" />
            {pts.map((p) => <circle key={p.y} cx={x(p.y)} cy={yy(p.invested)} r="3" className="gc-dot" />)}
            <text x={pad} y={H - 8} className="gc-lbl">Year 0</text>
            <text x={W - pad} y={H - 8} className="gc-lbl" textAnchor="end">Year {years}</text>
        </svg>
    );
}

function GrowthProjector({ existing, week1, week2, onSave, onExit }) {
    const suggested = Math.max(0, parseInt(week2?.plan?.monthly || week1?.budget?.capacity || 0, 10));
    const [monthly, setMonthly] = useState(existing?.monthly || suggested || "");
    const [rate, setRate] = useState(existing?.rate || "");
    const [years, setYears] = useState(existing?.years || 5);
    const [reflection, setReflection] = useState(existing?.reflection || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const m = parseFloat(monthly || 0), rt = parseFloat(rate || 0), yr = parseInt(years || 0, 10);
    const i = Math.pow(1 + rt / 100, 1 / 12) - 1;
    const months = yr * 12;
    const invested = m > 0 && yr > 0 ? (i > 0 ? m * ((Math.pow(1 + i, months) - 1) / i) : m * months) : 0;
    const plain = m * months;
    const earned = invested - plain;

    const MIN_REF = 30;
    const numbersReady = m > 0 && rt > 0 && yr > 0;
    const ready = numbersReady && countWords(reflection) >= MIN_REF;

    const submit = () => { setSaving(true); setSaved(true); onSave({ monthly: m, rate: rt, years: yr, invested: Math.round(invested), earned: Math.round(earned), reflection }).finally(() => setSaving(false)); };

    if (saved) return <Reward title="You projected your future! 🚀" subtitle="You saw compound interest work on your own money." coins={XP.growth} saving={saving} onExit={onExit} />;

    return (
        <div className="s1-start">
            <button className="s1-btn ghost" onClick={onExit}><ArrowLeft size={17} strokeWidth={2.4} /> Back</button>
            <div className="start-head">
                <div className="start-ico"><LineChart size={22} strokeWidth={2.1} /></div>
                <div><h2>Grow your own savings</h2><p>Use the compound math on the money YOUR budget can save. This is where Weeks 1, 2 and 3 meet.</p></div>
            </div>

            <div className="start-explain">
                <h3><Lightbulb size={18} strokeWidth={2.3} /> The idea</h3>
                <p>In Week 1 you found how much you can save each month. In Week 2 you chose where. Now watch what compound interest does to it over the years — the green line pulls away from the gray one, and that gap is <b>free money</b> your interest earned.</p>
            </div>

            <div className="start-block">
                <h3><span className="step-n">1</span> Your numbers</h3>
                <div className="sim-grid">
                    <label className="sim-field"><span>Monthly savings (COP)</span>
                        <input className="start-input" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder={suggested ? String(suggested) : "e.g. 50000"} />
                    </label>
                    <label className="sim-field"><span>Annual rate (% E.A.)</span>
                        <input className="start-input" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 10" />
                    </label>
                    <label className="sim-field"><span>For how many years?</span>
                        <div className="term-toggle">
                            {[3, 5, 10].map((d) => <button key={d} className={yr === d ? "on" : ""} onClick={() => setYears(d)}>{d}y</button>)}
                        </div>
                    </label>
                </div>
            </div>

            {numbersReady && (
                <div className="sim-result">
                    <h3>Saving {money(m)}/month for {yr} years at {rt}% E.A.</h3>
                    <GrowthChart years={yr} monthly={m} rate={rt} />
                    <div className="growth-legend">
                        <span><i className="dot plain" /> Just piling it up: {money(plain)}</span>
                        <span><i className="dot inv" /> With compound interest: {money(invested)}</span>
                    </div>
                    <div className="s3-teach" style={{ marginTop: 6 }}>
                        <h3><Lightbulb size={18} strokeWidth={2.3} /> How to read this graph</h3>
                        <p>The <b>dashed gray line</b> is the "under the mattress" path: you just stack your monthly savings, so it climbs in a <b>straight line</b> — {money(m)} × {yr * 12} months = {money(plain)}. No line ever earns on itself.</p>
                        <p>The <b>solid green line</b> is the same monthly savings, but inside something that pays {rt}% E.A. Each deposit starts earning interest, and that interest earns interest too — so the line <b>curves upward and pulls away</b> from the gray one. The longer you leave it, the wider the gap.</p>
                        <p className="s3-teach-ex"><b>That gap is compound interest working for you.</b> Same effort, same monthly amount — the only difference is <i>where</i> you put it. More years, a higher rate, or a bigger monthly deposit all widen the green curve.</p>
                    </div>
                    <div className="sim-verdict good">
                        <TrendingUp size={18} strokeWidth={2.3} /> Compound interest earned you an extra <b>{money(earned)}</b> — money you made without working, just by choosing the right instrument.
                    </div>
                </div>
            )}

            <div className="start-block">
                <h3><span className="step-n">2</span> What does this show you? (in English)</h3>
                <p className="start-tip">Explain what surprised you: how big is the gap, and what would change it (more time, a higher rate, more monthly)?</p>
                <WordFieldLocal value={reflection} onChange={setReflection} min={MIN_REF} max={130} rows={5} placeholder="Compound interest surprised me because …" />
            </div>

            <div className="start-bridge">
                <h3>The heart of it all ❤️</h3>
                <p>Week 1 said <b>how much</b>. Week 2 said <b>where</b>. Week 3 gave you the <b>math</b> that makes it grow. Next you'll learn how the same interest works against you — in credit and debt.</p>
            </div>

            <div className="start-foot">
                <button className="s1-btn primary big" onClick={submit} disabled={!ready}>Finish activity <span className="coin-tag"><Coins size={15} /> +{XP.growth}</span></button>
            </div>
        </div>
    );
}

/* Campo con mínimo de palabras (local, para no depender de S2) */
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
   COMPONENTE PRINCIPAL
   ===================================================================== */
export const Semana3 = ({ userData, API_URL, existingRow, onBack }) => {
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

    // Datos de S1 (presupuesto) y S2 (plan) desde el store
    const week1 = useMemo(() => { try { const r = JSON.parse(store.semanas?.[1]?.Respuestas_JSON || "{}"); return { budget: r.start, diagnostic: r.diagnostic }; } catch { return {}; } }, [store.semanas]);
    const week2 = useMemo(() => { try { return JSON.parse(store.semanas?.[2]?.Respuestas_JSON || "{}"); } catch { return {}; } }, [store.semanas]);

    const doneCount = SECTION_KEYS.filter((k) => checklist[k]).length;
    const pct = Math.round((doneCount / TOTAL_SECTIONS) * 100);

    const persist = (nextChecklist, nextPoints, respPatch) => {
        respRef.current = { ...respRef.current, ...respPatch };
        const done = SECTION_KEYS.filter((k) => nextChecklist[k]).length;
        const newPct = Math.round((done / TOTAL_SECTIONS) * 100);
        const row = {
            Student_Key: userData.Student_Key, Semana: 3,
            Estado: done >= TOTAL_SECTIONS ? "completed" : "in_progress",
            Porcentaje: newPct,
            Puntos_Comportamiento: nextPoints.comportamiento,
            Puntos_Quizzes: nextPoints.quizzes,
            Puntos_Aprendi: nextPoints.aprendi,
            Checklist_JSON: JSON.stringify(nextChecklist),
            Respuestas_JSON: JSON.stringify(respRef.current),
        };
        const prev = store.semanas?.[3];
        dispatch({ type: "save_progreso", payload: row });
        fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "save_progreso", data: row }) })
            .catch((e) => { console.error("Error guardando Semana 3:", e); dispatch({ type: "rollback_progreso", payload: { Semana: 3, prev } }); });
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

    /* ---------- VISTAS ---------- */
    if (open === "reading") return (
        <div className="s1"><Reader done={!!checklist.reading} onExit={() => setOpen(null)}
            onFinish={() => { complete("reading", { comportamiento: XP.reading }, { reading: { at: new Date().toISOString() } }); setOpen(null); }} /></div>
    );
    if (open === "check") return (
        <div className="s1"><QuizRunner title="Reading check" emoji="🧠" questions={CHECK} pickCount={10} passThreshold={80} xpPerCorrect={XP.checkCorrect} xpComplete={0}
            onExit={() => setOpen(null)}
            onSave={(r) => complete("check", { quizzes: r.correct * XP.checkCorrect }, { check: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );
    if (open === "timevalue") return (
        <div className="s1"><TimeValueLesson onExit={() => setOpen(null)}
            onSave={(r) => complete("timevalue", { quizzes: r.correct * XP.timevalueCorrect, comportamiento: 10 }, { timevalue: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );
    if (open === "interest") return (
        <div className="s1"><StepSet title="Simple vs Compound" problems={INTEREST_PROBLEMS} xp={XP.interest}
            intro={
                <div className="s3-formula">
                    <h3><Scale size={18} strokeWidth={2.3} /> Two ways interest grows</h3>
                    <p className="formula">Simple: FV = P (1 + r · t)</p>
                    <p className="formula">Compound: FV = P (1 + r)<sup>n</sup></p>
                    <p className="s3-formula-note"><b>Interest is the price of renting money.</b> When you save or invest, the bank rents your money and pays you; when you borrow, you rent theirs and pay them. There are two ways that rent is calculated — and the difference decides whether your wealth grows slowly or explodes.</p>
                    <p className="s3-formula-note"><b>Simple interest</b> is always charged on your <b>original amount</b> only (the principal). The interest never joins the pot, so you earn the exact same amount every period. Graph it and you get a <b>straight line</b>. It's common in short-term loans and basic notes.</p>
                    <p className="s3-formula-note"><b>Compound interest</b> adds each period's interest <b>back into your balance</b>, so the next period you earn interest on a bigger number — interest on your interest. Graph it and you get a <b>curve that speeds up</b>. Savings accounts, CDTs and investments all compound. Einstein reportedly called it "the eighth wonder of the world: he who understands it, earns it; he who doesn't, pays it."</p>
                    <p className="s3-formula-ex"><b>The key difference:</b> with $1,000,000 at 10% for 3 years, simple gives $1,300,000 but compound gives $1,331,000 — $31,000 more, from the same money and rate. Over 20–30 years that gap grows into millions. More time and more compounding always favor compound. Use the calculator below to prove each step yourself.</p>
                </div>
            }
            onExit={() => setOpen(null)}
            onSave={() => complete("interest", { aprendi: XP.interest }, { interest: { done: true, at: new Date().toISOString() } })} /></div>
    );
    if (open === "pvfv") return (
        <div className="s1"><StepSet title="Present & Future Value" problems={PVFV_PROBLEMS} xp={XP.pvfv}
            intro={
                <div className="s3-formula">
                    <h3><ArrowRightLeft size={18} strokeWidth={2.3} /> Move money through time</h3>
                    <p className="formula">Forward (Future Value): FV = PV (1 + r)<sup>n</sup></p>
                    <p className="formula">Backward (Present Value): PV = FV ÷ (1 + r)<sup>n</sup></p>
                    <p className="s3-formula-note"><b>A peso today is not the same as a peso tomorrow.</b> To compare money at different times fairly, you have to bring both amounts to the <b>same point in time</b> first. There are only two directions you can travel: forward, or backward.</p>
                    <p className="s3-formula-note"><b>Future Value (FV)</b> moves money <b>forward</b>. It answers: "I have money today — what will it become later?" You <b>compound</b>: multiply by (1 + r) once for every period. Use it when you already hold the money and want to know its worth down the road.</p>
                    <p className="s3-formula-note"><b>Present Value (PV)</b> is the exact mirror — it moves money <b>backward</b>. It answers: "I need a certain amount in the future — how much must I put in <b>today</b>?" You <b>discount</b>: divide by (1 + r) once per period. Use it to plan for a goal, or to see what a future promise is really worth right now.</p>
                    <p className="s3-formula-note"><b>How to choose:</b> if you know the amount <b>today</b> and want later → FV (multiply). If you know the amount <b>in the future</b> and want today → PV (divide). Same rate, same periods — only the direction changes.</p>
                    <p className="s3-formula-ex"><b>See both in action:</b> $500,000 today at 8% for 5 years grows to FV = 500,000 × (1.08)⁵ ≈ $734,664 (forward). Flip it: to <b>have</b> $2,000,000 in 2 years at 12%, you need PV = 2,000,000 ÷ (1.12)² ≈ $1,594,388 today (backward) — the interest fills the ~$405,612 gap. Prove each with the calculator below.</p>
                </div>
            }
            onExit={() => setOpen(null)}
            onSave={() => complete("pvfv", { aprendi: XP.pvfv }, { pvfv: { done: true, at: new Date().toISOString() } })} /></div>
    );
    if (open === "rates") return (
        <div className="s1"><RateMatch onExit={() => setOpen(null)}
            onSave={() => complete("rates", { aprendi: XP.rates }, { rates: { done: true, at: new Date().toISOString() } })} /></div>
    );
    if (open === "growth") return (
        <div className="s1"><GrowthProjector existing={respRef.current?.growth} week1={week1} week2={week2} onExit={() => setOpen(null)}
            onSave={(r) => complete("growth", { aprendi: XP.growth }, { growth: { ...r, at: new Date().toISOString() } })} /></div>
    );
    if (open === "final") return (
        <div className="s1"><QuizRunner title="Final exam" emoji="🏆" questions={FINAL} pickCount={10} passThreshold={80} xpPerCorrect={XP.finalCorrect} xpComplete={0}
            onExit={() => setOpen(null)}
            onSave={(r) => complete("final", { quizzes: r.correct * XP.finalCorrect }, { final: { correct: r.correct, total: r.total, at: new Date().toISOString() } }, r.passed)} /></div>
    );

    /* ---------- MENÚ ---------- */
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

            <div className="s1-hero s3-hero">
                <span className="s1-tag"><Hourglass size={14} strokeWidth={2.6} /> WEEK 3 · FINANCIAL MATH · THE HEART</span>
                <h1>Make your money move through time</h1>
                <p>The engine of the whole course: simple vs compound interest, present and future value, and how to read any rate. This is where Weeks 1 and 2 turn into real numbers.</p>
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
                <Section k="reading" icon={<BookOpen size={22} strokeWidth={2.1} />} title="Reading: The Time Traveler's Wallet" desc="Sofia learns why a peso today beats a peso tomorrow."
                    topics={["Time value", "Inflation", "Opportunity cost"]}
                    cta={btn("reading", "Read", <span className="coin-tag"><Coins size={14} /> +{XP.reading}</span>)} />

                <Section k="check" icon={<GraduationCap size={22} strokeWidth={2.1} />} title="Reading check" desc="10 random questions from the story — pass with 80%."
                    cta={btn("check", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.checkCorrect}</span>)} />

                <Section k="timevalue" icon={<Hourglass size={22} strokeWidth={2.1} />} title="Video + Today vs Tomorrow" desc="Watch the time-value video, then win the decision game."
                    topics={["Time value", "Compounding", "Discounting"]}
                    cta={btn("timevalue", <><Play size={16} strokeWidth={2.6} /> Watch</>, <span className="coin-tag"><Coins size={14} /> +{6 * XP.timevalueCorrect}</span>)} />

                <Section k="interest" icon={<Scale size={22} strokeWidth={2.1} />} title="Simple vs Compound" desc="Solve interest problems step by step with a calculator."
                    topics={["Simple", "Compound", "Snowball"]}
                    cta={btn("interest", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.interest}</span>)} />

                <Section k="pvfv" icon={<ArrowRightLeft size={22} strokeWidth={2.1} />} title="Present & Future Value" desc="Move money through time, one guided step at a time."
                    topics={["Future value", "Present value", "Discounting"]}
                    cta={btn("pvfv", <><Play size={16} strokeWidth={2.6} /> Solve</>, <span className="coin-tag"><Coins size={14} /> +{XP.pvfv}</span>)} />

                <Section k="rates" icon={<Zap size={22} strokeWidth={2.1} />} title="Video + Rate match" desc="Learn nominal vs effective, then match rates to their E.A."
                    topics={["Nominal", "Effective (E.A.)", "Equivalences"]}
                    cta={btn("rates", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{XP.rates}</span>)} />

                <Section k="growth" icon={<LineChart size={22} strokeWidth={2.1} />} title="Grow your own savings ⭐" desc="Project your Week 1–2 savings into the future with compound math."
                    topics={["Your money", "Compound", "X years"]}
                    cta={btn("growth", "Build", <span className="coin-tag"><Coins size={14} /> +{XP.growth}</span>)} />

                <Section k="final" icon={<Trophy size={22} strokeWidth={2.1} />} title="Final exam" desc="10 mixed questions from the whole week — pass with 80%."
                    cta={btn("final", <><Play size={16} strokeWidth={2.6} /> Start</>, <span className="coin-tag"><Coins size={14} /> +{10 * XP.finalCorrect}</span>)} />
            </div>
        </div>
    );
};