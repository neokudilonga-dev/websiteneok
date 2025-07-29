
"use client";

import { useLanguage } from "@/context/language-context";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const isActive = (path: string) => pathname === path;

    // This is a bit of a hack to add isActive to the children
    // A better approach might be to use a different pattern for the sidebar
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { t: t, isActive: isActive });
        }
        return child;
    });

    return <>{childrenWithProps}</>;
}
