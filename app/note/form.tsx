import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { createNoteOnApi, updateNoteOnApi } from "../api/notesApi";
import type { NoteLocation } from "../state/notesStore";
import { useNotes } from "../state/notesStore";

type Params = {
  mode?: "add" | "edit";
  id?: string;
};

export default function NoteFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const mode = params.mode ?? "add";
  const editId = params.id ? String(params.id) : undefined;

  const { getById, upsert } = useNotes();
  const existing = useMemo(() => (editId ? getById(editId) : undefined), [editId, getById]);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [location, setLocation] = useState<NoteLocation | undefined>(existing?.location);
  const [photoUri, setPhotoUri] = useState<string | undefined>(existing?.photoUri);
  const [saving, setSaving] = useState(false);

  const screenTitle = mode === "edit" ? "Edytuj" : "Nowa notatka";

  const pickFromGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Brak uprawnień", "Nadaj dostęp do galerii w ustawieniach.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri);
      }
    } catch {
      Alert.alert("Błąd", "Nie udało się pobrać zdjęcia.");
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Brak uprawnień", "Nadaj dostęp do aparatu w ustawieniach.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri);
      }
    } catch {
      Alert.alert("Błąd", "Nie udało się zrobić zdjęcia.");
    }
  };

  const getGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Brak uprawnień", "Nadaj dostęp do lokalizacji w ustawieniach.");
        return;
      }

      // emulator bywa problematyczny – próbujemy po kolei
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        setLocation({ latitude: last.coords.latitude, longitude: last.coords.longitude });
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    } catch {
      Alert.alert(
        "GPS niedostępny",
        "Na emulatorze lokalizacja może nie działać. Na telefonie powinno być OK."
      );
    }
  };

  const validate = () => {
    if (title.trim().length < 3) return "Tytuł musi mieć min. 3 znaki.";
    if (description.trim().length < 5) return "Opis musi mieć min. 5 znaków.";
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Sprawdź formularz", err);
      return;
    }

    setSaving(true);

    const nowIso = new Date().toISOString();
    const id = mode === "edit" && existing ? existing.id : String(Date.now());

    let synced = true;
    try {
      if (mode === "edit") {
        await updateNoteOnApi({ id, title: title.trim(), description: description.trim() });
      } else {
        await createNoteOnApi({ title: title.trim(), description: description.trim() });
      }
    } catch {
      synced = false;
    }

    upsert({
      id,
      title: title.trim(),
      description: description.trim(),
      createdAt: existing?.createdAt ?? nowIso,
      location,
      photoUri,
      synced,
    });

    setSaving(false);

    if (!synced) {
      Alert.alert(
        "Zapisano lokalnie",
        "Nie udało się wysłać do API (brak internetu). Notatka ma status OFFLINE."
      );
    }

    router.replace({ pathname: "/note/[id]", params: { id } });
  };

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />

      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Tytuł</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="np. Zakupy"
          style={styles.input}
          accessibilityLabel="Tytuł notatki"
        />

        <Text style={styles.label}>Opis</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Wpisz treść notatki..."
          style={[styles.input, styles.textarea]}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Opis notatki"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Natywne funkcje</Text>

          <PrimaryButton
            label="Pobierz GPS"
            onPress={getGps}
            accessibilityLabel="Pobierz lokalizację GPS"
          />
          {location ? (
            <Text style={styles.muted}>
              📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.muted}>Brak lokalizacji</Text>
          )}

          <View style={{ height: 10 }} />
          <PrimaryButton label="Zrób zdjęcie" onPress={takePhoto} accessibilityLabel="Zrób zdjęcie" />
          <View style={{ height: 10 }} />
          <PrimaryButton
            label="Wybierz z galerii"
            onPress={pickFromGallery}
            accessibilityLabel="Wybierz zdjęcie z galerii"
          />

          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.muted}>Brak zdjęcia</Text>
          )}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={saving ? "Zapisywanie..." : "Zapisz"}
            onPress={onSave}
            disabled={saving}
            accessibilityLabel="Zapisz notatkę"
          />
          <View style={{ height: 10 }} />
          <PrimaryButton label="Anuluj" onPress={() => router.back()} accessibilityLabel="Anuluj" />
        </View>

        <Text style={styles.hint}>
          Tip: Na emulatorze GPS może nie działać. Najpewniej testować na telefonie.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, paddingBottom: 28 },
  label: { fontWeight: "900", marginTop: 10, marginBottom: 6, color: "#111827" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
  },
  textarea: { minHeight: 120 },
  section: {
    marginTop: 18,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#111827" },
  muted: { color: "#6b7280" },
  photoPreview: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    marginTop: 10,
  },
  actions: { marginTop: 18 },
  hint: { marginTop: 16, color: "#6b7280", fontSize: 12, lineHeight: 16 },
});
