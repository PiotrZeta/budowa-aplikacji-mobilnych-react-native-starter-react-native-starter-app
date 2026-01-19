import Constants from "expo-constants";
import { Link, Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <>
      <Stack.Screen options={{ title: "O aplikacji" }} />
      <View style={styles.page}>
        <Text style={styles.title}>NoteSnap</Text>
        <Text style={styles.subtitle}>Prosta aplikacja notatek z GPS + zdjęciem oraz demo komunikacji z API.</Text>

        <View style={styles.card}>
          <Text style={styles.row}><Text style={styles.k}>Wersja:</Text> {version}</Text>
          <Text style={styles.row}><Text style={styles.k}>Platforma:</Text> {Platform.OS}</Text>
          <Text style={styles.row}><Text style={styles.k}>Natywne funkcje:</Text> Lokalizacja (expo-location), Aparat/Galeria (expo-image-picker)</Text>
          <Text style={styles.row}><Text style={styles.k}>API:</Text> JSONPlaceholder (GET/POST/PATCH)</Text>
        </View>

        <Link href="/" style={styles.link} accessibilityRole="button">
          Wróć do listy
        </Link>

        <Text style={styles.hint}>
          Dostępność: przyciski i linki mają min. ~48px wysokości, a pola mają etykiety (accessibilityLabel).
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f9fafb", gap: 12 },
  title: { fontSize: 26, fontWeight: "900", color: "#111827" },
  subtitle: { color: "#374151", lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 8,
  },
  row: { color: "#111827", lineHeight: 20 },
  k: { fontWeight: "900" },
  link: { color: "#2563eb", fontWeight: "900", paddingVertical: 10, paddingHorizontal: 10, minHeight: 44 },
  hint: { marginTop: 6, color: "#6b7280", fontSize: 12, lineHeight: 16 },
});
