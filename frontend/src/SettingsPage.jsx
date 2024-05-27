import { Button, Text } from "@chakra-ui/react"
import useShowToast from "./hooks/useShowToast";
import { useState } from "react";
import useLogout from "./hooks/useLogout";

const SettingsPage = () => {

    const showToast = useShowToast();
    const [freezing, setFreezing] = useState(false);
    const logout = useLogout();

    const freezeAccount = async () => {
        if (freezing) return;
        if (!window.confirm("Are you sure you want to freeze your account?")) return;
        setFreezing(true);
        try {
            const res = await fetch("/api/users/freeze", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }

            if(data.message) {
                await logout();
                showToast("Success", data.message, "success");
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setFreezing(false);
        }
    };

    return (
        <>
            <Text my={1} fontWeight={"bold"} >Freeze Your Account</Text>
            <Text my={1} >You can unfreeze your account anytime by logging in.</Text>
            <Button
                size={"sm"}
                colorScheme="red"
                isLoading={freezing}
                onClick={freezeAccount}
            >
                Freeze
            </Button>
        </>
    )
}

export default SettingsPage