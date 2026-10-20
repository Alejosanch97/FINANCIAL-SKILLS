import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Global styles for your application
import { RouterProvider } from "react-router-dom";  // Import RouterProvider to use the router
import { router } from "./routes";  // Import the router configuration
import { StoreProvider } from './hooks/useGlobalReducer';  // Import the StoreProvider for global state management

// Si alguien logra traducir la página, la tapamos con un aviso
function NoTranslateGuard() {
    useEffect(() => {
        const html = document.documentElement;
        const check = () => {
            const translated = html.classList.contains("translated-ltr") || html.classList.contains("translated-rtl") || (html.lang && !html.lang.toLowerCase().startsWith("en"));
            let box = document.getElementById("no-translate-box");
            if (translated && !box) {
                box = document.createElement("div");
                box.id = "no-translate-box";
                box.className = "notranslate";
                box.setAttribute("translate", "no");
                box.innerHTML = '<div style="background:#fff;border-radius:20px;padding:28px;max-width:420px;text-align:center;font-family:sans-serif"><div style="font-size:48px">🇬🇧</div><h2 style="margin:8px 0;color:#0c3d2c">English only, please!</h2><p style="color:#333">FinFluent is your English class. Turn off the translator and reload the page.</p><button onclick="location.reload()" style="margin-top:10px;background:#16b074;color:#fff;border:none;border-radius:12px;padding:12px 20px;font-weight:700;cursor:pointer">Reload in English</button></div>';
                Object.assign(box.style, { position: "fixed", inset: "0", zIndex: "99999", background: "rgba(7,42,30,.92)", display: "grid", placeItems: "center", padding: "16px" });
                document.body.appendChild(box);
            }
            if (!translated && box) box.remove();
        };
        const obs = new MutationObserver(check);
        obs.observe(html, { attributes: true, attributeFilter: ["class", "lang"] });
        check();
        return () => obs.disconnect();
    }, []);
    return null;
}

const Main = () => {
    return (
        <React.StrictMode>  
            <NoTranslateGuard />
            {/* Provide global state to all components */}
            <StoreProvider> 
                {/* Set up routing for the application */} 
                <RouterProvider router={router}>
                </RouterProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
