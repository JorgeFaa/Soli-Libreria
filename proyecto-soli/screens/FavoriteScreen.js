import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  FlatList,
  Alert 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

export default function FavoriteScreen({ navigation }) {
  // Estado temporal de libros favoritos - en una app real vendría de Context o AsyncStorage
  const [favoriteBooks, setFavoriteBooks] = useState([
    {
      id: 1,
      name: "Cien años de soledad",
      author: "Gabriel García Márquez",
      genre: "Realismo Mágico",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      synopsis: "Una novela emblemática que narra la historia de la familia Buendía..."
    },
    {
      id: 2,
      name: "1984",
      author: "George Orwell",
      genre: "Distopía",
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
      synopsis: "Una distopía que retrata una sociedad totalitaria donde el Gran Hermano todo lo ve..."
    }
  ]);

  const removeFavorite = (bookId) => {
    Alert.alert(
      "Eliminar de Favoritos",
      "¿Estás seguro de que quieres quitar este libro de tus favoritos?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            setFavoriteBooks(favoriteBooks.filter(book => book.id !== bookId));
          }
        }
      ]
    );
  };

  const renderFavoriteBook = ({ item }) => (
    <View style={styles.bookCard}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Details', { book: item })}
        style={styles.bookContent}
      >
        <Image source={{ uri: item.cover }} style={styles.bookCover} />
        
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
          <Text style={styles.bookGenre} numberOfLines={1}>{item.genre}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => removeFavorite(item.id)}
        style={styles.removeButton}
      >
        <AntDesign name="heart" size={22} color="#FF8C42" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <AntDesign name="hearto" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No tienes favoritos</Text>
      <Text style={styles.emptySubtitle}>
        Explora la biblioteca y agrega libros a tus favoritos
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <AntDesign name="search1" size={18} color="#2E2E2E" />
        <Text style={styles.exploreButtonText}>Explorar Libros</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Espaciador de la barra de notificaciones */}
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <LinearGradient
        colors={["#FFD24C", "#FF8C42"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={26} color="#2E2E2E" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Mis Favoritos</Text>
        </View>

        {/* Contador de favoritos */}
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{favoriteBooks.length}</Text>
        </View>
      </LinearGradient>

      {/* Contenido */}
      {favoriteBooks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favoriteBooks}
          renderItem={renderFavoriteBook}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4E3", // 🎨 Arena Suave
  },
  statusBarSpacer: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: "#FFD24C",
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  counterBadge: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  counterText: {
    color: "#FFD24C",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bookCover: {
    width: 60,
    height: 80,
    resizeMode: "cover",
    borderRadius: 8,
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#FF8C42", // 🎨 Naranja Atardecer
    marginBottom: 2,
  },
  bookGenre: {
    fontSize: 13,
    color: "#D94F30", // 🎨 Rojo Terracota
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Estados vacíos
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD24C", // 🎨 Amarillo Solar
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  exploreButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
});