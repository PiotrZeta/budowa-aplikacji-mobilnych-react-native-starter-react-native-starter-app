import { Stack } from "expo-router";
import { NotesProvider } from "./state/notesStore";

export default function Layout() {
  return (
    <NotesProvider>
      <Stack
        screenOptions={{
          headerTitleStyle: { fontWeight: "800" },
          headerBackTitleVisible: false,
        }}
      />
    </NotesProvider>
  );
}
