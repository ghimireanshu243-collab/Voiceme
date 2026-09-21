// app/maintabs.tsx

import React from "react";
import { Tabs } from "expo-router";

export default function MainTabs() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#28552F",
                tabBarInactiveTintColor: "#8A8176",
                tabBarStyle: {
                    backgroundColor: "#F6E9D0",
                    borderTopColor: "#D8C7AA",
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="Homepage"
                options={{
                    title: "Home",
                    tabBarIcon: () => null,
                }}
            />

            <Tabs.Screen
                name="Suggestionpages"
                options={{
                    title: "Suggestions",
                    tabBarIcon: () => null,
                }}
            />
        </Tabs>
    );
}
