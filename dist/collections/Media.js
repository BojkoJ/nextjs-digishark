"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
// typ Acccess poskytuje Payload, tahle funkce bude vracet přístupovou politiku (access policy)
// která nám bude říkat jestli user má přístup k obrázku
var isAdminOrHasAccessToImages = function () {
    return function (_a) {
        var req = _a.req;
        return __awaiter(void 0, void 0, void 0, function () {
            var user;
            return __generator(this, function (_b) {
                user = req.user;
                if (!user)
                    return [2 /*return*/, false];
                // false - nemůžeš mít přístup k tomuhle obrázku
                // true - můžeš mít přístup k tomuhle obrázky
                if (user.role === "admin")
                    return [2 /*return*/, true];
                return [2 /*return*/, {
                        // vracíme query constraint
                        // pokud user vlastní tento obrázek
                        // pokud pole user které je přiřazeno obrázku (user field které je v poli fields)
                        // se rovná aktuálně přihlášenému userovi tak je to jeho obrázek
                        user: {
                            equals: req.user.id,
                        },
                    }];
            });
        });
    };
};
exports.Media = {
    slug: "media",
    labels: {
        singular: "Náhledový Obrázek",
        plural: "Náhledové Obrázky",
    },
    hooks: {
        beforeChange: [
            function (_a) {
                var req = _a.req, data = _a.data;
                //funkce co se zavolá těsně před změnou produktu
                // každý productImage (náhleďák produktu) bude spojený s uživatelem protože
                // když uživatel bude vybírat media files (soubory) pro produkt, tak aby měl přístup jen k těm svým¨
                return __assign(__assign({}, data), { user: req.user.id });
                // Funkce v tomto hooku zajistí, že každá změna položky media přiřadí aktuálního uživatele
                // (získaného z req.user.id) jako vlastníka této položky.
            },
        ],
    },
    access: {
        // když bude user u produktu dávat náhleďáky bude moct nahrát z počítače nebo nahrát z existujících
        // ale tím pádem musíme omezit to, aby každý uživatel mohl nahrát jen z těch svých existujících
        read: function (_a) {
            var req = _a.req;
            return __awaiter(void 0, void 0, void 0, function () {
                var referer;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            referer = req.headers.referer;
                            // Pokud uživatel není lognutý nebo není v backendu tak pak funkce vrátí true - může číst všechny obrázky
                            if (!req.user || !(referer === null || referer === void 0 ? void 0 : referer.includes("sell"))) {
                                return [2 /*return*/, true];
                            }
                            return [4 /*yield*/, isAdminOrHasAccessToImages()({ req: req })];
                        case 1: 
                        // co tady říkáme je: pokud jsi na frontendu a nejsi přihlášený (na backendu), můžeš vidět všechny obrázky
                        // pokud jsi ale na backendu nebo přihlášený (na backendu) nemůžeš vidět všechny obrázky - můžeš vidět jen ty svoje
                        return [2 /*return*/, _b.sent()];
                    }
                });
            });
        },
        delete: function (_a) {
            var req = _a.req;
            return isAdminOrHasAccessToImages()({ req: req });
        },
        update: function (_a) {
            var req = _a.req;
            return isAdminOrHasAccessToImages()({ req: req });
        },
    },
    admin: {
        // nechceme aby se Media zobrazovala v admin dashboardu v CMS, ale chceme aby pořád fungovala jako úložiště
        // nahraných náhleďáků, chceme aby tuhle kolekci viděl jenom Administrátor
        hidden: function (_a) {
            var user = _a.user;
            return user.role !== "admin";
        },
        // pokud user není admin tak Media bude hidden
    },
    upload: {
        staticURL: "/media", // tady chceme aby náhleďáky byly
        staticDir: "media", // složka media ve filesystemu kde budou media uloženy
        imageSizes: [
            // generuje různé verze těchto obrázků
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre",
            },
            {
                name: "card",
                width: 768,
                height: 1024,
                position: "centre",
            },
            {
                name: "tablet",
                width: 1024,
                height: undefined, // vypočítá výšku automaticky
                position: "centre",
            },
        ],
        mimeTypes: ["image/*"], // uživatele můžou nahrát jen jpg, png, svg ale nic jiného než obrázky
    },
    fields: [
        {
            name: "user",
            label: "Uživatel",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false, // jeden obrázek patří k jednomu userovi
            admin: {
                condition: function () { return false; },
            },
        },
    ],
};
