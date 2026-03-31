import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>About ETEEAP</Text>
      <Text style={styles.text}>
        The Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) provides an opportunity for working adults to earn a baccalaureate degree in just 10 months through recognition of prior learning and work experience.
      </Text>
      <Text style={styles.text}>
        Deputized Higher Education Institutions, like LCC Bacolod, conduct competency-based assessments using written tests, interviews, and practical evaluations to award appropriate degrees. Programs include Business Administration, Liberal Arts, and Hospitality Management, with Saturday classes for working professionals.
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
    marginBottom: 15,
  },
});