import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import About from '../../components/About.jsx';
import Navbar  from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

// ✅ Correct image import for your folder structure
import groupic from '../../assets/groupic.jpg';

export default function Home() {
  const router = useRouter();
  const [hasExistingApplication, setHasExistingApplication] = useState(false);

  useEffect(() => {
    const checkExistingApplications = async () => {
      try {
        const user = await AsyncStorage.getItem('user');

        if (!user) {
          setHasExistingApplication(false);
          return;
        }

        const userObj = JSON.parse(user);

        const res = await fetch('http://10.0.2.2:5000/profile/applications', {
          method: 'GET',
          headers: { 'x-user-id': String(userObj.id) },
        });

        if (res.ok) {
          const data = await res.json();
          setHasExistingApplication(Array.isArray(data) && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking applications:', err);
      }
    };

    checkExistingApplications();
  }, []);

  const handleApplyNow = async () => {
    const user = await AsyncStorage.getItem('user');

    if (!user) {
      router.push('/login');
      return;
    }

    if (hasExistingApplication) {
      Alert.alert('Error', 'One application per account only');
      return;
    }

    router.push('/program-details');
  };

  return (

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Welcome to LCCB ETEEAP Online Application
        </Text>

        <Text style={styles.heroSubtitle}>
          Achieve Your Degree, Recognize Your Experience
        </Text>

        <Text style={styles.heroDesc}>
          Streamline your application process and submit your requirements online.
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={[
              styles.buttonPrimary,
              hasExistingApplication && styles.buttonDisabled,
            ]}
            onPress={handleApplyNow}
            disabled={hasExistingApplication}
          >
            <Text style={styles.buttonPrimaryText}>
              {hasExistingApplication ? 'Application Submitted' : 'Apply Now'}
            </Text>
          </TouchableOpacity>

          <Link href="/about" asChild>
            <TouchableOpacity style={styles.buttonSecondary}>
              <Text style={styles.buttonSecondaryText}>Learn More</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* ✅ Use the imported image */}
        <Image
          source={groupic}
          style={styles.heroImage}
        />
      </View>

      {/* ABOUT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About ETEEAP</Text>
        <Text style={styles.sectionText}>
          The ETEEAP program allows working adults to earn a degree through
          recognition of prior learning and experience.
        </Text>
      </View>

      {/* FEATURES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose ETEEAP?</Text>

        <View style={styles.feature}>
          <Ionicons name="time-outline" size={24} color="#2563eb" />
          <Text style={styles.featureText}>Fast Completion</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="people-outline" size={24} color="#2563eb" />
          <Text style={styles.featureText}>Flexible Schedule</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  hero: {
    backgroundColor: '#2563eb',
    padding: 20,
  },

  heroTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },

  heroSubtitle: {
    color: '#fff',
    marginTop: 5,
  },

  heroDesc: {
    color: '#fff',
    marginVertical: 10,
  },

  heroButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },

  buttonPrimary: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginRight: 10,
  },

  buttonPrimaryText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },

  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    borderRadius: 6,
  },

  buttonSecondaryText: {
    color: '#fff',
  },

  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },

  heroImage: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 10,
  },

  section: {
    padding: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  sectionText: {
    marginTop: 10,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  featureText: {
    marginLeft: 10,
  },
});