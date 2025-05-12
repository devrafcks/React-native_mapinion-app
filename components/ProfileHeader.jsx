
import { View, Text } from 'react-native'
import styles from '../assets/styles/profileStyles.js'
import { Image } from 'expo-image';
import { useAuthStore } from '../store/authStore.js'
export default function ProfileHeader() {
    const { user } = useAuthStore();

    if (!user) return null;
    return (
    <View style={styles.profileHeader}>
        <Image
            source={{ uri: user.profilePicture }}
            style={styles.profileImage}
            contentFit="cover"
        />
        <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.memberSince}>Entrou em: {user?.createdAt} </Text>
        </View>
    </View>
    )
}
