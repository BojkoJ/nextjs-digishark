import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import { PRODUCT_CATEGORIES } from "@/config";

type Param = string | string[] | undefined;

interface ProductsPageProps {
	searchParams: Promise<{
		[key: string]: Param;
	}>;
}

const parse = (param: Param) => {
	return typeof param === "string" ? param : undefined;
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
	const params = await searchParams;
	const sort = parse(params.sort);
	const category = parse(params.category);

	const label = PRODUCT_CATEGORIES.find(
		({ value }) => value === category
	)?.label;

	return (
		<MaxWidthWrapper>
			<ProductReel
				title={label ?? "Procházejte kvalitní produkty"}
				query={{
					category,
					limit: 40,
					sort: sort === "desc" || sort === "asc" ? sort : undefined,
				}}
			/>
		</MaxWidthWrapper>
	);
};

export default ProductsPage;
