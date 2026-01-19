import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { useNotes } from "../state/notesStore";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function NoteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, remove } = useNotes();

  const note = id ? getById(String(id)) : undefined;

  if (!note) {
    return (
      <>
        <Stack.Screen options={{ title: "Notatka" }} />
        <View style={styles.center}>
          <Text style={styles.title}>Nie znaleziono notatki</Text>
          <Text style={styles.muted}>Wróć do listy i spróbuj ponownie.</Text>
          <View style={{ marginTop: 12, width: "100%" }}>
            <PrimaryButton label="Wróć" onPress={() => router.replace("/")} />
          </View>
        </View>
      </>
    );
  }

  const onDelete = () => {
    Alert.alert(
      "Usunąć notatkę?",
      "Tej operacji nie da się cofnąć.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: () => {
            remove(note.id);
            router.replace("/");
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Szczegóły" }} />

      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.meta}>{formatDateTime(note.createdAt)}</Text>

        {note.photoUri ? (
          <Image source={{ uri: note.photoUri }} style={styles.image} />
        ) : null}

        <Text style={styles.desc}>{note.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dane natywne</Text>

          {note.location ? (
            <View style={styles.kv}>
              <Text style={styles.k}>GPS</Text>
              <Text style={styles.v}>
                {note.location.latitude.toFixed(5)}, {note.location.longitude.toFixed(5)}
              </Text>
            </View>
          ) : (
            <Text style={styles.muted}>Brak zapisanej lokalizacji.</Text>
          )}

          <View style={styles.kv}>
            <Text style={styles.k}>API</Text>
            <Text style={styles.v}>{note.synced === false ? "Nie wysłano (offline)" : "OK"}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Edytuj"
            onPress={() =>
              router.push({ pathname: "/note/form", params: { mode: "edit", id: note.id } })
            }
            accessibilityLabel="Edytuj notatkę"
          />
          <View style={{ height: 10 }} />
          <PrimaryButton label="Usuń" onPress={onDelete} accessibilityLabel="Usuń notatkę" />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: "900", color: "#111827" },
  meta: { marginTop: 6, color: "#6b7280" },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 16,
    backgroundColor: "#e5e7eb",
  },
  desc: { marginTop: 16, fontSize: 15, lineHeight: 22, color: "#111827" },
  section: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10, color: "#111827" },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  k: { color: "#6b7280", fontWeight: "700" },
  v: { color: "#111827", fontWeight: "800" },
  actions: { marginTop: 18 },
  center: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center", gap: 8 },
  muted: { color: "#6b7280" },
});
