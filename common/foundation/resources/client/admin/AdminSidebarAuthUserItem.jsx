import { useAuth } from "@common/auth/use-auth";
import { UserAvatar } from "@common/auth/user-avatar";
import { NavbarAuthMenu } from "@common/ui/navigation/navbar/navbar-auth-menu";
import { KeyboardArrowUpIcon } from "@ui/icons/material/KeyboardArrowUp";

export function AdminSidebarAuthUserItem({
    isCompact,
    avatar: propsAvatar
}) {
    const {
        user
    } = useAuth();
    if (!user) return null;
    const ItemAvatar = propsAvatar || UserAvatar;
    const avatar = <ItemAvatar user={user} size="w-32 h-32" />;
    return <>
        <NavbarAuthMenu placement="top">
            {isCompact ? <button aria-label="toggle authentication menu" className="flex h-12 w-12 items-center justify-center rounded-button hover:bg-hover">
                {avatar}
            </button> : <button className="flex w-full items-center rounded-button px-12 py-8 hover:bg-hover">
                {avatar}
                <span className="ml-8 block min-w-0 overflow-x-hidden overflow-ellipsis whitespace-nowrap text-sm">
                    {user.name}
                </span>
                <KeyboardArrowUpIcon size="xs" className="ml-auto block" />
            </button>}
        </NavbarAuthMenu>
    </>

}