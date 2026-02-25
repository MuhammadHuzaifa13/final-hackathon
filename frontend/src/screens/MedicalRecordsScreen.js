import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { recordService } from '../services';
import { COLORS, RECORD_TYPES } from '../constants';

const MedicalRecordsScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [isModalVisible, setModalVisible] = useState(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    recordType: RECORD_TYPES.LAB_RESULT,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, [selectedType]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = selectedType !== 'all' ? { type: selectedType } : {};
      const response = await recordService.getRecords(params);
      setRecords(response.data.records);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    setModalVisible(true);
  };

  const handleCreateRecord = async () => {
    if (!newRecord.title || !newRecord.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await recordService.createRecord(newRecord);
      setModalVisible(false);
      setNewRecord({
        title: '',
        description: '',
        recordType: RECORD_TYPES.LAB_RESULT,
      });
      loadRecords();
      Alert.alert('Success', 'Medical record added successfully');
    } catch (error) {
      console.error('Error creating record:', error);
      Alert.alert('Error', 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPress = (record) => {
    Alert.alert(
      record.title,
      `Type: ${record.type.replace('_', ' ')}\n\n${record.description}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View details') },
      ]
    );
  };

  const getRecordTypeIcon = (type) => {
    const icons = {
      [RECORD_TYPES.LAB_RESULT]: 'science',
      [RECORD_TYPES.PRESCRIPTION]: 'medication',
      [RECORD_TYPES.DIAGNOSIS]: 'local_hospital',
      [RECORD_TYPES.IMAGING]: 'image',
      [RECORD_TYPES.VACCINATION]: 'vaccines',
      [RECORD_TYPES.OTHER]: 'description',
    };
    return icons[type] || 'description';
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      [RECORD_TYPES.LAB_RESULT]: COLORS.info,
      [RECORD_TYPES.PRESCRIPTION]: COLORS.secondary,
      [RECORD_TYPES.DIAGNOSIS]: COLORS.error,
      [RECORD_TYPES.IMAGING]: COLORS.warning,
      [RECORD_TYPES.VACCINATION]: COLORS.success,
      [RECORD_TYPES.OTHER]: COLORS.textSecondary,
    };
    return colors[type] || COLORS.textSecondary;
  };

  const renderFilterButtons = () => {
    const types = [
      { key: 'all', label: 'All' },
      { key: RECORD_TYPES.LAB_RESULT, label: 'Lab Results' },
      { key: RECORD_TYPES.PRESCRIPTION, label: 'Prescriptions' },
      { key: RECORD_TYPES.DIAGNOSIS, label: 'Diagnosis' },
      { key: RECORD_TYPES.IMAGING, label: 'Imaging' },
      { key: RECORD_TYPES.VACCINATION, label: 'Vaccinations' },
      { key: RECORD_TYPES.OTHER, label: 'Other' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {types.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterButton,
              selectedType === type.key && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === type.key && styles.filterButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderRecordCard = (record) => {
    const typeColor = getRecordTypeColor(record.recordType);
    const icon = getRecordTypeIcon(record.recordType);

    return (
      <TouchableOpacity
        key={record._id}
        style={styles.recordCard}
        onPress={() => handleRecordPress(record)}
        activeOpacity={0.7}
      >
        <View style={styles.recordHeader}>
          <View style={[styles.recordIcon, { backgroundColor: typeColor + '20' }]}>
            <Icon name={icon} size={24} color={typeColor} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle} numberOfLines={1}>
              {record.title}
            </Text>
            <Text style={styles.recordType}>
              {record.recordType.replace('_', ' ').charAt(0).toUpperCase() +
                record.recordType.slice(1)}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
        </View>

        <Text style={styles.recordDescription} numberOfLines={2}>
          {record.description}
        </Text>

        <View style={styles.recordFooter}>
          <Text style={styles.recordDate}>
            {new Date(record.createdAt).toLocaleDateString()}
          </Text>
          {record.fileName && (
            <View style={styles.fileInfo}>
              <Icon name="attach-file" size={16} color={COLORS.textSecondary} />
              <Text style={styles.fileName} numberOfLines={1}>
                {record.fileName}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="folder-open" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Medical Records</Text>
      <Text style={styles.emptyStateText}>
        You haven't added any medical records yet. Start by adding your first record.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
        <Text style={styles.addButtonText}>Add Your First Record</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading medical records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <TouchableOpacity style={styles.addButtonHeader} onPress={handleAddRecord}>
          <Icon name="add" size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {renderFilterButtons()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {records.length > 0
          ? records.map(renderRecordCard)
          : renderEmptyState()}
      </ScrollView>

      {/* Add Record Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        avoidKeyboard
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Record</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <Icon name="title" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Blood Test Report"
                value={newRecord.title}
                onChangeText={(text) => setNewRecord({ ...newRecord, title: text })}
              />
            </View>

            <Text style={styles.label}>Record Type</Text>
            <View style={styles.typeSelector}>
              {Object.values(RECORD_TYPES).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newRecord.recordType === type && styles.typeOptionActive,
                  ]}
                  onPress={() => setNewRecord({ ...newRecord, recordType: type })}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      newRecord.recordType === type && styles.typeOptionTextActive,
                    ]}
                  >
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={styles.textArea}
                placeholder="Enter details about this record..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={newRecord.description}
                onChangeText={(text) => setNewRecord({ ...newRecord, description: text })}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleCreateRecord}
              disabled={submitting}
            >
              {submitting ? (
                <Text style={styles.submitButtonText}>Adding...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Add Record</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recordType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  recordDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: COLORS.surface,
  },
  textAreaContainer: {
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    height: 100,
    color: COLORS.text,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MedicalRecordsScreen;
