import { Product } from "@/payload-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Můžeme přídávat položky
// můžeme odebírat položky
// můžeme vysypat košík
// (musíme: pamatovat položky v košíku)

export type CartItem = {
	product: Product;
};

type CartState = {
	items: CartItem[];
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	clearCart: () => void;
};

export const useCart = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			addItem: (product) =>
				set((state) => {
					return {
						items: [...state.items, { product }], // rozbalíme staré itemy ve statu a přidáme jeden product
					};
				}),
			removeItem: (id) =>
				set((state) => {
					const index = state.items.findIndex((item) => item.product.id === id);
					if (index !== -1) {
						const newItems = [...state.items];
						newItems.splice(index, 1);
						return { items: newItems };
					}
					return state;
				}),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: "cart-storeage",
			storage: createJSONStorage(() => localStorage), // chceme tohle ukládat do localstorage
		}
	)
);
