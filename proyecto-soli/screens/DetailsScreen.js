import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DetailsScreen({ route, navigation }) {
  const { book } = route.params;
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (book && book.id) {
      fetchBookDetails();
      checkIfFavorite();
    } else {
      setError("Información del libro no disponible");
      setLoading(false);
    }
  }, [book]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const response = await fetch(
        `https://soliapi-223325065421.northamerica-south1.run.app/books/${book.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem("authToken");
          navigation.replace("Login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📖 Detalles del libro obtenidos:", data);
      setBookDetails(data);
    } catch (err) {
      console.error("❌ Error fetching book details:", err);
      setError(err.message);
      Alert.alert("Error", "No se pudieron cargar los detalles del libro");
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.some((fav) => fav.id === book.id));
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        favoritesArray = favoritesArray.filter((fav) => fav.id !== book.id);
        Alert.alert("Eliminado", "Libro eliminado de favoritos");
      } else {
        favoritesArray.push(book);
        Alert.alert("Agregado", "Libro agregado a favoritos");
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "No se pudo actualizar favoritos");
    }
  };

  const formatAuthorName = (author) => {
    const middleName = author.middleName ? ` ${author.middleName}` : '';
    return `${author.name}${middleName} ${author.lastName}`;
  };

  const handleReadBook = () => {
    if (!bookDetails || !bookDetails.textUrl) {
      Alert.alert(
        "No disponible",
        "Este libro no tiene una versión de lectura disponible.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log("📖 Navegando a lector con URL:", bookDetails.textUrl);
    navigation.navigate("Reader", { 
      uri: bookDetails.textUrl, 
      title: bookDetails.title 
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBarSpacer} />
        <LinearGradient
          colors={["#FFD24C", "#FF8C42"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={26} color="#2E2E2E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Cargando...</Text>
          <View style={{ width: 26 }} />
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Cargando detalles del libro...</Text>
        </View>
      </View>
    );
  }

  if (error || !bookDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBarSpacer} />
        <LinearGradient
          colors={["#FFD24C", "#FF8C42"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={26} color="#2E2E2E" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Error</Text>
          <View style={{ width: 26 }} />
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar los detalles</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookDetails}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerText} numberOfLines={1}>
          {bookDetails.title}
        </Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <AntDesign 
            name={isFavorite ? "heart" : "hearto"} 
            size={24} 
            color={isFavorite ? "#FF4444" : "#2E2E2E"} 
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Book Cover */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: bookDetails.coverUrl }} 
            style={styles.bookCover}
            defaultSource={require('../assets/placeholder-book.png')}
          />
        </View>

        {/* Book Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.bookTitle}>{bookDetails.title}</Text>
          
          {/* Authors */}
          {bookDetails.authors && bookDetails.authors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Autor{bookDetails.authors.length > 1 ? 'es' : ''}:</Text>
              {bookDetails.authors.map((author, index) => (
                <Text key={index} style={styles.authorText}>
                  {formatAuthorName(author)}
                </Text>
              ))}
            </View>
          )}

          {/* Genres */}
          {bookDetails.genres && bookDetails.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Género{bookDetails.genres.length > 1 ? 's' : ''}:</Text>
              <View style={styles.genresContainer}>
                {bookDetails.genres.map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Publication Date */}
          {bookDetails.publishedDate && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha de Publicación:</Text>
              <Text style={styles.infoText}>
                {new Date(bookDetails.publishedDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          )}

          {/* Description */}
          {bookDetails.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción:</Text>
              <Text style={styles.descriptionText}>{bookDetails.description}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Read Button */}
            {bookDetails.textUrl ? (
              <TouchableOpacity
                style={[styles.button, styles.readBtn]}
                onPress={handleReadBook}
              >
                <AntDesign name="book" size={18} color="#2E2E2E" />
                <Text style={styles.buttonText}>Leer Ahora</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.button, styles.readBtnDisabled]}>
                <AntDesign name="book" size={18} color="#999" />
                <Text style={[styles.buttonText, { color: "#999" }]}>No Disponible</Text>
              </View>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              style={[styles.button, styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
              onPress={toggleFavorite}
            >
              <AntDesign 
                name={isFavorite ? "heart" : "hearto"} 
                size={18} 
                color={isFavorite ? "#FF4444" : "#2E2E2E"} 
              />
              <Text style={[styles.buttonText, isFavorite && { color: "#FF4444" }]}>
                {isFavorite ? "En Favoritos" : "Agregar a Favoritos"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4E3",
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
    justifyContent: "space-between",
    elevation: 4,
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E2E2E",
    textAlign: "center",
    marginHorizontal: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#D94F30",
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  coverContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  bookCover: {
    width: 200,
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E2E2E",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C2A1E",
    marginBottom: 8,
  },
  authorText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "#FFD966",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    color: "#2E2E2E",
    fontWeight: "500",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    textAlign: "justify",
  },
  buttonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  readBtn: {
    backgroundColor: "#FFD966",
  },
  readBtnDisabled: {
    backgroundColor: "#E0E0E0",
  },
  favoriteBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FFD966",
  },
  favoriteBtnActive: {
    backgroundColor: "#FFE5E5",
    borderColor: "#FF4444",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
});