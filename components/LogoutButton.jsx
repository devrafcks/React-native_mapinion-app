
import { TouchableOpacity, Text, Alert } from 'react-native'
import { useAuthStore } from '../store/authStore.js'
import styles from '../assets/styles/profileStyles.js'
import {Ionicons} from '@expo/vector-icons'
export default function LogoutButton() {
  const { logout } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert(
      'Sair',
      'Você tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: () => logout(),
          style: 'destructive'
        }
      ],
      { cancelable: true }
    )
  }

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name='log-out-outline' size={24} color='white' />
        <Text style={styles.logoutText}>Sair</Text>
      
    </TouchableOpacity>
  )
}
