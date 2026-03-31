import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const programs = [
  {
    name: "Bachelor of Arts in English Language Studies",
    description: "Develop advanced proficiency in English language, critical thinking, and communication skills.",
    image: require('@/assets/english.jpg'),
  },
  {
    name: "Bachelor of Science in Business Administration - Human Resource Management",
    description: "Strategic leadership in workforce development and organizational success.",
    image: require('@/assets/bsba-hm.jpg'),
  },
  {
    name: "Bachelor of Science in Business Administration - Marketing Management",
    description: "Strategic acumen and creative skills for marketing and brand management.",
    image: require('@/assets/bsba.mm.jpg'),
  },
  {
    name: "Bachelor of Science in Hospitality Management",
    description: "Dynamic education for exceptional guest experiences in hospitality.",
    image: require('@/assets/bshm.jpg'),
  },
];

export default function ProgramsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Programs</Text>
      {programs.map((program, index) => (
        <View key={index} style={styles.programCard}>
          <Image source={program.image} style={styles.programImage} />
          <View style={styles.programContent}>
            <Text style={styles.programName}>{program.name}</Text>
            <Text style={styles.programDescription}>{program.description}</Text>
            <Link href="/program-details" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Learn More</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      ))}
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
  programCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  programImage: {
    width: '100%',
    height: 150,
  },
  programContent: {
    padding: 15,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  programDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
