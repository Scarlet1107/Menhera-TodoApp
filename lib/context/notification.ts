"use client";

import {
    createContext,
    createElement,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Notification } from "../generated/prisma";

export interface NotificationContextValue {
    notifications: Notification[];
    setNotifications: (updater: Notification[] | ((prev: Notification[]) => Notification[])) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
    initialNotifications,
    children,
}: {
    initialNotifications: Notification[];
    children: ReactNode;
}) {
    const [notifications, setNotificationsState] = useState<Notification[]>(initialNotifications);

    // サーバーコンポーネントでとってきた値をwatchする
    // router.refresh()などで再レンダリングされたときに反映されるように
    useEffect(() => {
        setNotificationsState(initialNotifications);
    }, [initialNotifications]);

    const setNotifications = (updater: Notification[] | ((prev: Notification[]) => Notification[])) => {
        if (typeof updater === "function") {
            setNotificationsState(updater);
            return;
        }
        setNotificationsState(updater);
    };

    return createElement(
        NotificationContext.Provider,
        { value: { notifications, setNotifications } },
        children,
    );
}

export function useNotification(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification() must be used within NotificationProvider");
    return ctx;
}
