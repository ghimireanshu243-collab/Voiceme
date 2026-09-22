import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      initialRouteName="Splashpage"
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}