import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";

const useLogout = () => {

    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);

    const logout = async () => {

        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            if (data.message) {
                await localStorage.removeItem("user-threads");
                await setUser(null);
                showToast("Success", data.message, "success");
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return logout;
}

export default useLogout