import { useState } from "react";
import useShowToast from "./useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const useFollowUnfollow = (user) => {

    const currentUser = useRecoilValue(userAtom);
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    const [updating, setUpdating] = useState(false);
    const showToast = useShowToast();    

    const handleFollowUnfollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login first", "error");
            return;
        }
        if (updating) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/users/follow/${user._id}`, {
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
                if (following) {
                    showToast("Success", `Unfollowed ${user.name}`, "success");
                    user.followers.pop(currentUser?._id);
                } else {
                    showToast("Success", `Followwed ${user.name}`, "success");
                    user.followers.push(currentUser?._id);
                }
                setFollowing(!following);
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setUpdating(false);
        }
    };

    return { handleFollowUnfollow, updating, following };
}

export default useFollowUnfollow