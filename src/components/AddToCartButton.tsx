"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const AddToCartButton = () => {
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	useEffect(() => {
		const timeout = setTimeout(() => setIsSuccess(false), 2000);

		return () => clearTimeout(timeout);
	}, [isSuccess]);

	return (
		<Button
			onClick={() => {
				setIsSuccess(true);
			}}
			size="lg"
			className="w-full lg:w-1/2"
		>
			{isSuccess ? "Přidáno!" : "Přidat do košíku"}
		</Button>
	);
};

export default AddToCartButton;
