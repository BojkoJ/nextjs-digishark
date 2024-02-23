"use client";

import { ShoppingCart } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { ScrollArea } from "./ui/scroll-area";
import CartItem from "./CartItem";
import { useEffect, useState } from "react";

const Cart = () => {
	const { items } = useCart();

	const [isMounted, setIsMounted] = useState<boolean>(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const itemCount = items.length;
	const fee = 25;

	const cartTotal = items.reduce(
		(total, { product }) => total + product.price,
		0
	);

	return (
		<Sheet>
			<SheetTrigger className="group -m-2 flex items-center p-2">
				<ShoppingCart
					className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
					aria-hidden="true"
				/>
				<span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
					{isMounted ? itemCount : 0}
				</span>
			</SheetTrigger>
			<SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
				<SheetHeader className="space-y-2.5 pr-6">
					<SheetTitle>Košík ({itemCount})</SheetTitle>
				</SheetHeader>
				{itemCount > 0 ? (
					<>
						<div className="flex w-full flex-col pr-6">
							<ScrollArea>
								{items.map(({ product }) => (
									<CartItem product={product} key={product.id} />
								))}
							</ScrollArea>
						</div>
						<div className="space-y-4 pr-6">
							<Separator />
							<div className="space-y-1 5 text-sm">
								<div className="flex">
									<span className="flex-1">Doprava</span>
									<span>Zdarma</span>
								</div>
								<div className="flex">
									<span className="flex-1">Transakční poplatek</span>
									<span>{formatPrice(fee)}</span>
								</div>
								<div className="flex">
									<span className="flex-1">Celková cena</span>
									<span>{formatPrice(cartTotal + fee)}</span>
								</div>
							</div>

							<SheetFooter>
								<SheetTrigger asChild>
									{/*defaultně by to vytvořilo button element takže cokoliv by jsme do něj dali by bylo v tom buttonu, když dáme asChild tak se to vypne a můžeme si vytvořit svůj custom button */}
									<Link
										href="/košík"
										className={buttonVariants({
											className: "w-full",
										})}
									>
										Pokračovat k pokladně
									</Link>
								</SheetTrigger>
							</SheetFooter>
						</div>
					</>
				) : (
					<div className="flex h-full flex-col items-center justify-center space-y-1">
						<div
							className="relative mb-3 h-60 w-60 text-muted-foreground"
							aria-hidden="true"
						>
							<Image src="/cart_empty_2.png" fill alt="prádzný košík obrázek" />
						</div>
						<div className="text-xl font-semibold">Váš košík je prázdný</div>
						<SheetTrigger asChild>
							<Link
								href="/produkty"
								className={buttonVariants({
									variant: "link",
									size: "sm",
									className: "text-sm text-muted-foreground",
								})}
							>
								Přidejte si položky do košíku
							</Link>
						</SheetTrigger>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
};

export default Cart;
