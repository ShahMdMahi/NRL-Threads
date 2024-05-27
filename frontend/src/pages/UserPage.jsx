import { useEffect, useState } from "react"
import UserHeader from "../components/UserHeader"
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/userGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtoms";

const UserPage = () => {

    const { loading, user } = useGetUserProfile();
    const showToast = useShowToast();
    const { username } = useParams();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [fetchingPosts, setFetchingPosts] = useState(true);

    useEffect(() => {

        const getPosts = async () => {
            try {
                if(!user) return;
                setFetchingPosts(true);
                const res = await fetch(`/api/posts/user/${username}`);

                const data = await res.json();

                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }

                setPosts(data);

            } catch (error) {
                showToast("Error", error.message, "error");
                setPosts([]);
            } finally {
                setFetchingPosts(false);
            }
        };

        getPosts();

    }, [username, showToast, setPosts, user]);
    
    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner size={"xl"} />
            </Flex>
        )
    }
    if (!user && !loading) {
        return (
            <Flex h={"50vh"} justify={"center"} align={"center"}>
                <h1>User not found</h1>
            </Flex>
        )
    }

    return (
        <>
            <UserHeader user={user} />

            {
                !fetchingPosts && posts.length === 0 && (
                    <Flex my={12} justify={"center"} >
                        <h1>User has no post</h1>
                    </Flex>
                )
            }
            {
                fetchingPosts && (
                    <Flex my={12} justify={"center"}>
                        <Spinner size={"xl"} />
                    </Flex>
                )
            }
            {
                !fetchingPosts && posts && (
                    posts.map((post) => (
                        <Post key={post._id} post={post} postedBy={post.postedBy} />
                    ))
                )
            }

        </>
    )
}

export default UserPage