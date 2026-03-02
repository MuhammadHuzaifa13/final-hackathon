import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { recordService } from '../services';
import { COLORS, SIZES, RECORD_TYPES } from '../constants';

const MedicalRecordsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    recordType: 'prescription' // Lowercase to match backend enum
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Focus management for Web
  const screenRef = useRef(null);

  useEffect(() => {
    loadRecords();

    // Force focus on mount for Web
    if (Platform.OS === 'web' && screenRef.current) {
      const timer = setTimeout(() => {
        screenRef.current.focus?.();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await recordService.getRecords();
      const recordsData = response.records || response.data?.records || response || [];
      setRecords(recordsData);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecord.title.trim() || !newRecord.description.trim()) {
      Alert.alert('Missing Info', 'Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('--- ATTEMPTING TO CREATE RECORD ---');
      console.log('PAYLOAD:', JSON.stringify(newRecord, null, 2));

      const response = await recordService.createRecord(newRecord);

      console.log('RESPONSE:', JSON.stringify(response, null, 2));
      console.log('--- RECORD CREATED SUCCESSFULLY ---');

      setModalVisible(false);
      setNewRecord({ title: '', description: '', recordType: 'prescription' });
      loadRecords();
    } catch (error) {
      console.error('Error adding record:', error);
      if (error.response) {
        console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      Alert.alert('Error', 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRecordItem = ({ item }) => {
    const recordTypeLabel = item.recordType ?
      item.recordType.charAt(0).toUpperCase() + item.recordType.slice(1).replace('_', ' ') :
      'Medical Record';

    return (
      <Animated.View entering={FadeInUp} style={styles.recordCard}>
        <View style={[styles.recordIcon, { backgroundColor: COLORS.primaryLight }]}>
          <Icon
            name={item.recordType === 'prescription' ? 'medication' : 'description'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle} numberOfLines={1}>{item.title || item.fileName}</Text>
          <Text style={styles.recordTypeTag}>{recordTypeLabel}</Text>
          <Text style={styles.recordDescriptionSnippet} numberOfLines={1}>
            {item.description || 'No description provided'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            setSelectedRecord(item);
            setViewModalVisible(true);
          }}
        >
          <Icon name="visibility" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === 'web' && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      ]}
      ref={screenRef}
      focusable={true}
      accessible={true}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading && !records.length ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecordItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="folder-off" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No records found</Text>
              <Text style={styles.emptySubtext}>Upload your first medical record to keep it safe.</Text>
            </View>
          }
        />
      )}

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medical Record</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Record Title"
              value={newRecord.title}
              onChangeText={(text) => setNewRecord({ ...newRecord, title: text })}
              autoFocus
            />

            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Description (e.g. Dosage, Instructions)"
              value={newRecord.description}
              onChangeText={(text) => setNewRecord({ ...newRecord, description: text })}
              multiline
            />

            <Text style={styles.modalLabel}>Record Type</Text>
            <View style={styles.typeSelector}>
              {['prescription', 'lab_result', 'diagnosis', 'other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newRecord.recordType === type && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewRecord({ ...newRecord, recordType: type })}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newRecord.recordType === type && styles.selectedTypeOptionText
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateRecord}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {viewModalVisible && selectedRecord && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: 0, overflow: 'hidden' }]}>
            <LinearGradient
              colors={[COLORS.primary, '#008b83']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewModalHeaderGradient}
            >
              <View style={styles.viewModalHeaderContent}>
                <View style={styles.viewModalIconContainer}>
                  <Icon
                    name={selectedRecord.recordType === 'prescription' ? 'medication' : 'description'}
                    size={30}
                    color={COLORS.white}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.viewModalMainTitle} numberOfLines={2}>
                    {selectedRecord.title}
                  </Text>
                  <View style={styles.viewModalBadge}>
                    <Text style={styles.viewModalBadgeText}>
                      {selectedRecord.recordType?.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                  style={styles.closeIconButtonLarge}
                >
                  <Icon name="close" size={28} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.viewModalBody} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              <View style={styles.viewDetailSection}>
                <View style={styles.detailTitleRow}>
                  <Icon name="event" size={18} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Record Date</Text>
                </View>
                <Text style={styles.detailValue}>
                  {new Date(selectedRecord.uploadDate || selectedRecord.createdAt).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.viewDetailSection}>
                <View style={styles.detailTitleRow}>
                  <Icon name="subject" size={18} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Description & Instructions</Text>
                </View>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.detailDescription}>
                    {selectedRecord.description || 'No additional details provided for this record.'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.viewModalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { width: '100%' }]}
                onPress={() => setViewModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Back to Records</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SIZES.lg,
    flexGrow: 1,
    paddingBottom: 100,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recordDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recordTypeTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  recordDescriptionSnippet: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  viewButton: {
    padding: 8,
  },
  viewModalHeaderGradient: {
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  viewModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  viewModalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModalMainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  viewModalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewModalBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  closeIconButtonLarge: {
    position: 'absolute',
    top: -10,
    right: -5,
    padding: 10,
  },
  viewModalBody: {
    maxHeight: 400,
  },
  viewModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  descriptionContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewDetailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '600',
    paddingLeft: 26,
  },
  detailDescription: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    lineHeight: 24,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 15,
    fontSize: SIZES.fontMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZES.radiusMd,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedTypeOptionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default MedicalRecordsScreen;
