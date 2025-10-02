import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Título principal */}
      <Text style={styles.title}>Bienvenido a la Librería Soli</Text>

      {/* Descripción */}
      <Text style={styles.subtitle}>
        Descubre tu próxima gran lectura. Explora miles de títulos cuidadosamente
        seleccionados desde clásicos atemporales hasta las últimas novedades literarias.
      </Text>

      {/* Tarjetas de métricas */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>15,000+</Text>
          <Text style={styles.cardLabel}>Libros disponibles</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>50+</Text>
          <Text style={styles.cardLabel}>Categorías</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>2,500+</Text>
          <Text style={styles.cardLabel}>Autores</Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.catalogButton}>
          <Text style={styles.catalogText}>Explorar Catálogo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchText}>Búsqueda Avanzada</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFD7",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    color: "#3C2A1E",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 25,
    color: "#444",
    lineHeight: 22,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    elevation: 3, // sombra en Android
    shadowColor: "#000", // sombra en iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E67E22",
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  catalogButton: {
    backgroundColor: "#FFD966",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 10,
  },
  catalogText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  searchButton: {
    borderColor: "#E74C3C",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  searchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E74C3C",
  },
});
