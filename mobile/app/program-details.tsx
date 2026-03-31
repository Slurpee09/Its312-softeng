import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';

export default function ProgramDetailsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Program Details</Text>
      <Text style={styles.text}>
        Detailed information about the selected program will be displayed here.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
});