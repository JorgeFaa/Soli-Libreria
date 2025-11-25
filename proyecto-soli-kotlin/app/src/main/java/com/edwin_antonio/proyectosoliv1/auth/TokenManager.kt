package com.edwin_antonio.proyectosoliv1.auth

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TokenManager(private val context: Context) {
    
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val encryptedSharedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "auth_tokens_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _userRole = MutableStateFlow<String?>(null)
    val userRole: StateFlow<String?> = _userRole.asStateFlow()
    
    init {
        // Inicializar el estado después de que las SharedPreferences estén listas
        _isLoggedIn.value = hasValidTokens()
        _userRole.value = encryptedSharedPrefs.getString(USER_ROLE_KEY, null)
    }
    
    companion object {
        private const val ACCESS_TOKEN_KEY = "access_token"
        private const val ID_TOKEN_KEY = "id_token"
        private const val REFRESH_TOKEN_KEY = "refresh_token"
        private const val USER_ID_KEY = "user_id"
        private const val USER_EMAIL_KEY = "user_email"
        private const val USER_NAME_KEY = "user_name"
        private const val USER_ROLE_KEY = "user_role"
    }
    
    fun saveTokens(accessToken: String, idToken: String, refreshToken: String) {
        encryptedSharedPrefs.edit()
            .putString(ACCESS_TOKEN_KEY, accessToken)
            .putString(ID_TOKEN_KEY, idToken)
            .putString(REFRESH_TOKEN_KEY, refreshToken)
            .apply()
        
        _isLoggedIn.value = true
    }
    
    fun saveUserInfo(userId: String, email: String, name: String?, role: String) {
        _userRole.value = role
        encryptedSharedPrefs.edit()
            .putString(USER_ID_KEY, userId)
            .putString(USER_EMAIL_KEY, email)
            .putString(USER_NAME_KEY, name)
            .putString(USER_ROLE_KEY, role)
            .apply()
    }
    
    fun getAccessToken(): String? {
        return encryptedSharedPrefs.getString(ACCESS_TOKEN_KEY, null)
    }
    
    fun getIdToken(): String? {
        return encryptedSharedPrefs.getString(ID_TOKEN_KEY, null)
    }
    
    fun getRefreshToken(): String? {
        return encryptedSharedPrefs.getString(REFRESH_TOKEN_KEY, null)
    }
    
    fun getUserId(): String? {
        return encryptedSharedPrefs.getString(USER_ID_KEY, null)
    }
    
    fun getUserEmail(): String? {
        return encryptedSharedPrefs.getString(USER_EMAIL_KEY, null)
    }
    
    fun getUserName(): String? {
        return encryptedSharedPrefs.getString(USER_NAME_KEY, null)
    }
    
    fun getUserRole(): String? {
        return encryptedSharedPrefs.getString(USER_ROLE_KEY, null)
    }
    
    fun hasValidTokens(): Boolean {
        return getAccessToken() != null && getRefreshToken() != null
    }
    
    fun clearTokens() {
        encryptedSharedPrefs.edit()
            .remove(ACCESS_TOKEN_KEY)
            .remove(ID_TOKEN_KEY)
            .remove(REFRESH_TOKEN_KEY)
            .remove(USER_ID_KEY)
            .remove(USER_EMAIL_KEY)
            .remove(USER_NAME_KEY)
            .remove(USER_ROLE_KEY)
            .apply()
        
        _isLoggedIn.value = false
        _userRole.value = null
    }
    
    fun updateTokensAfterRefresh(accessToken: String, idToken: String, refreshToken: String) {
        saveTokens(accessToken, idToken, refreshToken)
    }
}