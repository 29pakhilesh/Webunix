// js/store.js - Fixed Images & Bulletproof Fallback
(function() {
    // High-reliability image URLs
    const PRODUCTS = [
        // --- MOBILES ---
        { name: "iPhone 15 Pro Max", price: "₹1,59,900", img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&q=80", link: "https://www.flipkart.com/search?q=iphone+15+pro+max" },
        { name: "Samsung S24 Ultra", price: "₹1,29,999", img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80", link: "https://www.flipkart.com/search?q=samsung+s24+ultra" },
        { name: "Google Pixel 8 Pro", price: "₹1,06,999", img: "https://images.unsplash.com/photo-1616423640778-2cfd1e389df0?w=400&q=80", link: "https://www.flipkart.com/search?q=pixel+8+pro" },
        { name: "OnePlus 12", price: "₹69,999", img: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400&q=80", link: "https://www.flipkart.com/search?q=oneplus+12" },
        { name: "Nothing Phone (2)", price: "₹39,999", img: "https://images.unsplash.com/photo-1691434384666-8d59461d3326?w=400&q=80", link: "https://www.flipkart.com/search?q=nothing+phone+2" },

        // --- LAPTOPS ---
        { name: "MacBook Air M3", price: "₹1,14,900", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80", link: "https://www.flipkart.com/search?q=macbook+air+m3" },
        { name: "Dell XPS 15", price: "₹1,85,000", img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80", link: "https://www.flipkart.com/search?q=dell+xps+15" },
        { name: "iPad Pro M4", price: "₹99,900", img: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&q=80", link: "https://www.flipkart.com/search?q=ipad+pro" },
        { name: "HP Spectre x360", price: "₹1,45,000", img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80", link: "https://www.flipkart.com/search?q=hp+spectre" },

        // --- AUDIO ---
        { name: "Sony WH-1000XM5", price: "₹26,990", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80", link: "https://www.flipkart.com/search?q=sony+xm5" },
        { name: "Apple AirPods Max", price: "₹59,900", img: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=400&q=80", link: "https://www.flipkart.com/search?q=airpods+max" },
        { name: "JBL Flip 6", price: "₹9,999", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", link: "https://www.flipkart.com/search?q=jbl+flip+6" },
        { name: "Marshall Speaker", price: "₹31,999", img: "https://images.unsplash.com/photo-1620121474661-d1c925556208?w=400&q=80", link: "https://www.flipkart.com/search?q=marshall+speaker" },

        // --- WEARABLES ---
        { name: "Apple Watch Ultra 2", price: "₹89,900", img: "https://images.unsplash.com/photo-1664478546384-d57ffe74a797?w=400&q=80", link: "https://www.flipkart.com/search?q=apple+watch+ultra" },
        { name: "Samsung Watch 6", price: "₹29,999", img: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80", link: "https://www.flipkart.com/search?q=galaxy+watch+6" },
        { name: "Casio G-Shock", price: "₹8,995", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", link: "https://www.flipkart.com/search?q=g-shock" },
        { name: "Nike Air Jordan", price: "₹16,995", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", link: "https://www.flipkart.com/search?q=air+jordan+1" },

        // --- GADGETS ---
        { name: "PlayStation 5", price: "₹54,990", img: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80", link: "https://www.flipkart.com/search?q=ps5" },
        { name: "Xbox Series X", price: "₹49,990", img: "https://images.unsplash.com/photo-1621259182902-880a71ca9052?w=400&q=80", link: "https://www.flipkart.com/search?q=xbox+series+x" },
        { name: "Nintendo Switch", price: "₹29,990", img: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&q=80", link: "https://www.flipkart.com/search?q=nintendo+switch" },
        { name: "Canon EOS R6", price: "₹2,15,990", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", link: "https://www.flipkart.com/search?q=canon+eos+r6" },
        { name: "GoPro HERO 12", price: "₹39,990", img: "https://images.unsplash.com/photo-1564466136-20a4ab8fa043?w=400&q=80", link: "https://www.flipkart.com/search?q=gopro+hero+12" },
        { name: "DJI Mini 4 Pro", price: "₹84,990", img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80", link: "https://www.flipkart.com/search?q=dji+mini+4+pro" },
        { name: "Ray-Ban Aviator", price: "₹6,590", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", link: "https://www.flipkart.com/search?q=rayban+aviator" }
    ];

    window.openStore = function() {
        const id = "store-window";
        if (document.getElementById(id)) {
            if(window.wm) document.getElementById(id).style.zIndex = ++window.wm.zIndex;
            return;
        }

        const win = document.createElement("div");
        win.id = id;
        win.className = "app-window";
        win.style.cssText = "width:950px;height:650px;display:flex;flex-direction:column;background:#f1f3f6;font-family:sans-serif;";
        
        const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Store", win) : Date.now();

        win.innerHTML = `
            <div class="title-bar" style="background:#2874f0;height:45px;display:flex;align-items:center;padding:0 15px;border-bottom:none;">
                <img src="https://img1a.flixcart.com/www/linchpin/fk-cp-zion/img/flipkart-plus_8d85f4.png" style="height:18px;margin-right:20px;">
                <input type="text" placeholder="Search for products, brands and more" style="flex:1;max-width:500px;padding:9px 12px;border-radius:2px;border:none;outline:none;font-size:14px;color:#333;box-shadow:0 1px 2px rgba(0,0,0,0.1);">
                <div style="flex:1;"></div>
                <button class="close-btn" style="background:white;width:16px;height:16px;opacity:0.8;"></button>
            </div>
            
            <div style="background:white;padding:12px 15px;display:flex;gap:25px;box-shadow:0 1px 2px rgba(0,0,0,0.1);font-size:13px;font-weight:600;color:#333;justify-content:center;overflow-x:auto;">
                <span style="cursor:pointer;white-space:nowrap;">Top Offers</span>
                <span style="cursor:pointer;white-space:nowrap;">Mobiles & Tablets</span>
                <span style="cursor:pointer;white-space:nowrap;">Electronics</span>
                <span style="cursor:pointer;white-space:nowrap;">TVs & Appliances</span>
                <span style="cursor:pointer;white-space:nowrap;">Fashion</span>
            </div>

            <div id="store-content" style="flex:1;overflow-y:auto;padding:15px;display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:15px;align-content:start;"></div>
        `;

        document.body.appendChild(win);
        if(window.wm) window.wm.register(win);

        const grid = win.querySelector("#store-content");

        // Base64 Gray Pixel - Impossible to fail loading
        const FALLBACK_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        PRODUCTS.forEach(p => {
            const card = document.createElement("div");
            card.style.cssText = "height:320px;background:white;border-radius:4px;overflow:hidden;cursor:pointer;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;flex-direction:column;";
            
            card.innerHTML = `
                <div style="height:180px;display:flex;align-items:center;justify-content:center;padding:15px;background:#fff;position:relative;">
                    <img src="${p.img}" 
                         style="max-height:100%;max-width:100%;object-fit:contain;" 
                         loading="lazy"
                         onerror="this.onerror=null;this.src='${FALLBACK_IMG}';this.style.width='100px';this.style.opacity='0.5';"
                    >
                    <div style="position:absolute;top:10px;right:10px;background:#f0f0f0;border-radius:50%;width:24px;height:24px;display:grid;place-items:center;font-size:12px;color:#ccc;">♥</div>
                </div>
                <div style="padding:12px;flex:1;display:flex;flex-direction:column;border-top:1px solid #f0f0f0;">
                    <div style="font-weight:500;font-size:14px;color:#212121;margin-bottom:4px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;" title="${p.name}">
                        ${p.name}
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="background:#388e3c;color:white;font-size:10px;padding:2px 4px;border-radius:2px;font-weight:bold;">4.6 ★</span>
                        <span style="color:#878787;font-size:11px;">(1,234)</span>
                    </div>
                    <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;flex-direction:column;">
                            <span style="font-weight:600;font-size:16px;color:#212121;">${p.price}</span>
                            <span style="font-size:11px;color:#26a541;font-weight:600;">Free Delivery</span>
                        </div>
                        <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" style="height:18px;">
                    </div>
                </div>
            `;
            card.onmouseenter = () => { card.style.transform = "translateY(-4px)"; card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; };
            card.onmouseleave = () => { card.style.transform = "translateY(0)"; card.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"; };
            card.onclick = () => window.open(p.link, "_blank");
            grid.appendChild(card);
        });

        win.querySelector(".close-btn").onclick = () => window.kernel?.process?.kill(pid) || win.remove();
    };
})();