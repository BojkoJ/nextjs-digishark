// Deklarace pro side-effect importy CSS souborů.
// Next.js je řeší při buildu, ale TS server (hlavně s moduleResolution "bundler")
// potřebuje ambient deklarace, jinak hlásí "Cannot find module ... side-effect import".

declare module "*.css";

// Swiper publikuje CSS přes subpath exporty (swiper/css, swiper/css/pagination, ...)
declare module "swiper/css";
declare module "swiper/css/*";
