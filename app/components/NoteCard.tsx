import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Note } from "../state/notesStore";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

type Props = {
  note: Note;
  onPress: () => void;
};

export function NoteCard({ note, onPress }: Props) {
  const hasLocation = !!note.location;
  const hasPhoto = !!note.photoUri;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Otwórz notatkę: ${note.title}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text numberOfLines={1} style={styles.title}>
            {note.title}
          </Text>
          <Text style={styles.meta}>{formatDate(note.createdAt)}</Text>

          <View style={styles.badges}>
            {hasLocation && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>GPS</Text>
              </View>
            )}
            {hasPhoto && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>FOTO</Text>
              </View>
            )}
            {note.synced === false && (
              <View style={[styles.badge, styles.badgeWarn]}>
                <Text style={styles.badgeText}>OFFLINE</Text>
              </View>
            )}
          </View>
        </View>

        {note.photoUri ? (
          <Image source={{ uri: note.photoUri }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>{hasLocation ? "📍" : "📝"}</Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.preview}>
        {note.description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  meta: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  badgeWarn: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111827",
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  thumbPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholderText: {
    fontSize: 20,
  },
  preview: {
    marginTop: 10,
    color: "#374151",
    fontSize: 13,
    lineHeight: 18,
  },
});
