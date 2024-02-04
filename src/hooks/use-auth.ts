// custom react hook

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuth = () => {
	const router = useRouter();

	const signOut = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			//tento api endpoint poskytuje payload cms

			if (!res.ok) throw new Error();

			toast.success("Úspěšně jste se odhlásili");

			router.push("/prihlaseni");
			router.refresh();
		} catch (err) {
			toast.error("Nepodařilo se vás odhlásit, zkuste to znovu");
		}
	};

	return { signOut };
};
