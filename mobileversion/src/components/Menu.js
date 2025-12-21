import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Menu({ visible, onClose }) {
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 'history',
      icon: 'trophy',
      label: 'Game History',
      onPress: () => {
        onClose();
        navigation.navigate('History');
      },
    },
    {
      id: 'settings',
      icon: 'settings',
      label: 'Settings',
      onPress: () => {
        onClose();
        navigation.navigate('Settings');
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close menu"
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color="#007AFF"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                    style={styles.chevron}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    maxWidth: 300,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  menuItems: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    marginLeft: 8,
  },
});

