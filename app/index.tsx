import { Link, Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NoteCard } from "./components/NoteCard";
import { PrimaryButton } from "./components/PrimaryButton";
import { useNotes } from "./state/notesStore";

export default function NotesListScreen() {
  const router = useRouter();
  const { state, reload } = useNotes();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.notes;
    return state.notes.filter((n) =>
      `${n.title} ${n.description}`.toLowerCase().includes(q)
    );
  }, [query, state.notes]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "NoteSnap",
        }}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Text style={styles.h1}>Twoje notatki</Text>
            <Link href="/about" style={styles.link} accessibilityRole="button">
              O aplikacji
            </Link>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Szukaj w notatkach..."
            style={styles.search}
            accessibilityLabel="Pole wyszukiwania"
          />

          <View style={styles.actions}>
            <PrimaryButton
              label="Dodaj notatkę"
              onPress={() => router.push({ pathname: "/note/form", params: { mode: "add" } })}
              accessibilityLabel="Dodaj nową notatkę"
            />
          </View>

          {state.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.muted}>Ładowanie notatek z API...</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              onRefresh={reload}
              refreshing={state.isLoading}
              renderItem={({ item }) => (
                <NoteCard
                  note={item}
                  onPress={() => router.push({ pathname: "/note/[id]", params: { id: item.id } })}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Brak notatek</Text>
                  <Text style={styles.muted}>Dodaj pierwszą notatkę przyciskiem powyżej.</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1, padding: 16, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  h1: { fontSize: 22, fontWeight: "900", color: "#111827" },
  link: { color: "#2563eb", fontWeight: "800", paddingVertical: 8, paddingHorizontal: 10, minHeight: 44 },
  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
  },
  actions: { marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: "#6b7280" },
  list: { paddingTop: 8, paddingBottom: 24 },
  empty: { padding: 18, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
});
