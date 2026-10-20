import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    saveFeedScroll,
    updateAuthorMuteStatus,
    updateAuthorBlockStatus,
    updatePostHideStatus,
} from "@/features/feed/feedSlice";
import { unmuteUserApi, unblockUserApi } from "@/services/userService";
import { unhidePostApi } from "@/services/postService";
import PostHeader from "@/components/post/PostHeader";
import PostContent from "@/components/post/PostContent";
import QuotedPostCard from "@/components/post/QuotedPostCard";
import InteractionBar from "@/components/post/InteractionBar";
import PostNoticeCard from "@/components/post/PostNoticeCard";

export default function PostCard({
    post,
    feedType = "for_you",
    isDetail = false,
    showFollowBadge = true,
    onCommentClick,
    onQuote,
    className = "",
}) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMuted, setIsMuted] = useState(Boolean(post?.author?.isMuted));
    const [isBlocked, setIsBlocked] = useState(Boolean(post?.author?.isBlocked));
    const [isHidden, setIsHidden] = useState(Boolean(post?.isHidden));

    useEffect(() => {
        if (post?.author?.isMuted !== undefined) {
            setIsMuted(Boolean(post.author.isMuted));
        }
    }, [post?.author?.isMuted]);

    useEffect(() => {
        if (post?.author?.isBlocked !== undefined) {
            setIsBlocked(Boolean(post.author.isBlocked));
        }
    }, [post?.author?.isBlocked]);

    useEffect(() => {
        if (post?.isHidden !== undefined) {
            setIsHidden(Boolean(post.isHidden));
        }
    }, [post?.isHidden]);

    useEffect(() => {
        const handleMuteChange = (e) => {
            const detail = e?.detail;
            if (!detail) return;
            const targetUserId = post?.author?.id || post?.raw?.user?.id;
            const targetUsername = post?.author?.username;
            const matchId =
                detail.userId &&
                targetUserId &&
                String(detail.userId) === String(targetUserId);
            const matchUser =
                detail.username &&
                targetUsername &&
                detail.username === targetUsername;
            if (matchId || matchUser) {
                setIsMuted(Boolean(detail.isMuted));
            }
        };
        window.addEventListener("author-mute-changed", handleMuteChange);
        return () =>
            window.removeEventListener("author-mute-changed", handleMuteChange);
    }, [post?.author?.id, post?.author?.username, post?.raw?.user?.id]);

    useEffect(() => {
        const handleBlockChange = (e) => {
            const detail = e?.detail;
            if (!detail) return;
            const targetUserId = post?.author?.id || post?.raw?.user?.id;
            const targetUsername = post?.author?.username;
            const matchId =
                detail.userId &&
                targetUserId &&
                String(detail.userId) === String(targetUserId);
            const matchUser =
                detail.username &&
                targetUsername &&
                detail.username === targetUsername;
            if (matchId || matchUser) {
                setIsBlocked(Boolean(detail.isBlocked));
            }
        };
        window.addEventListener("author-block-changed", handleBlockChange);
        return () =>
            window.removeEventListener("author-block-changed", handleBlockChange);
    }, [post?.author?.id, post?.author?.username, post?.raw?.user?.id]);

    useEffect(() => {
        const handleHideChange = (e) => {
            const detail = e?.detail;
            if (!detail) return;
            if (detail.postId && String(detail.postId) === String(post?.id)) {
                setIsHidden(Boolean(detail.isHidden));
            }
        };
        window.addEventListener("post-hide-changed", handleHideChange);
        return () =>
            window.removeEventListener("post-hide-changed", handleHideChange);
    }, [post?.id]);

    if (!post) return null;

    const handleUndoHide = async (e) => {
        e?.stopPropagation?.();
        setIsHidden(false);
        dispatch(
            updatePostHideStatus({
                postId: post.id,
                isHidden: false,
            }),
        );
        window.dispatchEvent(
            new CustomEvent("post-hide-changed", {
                detail: {
                    postId: post.id,
                    isHidden: false,
                },
            }),
        );
        window.dispatchEvent(
            new CustomEvent("app-toast", {
                detail: { message: "Unhidden", duration: 2500 },
            }),
        );

        try {
            await unhidePostApi(post.id);
        } catch (err) {
            console.error("Unhide post failed:", err);
            setIsHidden(true);
            dispatch(
                updatePostHideStatus({
                    postId: post.id,
                    isHidden: true,
                }),
            );
            window.dispatchEvent(
                new CustomEvent("post-hide-changed", {
                    detail: {
                        postId: post.id,
                        isHidden: true,
                    },
                }),
            );
        }
    };

    const handleUndoMute = async (e) => {
        e?.stopPropagation?.();
        setIsMuted(false);
        const targetUserId = post.author?.id || post.raw?.user?.id;
        const targetUsername = post.author?.username || "user";

        dispatch(
            updateAuthorMuteStatus({
                userId: targetUserId,
                username: targetUsername,
                isMuted: false,
            }),
        );
        window.dispatchEvent(
            new CustomEvent("author-mute-changed", {
                detail: {
                    userId: targetUserId,
                    username: targetUsername,
                    isMuted: false,
                },
            }),
        );
        window.dispatchEvent(
            new CustomEvent("app-toast", {
                detail: { message: "Unmuted", duration: 2500 },
            }),
        );

        try {
            if (targetUserId) {
                await unmuteUserApi(targetUserId);
            }
        } catch (err) {
            console.error("Unmute user failed:", err);
            setIsMuted(true);
            dispatch(
                updateAuthorMuteStatus({
                    userId: targetUserId,
                    username: targetUsername,
                    isMuted: true,
                }),
            );
            window.dispatchEvent(
                new CustomEvent("author-mute-changed", {
                    detail: {
                        userId: targetUserId,
                        username: targetUsername,
                        isMuted: true,
                    },
                }),
            );
        }
    };

    const handleUndoBlock = async (e) => {
        e?.stopPropagation?.();
        setIsBlocked(false);
        const targetUserId = post.author?.id || post.raw?.user?.id;
        const targetUsername = post.author?.username || "user";

        dispatch(
            updateAuthorBlockStatus({
                userId: targetUserId,
                username: targetUsername,
                isBlocked: false,
            }),
        );
        window.dispatchEvent(
            new CustomEvent("author-block-changed", {
                detail: {
                    userId: targetUserId,
                    username: targetUsername,
                    isBlocked: false,
                },
            }),
        );
        window.dispatchEvent(
            new CustomEvent("app-toast", {
                detail: { message: "Unblocked", duration: 2500 },
            }),
        );

        try {
            if (targetUserId) {
                await unblockUserApi(targetUserId);
            }
        } catch (err) {
            console.error("Unblock user failed:", err);
            setIsBlocked(true);
            dispatch(
                updateAuthorBlockStatus({
                    userId: targetUserId,
                    username: targetUsername,
                    isBlocked: true,
                }),
            );
            window.dispatchEvent(
                new CustomEvent("author-block-changed", {
                    detail: {
                        userId: targetUserId,
                        username: targetUsername,
                        isBlocked: true,
                    },
                }),
            );
        }
    };

    if (isHidden) {
        return (
            <PostNoticeCard
                postId={post.id}
                message="This post has been hidden."
                onUndo={handleUndoHide}
                isDetail={isDetail}
                className={className}
            />
        );
    }

    if (isMuted) {
        return (
            <PostNoticeCard
                postId={post.id}
                message={`Posts from ${post.author?.username || "user"} are muted. You can manage who you mute in settings.`}
                onUndo={handleUndoMute}
                isDetail={isDetail}
                className={className}
            />
        );
    }

    if (isBlocked) {
        return (
            <PostNoticeCard
                postId={post.id}
                message={`Posts from ${post.author?.username || "user"} are blocked.`}
                onUndo={handleUndoBlock}
                isDetail={isDetail}
                className={className}
            />
        );
    }

    const handlePostClick = (e) => {
        if (isDetail) return;
        // Không chuyển trang nếu bấm vào nút tương tác, liên kết, avatar, menu, input hoặc bất kỳ modal nào
        if (
            e.target.closest("button") ||
            e.target.closest("a") ||
            e.target.closest("input") ||
            e.target.closest("textarea") ||
            e.target.closest('[role="dialog"]') ||
            e.target.closest('[role="menu"]') ||
            e.target.closest(".fixed")
        ) {
            return;
        }
        const currentScrollY =
            window.scrollY || document.documentElement.scrollTop || 0;
        dispatch(
            saveFeedScroll({
                feedType,
                scrollPosition: currentScrollY,
                lastClickedPostId: post.id,
            }),
        );
        navigate(`/@${post.author?.username || "user"}/post/${post.id}`);
    };

    return (
        <article
            id={`post-card-${post.id}`}
            data-post-id={post.id}
            onClick={handlePostClick}
            className={`py-4 px-4 sm:px-5 ${
                isDetail
                    ? "cursor-default"
                    : "border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors cursor-pointer"
            } ${className}`}
        >
            {/* 1. Header tác giả & thời gian */}
            <PostHeader
                author={post.author}
                timestamp={post.timestamp}
                tag={post.tag}
                postId={post.id}
                showFollowBadge={showFollowBadge}
                post={post}
            />

            {/* 2. Nội dung bài viết (Text + Media) */}
            <div className={isDetail ? "mt-3" : "pl-13"}>
                <PostContent
                    text={post.content}
                    media={post.media}
                    threadBadge={post.threadBadge}
                />

                {/* 2.1. Card bài viết trích dẫn (nếu có) */}
                {post.quotedPost && (
                    <div className="mt-2.5">
                        <QuotedPostCard post={post.quotedPost} />
                    </div>
                )}

                {/* 3. Thanh tương tác (Like, Comment, Repost, Share) */}
                <div className="mt-2.5">
                    <InteractionBar
                        post={post}
                        postId={post.id}
                        authorUsername={post.author?.username}
                        feedType={feedType}
                        initialLikes={post.likes}
                        initialComments={post.comments}
                        initialReposts={post.reposts}
                        initialShares={post.shares}
                        initialIsLiked={post.isLiked}
                        initialIsReposted={post.isReposted}
                        onCommentClick={onCommentClick}
                        onQuote={onQuote}
                    />
                </div>
            </div>
        </article>
    );
}
