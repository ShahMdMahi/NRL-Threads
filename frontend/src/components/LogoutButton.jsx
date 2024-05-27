import { Button, useColorModeValue } from "@chakra-ui/react"
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);

    const handleLogout = async () => {
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
                // await window.location.reload();
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return (
        <Button
            position={"fixed"}
            top={"30px"}
            right={"30px"}
            size={"sm"}
            onClick={handleLogout}
            bg={useColorModeValue("gray.300", "gray.dark")}
        >
            <FiLogOut size={20} />
        </Button>
    )
}

export default LogoutButton