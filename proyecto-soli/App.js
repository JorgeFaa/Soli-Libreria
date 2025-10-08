import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import EmailVerification from "./screens/EmailVerification";
import DetailsScreen from "./screens/DetailsScreen";
import FavoriteScreen from './screens/FavoriteScreen';
import ReaderScreen from "./screens/ReaderScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log("🚀 App iniciando, verificando estado de autenticación...");
      
      // Mostrar splash por 2 segundos mínimo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar si hay token guardado
      const token = await AsyncStorage.getItem("authToken");
      console.log("🔍 Token encontrado en App:", token ? "✅ Sí" : "❌ No");
      
      if (token && token.length > 10) {
        console.log("✅ Usuario autenticado, navegando a Home");
        setInitialRoute("Home");
      } else {
        console.log("❌ Sin autenticación, navegando a Login");
        setInitialRoute("Login");
      }
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error);
      setInitialRoute("Login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerification} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Favorites" component={FavoriteScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}