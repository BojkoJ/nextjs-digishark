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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFiles = void 0;
var addUser = function (_a) {
    var req = _a.req, data = _a.data;
    var user = req.user;
    return __assign(__assign({}, data), { user: user === null || user === void 0 ? void 0 : user.id });
};
var yourOwnAndPurchased = function (_a) {
    var req = _a.req;
    return __awaiter(void 0, void 0, void 0, function () {
        var user, products, ownProductFileIds, orders, purchasedProductFileIds;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    user = req.user;
                    if ((user === null || user === void 0 ? void 0 : user.role) === "admin")
                        return [2 /*return*/, true];
                    if (!user)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, req.payload.find({
                            // tohle je něco jako select query, kterou asynchronně voláme na serveru
                            collection: "products",
                            depth: 0, // když hledáme produkty, každý produkt je spojený s userem přes id
                            // kdyby jsme měli depth: 1 tak by to fetchlo celého usera ale my chceme jen jeho id
                            // je to něco jako join v sql
                            where: {
                                user: {
                                    equals: user.id,
                                },
                            },
                        })];
                case 1:
                    products = (_b.sent()).docs;
                    ownProductFileIds = products.map(function (prod) { return prod.product_files; }).flat();
                    return [4 /*yield*/, req.payload.find({
                            collection: "orders",
                            depth: 2, // spojí tabulky (Něco jako join), dá nám i CELÉHO usera (místo pouze jeho id) a taky celé soubory produktu
                            where: {
                                user: {
                                    equals: user.id,
                                },
                            },
                        })];
                case 2:
                    orders = (_b.sent()).docs;
                    purchasedProductFileIds = orders
                        .map(function (order) {
                        return order.products.map(function (product) {
                            // mapujeme skrze všechny produkty v jedné objednávce
                            if (typeof product === "string")
                                return req.payload.logger.error("Search depth not sufficient to find purchased file IDs");
                            /* Pokud má produkt jeden soubor:
            
                                return typeof product.product_files === "string"
                                ? product.product_files
                                : product.product_files.id; */
                            product.product_files.map(function (product_file) {
                                return typeof product_file === "string"
                                    ? product_file
                                    : product_file.id;
                            });
                        });
                    })
                        .filter(Boolean)
                        .flat();
                    return [2 /*return*/, {
                            id: {
                                in: __spreadArray(__spreadArray([], ownProductFileIds, true), purchasedProductFileIds, true),
                            },
                        }];
            }
        });
    });
};
exports.ProductFiles = {
    slug: "product_files",
    labels: {
        singular: "Soubor produktu",
        plural: "Soubory produktu",
    },
    admin: {
        hidden: function (_a) {
            var user = _a.user;
            return user.role !== "admin";
        },
    },
    hooks: {
        beforeChange: [addUser],
    },
    access: {
        read: yourOwnAndPurchased,
        update: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
        delete: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
    },
    upload: {
        staticURL: "/product_files", // na tomhle endpointu budou soubory dostupné
        staticDir: "product_files", // budou tady v této složce
        // tímto vlastně říkáme, že složba product_files bude na routě /product_files
        mimeTypes: [
            "image/*", // Přijímá všechny formáty obrázků (včetně PNG, JPEG, SVG, atd.)
            "font/*", // Přijímá všechny formáty písma (např. TTF, OTF, WOFF)
            "application/postscript", // Soubory Adobe Illustrator/Photoshop (EPS)
            "text/css", // CSS soubory
            "application/json", // JSON soubory
            "application/vnd.sketch", // Soubory Sketch
            //"application/zip", // Add zip mime type
            //"application/x-rar-compressed", // Add rar mime type
        ],
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            admin: {
                condition: function () { return false; }, // normalní uživatelé toto nemohou vidět v CMS
            },
            hasMany: true,
            required: true,
        },
    ],
};
